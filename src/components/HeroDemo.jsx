import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CODE_LINES = [
  [{ t: "function ", c: "#ffffff" }, { t: "bubbleSort", c: "#f59e0b" }, { t: "(arr) {", c: "#64748b" }],
  [{ t: "  for ", c: "#ffffff" }, { t: "(", c: "#64748b" }, { t: "let ", c: "#ffffff" }, { t: "i = 0; i < n; i++) {", c: "#64748b" }],
  [{ t: "    for ", c: "#ffffff" }, { t: "(", c: "#64748b" }, { t: "let ", c: "#ffffff" }, { t: "j = 0; j < n - i - 1; j++) {", c: "#64748b" }],
  [{ t: "      if ", c: "#ffffff" }, { t: "(arr[j] > arr[j + 1]) {", c: "#64748b" }],
  [{ t: "        let ", c: "#ffffff" }, { t: "tmp = arr[j];", c: "#64748b" }],
  [{ t: "        arr[j] = arr[j + 1];", c: "#64748b" }],
  [{ t: "        arr[j + 1] = tmp;", c: "#64748b" }],
  [{ t: "      }", c: "#64748b" }],
  [{ t: "    }", c: "#64748b" }],
  [{ t: "  }", c: "#64748b" }],
  [{ t: "}", c: "#64748b" }]
];

const INITIAL_ARRAY = [
  { id: 'a', val: 8 },
  { id: 'b', val: 3 },
  { id: 'c', val: 5 },
  { id: 'd', val: 1 },
  { id: 'e', val: 9 },
  { id: 'f', val: 2 },
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const HeroDemo = () => {
  const [activeLine, setActiveLine] = useState(0);
  const [array, setArray] = useState(INITIAL_ARRAY);
  const [comparing, setComparing] = useState([]);
  const [swapping, setSwapping] = useState(false);

  useEffect(() => {
    let mounted = true;

    const runSort = async () => {
      while (mounted) {
        setArray([...INITIAL_ARRAY]);
        setComparing([]);
        setSwapping(false);
        setActiveLine(0);
        await sleep(1000);

        let arr = [...INITIAL_ARRAY];
        let n = arr.length;

        for (let i = 0; i < n; i++) {
          setActiveLine(1);
          await sleep(400);
          if (!mounted) return;

          for (let j = 0; j < n - i - 1; j++) {
            setActiveLine(2);
            await sleep(400);
            if (!mounted) return;

            setComparing([j, j + 1]);
            setActiveLine(3);
            await sleep(600);
            if (!mounted) return;

            if (arr[j].val > arr[j + 1].val) {
              setSwapping(true);
              setActiveLine(4);
              await sleep(300);
              if (!mounted) return;

              setActiveLine(5);
              await sleep(300);
              if (!mounted) return;

              setActiveLine(6);
              let tmp = arr[j];
              arr[j] = arr[j + 1];
              arr[j + 1] = tmp;
              setArray([...arr]);
              await sleep(500);
              if (!mounted) return;
            }
            setSwapping(false);
          }
        }
        setComparing([]);
        setActiveLine(8);
        await sleep(2000);
      }
    };

    runSort();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="w-full h-full bg-[#050505] border-[2px] border-white/20 shadow-2xl flex flex-col overflow-hidden relative group">
      
      {/* Brutalist Title Bar */}
      <div className="h-10 border-b-[2px] border-white/20 flex items-center px-4 bg-[#0a0a0b]">
        <div className="font-mono text-[11px] font-bold tracking-widest text-white/50 uppercase">
          demo_sandbox <span className="text-amber-500 ml-2">RUNNING</span>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left: Code Block */}
        <div className="w-1/2 border-r-[2px] border-white/20 p-4 bg-[#050505] font-mono text-[12px] leading-loose relative overflow-hidden flex flex-col justify-center">
          {CODE_LINES.map((lineTokens, idx) => {
            const isActive = activeLine === idx;
            return (
              <div key={idx} className="relative flex items-center">
                {isActive && (
                  <motion.div 
                    layoutId="hero-active-line"
                    className="absolute inset-0 bg-white/[0.04] rounded-sm -z-10 shadow-[inset_0_0_12px_rgba(255,255,255,0.02)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                {isActive && (
                  <motion.div 
                    layoutId="hero-active-bar"
                    className="absolute left-0 top-0 bottom-0 w-[2px] bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <span className={`w-4 text-right mr-3 select-none transition-colors duration-200 ${isActive ? 'text-amber-500' : 'text-white/20'}`}>
                  {idx + 1}
                </span>
                <span className="whitespace-pre transition-colors duration-200">
                  {lineTokens.map((tok, i) => (
                    <span key={i} style={{ color: isActive ? tok.c : 'rgba(255,255,255,0.3)' }}>{tok.t}</span>
                  ))}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right: Visualizer */}
        <div className="w-1/2 p-6 flex flex-col items-center justify-center bg-[#050505] relative">
          
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
            }}
          />

          <div className="flex items-end gap-2 h-40 w-full px-4 relative z-10">
            {array.map((item, idx) => {
              const isComparing = comparing.includes(idx);
              const isSwapping = isComparing && swapping;

              // Calculate height percentage based on value (max val is 9)
              const heightPct = Math.max(15, (item.val / 10) * 100);

              // Classy monochrome + amber accent colors for array bars
              const bgStyle = isSwapping 
                ? { background: 'rgba(255,255,255,0.9)', borderColor: 'rgba(255,255,255,1)', boxShadow: '0 0 20px rgba(255,255,255,0.4)' }
                : isComparing
                  ? { background: 'rgba(245,158,11,0.2)', borderColor: 'rgba(245,158,11,0.8)', boxShadow: '0 0 20px rgba(245,158,11,0.2)' }
                  : { background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' };

              return (
                <motion.div
                  key={item.id}
                  layout
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="flex-1 flex flex-col justify-end items-center gap-2 group/bar"
                >
                  <span className={`font-mono text-[11px] font-bold transition-colors ${isSwapping ? 'text-white' : isComparing ? 'text-amber-500' : 'text-white/40'}`}>
                    {item.val}
                  </span>
                  
                  <motion.div
                    className="w-full relative border-[2px]"
                    style={{ ...bgStyle, height: `${heightPct}%` }}
                    animate={{ y: isSwapping ? -8 : 0 }}
                  >
                    {/* Inner highlight */}
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/[0.1]" />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroDemo;
