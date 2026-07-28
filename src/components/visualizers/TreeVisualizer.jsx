import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

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
  if (isCurr)    return { bg: 'rgba(255,0,0,0.18)', border: '2px solid #ff0000', color: '#fff', shadow: '0 0 20px rgba(255,0,0,0.45)', borderStyle: 'solid' };
  if (isPrev)    return { bg: 'rgba(255,255,255,0.08)', border: '2px dashed rgba(255,255,255,0.5)', color: '#fff', shadow: 'none', borderStyle: 'dashed' };
  if (isVisited) return { bg: 'rgba(255,0,0,0.05)', border: '2px dotted rgba(255,0,0,0.35)', color: 'rgba(255,255,255,0.55)', shadow: 'none', borderStyle: 'dotted' };
  return { bg: '#110000', border: '2px solid #2a0000', color: '#6b5555', shadow: 'none', borderStyle: 'solid' };
}

const LEGEND = [
  { label: 'CURRENT',  desc: 'Active node',          border: '2px solid #ff0000',              color: '#ff0000' },
  { label: 'PREV',     desc: 'Previously visited',   border: '2px dashed rgba(255,255,255,0.5)', color: 'rgba(255,255,255,0.7)' },
  { label: 'VISITED',  desc: 'Marked as visited',    border: '2px dotted rgba(255,0,0,0.4)',    color: 'rgba(255,0,0,0.6)' },
];

const TreeVisualizer = ({ stepData }) => {
  const { treeNodes, curr, prev, visited } = stepData;

  if (!treeNodes || !Array.isArray(treeNodes) || treeNodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 w-full border border-borderDark font-mono text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
        No tree data provided for this step.
      </div>
    );
  }

  const nodeMap = {};
  treeNodes.forEach(n => { nodeMap[n.id] = { ...n }; });

  // Find root: node whose id appears in no child list
  const childIds = new Set();
  treeNodes.forEach(n => {
    if (n.left  !== null && n.left  !== undefined) childIds.add(n.left);
    if (n.right !== null && n.right !== undefined) childIds.add(n.right);
  });
  const root = treeNodes.find(n => !childIds.has(n.id)) ?? treeNodes[0];

  const positions = useMemo(() => computeLayout(nodeMap, root.id), [treeNodes]);

  // Normalise so min-x = NODE_R (left padding)
  const xs = Object.values(positions).map(p => p.x);
  const ys = Object.values(positions).map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
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
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      <p className="label text-center">BINARY TREE</p>

      <div className="overflow-x-auto">
        <svg
          width={svgW}
          height={svgH}
          style={{ display: 'block', margin: '0 auto' }}
          aria-label="Binary tree visualizer"
        >
          {/* Edges */}
          {edges.map(({ from, to }) => {
            const p1 = positions[from];
            const p2 = positions[to];
            return (
              <line
                key={`${from}-${to}`}
                x1={p1.x + offsetX} y1={p1.y}
                x2={p2.x + offsetX} y2={p2.y}
                stroke="#2a0000" strokeWidth={1.5}
              />
            );
          })}

          {/* Nodes */}
          {treeNodes.map(node => {
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
                {/* Glow ring for current */}
                {isCurr && (
                  <circle cx={cx} cy={cy} r={NODE_R + 6}
                    fill="none" stroke="rgba(255,0,0,0.2)" strokeWidth={6} />
                )}
                <motion.circle
                  cx={cx} cy={cy} r={NODE_R}
                  fill={s.bg}
                  stroke={isCurr ? '#ff0000' : isPrev ? 'rgba(255,255,255,0.5)' : isVisited ? 'rgba(255,0,0,0.35)' : '#2a0000'}
                  strokeWidth={2}
                  strokeDasharray={isPrev ? '4 3' : isVisited ? '2 3' : 'none'}
                  animate={isCurr ? { r: [NODE_R, NODE_R + 3, NODE_R] } : { r: NODE_R }}
                  transition={{ duration: 0.3 }}
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
      <div className="grid grid-cols-3 gap-3 border-t border-borderDark pt-4">
        {LEGEND.map(({ label, desc, border, color }) => (
          <div key={label} className="p-3" style={{ background: '#110000', border: '1px solid #2a0000' }}>
            <div className="flex items-center gap-2 mb-1">
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'transparent', border, flexShrink: 0 }} />
              <span className="font-mono font-bold text-[10px]" style={{ color }}>{label}</span>
            </div>
            <p className="text-[10px] leading-relaxed" style={{ color: '#6b5555' }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TreeVisualizer;
