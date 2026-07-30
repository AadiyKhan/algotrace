import React from 'react';
import Header from '../components/Header';

const Docs = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0b] text-white selection:bg-amber-500/30">
      <Header />
      
      <div className="flex-1 w-full max-w-[800px] mx-auto px-8 py-16">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-12">Documentation</h1>
        
        <div className="space-y-12 text-white/70 leading-relaxed text-[15px]">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Getting Started</h2>
            <p className="mb-4">
              Algotrace is a visual debugger for algorithms. It parses your code, executes it in a sandboxed environment, and maps the runtime state to interactive UI components.
            </p>
            <div className="bg-white/[0.04] border-l-2 border-amber-500 p-4 font-mono text-sm">
              Note: Currently in early beta. Only a curated set of algorithms is natively supported.
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">How it works</h2>
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-white">Trace Generation:</strong> The server executes the algorithm and records the entire state history on every clock cycle.</li>
              <li><strong className="text-white">Spatial Memory:</strong> Arrays, Linked Lists, Trees, and Graphs are reconstructed structurally in the browser.</li>
              <li><strong className="text-white">Time Travel:</strong> Use the player controls or arrow keys to step forward and backward through time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Shortcuts</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-white/10 p-4 flex items-center justify-between">
                <span>Play / Pause</span>
                <kbd className="font-mono bg-white/10 px-2 py-1">Space</kbd>
              </div>
              <div className="border border-white/10 p-4 flex items-center justify-between">
                <span>Next Step</span>
                <kbd className="font-mono bg-white/10 px-2 py-1">→</kbd>
              </div>
              <div className="border border-white/10 p-4 flex items-center justify-between">
                <span>Prev Step</span>
                <kbd className="font-mono bg-white/10 px-2 py-1">←</kbd>
              </div>
              <div className="border border-white/10 p-4 flex items-center justify-between">
                <span>Reset</span>
                <kbd className="font-mono bg-white/10 px-2 py-1">R</kbd>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Docs;
