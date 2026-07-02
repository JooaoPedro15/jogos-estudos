/**
 * Armazém de estado das estruturas da aba "Estruturas".
 * Vive em nível de módulo: sobrevive a re-renderizações e à troca
 * de abas (o componente desmonta, o estado permanece).
 */

const states = new Map<string, unknown>();

export function getStructureState<S>(id: string, initial: () => S): S {
  if (!states.has(id)) {
    states.set(id, initial());
  }
  return states.get(id) as S;
}

export function setStructureState<S>(id: string, state: S): void {
  states.set(id, state);
}

export function resetStructureState<S>(id: string, empty: () => S): void {
  states.set(id, empty());
}

export function resetAllStructureStates(entries: Array<{ id: string; empty: () => unknown }>): void {
  for (const entry of entries) {
    states.set(entry.id, entry.empty());
  }
}
