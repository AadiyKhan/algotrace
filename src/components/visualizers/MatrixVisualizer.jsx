import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useChatStore from '../../store/useChatStore';

const MatrixVisualizer = ({ stepData, problemId }) => {
  const { askQuestion } = useChatStore();
  const { matrix, curr, prev, visited } = stepData;

  if (!matrix || !Array.isArray(matrix)) {
    return (
      <div className="flex items-center justify-center h-40 w-full border-[2px] border-white/20 font-mono text-[11px] font-bold tracking-widest uppercase bg-[#050505]" style={{ color: 'rgba(255,255,255,0.2)' }}>
        [ EMPTY_MATRIX ]
      </div>
    );
  }

  const parseCoord = (coord) => {
    if (Array.isArray(coord) && coord.length === 2) return `${coord[0]},${coord[1]}`;
    return null;
  };

  const currCoord = parseCoord(curr);
  const prevCoord = parseCoord(prev);
  
  // Create a map of visited coordinates for fast lookup and sequence indexing
  const visitedMap = new Map();
  if (Array.isArray(visited)) {
    visited.forEach((v, idx) => {
      const c = parseCoord(v);
      if (c && !visitedMap.has(c)) visitedMap.set(c, idx);
    });
  }
  
  const isSpiral = problemId && problemId.includes('spiral');

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-2">
        <span className="font-mono font-bold tracking-widest text-[11px] uppercase text-white/50">2D_MATRIX</span>
        <div className="flex-1 h-[2px] bg-white/10" />
      </div>
        
      <div className="flex flex-col gap-1 items-center border-[2px] border-white/20 bg-[#050505] p-12 overflow-x-auto rounded-lg shadow-inner">
        <AnimatePresence mode="popLayout">
          {matrix.map((row, rIdx) => (
            <motion.div 
              key={rIdx} 
              layout 
              className="flex gap-1 relative"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 350, damping: 25, delay: rIdx * 0.05 }}
            >
              {/* Row index indicator */}
              <div className="absolute -left-8 w-6 h-full flex items-center justify-end font-mono text-[10px] font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {rIdx}
              </div>
                
              {row.map((val, cIdx) => {
                const coord = `${rIdx},${cIdx}`;
                const isCurr = currCoord === coord;
                const isPrev = prevCoord === coord;
                const visitedIndex = visitedMap.get(coord);
                const isVisited = visitedIndex !== undefined;

                let bg = '#050505', borderStyle = '2px solid rgba(255,255,255,0.15)', color = 'rgba(255,255,255,0.4)';

                if (isCurr) {
                  bg = 'rgba(245,158,11,0.15)';
                  borderStyle = '2px solid #f59e0b';
                  color = '#fff';
                } else if (isPrev) {
                  bg = 'rgba(255,255,255,0.05)';
                  borderStyle = '2px solid rgba(255,255,255,0.8)';
                  color = '#fff';
                } else if (isVisited) {
                  bg = 'rgba(245,158,11,0.05)';
                  borderStyle = '2px solid rgba(245,158,11,0.4)';
                  color = 'rgba(255,255,255,0.7)';
                }

                return (
                  <motion.div
                    key={cIdx}
                    layout
                    onClick={() => askQuestion(`Explain what the cell at row ${rIdx} column ${cIdx} with value '${val}' represents right now.`)}
                    className="w-12 h-12 sm:w-14 sm:h-14 flex flex-col items-center justify-center font-mono font-bold text-sm sm:text-base relative cursor-pointer hover:border-amber-500 transition-colors"
                    style={{
                      background: bg,
                      border: borderStyle,
                      color: color,
                      boxShadow: isCurr ? '0 0 20px rgba(245,158,11,0.4)' : 'none',
                    }}
                    animate={isCurr ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    {val}
                    
                    {/* Small column index indicator on the first row */}
                    {rIdx === 0 && (
                      <span className="absolute -top-6 font-mono text-[10px] font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {cIdx}
                      </span>
                    )}

                    {/* Spiral order indicator */}
                    {isSpiral && isVisited && (
                      <span className="absolute top-0.5 right-1 text-[9px] text-amber-500 font-bold opacity-80">
                        {visitedIndex + 1}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Results Section for Word Search */}
      {stepData.results && Array.isArray(stepData.results) && (
        <div className="flex flex-col gap-4 mt-4 w-full border-t-[2px] border-white/10 pt-8">
          <div className="flex items-center gap-4">
            <span className="font-mono font-bold tracking-widest text-[11px] uppercase text-white/50">FOUND_WORDS</span>
            <div className="flex-1 h-[2px] bg-white/10" />
          </div>
          <div className="flex flex-wrap gap-4">
            {stepData.results.length === 0 ? (
              <span className="font-mono text-[12px] text-white/30 uppercase tracking-widest">[ NONE YET ]</span>
            ) : (
              stepData.results.map((word, idx) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={idx} 
                  className="px-4 py-2 border-[2px] border-amber-500 bg-amber-500/10 text-amber-500 font-mono font-bold text-sm tracking-widest uppercase"
                >
                  {word}
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Traversal Order for Spiral Matrix */}
      {isSpiral && Array.isArray(visited) && visited.length > 0 && (
        <div className="flex flex-col gap-4 mt-4 w-full border-t-[2px] border-white/10 pt-8">
          <div className="flex items-center gap-4">
            <span className="font-mono font-bold tracking-widest text-[11px] uppercase text-white/50">SPIRAL_ORDER</span>
            <div className="flex-1 h-[2px] bg-white/10" />
          </div>
          <div className="flex flex-wrap gap-2">
            {visited.map((v, idx) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                key={idx} 
                className="w-8 h-8 flex items-center justify-center border-[2px] border-amber-500/50 bg-amber-500/10 text-amber-500 font-mono font-bold text-xs"
              >
                {matrix[v[0]]?.[v[1]]}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="grid grid-cols-3 gap-6 border-t-[2px] border-white/10 pt-8 mt-4 w-full">
        {[
          { label: 'CURRENT', desc: 'ACTIVE CELL',    border: '2px solid #f59e0b',              color: '#f59e0b' },
          { label: 'PREV',    desc: 'PREVIOUSLY ACTIVE',    border: '2px solid rgba(255,255,255,0.8)', color: '#ffffff' },
          { label: 'VISITED', desc: 'MARKED AS VISITED',   border: '2px solid rgba(245,158,11,0.4)',  color: 'rgba(245,158,11,0.8)' },
        ].map(({ label, desc, border, color }) => (
          <div key={label} className="p-6 bg-[#050505] border-[2px] border-white/20">
            <div className="flex items-center gap-4 mb-2">
              <div style={{ width: 14, height: 14, background: 'transparent', border, flexShrink: 0 }} />
              <span className="font-mono font-bold tracking-widest text-[11px] uppercase" style={{ color }}>{label}</span>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatrixVisualizer;
