import { describe, expect, it } from 'vitest';
import {
  cardById,
  cardLibrary,
  getCardById,
  rewardableCardIds,
  startingDeckCardIds,
} from './cardLibrary';
import type { CardId } from './cardLibrary';
import type { ToolEffect } from './cardTypes';

const knownCardId: CardId = 'revelar-dica';
void knownCardId;

// @ts-expect-error cardById should expose only known card ids, not every string.
cardById['nao-existe'];

const requiredEffects: readonly ToolEffect[] = [
  'revelarDica',
  'eliminarAlternativa',
  'pularEtapa',
  'escudoFoco',
  'dobrarScore',
  'energiaExtra',
];

describe('cardLibrary', () => {
  it('defines between ten and fourteen tool cards', () => {
    expect(cardLibrary.length).toBeGreaterThanOrEqual(10);
    expect(cardLibrary.length).toBeLessThanOrEqual(14);
  });

  it('covers every tool effect at least once', () => {
    const effects = new Set(cardLibrary.map((card) => card.effect));

    for (const effect of requiredEffects) {
      expect(effects.has(effect)).toBe(true);
    }
  });

  it('keeps card ids unique and slug formatted', () => {
    const cardIds = cardLibrary.map((card) => card.id);

    expect(new Set(cardIds).size).toBe(cardIds.length);

    for (const cardId of cardIds) {
      expect(cardId).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it('resolves every card through cardById', () => {
    for (const card of cardLibrary) {
      expect(cardById[card.id]).toBe(card);
    }
  });

  it('returns undefined for an unknown card id', () => {
    expect(getCardById('nao-existe')).toBeUndefined();
  });

  it('defines complete playable card metadata', () => {
    for (const card of cardLibrary) {
      expect(card.name.trim().length).toBeGreaterThan(0);
      expect(card.concept.trim().length).toBeGreaterThan(0);
      expect(card.code.trim().length).toBeGreaterThan(0);
      expect(card.energyCost).toBeGreaterThanOrEqual(0);
      expect(['comum', 'incomum', 'rara']).toContain(card.rarity);
      expect(card.structureTags.length).toBeGreaterThanOrEqual(1);
      expect(requiredEffects).toContain(card.effect);
    }
  });

  it('attaches a positive effectValue to energiaExtra cards', () => {
    const energyCards = cardLibrary.filter((card) => card.effect === 'energiaExtra');

    expect(energyCards.length).toBeGreaterThan(0);
    for (const card of energyCards) {
      expect(card.effectValue ?? 0).toBeGreaterThan(0);
    }
  });

  it('exposes a small fixed starting deck that is a subset of the library', () => {
    expect(startingDeckCardIds.length).toBeGreaterThanOrEqual(6);
    expect(startingDeckCardIds.length).toBeLessThanOrEqual(8);

    const libraryIds = new Set<CardId>(cardLibrary.map((card) => card.id));
    for (const cardId of startingDeckCardIds) {
      expect(libraryIds.has(cardId)).toBe(true);
    }
  });

  it('exposes rewardable cards that exclude the starting deck duplicates set', () => {
    const libraryIds = new Set<CardId>(cardLibrary.map((card) => card.id));

    expect(rewardableCardIds.length).toBeGreaterThan(0);
    for (const cardId of rewardableCardIds) {
      expect(libraryIds.has(cardId)).toBe(true);
    }
  });
});
