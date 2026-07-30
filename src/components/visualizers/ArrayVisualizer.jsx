import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Pointer = ({ label, layoutId, color = '#f59e0b', textColor = '#050505' }) => (
  <motion.div 
    layoutId={layoutId} 
    initial={{ opacity: 0, y: -10 }} 
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 25 }}
    className="flex flex-col items-center z-10"
    style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
  >
    <div 
      className="px-2 py-0.5 rounded-[4px] font-mono font-black text-[10px] uppercase tracking-widest shadow-lg"
      style={{ backgroundColor: color, color: textColor }}
    >
      {label}
    </div>
    <div 
      className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent"
      style={{ borderTopColor: color }}
    />
  </motion.div>
);

/* ─── Two Sum Visualizer ─────────────────────────────────────── */
const TwoSumViz = ({ stepData, target }) => {
  const { array = [], i = null, j = null } = stepData;
  const currentMap = stepData.currentMap || stepData.map || {};
  const complement = i !== null && array[i] !== undefined ? target - array[i] : null;
  const found = j !== null;
  const complementInMap = complement !== null && Object.prototype.hasOwnProperty.call(currentMap, String(complement));

  return (
    <div className="flex flex-col gap-8 w-full p-4">
      {/* Array row */}
      <div>
        <div className="flex items-center gap-4 mb-6">
          <span className="font-mono font-bold tracking-widest text-[11px] uppercase text-white/50">INPUT_ARRAY</span>
          <div className="flex-1 h-[2px] bg-white/10" />
          <span className="font-mono font-bold tracking-widest text-[11px] uppercase text-white/50">TARGET = <span className="text-amber-500">{target}</span></span>
        </div>
        <div className="flex gap-1 justify-center flex-wrap p-2 bg-[#050505] border-[2px] border-white/10 rounded-lg shadow-inner min-h-[96px] items-end overflow-hidden">
          <AnimatePresence mode="popLayout">
            {array.map((val, idx) => {
              const isI = i === idx;
              const isJ = j === idx;
              const isFound = found && (isI || isJ);

              return (
                <motion.div 
                  key={idx} 
                  layout 
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="flex flex-col items-center gap-1"
                >
                  {/* Pointer arrow above */}
                  <div className="h-6 flex items-end justify-center w-full">
                    {isI && <Pointer label="i" layoutId="twosum-pointer-i" />}
                    {isJ && <Pointer label="j" layoutId="twosum-pointer-j" color="#ffffff" textColor="#050505" />}
                  </div>

                  {/* Cell */}
                  <motion.div
                    className="min-w-[56px] min-h-[56px] flex items-center justify-center font-mono font-black text-lg z-0"
                    style={{
                      background: isFound ? 'rgba(245,158,11,0.2)' : isI ? 'rgba(245,158,11,0.1)' : isJ ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                      border: `2px solid ${isFound ? '#f59e0b' : isI ? 'rgba(245,158,11,0.6)' : isJ ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'}`,
                      color: isFound ? '#fff' : isI ? '#fff' : isJ ? '#fff' : 'rgba(255,255,255,0.5)',
                      boxShadow: isFound ? '0 0 30px rgba(245,158,11,0.3)' : 'none',
                    }}
                    animate={isFound ? { scale: [1, 1.12, 1] } : {}}
                    transition={{ duration: 0.3 }}>
                    {val}
                  </motion.div>

                  {/* Index below */}
                  <span className="font-mono text-[10px] font-bold text-white/30 tracking-widest mt-1">[{idx}]</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

        {/* Complement + HashMap row */}
      <div className="grid grid-cols-2 gap-6 border-t-[2px] border-white/10 pt-8 mt-4">
        
        {/* Live complement calc */}
        <div className="p-6 bg-[#050505] border-[2px] border-white/20 relative">
          <div className="absolute -top-3 left-4 bg-[#0a0a0b] px-2 font-mono font-bold tracking-widest text-[11px] uppercase text-amber-500">
            COMPLEMENT_CALC
          </div>
          {i !== null ? (
            <div className="font-mono text-sm space-y-3 mt-2">
              <div className="flex items-center gap-4">
                <span className="text-white/50 w-24">target</span>
                <span className="text-white/30">=</span>
                <span className="text-amber-500 font-bold">{target}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white/50 w-24">nums[{i}]</span>
                <span className="text-white/30">=</span>
                <span className="text-white font-bold">{array[i]}</span>
              </div>
              <div className="w-full h-[2px] bg-white/10 my-4" />
              <div className="flex items-center gap-4">
                <span className="text-white/50 w-24 uppercase">need</span>
                <span className="text-white/30">=</span>
                <motion.span
                  key={complement}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`font-bold text-lg ${found ? 'text-amber-500' : complementInMap ? 'text-green-400' : 'text-white'}`}>
                  {complement}
                </motion.span>
                {found && <span className="text-amber-500 text-xs font-bold tracking-widest ml-4">[ FOUND ✓ ]</span>}
                {!found && complementInMap && <span className="text-green-400 text-xs font-bold tracking-widest ml-4">[ IN MAP ]</span>}
              </div>
            </div>
          ) : (
            <p className="font-mono text-[11px] text-white/20 uppercase tracking-widest mt-2">AWAITING_EXECUTION...</p>
          )}
        </div>

        {/* Hash map */}
        <div className="p-6 bg-[#050505] border-[2px] border-white/20 relative">
          <div className="absolute -top-3 left-4 bg-[#0a0a0b] px-2 font-mono font-bold tracking-widest text-[11px] uppercase text-white/50 flex gap-4">
            HASH_MAP <span className="text-white/20">val→idx</span>
          </div>
          {Object.keys(currentMap).length === 0 ? (
            <div className="font-mono text-sm text-center py-6 text-white/20 tracking-widest">[ EMPTY ]</div>
          ) : (
            <div className="flex flex-col gap-2 mt-2 max-h-40 overflow-y-auto pr-2">
              <AnimatePresence>
                {Object.entries(currentMap).map(([key, val]) => {
                  const isHit = complementInMap && String(complement) === key;
                  return (
                    <motion.div key={key}
                      initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center justify-between px-4 py-2 bg-[#0a0a0b]"
                      style={{
                        border: `2px solid ${isHit ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
                        boxShadow: isHit ? '0 0 20px rgba(245,158,11,0.2)' : 'none',
                      }}>
                      <span className="font-mono font-bold text-white text-sm">{key}</span>
                      <span className="font-mono text-white/30">→</span>
                      <span className={`font-mono font-bold text-sm ${isHit ? 'text-amber-500' : 'text-white/50'}`}>idx {val}</span>
                      {isHit && <span className="text-amber-500 text-[10px] font-bold ml-2 uppercase tracking-widest animate-pulse">HIT ✓</span>}
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
    <div className="flex flex-col gap-8 w-full p-4">
      <div>
        <div className="flex items-center gap-4 mb-8">
          <span className="font-mono font-bold tracking-widest text-[11px] uppercase text-white/50">SORTED_ARRAY</span>
          <div className="flex-1 h-[2px] bg-white/10" />
          <span className="font-mono font-bold tracking-widest text-[11px] uppercase text-white/50">TARGET = <span className="text-amber-500">{target}</span></span>
        </div>

        <div className="relative flex justify-center mb-4 p-2 bg-[#050505] border-[2px] border-white/10 rounded-lg shadow-inner min-h-[96px] items-end overflow-hidden">
          {left !== null && right !== null && (
            <div className="flex gap-1 flex-wrap justify-center w-full">
              <AnimatePresence mode="popLayout">
                {array.map((val, idx) => {
                  const isLeft  = idx === left;
                  const isRight = idx === right;
                  const isMid   = idx === mid;
                  const inRange = idx >= left && idx <= right;
                  const isTarget = val === target && isMid;

                  let bg = 'rgba(255,255,255,0.02)', border = 'rgba(255,255,255,0.15)', color = 'rgba(255,255,255,0.5)';
                  if (isTarget) { bg = 'rgba(245,158,11,0.2)'; border = '#f59e0b'; color = '#fff'; }
                  else if (isMid)   { bg = 'rgba(255,255,255,0.15)'; border = 'rgba(255,255,255,0.8)'; color = '#fff'; }
                  else if (inRange) { bg = 'rgba(245,158,11,0.05)'; border = 'rgba(245,158,11,0.3)'; color = 'rgba(255,255,255,0.9)'; }

                  return (
                    <motion.div 
                      key={idx} 
                      layout 
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -20 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className="h-6 flex items-end justify-center gap-1 w-full relative">
                        <AnimatePresence>
                          {isMid && (
                            <div className="absolute -top-6">
                              <Pointer label="MID" layoutId="bs-pointer-mid" color="#ffffff" textColor="#050505" />
                            </div>
                          )}
                          {isLeft && (
                            <div className="absolute top-0 -left-3">
                              <Pointer label="L" layoutId="bs-pointer-left" />
                            </div>
                          )}
                          {isRight && (
                            <div className="absolute top-0 -right-3">
                              <Pointer label="R" layoutId="bs-pointer-right" />
                            </div>
                          )}
                        </AnimatePresence>
                      </div>

                      <motion.div
                        className="min-w-[50px] min-h-[50px] flex items-center justify-center font-mono font-black text-lg z-0 relative"
                        style={{
                          background: bg, border: `2px solid ${border}`, color,
                          boxShadow: isTarget ? '0 0 30px rgba(245,158,11,0.3)' : 'none',
                          opacity: !inRange ? 0.3 : 1,
                        }}
                        animate={isTarget ? { scale: [1, 1.12, 1] } : {}}
                        transition={{ duration: 0.3 }}>
                        {val}
                      </motion.div>
                      <span className="font-mono text-[10px] font-bold text-white/30 tracking-widest mt-1">[{idx}]</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Variable inspector */}
      <div className="grid grid-cols-3 gap-6 border-t-[2px] border-white/10 pt-8 mt-4">
        {[
          { label: 'LEFT',   value: left,   color: '#f59e0b' },
          { label: 'MID',    value: mid ?? '—', color: '#ffffff' },
          { label: 'RIGHT',  value: right,  color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center gap-2 py-4 bg-[#050505] border-[2px] border-white/20">
            <span className="font-mono font-bold text-[11px] uppercase tracking-widest text-white/40">{label}</span>
            <span className="font-mono font-black text-3xl" style={{ color }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Merge Intervals Visualizer ───────────────────────────────── */
const MergeIntervalsViz = ({ stepData }) => {
  let { array = [], i = null, currentMap = {} } = stepData;
  const merged = currentMap?.merged || [];

  return (
    <div className="flex flex-col gap-10 w-full p-4">
      {/* Input Array */}
      <div>
        <div className="flex items-center gap-4 mb-6">
          <span className="font-mono font-bold tracking-widest text-[11px] uppercase text-white/50">INPUT_INTERVALS</span>
          <div className="flex-1 h-[2px] bg-white/10" />
        </div>
        <div className="flex gap-1 flex-wrap p-2 bg-[#050505] border-[2px] border-white/10 rounded-lg shadow-inner min-h-[96px] items-end overflow-hidden">
          <AnimatePresence mode="popLayout">
            {array.map((interval, idx) => {
              const isCurrent = idx === i;
              if (!Array.isArray(interval)) return null; 
              return (
                <motion.div 
                  key={idx} 
                  layout 
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="h-6 flex items-end justify-center w-full">
                    {isCurrent && <Pointer label="i" layoutId="mi-pointer-i" />}
                  </div>
                  <motion.div
                    className="px-4 h-12 flex items-center justify-center font-mono font-black text-base z-0 relative"
                    style={{
                      background: isCurrent ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.02)',
                      border: `2px solid ${isCurrent ? '#f59e0b' : 'rgba(255,255,255,0.15)'}`,
                      color: isCurrent ? '#fff' : 'rgba(255,255,255,0.7)',
                      boxShadow: isCurrent ? '0 0 20px rgba(245,158,11,0.2)' : 'none',
                      opacity: idx < i ? 0.3 : 1
                    }}
                    animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 0.3 }}>
                    [{interval[0]}, {interval[1]}]
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Merged Array */}
      <div>
        <div className="flex items-center gap-4 mb-6">
          <span className="font-mono font-bold tracking-widest text-[11px] uppercase text-amber-500">MERGED_LIST</span>
          <div className="flex-1 h-[2px] bg-amber-500/20" />
        </div>
        <div className="flex gap-4 flex-wrap min-h-[100px] border-[2px] border-white/20 p-6 bg-[#050505]">
          <AnimatePresence mode="popLayout">
            {merged.length === 0 ? (
              <div className="font-mono text-sm text-white/20 uppercase tracking-widest w-full text-center py-4">[ EMPTY ]</div>
            ) : (
              merged.map((interval, idx) => {
                const isLast = idx === merged.length - 1;
                return (
                  <motion.div key={idx} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
                    className="px-6 h-16 flex flex-col items-center justify-center font-mono font-black text-xl"
                    style={{ 
                      background: 'rgba(245,158,11,0.1)',
                      border: `2px solid ${isLast ? '#f59e0b' : 'rgba(245,158,11,0.4)'}`, 
                      color: '#fff',
                      boxShadow: isLast ? '0 0 20px rgba(245,158,11,0.15)' : 'none'
                    }}>
                    [{interval[0]}, {interval[1]}]
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};


/* ─── Generic Array Visualizer (fallback) ────────────────────── */
const GenericArrayViz = ({ stepData }) => {
  const { array = [], visited = [], queue = [], result = [], i = null, currentMap = {} } = stepData;
  const stackArr = currentMap?.stack ?? null;

  return (
    <div className="flex flex-col gap-8 w-full p-4">
      {/* Arrays */}
      {(!array.length && !visited.length && !queue.length && !result.length) ? (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <span className="font-mono font-bold tracking-widest text-[11px] uppercase text-white/50">DATA</span>
            <div className="flex-1 h-[2px] bg-white/10" />
          </div>
          <div className="font-mono text-sm text-white/20 uppercase tracking-widest w-full text-center py-8">
            [ EMPTY ]
          </div>
        </div>
      ) : (
        [
          { label: 'ARRAY', data: array },
          { label: 'VISITED', data: visited },
          { label: 'QUEUE', data: queue },
          { label: 'RESULT', data: result }
        ].map(({ label, data }) => {
          if (!data || data.length === 0) return null;
          return (
          <div key={label}>
            <div className="flex items-center gap-4 mb-6">
              <span className="font-mono font-bold tracking-widest text-[11px] uppercase text-white/50">{label}</span>
              <div className="flex-1 h-[2px] bg-white/10" />
            </div>
            <div className="flex gap-1 justify-center flex-wrap p-2 bg-[#050505] border-[2px] border-white/10 rounded-lg shadow-inner overflow-hidden min-h-[96px] items-end">
              <AnimatePresence mode="popLayout">
                {data.map((val, idx) => {
                  const isActive = i === idx;
                  const displayVal = Array.isArray(val) ? `[${val.join(',')}]` : typeof val === 'object' ? '{...}' : val;
                  return (
                    <motion.div 
                      key={idx} 
                      layout 
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -20 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className="h-6 flex items-end justify-center w-full">
                        {isActive && <Pointer label="i" layoutId={`generic-pointer-${label}`} />}
                      </div>
                      <motion.div
                        className="min-w-[56px] w-auto min-h-[56px] h-auto py-2 px-3 flex items-center justify-center font-mono font-black text-lg text-center break-all relative z-0"
                        style={{
                          background: isActive ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.02)',
                          border: `2px solid ${isActive ? '#f59e0b' : 'rgba(255,255,255,0.15)'}`,
                          color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                          boxShadow: isActive ? '0 0 20px rgba(245,158,11,0.2)' : 'none',
                        }}
                        animate={isActive ? { scale: [1, 1.1, 1] } : {}}>
                        {displayVal}
                      </motion.div>
                      <span className="font-mono text-[10px] font-bold text-white/30 tracking-widest mt-1">[{idx}]</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
          );
        })
      )}

      {/* Stack visualization */}
      {stackArr !== null && (
        <div className="border-t-[2px] border-white/10 pt-8 mt-4">
          <div className="flex items-center gap-4 mb-6">
            <span className="font-mono font-bold tracking-widest text-[11px] uppercase text-white/50">STACK_BUFFER <span className="text-white/20">(top → right)</span></span>
            <div className="flex-1 h-[2px] bg-white/10" />
          </div>
          <div className="flex items-end gap-1 justify-center bg-[#050505] border-[2px] border-white/10 rounded-lg p-6 min-h-[140px] shadow-inner overflow-hidden">
            {stackArr.length === 0 ? (
              <div className="font-mono text-sm text-white/20 uppercase tracking-widest w-full text-center">
                [ EMPTY ]
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {stackArr.map((ch, idx) => {
                  const isTop = idx === stackArr.length - 1;
                  return (
                    <motion.div 
                      key={idx}
                      layout
                      initial={{ opacity: 0, x: -20, scale: 0.8 }} 
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8, y: -20 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className="h-6 flex items-end justify-center w-full">
                        {isTop && <Pointer label="TOP" layoutId="stack-pointer-top" />}
                      </div>
                      <div className="min-w-[56px] min-h-[56px] flex items-center justify-center font-mono font-black text-xl z-0"
                        style={{
                          background: isTop ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)',
                          border: `2px solid ${isTop ? '#f59e0b' : 'rgba(255,255,255,0.2)'}`,
                          color: '#fff',
                          boxShadow: isTop ? '0 0 20px rgba(245,158,11,0.2)' : 'none',
                        }}>
                        {ch}
                      </div>
                      <span className="font-mono text-[10px] font-bold text-white/30 tracking-widest mt-1">[{idx}]</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Generate Parentheses Visualizer ────────────────────────── */
const GenerateParenthesesViz = ({ stepData, allSteps, currentStep }) => {
  const { i: openCount = 0, j: closeCount = 0 } = stepData;

  let currentString = '';
  let accumulatedResults = [];
  
  if (allSteps && allSteps.length > 0) {
    for (let idx = 0; idx <= currentStep; idx++) {
      const step = allSteps[idx];
      if (step && step.note) {
        const match = step.note.match(/(?:Current string:|current_string\s*=)\s*['"](.*?)['"]/i);
        if (match) {
          currentString = match[1];
        }
      }
      if (step && step.array) {
        accumulatedResults = step.array;
      }
    }
  } else {
    if (stepData.array) accumulatedResults = stepData.array;
  }

  return (
    <div className="flex flex-col gap-10 w-full h-full p-4">
      <div className="flex flex-col items-center gap-4 mb-2">
        <span className="font-mono font-bold tracking-widest text-[11px] uppercase text-white/50">CURRENT_COMBINATION</span>
        <div className="flex gap-2 min-h-[64px] items-center bg-[#050505] border-[2px] border-white/20 p-4">
          {currentString.split('').map((char, idx) => (
            <motion.div key={idx} initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="w-12 h-12 flex items-center justify-center font-mono font-black text-2xl"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid #ffffff',
                color: '#fff',
                boxShadow: '0 0 15px rgba(255,255,255,0.2)'
              }}>
              {char}
            </motion.div>
          ))}
          {currentString.length === 0 && (
            <div className="font-mono text-sm text-white/20 uppercase tracking-widest px-4">
              [ EMPTY ]
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 border-t-[2px] border-white/10 pt-8">
        <div className="p-6 flex flex-col items-center justify-center gap-2 bg-[#050505] border-[2px] border-white/20">
          <span className="font-mono font-bold tracking-widest text-[11px] uppercase text-amber-500">OPEN_COUNT (i)</span>
          <span className="font-mono font-black text-4xl text-white mt-2">{openCount}</span>
        </div>
        <div className="p-6 flex flex-col items-center justify-center gap-2 bg-[#050505] border-[2px] border-white/20">
          <span className="font-mono font-bold tracking-widest text-[11px] uppercase text-white/50">CLOSE_COUNT (j)</span>
          <span className="font-mono font-black text-4xl text-white mt-2">{closeCount}</span>
        </div>
      </div>

      <div className="border-t-[2px] border-white/10 pt-8">
        <div className="flex items-center gap-4 mb-6">
          <span className="font-mono font-bold tracking-widest text-[11px] uppercase text-white/50">VALID_COMBINATIONS_RESULT</span>
          <div className="flex-1 h-[2px] bg-white/10" />
        </div>
        <div className="flex flex-wrap gap-4 min-h-[80px] items-center bg-[#050505] border-[2px] border-white/20 p-6">
          {accumulatedResults.length === 0 ? (
            <div className="font-mono text-sm text-white/20 uppercase tracking-widest w-full text-center">[ EMPTY ]</div>
          ) : (
            accumulatedResults.map((res, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="px-6 py-3 font-mono font-black text-xl"
                style={{
                  background: 'rgba(245,158,11,0.1)',
                  border: '2px solid #f59e0b',
                  color: '#fff'
                }}>
                "{res}"
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Sliding Window Visualizer ───────────────────────────────── */
const SlidingWindowViz = ({ stepData }) => {
  const { array = [], left = null, right = null, window: win, result, maxLen, currLen } = stepData;
  const l = left ?? stepData.i ?? null;
  const r = right ?? stepData.j ?? null;
  const windowVal = win ?? stepData.window ?? result ?? maxLen ?? currLen ?? null;

  return (
    <div className="flex flex-col gap-8 w-full p-4">
      <div>
        <div className="flex items-center gap-4 mb-6">
          <span className="font-mono font-bold tracking-widest text-[11px] uppercase text-white/50">INPUT_ARRAY</span>
          <div className="flex-1 h-[2px] bg-white/10" />
        </div>
        <div className="relative">
          {/* Window bracket */}
          {l !== null && r !== null && r >= l && (
            <motion.div
              className="absolute -top-3 left-0 h-[calc(100%+24px)] pointer-events-none"
              layoutId="sw-bracket"
              style={{
                left: `calc(8px + ${l} * 56px)`,
                width: `calc(${r - l + 1} * 56px - 4px)`,
                border: '2px solid rgba(245,158,11,0.5)',
                background: 'rgba(245,158,11,0.05)',
                borderRadius: '4px',
              }}
              animate={{ opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          )}
          <div className="flex gap-1 p-2 bg-[#050505] border-[2px] border-white/10 rounded-lg shadow-inner min-h-[96px] items-end overflow-x-auto">
            <AnimatePresence mode="popLayout">
              {array.map((val, idx) => {
                const isL = idx === l;
                const isR = idx === r;
                const inWindow = l !== null && r !== null && idx >= l && idx <= r;
                return (
                  <motion.div key={idx} layout
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className="flex flex-col items-center gap-1 shrink-0"
                  >
                    <div className="h-6 flex items-end justify-center w-full">
                      {isL && <Pointer label="L" layoutId="sw-ptr-l" />}
                      {isR && <Pointer label="R" layoutId="sw-ptr-r" color="#ffffff" textColor="#050505" />}
                    </div>
                    <motion.div
                      className="min-w-[52px] min-h-[52px] flex items-center justify-center font-mono font-black text-lg"
                      style={{
                        background: inWindow ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.02)',
                        border: `2px solid ${isL || isR ? '#f59e0b' : inWindow ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.12)'}`,
                        color: inWindow ? '#fff' : 'rgba(255,255,255,0.35)',
                      }}
                    >{val}</motion.div>
                    <span className="font-mono text-[10px] font-bold text-white/25 tracking-widest mt-1">[{idx}]</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Window stats */}
      <div className="flex gap-4 border-t-[2px] border-white/10 pt-6">
        <div className="flex-1 p-4 bg-[#050505] border-[2px] border-white/20 relative">
          <div className="absolute -top-3 left-3 bg-[#0a0a0b] px-2 font-mono font-bold tracking-widest text-[10px] uppercase text-white/40">WINDOW_SIZE</div>
          <div className="font-mono font-black text-2xl text-white mt-1">
            {l !== null && r !== null && r >= l ? r - l + 1 : '—'}
          </div>
        </div>
        <div className={`flex-1 p-4 relative border-[2px] ${windowVal !== null && windowVal !== undefined ? 'bg-amber-500/10 border-amber-500' : 'bg-[#050505] border-white/20'}`}>
          <div className={`absolute -top-3 left-3 bg-[#0a0a0b] px-2 font-mono font-bold tracking-widest text-[10px] uppercase ${windowVal !== null && windowVal !== undefined ? 'text-amber-500' : 'text-white/40'}`}>BEST_RESULT</div>
          <div className={`font-mono font-black text-2xl mt-1 break-all line-clamp-2 ${windowVal !== null && windowVal !== undefined ? 'text-amber-400' : 'text-white'}`}>
            {windowVal !== null && windowVal !== undefined ? String(windowVal) : '—'}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Two Pointer Visualizer ─────────────────────────────────── */
const TwoPointerViz = ({ stepData }) => {
  const { array = [] } = stepData;
  const l = stepData.left ?? stepData.i ?? null;
  const r = stepData.right ?? stepData.j ?? null;
  const result = stepData.result ?? stepData.res ?? null;
  const found = stepData.found ?? (result !== null && result !== undefined);

  return (
    <div className="flex flex-col gap-8 w-full p-4">
      <div>
        <div className="flex items-center gap-4 mb-6">
          <span className="font-mono font-bold tracking-widest text-[11px] uppercase text-white/50">INPUT_ARRAY</span>
          <div className="flex-1 h-[2px] bg-white/10" />
        </div>
        <div className="flex gap-1 justify-center flex-wrap p-2 bg-[#050505] border-[2px] border-white/10 rounded-lg shadow-inner min-h-[96px] items-end overflow-hidden">
          <AnimatePresence mode="popLayout">
            {array.map((val, idx) => {
              const isL = idx === l;
              const isR = idx === r;
              const between = l !== null && r !== null && idx > l && idx < r;
              const isHit = found && (isL || isR);
              return (
                <motion.div key={idx} layout
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="h-6 flex items-end justify-center w-full">
                    {isL && <Pointer label="L" layoutId="tp-ptr-l" />}
                    {isR && <Pointer label="R" layoutId="tp-ptr-r" color="#ffffff" textColor="#050505" />}
                  </div>
                  <motion.div
                    className="min-w-[52px] min-h-[52px] flex items-center justify-center font-mono font-black text-lg"
                    style={{
                      background: isHit ? 'rgba(245,158,11,0.2)' : isL ? 'rgba(245,158,11,0.1)' : isR ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                      border: `2px solid ${isHit ? '#f59e0b' : isL ? 'rgba(245,158,11,0.6)' : isR ? 'rgba(255,255,255,0.5)' : between ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.12)'}`,
                      color: isL || isR ? '#fff' : between ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.3)',
                      boxShadow: isHit ? '0 0 24px rgba(245,158,11,0.3)' : 'none',
                    }}
                    animate={isHit ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.35 }}
                  >{val}</motion.div>
                  <span className="font-mono text-[10px] font-bold text-white/25 tracking-widest mt-1">[{idx}]</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Sum / result display */}
      {(l !== null && r !== null) && (
        <div className="flex gap-4 border-t-[2px] border-white/10 pt-6">
          <div className="flex-1 p-4 bg-[#050505] border-[2px] border-white/20 relative">
            <div className="absolute -top-3 left-3 bg-[#0a0a0b] px-2 font-mono font-bold tracking-widest text-[10px] uppercase text-white/40">CURR_SUM</div>
            <div className="font-mono font-black text-2xl text-white mt-1">
              {array[l] !== undefined && array[r] !== undefined ? `${array[l]} + ${array[r]} = ${array[l] + array[r]}` : '—'}
            </div>
          </div>
          {result !== null && result !== undefined && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              className="flex-1 p-4 bg-amber-500/10 border-[2px] border-amber-500 relative">
              <div className="absolute -top-3 left-3 bg-[#0a0a0b] px-2 font-mono font-bold tracking-widest text-[10px] uppercase text-amber-500">RESULT</div>
              <div className="font-mono font-black text-2xl text-amber-400 mt-1">{JSON.stringify(result)}</div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── DP Array Visualizer ────────────────────────────────────── */
const DPViz = ({ stepData }) => {
  const raw = stepData.dp ?? stepData.memo ?? stepData.table ?? stepData.array ?? [];
  const dp = Array.isArray(raw) ? raw : [];
  const curr = stepData.curr ?? stepData.i ?? null;
  const result = stepData.result ?? stepData.res ?? (dp.length > 0 ? dp[dp.length - 1] : null);

  return (
    <div className="flex flex-col gap-8 w-full p-4">
      {/* Input array if separate */}
      {stepData.array && stepData.dp && (
        <div>
          <div className="flex items-center gap-4 mb-4">
            <span className="font-mono font-bold tracking-widest text-[11px] uppercase text-white/50">INPUT</span>
            <div className="flex-1 h-[2px] bg-white/10" />
          </div>
          <div className="flex gap-1 p-2 bg-[#050505] border-[2px] border-white/10 rounded-lg min-h-[56px] items-center overflow-x-auto">
            {stepData.array.map((val, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1 shrink-0">
                <div className="min-w-[44px] min-h-[44px] flex items-center justify-center font-mono font-bold text-base"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '2px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                  {val}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DP table */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <span className="font-mono font-bold tracking-widest text-[11px] uppercase text-amber-500">DP_TABLE</span>
          <div className="flex-1 h-[2px] bg-amber-500/20" />
          {result !== null && result !== undefined && (
            <span className="font-mono font-bold tracking-widest text-[11px] uppercase text-amber-500">
              ANS = <span className="text-white">{String(result)}</span>
            </span>
          )}
        </div>
        <div className="flex gap-1 p-2 bg-[#050505] border-[2px] border-amber-500/20 rounded-lg shadow-inner min-h-[96px] items-end overflow-x-auto">
          <AnimatePresence mode="popLayout">
            {dp.map((val, idx) => {
              const isCurr = idx === curr;
              const isFilled = val !== null && val !== undefined && val !== 0 && val !== Infinity;
              return (
                <motion.div key={idx} layout
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="flex flex-col items-center gap-1 shrink-0"
                >
                  <div className="h-6 flex items-end justify-center w-full">
                    {isCurr && <Pointer label="i" layoutId="dp-ptr-i" />}
                  </div>
                  <motion.div
                    className="min-w-[52px] min-h-[52px] flex items-center justify-center font-mono font-black text-base"
                    style={{
                      background: isCurr ? 'rgba(245,158,11,0.2)' : isFilled ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.02)',
                      border: `2px solid ${isCurr ? '#f59e0b' : isFilled ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.1)'}`,
                      color: isCurr ? '#fff' : isFilled ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)',
                      boxShadow: isCurr ? '0 0 20px rgba(245,158,11,0.3)' : 'none',
                    }}
                    animate={isCurr ? { scale: [1, 1.08, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >{val !== null && val !== undefined ? String(val) : '∞'}</motion.div>
                  <span className="font-mono text-[10px] font-bold text-white/25 tracking-widest mt-1">[{idx}]</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

/* ─── Stack Visualizer ───────────────────────────────────────── */
const StackViz = ({ stepData }) => {
  const stack = stepData.stack ?? stepData.array ?? [];
  const top = stack.length - 1;
  const curr = stepData.curr ?? stepData.i ?? null;
  const result = stepData.result ?? stepData.valid ?? null;

  return (
    <div className="flex flex-col gap-8 w-full p-4">
      <div className="grid grid-cols-2 gap-6">
        {/* Stack column */}
        <div>
          <div className="flex items-center gap-4 mb-4">
            <span className="font-mono font-bold tracking-widest text-[11px] uppercase text-white/50">STACK</span>
            <div className="flex-1 h-[2px] bg-white/10" />
            <span className="font-mono text-[11px] text-white/25 uppercase">SIZE={stack.length}</span>
          </div>
          <div className="flex flex-col-reverse gap-1 p-2 bg-[#050505] border-[2px] border-white/10 rounded-lg min-h-[160px] justify-end overflow-y-auto max-h-72">
            <AnimatePresence>
              {stack.map((val, idx) => {
                const isTop = idx === top;
                return (
                  <motion.div key={idx}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className="flex items-center justify-between px-4 py-2 font-mono font-black text-base"
                    style={{
                      background: isTop ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `2px solid ${isTop ? '#f59e0b' : 'rgba(255,255,255,0.12)'}`,
                      color: isTop ? '#fff' : 'rgba(255,255,255,0.6)',
                      boxShadow: isTop ? '0 0 16px rgba(245,158,11,0.25)' : 'none',
                    }}
                  >
                    <span>{String(val)}</span>
                    {isTop && <span className="text-[9px] font-bold tracking-widest text-amber-500 uppercase ml-4">← TOP</span>}
                  </motion.div>
                );
              })}
              {stack.length === 0 && (
                <div className="text-center font-mono text-[11px] text-white/20 uppercase tracking-widest py-8">[ EMPTY ]</div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right panel: current char + result */}
        <div className="flex flex-col gap-4">
          {curr !== null && (
            <div className="p-4 bg-[#050505] border-[2px] border-white/20 relative">
              <div className="absolute -top-3 left-3 bg-[#0a0a0b] px-2 font-mono font-bold tracking-widest text-[10px] uppercase text-white/40">CURRENT</div>
              <div className="font-mono font-black text-3xl text-white mt-1">{JSON.stringify(curr)}</div>
            </div>
          )}
          {result !== null && result !== undefined && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 relative"
              style={{
                background: result === true || result === 'true' || result === 'valid' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                border: `2px solid ${result === true || result === 'true' ? '#22c55e' : '#ef4444'}`,
              }}>
              <div className="absolute -top-3 left-3 bg-[#0a0a0b] px-2 font-mono font-bold tracking-widest text-[10px] uppercase"
                style={{ color: result === true || result === 'true' ? '#22c55e' : '#ef4444' }}>RESULT</div>
              <div className="font-mono font-black text-2xl mt-1"
                style={{ color: result === true || result === 'true' ? '#22c55e' : result === false || result === 'false' ? '#ef4444' : '#fff' }}>
                {String(result)}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Router ─────────────────────────────────────────────────── */
const SLIDING_WINDOW_IDS = new Set([
  'longest-substring-without-repeating-characters', 'longest-repeating-character-replacement',
  'minimum-window-substring', 'permutation-in-string', 'find-all-anagrams-in-a-string',
]);
const TWO_POINTER_IDS = new Set([
  '3sum', 'container-with-most-water', 'valid-palindrome', 'two-sum-ii-input-array-is-sorted',
  'trapping-rain-water', 'move-zeroes',
]);
const DP_IDS = new Set([
  'climbing-stairs', 'house-robber', 'house-robber-ii', 'coin-change',
  'longest-increasing-subsequence', 'unique-paths', 'word-break', 'decode-ways',
  'maximum-product-subarray', 'palindromic-substrings', 'longest-palindromic-substring',
]);
const STACK_IDS = new Set([
  'valid-parentheses', 'daily-temperatures', 'car-fleet', 'generate-parentheses',
  'largest-rectangle-in-histogram',
]);

const ArrayVisualizer = ({ stepData, target, problemId, allSteps, currentStep }) => {
  if (problemId === 'two-sum')       return <TwoSumViz stepData={stepData} target={target} />;
  if (problemId === 'binary-search') return <BinarySearchViz stepData={stepData} target={target} />;
  if (problemId === 'merge-intervals' || problemId === 'insert-interval' || problemId === 'non-overlapping-intervals' || problemId === 'meeting-rooms' || problemId === 'meeting-rooms-ii') return <MergeIntervalsViz stepData={stepData} />;
  if (SLIDING_WINDOW_IDS.has(problemId)) return <SlidingWindowViz stepData={stepData} />;
  if (TWO_POINTER_IDS.has(problemId))    return <TwoPointerViz stepData={stepData} />;
  if (DP_IDS.has(problemId))             return <DPViz stepData={stepData} />;
  if (STACK_IDS.has(problemId))          return <StackViz stepData={stepData} />;
  if (problemId === 'generate-parentheses') return <GenerateParenthesesViz stepData={stepData} allSteps={allSteps} currentStep={currentStep} />;
  // Auto-detect from step data if no explicit match
  if (stepData.dp || stepData.memo || stepData.table) return <DPViz stepData={stepData} />;
  if (stepData.stack) return <StackViz stepData={stepData} />;
  if ((stepData.left !== undefined || stepData.right !== undefined) && stepData.array?.length > 0) return <TwoPointerViz stepData={stepData} />;
  return <GenericArrayViz stepData={stepData} />;
};

export default ArrayVisualizer;
