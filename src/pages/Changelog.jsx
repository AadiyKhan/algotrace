import React from 'react';
import Header from '../components/Header';

const LOGS = [
  {
    version: 'v1.0.0',
    date: 'Today',
    title: 'Major UI Overhaul & Live Engine',
    desc: 'Completely redesigned the landing page with a bespoke brutalist header and a live Framer Motion visualization engine replacing the static hero. Polished the typography and moved to a mature Monochrome + Amber color palette.',
  },
  {
    version: 'v0.9.5',
    date: 'Yesterday',
    title: 'Liquid Animations & Syntax Polish',
    desc: 'Added layout-based liquid animations to the Array Visualizer. Overhauled the execution log and pseudocode block with smarter highlighting and better padding.',
  },
  {
    version: 'v0.9.0',
    date: 'Last Week',
    title: 'Initial Alpha Release',
    desc: 'Core architecture established. Support for Graph, Matrix, Tree, and Array visualizers. Gemini-driven tracing pipeline operational.',
  }
];

const Changelog = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0b] text-white selection:bg-amber-500/30">
      <Header />
      
      <div className="flex-1 w-full max-w-[800px] mx-auto px-8 py-16">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-16">Changelog</h1>
        
        <div className="relative border-l-2 border-white/10 ml-4 space-y-12">
          {LOGS.map((log, i) => (
            <div key={i} className="relative pl-8">
              {/* Timeline dot */}
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 bg-[#0a0a0b] border-2 border-amber-500 rounded-full" />
              
              <div className="flex items-baseline gap-4 mb-2">
                <h2 className="text-xl font-bold">{log.version}</h2>
                <span className="font-mono text-white/40 text-sm">{log.date}</span>
              </div>
              
              <h3 className="text-amber-500 font-bold mb-4">{log.title}</h3>
              <p className="text-white/60 leading-relaxed text-[14px]">
                {log.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Changelog;
