import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw, SkipForward, SkipBack, Terminal, ChevronDown, ChevronUp } from 'lucide-react';
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
  { label: '0.5x', value: 3000 },
  { label: '1x',   value: 2000 },
  { label: '2x',   value: 1000 },
  { label: '4x',   value: 500  },
];

const DIFF_COLOR = { Easy: '#22c55e', Medium: '#f59e0b', Hard: '#ff4444' };
const DIFF_BG    = { Easy: 'rgba(34,197,94,0.12)', Medium: 'rgba(245,158,11,0.12)', Hard: 'rgba(255,68,68,0.12)' };

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
  const [descOpen, setDescOpen]           = useState(false);

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
    if (consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
  }, [currentStep]);

  useEffect(() => {
    if (totalSteps > 0 && currentStep === totalSteps - 1 && !hasCompleted) {
      setHasCompleted(true);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#ff0000', '#00f0ff', '#ffffff'] });
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
      <div style={{ height: '100dvh', background: '#0a0000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ width: 48, height: 48, border: '2px solid #ff0000', animation: 'spin 1s linear infinite', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Terminal size={16} color="#00f0ff" />
        </div>
        <p className="label" style={{ color: '#00f0ff' }}>cooking your trace...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!problemData) {
    const isNetworkError = loadError === 'network';
    return (
      <div style={{ height: '100dvh', background: '#0a0000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '0 32px' }}>
        <button onClick={() => navigate('/')} className="absolute top-8 left-8 control-btn" aria-label="Back to home">
          <ArrowLeft size={15} />
        </button>
        <Terminal size={32} color="#ff0000" />
        <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>
          {isNetworkError ? 'server is sleeping' : "we don't got that one (yet)"}
        </h2>
        <p style={{ color: '#6b5555', fontSize: 14, textAlign: 'center', maxWidth: 440, lineHeight: 1.6 }}>
          {isNetworkError
            ? 'could not connect to the algotrace server. make sure it is running on port 3001.'
            : `"${id}" is not in our local stash. let the ai cook it up dynamically.`}
        </p>
        {!isNetworkError && (
          <div style={{ width: '100%', maxWidth: 560 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ color: '#00f0ff', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Terminal size={13} /> INTERACTIVE AI DEBUGGER
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}
                  style={{ background: '#1a0000', border: '1px solid #2a0000', color: '#fff', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, padding: '5px 10px' }}>
                  <option value="Auto">Auto (Pseudocode)</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="Python">Python</option>
                  <option value="Java">Java</option>
                  <option value="C++">C++</option>
                </select>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowEditor(!showEditor)}
                  style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', padding: '5px 10px', border: '1px solid #2a0000', background: 'transparent', color: '#fff', cursor: 'pointer' }}>
                  {showEditor ? 'HIDE EDITOR' : 'WRITE CUSTOM CODE'}
                </motion.button>
              </div>
            </div>
            <AnimatePresence>
              {showEditor && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: 'spring', bounce: 0.3 }} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <textarea value={userCode} onChange={(e) => setUserCode(e.target.value)}
                    placeholder="paste your code here..."
                    style={{ width: '100%', height: 150, background: '#0a0000', border: '1px solid #2a0000', padding: 14, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#fff', resize: 'none', outline: 'none' }} />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleGenerate} disabled={isGenerating}
                      style={{ padding: '9px 22px', background: '#00f0ff', color: '#000', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 12, border: 'none', cursor: isGenerating ? 'not-allowed' : 'pointer', opacity: isGenerating ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isGenerating ? <div style={{ width: 11, height: 11, border: '2px solid #000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : <Play size={11} />}
                      {isGenerating ? 'AI IS THINKING...' : 'DEBUG THIS CODE'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        {generateError && <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#ff4444' }}>{generateError}</p>}
      </div>
    );
  }

  const stepData = problemData.steps[currentStep];
  const progress = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;
  const accent   = hasCompleted ? '#00f0ff' : '#ff0000';

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
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#0a0000', overflow: 'hidden' }}>

      <div style={{ height: 2, background: accent, boxShadow: `0 0 28px 4px ${accent}55`, flexShrink: 0, transition: 'background 0.4s, box-shadow 0.4s' }} />

      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 50, borderBottom: '1px solid #2a0000', flexShrink: 0, gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <button onClick={() => navigate('/')} className="control-btn" aria-label="Back to home">
            <ArrowLeft size={13} />
          </button>
          <div className="label" style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <Terminal size={10} /><span>ALGOTRACE</span><span style={{ color: '#2a0000' }}>/</span>
          </div>
          <h1 style={{ fontWeight: 700, color: '#fff', fontSize: 13, letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {problemData.title}
          </h1>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, padding: '2px 7px', border: `1px solid ${DIFF_COLOR[problemData.difficulty] ?? '#6b5555'}`, color: DIFF_COLOR[problemData.difficulty] ?? '#6b5555', background: DIFF_BG[problemData.difficulty] ?? 'transparent', flexShrink: 0 }}>
            {problemData.difficulty?.toUpperCase()}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 110, height: 3, background: '#1a0000', borderRadius: 2, overflow: 'hidden' }}>
              <motion.div style={{ height: '100%', background: accent, transition: 'background 0.4s' }}
                animate={{ width: `${progress}%` }} transition={{ type: 'spring', bounce: 0.3 }} />
            </div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6b5555', fontWeight: 600 }}>
              {currentStep + 1}<span style={{ color: '#3d0000' }}>/{totalSteps}</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            {[['<-','Prev'],['->','Next'],['SPC','Play']].map(([k,h]) => (
              <kbd key={k} title={h} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, padding: '2px 5px', border: '1px solid #2a0000', color: '#3d0000', cursor: 'help' }}>{k}</kbd>
            ))}
          </div>
        </div>
      </header>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 1, background: '#2a0000', overflow: 'hidden', minHeight: 0 }}>

        <div style={{ display: 'flex', flexDirection: 'column', background: '#0a0000', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', height: 38, borderBottom: '1px solid #2a0000', flexShrink: 0 }}>
            <span className="label">VISUALIZER</span>
            <div style={{ display: 'flex', gap: 3 }}>
              {SPEED_PRESETS.map(({ label, value }) => (
                <button key={value} onClick={() => setPlaybackSpeed(value)}
                  className={`speed-chip ${playbackSpeed === value ? 'speed-chip-active' : 'speed-chip-inactive'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', padding: '12px 20px', overflowY: 'auto', minHeight: 0 }}>
            <div style={{ margin: 'auto', width: '100%' }}>
              <ErrorBoundary>{renderVisualizer()}</ErrorBoundary>
            </div>
          </div>

          <div style={{ flexShrink: 0, borderTop: '1px solid #2a0000', height: 136, display: 'flex', flexDirection: 'column', background: '#060000' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderBottom: '1px solid #2a0000', flexShrink: 0 }}>
              <Terminal size={10} color="#3d0000" />
              <span className="label">EXECUTION LOG</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#2a0000', marginLeft: 'auto' }}>
                {String(currentStep).padStart(2,'0')}/{String(totalSteps-1).padStart(2,'0')}
              </span>
            </div>
            <div ref={consoleRef} style={{ flex: 1, overflowY: 'auto', padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {problemData.steps.slice(0, currentStep + 1).map((step, idx) => {
                const isActive = idx === currentStep;
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '4px 7px', background: isActive ? 'rgba(255,0,0,0.1)' : 'transparent', border: `1px solid ${isActive ? 'rgba(255,0,0,0.2)' : 'transparent'}` }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: isActive ? '#ff4444' : '#2a0000', flexShrink: 0, marginTop: 2 }}>
                      [{String(idx).padStart(2,'0')}]
                    </span>
                    <p style={{ fontSize: 13, lineHeight: 1.5, color: isActive ? '#fff' : '#4a4a4a', fontWeight: isActive ? 500 : 400 }}>
                      {step.note}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ flexShrink: 0, borderTop: '1px solid #2a0000', padding: '9px 20px', background: '#0a0000', display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div style={{ position: 'relative', height: 3, background: '#1a0000', borderRadius: 2 }}>
              <motion.div style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: accent, borderRadius: 2, transition: 'background 0.4s' }}
                animate={{ width: `${progress}%` }} transition={{ type: 'spring', bounce: 0.3 }} />
              <input type="range" min="0" max={totalSteps - 1} value={currentStep}
                onChange={e => seekToStep(parseInt(e.target.value))}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <motion.button whileTap={{ scale: 0.9 }} className="control-btn" onClick={() => setCurrentStep(0)} disabled={currentStep === 0} aria-label="Reset">
                <RotateCcw size={12} />
              </motion.button>
              <motion.button whileTap={{ scale: 0.9 }} className="control-btn" onClick={prevStep} disabled={currentStep === 0} aria-label="Previous">
                <SkipBack size={12} />
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={togglePlay}
                style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isPlaying ? '#00f0ff' : '#fff', color: '#000', border: 'none', cursor: 'pointer', boxShadow: isPlaying ? '0 0 18px rgba(0,240,255,0.4)' : 'none', transition: 'background 0.15s, box-shadow 0.15s' }}>
                {isPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: 2 }} />}
              </motion.button>
              <motion.button whileTap={{ scale: 0.9 }} className="control-btn" onClick={nextStep} disabled={currentStep === totalSteps - 1} aria-label="Next">
                <SkipForward size={12} />
              </motion.button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', background: '#0a0000', overflow: 'hidden' }}>
          <div style={{ flexShrink: 0, borderBottom: '1px solid #2a0000' }}>
            <button onClick={() => setDescOpen(o => !o)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <span className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Terminal size={10} /> PROBLEM
              </span>
              {descOpen ? <ChevronUp size={12} color="#3d0000" /> : <ChevronDown size={12} color="#3d0000" />}
            </button>
            <AnimatePresence>
              {descOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} style={{ overflow: 'hidden' }}>
                  <div style={{ padding: '0 14px 10px', maxHeight: 150, overflowY: 'auto' }}>
                    <p style={{ fontSize: 13, lineHeight: 1.65, color: 'rgba(255,255,255,0.65)' }}>
                      {(problemData.description || 'No description available.').split('\n').map((line, i) => (
                        <span key={i}>{line}<br /></span>
                      ))}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', borderBottom: '1px solid #2a0000', flexShrink: 0 }}>
            <span className="label">PSEUDOCODE</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <div style={{ width: 7, height: 7, background: 'rgba(255,0,0,0.4)' }} />
              <div style={{ width: 7, height: 7, background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ width: 7, height: 7, background: 'rgba(255,255,255,0.04)' }} />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0', minHeight: 0 }}>
            <PseudocodeBlock code={problemData.pseudocode} activeLine={stepData.codeLine} />
          </div>

          <div style={{ flexShrink: 0, borderTop: '1px solid #2a0000', padding: '11px 14px', background: '#060000' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: accent, fontWeight: 700, flexShrink: 0, paddingTop: 2, transition: 'color 0.4s' }}>
                #{String(currentStep).padStart(2,'0')}
              </span>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: '#e0e0e0', fontWeight: 500 }}>
                {stepData.note}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemView;
