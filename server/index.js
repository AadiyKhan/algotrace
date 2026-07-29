require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fetch = require('node-fetch');
const baseRegistry = require('./registry');
const { generateTrace } = require('./llmService');
const fs = require('fs').promises;
const path = require('path');

const registry = { ...baseRegistry };
const tracesDir = path.join(__dirname, 'data', 'traces');

// Lazy-load a trace from disk on demand
async function loadTrace(slug) {
  // Only use cached value if it's a full trace (has steps), not just a metadata stub
  if (registry[slug] && registry[slug].steps) return registry[slug];
  const filePath = path.join(tracesDir, `${slug}.json`);
  try {
    const content = await fs.readFile(filePath, 'utf8');
    registry[slug] = JSON.parse(content);
    return registry[slug];
  } catch {
    return null;
  }
}

// Pre-populate registry keys (titles/metadata only)
async function indexTraces() {
  try {
    const files = await fs.readdir(tracesDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const slug = file.replace('.json', '');
        if (!registry[slug]) {
          try {
            const data = JSON.parse(await fs.readFile(path.join(tracesDir, file), 'utf8'));
            registry[slug] = {
              title: data.title,
              difficulty: data.difficulty,
              tags: data.tags || []
            };
          } catch {
            registry[slug] = null;
          }
        }
      }
    }
  } catch { /* tracesDir may not exist */ }
}

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(null, process.env.ALLOWED_ORIGIN || 'http://localhost:5173');
    }
  }
}));
app.use(express.json());

const generateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 1 day
  max: 5,
  message: { error: 'Daily limit of 5 traces reached. Please try again tomorrow.' },
  skip: (req) => req.headers['x-api-key'] && req.headers['x-api-key'] === process.env.API_KEY,
});

/* ── LeetCode GraphQL ──────────────────────────────────────── */
const LC_API = 'https://leetcode.com/graphql';
const lcCache = new Map();

async function fetchLCProblem(slug) {
  if (lcCache.has(slug)) return lcCache.get(slug);

  const query = `
    query getProblem($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        title
        difficulty
        content
        topicTags { name }
      }
    }
  `;
  try {
    const res = await fetch(LC_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Referer': 'https://leetcode.com' },
      body: JSON.stringify({ query, variables: { titleSlug: slug } }),
    });
    const json = await res.json();
    const data = json?.data?.question ?? null;
    if (data) lcCache.set(slug, data);
    return data;
  } catch {
    return null;
  }
}

/* ── Routes ────────────────────────────────────────────────── */

// List all supported problems
app.get('/api/problems', (req, res) => {
  const list = Object.entries(registry)
    .filter(([, p]) => p !== null)
    .map(([slug, p]) => ({
      slug,
      title: p.title,
      difficulty: p.difficulty,
      tags: p.tags ?? [],
      supported: true,
    }));
  res.json(list);
});

// Get full trace for a problem
app.get('/api/trace/:slug', async (req, res) => {
  const { slug } = req.params;
  const local = await loadTrace(slug);

  if (!local) {
    return res.status(404).json({
      error: 'Problem not in registry yet.',
      message: `"${slug}" is not supported yet.`,
    });
  }

  // Try to enrich with live LC description
  let description = local.description;
  try {
    const lc = await fetchLCProblem(slug);
    if (lc?.content) {
      // Strip HTML tags from LC content
      description = lc.content.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, 600);
    }
  } catch { /* use local description */ }

  res.json({ ...local, description });
});

// Search problems
app.get('/api/search', (req, res) => {
  const q = (req.query.q ?? '').toLowerCase();
  const entries = Object.entries(registry).filter(([, p]) => p !== null);
  if (!q) return res.json(entries.map(([slug, p]) => ({ slug, ...p })));

  const results = entries
    .filter(([slug, p]) =>
      slug.includes(q) ||
      p.title.toLowerCase().includes(q) ||
      (p.tags ?? []).some(t => t.toLowerCase().includes(q))
    )
    .map(([slug, p]) => ({ slug, title: p.title, difficulty: p.difficulty, tags: p.tags ?? [] }));

  res.json(results);
});

// Generate dynamic trace via LLM
app.post('/api/generate', generateLimiter, async (req, res) => {
  const { slug, userCode, language } = req.body;
  
  if (!slug) return res.status(400).json({ error: 'Missing problem slug.' });
  if (userCode && userCode.length > 5000) return res.status(400).json({ error: 'Code exceeds maximum length of 5000 characters.' });
  
  const VALID_LANGUAGES = ['Auto', 'JavaScript', 'Python', 'Java', 'C++'];
  if (language && !VALID_LANGUAGES.includes(language)) {
    return res.status(400).json({ error: 'Invalid language specified.' });
  }

  try {
    let problemData = await fetchLCProblem(slug);
    if (!problemData) {
      problemData = {
        title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        difficulty: 'Unknown',
        content: `A standard algorithmic problem known as ${slug.replace(/-/g, ' ')}.`,
        topicTags: []
      };
    }

    const trace = await generateTrace(problemData, userCode, language);
    res.json(trace);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Failed to generate trace.' });
  }
});

// Serve static frontend files in production
app.use(express.static(path.join(__dirname, '../dist')));

// Catch-all to support React Router client-side routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`AlgoTrace server running on port ${PORT}`));
indexTraces().catch(console.error);
