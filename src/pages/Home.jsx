import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import HeroDemo from '../components/HeroDemo';
import Header from '../components/Header';
import Background2DGrid from '../components/Background2DGrid';
import LandingBeforeAfter from '../components/landing/LandingBeforeAfter';
import { MoveRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchProblems } from '../services/api';

const ALGORITHMS = [
  'Two Sum', 'Binary Search', 'Merge Sort', 'Quick Sort', 'BFS', 'DFS',
  'Dijkstra', 'Dynamic Programming', 'Sliding Window', 'Two Pointers',
];

const NAV_LINKS = ['Gallery', 'Documentation', 'Changelog'];

const FEATURES = [
  {
    num: '01',
    title: 'DEEP OBSERVABILITY',
    desc: 'See how arrays, maps, and pointers mutate on every clock cycle. No more black boxes.',
    tag: 'RUNTIME.MEMORY'
  },
  {
    num: '02',
    title: 'INSTANT EXECUTION',
    desc: 'Paste a link, hit trace. Jump straight into the interactive step debugger with zero build time.',
    tag: 'VM.SANDBOX'
  },
  {
    num: '03',
    title: 'SPATIAL MEMORY',
    desc: 'Complex state relationships rendered as massive spatial 2D layouts. See the full picture at once.',
    tag: 'RENDER.PIPELINE'
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [problemCount, setProblemCount] = useState('—');
  const [hoveredNav, setHoveredNav] = useState(null);
  const [ctaQuery, setCtaQuery] = useState('');

  const handleCtaSubmit = (e) => {
    e.preventDefault();
    const trimmed = ctaQuery.trim();
    if (!trimmed) return;
    
    // LeetCode URL extraction logic
    const lcMatch = trimmed.match(/leetcode\.com\/problems\/([^/]+)/i);
    if (lcMatch && lcMatch[1]) {
      navigate(`/problem/${lcMatch[1]}`);
      return;
    }
    
    // Fallback to standard slug generation
    const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    navigate(`/problem/${slug}`);
  };

  useEffect(() => {
    fetchProblems().then(list => setProblemCount(list.length)).catch(() => setProblemCount('∞'));
  }, []);

  const quickLinks = ['Two Sum', 'Reverse Linked List', 'Binary Search', 'Valid Parentheses'];

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0b] selection:bg-amber-500/30 selection:text-white">
      
      {/* ── Top Section (Header + Hero) ──────────────────────── */}
      <div className="relative w-full flex flex-col overflow-hidden">
        {/* Interactive 2D Grid Background */}
        <Background2DGrid />

        <div className="relative z-10 flex flex-col">
          <Header />

          {/* ── Editorial Hero ─────────────────────────────────────────── */}
          <div className="w-full max-w-[1600px] mx-auto px-8 lg:px-12 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left: Typography & Search */}
          <div className="flex flex-col items-start relative z-10">
            
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)] animate-pulse" />
              <span className="font-mono text-[11px] text-amber-500/80 tracking-wider">LIVE VISUALIZATION ENGINE</span>
            </div>

            <h1 className="font-medium text-white leading-[1.05] tracking-[-0.04em] mb-8"
              style={{ fontSize: 'clamp(48px, 6vw, 80px)' }}>
              Stop guessing.
              <br />
              <span className="text-white/40">
                Watch your code think.
              </span>
            </h1>

            <p className="text-white/40 text-[16px] leading-relaxed font-normal mb-10 max-w-md">
              A high-performance algorithmic tracer. Paste any problem and see every pointer move, every array mutate, and every hash map update—step by step.
            </p>

            <div className="w-full max-w-lg mb-8">
              <SearchBar />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[12px] text-white/20 font-mono mr-2">Try:</span>
              {quickLinks.map(s => (
                <button key={s} onClick={() => navigate(`/problem/${s.toLowerCase().replace(/ /g, '-')}`)}
                  className="group flex items-center gap-1.5 text-[12px] text-white/50 hover:text-amber-400 px-3 py-1.5 rounded-md border border-white/[0.04] hover:border-amber-500/30 hover:bg-amber-500/10 hover:shadow-[0_0_15px_rgba(245,158,11,0.1)] transition-all duration-300">
                  {s}
                  <MoveRight size={10} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Live Demo Visualizer */}
          <div className="relative w-full h-[500px] lg:h-[600px] xl:h-[700px] flex items-center justify-center">
            
            {/* Subtle structural grid lines behind demo */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute top-1/4 w-full h-px bg-white/[0.1]" />
              <div className="absolute top-3/4 w-full h-px bg-white/[0.1]" />
              <div className="absolute left-1/4 h-full w-px bg-white/[0.1]" />
              <div className="absolute left-3/4 h-full w-px bg-white/[0.1]" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="w-full h-[85%] relative z-10"
            >
              <HeroDemo />
            </motion.div>
            
            {/* Decorative structural elements */}
            <div className="absolute -top-4 -left-4 w-2 h-2 border-t border-l border-white/20" />
            <div className="absolute -top-4 -right-4 w-2 h-2 border-t border-r border-white/20" />
            <div className="absolute -bottom-4 -left-4 w-2 h-2 border-b border-l border-white/20" />
            <div className="absolute -bottom-4 -right-4 w-2 h-2 border-b border-r border-white/20" />
          </div>

        </div>
      </div>
    </div>

      {/* ── Brutalist Divider ─────────────────────────────────────────── */}
      <div className="w-full border-t-[2px] border-b-[2px] border-white/[0.15] bg-amber-500 py-3 overflow-hidden flex items-center relative z-10">
        <div className="whitespace-nowrap font-black font-mono text-[13px] text-black uppercase tracking-[0.2em] animate-[marquee_20s_linear_infinite]">
          {Array(20).fill('SYSTEM ARCHITECTURE // RUNTIME PIPELINE // TRACE ENGINE // ').join('')}
        </div>
      </div>

      {/* ── Features Grid ─────────────────────────────────────── */}
      <div className="w-full flex flex-col lg:flex-row border-b-[2px] border-white/[0.15] bg-[#0a0a0b] relative z-10">
        {FEATURES.map((f, i) => (
          <div key={i} className="group flex-1 flex flex-col border-b-[2px] lg:border-b-0 lg:border-r-[2px] border-white/[0.15] last:border-r-0 hover:bg-white transition-colors duration-150 cursor-crosshair relative overflow-hidden">
            
            {/* Massive Background Number */}
            <div className="absolute -bottom-16 -right-8 font-black text-[160px] text-white/[0.02] group-hover:text-black/[0.05] transition-colors duration-150 pointer-events-none leading-none select-none">
              {f.num}
            </div>
            
            <div className="p-10 xl:p-16 flex-1 flex flex-col z-10 relative">
              <div className="flex justify-between items-start mb-24">
                <span className="font-black font-mono text-2xl text-amber-500 group-hover:text-black transition-colors duration-150">
                  {f.num}
                </span>
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 border-[2px] border-white/[0.15] text-white/40 group-hover:border-black group-hover:text-black transition-colors duration-150">
                  {f.tag}
                </span>
              </div>
              
              <h3 className="text-white group-hover:text-black font-black text-3xl uppercase tracking-tighter mb-4 transition-colors duration-150">
                {f.title}
              </h3>
              <p className="text-white/40 group-hover:text-black/70 text-[15px] leading-relaxed transition-colors duration-150 font-medium max-w-sm">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── USP: Spatial Render Pipeline ──────────────────────────────────────── */}
      <div className="w-full border-t-[2px] border-white/[0.15] relative z-10 flex flex-col">
        <LandingBeforeAfter />
      </div>

      {/* ── Minimal Terminal CTA ──────────────────────────────────────── */}
      <div className="w-full bg-[#050505] relative z-10 flex flex-col items-center justify-center py-40 px-8 border-t-[2px] border-white/10">
        
        <div className="w-full max-w-4xl flex flex-col items-center">
          <div className="font-mono text-white/30 text-[12px] uppercase tracking-[0.3em] mb-12">
            // System ready for input
          </div>
          
          <div className="w-full group relative">
            <div className="absolute -inset-1 bg-amber-500 opacity-0 group-hover:opacity-20 focus-within:opacity-30 transition-opacity duration-500 blur-xl pointer-events-none" />
            <form 
              onSubmit={handleCtaSubmit}
              className="relative w-full border-[2px] border-white/20 bg-[#0a0a0b] flex flex-col md:flex-row items-center p-2 focus-within:border-amber-500 transition-colors"
            >
              <span className="hidden md:block font-mono font-bold text-amber-500 px-6 text-2xl animate-pulse">{'>'}</span>
              <input 
                type="text" 
                value={ctaQuery}
                onChange={(e) => setCtaQuery(e.target.value)}
                placeholder="PASTE ALGORITHM URL TO TRACE..." 
                className="w-full flex-1 bg-transparent text-white font-mono text-base md:text-2xl outline-none placeholder:text-white/20 uppercase tracking-widest p-6 md:py-6 text-center md:text-left"
              />
              <button 
                type="submit"
                disabled={!ctaQuery.trim()}
                className="w-full md:w-auto bg-white text-black font-black uppercase tracking-widest px-12 py-6 hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                EXECUTE
              </button>
            </form>
          </div>
          
          <p className="mt-8 font-mono text-white/20 text-[11px] text-center max-w-lg leading-relaxed uppercase tracking-wider">
            Supports exact LeetCode URLs or standard algorithmic problems. Instant sandboxed execution.
          </p>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="mt-auto">
        <div className="max-w-[1600px] mx-auto px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-white/20 text-[11px] font-mono">algotrace © {new Date().getFullYear()}</span>
          <div className="flex items-center gap-8">
            {[
              [problemCount, 'algorithms indexed'],
              ['∞', 'execution steps'],
            ].map(([n, l]) => (
              <div key={l} className="flex items-center gap-2">
                <span className="font-medium text-white/50 font-mono text-[11px]">{n}</span>
                <span className="text-white/20 text-[11px] font-mono uppercase">{l}</span>
              </div>
            ))}
          </div>
        </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
