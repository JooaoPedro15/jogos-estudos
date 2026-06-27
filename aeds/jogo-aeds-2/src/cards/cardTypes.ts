import type { StructureKind } from '../types/challenge';

export type CardCategory =
  | 'base'
  | 'percurso'
  | 'condicao'
  | 'combinacao'
  | 'complexidade'
  | 'modificador';

/**
 * Efeito ativo de uma carta-ferramenta dentro de um encontro. O engine
 * (`stepEngine.applyToolEffect`) decide o que cada um faz; a UI apenas dispara.
 */
export type ToolEffect =
  | 'revelarDica'
  | 'eliminarAlternativa'
  | 'pularEtapa'
  | 'escudoFoco'
  | 'dobrarScore'
  | 'energiaExtra';

export type CardRarity = 'comum' | 'incomum' | 'rara';

export type AedsCard = {
  id: string;
  name: string;
  category: CardCategory;
  structureTags: readonly StructureKind[];
  concept: string;
  code: string;
  energyCost: number;
  rarity: CardRarity;
  /** Efeito que a carta aplica ao ser jogada durante um encontro. */
  effect: ToolEffect;
  /** Parâmetro opcional do efeito (ex.: energia extra concedida). */
  effectValue?: number;
};
