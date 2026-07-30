import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, ArrowLeft, Terminal, Clock, HardDrive } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';

import usePlayerStore from '../store/usePlayerStore';
import { fetchProblemData, generateTraceData } from '../services/api';
import ArrayVisualizer from '../components/visualizers/ArrayVisualizer';
import LinkedListVisualizer from '../components/visualizers/LinkedListVisualizer';
import MatrixVisualizer from '../components/visualizers/MatrixVisualizer';
import TreeVisualizer from '../components/visualizers/TreeVisualizer';
import GraphVisualizer from '../components/visualizers/GraphVisualizer';
import PseudocodeBlock from '../components/PseudocodeBlock';
import ErrorBoundary from '../components/ErrorBoundary';

const SPEED_PRESETS = [
  { label: '0.5x', value: 3000 },
  { label: '1x',   value: 2000 },
  { label: '2x',   value: 1000 },
  { label: '4x',   value: 500  },
];

const DIFF_COLOR = { Easy: '#22c55e', Medium: '#f59e0b', Hard: '#ef4444' };
const DIFF_BG    = { Easy: 'rgba(34,197,94,0.12)', Medium: 'rgba(245,158,11,0.12)', Hard: 'rgba(239,68,68,0.12)' };

const extractComplexity = (desc, type) => {
  if (!desc) return null;
  const lowerDesc = desc.toLowerCase();
  if (type === 'time') {
    const match = desc.match(/O\([^\)]+\)\s*time/i) || desc.match(/time complexity:?\s*(O\([^\)]+\))/i);
    if (match) return match[1] || match[0].split(' ')[0];
    if (lowerDesc.includes('o(log n) time')) return 'O(log N)';
    if (lowerDesc.includes('o(n) time')) return 'O(N)';
    if (lowerDesc.includes('o(n^2) time')) return 'O(N²)';
  } else if (type === 'space') {
    const match = desc.match(/O\([^\)]+\)\s*space/i) || desc.match(/space complexity:?\s*(O\([^\)]+\))/i);
    if (match) return match[1] || match[0].split(' ')[0];
    if (lowerDesc.includes('o(1) space')) return 'O(1)';
    if (lowerDesc.includes('o(n) space')) return 'O(N)';
  }
  return null;
};

const ResizeHandle = ({ direction = 'horizontal' }) => (
  <PanelResizeHandle className={`group flex items-center justify-center outline-none ${direction === 'horizontal' ? 'w-2 h-full cursor-col-resize' : 'h-2 w-full cursor-row-resize'}`}>
    <div className={`transition-colors duration-150 bg-white/10 group-hover:bg-amber-500 group-active:bg-amber-500 ${direction === 'horizontal' ? 'w-[2px] h-full' : 'h-[2px] w-full'}`} />
  </PanelResizeHandle>
);


/* ── Description renderer: handles both scraped HTML and plain-text descriptions ── */
const isHtml = (str) => /<[a-zA-Z]/.test(str);

const plainTextToHtml = (text) => {
  // Split into paragraphs on double newlines first, then single newlines
  const lines = text.split('\n');
  let html = '';
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (inList) { html += '</ul>'; inList = false; }
      continue;
    }
    // Example header
    if (/^Example\s*\d*:?$/i.test(line) || /^Input:/i.test(line) && i > 0 && /^Example/i.test(lines[i-1]?.trim())) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<p class="example-header">${line}</p>`;
    }
    // Constraints header
    else if (/^Constraints:?$/i.test(line) || /^Note:?$/i.test(line)) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<p class="section-header">${line}</p>`;
    }
    // Bullet / constraint item
    else if (/^[-•*]/.test(line) || /^\d+\s*<=/.test(line) || /^\d+\s*</.test(line)) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${line.replace(/^[-•*]\s*/, '')}</li>`;
    }
    // Input / Output / Explanation lines
    else if (/^(Input|Output|Explanation):/i.test(line)) {
      if (inList) { html += '</ul>'; inList = false; }
      const [label, ...rest] = line.split(':');
      html += `<p><span class="io-label">${label}:</span> <code>${rest.join(':').trim()}</code></p>`;
    }
    // Regular paragraph
    else {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<p>${line}</p>`;
    }
  }
  if (inList) html += '</ul>';
  return html;
};

const DescriptionRenderer = ({ content }) => {
  const html = isHtml(content) ? content : plainTextToHtml(content);
  return (
    <div
      className="problem-desc prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

const ProblemView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problemData, setProblemData]     = useState(null);
  const [isLoading, setIsLoading]         = useState(true);
  const [isGenerating, setIsGenerating]   = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [loadError, setLoadError]         = useState(null);
  const [hasCompleted, setHasCompleted]   = useState(false);
  const [language, setLanguage]           = useState('Auto');
  const [showEditor, setShowEditor]       = useState(false);
  const [userCode, setUserCode]           = useState('');

  const consoleRef = useRef(null);

  const {
    currentStep, totalSteps, isPlaying, playbackSpeed,
    setCurrentStep, setTotalSteps, setPlaybackSpeed,
    togglePlay, nextStep, prevStep, reset, seekToStep,
  } = usePlayerStore();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      setProblemData(null);
      try {
        const data = await fetchProblemData(id);
        if (!data.steps || data.steps.length === 0) {
          setLoadError('not-found');
        } else {
          setProblemData(data);
          setTotalSteps(data.steps.length);
          setHasCompleted(false);
        }
      } catch (err) {
        setProblemData(null);
        setLoadError(err.status === 404 ? 'not-found' : 'network');
      }
      setIsLoading(false);
    };
    load();
    return () => reset();
  }, [id, setTotalSteps, reset]);

  useEffect(() => {
    if (consoleRef.current) {
      const activeEl = consoleRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentStep]);

  useEffect(() => {
    if (problemData?.title) {
      document.title = `${problemData.title} — AlgoTrace`;
      return () => { document.title = 'AlgoTrace'; };
    }
  }, [problemData?.title]);

  useEffect(() => {
    if (totalSteps > 0 && currentStep === totalSteps - 1 && !hasCompleted) {
      setHasCompleted(true);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#f59e0b', '#fbbf24', '#ffffff', '#fff7ed'] });
    }
  }, [currentStep, totalSteps, hasCompleted]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const data = await generateTraceData(id, userCode || null, language);
      setProblemData(data);
      setTotalSteps(data.steps.length);
      setCurrentStep(0);
      setHasCompleted(false);
    } catch (err) {
      setGenerateError(err.message);
    }
    setIsGenerating(false);
  };

  const handleKey = useCallback((e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowRight') nextStep();
    if (e.key === 'ArrowLeft')  prevStep();
    if (e.key === ' ') { e.preventDefault(); togglePlay(); }
    if (e.key === 'r' || e.key === 'R') setCurrentStep(0);
  }, [nextStep, prevStep, togglePlay, setCurrentStep]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  useEffect(() => {
    let t;
    if (isPlaying && currentStep < totalSteps - 1) {
      t = setInterval(nextStep, playbackSpeed);
    } else if (currentStep >= totalSteps - 1 && isPlaying) {
      togglePlay();
    }
    return () => clearInterval(t);
  }, [isPlaying, currentStep, totalSteps, playbackSpeed, nextStep, togglePlay]);

  if (isLoading) {
    return (
      <div className="h-screen bg-[#0a0a0b] flex flex-col items-center justify-center gap-5">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-lg bg-white/[0.04] animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-[1.5px] border-white/10 border-t-white/50 rounded-full animate-spin" />
          </div>
        </div>
        <p className="text-white/30 text-[13px] font-mono">Loading trace...</p>
      </div>
    );
  }

  if (!problemData) {
    const isNetworkError = loadError === 'network';
    return (
      <div className="h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-8 relative">
        <button onClick={() => navigate('/')} className="absolute top-8 left-8 p-3 border-[2px] border-white/20 hover:border-amber-500 hover:text-amber-500 text-white/50 transition-colors uppercase font-mono text-[12px] font-bold tracking-widest flex items-center gap-2" aria-label="Back to home">
          <ArrowLeft size={16} /> ABORT
        </button>
        
        <div className="border-[2px] border-white/20 bg-[#050505] p-8 md:p-12 flex flex-col max-w-2xl w-full">
          <div className="flex items-center gap-4 mb-8">
            <Terminal size={36} className="text-amber-500 animate-pulse" />
            <h2 className="text-white text-3xl font-black uppercase tracking-widest">
              {isNetworkError ? 'SERVER_TIMEOUT' : 'TRACE_NOT_FOUND'}
            </h2>
          </div>
          <p className="text-white/40 font-mono text-sm mb-8 leading-loose uppercase tracking-wider">
            {isNetworkError
              ? 'FATAL: Connection refused. Ensure algotrace backend is running on port 3001.'
              : `FATAL: Target "${id}" not found in local registry. Falling back to dynamic AI generation.`}
          </p>
          
          {!isNetworkError && (
            <div className="w-full border-t-[2px] border-white/20 pt-8 mt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-amber-500 font-mono text-[11px] font-bold tracking-widest uppercase flex items-center gap-2">
                  <Terminal size={14} /> AI GENERATOR OVERRIDE
                </h3>
                <div className="flex items-center gap-3">
                  <select value={language} onChange={(e) => setLanguage(e.target.value)}
                    className="bg-[#050505] border-[2px] border-white/20 text-white font-mono text-[11px] font-bold uppercase tracking-widest px-3 py-2 outline-none focus:border-amber-500">
                    <option value="Auto">AUTO_LANG</option>
                    <option value="JavaScript">JS</option>
                    <option value="Python">PY</option>
                    <option value="Java">JAVA</option>
                    <option value="C++">C++</option>
                  </select>
                  <button onClick={() => setShowEditor(!showEditor)}
                    className="text-[11px] font-mono font-bold tracking-widest uppercase px-4 py-2 border-[2px] border-white/20 text-white hover:border-amber-500 hover:text-amber-500 transition-colors shrink-0">
                    {showEditor ? 'HIDE_INPUT' : 'CUSTOM_CODE'}
                  </button>
                </div>
              </div>
              <AnimatePresence>
                {showEditor && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden flex flex-col gap-4">
                    <textarea value={userCode} onChange={(e) => setUserCode(e.target.value)}
                      placeholder="PASTE ALGORITHM SOURCE CODE..."
                      className="w-full h-40 bg-[#0a0a0b] border-[2px] border-white/20 p-4 font-mono text-[12px] text-white resize-none outline-none focus:border-amber-500 transition-colors uppercase tracking-widest" />
                    <div className="flex justify-end">
                      <button onClick={handleGenerate} disabled={isGenerating}
                        className="px-8 py-3 bg-white text-black font-black font-mono text-[12px] tracking-widest uppercase flex items-center gap-2 hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {isGenerating ? <div className="w-3 h-3 border-[2px] border-black/30 border-t-black rounded-full animate-spin" /> : <Play size={12} className="fill-black" />}
                        {isGenerating ? 'GENERATING...' : 'EXECUTE'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          {generateError && <p className="font-mono text-xs text-amber-500 mt-4 font-bold tracking-widest uppercase">ERR: {generateError}</p>}
        </div>
      </div>
    );
  }

  const stepData = problemData.steps[currentStep] || problemData.steps[0] || {};
  const progress = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  const renderVisualizer = () => {
    switch (problemData.type) {
      case 'array':       return <ArrayVisualizer stepData={stepData} target={problemData.target} problemId={id} allSteps={problemData.steps} currentStep={currentStep} />;
      case 'linked-list': return <LinkedListVisualizer stepData={stepData} />;
      case 'matrix':      return <MatrixVisualizer stepData={stepData} />;
      case 'tree':        return <TreeVisualizer stepData={stepData} />;
      case 'graph':       return <GraphVisualizer stepData={stepData} />;
      default:            return <div className="text-zinc-500 font-mono text-xs uppercase tracking-widest">UNKNOWN TYPE: {problemData.type}</div>;
    }
  };

  const parseLogNote = (note, isActive) => {
    if (!note) return 'EXECUTING...';
    const regex = /('([^']+)')|(\b\d+(\.\d+)?\b)|(\b(true|false|null)\b)/gi;
    
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(note)) !== null) {
      if (match.index > lastIndex) {
        parts.push(note.substring(lastIndex, match.index));
      }
      
      const isString = !!match[1];
      const isNumber = !!match[3];
      const isBool = !!match[5];

      let colorClass = 'text-white/40';
      if (isActive) {
        if (isString || isNumber || isBool) colorClass = 'text-amber-500 font-bold';
      }

      const content = isString ? match[2] : (match[3] || match[5]);
      
      parts.push(
        <kbd key={match.index} className={`px-1 rounded-sm text-[11px] mx-0.5 ${colorClass}`}>
          {content}
        </kbd>
      );
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < note.length) parts.push(note.substring(lastIndex));
    return parts;
  };

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0b] text-white/90 p-4 pb-0 overflow-hidden">
      <header className="border-[2px] border-white/20 bg-[#050505] px-5 h-16 flex items-center justify-between shrink-0 mb-4">
        <div className="flex items-center gap-4 min-w-0">
          <button onClick={() => navigate('/gallery')} className="p-2 border-[2px] border-white/20 hover:border-amber-500 hover:text-amber-500 text-white/50 transition-colors" aria-label="Back to gallery" title="Back to Gallery">
            <ArrowLeft size={16} />
          </button>
          <span className="text-white/20 font-mono text-[12px] font-bold uppercase tracking-widest shrink-0">algotrace</span>
          <span className="text-white/10">/</span>
          <h1 className="font-black text-[14px] uppercase tracking-widest truncate text-white/90">
            {problemData.title}
          </h1>
          <div className="flex items-center gap-2 ml-4 shrink-0">
            <div className="w-2 h-2" style={{ background: DIFF_COLOR[problemData.difficulty] ?? '#555' }} />
            <span className="text-[11px] text-white/50 font-mono font-bold tracking-widest uppercase">{problemData.difficulty}</span>
          </div>

          {(problemData.timeComplexity || extractComplexity(problemData.description, 'time')) && (
            <span className="font-mono text-[11px] font-bold tracking-widest uppercase px-3 py-1 border-[2px] border-white/20 shrink-0 bg-[#0a0a0b] text-white/50 flex items-center gap-2 ml-4">
              <Clock size={12} className="text-amber-500" />
              {problemData.timeComplexity || extractComplexity(problemData.description, 'time')}
            </span>
          )}
          {(problemData.spaceComplexity || extractComplexity(problemData.description, 'space')) && (
            <span className="font-mono text-[11px] font-bold tracking-widest uppercase px-3 py-1 border-[2px] border-white/20 shrink-0 bg-[#0a0a0b] text-white/50 flex items-center gap-2">
              <HardDrive size={12} className="text-amber-500" />
              {problemData.spaceComplexity || extractComplexity(problemData.description, 'space')}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1.5" title="Keyboard shortcuts: Arrow keys step, Space play/pause, R restart">
            {[['←','Prev Step'],['→','Next Step'],['⎵','Play/Pause'],['R','Restart']].map(([k,h]) => (
              <kbd key={k} title={h} className="font-mono text-[10px] px-1.5 py-0.5 rounded-md border border-white/[0.08] text-white/30 bg-white/[0.03] cursor-help hover:border-white/20 hover:text-white/50 transition-colors">{k}</kbd>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 pb-2">
        <PanelGroup direction="horizontal" orientation="horizontal">
          
          <Panel defaultSize={65} minSize={30}>
            <div className="w-full h-full flex flex-col min-w-0 pr-1">
              <PanelGroup direction="vertical" orientation="vertical">
                
                <Panel defaultSize={75} minSize={20}>
                  <div className="w-full h-full relative border-[2px] border-white/20 bg-[#0a0a0b] flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-6 h-12 border-b-[2px] border-white/20 shrink-0 bg-[#050505]">
                      <span className="text-[11px] text-white/50 font-mono font-bold tracking-widest uppercase">Visualizer</span>
                      <div className="flex gap-2">
                        {SPEED_PRESETS.map(({ label, value }) => (
                          <button key={value} onClick={() => setPlaybackSpeed(value)}
                            className={`font-mono font-bold tracking-widest uppercase text-[10px] px-3 py-1 border-[2px] transition-colors duration-150 ${
                              playbackSpeed === value 
                                ? 'border-amber-500 text-amber-500 bg-amber-500/10' 
                                : 'border-white/20 text-white/30 hover:border-white/40'
                            }`}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex-1 flex p-4 overflow-y-auto min-h-0">
                      <div className="m-auto w-full flex items-center justify-center">
                        <ErrorBoundary>{renderVisualizer()}</ErrorBoundary>
                      </div>
                    </div>

                    <div className="h-14 border-t-[2px] border-white/20 shrink-0 flex flex-col justify-end relative bg-[#050505]">
                      <div className="absolute top-0 left-0 w-full h-[4px] bg-[#0a0a0b] group cursor-pointer">
                        <motion.div 
                          className="absolute top-0 left-0 h-full bg-amber-500 group-hover:bg-amber-400 transition-colors" 
                          animate={{ width: `${progress}%` }} 
                          transition={{ type: 'tween', ease: 'linear', duration: 0.1 }} 
                        />
                        <input type="range" min="0" max={totalSteps - 1} value={currentStep}
                          onChange={e => seekToStep(parseInt(e.target.value))}
                          className="absolute inset-0 w-full h-[14px] -translate-y-[5px] opacity-0 cursor-pointer z-10" />
                      </div>

                      <div className="flex items-center justify-between px-4 h-full w-full">
                        <div className="flex items-center gap-2 w-24">
                          <span className="font-mono text-[10px] text-white/25">{String(currentStep + 1).padStart(2, '0')} <span className="text-white/10">/</span> {String(totalSteps).padStart(2, '0')}</span>
                        </div>

                        <div className="flex items-center gap-5">
                          <button onClick={() => setCurrentStep(0)} disabled={currentStep === 0} className="text-white/20 hover:text-white/60 disabled:opacity-20 transition-colors duration-200">
                            <RotateCcw size={13} />
                          </button>
                          <button onClick={prevStep} disabled={currentStep === 0} className="text-white/25 hover:text-white/60 disabled:opacity-20 transition-colors duration-200">
                            <SkipBack size={14} />
                          </button>
                          
                          <button onClick={togglePlay} className="text-white/50 hover:text-white transition-colors duration-200">
                            {isPlaying ? <Pause size={14} /> : <Play size={15} className="ml-0.5" />}
                          </button>
                          
                          <button onClick={nextStep} disabled={currentStep === totalSteps - 1} className="text-white/25 hover:text-white/60 disabled:opacity-20 transition-colors duration-200">
                            <SkipForward size={14} />
                          </button>
                        </div>

                        <div className="w-24 flex justify-end"></div>
                      </div>
                    </div>
                  </div>
                </Panel>

                <ResizeHandle direction="vertical" />

                <Panel defaultSize={25} minSize={10}>
                  <div className="w-full h-full border-[2px] border-white/20 bg-[#050505] flex flex-col overflow-hidden">
                    <div className="flex items-center gap-3 px-6 h-12 border-b-[2px] border-white/20 shrink-0">
                      <Terminal size={14} className="text-white/25" />
                      <span className="text-[11px] text-white/50 font-mono font-bold tracking-widest uppercase">EXECUTION_LOG</span>
                    </div>
                    <div ref={consoleRef} className="flex-1 overflow-y-auto p-4 flex flex-col">
                        {problemData.steps.slice(0, currentStep + 1).map((step, idx) => {
                          const isActive = idx === currentStep;
                          return (
                            <div key={idx} data-active={isActive}
                              className={`flex items-start gap-4 px-4 py-3 transition-colors duration-150 ${
                                isActive ? 'bg-white/5 border-l-[4px] border-amber-500 my-1' : 'hover:bg-white/[0.02] border-l-[4px] border-transparent'
                              }`}>
                              <div className="flex flex-col items-start shrink-0 gap-0.5">
                                <span className={`font-mono text-[11px] font-bold ${isActive ? 'text-amber-500' : 'text-white/20'}`}>
                                  [{String(idx + 1).padStart(2,'0')}/{String(totalSteps).padStart(2,'0')}]
                                </span>
                                {step.codeLine && (
                                  <span className={`font-mono text-[9px] uppercase tracking-widest ${isActive ? 'text-amber-500/50' : 'text-white/10'}`}>L{step.codeLine}</span>
                                )}
                              </div>
                              <p className={`text-[13px] leading-relaxed ${isActive ? 'text-white/80' : 'text-white/30'}`}>
                                {parseLogNote(step.note, isActive)}
                              </p>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </Panel>
              </PanelGroup>
            </div>
          </Panel>

          <ResizeHandle direction="horizontal" />

          {/* RIGHT COLUMN: Problem + Pseudocode */}
          <Panel defaultSize={35} minSize={20}>
            <div className="w-full h-full flex flex-col min-w-0 pl-1">
              <PanelGroup direction="vertical" orientation="vertical">
                
                {/* Problem Description Panel */}
                <Panel defaultSize={35} minSize={15}>
                  <div className="w-full h-full border-[2px] border-white/20 bg-[#050505] flex flex-col overflow-hidden">
                    <div className="flex items-center gap-2 px-6 h-12 border-b-[2px] border-white/20 shrink-0">
                      <span className="text-[11px] text-white/50 font-mono font-bold tracking-widest uppercase">PROBLEM_DESC</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                      <DescriptionRenderer content={problemData.fullDescription || problemData.description || 'No description available.'} />
                    </div>
                  </div>
                </Panel>

                <ResizeHandle direction="vertical" />

                {/* Pseudocode Panel */}
                <Panel defaultSize={65} minSize={20}>
                  <div className="w-full h-full border-[2px] border-white/20 bg-[#0a0a0b] flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-6 h-12 border-b-[2px] border-white/20 shrink-0 bg-[#050505]">
                      <span className="text-[11px] text-white/50 font-mono font-bold tracking-widest uppercase">SOURCE_CODE</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 min-h-0">
                      <PseudocodeBlock code={problemData.pseudocode || ''} activeLine={stepData?.codeLine} />
                    </div>
                  </div>
                </Panel>

              </PanelGroup>
            </div>
          </Panel>

        </PanelGroup>
      </div>
    </div>
  );
};

export default ProblemView;
