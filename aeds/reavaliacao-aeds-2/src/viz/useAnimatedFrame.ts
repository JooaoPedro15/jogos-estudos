import { useEffect, useRef, useState } from 'react';

import type { VizFrame, VizNode } from './vizTypes';

export type DisplayNode = VizNode & {
  opacity: number;
  scale: number;
};

type DisplayState = {
  nodes: DisplayNode[];
  edgeOpacity: Map<string, number>;
};

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function toDisplay(frame: VizFrame): DisplayState {
  return {
    nodes: frame.nodes.map((node) => ({ ...node, opacity: node.state === 'muted' ? 0.45 : 1, scale: 1 })),
    edgeOpacity: new Map(frame.edges.map((edge) => [edge.id, 1])),
  };
}

/**
 * Interpola posições/opacidade entre quadros com requestAnimationFrame.
 * Nós com o mesmo id deslizam; nós novos surgem; nós ausentes somem.
 * Com movimento reduzido a troca é instantânea.
 */
export function useAnimatedFrame(frame: VizFrame, durationMs: number, reducedMotion: boolean): DisplayState {
  const [display, setDisplay] = useState<DisplayState>(() => toDisplay(frame));
  const displayRef = useRef(display);
  displayRef.current = display;
  const rafRef = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);

    if (reducedMotion || durationMs <= 1 || typeof requestAnimationFrame !== 'function') {
      setDisplay(toDisplay(frame));
      return;
    }

    const fromNodes = new Map(displayRef.current.nodes.map((node) => [node.id, node]));
    const fromEdges = displayRef.current.edgeOpacity;
    const targetIds = new Set(frame.nodes.map((node) => node.id));
    const targetEdgeIds = new Set(frame.edges.map((edge) => edge.id));

    type NodeTween = { from: DisplayNode; to: DisplayNode };
    const tweens: NodeTween[] = [];

    for (const node of frame.nodes) {
      const targetOpacity = node.state === 'muted' ? 0.45 : 1;
      const existing = fromNodes.get(node.id);
      const from: DisplayNode = existing
        ? { ...node, x: existing.x, y: existing.y, opacity: existing.opacity, scale: existing.scale }
        : { ...node, opacity: 0, scale: 0.4 };
      tweens.push({ from, to: { ...node, opacity: targetOpacity, scale: 1 } });
    }

    for (const node of displayRef.current.nodes) {
      if (!targetIds.has(node.id)) {
        tweens.push({ from: node, to: { ...node, opacity: 0, scale: 0.4 } });
      }
    }

    type EdgeTween = { id: string; from: number; to: number };
    const edgeTweens: EdgeTween[] = [];

    for (const edge of frame.edges) {
      edgeTweens.push({ id: edge.id, from: fromEdges.get(edge.id) ?? 0, to: 1 });
    }

    for (const [id, opacity] of fromEdges) {
      if (!targetEdgeIds.has(id)) {
        edgeTweens.push({ id, from: opacity, to: 0 });
      }
    }

    const start = performance.now();

    const tick = (now: number) => {
      const raw = Math.min(1, (now - start) / durationMs);
      const t = easeInOut(raw);

      setDisplay({
        nodes: tweens
          .map(({ from, to }) => ({
            ...to,
            x: from.x + (to.x - from.x) * t,
            y: from.y + (to.y - from.y) * t,
            opacity: from.opacity + (to.opacity - from.opacity) * t,
            scale: from.scale + (to.scale - from.scale) * t,
          }))
          .filter((node) => node.opacity > 0.02),
        edgeOpacity: new Map(
          edgeTweens
            .map(({ id, from, to }) => [id, from + (to - from) * t] as const)
            .filter(([, opacity]) => opacity > 0.02),
        ),
      });

      if (raw < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame, durationMs, reducedMotion]);

  return display;
}
