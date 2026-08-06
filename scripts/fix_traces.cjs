require('dotenv').config({ path: require('path').join(__dirname, '../server/.env') });
const fs = require('fs');
const path = require('path');

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

const BLIND_75_SLUGS = [
  "two-sum",
  "best-time-to-buy-and-sell-stock",
  "plus-one",
  "move-zeroes",
  "best-time-to-buy-and-sell-stock-ii",
  "running-sum-of-1d-array",
  "find-pivot-index",
  "majority-element",
  "fibonacci-number",
  "squares-of-a-sorted-array",
  "pascals-triangle",
  "remove-duplicates-from-sorted-array",
  "merge-intervals",
  "3sum",
  "product-of-array-except-self",
  "insert-delete-getrandom-o1",
  "subarray-sum-equals-k",
  "next-permutation",
  "spiral-matrix",
  "container-with-most-water",
  "rotate-image",
  "word-search",
  "3sum-closest",
  "game-of-life",
  "pairs-of-songs-with-total-durations-divisible-by-60",
  "4sum",
  "find-the-duplicate-number",
  "combination-sum",
  "jump-game-ii",
  "maximum-points-you-can-obtain-from-cards",
  "maximum-area-of-a-piece-of-cake-after-horizontal-and-vertical-cuts",
  "max-area-of-island",
  "find-all-duplicates-in-an-array",
  "k-diff-pairs-in-an-array",
  "subsets",
  "invalid-transactions",
  "jump-game",
  "subarray-sums-divisible-by-k",
  "first-missing-positive",
  "largest-rectangle-in-histogram",
  "insert-delete-getrandom-o1-duplicates-allowed",
  "best-time-to-buy-and-sell-stock-iii",
  "max-value-of-equation",
  "maximum-subarray",
  "climbing-stairs",
  "divisor-game",
  "counting-bits",
  "decode-ways",
  "word-break",
  "delete-and-earn",
  "maximal-square",
  "coin-change",
  "maximum-product-subarray",
  "maximum-length-of-repeated-subarray",
  "palindromic-substrings",
  "house-robber",
  "continuous-subarray-sum",
  "knight-dialer",
  "longest-increasing-subsequence",
  "unique-paths",
  "count-square-submatrices-with-all-ones",
  "range-sum-query-2d-immutable",
  "longest-arithmetic-subsequence",
  "trapping-rain-water",
  "word-break-ii",
  "regular-expression-matching",
  "maximal-rectangle",
  "longest-valid-parentheses",
  "edit-distance",
  "minimum-difficulty-of-a-job-schedule",
  "frog-jump",
  "best-time-to-buy-and-sell-stock-iv",
  "burst-balloons",
  "minimum-cost-to-merge-stones",
  "minimum-insertion-steps-to-make-a-string-palindrome",
  "super-egg-drop",
  "count-different-palindromic-subsequences",
  "minimum-cost-to-cut-a-stick",
  "add-strings",
  "longest-common-prefix",
  "valid-palindrome-ii",
  "roman-to-integer",
  "implement-strstr",
  "longest-substring-without-repeating-characters",
  "minimum-remove-to-make-valid-parentheses",
  "longest-palindromic-substring",
  "group-anagrams",
  "generate-parentheses",
  "basic-calculator-ii",
  "integer-to-roman",
  "reverse-words-in-a-string",
  "simplify-path",
  "zigzag-conversion",
  "text-justification",
  "integer-to-english-words",
  "minimum-window-substring",
  "valid-number",
  "distinct-subsequences",
  "smallest-range-covering-elements-from-k-lists",
  "substring-with-concatenation-of-all-words",
  "reverse-integer",
  "add-binary",
  "palindrome-number",
  "minimum-moves-to-equal-array-elements",
  "happy-number",
  "excel-sheet-column-title",
  "missing-number",
  "maximum-product-of-three-numbers",
  "power-of-two",
  "encode-and-decode-tinyurl",
  "string-to-integer-atoi",
  "multiply-strings",
  "angle-between-hands-of-a-clock",
  "integer-break",
  "valid-square",
  "the-kth-factor-of-n",
  "basic-calculator",
  "max-points-on-a-line",
  "permutation-sequence",
  "number-of-digit-one",
  "task-scheduler",
  "gas-station",
  "minimum-deletion-cost-to-avoid-repeating-letters",
  "maximum-number-of-events-that-can-be-attended",
  "minimum-deletions-to-make-character-frequencies-unique",
  "remove-k-digits",
  "restore-the-array-from-adjacent-pairs",
  "non-overlapping-intervals",
  "candy",
  "minimum-number-of-taps-to-open-to-water-a-garden",
  "create-maximum-number",
  "letter-combinations-of-a-phone-number",
  "course-schedule-ii",
  "decode-string",
  "number-of-provinces",
  "clone-graph",
  "shortest-bridge",
  "all-paths-from-source-to-target",
  "surrounded-regions",
  "house-robber-iii",
  "critical-connections-in-a-network",
  "remove-invalid-parentheses",
  "longest-increasing-path-in-a-matrix",
  "concatenated-words",
  "making-a-large-island",
  "contain-virus",
  "24-game",
  "remove-boxes",
  "diameter-of-binary-tree",
  "invert-binary-tree",
  "subtree-of-another-tree",
  "range-sum-of-bst",
  "symmetric-tree",
  "convert-sorted-array-to-binary-search-tree",
  "merge-two-binary-trees",
  "maximum-depth-of-binary-tree",
  "binary-tree-paths",
  "same-tree",
  "lowest-common-ancestor-of-a-binary-search-tree",
  "path-sum",
  "minimum-absolute-difference-in-bst",
  "sum-of-left-leaves",
  "balanced-binary-tree",
  "binary-tree-inorder-traversal",
  "count-good-nodes-in-binary-tree",
  "lowest-common-ancestor-of-a-binary-tree",
  "binary-tree-right-side-view",
  "all-nodes-distance-k-in-binary-tree",
  "validate-binary-search-tree",
  "binary-tree-zigzag-level-order-traversal",
  "binary-search-tree-iterator",
  "binary-tree-level-order-traversal",
  "path-sum-iii",
  "construct-binary-tree-from-preorder-and-postorder-traversal",
  "unique-binary-search-trees",
  "recover-binary-search-tree",
  "populating-next-right-pointers-in-each-node",
  "flatten-binary-tree-to-linked-list",
  "maximum-width-of-binary-tree",
  "unique-binary-search-trees-ii",
  "kth-smallest-element-in-a-bst",
  "redundant-connection",
  "serialize-and-deserialize-binary-tree",
  "binary-tree-maximum-path-sum",
  "vertical-order-traversal-of-a-binary-tree",
  "binary-tree-cameras",
  "sum-of-distances-in-tree",
  "number-of-ways-to-reconstruct-a-tree",
  "redundant-connection-ii",
  "verifying-an-alien-dictionary",
  "design-hashmap",
  "top-k-frequent-elements",
  "design-twitter",
  "sqrtx",
  "binary-search",
  "count-negative-numbers-in-a-sorted-matrix",
  "peak-index-in-a-mountain-array",
  "time-based-key-value-store",
  "search-in-rotated-sorted-array",
  "powx-n",
  "find-first-and-last-position-of-element-in-sorted-array",
  "find-peak-element",
  "search-a-2d-matrix",
  "divide-two-integers",
  "capacity-to-ship-packages-within-d-days",
  "minimum-limit-of-balls-in-a-bag",
  "median-of-two-sorted-arrays",
  "count-of-smaller-numbers-after-self",
  "max-sum-of-rectangle-no-larger-than-k",
  "split-array-largest-sum",
  "shortest-subarray-with-sum-at-least-k",
  "number-of-islands",
  "rotting-oranges",
  "snakes-and-ladders",
  "is-graph-bipartite",
  "minimum-jumps-to-reach-home",
  "word-ladder",
  "word-ladder-ii",
  "cut-off-trees-for-golf-event",
  "reachable-nodes-in-subdivided-graph",
  "partition-labels",
  "sort-colors",
  "longest-repeating-character-replacement",
  "maximum-number-of-visible-points",
  "subarrays-with-k-different-integers",
  "min-stack",
  "next-greater-element-i",
  "backspace-string-compare",
  "implement-queue-using-stacks",
  "implement-stack-using-queues",
  "remove-all-adjacent-duplicates-in-string-ii",
  "daily-temperatures",
  "flatten-nested-list-iterator",
  "online-stock-span",
  "minimum-cost-tree-from-leaf-values",
  "sum-of-subarray-minimums",
  "evaluate-reverse-polish-notation",
  "employee-importance",
  "find-the-town-judge",
  "evaluate-division",
  "accounts-merge",
  "network-delay-time",
  "find-eventual-safe-states",
  "keys-and-rooms",
  "possible-bipartition",
  "most-stones-removed-with-same-row-or-column",
  "regions-cut-by-slashes",
  "satisfiability-of-equality-equations",
  "as-far-from-land-as-possible",
  "number-of-closed-islands",
  "number-of-operations-to-make-network-connected",
  "find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance",
  "time-needed-to-inform-all-employees",
  "delete-node-in-a-linked-list",
  "middle-of-the-linked-list",
  "convert-binary-number-in-a-linked-list-to-integer",
  "design-hashset",
  "reverse-linked-list",
  "reverse-nodes-in-k-group",
  "merge-two-sorted-lists",
  "merge-k-sorted-lists",
  "remove-duplicates-from-sorted-list",
  "linked-list-cycle",
  "linked-list-cycle-ii",
  "intersection-of-two-linked-lists",
  "palindrome-linked-list",
  "remove-linked-list-elements",
  "design-browser-history",
  "lru-cache",
  "copy-list-with-random-pointer",
  "k-closest-points-to-origin",
  "kth-largest-element-in-an-array",
  "reorganize-string",
  "furthest-building-you-can-reach",
  "kth-smallest-element-in-a-sorted-matrix",
  "cheapest-flights-within-k-stops",
  "find-the-most-competitive-subsequence",
  "ugly-number-ii",
  "sliding-window-maximum",
  "the-skyline-problem",
  "trapping-rain-water-ii",
  "minimum-number-of-refueling-stops",
  "swim-in-rising-water",
  "shortest-path-to-get-all-keys",
  "minimum-cost-to-hire-k-workers",
  "k-th-smallest-prime-fraction",
  "longest-substring-with-at-least-k-repeating-characters",
  "max-consecutive-ones-iii",
  "grumpy-bookstore-owner",
  "sliding-window-median"
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
  let res;
  let retries = 5;
  while(retries > 0) {
    try {
      res = await fetch(LC_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        body: JSON.stringify({ query, variables: { titleSlug: slug } }),
      });
      if (res.ok) break;
      if (res.status === 429 || res.status === 403) {
        console.log(`Rate limited by LC (${res.status}), sleeping for 15s...`);
        await new Promise(r => setTimeout(r, 15000));
      }
    } catch (e) {
      console.log(`Fetch error: ${e.message}, retrying in 10s...`);
      await new Promise(r => setTimeout(r, 10000));
    }
    retries--;
  }
  const json = await res.json();
  return json?.data?.question ?? null;
}

async function fixTrace(slug) {
  const outPath = path.join(__dirname, '../server/data/traces', `${slug}.json`);
  if (fs.existsSync(outPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(outPath, 'utf8'));
      if (existing.fullDescription) {
        console.log(`Skipping ${slug}, fullDescription already exists.`);
        return;
      }
    } catch (e) {}
  }
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
      parsed.fullDescription = problemData.content;
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
