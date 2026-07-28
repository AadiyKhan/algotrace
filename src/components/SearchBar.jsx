import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { searchProblems } from '../services/api';

const PLACEHOLDERS = [
  'Search "Two Sum"...',
  'Try "Reverse Linked List"...',
  'Search "Binary Search"...',
  'Paste a LeetCode URL...',
];

const DIFF_COLOR = { Easy: '#22c55e', Medium: '#f59e0b', Hard: '#ff0000' };

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
        <div className="flex" style={{ border: `1px solid ${isFocused ? '#ff0000' : '#2a0000'}`, transition: 'border-color 0.15s' }}>
          <div className="flex items-center pl-4 pr-3 flex-shrink-0">
            <Search size={16} style={{ color: isFocused ? '#ff0000' : '#6b5555' }} className="transition-colors duration-150" />
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
            className="flex-1 bg-transparent border-none outline-none text-white text-sm py-3.5 px-1 font-sans placeholder-textMuted/40"
            style={{ caretColor: '#ff0000' }}
          />
          <button type="submit" disabled={!query.trim()}
            aria-label="Trace problem"
            className="btn-primary flex items-center gap-2 px-5 text-sm disabled:opacity-30 disabled:cursor-not-allowed">
            <span>TRACE</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </form>

      {/* Dropdown */}
      {showDrop && results.length > 0 && (
        <div
          className="absolute z-50 w-full mt-px border border-borderDark overflow-hidden"
          style={{ background: '#110000' }}
          role="listbox"
          aria-label="Search results"
        >
          {results.map((p) => (
            <button
              key={p.slug}
              role="option"
              onMouseDown={() => navigateTo(p.slug)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[#1a0000] transition-colors border-b border-borderDark last:border-0"
            >
              <span className="font-sans text-sm text-white truncate">{p.title}</span>
              <span className="font-mono text-[10px] font-bold ml-3 shrink-0"
                style={{ color: DIFF_COLOR[p.difficulty] ?? '#6b5555' }}>
                {p.difficulty?.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
