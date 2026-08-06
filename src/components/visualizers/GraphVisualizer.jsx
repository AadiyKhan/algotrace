import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import useChatStore from '../../store/useChatStore';

const NODE_R = 24;

const LEGEND = [
  { label: 'CURRENT',  desc: 'ACTIVE NODE',        stroke: '#f59e0b',              dash: 'none' },
  { label: 'PREV',     desc: 'PREVIOUSLY VISITED', stroke: 'rgba(255,255,255,0.8)', dash: 'none'  },
  { label: 'VISITED',  desc: 'MARKED AS VISITED',  stroke: 'rgba(245,158,11,0.4)',  dash: 'none'  },
];

const GraphVisualizer = ({ stepData }) => {
  const { askQuestion } = useChatStore();
  const { graphNodes, graphEdges, curr, prev, visited } = stepData;
  const containerRef = useRef(null);
  const [width, setWidth] = useState(500);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      setWidth(entries[0].contentRect.width || 500);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  if (!graphNodes || !Array.isArray(graphNodes) || graphNodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 w-full border-[2px] border-white/20 font-mono text-[11px] font-bold tracking-widest uppercase bg-[#050505]" style={{ color: 'rgba(255,255,255,0.2)' }}>
        [ EMPTY_GRAPH ]
      </div>
    );
  }

  const size   = Math.min(width, 480);
  const center = size / 2;
  const radius = size * 0.36;
  const total  = graphNodes.length;

  const nodePositions = {};
  graphNodes.forEach((node, idx) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * idx) / total;
    nodePositions[node.id] = {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  });

  const visitedSet = new Set(visited || []);
  const edges = graphEdges || [];

  const nodeStyle = (id) => {
    const isCurr    = curr === id;
    const isPrev    = prev === id;
    const isVisited = visitedSet.has(id);
    if (isCurr)    return { fill: 'rgba(245,158,11,0.15)',        stroke: '#f59e0b',               dash: 'none', color: '#fff',                   shadow: true  };
    if (isPrev)    return { fill: 'rgba(255,255,255,0.05)',    stroke: 'rgba(255,255,255,0.8)',  dash: 'none',  color: '#fff',                   shadow: false };
    if (isVisited) return { fill: 'rgba(245,158,11,0.05)',        stroke: 'rgba(245,158,11,0.4)',     dash: 'none',  color: 'rgba(255,255,255,0.7)', shadow: false };
    return           { fill: '#050505',                        stroke: 'rgba(255,255,255,0.2)',                dash: 'none', color: 'rgba(255,255,255,0.4)',                shadow: false };
  };

  // Build path d for an edge with an arrowhead offset
  const edgePath = (u, v) => {
    const p1 = nodePositions[u];
    const p2 = nodePositions[v];
    if (!p1 || !p2) return null;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    // shorten end by NODE_R so arrow tip touches circle edge
    const ex = p2.x - (dx / len) * (NODE_R + 4);
    const ey = p2.y - (dy / len) * (NODE_R + 4);
    return `M ${p1.x} ${p1.y} L ${ex} ${ey}`;
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto p-4" ref={containerRef}>
      <div className="flex items-center gap-4 mb-2">
        <span className="font-mono font-bold tracking-widest text-[11px] uppercase text-white/50">DIRECTED_GRAPH</span>
        <div className="flex-1 h-[2px] bg-white/10" />
      </div>

      <div className="overflow-hidden border-[2px] border-white/20 bg-[#050505] p-8 flex justify-center">
        <svg
          width={size} height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ display: 'block' }}
          aria-label="Directed graph visualizer"
        >
          <defs>
            <pattern id="grid-graph" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>
            <radialGradient id="node-glow-graph" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(245,158,11,0.6)" />
              <stop offset="100%" stopColor="rgba(245,158,11,0)" />
            </radialGradient>
            <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="rgba(255,255,255,0.2)" />
            </marker>
            <marker id="arrow-active" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
            </marker>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-graph)" />

        {/* Edges */}
        {edges.map((edge, i) => {
          const [u, v] = edge;
          const d = edgePath(u, v);
          if (!d) return null;
          const isActive = (u === prev && v === curr) || (u === curr && v === prev);
          return (
            <motion.path
              key={`${u}-${v}-${i}`}
              d={d}
              fill="none"
              stroke={isActive ? '#f59e0b' : 'rgba(255,255,255,0.2)'}
              strokeWidth={isActive ? 3 : 2}
              markerEnd={isActive ? 'url(#arrow-active)' : 'url(#arrow)'}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          );
        })}

        {/* Nodes */}
        {graphNodes.map((node, i) => {
          const pos = nodePositions[node.id];
          const s = nodeStyle(node.id);
          const isCurr = curr === node.id;
          return (
            <g key={node.id} 
               className="cursor-pointer transition-colors" 
               onClick={() => askQuestion(`Explain what node ${node.id} represents in the current execution step of this graph problem.`)}>
              {/* Breathing glow halo */}
              {isCurr && (
                <motion.circle
                  cx={pos.x} cy={pos.y}
                  r={NODE_R + 14}
                  fill="url(#node-glow-graph)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, r: [NODE_R + 10, NODE_R + 18, NODE_R + 14] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              {/* Outer ring */}
              {isCurr && (
                <circle cx={pos.x} cy={pos.y} r={NODE_R + 5}
                  fill="none" stroke="rgba(245,158,11,0.5)" strokeWidth={2} />
              )}
              {/* Main node */}
              <motion.circle
                cx={pos.x} cy={pos.y} r={NODE_R}
                fill={s.fill}
                stroke={s.stroke}
                strokeWidth={isCurr ? 3 : 2}
                strokeDasharray={s.dash}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 250, damping: 18, delay: Math.min(i * 0.05, 0.4) }}
              />
              <text
                x={pos.x} y={pos.y}
                textAnchor="middle" dominantBaseline="central"
                fill={s.color}
                fontSize={13} fontWeight="bold" fontFamily="JetBrains Mono, monospace"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {node.val}
              </text>
            </g>
          );
        })}
        </svg>
      </div>


      {/* Results Section */}
      {(stepData.results || stepData.result) && Array.isArray(stepData.results || stepData.result) && (
        <div className="flex flex-col gap-4 mt-4 w-full border-t-[2px] border-white/10 pt-8">
          <div className="flex items-center gap-4">
            <span className="font-mono font-bold tracking-widest text-[11px] uppercase text-white/50">FOUND_RESULTS</span>
            <div className="flex-1 h-[2px] bg-white/10" />
          </div>
          <div className="flex flex-wrap gap-4">
            {(stepData.results || stepData.result).length === 0 ? (
              <span className="font-mono text-[12px] text-white/30 uppercase tracking-widest">[ NONE YET ]</span>
            ) : (
              (stepData.results || stepData.result).map((item, idx) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={idx} 
                  className="px-4 py-2 border-[2px] border-amber-500 bg-amber-500/10 text-amber-500 font-mono font-bold text-sm tracking-widest uppercase"
                >
                  {typeof item === 'object' ? JSON.stringify(item) : item}
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="grid grid-cols-3 gap-6 border-t-[2px] border-white/10 pt-8 mt-4 w-full">
        {LEGEND.map(({ label, desc, stroke, dash }) => (
          <div key={label} className="p-6 bg-[#050505] border-[2px] border-white/20">
            <div className="flex items-center gap-4 mb-2">
              <svg width={16} height={16} aria-hidden="true" className="flex-shrink-0">
                <circle cx={8} cy={8} r={6} fill="transparent"
                  stroke={stroke} strokeWidth={2} strokeDasharray={dash} />
              </svg>
              <span className="font-mono font-bold tracking-widest text-[11px] uppercase" style={{ color: stroke }}>{label}</span>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GraphVisualizer;
