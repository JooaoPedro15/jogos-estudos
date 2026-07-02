import { describe, expect, test } from 'vitest';

import { buildLabOperation, createInitialLabTree } from './labSimulation';

function collectLabels(node: { label: string; left?: unknown; right?: unknown } | undefined): string[] {
  if (!node) {
    return [];
  }

  const left = 'left' in node ? (node.left as { label: string; left?: unknown; right?: unknown } | undefined) : undefined;
  const right = 'right' in node ? (node.right as { label: string; left?: unknown; right?: unknown } | undefined) : undefined;

  return [node.label, ...collectLabels(left), ...collectLabels(right)];
}

describe('labSimulation', () => {
  test('builds insert animation from the typed value instead of a hardcoded example', () => {
    const operation = buildLabOperation('Inserir', '1', createInitialLabTree());
    const stepText = operation.steps.map((step) => `${step.title} ${step.description}`).join(' ');
    const finalStep = operation.steps[operation.steps.length - 1];
    const finalRoot = finalStep?.visualState.kind === 'tree' ? finalStep.visualState.root : undefined;
    const finalLabels = collectLabels(finalRoot);

    expect(operation.label).toBe('Inserir 1');
    expect(stepText).toContain('1');
    expect(stepText).not.toContain('42');
    expect(finalLabels).toContain('1');
  });

  test('describes the actual ABB path for inserting 1', () => {
    const operation = buildLabOperation('Inserir', '1', createInitialLabTree());

    expect(operation.steps).toHaveLength(4);
    expect(operation.steps[0].title).toBe('Comparar com 40');
    expect(operation.steps[1].title).toBe('Descer para 20');
    expect(operation.steps[2].title).toBe('Descer para 10');
  });
});
