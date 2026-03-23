import { useState } from 'react';
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

// 章ごとの難易度設定
const CHAPTER_DIFFICULTY: Record<number, {
  fillRate: number;
  runeTiers: string[];
  silverRate: number;
  goldRate: number;
}> = {
  1: { fillRate: 0.2, runeTiers: ['common'], silverRate: 0, goldRate: 0 },
  2: { fillRate: 0.3, runeTiers: ['common'], silverRate: 0.1, goldRate: 0 },
  3: { fillRate: 0.4, runeTiers: ['common', 'rare'], silverRate: 0.2, goldRate: 0 },
  4: { fillRate: 0.5, runeTiers: ['common', 'rare'], silverRate: 0.3, goldRate: 0.05 },
  5: { fillRate: 0.6, runeTiers: ['common', 'rare', 'epic'], silverRate: 0.4, goldRate: 0.1 },
  6: { fillRate: 0.7, runeTiers: ['common', 'rare', 'epic'], silverRate: 0.5, goldRate: 0.15 },
  7: { fillRate: 0.8, runeTiers: ['common', 'rare', 'epic', 'legendary'], silverRate: 0.6, goldRate: 0.2 },
};

// 章フレーバーテキスト
const CHAPTER_FLAVOR: Record<number, { intro: string; atmosphere: string }> = {
  1: { intro: '地下に広がる灼熱の洞窟。溶岩の光が壁を照らす。', atmosphere: '熱気が肌を焼く...' },
  2: { intro: '万年雪に覆われた険しい峡谷。吐く息が白く凍る。', atmosphere: '凍てつく風が吹き抜ける...' },
  3: { intro: '嵐雲を突き抜ける巨大な塔。稲妻が壁を走る。', atmosphere: '空気が帯電している...' },
  4: { intro: '瘴気に満ちた暗い森。毒々しい茸が光を放つ。', atmosphere: '足元から毒霧が立ち昇る...' },
  5: { intro: '古代文明の金属遺跡。歯車が今も回り続ける。', atmosphere: '機械音が響き渡る...' },
  6: { intro: '現実と夢の境界が曖昧な神殿。景色が歪む。', atmosphere: '何が現実かわからない...' },
  7: { intro: '全ての運命が交錯する最後の回廊。', atmosphere: '最終決戦の時が来た...' },
};

// ボス戦前台詞
const BOSS_DIALOGUE: Record<number, string[]> = {
  1: ['「この洞窟の主は俺だ...」', '「お前の貧弱なダイスで勝てると思うな！」'],
  2: ['「永久凍土に眠る者を起こしたな...」', '「お前も氷の彫像にしてやろう」'],
  3: ['「雷鳴の塔の番人、ここを通すわけにはいかん」', '「天の裁きを受けよ！」'],
  4: ['「この森に入った者は...二度と出られない」', '「毒に蝕まれて朽ちるがいい」'],
  5: ['「古の守護機構、起動する」', '「侵入者排除プロトコル...実行」'],
  6: ['「現実と幻の区別がつくかな？」', '「お前が見ているものは全て幻影かもしれない」'],
  7: ['「ここが全ての終着点だ」', '「運命の輪を止められるか、試してみろ！」'],
};

// ボス戦前ダイアログコンポーネント
function BossDialogue({ monster, lines, onComplete }: { monster: MonsterDice; lines: string[]; onComplete: () => void }) {
  const [lineIndex, setLineIndex] = useState(0);

  const handleAdvance = () => {
    if (lineIndex < lines.length - 1) {
      setLineIndex(lineIndex + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.75)', zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}
      onClick={handleAdvance}
    >
      <div style={{ marginBottom: 24 }}>
        <MonsterSprite monsterId={monster.id} element={monster.element} size={64} animate />
      </div>
      <div style={{ fontSize: 14, color: ELEMENT_COLORS[monster.element], marginBottom: 12, fontWeight: 'bold' }}>
        {monster.name}
      </div>
      <div
        className="rpg-panel"
        style={{
          maxWidth: 320, width: '80%', padding: '16px 20px',
          fontSize: 14, lineHeight: 1.6, color: '#3a2a1a', textAlign: 'center',
        }}
      >
        {lines[lineIndex]}
      </div>
      <div style={{ fontSize: 10, color: '#998a78', marginTop: 12, opacity: 0.7 }}>
        {lineIndex < lines.length - 1 ? 'クリックして続ける...' : 'クリックして戦闘開始'}
      </div>
    </div>
  );
}

// 敵ダイスにランダムルーン装着（章の難易度設定に基づく）
function equipRandomRunes(dice: MonsterDice, chapter: number): MonsterDice {
  const clone: MonsterDice = JSON.parse(JSON.stringify(dice));
  const diff = CHAPTER_DIFFICULTY[Math.min(chapter, 7)] || CHAPTER_DIFFICULTY[7];
  const eligible = SKILL_RUNES.filter(r => diff.runeTiers.includes(r.tier));
  if (eligible.length === 0) return clone;
  for (const face of clone.customFaces) {
    for (const socket of face.sockets) {
      if (!socket.skillRuneId && Math.random() < diff.fillRate) {
        const rune = eligible[Math.floor(Math.random() * eligible.length)];
        socket.skillRuneId = rune.id;
      }
      // ソケット品質アップグレード
      if (socket.socketTier === 'bronze') {
        if (Math.random() < diff.goldRate) {
          socket.socketTier = 'gold';
        } else if (Math.random() < diff.silverRate) {
          socket.socketTier = 'silver';
        }
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
  const { setScreen, setCurrentEnemy, capturedMonsters, bossesDefeated, currentChapter, advanceChapter } = useGameStore();
  const [hardMode, setHardMode] = useState(false);
  const [bossDialogueTarget, setBossDialogueTarget] = useState<MonsterDice | null>(null);

  const displayChapter = currentChapter;
  const chapterMonsters = CHAPTER_MONSTERS[displayChapter] || CHAPTER1_MONSTERS;
  const normalMonsters = chapterMonsters.filter(m => m.rarity <= 2);
  const rareMonsters = chapterMonsters.filter(m => m.rarity === 3);
  const bossMonster = chapterMonsters.find(m => m.rarity >= 4);

  // 全章クリアで高難度解禁
  const allCleared = currentChapter >= 7 && bossMonster && bossesDefeated.includes(bossMonster.id);

  // ボス撃破済みかチェック（章進行条件）
  const bossDefeated = bossMonster ? bossesDefeated.includes(bossMonster.id) : false;

  const doStartBattle = (monster: MonsterDice) => {
    // 高難度モード: 敵のルーン装着率100%＋全ソケットsilver化
    const party = buildEnemyParty(monster, chapterMonsters, hardMode ? 10 : displayChapter);
    if (hardMode) {
      for (const d of party) {
        for (const face of d.customFaces) {
          for (const sock of face.sockets) {
            if (sock.socketTier === 'bronze') sock.socketTier = 'silver';
          }
        }
      }
    }
    useGameStore.setState({ isHardMode: hardMode });
    setCurrentEnemy(party);
    setScreen('battle');
  };

  const startBattle = (monster: MonsterDice) => {
    // ボス（rarity >= 4）の場合、戦闘前ダイアログを表示
    if (monster.rarity >= 4 && BOSS_DIALOGUE[displayChapter]) {
      setBossDialogueTarget(monster);
    } else {
      doStartBattle(monster);
    }
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
      {/* ボス戦前ダイアログオーバーレイ */}
      {bossDialogueTarget && BOSS_DIALOGUE[displayChapter] && (
        <BossDialogue
          monster={bossDialogueTarget}
          lines={BOSS_DIALOGUE[displayChapter]}
          onComplete={() => {
            const target = bossDialogueTarget;
            setBossDialogueTarget(null);
            doStartBattle(target);
          }}
        />
      )}

      <div className="rpg-panel">
        <div className="rpg-panel-title">
          {hardMode ? '【高難度】' : ''}{CHAPTER_NAMES[currentChapter] || `第${currentChapter}章`}
        </div>
        {CHAPTER_FLAVOR[currentChapter] && (
          <>
            <div style={{ fontSize: 11, color: '#3a2a1a', textAlign: 'center', padding: '4px 8px', lineHeight: 1.5 }}>
              {CHAPTER_FLAVOR[currentChapter].intro}
            </div>
            <div style={{ fontSize: 10, color: '#998a78', textAlign: 'center', fontStyle: 'italic', marginBottom: 4 }}>
              {CHAPTER_FLAVOR[currentChapter].atmosphere}
            </div>
          </>
        )}
        <div style={{ fontSize: 10, color: '#998a78', textAlign: 'center' }}>
          {hardMode ? '敵が大幅に強化されています' : 'モンスターを倒してダイスに封印せよ'}
        </div>
        {allCleared && (
          <div style={{ textAlign: 'center', marginTop: 4 }}>
            <button
              style={{
                fontSize: 9, padding: '2px 10px', cursor: 'pointer', borderRadius: 4,
                background: hardMode ? '#b04030' : '#ece5d8',
                color: hardMode ? '#f5f0e8' : '#b04030',
                border: '1px solid #b04030',
              }}
              onClick={() => setHardMode(!hardMode)}
            >
              {hardMode ? '通常モードに戻す' : '高難度モード'}
            </button>
          </div>
        )}
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
          {bossDefeated && currentChapter < 7 && (
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
