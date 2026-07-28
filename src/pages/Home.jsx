import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import { Eye, Zap, Layers, GitBranch, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchProblems } from '../services/api';

const TICKER = ['TWO SUM', 'BINARY SEARCH', 'MERGE SORT', 'QUICK SORT', 'BFS', 'DFS', 'DIJKSTRA', 'DYNAMIC PROGRAMMING', 'SLIDING WINDOW', 'TWO POINTERS', 'LINKED LIST', 'BINARY TREE', 'HASH MAP', 'STACK', 'QUEUE', 'HEAP'];

const Home = () => {
  const navigate = useNavigate();
  const ticker = [...TICKER, ...TICKER];
  const [problemCount, setProblemCount] = useState('...');

  useEffect(() => {
    fetchProblems().then(list => setProblemCount(list.length)).catch(() => setProblemCount('∞'));
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0000' }}>

      {/* Top border line */}
      <div style={{ height: '1px', background: '#ff0000', boxShadow: '0 0 40px 4px rgba(255,0,0,0.3)' }} />

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-borderDark">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 flex items-center justify-center" style={{ background: '#ff0000' }}>
            <Terminal size={13} color="#000" />
          </div>
          <span className="font-bold text-white tracking-tight text-sm">ALGOTRACE</span>
          <span className="font-mono text-[10px] text-primary border border-borderLight px-2 py-0.5">v4.0</span>
        </div>
        <a href="https://github.com" target="_blank" rel="noreferrer"
          className="flex items-center gap-2 font-mono text-xs text-textMuted hover:text-primary transition-colors border border-borderDark hover:border-primary px-3 py-1.5">
          <GitBranch size={12} />
          SOURCE
        </a>
      </nav>

      {/* Hero — full width editorial block */}
      <div className="border-b border-borderDark">
        <div className="max-w-screen-xl mx-auto px-8">

          {/* Big label row */}
          <div className="flex items-center gap-4 pt-16 pb-6 border-b border-borderDark">
            <span className="label-red">ALGORITHM VISUALIZER</span>
            <div className="flex-1 h-px bg-borderDark" />
            <span className="label">EST. 2025</span>
          </div>

          {/* Giant headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="py-12"
          >
            <h1 className="font-bold leading-[0.9] tracking-[-0.04em] select-none"
              style={{ fontSize: 'clamp(64px, 12vw, 160px)' }}>
              <span className="block text-white">WATCH</span>
              <span className="block" style={{ color: '#ff0000', WebkitTextStroke: '0px', textShadow: '0 0 80px rgba(255,0,0,0.4)' }}>CODE</span>
              <span className="block" style={{ color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.15)' }}>THINK.</span>
            </h1>
          </motion.div>

          {/* Sub row */}
          <div className="flex flex-col md:flex-row gap-8 pb-16 border-t border-borderDark pt-8">
            <p className="text-textMuted text-base leading-relaxed max-w-sm" style={{ fontWeight: 400 }}>
              Paste any LeetCode problem. Watch every pointer move, every array mutate, every hash map update — step by step.
            </p>
            <div className="flex-1 flex flex-col justify-end gap-4">
              <SearchBar />
              <div className="flex items-center gap-3">
                <span className="label">TRY:</span>
                {['Two Sum', 'Reverse Linked List', 'Binary Search'].map(s => (
                  <button key={s} onClick={() => navigate(`/problem/${s.toLowerCase().replace(/ /g, '-')}`)}
                    className="font-mono text-xs text-textMuted hover:text-primary border border-borderDark hover:border-primary px-3 py-1 transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee ticker */}
      <div className="overflow-hidden py-4 border-b border-borderDark" style={{ background: '#ff0000' }}>
        <motion.div
          className="flex gap-12 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 25, ease: 'linear', repeat: Infinity }}
        >
          {ticker.map((item, i) => (
            <span key={i} className="font-mono font-bold text-sm tracking-widest text-black flex items-center gap-12">
              {item}
              <span className="text-black/40">✦</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* Feature grid — brutalist cards */}
      <div className="max-w-screen-xl mx-auto px-8 py-16 w-full">
        <div className="flex items-center gap-4 mb-10">
          <span className="label-red">FEATURES</span>
          <div className="flex-1 h-px bg-borderDark" />
        </div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-px"
          style={{ background: '#2a0000' }}
        >
          <FeatureCard num="01" icon={<Eye size={18} />} title="DEEP OBSERVABILITY"
            desc="See exactly how arrays, maps, and pointers mutate on every single clock cycle. No black boxes." />
          <FeatureCard num="02" icon={<Zap size={18} />} title="INSTANT EXECUTION"
            desc="Zero config. Paste a link, hit trace, jump straight into the interactive step debugger." />
          <FeatureCard num="03" icon={<Layers size={18} />} title="SPATIAL MEMORY"
            desc="Complex state relationships rendered as spatial bento layouts. See the full picture." />
        </motion.div>
      </div>

      {/* Bottom stat bar */}
      <div className="mt-auto border-t border-borderDark">
        <div className="max-w-screen-xl mx-auto px-8 py-6 flex items-center justify-between">
          <span className="label">ALGOTRACE · BUILT FOR THE MODERN ENGINEER</span>
          <div className="flex items-center gap-6">
            {[[ problemCount, 'PROBLEMS'], ['∞', 'STEPS'], ['0', 'CONFIG']].map(([n, l]) => (
              <div key={l} className="flex items-center gap-2">
                <span className="font-bold text-primary font-mono text-lg">{n}</span>
                <span className="label">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

const FeatureCard = ({ num, icon, title, desc }) => (
  <div className="p-8 flex flex-col gap-6 group cursor-default transition-colors duration-200 bg-[#110000] hover:bg-[#1a0000]">
    <div className="flex items-start justify-between">
      <div className="p-2 border border-borderDark group-hover:border-primary group-hover:text-primary text-textMuted transition-all duration-200">
        {icon}
      </div>
      <span className="font-mono text-xs text-borderLight group-hover:text-primary transition-colors">{num}</span>
    </div>
    <div>
      <h3 className="font-bold text-white text-sm tracking-wide mb-2">{title}</h3>
      <p className="text-textMuted text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default Home;
