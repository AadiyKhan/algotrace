import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { fetchProblems } from '../services/api';
import { ArrowRight } from 'lucide-react';

const DIFF_COLOR = { Easy: '#34d399', Medium: '#fbbf24', Hard: '#f87171' };
const TYPE_COLOR  = { array: '#f59e0b', tree: '#34d399', graph: '#60a5fa', matrix: '#a78bfa', 'linked-list': '#94a3b8' };
const TYPE_LABEL  = { array: 'ARR', tree: 'TREE', graph: 'GRAPH', matrix: 'MATRIX', 'linked-list': 'LIST' };

const BLIND_75_SLUGS = [
  "two-sum","best-time-to-buy-and-sell-stock","contains-duplicate","product-of-array-except-self",
  "maximum-subarray","maximum-product-subarray","find-minimum-in-rotated-sorted-array","search-in-rotated-sorted-array",
  "3sum","container-with-most-water","sum-of-two-integers","number-of-1-bits","counting-bits","missing-number",
  "reverse-bits","climbing-stairs","coin-change","longest-increasing-subsequence","longest-common-subsequence",
  "word-break","combination-sum","house-robber","house-robber-ii","decode-ways","unique-paths","jump-game",
  "clone-graph","course-schedule","pacific-atlantic-water-flow","number-of-islands","longest-consecutive-sequence",
  "alien-dictionary","graph-valid-tree","number-of-connected-components-in-an-undirected-graph","insert-interval",
  "merge-intervals","non-overlapping-intervals","meeting-rooms","meeting-rooms-ii","reverse-linked-list",
  "linked-list-cycle","merge-two-sorted-lists","merge-k-sorted-lists","remove-nth-node-from-end-of-list",
  "reorder-list","set-matrix-zeroes","spiral-matrix","rotate-image","word-search","longest-substring-without-repeating-characters",
  "longest-repeating-character-replacement","minimum-window-substring","valid-anagram","group-anagrams","valid-parentheses",
  "valid-palindrome","longest-palindromic-substring","palindromic-substrings","encode-and-decode-strings",
  "maximum-depth-of-binary-tree","same-tree","invert-binary-tree","binary-tree-maximum-path-sum","binary-tree-level-order-traversal",
  "serialize-and-deserialize-binary-tree","subtree-of-another-tree","construct-binary-tree-from-preorder-and-inorder-traversal",
  "validate-binary-search-tree","kth-smallest-element-in-a-bst","lowest-common-ancestor-of-a-bst","implement-trie-prefix-tree",
  "design-add-and-search-words-data-structure","word-search-ii","top-k-frequent-elements","find-median-from-data-stream"
];

const Gallery = () => {
  const [problems, setProblems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [listFilter, setListFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('DEFAULT');
  const [visibleCount, setVisibleCount] = useState(20);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProblems().then(setProblems).catch(console.error);
  }, []);

  const filteredProblems = problems
    .filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDifficulty = difficultyFilter === 'ALL' || p.difficulty?.toUpperCase() === difficultyFilter;
      const matchesType = typeFilter === 'ALL' || p.type === typeFilter;
      const matchesList = listFilter === 'ALL' || BLIND_75_SLUGS.includes(p.slug);
      return matchesSearch && matchesDifficulty && matchesType && matchesList;
    })
    .sort((a, b) => {
      if (sortBy === 'AZ') return a.title.localeCompare(b.title);
      if (sortBy === 'ZA') return b.title.localeCompare(a.title);
      if (sortBy === 'EASY') {
        const order = { Easy: 0, Medium: 1, Hard: 2 };
        return (order[a.difficulty] ?? 1) - (order[b.difficulty] ?? 1);
      }
      if (sortBy === 'HARD') {
        const order = { Easy: 0, Medium: 1, Hard: 2 };
        return (order[b.difficulty] ?? 1) - (order[a.difficulty] ?? 1);
      }
      return 0;
    });

  const visibleProblems = filteredProblems.slice(0, visibleCount);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0b] text-white selection:bg-amber-500/30">
      <Header />
      
      <div className="flex-1 w-full max-w-[1600px] mx-auto px-8 py-16">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">Algorithm Gallery</h1>
        <p className="text-white/40 mb-12 max-w-xl text-[15px] leading-relaxed">
          Explore our collection of traced algorithms. Every algorithm here has been executed and visualized step-by-step.
        </p>


        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-12 items-center">
          <input 
            type="text" 
            placeholder="SEARCH ALGORITHMS..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(20); }}
            className="w-full md:w-96 bg-transparent border-[2px] border-white/[0.15] px-4 py-3 font-mono text-[13px] uppercase text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500 transition-colors"
          />
          
          <div className="flex w-full md:w-auto border-[2px] border-white/[0.15]">
            <button
              onClick={() => { setListFilter(listFilter === 'ALL' ? 'BLIND 75' : 'ALL'); setVisibleCount(20); }}
              className={`flex-1 md:flex-none px-6 py-3 font-mono text-[12px] font-bold uppercase transition-colors border-r-[2px] border-white/[0.15] ${
                listFilter === 'BLIND 75' ? 'bg-amber-500 text-black' : 'text-white/40 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              BLIND 75
            </button>
          </div>
          
          <div className="flex w-full md:w-auto border-[2px] border-white/[0.15]">
            {['ALL', 'EASY', 'MEDIUM', 'HARD'].map(diff => (
              <button
                key={diff}
                onClick={() => { setDifficultyFilter(diff); setVisibleCount(20); }}
                className={`flex-1 md:flex-none px-6 py-3 font-mono text-[12px] font-bold uppercase transition-colors border-r-[2px] border-white/[0.15] last:border-0 ${
                  difficultyFilter === diff ? 'bg-white text-black' : 'text-white/40 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
          
          {/* Type filter */}
          <div className="flex w-full md:w-auto border-[2px] border-white/[0.15]">
            {['ALL', 'array', 'tree', 'graph', 'matrix', 'linked-list'].map(t => (
              <button
                key={t}
                onClick={() => { setTypeFilter(t); setVisibleCount(20); }}
                className={`flex-1 md:flex-none px-4 py-3 font-mono text-[11px] font-bold uppercase transition-colors border-r-[2px] border-white/[0.15] last:border-0`}
                style={typeFilter === t ? { background: TYPE_COLOR[t] || '#fff', color: '#000' } : { color: 'rgba(255,255,255,0.4)' }}
              >
                {TYPE_LABEL[t] || 'ALL'}
              </button>
            ))}
          </div>
          
          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => { setSortBy(e.target.value); setVisibleCount(20); }}
            className="bg-transparent border-[2px] border-white/[0.15] text-white/60 font-mono text-[12px] font-bold uppercase px-4 py-3 outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="DEFAULT">SORT: DEFAULT</option>
            <option value="AZ">SORT: A→Z</option>
            <option value="ZA">SORT: Z→A</option>
            <option value="EASY">SORT: EASY FIRST</option>
            <option value="HARD">SORT: HARD FIRST</option>
          </select>
          
          <div className="ml-auto font-mono text-[12px] text-white/40 uppercase hidden lg:block">
            SHOWING {visibleProblems.length} OF {filteredProblems.length}
          </div>
        </div>

        <div className="flex flex-col border-t-2 border-white/[0.15]">
          {visibleProblems.map((p) => (
            <div 
              key={p.slug}
              onClick={() => navigate(`/problem/${p.slug}`)}
              className="group flex flex-col md:flex-row md:items-center justify-between border-b-[2px] border-white/[0.15] py-8 cursor-pointer hover:bg-white/[0.02] transition-colors px-4 -mx-4"
            >
              <div className="flex-1 pr-8">
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-2 group-hover:text-amber-500 transition-colors">
                  {p.title}
                </h2>
                <p className="text-white/40 text-[14px] leading-relaxed line-clamp-1 max-w-3xl">
                  {p.description || 'No description provided.'}
                </p>
              </div>
              
              <div className="flex items-center gap-4 mt-4 md:mt-0 shrink-0">
                {/* Type badge */}
                {p.type && (
                  <span
                    className="font-mono text-[10px] uppercase font-bold px-2 py-1 border"
                    style={{ color: TYPE_COLOR[p.type] || 'rgba(255,255,255,0.4)', borderColor: (TYPE_COLOR[p.type] || '#555') + '40', background: (TYPE_COLOR[p.type] || '#555') + '12' }}
                  >
                    {TYPE_LABEL[p.type] || p.type}
                  </span>
                )}
                {/* Difficulty badge */}
                <span 
                  className="font-mono text-[11px] uppercase font-bold px-3 py-1.5 border-[2px]"
                  style={{ color: DIFF_COLOR[p.difficulty] || '#fff', borderColor: DIFF_COLOR[p.difficulty] || '#555' }}
                >
                  {p.difficulty}
                </span>
                
                <div className="hidden md:flex items-center text-white/20 group-hover:text-amber-500 transition-colors duration-300 w-8">
                  <ArrowRight size={24} strokeWidth={2.5} className="-translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </div>
            </div>
          ))}
          
          {filteredProblems.length === 0 && (
            <div className="py-20 text-center text-white/30 font-mono text-[14px] uppercase">
              No algorithms match your search criteria.
            </div>
          )}
        </div>

        {/* Pagination Load More */}
        {visibleCount < filteredProblems.length && (
          <div className="mt-12 flex justify-center border-t-2 border-white/[0.15] pt-12">
            <button 
              onClick={() => setVisibleCount(c => c + 20)}
              className="px-12 py-4 bg-transparent border-[2px] border-amber-500 text-amber-500 font-black font-mono text-[14px] hover:bg-amber-500 hover:text-black transition-colors uppercase tracking-widest"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
