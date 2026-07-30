import React from 'react';

const LANGUAGES = [
  { name: 'JAVASCRIPT', time: '12ms', engine: 'V8/NODE' },
  { name: 'PYTHON', time: '18ms', engine: 'CPYTHON' },
  { name: 'JAVA', time: '24ms', engine: 'JVM' },
  { name: 'C++', time: '8ms', engine: 'GCC' },
];

const LandingLanguages = () => {
  return (
    <div className="w-full h-full bg-[#0a0a0b] relative z-10 flex flex-col">
      <div className="p-8 lg:p-12 border-b-[2px] border-white/[0.15]">
        <div>
          <span className="font-mono text-amber-500 text-[10px] uppercase tracking-widest border-[2px] border-amber-500 px-3 py-1 mb-6 inline-block">
            Universal Engine
          </span>
          <h2 className="text-white font-black uppercase text-4xl tracking-tighter">
            Language Agnostic.<br/>Blazing Fast.
          </h2>
        </div>
        <p className="text-white/40 font-mono text-[12px] uppercase max-w-sm text-right leading-loose hidden md:block">
          Trace compilation and AST parsing happens in milliseconds. No containers. No wait times.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/[0.15]">
        {LANGUAGES.map((lang, i) => (
          <div key={i} className="bg-[#0a0a0b] p-6 lg:p-8 flex flex-col justify-between group hover:bg-white transition-colors duration-150 cursor-crosshair">
            <div className="flex justify-between items-center mb-12">
              <span className="font-mono text-[10px] text-white/30 group-hover:text-black/40 uppercase tracking-widest border-[2px] border-white/[0.15] group-hover:border-black/20 px-2 py-1">
                {lang.engine}
              </span>
              <span className="font-mono text-[10px] text-amber-500 group-hover:text-black font-bold uppercase tracking-widest">
                ~{lang.time}
              </span>
            </div>
            <h3 className="text-white group-hover:text-black font-black uppercase tracking-tighter text-4xl">
              {lang.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingLanguages;
