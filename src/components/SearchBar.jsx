import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchProblems } from '../services/api';

const PLACEHOLDERS = [
  'SEARCH "TWO SUM"...',
  'TRY "REVERSE LINKED LIST"...',
  'SEARCH "BINARY SEARCH"...',
  'PASTE A LEETCODE URL...',
];

const DIFF_DOT = { Easy: '#22c55e', Medium: '#f59e0b', Hard: '#ef4444' };

const SearchBar = () => {
  const [query, setQuery]       = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [phIdx, setPhIdx]       = useState(0);
  const [results, setResults]   = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const debounceRef             = useRef(null);
  const wrapperRef              = useRef(null);
  const navigate                = useNavigate();

  // Rotate placeholder when not focused
  useEffect(() => {
    if (isFocused) return;
    const t = setInterval(() => setPhIdx(i => (i + 1) % PLACEHOLDERS.length), 2800);
    return () => clearInterval(t);
  }, [isFocused]);

  // Debounced API search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); setShowDrop(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchProblems(query.trim());
        setResults(data.slice(0, 8));
        setShowDrop(true);
      } catch { setResults([]); }
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowDrop(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navigateTo = (slug) => {
    setShowDrop(false);
    setQuery('');
    navigate(`/problem/${slug}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    
    const lcMatch = trimmed.match(/leetcode\.com\/problems\/([^/]+)/i);
    if (lcMatch && lcMatch[1]) {
      navigateTo(lcMatch[1]);
      return;
    }
    
    if (results.length > 0) { navigateTo(results[0].slug); return; }
    const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    navigateTo(slug);
  };

  return (
    <div ref={wrapperRef} className="w-full relative">
      <form onSubmit={handleSubmit}>
        <div className={`flex flex-col md:flex-row items-center bg-[#0a0a0b] border-[2px] transition-colors duration-300 ${
          isFocused ? 'border-amber-500' : 'border-white/20'
        }`}>
          <div className="hidden md:flex items-center pl-6 pr-4 flex-shrink-0">
            <span className={`font-mono font-bold text-xl ${isFocused ? 'text-amber-500 animate-pulse' : 'text-white/20'}`}>{'>'}</span>
          </div>
          <input
            type="text"
            placeholder={PLACEHOLDERS[phIdx]}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => { setIsFocused(true); if (results.length > 0) setShowDrop(true); }}
            onBlur={() => setIsFocused(false)}
            aria-label="Search problems"
            aria-autocomplete="list"
            aria-expanded={showDrop}
            className="w-full flex-1 bg-transparent border-none outline-none text-white font-mono text-base py-4 md:py-5 px-4 md:px-0 placeholder:text-white/20 uppercase tracking-widest text-center md:text-left"
          />
          <button type="submit" disabled={!query.trim()}
            aria-label="Trace problem"
            className="w-full md:w-auto bg-white text-black font-black uppercase tracking-widest px-8 py-5 md:py-0 md:h-[60px] hover:bg-amber-500 transition-colors disabled:opacity-20 disabled:cursor-not-allowed">
            EXECUTE
          </button>
        </div>
      </form>

      {/* Dropdown */}
      <AnimatePresence>
        {showDrop && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 border-[2px] border-amber-500/50 overflow-hidden bg-[#0a0a0b] shadow-[0_0_30px_rgba(245,158,11,0.15)]"
            role="listbox"
            aria-label="Search results"
          >
            {results.map((p, i) => (
              <button
                key={p.slug}
                role="option"
                onMouseDown={() => navigateTo(p.slug)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-amber-500 hover:text-black transition-colors duration-150 border-b-[2px] border-white/10 last:border-0 group/item"
              >
                <span className="font-mono font-bold text-[13px] uppercase tracking-wider text-white group-hover/item:text-black truncate">{p.title}</span>
                <div className="flex items-center gap-3 ml-3 shrink-0">
                  <div className="w-2 h-2" style={{ background: DIFF_DOT[p.difficulty] ?? '#555' }} />
                  <span className="font-mono font-bold text-[11px] uppercase tracking-widest text-white/40 group-hover/item:text-black/60">
                    {p.difficulty}
                  </span>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
