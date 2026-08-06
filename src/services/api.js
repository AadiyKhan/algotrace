const BASE = import.meta.env.VITE_API_BASE ?? (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

// ── Fetch full trace for a problem ──────────────────────────
export const fetchProblemData = async (slug) => {
  let res;
  try {
    res = await fetch(`${BASE}/trace/${slug}?t=${Date.now()}`);
  } catch {
    const err = new Error('Network error');
    err.status = 0;
    throw err;
  }
  if (!res.ok) {
    const err = new Error('Problem not in registry');
    err.status = res.status;
    throw err;
  }
  return res.json();
};

// ── Fetch all problems list ──────────────────────────────────
export const fetchProblems = async () => {
  const res = await fetch(`${BASE}/problems`);
  if (!res.ok) throw new Error('Failed to fetch problems');
  return res.json();
};

// ── Search problems ──────────────────────────────────────────
export const searchProblems = async (q) => {
  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error('Failed to search problems');
  return res.json();
};

// ── Generate trace dynamically via LLM ──────────────────────
export const generateTraceData = async (slug, userCode = null, language = 'Auto') => {
  const res = await fetch(`${BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug, userCode, language }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to generate trace');
  }
  return res.json();
};

// ── Send chat message to AI Assistant ────────────────────────
export const sendChatMessage = async (problemContext, stepContext, history, message) => {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problemContext, stepContext, history, message }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to get chat response');
  }
  return res.json();
};
