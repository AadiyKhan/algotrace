const fs = require('fs');
const path = require('path');

const RESULTS_JSX = `
      {/* Results Section */}
      {(stepData.results || stepData.result) && Array.isArray(stepData.results || stepData.result) && (
        <div className="flex flex-col gap-4 mt-4 w-full border-t-[2px] border-white/10 pt-8">
          <div className="flex items-center gap-4">
            <span className="font-mono font-bold tracking-widest text-[11px] uppercase text-white/50">FOUND_RESULTS</span>
            <div className="flex-1 h-[2px] bg-white/10" />
          </div>
          <div className="flex flex-wrap gap-4">
            {(stepData.results || stepData.result).length === 0 ? (
              <span className="font-mono text-[12px] text-white/30 uppercase tracking-widest">[ NONE YET ]</span>
            ) : (
              (stepData.results || stepData.result).map((item, idx) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={idx} 
                  className="px-4 py-2 border-[2px] border-amber-500 bg-amber-500/10 text-amber-500 font-mono font-bold text-sm tracking-widest uppercase"
                >
                  {typeof item === 'object' ? JSON.stringify(item) : item}
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}
`;

const dir = 'c:/projects/algotrace/src/components/visualizers/';

const applyTo = (file, searchStr) => {
  const fp = path.join(dir, file);
  let content = fs.readFileSync(fp, 'utf8');
  if (!content.includes('FOUND_RESULTS')) {
    content = content.replace(searchStr, RESULTS_JSX + '\n' + searchStr);
    fs.writeFileSync(fp, content);
    console.log('Patched ' + file);
  } else {
    console.log('Already patched ' + file);
  }
};

applyTo('GraphVisualizer.jsx', '      {/* Legend */}');
applyTo('TreeVisualizer.jsx', '      {/* Legend */}');
applyTo('LinkedListVisualizer.jsx', '      {/* Legend + variable inspector */}');

// ArrayVisualizer is a bit tricky, let's insert it right before the closing div of GenericArrayViz
// Look for closing div of GenericArrayViz
const arrayFp = path.join(dir, 'ArrayVisualizer.jsx');
let arrayContent = fs.readFileSync(arrayFp, 'utf8');
if (!arrayContent.includes('FOUND_RESULTS')) {
  // Let's insert it before the closing div of GenericArrayViz
  const searchStr = `
          {/* Main array layout block */}
`;
  // Actually wait, let's just insert it at the very bottom of the flex container for GenericArrayViz
  const patchStr = `
        {/* End Main */}
      </div>`;
  // Let's find GenericArrayViz definition.
  const regex = /(const GenericArrayViz = \(\{ stepData \}\) => \{[\s\S]*?)(    <\/div>\s*  \);\s*\};)/;
  arrayContent = arrayContent.replace(regex, (match, p1, p2) => {
      return p1 + RESULTS_JSX + '\n' + p2;
  });
  fs.writeFileSync(arrayFp, arrayContent);
  console.log('Patched ArrayVisualizer.jsx');
}

