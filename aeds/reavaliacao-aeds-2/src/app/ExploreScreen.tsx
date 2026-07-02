import { useMemo, useState } from 'react';
import { Shapes } from 'lucide-react';

import { structureCatalog } from '../viz/scenes';
import { StructureViz } from '../viz/StructureViz';

/**
 * Galeria de aprendizado: cada estrutura tem uma demonstração animada
 * com player, pseudocódigo sincronizado e legenda de estados.
 */
export function ExploreScreen() {
  const [selectedId, setSelectedId] = useState(structureCatalog[0].id);
  const selected = structureCatalog.find((entry) => entry.id === selectedId) ?? structureCatalog[0];
  const scene = useMemo(() => selected.build(), [selected]);

  return (
    <div className="explore-screen">
      <div className="explore-menu" role="tablist" aria-label="Escolha uma estrutura de dados">
        {structureCatalog.map((entry) => (
          <button
            aria-selected={entry.id === selectedId}
            className={`explore-item ${entry.id === selectedId ? 'is-active' : ''}`}
            key={entry.id}
            onClick={() => setSelectedId(entry.id)}
            role="tab"
            type="button"
          >
            <strong>{entry.name}</strong>
            <span>{entry.blurb}</span>
          </button>
        ))}
      </div>

      <div className="explore-stage">
        <div className="explore-heading">
          <Shapes aria-hidden="true" size={18} />
          <div>
            <h3>{selected.name}</h3>
            <p>{selected.blurb}</p>
          </div>
        </div>
        <StructureViz key={selected.id} scene={scene} />
      </div>
    </div>
  );
}
