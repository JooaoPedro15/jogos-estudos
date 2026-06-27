import { detectCombos } from '../cards/cardCombos';
import type { CardCombo } from '../cards/cardCombos';
import type { CardId } from '../cards/cardLibrary';

export type ScoreEncounterInput = {
  /** Pontuação bruta acumulada nas etapas resolvidas (do `EncounterProgress`). */
  stepScore: number;
  /** Cartas-ferramenta jogadas no encontro (para detectar combos de uso). */
  playedCardIds: readonly CardId[];
  /** Bônus fixo de pontuação aplicado depois do multiplicador (passivas/encontro). */
  flatBonus?: number;
};

export type ScoreEncounterResult = {
  score: number;
  comboMultiplier: number;
  activeCombos: CardCombo[];
};

/**
 * Score do encontro = (pontuação acumulada nas etapas × multiplicador de combos)
 * + bônus fixo. Reorienta o scoring de "casou cartas obrigatórias" para
 * "pontuação acumulada nas etapas", como pede o design.
 */
export function scoreEncounter(input: ScoreEncounterInput): ScoreEncounterResult {
  const activeCombos = detectCombos(input.playedCardIds);
  const comboMultiplier = activeCombos.reduce(
    (multiplier, combo) => multiplier * combo.multiplier,
    1,
  );
  const flatBonus = input.flatBonus ?? 0;
  const score = Math.round(input.stepScore * comboMultiplier) + flatBonus;

  return { score, comboMultiplier, activeCombos };
}

/** Apenas o multiplicador de combos para as cartas jogadas. */
export function comboMultiplierFor(playedCardIds: readonly CardId[]): {
  multiplier: number;
  activeCombos: CardCombo[];
} {
  const activeCombos = detectCombos(playedCardIds);
  const multiplier = activeCombos.reduce((acc, combo) => acc * combo.multiplier, 1);

  return { multiplier, activeCombos };
}
