import {
  Coins,
  HeartPulse,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { cardById } from '../cards/cardLibrary';
import type { CardId } from '../cards/cardLibrary';
import { passiveLibrary } from '../cards/passiveLibrary';
import type { PassiveId } from '../cards/passiveLibrary';
import {
  chooseCardReward,
  choosePassiveReward,
  createNewRun,
  getCardEnergyCost,
  getCurrentEncounter,
  playCard,
  resolveEncounter,
} from '../roguelike/runEngine';
import type { RunState } from '../roguelike/runState';
import { getEncounterChallenge } from '../roguelike/encounterFactory';
import type { StructureKind } from '../types/challenge';
import './App.css';

export default function App() {
  const [run, setRun] = useState<RunState>(() => createNewRun());
  const encounter = getCurrentEncounter(run);
  const challenge = encounter ? getEncounterChallenge(encounter) : undefined;
  const playedCards = run.playedCardIds.map((cardId) => cardById[cardId]);
  const passiveRewards = useMemo(
    () => passiveLibrary.filter((passive) => !run.passiveIds.includes(passive.id)).slice(0, 3),
    [run.passiveIds],
  );

  return (
    <main className="game-shell">
      <aside className="run-rail" aria-label="Run">
        <div>
          <p className="eyebrow">AEDS II</p>
          <h1>Run de Algoritmos</h1>
        </div>

        <div className="run-progress" aria-label="Progresso">
          <span>{`Encontro ${Math.min(run.encounterIndex + 1, run.encounters.length)}/${run.encounters.length}`}</span>
          <div className="progress-track">
            <span
              style={{
                width: `${((run.encounterIndex + 1) / run.encounters.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="hud-grid" aria-label="Estado da run">
          <Stat icon={<HeartPulse size={18} />} label={`Foco ${run.focus}/${run.maxFocus}`} />
          <Stat icon={<Zap size={18} />} label={`Energia ${run.energy}/${run.maxEnergy}`} />
          <Stat icon={<Coins size={18} />} label={`Moedas ${run.coins}`} />
          <Stat icon={<Trophy size={18} />} label={`Score ${run.score}`} />
        </div>

        <div className="passive-list" aria-label="Passivas">
          <h2>Passivas</h2>
          {run.passiveIds.length === 0 ? (
            <p>Nenhuma passiva ativa.</p>
          ) : (
            <ul>
              {run.passiveIds.map((passiveId) => (
                <li key={passiveId}>{passiveLabel(passiveId)}</li>
              ))}
            </ul>
          )}
        </div>

        <button className="icon-command ghost" type="button" onClick={() => setRun(createNewRun())}>
          <RotateCcw size={18} />
          Reiniciar
        </button>
      </aside>

      <section className="game-board" aria-label="Tabuleiro">
        {run.phase === 'victory' || run.phase === 'defeat' ? (
          <FinalPanel run={run} onRestart={() => setRun(createNewRun())} />
        ) : (
          <>
            <header className="encounter-header">
              <div>
                <p className="eyebrow">{encounterLabel(encounter?.kind)}</p>
                <h2>{challenge?.title ?? 'Encontro concluido'}</h2>
              </div>
              <button
                className="icon-command primary"
                type="button"
                onClick={() => setRun((currentRun) => resolveEncounter(currentRun))}
                disabled={run.phase !== 'encounter'}
              >
                <Play size={18} />
                Resolver encontro
              </button>
            </header>

            <div className="encounter-layout">
              <section className="prompt-panel" aria-label="Questao">
                {challenge ? (
                  <>
                    <StructureSketch structure={challenge.structure} />
                    <p className="statement">{challenge.statement}</p>
                    <pre>{challenge.providedCode}</pre>
                  </>
                ) : null}
              </section>

              <section className="play-zone" aria-label="Sequencia jogada">
                <div className="played-strip">
                  <h3>Sequencia</h3>
                  {playedCards.length === 0 ? (
                    <p className="empty-state">Nenhuma carta jogada.</p>
                  ) : (
                    <ol>
                      {playedCards.map((card, index) => (
                        <li key={`${card.id}-${index}`}>{card.name}</li>
                      ))}
                    </ol>
                  )}
                </div>

                {run.lastResult ? (
                  <div className="feedback-panel" aria-live="polite">
                    <strong>{run.lastResult.feedback}</strong>
                    <span>{`Score ${run.lastResult.scoreAwarded}`}</span>
                    {run.lastResult.activeCombos.length > 0 ? (
                      <span>
                        Combo:{' '}
                        {run.lastResult.activeCombos.map((combo) => combo.name).join(', ')}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                {run.phase === 'reward' && encounter ? (
                  <RewardPanel
                    rewardCardIds={encounter.rewardCardIds}
                    passiveRewardIds={passiveRewards.map((passive) => passive.id)}
                    onChooseCard={(cardId) =>
                      setRun((currentRun) => chooseCardReward(currentRun, cardId))
                    }
                    onChoosePassive={(passiveId) =>
                      setRun((currentRun) => choosePassiveReward(currentRun, passiveId))
                    }
                  />
                ) : null}
              </section>
            </div>

            <section className="hand-zone" aria-label="Mao">
              <div className="section-heading">
                <h3>Mao</h3>
                <span>{`${run.handCardIds.length} cartas`}</span>
              </div>

              <div className="card-grid">
                {run.handCardIds.map((cardId, index) => (
                  <PlayCardButton
                    key={`${cardId}-${index}`}
                    run={run}
                    cardId={cardId}
                    onPlay={() => setRun((currentRun) => playCard(currentRun, cardId))}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}

type StatProps = {
  icon: ReactNode;
  label: string;
};

function Stat({ icon, label }: StatProps) {
  return (
    <div className="stat-pill">
      {icon}
      <span>{label}</span>
    </div>
  );
}

type PlayCardButtonProps = {
  run: RunState;
  cardId: CardId;
  onPlay: () => void;
};

function PlayCardButton({ run, cardId, onPlay }: PlayCardButtonProps) {
  const card = cardById[cardId];
  const energyCost = getCardEnergyCost(run, cardId);
  const disabled = run.phase !== 'encounter' || energyCost > run.energy;

  return (
    <button
      className={`play-card ${card.category}`}
      type="button"
      aria-label={`Jogar ${card.name}`}
      onClick={onPlay}
      disabled={disabled}
    >
      <span className="card-meta">
        <span>{card.category}</span>
        <span>{`${energyCost}E`}</span>
      </span>
      <strong>{card.name}</strong>
      <code>{card.code}</code>
    </button>
  );
}

type RewardPanelProps = {
  rewardCardIds: readonly CardId[];
  passiveRewardIds: readonly PassiveId[];
  onChooseCard: (cardId: CardId) => void;
  onChoosePassive: (passiveId: PassiveId) => void;
};

function RewardPanel({
  rewardCardIds,
  passiveRewardIds,
  onChooseCard,
  onChoosePassive,
}: RewardPanelProps) {
  return (
    <section className="reward-panel" aria-label="Recompensas">
      <div className="section-heading">
        <h3>Escolha uma recompensa</h3>
        <Sparkles size={18} />
      </div>

      <div className="reward-grid">
        {rewardCardIds.map((cardId) => {
          const card = cardById[cardId];

          return (
            <button
              key={cardId}
              className="reward-option"
              type="button"
              aria-label={`Adicionar ${card.name}`}
              onClick={() => onChooseCard(cardId)}
            >
              <Plus size={18} />
              <span>
                <strong>{card.name}</strong>
                <small>{card.concept}</small>
              </span>
            </button>
          );
        })}

        {passiveRewardIds.map((passiveId) => {
          const passive = passiveLibrary.find((item) => item.id === passiveId);

          if (!passive) {
            return null;
          }

          return (
            <button
              key={passive.id}
              className="reward-option passive"
              type="button"
              aria-label={`Ativar ${passive.name}`}
              onClick={() => onChoosePassive(passive.id)}
            >
              <Sparkles size={18} />
              <span>
                <strong>{passive.name}</strong>
                <small>{passive.description}</small>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

type FinalPanelProps = {
  run: RunState;
  onRestart: () => void;
};

function FinalPanel({ run, onRestart }: FinalPanelProps) {
  const won = run.phase === 'victory';

  return (
    <section className="final-panel" aria-label={won ? 'Vitoria' : 'Derrota'}>
      <Trophy size={40} />
      <p className="eyebrow">{won ? 'Run vencida' : 'Run encerrada'}</p>
      <h2>{won ? 'Guardiao de AEDS II derrotado' : 'Foco zerado'}</h2>
      <p>{`Score final ${run.score} com ${run.coins} moedas.`}</p>
      <button className="icon-command primary" type="button" onClick={onRestart}>
        <RotateCcw size={18} />
        Reiniciar run
      </button>
    </section>
  );
}

function StructureSketch({ structure }: { structure: StructureKind }) {
  if (structure === 'doidona') {
    return (
      <svg className="structure-sketch" viewBox="0 0 360 160" role="img" aria-label="Doidona">
        <circle cx="44" cy="78" r="18" />
        <circle cx="100" cy="46" r="18" />
        <circle cx="100" cy="110" r="18" />
        <path d="M60 70 L84 54 M61 86 L84 102 M118 46 H150 M118 110 H150" />
        <rect x="150" y="28" width="40" height="30" rx="4" />
        <rect x="150" y="92" width="40" height="30" rx="4" />
        <path d="M190 43 H226 M190 107 H226" />
        <rect x="226" y="28" width="40" height="30" rx="4" />
        <rect x="226" y="92" width="40" height="30" rx="4" />
        <path d="M266 43 C288 43, 286 76, 306 76 H332 M266 107 C288 107, 286 76, 306 76" />
        <rect x="306" y="62" width="30" height="28" rx="4" />
        <text x="38" y="84">No</text>
        <text x="154" y="48">T1</text>
        <text x="230" y="48">T2</text>
        <text x="302" y="112">lista</text>
      </svg>
    );
  }

  if (structure === 'hash') {
    return (
      <svg className="structure-sketch" viewBox="0 0 360 160" role="img" aria-label="Hash">
        {[0, 1, 2, 3, 4].map((index) => (
          <rect key={index} x={26 + index * 42} y="36" width="34" height="34" rx="4" />
        ))}
        <path d="M152 70 C190 110, 230 112, 266 96" />
        <rect x="260" y="80" width="34" height="28" rx="4" />
        <rect x="300" y="80" width="34" height="28" rx="4" />
        <text x="28" y="118">area principal + reserva</text>
      </svg>
    );
  }

  if (structure === 'trie') {
    return (
      <svg className="structure-sketch" viewBox="0 0 360 160" role="img" aria-label="TRIE">
        <circle cx="54" cy="76" r="18" />
        <circle cx="130" cy="46" r="18" />
        <circle cx="206" cy="46" r="18" />
        <circle cx="282" cy="46" r="18" />
        <circle cx="130" cy="106" r="18" />
        <circle cx="206" cy="106" r="18" />
        <path d="M71 69 L113 52 M147 46 H189 M223 46 H265 M71 84 L113 100 M147 106 H189" />
        <text x="48" y="82">S</text>
        <text x="124" y="52">T</text>
        <text x="200" y="52">O</text>
        <text x="276" y="52">P</text>
        <text x="124" y="112">A</text>
        <text x="200" y="112">P</text>
      </svg>
    );
  }

  const nodeClass = structure === 'alvinegra' ? ' rb' : '';

  return (
    <svg className={`structure-sketch${nodeClass}`} viewBox="0 0 360 160" role="img" aria-label="Arvore">
      <path d="M180 38 L98 90 M180 38 L262 90 M98 90 L58 132 M98 90 L138 132 M262 90 L222 132 M262 90 L302 132" />
      {[180, 98, 262, 58, 138, 222, 302].map((x, index) => {
        const y = index === 0 ? 38 : index < 3 ? 90 : 132;
        const label = ['40', '20', '60', '10', '30', '50', '70'][index];

        return (
          <g key={`${x}-${y}`} className={index % 2 === 0 ? 'node-dark' : 'node-light'}>
            <circle cx={x} cy={y} r="18" />
            <text x={x - 8} y={y + 5}>{label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function passiveLabel(passiveId: PassiveId): string {
  return passiveLibrary.find((passive) => passive.id === passiveId)?.name ?? passiveId;
}

function encounterLabel(kind: string | undefined): string {
  if (kind === 'boss') {
    return 'Chefe';
  }

  if (kind === 'elite') {
    return 'Elite';
  }

  return 'Encontro';
}
