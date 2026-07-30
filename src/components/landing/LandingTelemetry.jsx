import React, { useState, useEffect } from 'react';

const LOGS = [
  "SYS: trace init 'dijkstra-shortest-path' ... SUCCESS",
  "MEM: allocated 1024 nodes ... OK",
  "PROC: compiling java bytecode ... SUCCESS (12ms)",
  "VM: sandbox isolated, engine ready.",
  "SYS: executing step 45/112 ...",
  "WARN: garbage collection paused.",
  "SYS: trace complete 'merge-sort' ... OK",
  "MEM: heap flushed. 0 bytes retained.",
  "PROC: compiling python ast ... SUCCESS (8ms)",
  "SYS: trace init 'binary-search-tree' ... SUCCESS",
];

const LandingTelemetry = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setLogs((prev) => {
        const newLogs = [...prev, `[${new Date().toISOString().substring(11, 23)}] ${LOGS[index % LOGS.length]}`];
        if (newLogs.length > 8) newLogs.shift();
        return newLogs;
      });
      index++;
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-[#0a0a0b] flex flex-col md:flex-row relative z-10">
      
      {/* Label Box */}
      <div className="w-full md:w-64 border-b-[2px] md:border-b-0 md:border-r-[2px] border-white/[0.15] p-8 flex flex-col justify-between">
        <span className="font-mono text-white/30 text-[10px] uppercase tracking-widest">Live Telemetry</span>
        <h2 className="text-white font-black uppercase text-xl tracking-tight mt-4 md:mt-0">
          Trace<br/>Engine<br/>Logs
        </h2>
      </div>

      {/* Terminal Output */}
      <div className="flex-1 p-8 bg-black relative overflow-hidden flex flex-col justify-end min-h-[250px]">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:20px_20px]" />
        
        <div className="relative z-10 flex flex-col gap-2 font-mono text-[12px] md:text-[14px]">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-4">
              <span className="text-white/20 select-none">
                {'>'}
              </span>
              <span className={`${log.includes('WARN') ? 'text-amber-500' : 'text-white/60'}`}>
                {log}
              </span>
            </div>
          ))}
          <div className="flex gap-4 animate-pulse mt-2">
            <span className="text-amber-500">{'>'}</span>
            <span className="text-amber-500 bg-amber-500/20 w-3 h-4 block" />
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default LandingTelemetry;
