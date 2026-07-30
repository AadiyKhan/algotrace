const fs = require('fs');
const path = require('path');

const BLIND_75_SLUGS = [
  "two-sum", "longest-substring-without-repeating-characters", "longest-palindromic-substring", "container-with-most-water", "3sum", 
  "remove-nth-node-from-end-of-list", "valid-parentheses", "merge-two-sorted-lists", "merge-k-sorted-lists", "search-in-rotated-sorted-array", 
  "combination-sum", "rotate-image", "group-anagrams", "maximum-subarray", "spiral-matrix", "jump-game", "merge-intervals", 
  "insert-interval", "unique-paths", "climbing-stairs", "set-matrix-zeroes", "minimum-window-substring", "word-search", 
  "decode-ways", "validate-binary-search-tree", "same-tree", "binary-tree-level-order-traversal", "maximum-depth-of-binary-tree", 
  "construct-binary-tree-from-preorder-and-inorder-traversal", "best-time-to-buy-and-sell-stock", "binary-tree-maximum-path-sum", 
  "valid-palindrome", "longest-consecutive-sequence", "clone-graph", "word-break", "linked-list-cycle", "reorder-list", 
  "maximum-product-subarray", "find-minimum-in-rotated-sorted-array", "reverse-bits", "number-of-1-bits", "house-robber", 
  "number-of-islands", "reverse-linked-list", "course-schedule", "implement-trie-prefix-tree", "design-add-and-search-words-data-structure", 
  "word-search-ii", "house-robber-ii", "contains-duplicate", "invert-binary-tree", "kth-smallest-element-in-a-bst", 
  "lowest-common-ancestor-of-a-binary-search-tree", "lowest-common-ancestor-of-a-binary-tree", "product-of-array-except-self", 
  "valid-anagram", "meeting-rooms", "meeting-rooms-ii", "graph-valid-tree", "missing-number", "alien-dictionary", 
  "encode-and-decode-strings", "find-median-from-data-stream", "longest-increasing-subsequence", "coin-change", 
  "number-of-connected-components-in-an-undirected-graph", "counting-bits", "top-k-frequent-elements", "sum-of-two-integers", 
  "pacific-atlantic-water-flow", "longest-repeating-character-replacement", "non-overlapping-intervals", 
  "serialize-and-deserialize-binary-tree", "subtree-of-another-tree", "palindromic-substrings"
];

const LC_API = 'https://leetcode.com/graphql';

async function fetchLCProblem(slug) {
  const query = `
    query getProblem($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        content
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
    return json?.data?.question ?? null;
  } catch (e) {
    console.error(`Failed to fetch ${slug}:`, e.message);
    return null;
  }
}

async function run() {
  for (const slug of BLIND_75_SLUGS) {
    const problemData = await fetchLCProblem(slug);
    if (!problemData || !problemData.content) {
      console.log(`No content found for ${slug}`);
      continue;
    }

    const filePath = path.join(__dirname, '../server/data/traces', `${slug}.json`);
    if (!fs.existsSync(filePath)) {
      console.log(`Trace not found for ${slug}`);
      continue;
    }

    let trace;
    try {
      trace = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.log(`Failed to parse trace for ${slug}`);
      continue;
    }

    // Keep the raw HTML so it renders beautifully in React
    trace.fullDescription = problemData.content;
    
    fs.writeFileSync(filePath, JSON.stringify(trace, null, 2));
    console.log(`✅ Injected full HTML description into ${slug}`);
    
    await new Promise(r => setTimeout(r, 1000)); // Small sleep to avoid LC limits
  }
}

run();
