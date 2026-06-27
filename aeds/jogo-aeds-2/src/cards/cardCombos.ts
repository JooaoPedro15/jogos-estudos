import type { CardId } from './cardLibrary';

export type CardCombo = {
  id: string;
  name: string;
  requiredCardIds: CardId[];
  multiplier: number;
  explanation: string;
};

/**
 * Combos agora reconhecem padrões de USO de ferramentas dentro de um encontro
 * (ex.: revelar a dica e depois apostar dobrado). Permanecem como multiplicadores
 * de score, alimentados pela lista de cartas jogadas no encontro.
 */
export const cardCombos: CardCombo[] = [
  {
    id: 'leitura-cuidadosa',
    name: 'Leitura Cuidadosa',
    requiredCardIds: ['revelar-dica', 'eliminar-alternativa'],
    multiplier: 1.3,
    explanation: 'Revela a dica e elimina uma alternativa antes de decidir, reduzindo o risco.',
  },
  {
    id: 'aposta-informada',
    name: 'Aposta Informada',
    requiredCardIds: ['revelar-dica', 'aposta-dobrada'],
    multiplier: 1.5,
    explanation: 'Consulta a dica e entao dobra o score do acerto seguinte com seguranca.',
  },
  {
    id: 'defesa-calculada',
    name: 'Defesa Calculada',
    requiredCardIds: ['escudo-foco', 'eliminar-alternativa'],
    multiplier: 1.4,
    explanation: 'Protege o foco e estreita as opcoes, ideal para etapas dificeis de simulacao.',
  },
  {
    id: 'folego-renovado',
    name: 'Folego Renovado',
    requiredCardIds: ['cafe-forte', 'aposta-dobrada'],
    multiplier: 1.4,
    explanation: 'Recupera energia e converte em uma aposta dobrada na proxima etapa.',
  },
];

export function detectCombos(playedCardIds: readonly CardId[]): CardCombo[] {
  const playedCards = new Set<CardId>(playedCardIds);

  return cardCombos.filter((combo) =>
    combo.requiredCardIds.every((cardId) => playedCards.has(cardId)),
  );
}
