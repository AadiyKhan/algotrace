import React from 'react';
import { motion } from 'framer-motion';

const MatrixVisualizer = ({ stepData }) => {
  const { matrix, curr, prev, visited } = stepData;

  // Fallback if matrix data is missing or malformed
  if (!matrix || !Array.isArray(matrix)) {
    return (
      <div className="flex items-center justify-center h-32 w-full border border-borderDark font-mono text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
        No matrix data provided for this step.
      </div>
    );
  }

  const parseCoord = (coord) => {
    if (Array.isArray(coord) && coord.length === 2) return `${coord[0]},${coord[1]}`;
    return null;
  };

  const currCoord = parseCoord(curr);
  const prevCoord = parseCoord(prev);
  
  // Create a set of visited coordinates for fast lookup
  const visitedSet = new Set();
  if (Array.isArray(visited)) {
    visited.forEach(v => {
      const c = parseCoord(v);
      if (c) visitedSet.add(c);
    });
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
      <div>
        <p className="label mb-6 text-center">2D MATRIX</p>
        
        <div className="flex flex-col gap-1 items-center">
          {matrix.map((row, rIdx) => (
            <div key={rIdx} className="flex gap-1">
              {/* Row index indicator */}
              <div className="w-8 flex items-center justify-end pr-2 font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {rIdx}
              </div>
              
              {row.map((val, cIdx) => {
                const coord = `${rIdx},${cIdx}`;
                const isCurr = currCoord === coord;
                const isPrev = prevCoord === coord;
                const isVisited = visitedSet.has(coord);

                let bg = '#110000', borderStyle = '1px solid #2a0000', color = '#6b5555';

                if (isCurr) {
                  bg = 'rgba(255,0,0,0.15)';
                  borderStyle = '2px solid #ff0000';
                  color = '#fff';
                } else if (isPrev) {
                  bg = 'rgba(255,255,255,0.08)';
                  borderStyle = '2px dashed rgba(255,255,255,0.45)';
                  color = '#fff';
                } else if (isVisited) {
                  bg = 'rgba(255,0,0,0.04)';
                  borderStyle = '2px dotted rgba(255,0,0,0.35)';
                  color = 'rgba(255,255,255,0.6)';
                }

                return (
                  <motion.div
                    key={cIdx}
                    layout
                    className="w-12 h-12 sm:w-14 sm:h-14 flex flex-col items-center justify-center font-mono font-bold text-sm sm:text-base relative"
                    style={{
                      background: bg,
                      border: borderStyle,
                      color: color,
                      boxShadow: isCurr ? '0 0 16px rgba(255,0,0,0.3)' : 'none',
                    }}
                    animate={isCurr ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {val}
                    
                    {/* Small column index indicator on the first row */}
                    {rIdx === 0 && (
                      <span className="absolute -top-5 font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        {cIdx}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-3 border-t border-borderDark pt-6">
        {[
          { label: 'CURRENT', desc: 'Active cell [row, col]',    border: '2px solid #ff0000',              color: '#ff0000' },
          { label: 'PREV',    desc: 'Previously active cell',    border: '2px dashed rgba(255,255,255,0.5)', color: 'rgba(255,255,255,0.7)' },
          { label: 'VISITED', desc: 'Cells marked as visited',   border: '2px dotted rgba(255,0,0,0.4)',    color: 'rgba(255,0,0,0.6)' },
        ].map(({ label, desc, border, color }) => (
          <div key={label} className="p-3" style={{ background: '#110000', border: '1px solid #2a0000' }}>
            <div className="flex items-center gap-2 mb-1">
              <div style={{ width: 12, height: 12, background: 'transparent', border, flexShrink: 0 }} />
              <span className="font-mono font-bold text-[10px]" style={{ color }}>{label}</span>
            </div>
            <p className="text-[10px] leading-relaxed" style={{ color: '#6b5555' }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatrixVisualizer;
