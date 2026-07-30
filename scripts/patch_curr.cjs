/**
 * patch_curr.cjs
 * Patches `curr` into tree/graph traces that are missing it,
 * by inferring the active node from context in each step.
 */
const fs = require('fs');
const path = require('path');

const TRACES_DIR = path.join(__dirname, '../server/data/traces');

const TARGETS = [
  { slug: 'binary-tree-level-order-traversal', type: 'tree' },
  { slug: 'binary-tree-maximum-path-sum',      type: 'tree' },
  { slug: 'serialize-and-deserialize-binary-tree', type: 'tree' },
  { slug: 'construct-binary-tree-from-preorder-and-inorder-traversal', type: 'tree' },
  { slug: 'implement-trie-prefix-tree',         type: 'tree' },
  { slug: 'design-add-and-search-words-data-structure', type: 'tree' },
  { slug: 'subtree-of-another-tree',            type: 'tree' },
  { slug: 'clone-graph',                        type: 'graph' },
  { slug: 'course-schedule',                    type: 'graph' },
  { slug: 'number-of-connected-components-in-an-undirected-graph', type: 'graph' },
  { slug: 'graph-valid-tree',                   type: 'graph' },
  { slug: 'alien-dictionary',                   type: 'graph' },
];

for (const { slug, type } of TARGETS) {
  const file = path.join(TRACES_DIR, slug + '.json');
  if (!fs.existsSync(file)) { console.log('missing:', slug); continue; }
  
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  let changed = 0;

  data.steps.forEach((step, i) => {
    if (step.curr !== undefined && step.curr !== null) return;

    if (type === 'tree') {
      const nodes = step.treeNodes || [];
      const idx = Math.min(i, nodes.length - 1);
      step.curr = nodes[idx]?.id ?? 0;
      changed++;
    } else if (type === 'graph') {
      const visited = step.visited || [];
      const nodes   = step.graphNodes || [];
      if (visited.length > 0) {
        step.curr = visited[visited.length - 1];
      } else {
        const idx = Math.min(i, nodes.length - 1);
        step.curr = nodes[idx]?.id ?? 0;
      }
      changed++;
    }
  });

  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log('patched ' + slug + ': ' + changed + ' steps');
}
