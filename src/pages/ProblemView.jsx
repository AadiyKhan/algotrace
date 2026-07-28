import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw, SkipForward, SkipBack, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

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
  { label: '0.5×', value: 3000 },
  { label: '1×',   value: 2000 },
  { label: '2×',   value: 1000 },
  { label: '4×',   value: 500  },
];

const DIFF_COLOR = { Easy: '#9ca3af', Medium: '#3b82f6', Hard: 'url(#rainbow)' };

const ProblemView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problemData, setProblemData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [hasCompleted, setHasCompleted] = useState(false);

  const consoleRef = useRef(null);

  const { currentStep, totalSteps, isPlaying, playbackSpeed, setCurrentStep, setTotalSteps, setPlaybackSpeed, togglePlay, nextStep, prevStep, reset, seekToStep } = usePlayerStore();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchProblemData(id);
        setProblemData(data);
        setTotalSteps(data.steps.length);
        setHasCompleted(false);
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
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [currentStep]);

  useEffect(() => {
    if (totalSteps > 0 && currentStep === totalSteps - 1 && !hasCompleted) {
      setHasCompleted(true);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ff0000', '#00f0ff', '#ffffff']
      });
    }
  }, [currentStep, totalSteps, hasCompleted]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const data = await generateTraceData(id);
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
    if (e.target.tagName === 'INPUT') return;
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#0a0000' }}>
        <div style={{ width: 48, height: 48, border: '2px solid #ff0000', animation: 'spin 1s linear infinite' }}
          className="flex items-center justify-center">
          <Terminal size={16} color="#00f0ff" />
        </div>
        <p className="label" style={{ color: '#00f0ff' }}>cooking your trace 🍳...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!problemData) {
    const isNetworkError = loadError === 'network';
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: '#0a0000' }}>
        <button onClick={() => navigate('/')} className="absolute top-8 left-8 control-btn" aria-label="Back to home">
          <ArrowLeft size={15} />
        </button>
        <Terminal size={32} color="#ff0000" />
        <h2 className="text-white text-xl font-bold tracking-tight font-display">
          {isNetworkError ? 'server is sleeping 😴' : 'we don\'t got that one (yet)'}
        </h2>
        <p className="text-textMuted text-sm text-center max-w-md">
          {isNetworkError
            ? 'could not connect to the algotrace server. make sure it is running on port 3001.'
            : `"${id}" isn't in our local stash. let the ai cook it up for you dynamically.`
          }
        </p>
        {!isNetworkError && (
          <div className="w-full max-w-2xl px-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#00f0ff] font-display text-lg font-bold flex items-center gap-2">
                <Terminal size={18} /> INTERACTIVE AI DEBUGGER
              </h3>
              <div className="flex items-center gap-4">
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-[#1a0000] border border-borderDark text-white font-mono text-xs px-3 py-1.5 rounded focus:outline-none focus:border-[#00f0ff]"
                >
                  <option value="Auto">Auto (Pseudocode)</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="Python">Python</option>
                  <option value="Java">Java</option>
                  <option value="C++">C++</option>
                </select>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowEditor(!showEditor)} className="text-xs font-mono px-3 py-1.5 border border-borderDark rounded hover:bg-[#00f0ff]/10 text-white transition-colors">
                  {showEditor ? 'HIDE EDITOR' : 'WRITE CUSTOM CODE'}
                </motion.button>
              </div>
            </div>

            <AnimatePresence>
              {showEditor && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: 'spring', bounce: 0.3 }} className="overflow-hidden flex flex-col gap-4">
                  <textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    placeholder="paste your failing code here. the ai will trace exactly what happens step-by-step..."
                    className="w-full h-48 bg-[#0a0000] border border-[#2a0000] p-4 font-mono text-sm text-white resize-none focus:outline-none focus:border-[#00f0ff] rounded shadow-inner scrollbar-custom"
                  />
                  <div className="flex justify-end">
                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      onClick={handleGenerate} 
                      disabled={isGenerating}
                      className="px-6 py-2.5 bg-[#00f0ff] text-black font-mono font-bold text-xs rounded hover:bg-white transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {isGenerating ? <div className="animate-spin h-3 w-3 border-2 border-black rounded-full border-t-transparent" /> : <Play size={12} />}
                      {isGenerating ? 'ai is thinking rq...' : 'DEBUG THIS CODE'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        {generateError && <p className="font-mono text-xs text-[#ff4444] text-center">{generateError}</p>}
      </div>
    );
  }

  const stepData = problemData.steps[currentStep];
  const progress = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  const renderVisualizer = () => {
    switch (problemData.type) {
      case 'array':       return <ArrayVisualizer stepData={stepData} target={problemData.target} problemId={id} />;
      case 'linked-list': return <LinkedListVisualizer stepData={stepData} />;
      case 'matrix':      return <MatrixVisualizer stepData={stepData} />;
      case 'tree':        return <TreeVisualizer stepData={stepData} />;
      case 'graph':       return <GraphVisualizer stepData={stepData} />;
      default:            return <div className="label">UNKNOWN TYPE: {problemData.type}</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0000' }}>
      <div style={{ height: '1px', background: '#ff0000', boxShadow: '0 0 40px 4px rgba(255,0,0,0.3)' }} />
      <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex items-center justify-between px-8 py-4 border-b border-borderDark">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="control-btn" aria-label="Back to home">
            <ArrowLeft size={15} />
          </button>
          <div className="flex items-center gap-2 label">
            <Terminal size={11} />
            <span>ALGOTRACE</span>
            <span className="text-borderLight">/</span>
          </div>
          <h1 className="font-bold text-white text-sm tracking-tight font-display">{problemData.title}</h1>
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 border"
            style={{ 
              color: DIFF_COLOR[problemData.difficulty] || '#9ca3af', 
              borderColor: DIFF_COLOR[problemData.difficulty] || '#9ca3af'
            }}>
            {problemData.difficulty.toUpperCase()}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-32 h-1.5 rounded-full overflow-hidden" style={{ background: '#2a0000' }}>
              <motion.div className="h-full" style={{ background: hasCompleted ? '#00f0ff' : '#ff0000' }}
                animate={{ width: `${progress}%` }} transition={{ type: 'spring', bounce: 0.4 }} />
            </div>
            <span className="font-mono text-[10px] text-textMuted font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="flex items-center gap-2 label" aria-label="Keyboard shortcuts">
            {[['←', 'Previous step'], ['→', 'Next step'], ['SPC', 'Play / Pause']].map(([k, hint]) => (
              <kbd key={k} title={hint} className="font-mono text-[10px] px-1.5 py-0.5 border border-borderDark text-textMuted cursor-help">{k}</kbd>
            ))}
          </div>
        </div>
      </motion.header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-px" style={{ background: '#2a0000', minHeight: 0 }}>
        <div className="lg:col-span-8 flex flex-col gap-px" style={{ background: '#2a0000' }}>
          <div className="mb-10 p-6 rounded-xl border border-borderDark shadow-lg" style={{ background: 'linear-gradient(145deg, #160000, #0a0000)' }}>
            <h3 className="text-[#ff4444] font-mono font-bold mb-4 flex items-center gap-2">
              <Terminal size={18} /> PROBLEM DESCRIPTION
            </h3>
            <div className="max-h-64 overflow-y-auto pr-4 scrollbar-custom">
              <p className="text-[15px] leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                {(problemData.description || 'No description available.').split('\n').map((line, i) => (
                  <span key={i}>{line}<br/></span>
                ))}
              </p>
            </div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="flex flex-col flex-1" style={{ background: '#0a0000' }}>
            <div className="flex items-center justify-between px-8 py-4 border-b border-borderDark">
              <div className="flex items-center gap-4">
                <p className="label">VISUALIZER</p>
              </div>
              <div className="flex items-center gap-1">
                {SPEED_PRESETS.map(({ label, value }) => (
                  <button key={value} onClick={() => setPlaybackSpeed(value)}
                    className={`speed-chip ${playbackSpeed === value ? 'speed-chip-active' : 'speed-chip-inactive'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 flex justify-center items-center py-10 px-8 min-h-[380px] relative">
              <AnimatePresence mode="wait">
                <motion.div key={currentStep}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={{ type: 'spring', bounce: 0.4 }} className="w-full h-full">
                  <ErrorBoundary>
                    {renderVisualizer()}
                  </ErrorBoundary>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mx-8 mb-6 border border-borderDark rounded-lg flex flex-col shadow-inner" style={{ background: '#110000', height: '180px' }}>
              <div className="px-4 py-2 border-b border-borderDark bg-[#0a0000] flex justify-between items-center rounded-t-lg">
                <span className="label flex items-center gap-2"><Terminal size={12}/> EXECUTION LOG</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 scrollbar-custom flex flex-col gap-1.5" ref={consoleRef}>
                {problemData.steps.slice(0, currentStep + 1).map((step, idx) => {
                  const isActive = idx === currentStep;
                  return (
                    <div key={idx} className={`flex items-start gap-3 p-2 rounded-md transition-colors ${isActive ? 'bg-[rgba(255,0,0,0.15)] border border-[rgba(255,0,0,0.3)] shadow-[0_0_10px_rgba(255,0,0,0.1)]' : 'border border-transparent'}`}>
                      <span className="font-mono text-[10px] mt-0.5 shrink-0" style={{ color: isActive ? '#ff4444' : '#6b5555' }}>
                        [{String(idx).padStart(2, '0')}]
                      </span>
                      <p className={`text-sm leading-relaxed ${isActive ? 'text-white font-medium' : 'text-[#888]'}`}>
                        {step.note}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-8 pb-8 flex flex-col gap-5 border-t border-borderDark pt-6 bg-[#0a0000]">
              <div className="flex flex-col gap-2 w-full">
                <div className="flex justify-between items-end mb-1">
                  <span className="font-display font-bold text-2xl tracking-tighter" style={{ color: hasCompleted ? '#00f0ff' : '#ff4444' }}>
                    STEP {String(currentStep).padStart(2, '0')}
                  </span>
                </div>
                <div className="relative h-2 w-full bg-[#2a0000] rounded-full overflow-hidden">
                  <motion.div className="absolute top-0 left-0 h-full rounded-full"
                    style={{ background: hasCompleted ? '#00f0ff' : '#ff0000' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0}%` }}
                    transition={{ type: 'spring', bounce: 0.4 }}
                  />
                  <input type="range" min="0" max={totalSteps - 1} value={currentStep}
                    onChange={e => seekToStep(parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              </div>

              <div className="flex items-center justify-center gap-2">
                <motion.button whileTap={{ scale: 0.9 }} className="control-btn" onClick={() => setCurrentStep(0)} disabled={currentStep === 0} aria-label="Reset to first step">
                  <RotateCcw size={13} />
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }} className="control-btn" onClick={prevStep} disabled={currentStep === 0} aria-label="Previous step">
                  <SkipBack size={13} />
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={togglePlay}
                  className="flex items-center justify-center transition-all duration-200 rounded-lg"
                  style={{
                    width: 44, height: 44,
                    background: isPlaying ? '#00f0ff' : 'white',
                    color: '#000',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: isPlaying ? '0 0 24px rgba(0,240,255,0.5)' : 'none',
                  }}>
                  {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: 2 }} />}
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }} className="control-btn" onClick={nextStep} disabled={currentStep === totalSteps - 1} aria-label="Next step">
                  <SkipForward size={13} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="lg:col-span-4 flex flex-col" style={{ background: '#0a0000' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-borderDark flex-shrink-0">
            <p className="label">PSEUDOCODE</p>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5" style={{ background: 'rgba(255,0,0,0.5)' }} />
              <div className="w-2.5 h-2.5" style={{ background: 'rgba(255,255,255,0.15)' }} />
              <div className="w-2.5 h-2.5" style={{ background: 'rgba(255,255,255,0.05)' }} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            <PseudocodeBlock code={problemData.pseudocode} activeLine={stepData.codeLine} />
          </div>
        </motion.div>

      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
};

export default ProblemView;
