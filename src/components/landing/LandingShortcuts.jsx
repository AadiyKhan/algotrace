import React from 'react';

const SHORTCUTS = [
  { key: 'SPACE', desc: 'PLAY / PAUSE TRACE' },
  { key: 'J', desc: 'STEP BACKWARD' },
  { key: 'K', desc: 'STEP FORWARD' },
  { key: 'L', desc: 'SKIP TO END' },
  { key: 'CMD + K', desc: 'SEARCH ALGORITHMS' },
  { key: 'ESC', desc: 'CLOSE MODAL / FOCUS' },
];

const LandingShortcuts = () => {
  return (
    <div className="w-full h-full bg-[#0a0a0b] flex flex-col md:flex-row relative z-10">
      
      <div className="w-full md:w-64 border-b-[2px] md:border-b-0 md:border-r-[2px] border-white/[0.15] p-8 flex flex-col justify-between">
        <span className="font-mono text-white/30 text-[10px] uppercase tracking-widest">Interface</span>
        <h2 className="text-white font-black uppercase text-xl tracking-tight mt-4 md:mt-0">
          Power<br/>User<br/>Controls
        </h2>
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-px bg-white/[0.15]">
        {SHORTCUTS.map((s, i) => (
          <div key={i} className="bg-[#0a0a0b] p-6 lg:p-8 flex flex-col justify-between group hover:bg-white transition-colors duration-150 cursor-crosshair">
            <span className="font-mono text-[10px] text-white/40 group-hover:text-black/40 uppercase tracking-widest mb-8 lg:mb-12">
              BINDING // 0{i + 1}
            </span>
            <div>
              <div className="inline-block px-3 py-1 mb-4 border-[2px] border-white/20 group-hover:border-black/20 text-amber-500 group-hover:text-black font-mono text-[14px] font-bold">
                {s.key}
              </div>
              <p className="text-white group-hover:text-black font-black uppercase tracking-tighter text-lg">
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default LandingShortcuts;
