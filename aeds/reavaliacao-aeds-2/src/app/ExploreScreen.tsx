import { useMemo, useState } from 'react';
import { Eraser, Play, Settings2, Shapes, Trash2 } from 'lucide-react';

import { doidonaKinds, doidonaSubKinds, withDoidonaKind, type DoidonaState, type DoidonaSubKind } from '../viz/doidona';
import { structureCatalog } from '../viz/structureOps';
import { StructureViz } from '../viz/StructureViz';
import type { VizScene } from '../viz/vizTypes';
import {
  getStructureState,
  resetAllStructureStates,
  resetStructureState,
  setStructureState,
} from '../viz/vizStore';

/**
 * Galeria interativa com estado persistente: cada estrutura abre com
 * um exemplo padrão; operações modificam o estado atual (que sobrevive
 * a trocas de aba/operação); resets deixam tudo vazio para construir
 * do zero.
 */
export function ExploreScreen() {
  const [selectedId, setSelectedId] = useState(structureCatalog[0].id);
  const [opId, setOpId] = useState(structureCatalog[0].ops[0].id);
  const [inputValue, setInputValue] = useState(structureCatalog[0].ops[0].input?.sample ?? '');
  const [version, setVersion] = useState(0);
  const [lastRun, setLastRun] = useState<{ scene: VizScene; runId: number } | null>(null);

  const entry = structureCatalog.find((item) => item.id === selectedId) ?? structureCatalog[0];
  const op = entry.ops.find((item) => item.id === opId) ?? entry.ops[0];
  const state = getStructureState(entry.id, entry.initial);

  const previewScene = useMemo(
    () => entry.preview(state, op.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entry.id, op.id, version],
  );

  const scene = lastRun?.scene ?? previewScene;

  function pickStructure(id: string) {
    const next = structureCatalog.find((item) => item.id === id) ?? structureCatalog[0];
    setSelectedId(id);
    setOpId(next.ops[0].id);
    setInputValue(next.ops[0].input?.sample ?? '');
    setLastRun(null);
  }

  function pickOp(id: string) {
    const next = entry.ops.find((item) => item.id === id) ?? entry.ops[0];
    setOpId(next.id);
    setInputValue(next.input?.sample ?? '');
    setLastRun(null);
  }

  function execute() {
    const result = op.run(state, inputValue);
    setStructureState(entry.id, result.next);
    setLastRun({ scene: result.scene, runId: (lastRun?.runId ?? 0) + 1 });
    setVersion((value) => value + 1);
  }

  function resetCurrent() {
    if (!window.confirm(`Resetar ${entry.name}? A estrutura ficará completamente vazia (o exemplo padrão não volta).`)) {
      return;
    }
    resetStructureState(entry.id, entry.empty);
    setLastRun(null);
    setInputValue(op.input?.sample ?? '');
    setVersion((value) => value + 1);
  }

  function resetAll() {
    if (!window.confirm('Resetar TODAS as estruturas? Todos os dados (padrão e inseridos) serão apagados.')) {
      return;
    }
    resetAllStructureStates(structureCatalog);
    setLastRun(null);
    setInputValue(op.input?.sample ?? '');
    setVersion((value) => value + 1);
  }

  function updateKind(area: number, kind: DoidonaSubKind) {
    setStructureState(entry.id, withDoidonaKind(state as DoidonaState, area, kind));
    setLastRun(null);
    setVersion((value) => value + 1);
  }

  const kinds = entry.configurable ? doidonaKinds(state as DoidonaState) : null;

  return (
    <div className="explore-screen">
      <div className="explore-menu" role="tablist" aria-label="Escolha uma estrutura de dados">
        {structureCatalog.map((item) => (
          <button
            aria-selected={item.id === selectedId}
            className={`explore-item ${item.id === selectedId ? 'is-active' : ''}`}
            key={item.id}
            onClick={() => pickStructure(item.id)}
            role="tab"
            type="button"
          >
            <strong>{item.name}</strong>
            <span>{item.blurb}</span>
          </button>
        ))}
      </div>

      <div className="explore-stage">
        <div className="explore-heading">
          <Shapes aria-hidden="true" size={18} />
          <div>
            <h3>{entry.name}</h3>
            <p>{entry.blurb}</p>
          </div>
          <div className="reset-actions">
            <button className="reset-button" onClick={resetCurrent} title="Deixa esta estrutura vazia" type="button">
              <Eraser aria-hidden="true" size={14} />
              Resetar estrutura
            </button>
            <button className="reset-button is-danger" onClick={resetAll} title="Deixa todas as estruturas vazias" type="button">
              <Trash2 aria-hidden="true" size={14} />
              Resetar tudo
            </button>
          </div>
        </div>

        <div className="op-bar" role="group" aria-label="Escolha a operação">
          <div className="op-choices">
            {entry.ops.map((item) => (
              <button
                aria-pressed={item.id === op.id}
                className={`op-chip ${item.id === op.id ? 'is-active' : ''}`}
                key={item.id}
                onClick={() => pickOp(item.id)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>

          <form
            className="op-form"
            onSubmit={(event) => {
              event.preventDefault();
              execute();
            }}
          >
            {op.input && (
              <label className="op-input">
                <span>{op.input.label}</span>
                <input
                  inputMode={op.input.kind === 'number' ? 'numeric' : 'text'}
                  maxLength={op.input.kind === 'number' ? 3 : 7}
                  onChange={(event) => setInputValue(event.target.value)}
                  type="text"
                  value={inputValue}
                />
              </label>
            )}
            <button className="op-run" type="submit">
              <Play aria-hidden="true" size={14} />
              Executar
            </button>
          </form>
        </div>

        {kinds && (
          <div className="doidona-config" role="group" aria-label="Configurar áreas de reserva">
            <div className="doidona-config-title">
              <Settings2 aria-hidden="true" size={15} />
              <span>Subestrutura de cada área de reserva (T2) — hashT2(x) = x % 3</span>
            </div>
            <div className="doidona-config-fields">
              {kinds.map((kind, area) => (
                <label key={area}>
                  <span>Área R{area}</span>
                  <select onChange={(event) => updateKind(area, event.target.value as DoidonaSubKind)} value={kind}>
                    {doidonaSubKinds.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </div>
        )}

        <StructureViz key={`${entry.id}-${op.id}-${version}-${lastRun ? `run${lastRun.runId}` : 'estado'}`} scene={scene} />
      </div>
    </div>
  );
}
