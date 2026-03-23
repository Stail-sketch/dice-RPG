import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { ALL_MONSTERS } from '../../data/monsters';
import { SKILL_RUNES, FIXED_SKILLS } from '../../data/skill-runes';
import { RECIPE_SYNERGIES, CROSS_DICE_SYNERGIES } from '../../data/synergies';
import { ELEMENT_NAMES, type Element } from '../../types';
import { ELEMENT_COLORS } from '../common/ElementBadge';
import { MonsterSprite } from '../common/MonsterSprite';

type CodexTab = 'monsters' | 'runes' | 'skills' | 'recipes';



const CHAPTER_LABELS: Record<number, string> = {
  1: '第1章: 始まりの洞窟',
  2: '第2章: 氷結の峡谷',
  3: '第3章: 雷鳴の塔',
  4: '第4章: 毒沼の森',
  5: '第5章: 鋼鉄の遺跡',
  6: '第6章: 幻影の神殿',
  7: '最終章: 運命の回廊',
};

function getMonsterChapter(id: string): number {
  const ch1Ids = ['pyrachnid', 'frost-jelly', 'volt-wisp', 'rot-beetle', 'hollow', 'goblin-knight', 'salamander-v2', 'iron-golem', 'shadow-serpent', 'inferno-drake'];
  const ch2Ids = ['frost-wolf', 'penguin', 'ice-golem', 'yuki-onna', 'blizzard-drake', 'ice-dragon'];
  const ch3Ids = ['spark-elemental', 'electric-mouse', 'thunderbird', 'lightning-elemental', 'storm-wizard', 'thunder-dragon'];
  const ch4Ids = ['mush-spore', 'poison-toad', 'swamp-leech', 'plant-worm', 'manticore', 'basilisk', 'venom-chimera', 'death-bloom', 'hydra', 'nidhogg'];
  const ch5Ids = ['metal-slime', 'gear-puppet', 'rust-bug', 'iron-bat', 'shield-knight', 'steam-golem', 'mithril-sentinel', 'adamant-titan', 'orichalcum-dragon', 'fafnir'];
  const ch6Ids = ['shade-wisp', 'mirror-fox', 'phantom-mouse', 'doppelganger', 'illusionist', 'nightmare', 'phantom-knight', 'banshee', 'void-sphinx', 'tiamat'];
  if (ch1Ids.includes(id)) return 1;
  if (ch2Ids.includes(id)) return 2;
  if (ch3Ids.includes(id)) return 3;
  if (ch4Ids.includes(id)) return 4;
  if (ch5Ids.includes(id)) return 5;
  if (ch6Ids.includes(id)) return 6;
  return 7;
}

const EFFECT_TYPE_NAMES: Record<string, string> = {
  damage: 'ダメージ',
  heal: '回復',
  dot: '継続ダメージ',
  buff: 'バフ',
  debuff: 'デバフ',
  counter: '反撃',
  lifesteal: '吸収',
  seal: '封印',
  passive: 'パッシブ',
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
          ['monsters', 'モンスター'],
          ['runes', 'ルーン'],
          ['skills', 'スキル'],
          ['recipes', 'レシピ'],
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
      {tab === 'runes' && <RuneCodex capturedMonsters={capturedMonsters} />}
      {tab === 'skills' && <SkillCodex capturedMonsters={capturedMonsters} />}
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
  const chapters = [1, 2, 3, 4, 5, 6, 7];

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
// Skill Detail Row (shared)
// ==============================
function SkillDetailRow({ name, element, effect, badge }: {
  name: string;
  element: Element;
  effect: { type: string; power: number; duration?: number; description: string };
  badge?: React.ReactNode;
}) {
  const effectColor = effect.type === 'damage' ? '#a04030'
    : effect.type === 'heal' ? '#30a050'
    : effect.type === 'dot' ? '#906020'
    : effect.type === 'buff' ? '#3070a0'
    : effect.type === 'debuff' ? '#7050a0'
    : '#5080a0';
  return (
    <div style={{
      background: ELEMENT_COLORS[element] + '10',
      border: '1px solid ' + ELEMENT_COLORS[element] + '30',
      borderRadius: 4, padding: '3px 6px', marginBottom: 2,
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      <span style={{ fontSize: 9, fontWeight: 'bold', color: ELEMENT_COLORS[element], minWidth: 50 }}>
        {name}
      </span>
      {badge}
      <span style={{
        fontSize: 7, padding: '1px 4px', borderRadius: 3,
        background: effectColor + '20', color: effectColor,
        border: '1px solid ' + effectColor + '40',
      }}>
        {EFFECT_TYPE_NAMES[effect.type] ?? effect.type}
      </span>
      <span style={{ fontSize: 8, color: '#3a2a1a', fontWeight: 'bold' }}>
        {effect.type === 'buff' || effect.type === 'debuff' ? `x${effect.power}` : effect.power}
      </span>
      {effect.duration && (
        <span style={{ fontSize: 7, color: '#6a5a4a' }}>{effect.duration}T</span>
      )}
      <span style={{ fontSize: 7, color: '#998a78', marginLeft: 'auto' }}>
        {effect.description}
      </span>
    </div>
  );
}

// ==============================
// Rune Codex (with fixed skills)
// ==============================
function RuneCodex({ capturedMonsters }: { capturedMonsters: string[] }) {
  const elements: Element[] = ['blaze', 'frost', 'volt', 'venom', 'alloy', 'mirage'];

  // 捕獲済みモンスターの固有スキルを集める
  const capturedMonstersData = ALL_MONSTERS.filter(m => capturedMonsters.includes(m.id));
  const fixedSkillsByElement: Record<Element, { skill: typeof FIXED_SKILLS[string]; monsterName: string }[]> = {
    blaze: [], frost: [], volt: [], venom: [], alloy: [], mirage: [],
  };
  for (const m of capturedMonstersData) {
    for (const face of m.fixedFaces) {
      for (const s of face.sockets) {
        const skill = FIXED_SKILLS[s.skillId];
        if (skill && !fixedSkillsByElement[skill.element].some(x => x.skill.id === skill.id)) {
          fixedSkillsByElement[skill.element].push({ skill, monsterName: m.name });
        }
      }
    }
  }

  return (
    <div>
      {/* 装備可能ルーン */}
      <div style={{
        fontSize: 11, fontWeight: 'bold', color: '#705828',
        borderBottom: '2px solid #c0b8a8', paddingBottom: 3, marginBottom: 6,
      }}>
        装備可能ルーン ({SKILL_RUNES.length})
      </div>
      {elements.map(el => {
        const runes = SKILL_RUNES.filter(r => r.element === el);
        if (runes.length === 0) return null;
        return (
          <div key={el} style={{ marginBottom: 8 }}>
            <div style={{
              fontSize: 10, fontWeight: 'bold', color: ELEMENT_COLORS[el],
              borderBottom: '1px solid #d8d0c4', paddingBottom: 2, marginBottom: 4,
            }}>
              {ELEMENT_NAMES[el]}属性 ({runes.length})
            </div>
            {runes.map(r => (
              <SkillDetailRow
                key={r.id}
                name={r.name}
                element={r.element}
                effect={r.effect}
                badge={
                  <span style={{
                    fontSize: 7, padding: '0 3px', borderRadius: 2,
                    background: TIER_COLORS[r.tier] + '20',
                    color: TIER_COLORS[r.tier],
                    border: '1px solid ' + TIER_COLORS[r.tier] + '40',
                  }}>
                    {TIER_NAMES[r.tier]}
                  </span>
                }
              />
            ))}
          </div>
        );
      })}

      {/* 固有スキル（捕獲済み） */}
      <div style={{
        fontSize: 11, fontWeight: 'bold', color: '#705828',
        borderBottom: '2px solid #c0b8a8', paddingBottom: 3, marginBottom: 6, marginTop: 12,
      }}>
        固有スキル（捕獲済みモンスター）
      </div>
      {capturedMonstersData.length === 0 ? (
        <div style={{ fontSize: 9, color: '#998a78', textAlign: 'center', padding: 8 }}>
          モンスターを捕獲すると固有スキルが閲覧できます
        </div>
      ) : (
        elements.map(el => {
          const skills = fixedSkillsByElement[el];
          if (skills.length === 0) return null;
          return (
            <div key={`fixed-${el}`} style={{ marginBottom: 8 }}>
              <div style={{
                fontSize: 10, fontWeight: 'bold', color: ELEMENT_COLORS[el],
                borderBottom: '1px solid #d8d0c4', paddingBottom: 2, marginBottom: 4,
              }}>
                {ELEMENT_NAMES[el]}属性 ({skills.length})
              </div>
              {skills.map(({ skill, monsterName }) => (
                <SkillDetailRow
                  key={skill.id}
                  name={skill.name}
                  element={skill.element}
                  effect={skill.effect}
                  badge={
                    <span style={{
                      fontSize: 7, padding: '0 3px', borderRadius: 2,
                      background: '#705828' + '20', color: '#705828',
                      border: '1px solid #705828' + '40',
                    }}>
                      {monsterName}
                    </span>
                  }
                />
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}

// ==============================
// Skill Codex (all skills)
// ==============================
function SkillCodex({ capturedMonsters }: { capturedMonsters: string[] }) {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterElement, setFilterElement] = useState<Element | 'all'>('all');
  const elements: Element[] = ['blaze', 'frost', 'volt', 'venom', 'alloy', 'mirage'];
  const effectTypes = ['damage', 'heal', 'dot', 'buff', 'debuff', 'shield'];

  // 全スキルを統合
  type SkillEntry = {
    id: string; name: string; element: Element;
    effect: { type: string; power: number; duration?: number; description: string };
    source: string; // 'ルーン' or モンスター名
    isRune: boolean;
  };

  const allSkills: SkillEntry[] = [];

  // 装備ルーン
  for (const r of SKILL_RUNES) {
    allSkills.push({
      id: r.id, name: r.name, element: r.element,
      effect: r.effect, source: `ルーン(${TIER_NAMES[r.tier]})`, isRune: true,
    });
  }

  // 固有スキル（捕獲済みのみ）
  const capturedMonstersData = ALL_MONSTERS.filter(m => capturedMonsters.includes(m.id));
  const addedFixedIds = new Set<string>();
  for (const m of capturedMonstersData) {
    for (const face of m.fixedFaces) {
      for (const s of face.sockets) {
        const skill = FIXED_SKILLS[s.skillId];
        if (skill && !addedFixedIds.has(skill.id)) {
          addedFixedIds.add(skill.id);
          allSkills.push({
            id: skill.id, name: skill.name, element: skill.element,
            effect: skill.effect, source: m.name, isRune: false,
          });
        }
      }
    }
  }

  // 未発見の固有スキル数
  const totalFixedCount = Object.keys(FIXED_SKILLS).length;
  const undiscoveredCount = totalFixedCount - addedFixedIds.size;

  // フィルタ
  const filtered = allSkills.filter(s => {
    if (filterElement !== 'all' && s.element !== filterElement) return false;
    if (filterType !== 'all' && s.effect.type !== filterType) return false;
    return true;
  });

  return (
    <div>
      {/* フィルタ */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', gap: 2, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 8, color: '#998a78', lineHeight: '20px' }}>属性:</span>
          <button
            onClick={() => setFilterElement('all')}
            style={{
              fontSize: 8, padding: '2px 5px', cursor: 'pointer', borderRadius: 3,
              background: filterElement === 'all' ? '#d8d0c4' : 'transparent',
              border: '1px solid #c0b8a8', color: '#3a2a1a',
            }}
          >全</button>
          {elements.map(el => (
            <button
              key={el}
              onClick={() => setFilterElement(el)}
              style={{
                fontSize: 8, padding: '2px 5px', cursor: 'pointer', borderRadius: 3,
                background: filterElement === el ? ELEMENT_COLORS[el] + '40' : 'transparent',
                border: `1px solid ${ELEMENT_COLORS[el]}60`, color: ELEMENT_COLORS[el],
              }}
            >{ELEMENT_NAMES[el]}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 8, color: '#998a78', lineHeight: '20px' }}>効果:</span>
          <button
            onClick={() => setFilterType('all')}
            style={{
              fontSize: 8, padding: '2px 5px', cursor: 'pointer', borderRadius: 3,
              background: filterType === 'all' ? '#d8d0c4' : 'transparent',
              border: '1px solid #c0b8a8', color: '#3a2a1a',
            }}
          >全</button>
          {effectTypes.map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              style={{
                fontSize: 8, padding: '2px 5px', cursor: 'pointer', borderRadius: 3,
                background: filterType === t ? '#d8d0c4' : 'transparent',
                border: '1px solid #c0b8a8', color: '#3a2a1a',
              }}
            >{EFFECT_TYPE_NAMES[t]}</button>
          ))}
        </div>
      </div>

      {/* 件数 */}
      <div style={{ fontSize: 9, color: '#998a78', marginBottom: 4 }}>
        表示: {filtered.length} / {allSkills.length}件
        {undiscoveredCount > 0 && (
          <span style={{ marginLeft: 6 }}>（未発見の固有スキル: {undiscoveredCount}）</span>
        )}
      </div>

      {/* リスト */}
      <div style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
        {filtered.map(s => (
          <SkillDetailRow
            key={s.id}
            name={s.name}
            element={s.element}
            effect={s.effect}
            badge={
              <span style={{
                fontSize: 7, padding: '0 3px', borderRadius: 2,
                background: s.isRune ? '#3070a0' + '20' : '#705828' + '20',
                color: s.isRune ? '#3070a0' : '#705828',
                border: '1px solid ' + (s.isRune ? '#3070a0' : '#705828') + '40',
              }}>
                {s.source}
              </span>
            }
          />
        ))}
        {filtered.length === 0 && (
          <div style={{ fontSize: 9, color: '#998a78', textAlign: 'center', padding: 12 }}>
            該当するスキルがありません
          </div>
        )}
      </div>
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
