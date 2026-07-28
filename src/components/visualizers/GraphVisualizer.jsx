import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const NODE_R = 24;

const LEGEND = [
  { label: 'CURRENT',  desc: 'Active node',        stroke: '#ff0000',              dash: 'none' },
  { label: 'PREV',     desc: 'Previously visited', stroke: 'rgba(255,255,255,0.5)', dash: '4 3'  },
  { label: 'VISITED',  desc: 'Marked as visited',  stroke: 'rgba(255,0,0,0.4)',    dash: '2 3'  },
];

const GraphVisualizer = ({ stepData }) => {
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
      <div className="flex items-center justify-center h-32 w-full border border-borderDark font-mono text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
        No graph data provided for this step.
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
    if (isCurr)    return { fill: 'rgba(255,0,0,0.18)',        stroke: '#ff0000',               dash: 'none', color: '#fff',                   shadow: true  };
    if (isPrev)    return { fill: 'rgba(255,255,255,0.08)',    stroke: 'rgba(255,255,255,0.5)',  dash: '4 3',  color: '#fff',                   shadow: false };
    if (isVisited) return { fill: 'rgba(255,0,0,0.05)',        stroke: 'rgba(255,0,0,0.35)',     dash: '2 3',  color: 'rgba(255,255,255,0.55)', shadow: false };
    return           { fill: '#110000',                        stroke: '#2a0000',                dash: 'none', color: '#6b5555',                shadow: false };
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
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto items-center" ref={containerRef}>
      <p className="label text-center">DIRECTED GRAPH</p>

      <svg
        width={size} height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ display: 'block' }}
        aria-label="Directed graph visualizer"
      >
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#4a0000" />
          </marker>
          <marker id="arrow-active" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#ff0000" />
          </marker>
        </defs>

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
              stroke={isActive ? '#ff0000' : '#4a0000'}
              strokeWidth={isActive ? 2.5 : 1.5}
              markerEnd={isActive ? 'url(#arrow-active)' : 'url(#arrow)'}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          );
        })}

        {/* Nodes */}
        {graphNodes.map(node => {
          const pos = nodePositions[node.id];
          const s = nodeStyle(node.id);
          const isCurr = curr === node.id;
          return (
            <g key={node.id}>
              {s.shadow && (
                <circle cx={pos.x} cy={pos.y} r={NODE_R + 7}
                  fill="none" stroke="rgba(255,0,0,0.2)" strokeWidth={6} />
              )}
              <motion.circle
                cx={pos.x} cy={pos.y} r={NODE_R}
                fill={s.fill}
                stroke={s.stroke}
                strokeWidth={2}
                strokeDasharray={s.dash}
                animate={isCurr ? { r: [NODE_R, NODE_R + 3, NODE_R] } : { r: NODE_R }}
                transition={{ duration: 0.3 }}
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

      {/* Legend */}
      <div className="grid grid-cols-3 gap-3 border-t border-borderDark pt-4 w-full">
        {LEGEND.map(({ label, desc, stroke, dash }) => (
          <div key={label} className="p-3" style={{ background: '#110000', border: '1px solid #2a0000' }}>
            <div className="flex items-center gap-2 mb-1">
              <svg width={16} height={16} aria-hidden="true">
                <circle cx={8} cy={8} r={6} fill="transparent"
                  stroke={stroke} strokeWidth={2} strokeDasharray={dash} />
              </svg>
              <span className="font-mono font-bold text-[10px]" style={{ color: stroke }}>{label}</span>
            </div>
            <p className="text-[10px] leading-relaxed" style={{ color: '#6b5555' }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GraphVisualizer;
