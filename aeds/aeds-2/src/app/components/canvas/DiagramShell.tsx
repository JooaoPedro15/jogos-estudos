import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';

export type DiagramTone = 'success' | 'error';

export type DiagramShellProps = {
  /** Largura/altura do viewBox calculadas pelo layout da estrutura. */
  width: number;
  height: number;
  ariaLabel: string;
  className?: string;
  /** Narracao curta do passo atual, desenhada sobre o canvas. */
  caption?: string;
  /** Tom semantico aplicado ao destaque ativo (acerto/erro). */
  tone?: DiagramTone;
  children: ReactNode;
};

const MIN_SCALE = 0.4;
const MAX_SCALE = 2.6;
const SCALE_STEP = 1.25;

/**
 * Moldura compartilhada dos diagramas: viewBox dinamico, zoom, pan por arrasto
 * e "ajustar a tela". Inspirada nos visualizadores de Galles (USFCA), mas com a
 * identidade visual do jogo. Os filhos sao desenhados dentro de um <g>
 * transformado, entao zoom/pan nunca mexem no layout logico da estrutura.
 */
export function DiagramShell({
  width,
  height,
  ariaLabel,
  className,
  caption,
  tone,
  children,
}: DiagramShellProps) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragState = useRef<
    { pointerId: number; startX: number; startY: number; baseX: number; baseY: number } | undefined
  >(undefined);
  const svgRef = useRef<SVGSVGElement>(null);

  const zoomBy = (factor: number) => {
    setScale((current) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, current * factor)));
  };

  const handleFit = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    // Nao inicia pan a partir de um no clicavel (etapas kind "clique").
    if ((event.target as Element).closest('.is-clickable')) {
      return;
    }

    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      baseX: offset.x,
      baseY: offset.y,
    };
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId || !svgRef.current) {
      return;
    }

    // Converte o deslocamento em pixels de tela para unidades do viewBox.
    const bounds = svgRef.current.getBoundingClientRect();
    const unitPerPixel = bounds.width > 0 ? width / bounds.width : 1;
    setOffset({
      x: drag.baseX + (event.clientX - drag.startX) * unitPerPixel,
      y: drag.baseY + (event.clientY - drag.startY) * unitPerPixel,
    });
  };

  const handlePointerUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (dragState.current?.pointerId === event.pointerId) {
      dragState.current = undefined;
    }
  };

  const isTransformed = scale !== 1 || offset.x !== 0 || offset.y !== 0;

  return (
    <div className={`diagram-shell${tone ? ` tone-${tone}` : ''}`}>
      <svg
        ref={svgRef}
        className={className ?? 'structure-sketch'}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <g
          className="diagram-viewport"
          transform={`translate(${offset.x} ${offset.y}) scale(${scale})`}
        >
          {children}
        </g>
      </svg>

      {caption ? <p className="diagram-caption-overlay">{caption}</p> : null}

      <div className="diagram-zoom" role="group" aria-label="Controles de zoom">
        <button type="button" aria-label="Aumentar zoom" onClick={() => zoomBy(SCALE_STEP)}>
          +
        </button>
        <button type="button" aria-label="Diminuir zoom" onClick={() => zoomBy(1 / SCALE_STEP)}>
          −
        </button>
        <button
          type="button"
          aria-label="Ajustar a tela"
          onClick={handleFit}
          disabled={!isTransformed}
        >
          ⤢
        </button>
      </div>
    </div>
  );
}
