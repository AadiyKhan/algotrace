const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '../server/data/traces');
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json'));

let brokenSlugs = [];
let patchedCount = 0;

files.forEach(f => {
  const filePath = path.join(DIR, f);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return;
  }
  
  if (!data.steps || !Array.isArray(data.steps) || data.steps.length === 0) {
    brokenSlugs.push(f.replace('.json', ''));
    return;
  }

  const type = data.type;
  let isBroken = false;
  let needsPatching = false;

  data.steps.forEach((s, idx) => {
    // 1. Structural checks
    let isValid = false;
    if (type === 'array') isValid = s.array || s.visited || s.queue || s.result;
    else if (type === 'linked-list') isValid = s.nodes || s.listNodes;
    else if (type === 'matrix') isValid = s.matrix || s.grid || s.board || s.array;
    else if (type === 'tree') isValid = s.nodes || s.tree || s.root || s.treeNodes || s.array;
    else if (type === 'graph') isValid = (s.graphNodes && s.graphEdges) || s.nodes || s.adjList || s.edges;

    if (!isValid) {
      isBroken = true;
    }

    // 2. Highlights check
    if (!isBroken) {
      const hasHighlight = s.curr !== undefined || s.active !== undefined || (s.visited && s.visited.length > 0);
      if (!hasHighlight) {
        needsPatching = true;
        // Attempt heuristic patch
        const note = s.note || "";
        
        // Find "ID x"
        const idMatch = note.match(/ID\s*(\d+)/i);
        // Find "(val x)" or "value x"
        const valMatch = note.match(/val(?:ue)?\s*(-?\d+)/i);
        // Find numbers in general
        const nums = note.match(/-?\d+/g) || [];

        if (type === 'tree' || type === 'graph' || type === 'linked-list') {
          const nodes = s.treeNodes || s.graphNodes || s.nodes || s.listNodes || [];
          if (idMatch) {
            s.curr = parseInt(idMatch[1], 10);
          } else if (valMatch) {
            const v = parseInt(valMatch[1], 10);
            const nd = nodes.find(n => n.val === v);
            if (nd) s.curr = nd.id !== undefined ? nd.id : nd.val;
            else if (nums.length > 0) s.curr = parseInt(nums[0], 10);
          } else if (nums.length > 0) {
             s.curr = parseInt(nums[0], 10);
          } else {
             // Fallback to previous step's curr
             if (idx > 0 && data.steps[idx - 1].curr !== undefined) {
               s.curr = data.steps[idx - 1].curr;
             }
          }
        } 
        else if (type === 'array') {
          if (nums.length > 0) {
            s.curr = parseInt(nums[0], 10); // Assume first number is index
          }
        }
        else if (type === 'matrix') {
          const coordMatch = note.match(/\(\s*(\d+)\s*,\s*(\d+)\s*\)/);
          if (coordMatch) {
            s.curr = [parseInt(coordMatch[1], 10), parseInt(coordMatch[2], 10)];
          } else if (nums.length >= 2) {
            s.curr = [parseInt(nums[0], 10), parseInt(nums[1], 10)];
          }
        }
      }
    }
  });

  if (isBroken) {
    brokenSlugs.push(f.replace('.json', ''));
  } else if (needsPatching) {
    // Write the patched file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    patchedCount++;
  }
});

fs.writeFileSync(path.join(__dirname, 'broken_slugs.json'), JSON.stringify(brokenSlugs, null, 2));

console.log(`Patched ${patchedCount} files heuristically.`);
console.log(`Identified ${brokenSlugs.length} fundamentally broken files that need LLM regeneration.`);
