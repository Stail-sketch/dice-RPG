import { useGameStore } from '../../stores/gameStore';
import { CHAPTER1_MONSTERS, CHAPTER2_MONSTERS, CHAPTER3_MONSTERS, CHAPTER4_MONSTERS, CHAPTER5_MONSTERS, CHAPTER6_MONSTERS, CHAPTER7_MONSTERS } from '../../data/monsters';
import { SKILL_RUNES } from '../../data/skill-runes';
import { ElementBadge, ELEMENT_COLORS } from '../common/ElementBadge';
import { MonsterSprite } from '../common/MonsterSprite';
import type { MonsterDice } from '../../types';

const CHAPTER_MONSTERS: Record<number, MonsterDice[]> = {
  1: CHAPTER1_MONSTERS,
  2: CHAPTER2_MONSTERS,
  3: CHAPTER3_MONSTERS,
  4: CHAPTER4_MONSTERS,
  5: CHAPTER5_MONSTERS,
  6: CHAPTER6_MONSTERS,
  7: CHAPTER7_MONSTERS,
};

const CHAPTER_NAMES: Record<number, string> = {
  1: '第1章: 炎の洞窟',
  2: '第2章: 氷結の峡谷',
  3: '第3章: 雷鳴の塔',
  4: '第4章: 毒沼の森',
  5: '第5章: 鋼鉄の遺跡',
  6: '第6章: 幻影の神殿',
  7: '最終章: 運命の回廊',
};

// 敵ダイスにランダムルーン装着（章が進むほど多く装着）
function equipRandomRunes(dice: MonsterDice, chapter: number): MonsterDice {
  const clone: MonsterDice = JSON.parse(JSON.stringify(dice));
  const eligible = SKILL_RUNES.filter(r => r.tier === 'common' || (chapter >= 3 && r.tier === 'rare'));
  if (eligible.length === 0) return clone;
  // 章ごとの装着率: ch1=20%, ch2=30%, ch3=40%... ch7=80%
  const fillRate = Math.min(0.8, 0.1 + chapter * 0.1);
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

// 敵パーティ生成: メインモンスター + ランダムな取り巻き（ルーン装着済み）
function buildEnemyParty(mainMonster: MonsterDice, chapterMonsters: MonsterDice[], chapter: number): MonsterDice[] {
  const weaker = chapterMonsters.filter(m => m.rarity <= mainMonster.rarity && m.id !== mainMonster.id);
  const companion1 = weaker.length > 0
    ? weaker[Math.floor(Math.random() * weaker.length)]
    : mainMonster;
  const companion2 = weaker.length > 0
    ? weaker[Math.floor(Math.random() * weaker.length)]
    : mainMonster;
  return [equipRandomRunes(mainMonster, chapter), equipRandomRunes(companion1, chapter), equipRandomRunes(companion2, chapter)];
}

export function DungeonScreen() {
  const { setScreen, setCurrentEnemy, capturedMonsters, currentChapter, advanceChapter } = useGameStore();

  const chapterMonsters = CHAPTER_MONSTERS[currentChapter] || CHAPTER1_MONSTERS;
  const normalMonsters = chapterMonsters.filter(m => m.rarity <= 2);
  const rareMonsters = chapterMonsters.filter(m => m.rarity === 3);
  const bossMonster = chapterMonsters.find(m => m.rarity >= 4);

  // ボス捕獲済みかチェック（章進行条件）
  const bossCaptured = bossMonster ? capturedMonsters.includes(bossMonster.id) : false;

  const startBattle = (monster: MonsterDice) => {
    setCurrentEnemy(buildEnemyParty(monster, chapterMonsters, currentChapter));
    setScreen('battle');
  };

  const MonsterRow = ({ m }: { m: MonsterDice }) => {
    const captured = capturedMonsters.includes(m.id);
    return (
      <div className="rpg-panel" style={{ marginBottom: 3, padding: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <MonsterSprite monsterId={m.id} element={m.element} size={32} animate />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ color: ELEMENT_COLORS[m.element], fontSize: 12 }}>{'★'.repeat(m.rarity)}</span>
              <span style={{ fontSize: 13 }}>{m.name}</span>
              <ElementBadge element={m.element} />
              {captured && <span style={{ fontSize: 9, color: '#308050' }}>捕獲済</span>}
            </div>
            <div style={{ fontSize: 9, color: '#998a78', marginTop: 2 }}>
              {m.description}
            </div>
            <div style={{ fontSize: 9, color: '#998a78', marginTop: 1 }}>
              捕獲率: {m.baseStats.captureRate}% | 固有面: {m.fixedFaces.length}
            </div>
          </div>
          <button
            className="rpg-btn"
            style={{ width: 'auto', padding: '6px 14px', margin: 0, fontSize: 12 }}
            onClick={() => startBattle(m)}
          >
            戦う
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: 8 }}>
      <div className="rpg-panel">
        <div className="rpg-panel-title">{CHAPTER_NAMES[currentChapter] || `第${currentChapter}章`}</div>
        <div style={{ fontSize: 10, color: '#998a78', textAlign: 'center' }}>
          モンスターを倒してダイスに封印せよ
        </div>
      </div>

      <div style={{ maxHeight: 'calc(100vh - 160px)', overflowY: 'auto' }}>
        {/* 通常モンスター */}
        <div style={{ fontSize: 10, color: '#998a78', padding: '4px 8px' }}>通常モンスター</div>
        {normalMonsters.map(m => <MonsterRow key={m.id} m={m} />)}

        {/* レアモンスター */}
        <div style={{ fontSize: 10, color: '#7050a0', padding: '4px 8px', marginTop: 8 }}>
          レアモンスター
        </div>
        {rareMonsters.map(m => <MonsterRow key={m.id} m={m} />)}

        {/* ボス */}
        {bossMonster && (
          <>
            <div style={{ fontSize: 10, color: '#b04030', padding: '4px 8px', marginTop: 8 }}>
              ボス
            </div>
            <MonsterRow m={bossMonster} />
          </>
        )}
      </div>

      <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {currentChapter > 1 && (
            <button
              className="rpg-btn"
              style={{ flex: 1 }}
              onClick={() => useGameStore.setState({ currentChapter: currentChapter - 1 })}
            >
              前の章へ
            </button>
          )}
          {bossCaptured && currentChapter < 7 && (
            <button
              className="rpg-btn"
              style={{ flex: 1 }}
              onClick={() => advanceChapter()}
            >
              次の章へ
            </button>
          )}
        </div>
        <button className="rpg-btn" onClick={() => setScreen('town')}>
          街に戻る
        </button>
      </div>
    </div>
  );
}
