import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const KEYWORDS = ['function', 'return', 'if', 'else', 'for', 'while', 'from', 'to', 'new', 'in', 'not', 'null', 'true', 'false', 'and', 'or'];
const KW_RE = new RegExp(`\\b(${KEYWORDS.join('|')})\\b`, 'g');

const tokenize = (line) => {
  const parts = [];
  let last = 0;
  let m;
  KW_RE.lastIndex = 0;
  while ((m = KW_RE.exec(line)) !== null) {
    if (m.index > last) parts.push({ t: line.slice(last, m.index), kw: false });
    parts.push({ t: m[0], kw: true });
    last = m.index + m[0].length;
  }
  if (last < line.length) parts.push({ t: line.slice(last), kw: false });
  return parts;
};

const PseudocodeBlock = ({ code = '', activeLine }) => {
  const lines = (code || '').split('\n');
  const activeRef = useRef(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeLine]);

  return (
    <div className="font-mono text-xs leading-relaxed">
      {lines.map((line, idx) => {
        const lineNum = idx + 1;
        const isActive = lineNum === activeLine;

        return (
          <motion.div key={idx}
            ref={isActive ? activeRef : null}
            className="relative flex items-center px-5 py-[7px] transition-colors duration-300"
            style={{ background: isActive ? 'rgba(255,255,255,0.03)' : 'transparent' }}
            animate={isActive ? { x: [0, 3, 0] } : { x: 0 }}
            transition={{ duration: 0.2 }}>

            {isActive && (
              <motion.div layoutId="active-bar"
                className="absolute left-0 top-0 bottom-0 w-[4px]"
                style={{ 
                  background: '#f59e0b', 
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 40 }} />
            )}

            <span className="w-6 text-right pr-4 flex-shrink-0 select-none transition-colors duration-300 font-bold"
              style={{ color: isActive ? '#f59e0b' : 'rgba(255,255,255,0.1)', fontSize: 10 }}>
              {lineNum}
            </span>

            <span className="whitespace-pre flex-1 transition-colors duration-300"
              style={{ color: isActive ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.2)' }}>
              {tokenize(line).map((tok, i) =>
                tok.kw
                  ? <span key={i} className="transition-colors duration-300 font-bold uppercase tracking-widest" style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.15)' }}>{tok.t}</span>
                  : <span key={i}>{tok.t}</span>
              )}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};

export default PseudocodeBlock;
