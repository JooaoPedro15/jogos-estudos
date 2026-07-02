import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Code2,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

import type { StructureVisual } from '../types/content';
import { buildSceneForVisual } from './scenes';
import { useAnimatedFrame, type DisplayNode } from './useAnimatedFrame';
import { collectLegend, stateLegend, type VizEdge, type VizNode, type VizPointer, type VizScene } from './vizTypes';

import './viz.css';

const SPEEDS = [0.5, 1, 1.5, 2] as const;
const BASE_FRAME_MS = 1600;
const BASE_TWEEN_MS = 430;

function usePrefersReducedMotion(): boolean {
  return useMemo(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);
}

function nodeHalf(node: VizNode): { hw: number; hh: number } {
  if (node.shape === 'circle' || !node.shape) {
    return { hw: 24, hh: 24 };
  }
  return { hw: (node.w ?? 56) / 2, hh: (node.h ?? 40) / 2 };
}

/** Ponto na borda do nó ao longo da direção (dx, dy). */
function edgeAnchor(node: DisplayNode, dx: number, dy: number): { x: number; y: number } {
  const { hw, hh } = nodeHalf(node);
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;

  if (node.shape === 'circle' || !node.shape) {
    return { x: node.x + ux * (hw + 3), y: node.y + uy * (hw + 3) };
  }

  const tx = ux === 0 ? Infinity : (hw + 4) / Math.abs(ux);
  const ty = uy === 0 ? Infinity : (hh + 4) / Math.abs(uy);
  const t = Math.min(tx, ty);
  return { x: node.x + ux * t, y: node.y + uy * t };
}

function EdgeShape({ edge, nodes }: { edge: VizEdge & { opacity: number }; nodes: Map<string, DisplayNode> }) {
  const from = nodes.get(edge.from);
  const to = nodes.get(edge.to);

  if (!from || !to) {
    return null;
  }

  const a = edgeAnchor(from, to.x - from.x, to.y - from.y);
  const b = edgeAnchor(to, from.x - to.x, from.y - to.y);
  const marker = edge.arrow ? `url(#viz-arrow-${edge.state ?? 'default'})` : undefined;

  let d = `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  if (edge.bend) {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nx = -(b.y - a.y) / len;
    const ny = (b.x - a.x) / len;
    d = `M ${a.x} ${a.y} Q ${mx + nx * edge.bend} ${my + ny * edge.bend} ${b.x} ${b.y}`;
  }

  return (
    <path
      className={`viz-edge is-${edge.state ?? 'default'} ${edge.dashed ? 'is-dashed' : ''}`}
      d={d}
      markerEnd={marker}
      opacity={edge.opacity}
    />
  );
}

function NodeShape({ node }: { node: DisplayNode }) {
  const state = node.state ?? 'default';
  const badge = state !== 'default' && state !== 'muted' ? stateLegend[state as keyof typeof stateLegend]?.badge : undefined;
  const { hw, hh } = nodeHalf(node);
  const isSlot = node.shape === 'slot';

  return (
    <g
      className={`viz-node is-${state} shape-${node.shape ?? 'circle'}`}
      opacity={node.opacity}
      transform={`translate(${node.x} ${node.y}) scale(${node.scale})`}
    >
      {node.shape === 'circle' || !node.shape ? (
        <circle className="viz-node-body" r={24} />
      ) : (
        <rect
          className="viz-node-body"
          height={hh * 2}
          rx={node.shape === 'pill' ? hh : 10}
          width={hw * 2}
          x={-hw}
          y={-hh}
        />
      )}
      {node.label && (
        <text
          className="viz-node-label"
          dy="0.34em"
          style={{ fontSize: node.label.length > 6 ? 10.5 : node.label.length > 4 ? 12 : 15 }}
        >
          {node.label}
        </text>
      )}
      {node.sub && (
        <text className="viz-node-sub" y={hh + 15}>
          {node.sub}
        </text>
      )}
      {badge && !isSlot && (
        <g transform={`translate(${hw - 4} ${-hh + 4})`}>
          <circle className="viz-badge-body" r={9} />
          <text className="viz-badge-text" dy="0.35em">
            {badge}
          </text>
        </g>
      )}
    </g>
  );
}

function PointerShape({ pointer, nodes }: { pointer: VizPointer; nodes: Map<string, DisplayNode> }) {
  const target = nodes.get(pointer.target);

  if (!target) {
    return null;
  }

  const { hw, hh } = nodeHalf(target);
  const gap = 14;
  let x = target.x;
  let y = target.y;
  let tip = { x: target.x, y: target.y };

  if (pointer.side === 'top') {
    y = target.y - hh - gap - 12;
    tip = { x: target.x, y: target.y - hh - 4 };
  } else if (pointer.side === 'bottom') {
    y = target.y + hh + gap + 14;
    tip = { x: target.x, y: target.y + hh + 4 };
  } else if (pointer.side === 'left') {
    x = target.x - hw - gap - 20;
    tip = { x: target.x - hw - 4, y: target.y };
  } else {
    x = target.x + hw + gap + 22;
    tip = { x: target.x + hw + 4, y: target.y };
  }

  return (
    <g className={`viz-pointer tone-${pointer.tone ?? 'primary'}`}>
      <line x1={x} x2={tip.x} y1={y + (pointer.side === 'top' ? 8 : pointer.side === 'bottom' ? -8 : 0)} y2={tip.y} />
      <text dy="0.34em" x={x} y={y + (pointer.side === 'top' ? -2 : pointer.side === 'bottom' ? 4 : 0)}>
        {pointer.label}
      </text>
    </g>
  );
}

type StructureVizProps = {
  scene: VizScene;
  compact?: boolean;
};

export function StructureViz({ scene, compact = false }: StructureVizProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [showCode, setShowCode] = useState(!compact);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);

  const total = scene.frames.length;
  const frame = scene.frames[Math.min(frameIndex, total - 1)];
  const legend = useMemo(() => collectLegend(scene), [scene]);
  const display = useAnimatedFrame(frame, BASE_TWEEN_MS / speed, reducedMotion);
  const nodeMap = useMemo(() => new Map(display.nodes.map((node) => [node.id, node])), [display.nodes]);

  useEffect(() => {
    setFrameIndex(0);
    setPlaying(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [scene]);

  useEffect(() => {
    if (!playing) {
      return;
    }

    if (frameIndex >= total - 1) {
      setPlaying(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setFrameIndex((index) => Math.min(index + 1, total - 1));
    }, BASE_FRAME_MS / speed);

    return () => window.clearTimeout(timer);
  }, [playing, frameIndex, speed, total]);

  const goTo = (index: number) => {
    setPlaying(false);
    setFrameIndex(Math.max(0, Math.min(index, total - 1)));
  };

  const onPointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    dragRef.current = { startX: event.clientX, startY: event.clientY, panX: pan.x, panY: pan.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current) return;
    setPan({
      x: dragRef.current.panX + (event.clientX - dragRef.current.startX),
      y: dragRef.current.panY + (event.clientY - dragRef.current.startY),
    });
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  return (
    <div className={`viz ${compact ? 'is-compact' : ''}`}>
      <div className="viz-toolbar">
        <div className="viz-operation">
          <span className="viz-operation-name">{scene.operation}</span>
          <span className="viz-complexity" title="Complexidade da operação">
            {scene.complexity}
          </span>
        </div>
        <div className="viz-zoom" role="group" aria-label="Zoom da visualização">
          <button aria-label="Aproximar" onClick={() => setZoom((value) => Math.min(2.4, value * 1.25))} type="button">
            <ZoomIn aria-hidden="true" size={15} />
          </button>
          <button aria-label="Afastar" onClick={() => setZoom((value) => Math.max(0.5, value / 1.25))} type="button">
            <ZoomOut aria-hidden="true" size={15} />
          </button>
          <button
            aria-label="Restaurar enquadramento"
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            type="button"
          >
            <Maximize2 aria-hidden="true" size={15} />
          </button>
        </div>
      </div>

      <svg
        className="viz-canvas"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Visualização animada: ${scene.operation}`}
        viewBox={`0 0 ${scene.width} ${scene.height}`}
      >
        <defs>
          {(['default', 'inserted', 'found', 'removed'] as const).map((state) => (
            <marker
              id={`viz-arrow-${state}`}
              key={state}
              markerHeight="7"
              markerWidth="8"
              orient="auto-start-reverse"
              refX="7"
              refY="3.5"
            >
              <path className={`viz-arrowhead is-${state}`} d="M0,0 L8,3.5 L0,7 Z" />
            </marker>
          ))}
          <pattern height="26" id="viz-grid" patternUnits="userSpaceOnUse" width="26">
            <circle className="viz-grid-dot" cx="1.5" cy="1.5" r="1.5" />
          </pattern>
        </defs>
        <rect fill="url(#viz-grid)" height="100%" width="100%" />
        <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
          {frame.edges.map((edge) => (
            <EdgeShape edge={{ ...edge, opacity: display.edgeOpacity.get(edge.id) ?? 1 }} key={edge.id} nodes={nodeMap} />
          ))}
          {display.nodes.map((node) => (
            <NodeShape key={node.id} node={node} />
          ))}
          {frame.pointers.map((pointer) => (
            <PointerShape key={pointer.id} nodes={nodeMap} pointer={pointer} />
          ))}
        </g>
      </svg>

      <div aria-live="polite" className="viz-caption">
        <span className="viz-step-count">
          Passo {Math.min(frameIndex + 1, total)}/{total}
        </span>
        <p>{frame.caption}</p>
      </div>

      {frame.vars && frame.vars.length > 0 && (
        <div aria-label="Variáveis importantes" className="viz-vars">
          {frame.vars.map((item) => (
            <span className="viz-var" key={item.name}>
              <span className="viz-var-name">{item.name}</span>
              <span className="viz-var-value">{item.value}</span>
            </span>
          ))}
        </div>
      )}

      <div className="viz-controls" role="group" aria-label="Controles da animação">
        <button aria-label="Reiniciar animação" onClick={() => goTo(0)} type="button">
          <RotateCcw aria-hidden="true" size={15} />
        </button>
        <button aria-label="Passo anterior" disabled={frameIndex === 0} onClick={() => goTo(frameIndex - 1)} type="button">
          <ChevronLeft aria-hidden="true" size={17} />
        </button>
        <button
          aria-label={playing ? 'Pausar' : 'Executar automaticamente'}
          className="viz-play"
          onClick={() => {
            if (!playing && frameIndex >= total - 1) {
              setFrameIndex(0);
            }
            setPlaying((value) => !value);
          }}
          type="button"
        >
          {playing ? <Pause aria-hidden="true" size={17} /> : <Play aria-hidden="true" size={17} />}
        </button>
        <button
          aria-label="Próximo passo"
          disabled={frameIndex >= total - 1}
          onClick={() => goTo(frameIndex + 1)}
          type="button"
        >
          <ChevronRight aria-hidden="true" size={17} />
        </button>
        <label className="viz-speed">
          <span>Velocidade</span>
          <select onChange={(event) => setSpeed(Number(event.target.value) as (typeof SPEEDS)[number])} value={speed}>
            {SPEEDS.map((value) => (
              <option key={value} value={value}>
                {value}×
              </option>
            ))}
          </select>
        </label>
        <button
          aria-pressed={showCode}
          className={`viz-code-toggle ${showCode ? 'is-on' : ''}`}
          onClick={() => setShowCode((value) => !value)}
          type="button"
        >
          <Code2 aria-hidden="true" size={15} />
          Código
        </button>
      </div>

      <div className="viz-progress" aria-hidden="true">
        {scene.frames.map((_, index) => (
          <button
            className={`viz-progress-dot ${index === frameIndex ? 'is-current' : index < frameIndex ? 'is-done' : ''}`}
            key={index}
            onClick={() => goTo(index)}
            tabIndex={-1}
            type="button"
          />
        ))}
      </div>

      {showCode && (
        <pre className="viz-code" aria-label="Pseudocódigo da operação">
          {scene.code.map((line, index) => (
            <span className={`viz-code-line ${frame.codeLine === index ? 'is-current' : ''}`} key={index}>
              <span className="viz-code-gutter">{index + 1}</span>
              {line}
            </span>
          ))}
        </pre>
      )}

      {legend.length > 0 && (
        <ul className="viz-legend" aria-label="Legenda dos estados">
          {legend.map((state) => (
            <li className={`viz-legend-item is-${state}`} key={state}>
              <span className="viz-legend-dot">{stateLegend[state].badge}</span>
              {stateLegend[state].label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type StructureVizCardProps = {
  visual: StructureVisual;
  compact?: boolean;
};

/** Cartão usado nas questões: título/legenda do conteúdo + cena animada. */
export function StructureVizCard({ visual, compact = true }: StructureVizCardProps) {
  const scene = useMemo(() => buildSceneForVisual(visual), [visual]);

  return (
    <figure className={`structure-visual is-${visual.kind}`}>
      <figcaption>
        <strong>{visual.title}</strong>
        <span>{visual.caption}</span>
      </figcaption>
      <StructureViz compact={compact} scene={scene} />
    </figure>
  );
}
