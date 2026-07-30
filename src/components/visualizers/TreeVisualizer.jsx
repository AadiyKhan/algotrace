import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NODE_R = 22;   // circle radius px
const H_GAP  = 18;   // horizontal gap between sibling subtrees
const V_GAP  = 64;   // vertical gap between levels

/* ── Layout engine ─────────────────────────────────────────── */
// Returns { x, y, width } for every node id.
// Uses a standard post-order subtree-width algorithm.
function computeLayout(nodeMap, rootId) {
  const pos = {};

  function measure(id) {
    if (id === null || id === undefined || !nodeMap[id]) return 0;
    const node = nodeMap[id];
    const lw = measure(node.left ?? null);
    const rw = measure(node.right ?? null);
    const w = Math.max(NODE_R * 2, lw + (lw > 0 && rw > 0 ? H_GAP : 0) + rw);
    node._w = w;
    return w;
  }

  function place(id, x, y) {
    if (id === null || id === undefined || !nodeMap[id]) return;
    const node = nodeMap[id];
    const lw = nodeMap[node.left]?._w ?? 0;
    const rw = nodeMap[node.right]?._w ?? 0;
    const hasL = node.left !== null && node.left !== undefined && nodeMap[node.left];
    const hasR = node.right !== null && node.right !== undefined && nodeMap[node.right];

    let lx = x, rx = x;
    if (hasL && hasR) {
      lx = x - (H_GAP / 2) - lw / 2;
      rx = x + (H_GAP / 2) + rw / 2;
    } else if (hasL) {
      lx = x - (H_GAP / 2) - lw / 2;
    } else if (hasR) {
      rx = x + (H_GAP / 2) + rw / 2;
    }

    pos[id] = { x, y };
    if (hasL) place(node.left, lx, y + V_GAP);
    if (hasR) place(node.right, rx, y + V_GAP);
  }

  measure(rootId);
  place(rootId, 0, NODE_R + 4);
  return pos;
}

/* ── Node state helpers ─────────────────────────────────────── */
// Returns border style string for colorblind-friendly differentiation
// curr = solid bright border + glow
// prev = dashed white border
// visited = dotted dim border
function nodeStyle(isCurr, isPrev, isVisited) {
  if (isCurr)    return { bg: 'rgba(245,158,11,0.15)', border: '2px solid #f59e0b', color: '#fff', shadow: '0 0 30px rgba(245,158,11,0.3)' };
  if (isPrev)    return { bg: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.8)', color: '#fff', shadow: 'none' };
  if (isVisited) return { bg: 'rgba(245,158,11,0.05)', border: '2px solid rgba(245,158,11,0.4)', color: 'rgba(255,255,255,0.7)', shadow: 'none' };
  return { bg: '#050505', border: '2px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.4)', shadow: 'none' };
}

const LEGEND = [
  { label: 'CURRENT',  desc: 'ACTIVE NODE',          border: '2px solid #f59e0b',              color: '#f59e0b' },
  { label: 'PREV',     desc: 'PREVIOUSLY VISITED',   border: '2px solid rgba(255,255,255,0.8)', color: '#ffffff' },
  { label: 'VISITED',  desc: 'MARKED AS VISITED',    border: '2px solid rgba(245,158,11,0.4)',  color: 'rgba(245,158,11,0.8)' },
];

const TreeVisualizer = ({ stepData }) => {
  const { treeNodes, curr, prev, visited } = stepData;

  const nodeMap = {};
  if (treeNodes && Array.isArray(treeNodes)) {
    treeNodes.forEach(n => { nodeMap[n.id] = { ...n }; });
  }

  const childIds = new Set();
  if (treeNodes && Array.isArray(treeNodes)) {
    treeNodes.forEach(n => {
      if (n.left  !== null && n.left  !== undefined) childIds.add(n.left);
      if (n.right !== null && n.right !== undefined) childIds.add(n.right);
    });
  }

  const root = treeNodes && treeNodes.length > 0 ? (treeNodes.find(n => !childIds.has(n.id)) ?? treeNodes[0]) : null;

  const positions = useMemo(() => {
    if (!root || !nodeMap) return {};
    return computeLayout(nodeMap, root.id);
  }, [treeNodes, root, nodeMap]);

  if (!treeNodes || !Array.isArray(treeNodes) || treeNodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 w-full border-[2px] border-white/20 font-mono text-[11px] font-bold tracking-widest uppercase bg-[#050505]" style={{ color: 'rgba(255,255,255,0.2)' }}>
        [ EMPTY_TREE ]
      </div>
    );
  }

  // Normalise so min-x = NODE_R (left padding)
  const xs = Object.values(positions).map(p => p.x);
  const ys = Object.values(positions).map(p => p.y);
  const minX = xs.length ? Math.min(...xs) : 0;
  const maxX = xs.length ? Math.max(...xs) : 0;
  const maxY = ys.length ? Math.max(...ys) : 0;
  const svgW = Math.max(300, maxX - minX + NODE_R * 2 + 32);
  const svgH = maxY + NODE_R + 32;
  const offsetX = -minX + NODE_R + 16;

  const visitedSet = new Set(visited || []);

  // Build edges list
  const edges = [];
  treeNodes.forEach(n => {
    ['left', 'right'].forEach(side => {
      const childId = n[side];
      if (childId !== null && childId !== undefined && nodeMap[childId] && positions[n.id] && positions[childId]) {
        edges.push({ from: n.id, to: childId });
      }
    });
  });

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-2">
        <span className="font-mono font-bold tracking-widest text-[11px] uppercase text-white/50">BINARY_TREE</span>
        <div className="flex-1 h-[2px] bg-white/10" />
      </div>

      <div className="overflow-x-auto border-[2px] border-white/20 bg-[#050505] p-8 relative">
        <svg
          width={svgW}
          height={svgH}
          style={{ display: 'block', margin: '0 auto' }}
          aria-label="Binary tree visualizer"
        >
          <defs>
            <pattern id="grid-tree" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>
            <radialGradient id="node-glow-tree" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(245,158,11,0.6)" />
              <stop offset="100%" stopColor="rgba(245,158,11,0)" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-tree)" />

          {/* Edges — use path instead of line so pathLength works */}
          {edges.map(({ from, to }) => {
            const p1 = positions[from];
            const p2 = positions[to];
            const isActive = curr === from || curr === to;
            const d = `M ${p1.x + offsetX} ${p1.y} L ${p2.x + offsetX} ${p2.y}`;
            return (
              <motion.path
                key={`${from}-${to}`}
                d={d}
                stroke={isActive ? '#f59e0b' : 'rgba(255,255,255,0.15)'}
                strokeWidth={isActive ? 3 : 1.5}
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            );
          })}

          {/* Nodes */}
          {treeNodes.map((node, i) => {
            const pos = positions[node.id];
            if (!pos) return null;
            const isCurr    = curr === node.id;
            const isPrev    = prev === node.id;
            const isVisited = visitedSet.has(node.id);
            const s = nodeStyle(isCurr, isPrev, isVisited);
            const cx = pos.x + offsetX;
            const cy = pos.y;

            return (
              <g key={node.id}>
                {/* Glow halo rendered BEHIND the node — large radial circle */}
                {isCurr && (
                  <motion.circle
                    cx={cx} cy={cy}
                    r={NODE_R + 14}
                    fill="url(#node-glow-tree)"
                    initial={{ opacity: 0, r: NODE_R }}
                    animate={{ opacity: 1, r: [NODE_R + 10, NODE_R + 18, NODE_R + 14] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                {/* Outer amber ring */}
                {isCurr && (
                  <circle cx={cx} cy={cy} r={NODE_R + 5}
                    fill="none" stroke="rgba(245,158,11,0.5)" strokeWidth={2} />
                )}
                {/* Main node circle */}
                <motion.circle
                  cx={cx} cy={cy} r={NODE_R}
                  fill={s.bg}
                  stroke={isCurr ? '#f59e0b' : isPrev ? 'rgba(255,255,255,0.8)' : isVisited ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.2)'}
                  strokeWidth={isCurr ? 3 : 2}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 250, damping: 18, delay: Math.min(i * 0.05, 0.4) }}
                />
                <text
                  x={cx} y={cy}
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

      {/* Legend */}
      <div className="grid grid-cols-3 gap-6 border-t-[2px] border-white/10 pt-8 mt-4">
        {LEGEND.map(({ label, desc, border, color }) => (
          <div key={label} className="p-6 bg-[#050505] border-[2px] border-white/20">
            <div className="flex items-center gap-4 mb-2">
              <div style={{ width: 14, height: 14, background: 'transparent', border, flexShrink: 0 }} />
              <span className="font-mono font-bold tracking-widest text-[11px] uppercase" style={{ color }}>{label}</span>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TreeVisualizer;
