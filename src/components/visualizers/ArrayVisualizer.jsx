import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Two Sum Visualizer ─────────────────────────────────────── */
const TwoSumViz = ({ stepData, target }) => {
  const { array = [], i = null, j = null, currentMap = {} } = stepData;
  const complement = i !== null ? target - array[i] : null;
  const found = j !== null;

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Array row */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="label">ARRAY</span>
          <div className="flex-1 h-px bg-borderDark" />
          <span className="label">target = <span style={{ color: '#ff0000' }}>{target}</span></span>
        </div>
        <div className="flex gap-2 justify-center flex-wrap">
          {array.map((val, idx) => {
            const isI = i === idx;
            const isJ = j === idx;
            const isFound = found && (isI || isJ);

            return (
              <motion.div key={idx} layout className="flex flex-col items-center gap-1">
                {/* Pointer arrow above */}
                <div className="h-6 flex items-end justify-center">
                  {isI && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center gap-0.5">
                      <span className="font-mono font-bold text-[10px]" style={{ color: '#ff0000' }}>i</span>
                      <div style={{ width: 1, height: 8, background: '#ff0000' }} />
                    </motion.div>
                  )}
                  {isJ && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center gap-0.5">
                      <span className="font-mono font-bold text-[10px]" style={{ color: 'rgba(255,255,255,0.7)' }}>j</span>
                      <div style={{ width: 1, height: 8, background: 'rgba(255,255,255,0.5)' }} />
                    </motion.div>
                  )}
                </div>

                {/* Cell */}
                <motion.div
                  className="w-14 h-14 flex items-center justify-center font-mono font-bold text-lg"
                  style={{
                    background: isFound ? 'rgba(255,0,0,0.2)' : isI ? 'rgba(255,0,0,0.1)' : isJ ? 'rgba(255,255,255,0.08)' : '#110000',
                    border: `1px solid ${isFound ? '#ff0000' : isI ? 'rgba(255,0,0,0.6)' : isJ ? 'rgba(255,255,255,0.3)' : '#2a0000'}`,
                    color: isFound ? '#fff' : isI ? '#fff' : isJ ? '#fff' : '#6b5555',
                    boxShadow: isFound ? '0 0 20px rgba(255,0,0,0.4)' : isI ? '0 0 12px rgba(255,0,0,0.2)' : 'none',
                  }}
                  animate={isFound ? { scale: [1, 1.12, 1] } : {}}
                  transition={{ duration: 0.3 }}>
                  {val}
                </motion.div>

                {/* Index below */}
                <span className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>[{idx}]</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Complement + HashMap row */}
      <div className="grid grid-cols-2 gap-4 border-t border-borderDark pt-6">

        {/* Live complement calc */}
        <div style={{ background: '#110000', border: '1px solid #2a0000' }} className="p-4">
          <p className="label mb-3">COMPLEMENT CALC</p>
          {i !== null ? (
            <div className="font-mono text-sm space-y-1.5">
              <div className="flex items-center gap-2">
                <span style={{ color: '#6b5555' }}>target</span>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>=</span>
                <span style={{ color: '#ff0000' }} className="font-bold">{target}</span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: '#6b5555' }}>nums[i]</span>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>=</span>
                <span className="text-white font-bold">{array[i]}</span>
              </div>
              <div style={{ height: 1, background: '#2a0000' }} className="my-2" />
              <div className="flex items-center gap-2">
                <span style={{ color: '#6b5555' }}>need</span>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>=</span>
                <span style={{ color: found ? '#ff0000' : 'rgba(255,255,255,0.8)' }} className="font-bold text-base">
                  {complement}
                </span>
                {found && <span style={{ color: '#ff0000' }} className="text-xs font-bold">✓ FOUND</span>}
              </div>
            </div>
          ) : (
            <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>waiting...</p>
          )}
        </div>

        {/* Hash map */}
        <div style={{ background: '#110000', border: '1px solid #2a0000' }} className="p-4">
          <p className="label mb-3">HASH MAP  <span style={{ color: 'rgba(255,255,255,0.2)' }}>val → idx</span></p>
          {Object.keys(currentMap).length === 0 ? (
            <div className="font-mono text-xs text-center py-3" style={{ color: 'rgba(255,255,255,0.1)' }}>{'{ }'}</div>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
              <AnimatePresence>
                {Object.entries(currentMap).map(([key, val]) => {
                  const isHit = found && String(complement) === key;
                  return (
                    <motion.div key={key}
                      initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center justify-between text-xs px-3 py-1.5"
                      style={{
                        background: isHit ? 'rgba(255,0,0,0.15)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isHit ? '#ff0000' : '#2a0000'}`,
                        boxShadow: isHit ? '0 0 12px rgba(255,0,0,0.2)' : 'none',
                      }}>
                      <span className="font-mono font-bold text-white">{key}</span>
                      <span className="font-mono" style={{ color: '#6b5555' }}>→</span>
                      <span className="font-mono font-bold" style={{ color: isHit ? '#ff0000' : 'rgba(255,255,255,0.5)' }}>idx {val}</span>
                      {isHit && <span style={{ color: '#ff0000' }} className="text-[9px] font-bold ml-1">HIT!</span>}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Binary Search Visualizer ───────────────────────────────── */
const BinarySearchViz = ({ stepData, target }) => {
  const { array = [], i: left = null, j: right = null, currentMap = {} } = stepData;
  const mid = currentMap?.mid ?? null;

  return (
    <div className="flex flex-col gap-8 w-full">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <span className="label">SORTED ARRAY</span>
          <div className="flex-1 h-px bg-borderDark" />
          <span className="label">target = <span style={{ color: '#ff0000' }}>{target}</span></span>
        </div>

        {/* Range bracket */}
        <div className="relative flex justify-center mb-2">
          {left !== null && right !== null && (
            <div className="relative flex gap-2 flex-wrap justify-center">
              {array.map((val, idx) => {
                const isLeft  = idx === left;
                const isRight = idx === right;
                const isMid   = idx === mid;
                const inRange = idx >= left && idx <= right;
                const isTarget = val === target && isMid;

                let bg = '#110000', border = '#2a0000', color = '#6b5555';
                if (isTarget) { bg = 'rgba(255,0,0,0.2)'; border = '#ff0000'; color = '#fff'; }
                else if (isMid)   { bg = 'rgba(255,255,255,0.1)'; border = 'rgba(255,255,255,0.4)'; color = '#fff'; }
                else if (inRange) { bg = 'rgba(255,0,0,0.04)'; border = 'rgba(255,0,0,0.2)'; color = 'rgba(255,255,255,0.6)'; }

                return (
                  <motion.div key={idx} layout className="flex flex-col items-center gap-1">
                    {/* Top labels */}
                    <div className="h-7 flex flex-col items-center justify-end gap-0.5">
                      {isMid && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col items-center">
                          <span className="font-mono font-bold text-[10px]" style={{ color: '#fff' }}>mid</span>
                          <div style={{ width: 1, height: 6, background: 'rgba(255,255,255,0.5)' }} />
                        </motion.div>
                      )}
                      {isLeft && !isMid && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col items-center">
                          <span className="font-mono font-bold text-[10px]" style={{ color: '#ff0000' }}>L</span>
                          <div style={{ width: 1, height: 6, background: '#ff0000' }} />
                        </motion.div>
                      )}
                      {isRight && !isMid && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col items-center">
                          <span className="font-mono font-bold text-[10px]" style={{ color: '#ff0000' }}>R</span>
                          <div style={{ width: 1, height: 6, background: '#ff0000' }} />
                        </motion.div>
                      )}
                    </div>

                    <motion.div
                      className="w-14 h-14 flex items-center justify-center font-mono font-bold text-base"
                      style={{
                        background: bg, border: `1px solid ${border}`, color,
                        boxShadow: isTarget ? '0 0 20px rgba(255,0,0,0.4)' : 'none',
                        opacity: !inRange ? 0.25 : 1,
                      }}
                      animate={isTarget ? { scale: [1, 1.12, 1] } : {}}
                      transition={{ duration: 0.3 }}>
                      {val}
                    </motion.div>
                    <span className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>[{idx}]</span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Variable inspector */}
      <div className="grid grid-cols-3 gap-3 border-t border-borderDark pt-6">
        {[
          { label: 'LEFT',   value: left,   color: '#ff0000' },
          { label: 'MID',    value: mid ?? '—', color: 'rgba(255,255,255,0.8)' },
          { label: 'RIGHT',  value: right,  color: '#ff0000' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center gap-1 py-3"
            style={{ background: '#110000', border: '1px solid #2a0000' }}>
            <span className="label">{label}</span>
            <span className="font-mono font-bold text-xl" style={{ color }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Generic Array Visualizer (fallback) ────────────────────── */
const GenericArrayViz = ({ stepData }) => {
  const { array = [], i = null, currentMap = {} } = stepData;
  const stackArr = currentMap?.stack ?? null;

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Character array */}
      <div>
        <p className="label mb-4">ARRAY</p>
        <div className="flex gap-2 justify-center flex-wrap">
          {array.map((val, idx) => {
            const isActive = i === idx;
            return (
              <motion.div key={idx} layout className="flex flex-col items-center gap-1">
                <div className="h-6 flex items-end justify-center">
                  {isActive && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center gap-0.5">
                      <span className="font-mono font-bold text-[10px]" style={{ color: '#ff0000' }}>i</span>
                      <div style={{ width: 1, height: 8, background: '#ff0000' }} />
                    </motion.div>
                  )}
                </div>
                <motion.div
                  className="min-w-[56px] w-auto min-h-[56px] h-auto py-2 px-3 flex items-center justify-center font-mono font-bold text-base text-center break-all"
                  style={{
                    background: isActive ? 'rgba(255,0,0,0.1)' : '#110000',
                    border: `1px solid ${isActive ? 'rgba(255,0,0,0.6)' : '#2a0000'}`,
                    color: isActive ? '#fff' : '#6b5555',
                    boxShadow: isActive ? '0 0 12px rgba(255,0,0,0.25)' : 'none',
                  }}
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}>
                  {val}
                </motion.div>
                <span className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>[{idx}]</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Stack visualization */}
      {stackArr !== null && (
        <div className="border-t border-borderDark pt-6">
          <div className="flex items-center gap-3 mb-4">
            <p className="label">STACK</p>
            <span className="font-mono text-[10px]" style={{ color: '#6b5555' }}>
              (top → right)
            </span>
          </div>
          <div className="flex items-end gap-0 justify-center" style={{ minHeight: 80 }}>
            {stackArr.length === 0 ? (
              <div className="flex items-center justify-center w-full h-16 font-mono text-xs"
                style={{ border: '1px dashed #2a0000', color: 'rgba(255,255,255,0.15)' }}>
                EMPTY
              </div>
            ) : (
              <div className="flex gap-1 items-end">
                {stackArr.map((ch, idx) => {
                  const isTop = idx === stackArr.length - 1;
                  return (
                    <motion.div key={idx}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center gap-1">
                      {isTop && <span className="label-red text-[9px]">TOP</span>}
                      <div className="w-12 h-12 flex items-center justify-center font-mono font-bold text-lg"
                        style={{
                          background: isTop ? 'rgba(255,0,0,0.15)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${isTop ? '#ff0000' : '#2a0000'}`,
                          color: isTop ? '#fff' : 'rgba(255,255,255,0.5)',
                          boxShadow: isTop ? '0 0 12px rgba(255,0,0,0.2)' : 'none',
                        }}>
                        {ch}
                      </div>
                      <span className="font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.15)' }}>{idx}</span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Router ─────────────────────────────────────────────────── */
const ArrayVisualizer = ({ stepData, target, problemId }) => {
  if (problemId === 'two-sum')       return <TwoSumViz stepData={stepData} target={target} />;
  if (problemId === 'binary-search') return <BinarySearchViz stepData={stepData} target={target} />;
  return <GenericArrayViz stepData={stepData} />;
};

export default ArrayVisualizer;
