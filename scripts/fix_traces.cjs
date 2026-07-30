require('dotenv').config({ path: require('path').join(__dirname, '../server/.env') });
const fs = require('fs');
const path = require('path');

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

const BLIND_75_SLUGS = [
  "subtree-of-another-tree", "lowest-common-ancestor-of-a-binary-search-tree"
];

const SYSTEM_PROMPT = `You are a specialized JSON generator for AlgoTrace, an algorithm visualizer.
Given a LeetCode problem description, you must trace an optimal solution step-by-step on the Exact "Example 1" provided in the description and return ONLY a valid JSON object matching this schema. Do NOT return markdown or explanation.

CRITICAL INSTRUCTIONS:
1. YOU MUST USE THE EXACT INPUT/OUTPUT FROM EXAMPLE 1. DO NOT TRUNCATE, ABBREVIATE, OR SHORTEN THE INPUT. You must use the ENTIRE input string or array exactly as it appears in Example 1.
2. Ensure you specify the correct "type" matching the core problem visualization ("array", "linked-list", "matrix", "tree", "graph").
3. For graph problems (e.g. clone-graph, course-schedule, water flow), YOU MUST USE type "graph" AND YOU MUST provide "graphNodes" AND "graphEdges" in EVERY step.
4. For tree problems (e.g. invert binary tree, same tree, lowest common ancestor), YOU MUST USE type "tree" AND YOU MUST provide "nodes" or "treeNodes" array in EVERY step.
5. For array problems (e.g. 3sum, intervals, topological sort queues), YOU MUST USE type "array" AND YOU MUST provide "array", "visited", "queue", or "result" in EVERY step.
6. For matrix problems (e.g. pacific atlantic), YOU MUST USE type "matrix" AND YOU MUST provide "matrix", "grid", or "board" in EVERY step.

Schema:
{
  "title": "String",
  "difficulty": "Easy|Medium|Hard",
  "type": "array|linked-list|matrix|tree|graph",
  "tags": ["Array", "String", "Tree"],
  "description": "String (Short summary)",
  "target": "Any optional target value",
  "pseudocode": "String (Pseudocode)",
  "steps": [
    {
      "codeLine": Number (Line number in pseudocode executing right now, 1-indexed),
      "note": "String (Short explanation)",
      "array": [Array elements if type is array],
      "nodes": [{val: 1, next: 1}] (if type is linked-list),
      "matrix": [[1, 2], [3, 4]] (if type is matrix),
      "treeNodes": [{id: 0, val: 1, left: 1, right: 2}] (if type is tree, array of node objects where left/right are IDs, null if empty),
      "graphNodes": [{id: 0, val: "A"}] (if type is graph),
      "graphEdges": [[0, 1]] (if type is graph, array of [fromId, toId] pairs),
      "i": "Value of loop var i (optional)",
      "j": "Value of loop var j (optional)",
      "curr": "Index, coordinate, or node ID of the currently active node (REQUIRED for tree/graph/linked-list problems to show the glow)",
      "prev": "Index, coordinate, or node ID of previously active node (optional)",
      "visited": [Array of visited indices, coordinates, or node IDs]
    }
  ]
}`;

const LC_API = 'https://leetcode.com/graphql';

async function fetchLCProblem(slug) {
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
  const res = await fetch(LC_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Referer': 'https://leetcode.com' },
    body: JSON.stringify({ query, variables: { titleSlug: slug } }),
  });
  const json = await res.json();
  return json?.data?.question ?? null;
}

async function fixTrace(slug) {
  console.log(`\nFixing: ${slug}`);
  let problemData;
  try {
    problemData = await fetchLCProblem(slug);
  } catch (e) {
    console.error(`Failed to fetch LC data for ${slug} due to network error: ${e.message}`);
    return;
  }
  if (!problemData) {
    console.error(`Failed to fetch LC data for ${slug}`);
    return;
  }

  const tags = (problemData.topicTags || []).map(t => t.name).join(', ');
  const description = problemData.content ? problemData.content.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').substring(0, 1500) : "No description provided.";

  const prompt = `Problem: ${problemData.title}\nDifficulty: ${problemData.difficulty}\nTags: ${tags}\nDescription: ${description}\n\nCRITICAL: Trace an optimal solution step-by-step strictly on Example 1 from the description. Ensure the JSON strictly meets the schema requirements for its type.`;

  const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

  let attempt = 0;
  while (attempt < 3) {
    attempt++;
    try {
      console.log(`Attempt ${attempt}...`);
      const result = await model.generateContent([{ text: SYSTEM_PROMPT }, { text: prompt }]);
      let text = result.response.text().trim();
      text = text.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '').trim();
      
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.steps) || parsed.steps.length === 0) {
        throw new Error('Missing "steps" array schema.');
      }
      
      // Basic validation
      const type = parsed.type;
      let hasError = false;
      parsed.steps.forEach((step, idx) => {
        let isValid = false;
        if (type === 'array') isValid = step.array || step.visited || step.queue || step.result;
        else if (type === 'linked-list') isValid = step.nodes;
        else if (type === 'matrix') isValid = step.matrix || step.grid || step.board || step.array;
        else if (type === 'tree') isValid = step.nodes || step.tree || step.root || step.treeNodes || step.array;
        else if (type === 'graph') isValid = (step.graphNodes && step.graphEdges) || step.nodes || step.adjList || step.edges;
        if (!isValid) {
          hasError = true;
        }
      });
      
      if (hasError) {
        throw new Error(`Missing required structural properties for type ${type} in one or more steps.`);
      }

      // Preserve fullDescription if it exists
      const outPath = path.join(__dirname, '../server/data/traces', `${slug}.json`);
      if (fs.existsSync(outPath)) {
        try {
          const existing = JSON.parse(fs.readFileSync(outPath, 'utf8'));
          if (existing.fullDescription) {
            parsed.fullDescription = existing.fullDescription;
          }
        } catch (e) {}
      }

      // Save the trace
      fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2));
      console.log(`✅ Successfully fixed ${slug}`);
      return;
    } catch (e) {
      console.error(`❌ Attempt ${attempt} failed: ${e.message}`);
    }
  }
  console.error(`Failed to fix ${slug} after 3 attempts.`);
}

async function run() {
  for (const slug of BLIND_75_SLUGS) {
    await fixTrace(slug);
    await new Promise(r => setTimeout(r, 4100)); // Sleep to avoid rate limits
  }
}

run();
