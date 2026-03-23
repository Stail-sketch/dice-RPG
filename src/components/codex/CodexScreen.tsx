import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { ALL_MONSTERS } from '../../data/monsters';
import { SKILL_RUNES, FIXED_SKILLS } from '../../data/skill-runes';
import { RECIPE_SYNERGIES, CROSS_DICE_SYNERGIES } from '../../data/synergies';
import { ELEMENT_NAMES, type Element } from '../../types';
import { ELEMENT_COLORS } from '../common/ElementBadge';
import { MonsterSprite } from '../common/MonsterSprite';

type CodexTab = 'monsters' | 'runes' | 'recipes';



const CHAPTER_LABELS: Record<number, string> = {
  1: '第1章: 始まりの洞窟',
  2: '第2章: 氷結の峡谷',
  3: '第3章: 雷鳴の塔',
};

function getMonsterChapter(id: string): number {
  const ch1Ids = ['slime', 'bat', 'goblin', 'salamander', 'skeleton', 'harpy', 'mimic-monster', 'cave-dragon'];
  const ch2Ids = ['frost-wolf', 'penguin', 'ice-golem', 'yuki-onna', 'blizzard-drake', 'ice-dragon'];
  if (ch1Ids.includes(id)) return 1;
  if (ch2Ids.includes(id)) return 2;
  return 3;
}

const EFFECT_TYPE_NAMES: Record<string, string> = {
  damage: 'ダメージ',
  heal: '回復',
  dot: '継続ダメージ',
  buff: 'バフ',
  debuff: 'デバフ',
  shield: 'シールド',
};

const TIER_NAMES: Record<string, string> = {
  common: 'コモン',
  rare: 'レア',
  epic: 'エピック',
  legendary: 'レジェンド',
};

const TIER_COLORS: Record<string, string> = {
  common: '#6a5a4a',
  rare: '#3070a0',
  epic: '#7050a0',
  legendary: '#a08820',
};

export function CodexScreen() {
  const { setScreen, capturedMonsters } = useGameStore();
  const [tab, setTab] = useState<CodexTab>('monsters');
  const [selectedMonsterId, setSelectedMonsterId] = useState<string | null>(null);

  return (
    <div style={{ padding: 8, background: '#f5f0e8', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 8,
      }}>
        <button
          onClick={() => setScreen('town')}
          style={{
            background: '#ece5d8', border: '1px solid #c0b8a8', borderRadius: 4,
            padding: '4px 10px', fontSize: 11, color: '#3a2a1a', cursor: 'pointer',
          }}
        >
          ← 町へ戻る
        </button>
        <div style={{ fontSize: 14, color: '#705828', fontWeight: 'bold' }}>図鑑</div>
        <div style={{ width: 60 }} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {([
          ['monsters', 'モンスター図鑑'],
          ['runes', 'ルーン図鑑'],
          ['recipes', 'レシピ図鑑'],
        ] as [CodexTab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setTab(key); setSelectedMonsterId(null); }}
            style={{
              flex: 1, padding: '6px 0', fontSize: 10, fontWeight: 'bold',
              border: '1px solid ' + (tab === key ? '#705828' : '#c0b8a8'),
              borderRadius: 4,
              background: tab === key ? '#705828' : '#ece5d8',
              color: tab === key ? '#f5f0e8' : '#6a5a4a',
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'monsters' && (
        <MonsterCodex
          capturedMonsters={capturedMonsters}
          selectedId={selectedMonsterId}
          onSelect={setSelectedMonsterId}
        />
      )}
      {tab === 'runes' && <RuneCodex />}
      {tab === 'recipes' && <RecipeCodex />}
    </div>
  );
}

// ==============================
// Monster Codex
// ==============================
function MonsterCodex({
  capturedMonsters,
  selectedId,
  onSelect,
}: {
  capturedMonsters: string[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const selectedMonster = selectedId ? ALL_MONSTERS.find(m => m.id === selectedId) : null;
  const isCaptured = (id: string) => capturedMonsters.includes(id);

  // Group by chapter
  const chapters = [1, 2, 3];

  if (selectedMonster && isCaptured(selectedMonster.id)) {
    return (
      <div>
        <button
          onClick={() => onSelect(null)}
          style={{
            background: '#ece5d8', border: '1px solid #c0b8a8', borderRadius: 4,
            padding: '3px 8px', fontSize: 10, color: '#3a2a1a', cursor: 'pointer',
            marginBottom: 6,
          }}
        >
          ← 一覧へ
        </button>
        <MonsterDetail monster={selectedMonster} />
      </div>
    );
  }

  return (
    <div>
      {chapters.map(ch => {
        const monsters = ALL_MONSTERS.filter(m => getMonsterChapter(m.id) === ch);
        return (
          <div key={ch} style={{ marginBottom: 8 }}>
            <div style={{
              fontSize: 10, color: '#705828', fontWeight: 'bold',
              borderBottom: '1px solid #d8d0c4', paddingBottom: 2, marginBottom: 4,
            }}>
              {CHAPTER_LABELS[ch]}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {monsters.map(m => {
                const captured = isCaptured(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => captured ? onSelect(m.id) : undefined}
                    style={{
                      width: 70, padding: 4,
                      background: captured ? '#ece5d8' : '#ddd8d0',
                      border: '1px solid ' + (captured ? '#c0b8a8' : '#c8c0b8'),
                      borderRadius: 4, cursor: captured ? 'pointer' : 'default',
                      textAlign: 'center',
                    }}
                  >
                    {captured ? (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
                          <MonsterSprite monsterId={m.id} element={m.element} size={32} />
                        </div>
                        <div style={{ fontSize: 8, color: ELEMENT_COLORS[m.element] }}>
                          {'★'.repeat(m.rarity)}
                        </div>
                        <div style={{ fontSize: 8, color: '#3a2a1a', lineHeight: '1.2' }}>
                          {m.name}
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{
                          width: 32, height: 32, margin: '0 auto 2px',
                          background: '#b8b0a4', borderRadius: 4,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, color: '#998a78',
                        }}>
                          ?
                        </div>
                        <div style={{ fontSize: 8, color: '#998a78' }}>???</div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <div style={{ fontSize: 9, color: '#998a78', textAlign: 'center', marginTop: 4 }}>
        発見: {capturedMonsters.length} / {ALL_MONSTERS.length}
      </div>
    </div>
  );
}

// ==============================
// Monster Detail
// ==============================
function MonsterDetail({ monster }: { monster: typeof ALL_MONSTERS[0] }) {
  return (
    <div style={{
      background: '#ece5d8', border: '1px solid #c0b8a8', borderRadius: 6, padding: 8,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <MonsterSprite monsterId={monster.id} element={monster.element} size={48} />
        <div>
          <div style={{ fontSize: 13, color: '#3a2a1a', fontWeight: 'bold' }}>{monster.name}</div>
          <div style={{ fontSize: 10, color: ELEMENT_COLORS[monster.element] }}>
            {'★'.repeat(monster.rarity)} {ELEMENT_NAMES[monster.element]}属性
          </div>
          <div style={{ fontSize: 9, color: '#6a5a4a', marginTop: 2 }}>{monster.description}</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex', gap: 8, fontSize: 9, color: '#6a5a4a',
        padding: '4px 0', borderTop: '1px solid #d8d0c4', borderBottom: '1px solid #d8d0c4',
        marginBottom: 6,
      }}>
        <span>捕獲率: {monster.baseStats.captureRate}%</span>
        <span>固有面: {monster.fixedFaces.length}</span>
        <span>カスタム面: {monster.customFaces.length}</span>
      </div>

      {/* Fixed faces */}
      <div style={{ fontSize: 10, color: '#705828', fontWeight: 'bold', marginBottom: 4 }}>
        固有面
      </div>
      {monster.fixedFaces.map(face => (
        <div key={face.faceNumber} style={{
          background: '#f5f0e8', border: '1px solid #d8d0c4', borderRadius: 4,
          padding: 4, marginBottom: 3,
        }}>
          <div style={{ fontSize: 9, color: '#705828', fontWeight: 'bold', marginBottom: 2 }}>
            面{face.faceNumber}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {face.sockets.map((s, i) => {
              const skill = FIXED_SKILLS[s.skillId];
              if (!skill) {
                return (
                  <span key={i} style={{ fontSize: 8, color: '#998a78' }}>{s.skillId}</span>
                );
              }
              const effectColor = skill.effect.type === 'damage' ? '#a04030'
                : skill.effect.type === 'heal' ? '#30a050'
                : skill.effect.type === 'dot' ? '#906020'
                : skill.effect.type === 'buff' ? '#3070a0'
                : skill.effect.type === 'debuff' ? '#7050a0'
                : '#5080a0';
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: ELEMENT_COLORS[s.element] + '10',
                  border: '1px solid ' + ELEMENT_COLORS[s.element] + '30',
                  borderRadius: 4, padding: '3px 6px',
                }}>
                  <span style={{
                    fontSize: 9, fontWeight: 'bold',
                    color: ELEMENT_COLORS[s.element], minWidth: 50,
                  }}>
                    {skill.name}
                  </span>
                  <span style={{
                    fontSize: 7, padding: '1px 4px', borderRadius: 3,
                    background: effectColor + '20', color: effectColor,
                    border: '1px solid ' + effectColor + '40',
                  }}>
                    {EFFECT_TYPE_NAMES[skill.effect.type]}
                  </span>
                  <span style={{ fontSize: 8, color: '#3a2a1a', fontWeight: 'bold' }}>
                    {skill.effect.type === 'buff' || skill.effect.type === 'debuff'
                      ? `x${skill.effect.power}`
                      : skill.effect.power}
                  </span>
                  {skill.effect.duration && (
                    <span style={{ fontSize: 7, color: '#6a5a4a' }}>
                      {skill.effect.duration}T
                    </span>
                  )}
                  <span style={{ fontSize: 7, color: '#998a78', marginLeft: 'auto' }}>
                    {skill.effect.description}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Custom faces */}
      <div style={{ fontSize: 10, color: '#705828', fontWeight: 'bold', marginBottom: 4, marginTop: 6 }}>
        カスタム面
      </div>
      {monster.customFaces.map(face => (
        <div key={face.faceNumber} style={{
          background: '#f5f0e8', border: '1px solid #d8d0c4', borderRadius: 4,
          padding: 4, marginBottom: 3,
        }}>
          <div style={{ fontSize: 9, color: '#705828', marginBottom: 2 }}>
            面{face.faceNumber} - ソケット{face.sockets.length}個
          </div>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {face.sockets.map((s, i) => {
              const tierColor = s.socketTier === 'gold' ? '#a08820' : s.socketTier === 'silver' ? '#808080' : '#8a7050';
              return (
                <span key={i} style={{
                  fontSize: 8, padding: '1px 4px', borderRadius: 3,
                  border: '1px solid ' + tierColor, color: tierColor,
                  background: tierColor + '10',
                }}>
                  {s.socketTier === 'gold' ? '金' : s.socketTier === 'silver' ? '銀' : '銅'}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ==============================
// Rune Codex
// ==============================
function RuneCodex() {
  const elements: Element[] = ['blaze', 'frost', 'volt', 'venom', 'alloy', 'mirage'];

  return (
    <div>
      {elements.map(el => {
        const runes = SKILL_RUNES.filter(r => r.element === el);
        if (runes.length === 0) return null;
        return (
          <div key={el} style={{ marginBottom: 8 }}>
            <div style={{
              fontSize: 10, fontWeight: 'bold', color: ELEMENT_COLORS[el],
              borderBottom: '1px solid #d8d0c4', paddingBottom: 2, marginBottom: 4,
            }}>
              {ELEMENT_NAMES[el]}属性ルーン
            </div>
            {runes.map(r => (
              <div key={r.id} style={{
                background: '#ece5d8', border: '1px solid #d8d0c4', borderRadius: 4,
                padding: '4px 6px', marginBottom: 3,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <span style={{ fontSize: 10, color: '#3a2a1a', fontWeight: 'bold' }}>
                    {r.name}
                  </span>
                  <span style={{
                    fontSize: 8, marginLeft: 4, padding: '0 3px', borderRadius: 2,
                    background: TIER_COLORS[r.tier] + '20',
                    color: TIER_COLORS[r.tier],
                    border: '1px solid ' + TIER_COLORS[r.tier] + '40',
                  }}>
                    {TIER_NAMES[r.tier]}
                  </span>
                </div>
                <div style={{ fontSize: 8, color: '#6a5a4a', textAlign: 'right' }}>
                  <div>{EFFECT_TYPE_NAMES[r.effect.type]} / 威力{r.effect.power}</div>
                  <div style={{ color: '#998a78' }}>{r.effect.description}</div>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ==============================
// Recipe Codex
// ==============================
function RecipeCodex() {
  return (
    <div>
      {/* Cross-dice synergies */}
      <div style={{
        fontSize: 10, fontWeight: 'bold', color: '#705828',
        borderBottom: '1px solid #d8d0c4', paddingBottom: 2, marginBottom: 4,
      }}>
        クロスダイスシナジー（3ダイス同属性）
      </div>
      {CROSS_DICE_SYNERGIES.map(s => (
        <div key={s.element} style={{
          background: '#ece5d8', border: '1px solid #d8d0c4', borderRadius: 4,
          padding: '4px 6px', marginBottom: 3,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 10, color: ELEMENT_COLORS[s.element], fontWeight: 'bold' }}>
                {s.name}
              </span>
              <span style={{
                fontSize: 8, marginLeft: 4, padding: '0 3px', borderRadius: 2,
                background: ELEMENT_COLORS[s.element] + '20',
                color: ELEMENT_COLORS[s.element],
              }}>
                {ELEMENT_NAMES[s.element]}
              </span>
            </div>
            <div style={{ fontSize: 8, color: '#6a5a4a' }}>
              {EFFECT_TYPE_NAMES[s.effect.type]}
            </div>
          </div>
          <div style={{ fontSize: 8, color: '#998a78', marginTop: 1 }}>{s.description}</div>
        </div>
      ))}

      {/* Recipe synergies */}
      <div style={{
        fontSize: 10, fontWeight: 'bold', color: '#705828',
        borderBottom: '1px solid #d8d0c4', paddingBottom: 2, marginBottom: 4, marginTop: 10,
      }}>
        レシピコンボ（異属性組み合わせ）
      </div>
      {RECIPE_SYNERGIES.map(s => (
        <div key={s.id} style={{
          background: '#ece5d8', border: '1px solid #d8d0c4', borderRadius: 4,
          padding: '4px 6px', marginBottom: 3,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 10, color: '#3a2a1a', fontWeight: 'bold' }}>
                {s.name}
              </span>
              <span style={{ fontSize: 8, marginLeft: 4 }}>
                {s.requiredElements.map(e => (
                  <span key={e} style={{
                    padding: '0 3px', borderRadius: 2, marginRight: 2,
                    background: ELEMENT_COLORS[e] + '20',
                    color: ELEMENT_COLORS[e],
                    border: '1px solid ' + ELEMENT_COLORS[e] + '40',
                  }}>
                    {ELEMENT_NAMES[e]}
                  </span>
                ))}
              </span>
            </div>
            <div style={{ fontSize: 8, color: '#6a5a4a' }}>
              {EFFECT_TYPE_NAMES[s.effect.type]} / 威力{s.effect.power}
            </div>
          </div>
          <div style={{ fontSize: 8, color: '#998a78', marginTop: 1 }}>{s.description}</div>
        </div>
      ))}
    </div>
  );
}
