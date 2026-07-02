import { useMemo, useState } from 'react';
import { Play, Settings2, Shapes } from 'lucide-react';

import { doidonaSubKinds, type DoidonaSubKind } from '../viz/doidona';
import { defaultDoidonaConfig, structureCatalog, type DoidonaConfig } from '../viz/structureOps';
import { StructureViz } from '../viz/StructureViz';

/**
 * Galeria interativa: escolha a estrutura, a operação e o valor;
 * a animação correspondente é gerada na hora. A Doidona ainda
 * permite configurar a subestrutura de cada área de reserva.
 */
export function ExploreScreen() {
  const [selectedId, setSelectedId] = useState(structureCatalog[0].id);
  const [opId, setOpId] = useState(structureCatalog[0].ops[0].id);
  const [inputValue, setInputValue] = useState(structureCatalog[0].ops[0].input?.sample ?? '');
  const [config, setConfig] = useState<DoidonaConfig>(defaultDoidonaConfig);
  const [run, setRun] = useState(0);

  const selected = structureCatalog.find((entry) => entry.id === selectedId) ?? structureCatalog[0];
  const op = selected.ops.find((item) => item.id === opId) ?? selected.ops[0];

  const scene = useMemo(
    () => op.run(inputValue, config),
    // Recalcula só quando o usuário executa, troca estrutura/operação ou reconfigura.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected.id, op.id, config, run],
  );

  function pickStructure(id: string) {
    const entry = structureCatalog.find((item) => item.id === id) ?? structureCatalog[0];
    setSelectedId(id);
    setOpId(entry.ops[0].id);
    setInputValue(entry.ops[0].input?.sample ?? '');
    setRun((value) => value + 1);
  }

  function pickOp(id: string) {
    const next = selected.ops.find((item) => item.id === id) ?? selected.ops[0];
    setOpId(id);
    setInputValue(next.input?.sample ?? '');
    setRun((value) => value + 1);
  }

  function execute() {
    setRun((value) => value + 1);
  }

  function updateConfig(area: number, kind: DoidonaSubKind) {
    setConfig((current) => {
      const next = [...current] as DoidonaConfig;
      next[area] = kind;
      return next;
    });
  }

  return (
    <div className="explore-screen">
      <div className="explore-menu" role="tablist" aria-label="Escolha uma estrutura de dados">
        {structureCatalog.map((entry) => (
          <button
            aria-selected={entry.id === selectedId}
            className={`explore-item ${entry.id === selectedId ? 'is-active' : ''}`}
            key={entry.id}
            onClick={() => pickStructure(entry.id)}
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

        <div className="op-bar" role="group" aria-label="Escolha a operação">
          <div className="op-choices">
            {selected.ops.map((item) => (
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

        {selected.configurable && (
          <div className="doidona-config" role="group" aria-label="Configurar áreas de reserva">
            <div className="doidona-config-title">
              <Settings2 aria-hidden="true" size={15} />
              <span>Subestrutura de cada área de reserva (T2)</span>
            </div>
            <div className="doidona-config-fields">
              {config.map((kind, area) => (
                <label key={area}>
                  <span>Área R{area}</span>
                  <select onChange={(event) => updateConfig(area, event.target.value as DoidonaSubKind)} value={kind}>
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

        <StructureViz key={`${selected.id}-${op.id}-${run}`} scene={scene} />
      </div>
    </div>
  );
}
