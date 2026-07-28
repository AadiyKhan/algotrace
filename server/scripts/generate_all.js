const fs = require('fs');
const path = require('path');
// Require dotenv FIRST to load GEMINI_API_KEY before initializing genAI
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { generateTrace } = require('../llmService');

const OUTPUT_DIR = path.join(__dirname, '../data/traces');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchAllLeetcodeSlugs() {
  console.log("Fetching all problem slugs from LeetCode...");
  try {
    const res = await fetch('https://leetcode.com/api/problems/algorithms/');
    const data = await res.json();
    
    // Extract the slugs from the response
    const slugs = data.stat_status_pairs.map(pair => pair.stat.question__title_slug);
    
    // Reversing so that the most popular/earliest problems (like Two Sum) are generated first
    return slugs.reverse(); 
  } catch (err) {
    console.error("Failed to fetch slugs from LeetCode:", err);
    return [];
  }
}

async function main() {
  const leetcodeSlugs = await fetchAllLeetcodeSlugs();
  
  if (leetcodeSlugs.length === 0) {
    console.log("No slugs found. Exiting.");
    return;
  }

  console.log(`Starting generation for ${leetcodeSlugs.length} problems...`);

  for (let i = 0; i < leetcodeSlugs.length; i++) {
    const slug = leetcodeSlugs[i];
    const outputFile = path.join(OUTPUT_DIR, `${slug}.json`);

    // Skip if we already generated it (allows script to resume if it crashes)
    if (fs.existsSync(outputFile)) {
      console.log(`[${i + 1}/${leetcodeSlugs.length}] Skipping ${slug} (already exists)`);
      continue;
    }

    console.log(`[${i + 1}/${leetcodeSlugs.length}] Generating trace for: ${slug}...`);

    // Create a fallback problemData for the LLM
    const problemData = {
      title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      difficulty: 'Unknown',
      content: `A standard algorithmic problem known as ${slug.replace(/-/g, ' ')}.`,
      topicTags: []
    };

    let retries = 0;
    let success = false;
      while (retries < 5 && !success) {
        try {
          const trace = await generateTrace(problemData);
          
          // Save it to disk
          fs.writeFileSync(outputFile, JSON.stringify(trace, null, 2));
          console.log(`   ✅ Success! Saved to ${outputFile}`);
          success = true;
        } catch (err) {
          retries++;
          const waitTime = Math.pow(2, retries) * 5000; // 10s, 20s, 40s, 80s, 160s
          console.error(`   ❌ Failed to generate ${slug} (Attempt ${retries}):`, err.message);
          if (retries < 5) {
            console.log(`   ⏳ Backing off for ${waitTime/1000}s before retrying...`);
            await delay(waitTime);
          } else {
            console.error(`   ❌ Giving up on ${slug}. Moving to next.`);
          }
        }
      }

    // Crucial: Wait 5 seconds between requests to stay just under the 15 Requests Per Minute limit!
    if (i < leetcodeSlugs.length - 1) {
      console.log(`   Waiting 5 seconds before next request...`);
      await delay(5000);
    }
  }

  console.log("All done!");
}

main();
