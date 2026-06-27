import { describe, expect, it } from 'vitest';

import {
  advanceEncounter,
  answerStep,
  chooseCardReward,
  choosePassiveReward,
  createNewRun,
  getCardEnergyCost,
  getCurrentChallenge,
  getCurrentEncounter,
  getCurrentStep,
  playCard,
} from './runEngine';
import type { RunState } from './runState';
import type { ChallengeStep } from '../types/challenge';
import type { StepAnswer } from './stepEngine';

// RNG determinístico (rng -> 0) para compras de mão previsíveis nos testes.
function zeroRng(): () => number {
  return () => 0;
}

function correctAnswerFor(step: ChallengeStep): StepAnswer {
  switch (step.kind) {
    case 'interpretar':
    case 'simular':
    case 'complexidade':
      return { kind: 'choice', optionId: step.correctOptionId };
    case 'lacuna':
      return { kind: 'gap', text: step.answers[0].answer };
    case 'blocos':
      return { kind: 'blocks', order: [...step.correctOrder] };
    case 'revisao':
      return { kind: 'review' };
  }
}

function answerAllCorrectly(run: RunState): RunState {
  let current = run;
  const challenge = getCurrentChallenge(current);

  if (!challenge) {
    return current;
  }

  for (const step of challenge.steps) {
    current = answerStep(current, correctAnswerFor(step));
  }

  return current;
}

describe('createNewRun', () => {
  it('starts at the first encounter with a drawn hand and fresh progress', () => {
    const run = createNewRun({ rng: zeroRng() });

    expect(run.phase).toBe('encounter');
    expect(run.focus).toBe(3);
    expect(run.energy).toBe(4);
    expect(run.coins).toBe(0);
    expect(run.score).toBe(0);
    expect(run.encounterIndex).toBe(0);
    expect(run.handCardIds).toHaveLength(5);
    expect(run.deckCardIds).toHaveLength(3); // 8 inicial - 5 na mão
    expect(run.progress.challengeId).toBe('abb-pesquisar-01');
    expect(run.progress.stepIndex).toBe(0);
    expect(getCurrentEncounter(run)?.id).toBe('ato1-abb-pesquisa');
  });
});

describe('playCard', () => {
  it('spends energy and discards the card while applying its effect', () => {
    const run = createNewRun({
      deckCardIds: ['revelar-dica'],
      handCardIds: ['revelar-dica'],
    });

    const next = playCard(run, 'revelar-dica');

    expect(getCardEnergyCost(run, 'revelar-dica')).toBe(1);
    expect(next.energy).toBe(3);
    expect(next.handCardIds).toEqual([]);
    expect(next.discardCardIds).toContain('revelar-dica');
    expect(next.playedCardIds).toEqual(['revelar-dica']);
    // revelarDica marca a etapa atual como dica revelada.
    const stepId = getCurrentStep(run)?.id;
    expect(next.progress.revealedHintStepIds).toContain(stepId);
  });

  it('credits extra energy from energiaExtra cards (capped at maxEnergy)', () => {
    const run = createNewRun({
      deckCardIds: ['cafe-forte'],
      handCardIds: ['cafe-forte'],
      energy: 2,
      maxEnergy: 4,
    });

    // cafe-forte custa 0 e dá +3, mas o teto é maxEnergy (4).
    const next = playCard(run, 'cafe-forte');

    expect(next.energy).toBe(4);
  });

  it('refuses to play a card with insufficient energy', () => {
    const run = createNewRun({
      deckCardIds: ['aposta-dobrada'],
      handCardIds: ['aposta-dobrada'],
      energy: 1,
    });

    const next = playCard(run, 'aposta-dobrada');

    expect(next.energy).toBe(1);
    expect(next.handCardIds).toEqual(['aposta-dobrada']);
    expect(next.lastMessage).toContain('Energia insuficiente');
  });
});

describe('answerStep', () => {
  it('awards step score and advances to the next step on a correct answer', () => {
    const run = createNewRun();
    const step = getCurrentStep(run)!;

    const next = answerStep(run, correctAnswerFor(step));

    expect(next.phase).toBe('encounter');
    expect(next.progress.stepIndex).toBe(1);
    expect(next.progress.scoreThisEncounter).toBe(10);
    expect(next.lastResult?.correct).toBe(true);
  });

  it('loses one focus on a wrong answer but keeps the encounter active', () => {
    const run = createNewRun();
    const step = getCurrentStep(run)!;
    const wrongOption =
      step.kind === 'interpretar' && step.options.find((o) => o.id !== step.correctOptionId);

    const next = answerStep(run, {
      kind: 'choice',
      optionId: wrongOption ? wrongOption.id : 'zzz',
    });

    expect(next.phase).toBe('encounter');
    expect(next.focus).toBe(2);
    expect(next.lastResult?.correct).toBe(false);
    expect(next.progress.stepErrors[step.id]).toBe(1);
  });

  it('reaches reward phase after resolving every step of a normal encounter', () => {
    const completed = answerAllCorrectly(createNewRun());

    expect(completed.phase).toBe('reward');
    expect(completed.progress.complete).toBe(true);
    expect(completed.score).toBeGreaterThan(0);
    expect(completed.coins).toBeGreaterThan(0);
    expect(completed.lastResult?.correct).toBe(true);
  });

  it('ends in defeat when focus reaches zero', () => {
    const run = createNewRun({ focus: 1 });
    const step = getCurrentStep(run)!;
    const wrongOption =
      step.kind === 'interpretar' ? step.options.find((o) => o.id !== step.correctOptionId) : undefined;

    const next = answerStep(run, { kind: 'choice', optionId: wrongOption?.id ?? 'zzz' });

    expect(next.phase).toBe('defeat');
    expect(next.focus).toBe(0);
  });

  it('applies dobrarScore from a played card to the next correct step', () => {
    const run = createNewRun({
      deckCardIds: ['aposta-dobrada'],
      handCardIds: ['aposta-dobrada'],
    });
    const afterCard = playCard(run, 'aposta-dobrada');
    const step = getCurrentStep(afterCard)!;

    const next = answerStep(afterCard, correctAnswerFor(step));

    expect(next.progress.scoreThisEncounter).toBe(20);
  });
});

describe('rewards and progression', () => {
  it('adds a card reward and advances to the next encounter with a fresh hand', () => {
    const rewardRun = answerAllCorrectly(createNewRun({ rng: zeroRng() }));
    const rewardCard = getCurrentEncounter(rewardRun)!.rewardCardIds[0];

    const nextRun = chooseCardReward(rewardRun, rewardCard);

    expect(nextRun.phase).toBe('encounter');
    expect(nextRun.encounterIndex).toBe(1);
    expect(nextRun.deckCardIds.length + nextRun.handCardIds.length).toBeGreaterThan(0);
    expect(nextRun.energy).toBe(nextRun.maxEnergy);
    expect(nextRun.progress.challengeId).toBe('abb-contar-folhas-01');
    expect(getCurrentEncounter(nextRun)?.id).toBe('ato1-abb-folhas');
  });

  it('adds a passive reward and advances to the next encounter', () => {
    const rewardRun = answerAllCorrectly(createNewRun({ rng: zeroRng() }));

    const nextRun = choosePassiveReward(rewardRun, 'mestre-recursao');

    expect(nextRun.phase).toBe('encounter');
    expect(nextRun.encounterIndex).toBe(1);
    expect(nextRun.passiveIds).toContain('mestre-recursao');
  });

  it('wins the run when the final boss encounter is solved', () => {
    const run = createNewRun({ encounterIndex: 13, rng: zeroRng() });

    expect(getCurrentEncounter(run)?.kind).toBe('boss');

    const resolved = answerAllCorrectly(run);

    expect(resolved.phase).toBe('victory');
    expect(resolved.lastResult?.correct).toBe(true);
  });
});

describe('passives in the new flow', () => {
  it('uses Olho da ABB once to discount the first ABB structure card', () => {
    const run = createNewRun({
      passiveIds: ['olho-abb'],
      deckCardIds: ['poda-de-ramo', 'poda-de-ramo'],
      handCardIds: ['poda-de-ramo', 'poda-de-ramo'],
    });

    expect(getCardEnergyCost(run, 'poda-de-ramo')).toBe(0);

    const firstPlay = playCard(run, 'poda-de-ramo');
    expect(firstPlay.energy).toBe(4);
    expect(firstPlay.usedEncounterPassiveIds).toContain('olho-abb');

    const secondPlay = playCard(firstPlay, 'poda-de-ramo');
    expect(secondPlay.energy).toBe(3);
  });

  it('uses Sem Colisao to prevent the first hash focus loss on a wrong answer', () => {
    const hashRun = createNewRun({ encounterIndex: 6, passiveIds: ['sem-colisao'] });
    const step = getCurrentStep(hashRun)!;
    const wrongOption =
      step.kind === 'interpretar' ? step.options.find((o) => o.id !== step.correctOptionId) : undefined;

    expect(getCurrentChallenge(hashRun)?.structure).toBe('hash');

    const resolved = answerStep(hashRun, { kind: 'choice', optionId: wrongOption?.id ?? 'zzz' });

    expect(resolved.focus).toBe(3);
    expect(resolved.consumedPassiveIds).toContain('sem-colisao');
    expect(resolved.lastResult?.preventedFocusLossBy).toBe('sem-colisao');
  });
});

describe('advanceEncounter deck handling', () => {
  it('recycles the hand and discard into the deck when drawing the next hand', () => {
    const run = createNewRun({
      encounterIndex: 0,
      deckCardIds: [],
      handCardIds: ['revelar-dica', 'cafe-forte'],
      discardCardIds: ['escudo-foco', 'pular-etapa', 'aposta-dobrada'],
      phase: 'reward',
    });

    const next = advanceEncounter(run, zeroRng());

    expect(next.encounterIndex).toBe(1);
    // Mão (2) + descarte (3) = 5 cartas recicladas, compra 5.
    expect(next.handCardIds).toHaveLength(5);
    expect(next.discardCardIds).toEqual([]);
    expect(next.playedCardIds).toEqual([]);
  });
});
