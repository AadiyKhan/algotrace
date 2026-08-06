import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useChatStore from '../../store/useChatStore';

const NODE_W = 56;
const NODE_H = 56;

/* Pointer styles — solid/dashed/dotted for colorblind support */
const PTR_STYLE = {
  curr: { bg: 'rgba(245,158,11,0.15)', border: '2px solid #f59e0b',              color: '#fff',                   shadow: '0 0 20px rgba(245,158,11,0.4)', labelColor: '#050505',              labelBg: '#f59e0b',        labelBorder: '#f59e0b' },
  prev: { bg: 'rgba(255,255,255,0.05)', border: '2px dashed rgba(255,255,255,0.8)', color: '#fff',             shadow: 'none',                        labelColor: '#050505', labelBg: '#ffffff',   labelBorder: '#ffffff' },
  next: { bg: 'rgba(99,102,241,0.1)',  border: '2px dotted rgba(99,102,241,0.8)', color: '#6366f1',               shadow: 'none',                        labelColor: '#050505',              labelBg: '#6366f1',     labelBorder: '#6366f1' },
  def:  { bg: '#050505',             border: '2px solid rgba(255,255,255,0.15)',              color: 'rgba(255,255,255,0.4)',               shadow: 'none',                        labelColor: '',                     labelBg: '',                        labelBorder: '' },
};

const PointerLabel = ({ text, style, layoutId }) => (
  <motion.div
    layoutId={layoutId}
    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ type: "spring", stiffness: 300, damping: 25 }}
    className="flex flex-col items-center z-10"
    style={{ filter: `drop-shadow(0 0 8px ${style.labelBg}80)` }}>
    <div 
      className="px-2 py-0.5 rounded-[4px] font-mono font-black text-[10px] uppercase tracking-widest shadow-lg"
      style={{ color: style.labelColor, background: style.labelBg, borderColor: style.labelBorder }}>
      {text}
    </div>
    <div 
      className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent"
      style={{ borderTopColor: style.labelBg }}
    />
  </motion.div>
);

const LinkedListVisualizer = ({ stepData }) => {
  const { askQuestion } = useChatStore();
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
                  <div className="h-6 flex items-end justify-center gap-1 mb-1">
                    <AnimatePresence>
                      {isPrev && <PointerLabel key="prev" text="prev" style={PTR_STYLE.prev} layoutId="ll-ptr-prev" />}
                      {isCurr && <PointerLabel key="curr" text="curr" style={PTR_STYLE.curr} layoutId="ll-ptr-curr" />}
                      {isNext && <PointerLabel key="next" text="next" style={PTR_STYLE.next} layoutId="ll-ptr-next" />}
                    </AnimatePresence>
                  </div>

                  {/* Node: [val | →] */}
                  <motion.div
                    layout
                    onClick={() => askQuestion(`Explain what node with value ${node.val} at index ${idx} represents in the linked list right now.`)}
                    className="flex items-stretch cursor-pointer hover:border-amber-500 transition-colors"
                    style={{ border: s.border, boxShadow: s.shadow }}
                    animate={isCurr ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                    whileHover={{ scale: 1.05 }}
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
                <div className="h-6 flex items-end mb-1">
                  <PointerLabel text="curr" style={PTR_STYLE.curr} layoutId="ll-ptr-curr" />
                </div>
                <div className="flex items-center justify-center font-mono text-sm italic"
                  style={{
                    width: 56, height: NODE_H,
                    border: '1px dashed rgba(245,158,11,0.3)',
                    color: 'rgba(245,158,11,0.5)',
                  }}>
                  null
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>


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

      {/* Legend + variable inspector */}
      <div className="grid grid-cols-3 gap-3 border-t border-borderDark pt-6">
        {[
          { label: 'CURR', desc: 'Current node being processed',  border: '2px solid #6366f1',               color: '#6366f1' },
          { label: 'PREV', desc: 'Previous node (reversed so far)', border: '2px dashed rgba(255,255,255,0.5)', color: 'rgba(255,255,255,0.7)' },
          { label: 'NEXT', desc: 'Saved next before overwrite',   border: '2px dotted rgba(255,120,0,0.6)',   color: '#ff8c00' },
        ].map(({ label, desc, border, color }) => (
          <div key={label} className="p-3" style={{ background: '#18181b', border: '1px solid #27272a' }}>
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
    <div className="flex items-center gap-0.5" style={{ color: 'rgba(99,102,241,0.5)' }}>
      <svg width="6" height="8" viewBox="0 0 6 8" fill="currentColor">
        <path d="M6 0 L0 4 L6 8 Z" />
      </svg>
      <div style={{ width: 16, height: 1, background: 'currentColor' }} />
    </div>
  );
};

export default LinkedListVisualizer;
