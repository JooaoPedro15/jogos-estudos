import { describe, expect, it } from 'vitest';

import { draw, shuffle } from './deck';

/**
 * RNG fake determinístico: devolve, em sequência, os valores fornecidos (em [0,1)).
 * Permite prever exatamente a saída do Fisher-Yates.
 */
function fakeRng(values: number[]): () => number {
  let index = 0;
  return () => {
    const value = values[index % values.length];
    index += 1;
    return value;
  };
}

describe('shuffle', () => {
  it('returns a permutation with the same elements', () => {
    const cards = ['a', 'b', 'c', 'd', 'e'];
    const shuffled = shuffle(cards, fakeRng([0.1, 0.5, 0.9, 0.3]));

    expect([...shuffled].sort()).toEqual([...cards].sort());
    expect(shuffled).toHaveLength(cards.length);
  });

  it('does not mutate the input array', () => {
    const cards = ['a', 'b', 'c'];
    const snapshot = [...cards];

    shuffle(cards, fakeRng([0, 0, 0]));

    expect(cards).toEqual(snapshot);
  });

  it('is deterministic for a given rng sequence', () => {
    const cards = ['a', 'b', 'c', 'd'];
    const first = shuffle(cards, fakeRng([0, 0.34, 0.67, 0.5]));
    const second = shuffle(cards, fakeRng([0, 0.34, 0.67, 0.5]));

    expect(first).toEqual(second);
  });

  it('produces the deterministic Fisher-Yates result when rng -> 0', () => {
    // Com floor(rng*(i+1)) = 0, cada passo troca result[i] com result[0]:
    // [a,b,c,d] -> (i3) [d,b,c,a] -> (i2) [c,b,d,a] -> (i1) [b,c,d,a].
    const cards = ['a', 'b', 'c', 'd'];

    expect(shuffle(cards, fakeRng([0, 0, 0, 0]))).toEqual(['b', 'c', 'd', 'a']);
  });
});

describe('draw', () => {
  it('draws n cards off the top of the deck', () => {
    const result = draw(['a', 'b', 'c', 'd', 'e'], [], 3, fakeRng([0, 0, 0, 0, 0]));

    expect(result.hand).toHaveLength(3);
    expect(result.deck).toHaveLength(2);
    expect([...result.hand, ...result.deck].sort()).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(result.discard).toEqual([]);
  });

  it('draws fewer cards when deck and discard cannot cover n', () => {
    const result = draw(['a', 'b'], [], 5, fakeRng([0, 0, 0]));

    expect(result.hand).toHaveLength(2);
    expect(result.deck).toHaveLength(0);
    expect(result.discard).toHaveLength(0);
  });

  it('reshuffles the discard pile into the deck when the deck empties mid-draw', () => {
    // deck tem 1 carta, discard tem 3; pedir 3 força reshuffle do descarte.
    const result = draw(['a'], ['b', 'c', 'd'], 3, fakeRng([0, 0, 0, 0]));

    expect(result.hand).toHaveLength(3);
    expect([...result.hand, ...result.deck].sort()).toEqual(['a', 'b', 'c', 'd']);
    // O descarte foi consumido para repor o deck.
    expect(result.discard).toEqual([]);
  });

  it('does not mutate the input deck or discard arrays', () => {
    const deck = ['a', 'b', 'c'];
    const discard = ['x', 'y'];
    const deckSnapshot = [...deck];
    const discardSnapshot = [...discard];

    draw(deck, discard, 2, fakeRng([0, 0]));

    expect(deck).toEqual(deckSnapshot);
    expect(discard).toEqual(discardSnapshot);
  });

  it('is deterministic for a given rng sequence', () => {
    const first = draw(['a', 'b', 'c'], ['d', 'e'], 4, fakeRng([0.2, 0.7, 0.1, 0.9]));
    const second = draw(['a', 'b', 'c'], ['d', 'e'], 4, fakeRng([0.2, 0.7, 0.1, 0.9]));

    expect(first).toEqual(second);
  });
});
