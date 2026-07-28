import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NODE_W = 56;
const NODE_H = 56;

/* Pointer styles — solid/dashed/dotted for colorblind support */
const PTR_STYLE = {
  curr: { bg: 'rgba(255,0,0,0.15)', border: '2px solid #ff0000',              color: '#fff',                   shadow: '0 0 16px rgba(255,0,0,0.35)', labelColor: '#ff0000',              labelBg: 'rgba(255,0,0,0.1)',        labelBorder: 'rgba(255,0,0,0.4)' },
  prev: { bg: 'rgba(255,255,255,0.08)', border: '2px dashed rgba(255,255,255,0.45)', color: '#fff',             shadow: 'none',                        labelColor: 'rgba(255,255,255,0.7)', labelBg: 'rgba(255,255,255,0.05)',   labelBorder: 'rgba(255,255,255,0.2)' },
  next: { bg: 'rgba(255,80,0,0.1)',  border: '2px dotted rgba(255,120,0,0.6)', color: '#ffb366',               shadow: 'none',                        labelColor: '#ff8c00',              labelBg: 'rgba(255,100,0,0.08)',     labelBorder: 'rgba(255,100,0,0.3)' },
  def:  { bg: '#110000',             border: '1px solid #2a0000',              color: '#6b5555',               shadow: 'none',                        labelColor: '',                     labelBg: '',                        labelBorder: '' },
};

const PointerLabel = ({ text, style }) => (
  <motion.div
    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    className="font-mono font-bold text-[10px] px-2 py-0.5 border tracking-wider"
    style={{ color: style.labelColor, background: style.labelBg, borderColor: style.labelBorder }}>
    {text}
  </motion.div>
);

const LinkedListVisualizer = ({ stepData }) => {
  const { nodes, curr, prev, nextPtr } = stepData;

  const getStyle = (idx) => {
    if (curr === idx) return PTR_STYLE.curr;
    if (prev === idx) return PTR_STYLE.prev;
    if (nextPtr === idx) return PTR_STYLE.next;
    return PTR_STYLE.def;
  };

  return (
    <div className="flex flex-col gap-10 w-full max-w-3xl mx-auto">

      {/* Node row */}
      <div>
        <p className="label mb-8 text-center">LINKED LIST</p>

        <div className="flex items-center justify-center gap-0 flex-wrap">
          {nodes.map((node, idx) => {
            const s = getStyle(idx);
            const isCurr = curr === idx;
            const isPrev = prev === idx;
            const isNext = nextPtr === idx;

            // Determine where this node's .next pointer points
            const pointsTo = node.next; // index or null

            return (
              <React.Fragment key={idx}>
                <motion.div layout className="flex flex-col items-center">

                  {/* Pointer label above */}
                  <div className="h-8 flex items-end justify-center gap-1 mb-1">
                    <AnimatePresence>
                      {isPrev && <PointerLabel key="prev" text="prev" style={PTR_STYLE.prev} />}
                      {isCurr && <PointerLabel key="curr" text="curr" style={PTR_STYLE.curr} />}
                      {isNext && <PointerLabel key="next" text="next" style={PTR_STYLE.next} />}
                    </AnimatePresence>
                  </div>

                  {/* Node: [val | →] */}
                  <motion.div
                    layout
                    className="flex items-stretch"
                    style={{ border: s.border, boxShadow: s.shadow }}
                    animate={isCurr ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                    transition={{ duration: 0.25 }}>

                    {/* Value cell */}
                    <div className="flex items-center justify-center font-mono font-bold text-base"
                      style={{ width: NODE_W, height: NODE_H, background: s.bg, color: s.color }}>
                      {node.val}
                    </div>

                    {/* Pointer cell */}
                    <div className="flex items-center justify-center font-mono text-xs"
                      style={{
                        width: 28, height: NODE_H,
                        background: 'rgba(255,255,255,0.02)',
                        borderLeft: s.border,
                        color: pointsTo !== null ? s.color : 'rgba(255,255,255,0.15)',
                      }}>
                      {pointsTo !== null ? '→' : '∅'}
                    </div>
                  </motion.div>

                  {/* Node index */}
                  <span className="font-mono text-[9px] mt-1.5" style={{ color: 'rgba(255,255,255,0.15)' }}>
                    node[{idx}]
                  </span>
                </motion.div>

                {/* Arrow between nodes */}
                {idx < nodes.length - 1 && (
                  <motion.div layout className="flex items-center self-center mb-5 mx-1">
                    <ArrowBetween
                      fromNode={idx}
                      toNode={node.next}
                      nextIdx={idx + 1}
                    />
                  </motion.div>
                )}
              </React.Fragment>
            );
          })}

          {/* Null terminus when curr === null */}
          <AnimatePresence>
            {curr === null && (
              <motion.div
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center ml-2">
                <div className="h-8 flex items-end mb-1">
                  <PointerLabel text="curr" style={PTR_STYLE.curr} />
                </div>
                <div className="flex items-center justify-center font-mono text-sm italic"
                  style={{
                    width: 56, height: NODE_H,
                    border: '1px dashed rgba(255,0,0,0.3)',
                    color: 'rgba(255,0,0,0.5)',
                  }}>
                  null
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend + variable inspector */}
      <div className="grid grid-cols-3 gap-3 border-t border-borderDark pt-6">
        {[
          { label: 'CURR', desc: 'Current node being processed',  border: '2px solid #ff0000',               color: '#ff0000' },
          { label: 'PREV', desc: 'Previous node (reversed so far)', border: '2px dashed rgba(255,255,255,0.5)', color: 'rgba(255,255,255,0.7)' },
          { label: 'NEXT', desc: 'Saved next before overwrite',   border: '2px dotted rgba(255,120,0,0.6)',   color: '#ff8c00' },
        ].map(({ label, desc, border, color }) => (
          <div key={label} className="p-3" style={{ background: '#110000', border: '1px solid #2a0000' }}>
            <div className="flex items-center gap-2 mb-1">
              <div style={{ width: 14, height: 14, background: 'transparent', border, flexShrink: 0 }} />
              <span className="font-mono font-bold text-[10px]" style={{ color }}>{label}</span>
            </div>
            <p className="text-[10px] leading-relaxed" style={{ color: '#6b5555' }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* Arrow component — shows forward, backward, or null */
const ArrowBetween = ({ fromNode, toNode, nextIdx }) => {
  const isForward  = toNode === nextIdx;
  const isBackward = toNode !== null && toNode !== nextIdx;
  const isNull     = toNode === null;

  if (isForward) {
    return (
      <div className="flex items-center gap-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
        <div style={{ width: 16, height: 1, background: 'currentColor' }} />
        <svg width="6" height="8" viewBox="0 0 6 8" fill="currentColor">
          <path d="M0 0 L6 4 L0 8 Z" />
        </svg>
      </div>
    );
  }

  if (isNull) {
    return (
      <div className="flex items-center" style={{ color: 'rgba(255,255,255,0.1)' }}>
        <div style={{ width: 12, height: 1, background: 'currentColor' }} />
        <span className="font-mono text-[9px] ml-1">∅</span>
      </div>
    );
  }

  // Backward pointer (reversed)
  return (
    <div className="flex items-center gap-0.5" style={{ color: 'rgba(255,0,0,0.5)' }}>
      <svg width="6" height="8" viewBox="0 0 6 8" fill="currentColor">
        <path d="M6 0 L0 4 L6 8 Z" />
      </svg>
      <div style={{ width: 16, height: 1, background: 'currentColor' }} />
    </div>
  );
};

export default LinkedListVisualizer;
