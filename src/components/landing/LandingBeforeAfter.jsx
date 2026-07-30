import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const MESSY_CODE = `function processGraph(nodes, edges) {
  let q = [];
  let v = new Set();
  q.push(nodes[0]);
  while(q.length > 0) {
    let curr = q.shift();
    if(!v.has(curr)) {
      v.add(curr);
      for(let i=0; i<edges.length; i++) {
        if(edges[i][0] === curr) {
          q.push(edges[i][1]);
        }
      }
    }
  }
  return v;
}`;

const SyntaxHighlighter = ({ code }) => {
  const highlightLine = (text) => {
    // Split the text into safe tokens keeping the delimiters
    const tokens = text.split(/(\bfunction\b|\blet\b|\bwhile\b|\bif\b|\breturn\b|\bnew\b|\bnodes\b|\bedges\b|\bcurr\b|\bq\b|\bv\b|\bi\b|[0-9]+|[\(\)\{\}\[\]])/g);
    
    return tokens.map((token, i) => {
      if (/^(function|let|while|if|return|new)$/.test(token)) return <span key={i} className="text-white/80 font-bold">{token}</span>;
      if (/^(nodes|edges|curr|q|v|i)$/.test(token)) return <span key={i} className="text-white/50">{token}</span>;
      if (/^[0-9]+$/.test(token)) return <span key={i} className="text-amber-500">{token}</span>;
      if (/^[\(\)\{\}\[\]]$/.test(token)) return <span key={i} className="text-white/30">{token}</span>;
      return token; // Normal text (including spaces)
    });
  };

  return (
    <div className="font-mono text-[14px] lg:text-[16px] text-white/50 leading-[2]">
      {code.split('\n').map((line, idx) => (
        <div key={idx} className="flex gap-4">
          <span className="text-white/20 select-none inline-block w-4 text-right">{idx + 1}</span>
          <span className="whitespace-pre">{highlightLine(line)}</span>
        </div>
      ))}
    </div>
  );
};

const LandingBeforeAfter = () => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);

  const handlePointerMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPos(percentage);
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-[500px] lg:h-[700px] bg-[#0a0a0b] relative z-10 overflow-hidden select-none touch-none cursor-ew-resize"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        handlePointerMove(e);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 1) {
          handlePointerMove(e);
        }
      }}
    >
      
      {/* ─────────────────────────────────────────────────────────
          BOTTOM LAYER: SPATIAL TRACE (AFTER)
          ───────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 w-full h-full bg-[#0a0a0b] flex items-center justify-center">
        {/* Background Grids/Glows */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="absolute top-8 right-8 px-4 py-2 bg-[#0a0a0b] text-amber-500 font-mono text-[12px] uppercase tracking-widest border-[2px] border-amber-500/30 z-10">
          AFTER: SPATIAL TRACE
        </div>

        <div className="relative w-80 h-80 scale-125 md:scale-150 z-10">
          <svg className="absolute inset-0 w-full h-full" strokeWidth="2">
            {/* Static faint background lines */}
            <line x1="50%" y1="20%" x2="20%" y2="50%" className="stroke-white/5" />
            <line x1="50%" y1="20%" x2="80%" y2="50%" className="stroke-white/5" />
            <line x1="20%" y1="50%" x2="50%" y2="80%" className="stroke-white/5" />
            <line x1="80%" y1="50%" x2="50%" y2="80%" className="stroke-white/5" />
            
            {/* Logical BFS Tracing Lines (6s loop) */}
            {/* A -> B */}
            <motion.line x1="50%" y1="20%" x2="20%" y2="50%" className="stroke-amber-500/80" strokeWidth="3"
              animate={{ pathLength: [0, 0, 1, 1, 0], opacity: [0, 0, 1, 0, 0] }}
              transition={{ duration: 6, repeat: Infinity, times: [0, 0.15, 0.35, 0.4, 1], ease: "easeInOut" }}
            />
            {/* A -> C */}
            <motion.line x1="50%" y1="20%" x2="80%" y2="50%" className="stroke-amber-500/80" strokeWidth="3"
              animate={{ pathLength: [0, 0, 1, 1, 0], opacity: [0, 0, 1, 0, 0] }}
              transition={{ duration: 6, repeat: Infinity, times: [0, 0.15, 0.35, 0.4, 1], ease: "easeInOut" }}
            />
            {/* B -> D */}
            <motion.line x1="20%" y1="50%" x2="50%" y2="80%" className="stroke-amber-500/80" strokeWidth="3"
              animate={{ pathLength: [0, 0, 1, 1, 0], opacity: [0, 0, 1, 0, 0] }}
              transition={{ duration: 6, repeat: Infinity, times: [0, 0.45, 0.65, 0.7, 1], ease: "easeInOut" }}
            />
            {/* C -> D */}
            <motion.line x1="80%" y1="50%" x2="50%" y2="80%" className="stroke-amber-500/80" strokeWidth="3"
              animate={{ pathLength: [0, 0, 1, 1, 0], opacity: [0, 0, 1, 0, 0] }}
              transition={{ duration: 6, repeat: Infinity, times: [0, 0.45, 0.65, 0.7, 1], ease: "easeInOut" }}
            />
          </svg>
          
          {/* Logical BFS Nodes (6s loop) */}
          {[
            { id: 'A', top: '20%', left: '50%', times: [0, 0.15, 0.3, 1] },
            { id: 'B', top: '50%', left: '20%', times: [0, 0.3, 0.45, 0.6, 1] },
            { id: 'C', top: '50%', left: '80%', times: [0, 0.3, 0.45, 0.6, 1] },
            { id: 'D', top: '80%', left: '50%', times: [0, 0.6, 0.75, 0.9, 1] },
          ].map((node) => (
            <motion.div
              key={node.id}
              className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0b] border-[2px] rounded-full flex items-center justify-center font-mono font-bold text-sm z-10"
              style={{ top: node.top, left: node.left }}
              animate={{
                borderColor: node.id === 'A' ? ['rgba(255,255,255,0.1)', 'rgba(245,158,11,1)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)'] : 
                             ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)', 'rgba(245,158,11,1)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)'],
                color: node.id === 'A' ? ['rgba(255,255,255,0.3)', 'rgba(245,158,11,1)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0.3)'] : 
                       ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.3)', 'rgba(245,158,11,1)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0.3)'],
                boxShadow: node.id === 'A' ? ['0 0 0px rgba(245,158,11,0)', '0 0 20px rgba(245,158,11,0.6)', '0 0 0px rgba(245,158,11,0)', '0 0 0px rgba(245,158,11,0)'] :
                           ['0 0 0px rgba(245,158,11,0)', '0 0 0px rgba(245,158,11,0)', '0 0 20px rgba(245,158,11,0.6)', '0 0 0px rgba(245,158,11,0)', '0 0 0px rgba(245,158,11,0)']
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                times: node.times,
                ease: "easeInOut"
              }}
            >
              {node.id}
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          TOP LAYER: MESSY CODE (BEFORE)
          ───────────────────────────────────────────────────────── */}
      <div 
        className="absolute inset-y-0 left-0 h-full bg-[#050505] overflow-hidden border-r-[2px] border-white/20 shadow-[20px_0_50px_rgba(0,0,0,0.8)] z-20"
        style={{ width: `${sliderPos}%` }}
      >
        {/* We use a fixed oversized width inner container so the code doesn't squish/wrap as the clipper shrinks */}
        <div className="absolute inset-y-0 left-0 w-[1200px] p-8 lg:p-16 flex flex-col justify-center">
          <div className="absolute top-8 left-8 px-4 py-2 bg-[#050505] text-white/40 font-mono text-[12px] uppercase tracking-widest border-[2px] border-white/[0.15] z-10">
            BEFORE: BLACK BOX
          </div>
          <SyntaxHighlighter code={MESSY_CODE} />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          SLIDER HANDLE (VISUAL ONLY)
          ───────────────────────────────────────────────────────── */}
      <div 
        className="absolute inset-y-0 flex items-center justify-center pointer-events-none z-30"
        style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
      >
        <div className="w-1 h-full bg-amber-500/20 absolute left-1/2 -translate-x-1/2" />
        <div className="w-16 h-12 bg-amber-500 border-[2px] border-black text-black font-black flex items-center justify-center text-[10px] tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.5)] z-10">
          DRAG
        </div>
      </div>


      
    </div>
  );
};

export default LandingBeforeAfter;
