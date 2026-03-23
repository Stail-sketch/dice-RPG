import { useGameStore } from '../../stores/gameStore';
import { ALL_MONSTERS } from '../../data/monsters';
import { SKILL_RUNES } from '../../data/skill-runes';
import { ElementBadge, ELEMENT_COLORS } from '../common/ElementBadge';
import type { MonsterDice, Element } from '../../types';

// Daily challenge types rotate based on day of year
const EVENT_TYPES = [
  { id: 'gold-rush', name: 'ゴールドラッシュ', description: '金貨が大量に手に入る！報酬ゴールド3倍', rewardMult: { gold: 3 }, element: 'alloy' as const },
  { id: 'rune-hunt', name: 'ルーンハント', description: 'レアルーンのドロップ率UP！', rewardMult: { runeDrops: 3 }, element: 'mirage' as const },
  { id: 'forge-fever', name: '鍛冶フィーバー', description: '鍛冶素材が大量に手に入る！', rewardMult: { materials: 3 }, element: 'blaze' as const },
  { id: 'exp-boost', name: '経験値ブースト', description: '経験値3倍！レベルアップのチャンス', rewardMult: { exp: 3 }, element: 'volt' as const },
  { id: 'gem-mine', name: 'ジェム鉱山', description: 'ジェムのかけらが大量に手に入る', rewardMult: { gems: 3 }, element: 'frost' as const },
  { id: 'poison-swamp', name: '毒沼チャレンジ', description: '毒状態で戦闘開始！クリアで大報酬', rewardMult: { gold: 2, materials: 2 }, element: 'venom' as const },
  { id: 'boss-rush', name: 'ボスラッシュ', description: '歴代ボスと連戦！最高の報酬', rewardMult: { gold: 2, runeDrops: 2, materials: 2 }, element: 'blaze' as const },
];

function getTodayEvent() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return EVENT_TYPES[dayOfYear % EVENT_TYPES.length];
}

const DIFFICULTIES = [
  { id: 'beginner', label: '初級', enemyRarityMax: 2, hpMult: 0.8, rewardScale: 1.0 },
  { id: 'intermediate', label: '中級', enemyRarityMax: 3, hpMult: 1.2, rewardScale: 1.5 },
  { id: 'advanced', label: '上級', enemyRarityMax: 4, hpMult: 1.8, rewardScale: 2.5 },
];

// Equip random runes on enemy dice for event battles
function equipRandomRunesEvent(dice: MonsterDice, fillRate: number): MonsterDice {
  const clone: MonsterDice = JSON.parse(JSON.stringify(dice));
  const eligible = SKILL_RUNES.filter(r => r.tier === 'common' || r.tier === 'rare');
  for (const face of clone.customFaces) {
    for (const socket of face.sockets) {
      if (!socket.skillRuneId && Math.random() < fillRate) {
        const rune = eligible[Math.floor(Math.random() * eligible.length)];
        socket.skillRuneId = rune.id;
      }
    }
  }
  return clone;
}

// Build event enemy party themed to element
function buildEventParty(element: Element, rarityMax: number): MonsterDice[] {
  // Filter monsters by element preference (70% chance element match)
  const allNonBoss = ALL_MONSTERS.filter(m => m.rarity <= rarityMax && m.rarity >= 1);
  const themed = allNonBoss.filter(m => m.element === element);
  const pool = themed.length >= 3 ? themed : allNonBoss;

  const party: MonsterDice[] = [];
  for (let i = 0; i < 3; i++) {
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const fillRate = rarityMax <= 2 ? 0.3 : rarityMax <= 3 ? 0.5 : 0.8;
    party.push(equipRandomRunesEvent(pick, fillRate));
  }
  return party;
}

export function EventScreen() {
  const { setScreen, setCurrentEnemy, eventCompletedToday, eventLastDate } = useGameStore();
  const event = getTodayEvent();
  const today = new Date().toISOString().slice(0, 10);

  // Reset tracking if day changed
  const completedToday = eventLastDate === today ? eventCompletedToday : [];

  const startEventBattle = (diffId: string) => {
    const diff = DIFFICULTIES.find(d => d.id === diffId)!;
    const party = buildEventParty(event.element, diff.enemyRarityMax);

    // Set event state
    useGameStore.setState({
      isEventBattle: true,
      isHardMode: false,
      eventRewardMult: Object.fromEntries(
        Object.entries({ ...event.rewardMult, _rewardScale: diff.rewardScale })
          .filter(([, v]) => v !== undefined)
      ) as Record<string, number>,
    });

    setCurrentEnemy(party);
    setScreen('battle');
  };

  const elColor = ELEMENT_COLORS[event.element];

  return (
    <div style={{ padding: 8 }}>
      {/* Header */}
      <div className="rpg-panel" style={{ marginBottom: 6 }}>
        <div className="rpg-panel-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span>本日のイベント</span>
        </div>
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              fontSize: 16, fontWeight: 'bold', color: elColor,
              fontFamily: "'DotGothic16', monospace",
            }}>
              {event.name}
            </span>
            <ElementBadge element={event.element} />
          </div>
          <div style={{ fontSize: 11, color: '#6a5a4a', lineHeight: 1.6 }}>
            {event.description}
          </div>
        </div>
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap',
          fontSize: 10, color: '#998a78', padding: '4px 0',
        }}>
          {Object.entries(event.rewardMult).map(([key, val]) => (
            <span key={key} style={{
              background: '#ece5d8', padding: '2px 8px', borderRadius: 4,
              border: '1px solid #d0c8b8',
            }}>
              {key === 'gold' ? 'ゴールド' :
               key === 'exp' ? '経験値' :
               key === 'runeDrops' ? 'ルーン' :
               key === 'materials' ? '素材' :
               key === 'gems' ? 'ジェム' : key} x{val}
            </span>
          ))}
        </div>
      </div>

      {/* Difficulty selection */}
      <div className="rpg-panel">
        <div className="rpg-panel-title">難易度を選択</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 0' }}>
          {DIFFICULTIES.map(diff => {
            const completed = completedToday.includes(diff.id);
            return (
              <div key={diff.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 12px',
                background: completed ? '#e8e2d8' : '#f5f0e8',
                border: '1px solid #d0c8b8',
                borderRadius: 4,
                opacity: completed ? 0.6 : 1,
              }}>
                <div>
                  <div style={{
                    fontSize: 13, fontWeight: 'bold',
                    color: diff.id === 'advanced' ? '#b04030' : diff.id === 'intermediate' ? '#807020' : '#3a6a3a',
                    fontFamily: "'DotGothic16', monospace",
                  }}>
                    {diff.label}
                  </div>
                  <div style={{ fontSize: 9, color: '#998a78', marginTop: 2 }}>
                    敵★{diff.enemyRarityMax}以下 / 報酬x{diff.rewardScale}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {completed && (
                    <span style={{ fontSize: 10, color: '#308050', fontFamily: "'DotGothic16', monospace" }}>
                      済
                    </span>
                  )}
                  <button
                    className="rpg-btn"
                    disabled={completed}
                    style={{
                      width: 'auto', padding: '6px 16px', margin: 0, fontSize: 12,
                      opacity: completed ? 0.4 : 1,
                    }}
                    onClick={() => startEventBattle(diff.id)}
                  >
                    {completed ? 'クリア済' : '挑戦'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's completion status */}
      <div className="rpg-panel" style={{ marginTop: 6, padding: 8 }}>
        <div style={{ fontSize: 10, color: '#998a78', textAlign: 'center' }}>
          本日のクリア状況: {completedToday.length} / {DIFFICULTIES.length}
          {completedToday.length >= DIFFICULTIES.length && (
            <span style={{ color: '#308050', marginLeft: 8 }}>全難易度クリア！</span>
          )}
        </div>
        <div style={{ fontSize: 9, color: '#b0a898', textAlign: 'center', marginTop: 4 }}>
          イベントは毎日0時にリセットされます
        </div>
      </div>

      {/* Back button */}
      <button
        className="rpg-btn"
        style={{ marginTop: 8, padding: '10px 12px' }}
        onClick={() => setScreen('town')}
      >
        町に戻る
      </button>
    </div>
  );
}
