import { describe, expect, it } from 'vitest';

import { cardCombos, detectCombos } from './cardCombos';
import type { CardId } from './cardLibrary';

function comboNamesFor(playedCardIds: readonly CardId[]) {
  return detectCombos(playedCardIds).map((combo) => combo.name);
}

describe('cardCombos', () => {
  it('activates Leitura Cuidadosa for reveal hint and eliminate option', () => {
    expect(comboNamesFor(['revelar-dica', 'eliminar-alternativa'])).toContain('Leitura Cuidadosa');
  });

  it('activates Aposta Informada for reveal hint and double score', () => {
    expect(comboNamesFor(['revelar-dica', 'aposta-dobrada'])).toContain('Aposta Informada');
  });

  it('activates Defesa Calculada for focus shield and eliminate option', () => {
    expect(comboNamesFor(['escudo-foco', 'eliminar-alternativa'])).toContain('Defesa Calculada');
  });

  it('activates Folego Renovado for extra energy and double score', () => {
    expect(comboNamesFor(['cafe-forte', 'aposta-dobrada'])).toContain('Folego Renovado');
  });

  it('does not activate a combo when one required card is missing', () => {
    expect(comboNamesFor(['revelar-dica'])).not.toContain('Leitura Cuidadosa');
  });

  it('treats duplicate played cards as the same combo input', () => {
    const activeCombos = detectCombos([
      'revelar-dica',
      'revelar-dica',
      'eliminar-alternativa',
      'eliminar-alternativa',
    ]);

    expect(activeCombos.map((combo) => combo.id)).toEqual(['leitura-cuidadosa']);
  });

  it('keeps combo ids unique', () => {
    const comboIds = cardCombos.map((combo) => combo.id);

    expect(new Set(comboIds).size).toBe(comboIds.length);
  });
});
