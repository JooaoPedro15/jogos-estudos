import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import type { TreeVisualState } from '../../types/structures';
import { StructureDiagram } from './StructureDiagram';

const tree: TreeVisualState = {
  id: 'teste-abb',
  kind: 'tree',
  root: {
    id: 'n40',
    label: '40',
    left: { id: 'n20', label: '20' },
    right: {
      id: 'n60',
      label: '60',
      left: { id: 'n50', label: '50' },
    },
  },
};

describe('StructureDiagram — animacao de caminho', () => {
  it('escalona a visita dos nos do activePath com --path-i sequencial', () => {
    const { container } = render(
      <StructureDiagram
        structure="abb"
        visualState={tree}
        activePath={['n40', 'n60', 'n50']}
        activeNodeId="n50"
      />,
    );

    const n40 = container.querySelector('[data-node-id="n40"]') as HTMLElement;
    const n60 = container.querySelector('[data-node-id="n60"]') as HTMLElement;
    const n50 = container.querySelector('[data-node-id="n50"]') as HTMLElement;
    const n20 = container.querySelector('[data-node-id="n20"]') as HTMLElement;

    expect(n40.classList.contains('on-path')).toBe(true);
    expect(n40.style.getPropertyValue('--path-i')).toBe('0');
    expect(n60.style.getPropertyValue('--path-i')).toBe('1');
    expect(n50.style.getPropertyValue('--path-i')).toBe('2');
    expect(n50.classList.contains('is-active')).toBe(true);
    expect(n20.classList.contains('on-path')).toBe(false);
  });

  it('posiciona nos via transform para permitir transicao de layout', () => {
    const { container } = render(<StructureDiagram structure="abb" visualState={tree} />);

    const n40 = container.querySelector('[data-node-id="n40"]');
    expect(n40?.getAttribute('transform')).toMatch(/^translate\(/);
  });

  it('desenha arestas com seta (marker) encurtadas ate a borda do no', () => {
    const { container } = render(<StructureDiagram structure="abb" visualState={tree} />);

    const edges = container.querySelectorAll('path.tree-edge');
    expect(edges.length).toBe(3);
    for (const edge of edges) {
      expect(edge.getAttribute('marker-end')).toMatch(/^url\(#/);
    }
  });
});

describe('StructureDiagram — tom semantico e canvas', () => {
  it('aplica tone-error no shell quando a resposta foi errada', () => {
    const { container } = render(
      <StructureDiagram structure="abb" visualState={tree} activeNodeId="n40" tone="error" />,
    );

    expect(container.querySelector('.diagram-shell.tone-error')).not.toBeNull();
  });

  it('mostra a narracao do passo quando caption e informada', () => {
    render(
      <StructureDiagram structure="abb" visualState={tree} caption="Passo 1/4: Comparar com 40" />,
    );

    expect(screen.getByText('Passo 1/4: Comparar com 40')).toBeInTheDocument();
  });

  it('oferece zoom com aumentar/diminuir/ajustar', async () => {
    const user = userEvent.setup();
    const { container } = render(<StructureDiagram structure="abb" visualState={tree} />);

    const viewport = () => container.querySelector('.diagram-viewport') as SVGGElement;
    expect(viewport().getAttribute('transform')).toBe('translate(0 0) scale(1)');

    await user.click(screen.getByRole('button', { name: 'Aumentar zoom' }));
    expect(viewport().getAttribute('transform')).toBe('translate(0 0) scale(1.25)');

    await user.click(screen.getByRole('button', { name: 'Ajustar a tela' }));
    expect(viewport().getAttribute('transform')).toBe('translate(0 0) scale(1)');
  });
});
