/**
 * Utilidades de deck genéricas (shuffle/draw) com reembaralhamento do descarte.
 * O RNG é injetável para testes determinísticos; em produção usa `Math.random`.
 *
 * Convenção: o RNG retorna um número em [0, 1), como `Math.random`.
 */
export type Rng = () => number;

const defaultRng: Rng = Math.random;

/**
 * Embaralha uma cópia de `cards` com Fisher-Yates (de trás para frente).
 * Não muta o array de entrada.
 */
export function shuffle<T>(cards: readonly T[], rng: Rng = defaultRng): T[] {
  const result = [...cards];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }

  return result;
}

export type DrawResult<T> = {
  hand: T[];
  deck: T[];
  discard: T[];
};

/**
 * Compra `n` cartas do topo do `deck`. Quando o deck esvazia antes de completar
 * `n`, o `discard` é embaralhado e vira o novo deck. Se ainda assim faltarem
 * cartas, devolve a mão parcial (não há de onde tirar). Não muta as entradas.
 */
export function draw<T>(
  deck: readonly T[],
  discard: readonly T[],
  n: number,
  rng: Rng = defaultRng,
): DrawResult<T> {
  const hand: T[] = [];
  let remainingDeck: T[] = [...deck];
  let remainingDiscard: T[] = [...discard];

  while (hand.length < n) {
    if (remainingDeck.length === 0) {
      if (remainingDiscard.length === 0) {
        break; // Não há mais cartas para comprar.
      }

      remainingDeck = shuffle(remainingDiscard, rng);
      remainingDiscard = [];
    }

    const [next, ...rest] = remainingDeck;
    hand.push(next);
    remainingDeck = rest;
  }

  return {
    hand,
    deck: remainingDeck,
    discard: remainingDiscard,
  };
}
