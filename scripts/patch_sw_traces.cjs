const fs = require('fs');
const path = require('path');

function patchSWTrace(slug, getPointers, getResult) {
  const filePath = path.join(__dirname, '../server/data/traces', slug + '.json');
  if (!fs.existsSync(filePath)) return;
  const d = JSON.parse(fs.readFileSync(filePath));
  
  let left = 0;
  let right = 0;
  let result = null;

  d.steps.forEach(step => {
    const { l, r } = getPointers(step, left, right);
    if (l !== undefined) left = l;
    if (r !== undefined) right = r;
    step.left = left;
    step.right = right;
    
    const res = getResult(step, left, right, result, d.steps);
    if (res !== undefined) result = res;
    step.result = result;
  });

  fs.writeFileSync(filePath, JSON.stringify(d, null, 2));
  console.log('Patched ' + slug);
}

// 1. longest-substring-without-repeating-characters
patchSWTrace('longest-substring-without-repeating-characters', 
  (step, prevL, prevR) => {
    let l = prevL;
    let r = step.i !== undefined ? step.i : prevR;
    if (step.curr !== undefined && step.curr <= r) l = step.curr;
    return { l, r };
  },
  (step, l, r, prevRes) => {
    if (step.note && step.note.includes('Length is')) {
      const match = step.note.match(/Length is (\d+)/);
      if (match) return parseInt(match[1]);
    }
    return prevRes; // Let it track automatically based on AI? Wait, the AI notes might not say "Length is".
  }
);

// 2. minimum-window-substring
patchSWTrace('minimum-window-substring', 
  (step, prevL, prevR) => {
    let l = prevL;
    let r = step.i !== undefined ? step.i : prevR;
    if (step.curr !== undefined) l = step.curr; // In min-window, curr seems to be left
    return { l, r };
  },
  (step, l, r, prevRes, allSteps) => {
    if (step.note && step.note.toLowerCase().includes('min window')) {
      const match = step.note.match(/min window.*['"]?([A-Za-z]+)['"]?/i);
      if (match) return match[1];
    }
    return prevRes;
  }
);

// 3. longest-repeating-character-replacement
patchSWTrace('longest-repeating-character-replacement', 
  (step, prevL, prevR) => {
    let l = prevL;
    let r = step.i !== undefined ? step.i : prevR;
    if (step.curr !== undefined) l = step.curr;
    return { l, r };
  },
  (step, l, r, prevRes) => {
    return prevRes;
  }
);
