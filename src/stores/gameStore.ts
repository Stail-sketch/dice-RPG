import { create } from 'zustand';
import type { MonsterDice, SkillRune, BattleState, SocketTier, Element } from '../types';
// MAX_SAME_MONSTER制限を撤廃（無制限取得可能）
import type { DecomposeResult, PartyBonus } from '../types';
import { CHAPTER1_MONSTERS, PROTAGONIST_DICE, ALL_MONSTERS } from '../data/monsters';
import { SKILL_RUNES } from '../data/skill-runes';
import { ACHIEVEMENTS } from '../data/achievements';
import { saveGame, loadGame } from './saveSystem';
import { applyDefaultSocketTiers } from '../utils/applyDefaultTiers';

export type Screen = 'title' | 'town' | 'dungeon' | 'battle' | 'dice-editor' | 'forge' | 'shop' | 'gacha' | 'codex' | 'pvp' | 'capture' | 'tutorial' | 'event' | 'settings' | 'ending';

interface TutorialState {
  completed: boolean;
  currentStep: number; // 0=not started, 1-4=steps
}

interface Materials {
  'forge-stone': number;
  'rare-ore': number;
  'expansion-crystal': number;
}

interface GameState {
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;

  playerName: string;
  playerLevel: number;
  playerExp: number;
  playerMaxHp: number;
  gold: number;
  gems: number;
  gemFragments: number; // 10個で1ジェム（ショップで還元）
  materials: Materials;
  addGemFragments: (amount: number) => void;
  addExp: (amount: number) => { levelsGained: number; newLevel: number; newMaxHp: number; currentExp: number; expToNext: number };
  getExpToNext: () => number;

  protagonistDice: MonsterDice;
  ownedDice: MonsterDice[];
  party: [string, string, string];
  ownedRunes: SkillRune[];

  decomposeDice: (diceInstanceId: string) => DecomposeResult | null;
  getPartyBonus: () => PartyBonus;

  currentChapter: number;
  clearedDungeons: string[]; // クリア済みダンジョンID
  capturedMonsters: string[];
  bossesDefeated: string[]; // 撃破済みボスID

  // 実績
  achievements: string[];
  unlockAchievement: (id: string) => void;
  checkAchievements: () => string[];

  // チュートリアル
  tutorial: TutorialState;
  setTutorialStep: (step: number) => void;
  completeTutorial: () => void;
  startTutorial: () => void;

  // ガチャ天井
  gachaPityDice: number;
  gachaPityRune: number;
  setGachaPityDice: (n: number) => void;
  setGachaPityRune: (n: number) => void;

  battleState: BattleState | null;
  setBattleState: (state: BattleState | null) => void;
  currentEnemy: MonsterDice[] | null;

  // マジックダイス
  ownedMagicDice: string[];
  equippedMagicDice: string | null;
  addMagicDice: (id: string) => void;
  equipMagicDice: (id: string | null) => void;

  // PVP
  pvpPoints: number;
  pvpWins: number;
  pvpLosses: number;
  isPvpBattle: boolean;
  isTutorialBattle: boolean;
  isHardMode: boolean;
  battleChapter: number; // 実際に戦っている章（表示用チャプター）
  addPvpResult: (won: boolean) => void;

  // イベントダンジョン
  eventCompletedToday: string[];
  eventLastDate: string;
  isEventBattle: boolean;
  eventRewardMult: Record<string, number>;
  startEventBattle: (difficulty: string) => void;
  completeEvent: (difficulty: string) => void;

  // ダイス
  addDice: (dice: MonsterDice) => void;
  setParty: (party: [string, string, string]) => void;

  // ルーン
  addRune: (rune: SkillRune) => void;
  addRunes: (runes: SkillRune[]) => void;
  removeRune: (runeId: string) => void;
  equipRune: (diceId: string, faceNumber: number, socketIndex: number, runeId: string) => void;
  unequipRune: (diceId: string, faceNumber: number, socketIndex: number) => void;

  // 通貨・素材
  addGold: (amount: number) => void;
  addGems: (amount: number) => void;
  addMaterial: (id: keyof Materials, amount: number) => void;

  // 進行
  setCurrentEnemy: (enemy: MonsterDice[] | null) => void;
  captureMonster: (monsterId: string) => void;
  clearDungeon: (dungeonId: string) => void;
  defeatBoss: (bossId: string) => void;

  // 売却
  sellDice: (diceInstanceId: string) => boolean;
  sellRune: (runeId: string) => boolean;

  // ルーン一括はずし
  unequipAllRunes: (diceId: string) => void;

  // 鍛冶
  upgradeSocket: (diceId: string, faceNumber: number, socketIndex: number) => boolean;

  // ソケット拡張（上級鍛冶）
  socketExpansions: Record<string, number[]>; // diceId → 拡張済みface番号の配列
  expandSocket: (diceId: string, faceNumber: number) => boolean;

  // ヒーロー属性変更
  changeHeroElement: (element: Element) => void;

  // 章進行
  advanceChapter: () => void;

  // エンディング
  endingShown: boolean;
  setEndingShown: (v: boolean) => void;

  // セーブ/ロード
  save: () => Promise<void>;
  load: () => Promise<boolean>;
  initNewGame: () => void;
}

const UPGRADE_COST: Record<SocketTier, { next: SocketTier; stones: number; gold: number; ore: number }> = {
  bronze: { next: 'silver', stones: 5, gold: 400, ore: 0 },
  silver: { next: 'gold', stones: 8, gold: 1000, ore: 3 },
  gold: { next: 'gold', stones: 0, gold: 0, ore: 0 }, // can't upgrade further
};

function getSaveableState(s: GameState) {
  return {
    playerName: s.playerName,
    playerLevel: s.playerLevel,
    playerExp: s.playerExp,
    playerMaxHp: s.playerMaxHp,
    gold: s.gold,
    gems: s.gems,
    materials: s.materials,
    protagonistDice: s.protagonistDice,
    ownedDice: s.ownedDice,
    party: s.party,
    ownedRunes: s.ownedRunes,
    currentChapter: s.currentChapter,
    clearedDungeons: s.clearedDungeons,
    capturedMonsters: s.capturedMonsters,
    bossesDefeated: s.bossesDefeated,
    achievements: s.achievements,
    gachaPityDice: s.gachaPityDice,
    gachaPityRune: s.gachaPityRune,
    tutorial: s.tutorial,
    ownedMagicDice: s.ownedMagicDice,
    equippedMagicDice: s.equippedMagicDice,
    gemFragments: s.gemFragments,
    socketExpansions: s.socketExpansions,
    pvpPoints: s.pvpPoints,
    pvpWins: s.pvpWins,
    pvpLosses: s.pvpLosses,
    eventCompletedToday: s.eventCompletedToday,
    eventLastDate: s.eventLastDate,
    endingShown: s.endingShown,
  };
}

export const useGameStore = create<GameState>((set, get) => ({
  currentScreen: 'title',
  setScreen: (screen) => set({ currentScreen: screen }),

  playerName: 'ダイスマスター',
  playerLevel: 1,
  playerExp: 0,
  playerMaxHp: 50,
  gold: 500,
  gems: 10,
  gemFragments: 0,
  materials: { 'forge-stone': 0, 'rare-ore': 0, 'expansion-crystal': 0 },

  protagonistDice: { ...PROTAGONIST_DICE },
  ownedDice: [],
  party: ['', '', ''],
  ownedRunes: [],

  getPartyBonus: () => {
    const s = get();
    const hasProtagonist = s.party.includes('protagonist');
    return {
      goldMultiplier: hasProtagonist ? 1.2 : 1.0,
      captureBonus: hasProtagonist ? 10 : 0,
    };
  },

  tutorial: { completed: true, currentStep: 0 },

  setTutorialStep: (step) => set((s) => ({
    tutorial: { ...s.tutorial, currentStep: step },
  })),

  completeTutorial: () => set((s) => ({
    tutorial: { completed: true, currentStep: 0 },
    gold: s.gold + 500,
    gems: s.gems + 30,
    materials: { ...s.materials, 'forge-stone': s.materials['forge-stone'] + 3 },
    currentScreen: 'town' as Screen,
  })),

  startTutorial: () => {
    set({
      protagonistDice: { ...PROTAGONIST_DICE },
      ownedDice: [],
      party: ['protagonist', '', ''],
      ownedRunes: [],
      playerLevel: 1,
      playerExp: 0,
      playerMaxHp: 50,
      gold: 0,
      gems: 0,
      gemFragments: 0,
      materials: { 'forge-stone': 0, 'rare-ore': 0, 'expansion-crystal': 0 },
      currentChapter: 1,
      clearedDungeons: [],
      capturedMonsters: [],
      bossesDefeated: [],
      achievements: [],
      gachaPityDice: 0,
      gachaPityRune: 0,
      tutorial: { completed: false, currentStep: 1 },
      ownedMagicDice: [],
      equippedMagicDice: null,
      endingShown: false,
      eventCompletedToday: [],
      eventLastDate: '',
      pvpPoints: 0,
      pvpWins: 0,
      pvpLosses: 0,
      battleChapter: 1,
      socketExpansions: {},
      currentScreen: 'tutorial' as Screen,
    });
    setTimeout(() => get().save(), 100);
  },

  currentChapter: 1,
  clearedDungeons: [],
  capturedMonsters: [],
  bossesDefeated: [],
  achievements: [],

  unlockAchievement: (id) => set((s) => ({
    achievements: s.achievements.includes(id) ? s.achievements : [...s.achievements, id],
  })),

  checkAchievements: () => {
    const s = get();
    const newlyUnlocked: string[] = [];
    for (const a of ACHIEVEMENTS) {
      if (!s.achievements.includes(a.id) && a.check(s)) {
        newlyUnlocked.push(a.id);
      }
    }
    if (newlyUnlocked.length > 0) {
      set({ achievements: [...s.achievements, ...newlyUnlocked] });
    }
    return newlyUnlocked;
  },

  gachaPityDice: 0,
  gachaPityRune: 0,
  setGachaPityDice: (n) => set({ gachaPityDice: n }),
  setGachaPityRune: (n) => set({ gachaPityRune: n }),

  ownedMagicDice: [],
  equippedMagicDice: null,
  pvpPoints: 0,
  pvpWins: 0,
  pvpLosses: 0,
  isPvpBattle: false,
  isTutorialBattle: false,
  isHardMode: false,
  battleChapter: 1,
  addPvpResult: (won) => {
    set((s) => ({
      pvpPoints: s.pvpPoints + (won ? 3 : 1),
      pvpWins: s.pvpWins + (won ? 1 : 0),
      pvpLosses: s.pvpLosses + (won ? 0 : 1),
      // isPvpBattleのリセットは画面遷移時に行う（結果画面のUI判定に必要）
    }));
    get().checkAchievements();
  },
  // イベントダンジョン
  eventCompletedToday: [],
  eventLastDate: '',
  isEventBattle: false,
  eventRewardMult: {},
  startEventBattle: (_difficulty: string) => {
    // difficulty is stored for tracking; reward mult is set externally via setState
    set({ isEventBattle: true });
  },
  completeEvent: (difficulty: string) => {
    const s = get();
    const today = new Date().toISOString().slice(0, 10);
    const completedToday = s.eventLastDate === today ? s.eventCompletedToday : [];
    if (!completedToday.includes(difficulty)) {
      set({
        eventCompletedToday: [...completedToday, difficulty],
        eventLastDate: today,
        // isEventBattleのリセットは画面遷移時に行う（結果画面のUI判定に必要）
      });
    }
  },

  endingShown: false,
  setEndingShown: (v) => set({ endingShown: v }),

  addMagicDice: (id) => set((s) => ({
    ownedMagicDice: s.ownedMagicDice.includes(id) ? s.ownedMagicDice : [...s.ownedMagicDice, id],
  })),
  equipMagicDice: (id) => set({ equippedMagicDice: id }),

  battleState: null,
  setBattleState: (state) => set({ battleState: state }),
  currentEnemy: null,

  addDice: (dice) => {
    const s = get();
    const baseId = dice.id;
    // ユニークなインスタンスID生成
    const existing = s.ownedDice.filter(d => (d.baseId || d.id) === baseId);
    const instanceId = `${baseId}_${String(existing.length + 1).padStart(3, '0')}_${Date.now() % 10000}`;
    const newDice = applyDefaultSocketTiers({ ...dice, id: instanceId, baseId: baseId });
    set({ ownedDice: [...s.ownedDice, newDice] });
  },
  setParty: (party) => set({ party }),

  decomposeDice: (diceInstanceId: string) => {
    const s = get();
    if (diceInstanceId === 'protagonist') return null;
    if (s.party.includes(diceInstanceId)) return null;

    const dice = s.ownedDice.find(d => d.id === diceInstanceId);
    if (!dice) return null;

    const result: DecomposeResult = {
      forgeStones: dice.rarity * 2 + 1,
      rareOre: dice.rarity >= 3 ? dice.rarity - 2 : 0,
      gold: dice.rarity * 100,
    };

    set({
      ownedDice: s.ownedDice.filter(d => d.id !== diceInstanceId),
      gold: s.gold + result.gold,
      materials: {
        ...s.materials,
        'forge-stone': s.materials['forge-stone'] + result.forgeStones,
        'rare-ore': s.materials['rare-ore'] + result.rareOre,
      },
    });

    return result;
  },

  addRune: (rune) => set((s) => ({ ownedRunes: [...s.ownedRunes, rune] })),
  addRunes: (runes) => set((s) => ({ ownedRunes: [...s.ownedRunes, ...runes] })),
  removeRune: (runeId) => set((s) => {
    const idx = s.ownedRunes.findIndex(r => r.id === runeId);
    if (idx === -1) return {};
    const next = [...s.ownedRunes];
    next.splice(idx, 1);
    return { ownedRunes: next };
  }),

  equipRune: (diceId, faceNumber, socketIndex, runeId) => set((s) => {
    const updateCustomFaces = (d: MonsterDice) => {
      const newCustom = d.customFaces.map(f => {
        if (f.faceNumber !== faceNumber) return f;
        const newSockets = f.sockets.map((sock, si) =>
          si !== socketIndex ? sock : { ...sock, skillRuneId: runeId }
        );
        return { ...f, sockets: newSockets };
      });
      return { ...d, customFaces: newCustom };
    };
    if (diceId === 'protagonist') {
      return { protagonistDice: updateCustomFaces(s.protagonistDice) };
    }
    const dice = s.ownedDice.map(d => d.id !== diceId ? d : updateCustomFaces(d));
    return { ownedDice: dice };
  }),

  unequipRune: (diceId, faceNumber, socketIndex) => set((s) => {
    const targetDice = diceId === 'protagonist'
      ? s.protagonistDice
      : s.ownedDice.find(d => d.id === diceId);
    if (!targetDice) return {};
    const face = targetDice.customFaces.find(f => f.faceNumber === faceNumber);
    if (!face) return {};
    const oldRuneId = face.sockets[socketIndex]?.skillRuneId;

    const clearSocket = (d: MonsterDice) => {
      const newCustom = d.customFaces.map(f => {
        if (f.faceNumber !== faceNumber) return f;
        const newSockets = f.sockets.map((sock, si) =>
          si !== socketIndex ? sock : { ...sock, skillRuneId: null }
        );
        return { ...f, sockets: newSockets };
      });
      return { ...d, customFaces: newCustom };
    };

    let newRunes = s.ownedRunes;
    if (oldRuneId) {
      const rune = SKILL_RUNES.find(r => r.id === oldRuneId);
      if (rune) newRunes = [...s.ownedRunes, { ...rune }];
    }

    if (diceId === 'protagonist') {
      return { protagonistDice: clearSocket(s.protagonistDice), ownedRunes: newRunes };
    }
    const dice = s.ownedDice.map(d => d.id !== diceId ? d : clearSocket(d));
    return { ownedDice: dice, ownedRunes: newRunes };
  }),

  addGold: (amount) => {
    set((s) => ({ gold: Math.max(0, s.gold + amount) }));
    get().checkAchievements();
  },
  addGems: (amount) => set((s) => ({ gems: Math.max(0, s.gems + amount) })),
  addGemFragments: (amount) => set((s) => {
    return {
      gemFragments: s.gemFragments + amount,
    };
  }),
  getExpToNext: () => {
    const s = get();
    return s.playerLevel * 100; // Lv1=100, Lv2=200, ...
  },
  addExp: (amount) => {
    const prev = get().playerLevel;
    set((s) => {
      let exp = s.playerExp + amount;
      let level = s.playerLevel;
      let hp = s.playerMaxHp;
      let needed = level * 100;
      while (exp >= needed) {
        exp -= needed;
        level++;
        hp += 50; // レベルアップでHP+50
        needed = level * 100;
      }
      return { playerExp: exp, playerLevel: level, playerMaxHp: hp };
    });
    get().checkAchievements();
    const after = get();
    return { levelsGained: after.playerLevel - prev, newLevel: after.playerLevel, newMaxHp: after.playerMaxHp, currentExp: after.playerExp, expToNext: after.getExpToNext() };
  },
  addMaterial: (id, amount) => set((s) => ({
    materials: { ...s.materials, [id]: Math.max(0, (s.materials[id] || 0) + amount) },
  })),

  // 売却
  sellDice: (diceInstanceId) => {
    const s = get();
    if (diceInstanceId === 'protagonist') return false;
    if (s.party.includes(diceInstanceId)) return false;
    const idx = s.ownedDice.findIndex(d => d.id === diceInstanceId);
    if (idx === -1) return false;
    set((s) => ({
      ownedDice: s.ownedDice.filter((_, i) => i !== idx),
      gemFragments: s.gemFragments + 1,
    }));
    return true;
  },

  sellRune: (runeId) => {
    const s = get();
    const idx = s.ownedRunes.findIndex(r => r.id === runeId);
    if (idx === -1) return false;
    set((s) => ({
      ownedRunes: s.ownedRunes.filter((_, i) => i !== idx),
      materials: { ...s.materials, 'forge-stone': s.materials['forge-stone'] + 1 },
    }));
    return true;
  },

  // ルーン一括はずし
  unequipAllRunes: (diceId) => {
    const s = get();
    const dice = diceId === 'protagonist' ? s.protagonistDice : s.ownedDice.find(d => d.id === diceId);
    if (!dice) return;
    const recoveredRunes: typeof s.ownedRunes = [];
    const clearCustomFaces = (d: MonsterDice) => {
      const newCustom = d.customFaces.map(f => ({
        ...f,
        sockets: f.sockets.map(sock => {
          if (sock.skillRuneId) {
            const rune = SKILL_RUNES.find(r => r.id === sock.skillRuneId);
            if (rune) recoveredRunes.push({ ...rune });
          }
          return { ...sock, skillRuneId: null };
        }),
      }));
      return { ...d, customFaces: newCustom };
    };
    set((s) => {
      const runesBack = [...s.ownedRunes, ...recoveredRunes];
      if (diceId === 'protagonist') {
        return { protagonistDice: clearCustomFaces(s.protagonistDice), ownedRunes: runesBack };
      }
      return { ownedDice: s.ownedDice.map(d => d.id !== diceId ? d : clearCustomFaces(d)), ownedRunes: runesBack };
    });
  },

  setCurrentEnemy: (enemy) => set({ currentEnemy: enemy }),
  captureMonster: (monsterId) => {
    set((s) => ({
      capturedMonsters: s.capturedMonsters.includes(monsterId) ? s.capturedMonsters : [...s.capturedMonsters, monsterId],
    }));
    get().checkAchievements();
  },
  clearDungeon: (dungeonId) => {
    set((s) => ({
      clearedDungeons: s.clearedDungeons.includes(dungeonId) ? s.clearedDungeons : [...s.clearedDungeons, dungeonId],
    }));
    get().checkAchievements();
  },
  defeatBoss: (bossId) => {
    set((s) => ({
      bossesDefeated: s.bossesDefeated.includes(bossId) ? s.bossesDefeated : [...s.bossesDefeated, bossId],
    }));
    get().checkAchievements();
  },

  // 鍛冶: ソケット強化
  upgradeSocket: (diceId, faceNumber, socketIndex) => {
    const s = get();

    // Find the dice (protagonist or owned)
    const dice = diceId === 'protagonist' ? s.protagonistDice : s.ownedDice.find(d => d.id === diceId);
    if (!dice) return false;
    const face = dice.customFaces.find(f => f.faceNumber === faceNumber);
    if (!face) return false;
    const socket = face.sockets[socketIndex];
    if (!socket || socket.socketTier === 'gold') return false;

    const cost = UPGRADE_COST[socket.socketTier];
    if (s.gold < cost.gold) return false;
    if (s.materials['forge-stone'] < cost.stones) return false;
    if (s.materials['rare-ore'] < cost.ore) return false;

    const upgradeCustomFaces = (d: MonsterDice) => {
      const newCustom = d.customFaces.map(f => {
        if (f.faceNumber !== faceNumber) return f;
        const newSockets = f.sockets.map((sock, si) =>
          si !== socketIndex ? sock : { ...sock, socketTier: cost.next }
        );
        return { ...f, sockets: newSockets };
      });
      return { ...d, customFaces: newCustom };
    };

    // コスト消費 + ソケット強化
    set((s) => {
      const costUpdate = {
        gold: s.gold - cost.gold,
        materials: {
          ...s.materials,
          'forge-stone': s.materials['forge-stone'] - cost.stones,
          'rare-ore': s.materials['rare-ore'] - cost.ore,
        },
      };

      if (diceId === 'protagonist') {
        return {
          protagonistDice: upgradeCustomFaces(s.protagonistDice),
          ...costUpdate,
        };
      }

      const newDice = s.ownedDice.map(d => d.id !== diceId ? d : upgradeCustomFaces(d));
      return {
        ownedDice: newDice,
        ...costUpdate,
      };
    });
    get().checkAchievements();
    return true;
  },

  // ソケット拡張（上級鍛冶）
  socketExpansions: {},
  expandSocket: (diceId, faceNumber) => {
    const s = get();
    const dice = diceId === 'protagonist' ? s.protagonistDice : s.ownedDice.find(d => d.id === diceId);
    if (!dice) return false;

    // カスタム面のみ
    const face = dice.customFaces.find(f => f.faceNumber === faceNumber);
    if (!face) return false;

    // 拡張上限チェック
    const existing = s.socketExpansions[diceId] || [];
    if (existing.length >= 3) return false; // 1ダイス最大3回
    if (existing.includes(faceNumber)) return false; // 同面は1回

    // コストチェック
    if (s.gold < 2000) return false;
    if (s.materials['rare-ore'] < 5) return false;
    if (s.materials['expansion-crystal'] < 2) return false;

    // ソケット追加 + コスト消費
    set((s) => {
      const addSocketToFace = (d: MonsterDice) => {
        const newCustom = d.customFaces.map(f => {
          if (f.faceNumber !== faceNumber) return f;
          return { ...f, sockets: [...f.sockets, { skillRuneId: null, socketTier: 'bronze' as const }] };
        });
        return { ...d, customFaces: newCustom };
      };

      const newExpansions = { ...s.socketExpansions, [diceId]: [...(s.socketExpansions[diceId] || []), faceNumber] };

      const costUpdate = {
        gold: s.gold - 2000,
        materials: {
          ...s.materials,
          'rare-ore': s.materials['rare-ore'] - 5,
          'expansion-crystal': s.materials['expansion-crystal'] - 2,
        },
        socketExpansions: newExpansions,
      };

      if (diceId === 'protagonist') {
        return { protagonistDice: addSocketToFace(s.protagonistDice), ...costUpdate };
      }
      return { ownedDice: s.ownedDice.map(d => d.id !== diceId ? d : addSocketToFace(d)), ...costUpdate };
    });
    return true;
  },

  // ヒーロー属性変更
  changeHeroElement: (element) => set((s) => ({
    protagonistDice: { ...s.protagonistDice, element },
  })),

  // 章進行
  advanceChapter: () => {
    set((s) => ({
      currentChapter: Math.min(7, s.currentChapter + 1),
      gold: s.gold + 500,
      gems: s.gems + 5,
      materials: {
        ...s.materials,
        'rare-ore': s.materials['rare-ore'] + 1,
      },
    }));
    get().checkAchievements();
  },

  // セーブ
  save: async () => {
    const s = get();
    await saveGame(getSaveableState(s));
  },

  // ロード
  load: async () => {
    const data = await loadGame();
    if (!data) return false;
    const d = data as ReturnType<typeof getSaveableState>;

    // マイグレーション: カスタム面のlockedルーンを復元
    const migrateDice = (dice: MonsterDice): MonsterDice => {
      if (dice.id === 'protagonist') return dice;
      // baseIdまたはidからテンプレートを探す
      const baseId = (dice as any).baseId || dice.id;
      const template = ALL_MONSTERS.find(m => m.id === baseId);
      if (!template) return dice;

      const newCustom = dice.customFaces.map((face, fi) => {
        const tmplFace = template.customFaces[fi];
        if (!tmplFace) return face;

        const newSockets = face.sockets.map((sock, si) => {
          const tmplSock = tmplFace.sockets[si];
          if (tmplSock && tmplSock.locked && !sock.locked) {
            // テンプレにlockedがあるのにセーブデータにない → 復元
            return { ...sock, skillRuneId: tmplSock.skillRuneId, locked: true };
          }
          return sock;
        });

        // テンプレのほうがソケット数が多い場合（通常ないが安全策）
        if (tmplFace.sockets.length > face.sockets.length) {
          for (let si = face.sockets.length; si < tmplFace.sockets.length; si++) {
            newSockets.push({ ...tmplFace.sockets[si] });
          }
        }

        return { ...face, sockets: newSockets };
      });
      return { ...dice, customFaces: newCustom };
    };

    const migratedOwnedDice = (d.ownedDice || []).map(migrateDice);
    const migratedProtagonist = d.protagonistDice || PROTAGONIST_DICE;

    // 旧セーブからの不足フィールドをデフォルト値で補完
    const level = (d as any).playerLevel || 1;
    const exp = (d as any).playerExp || 0;
    const frags = (d as any).gemFragments || 0;
    const expansions = (d as any).socketExpansions || {};
    const pvpPts = (d as any).pvpPoints || 0;
    const pvpW = (d as any).pvpWins || 0;
    const pvpL = (d as any).pvpLosses || 0;
    const eventCompletedToday = (d as any).eventCompletedToday || [];
    const eventLastDate = (d as any).eventLastDate || '';
    const endingShown = (d as any).endingShown || false;
    // HPがレベルに対して低すぎる場合（旧セーブ）→ レベル基準で再計算
    const expectedHp = 50 + (level - 1) * 50;
    const hp = d.playerMaxHp < expectedHp ? expectedHp : d.playerMaxHp;
    // materialsのexpansion-crystal補完
    const mats = d.materials || { 'forge-stone': 0, 'rare-ore': 0, 'expansion-crystal': 0 };
    if (!('expansion-crystal' in mats)) (mats as any)['expansion-crystal'] = 0;

    set({
      ...d,
      playerLevel: level,
      playerExp: exp,
      playerMaxHp: hp,
      gemFragments: frags,
      materials: mats,
      socketExpansions: expansions,
      pvpPoints: pvpPts,
      pvpWins: pvpW,
      pvpLosses: pvpL,
      eventCompletedToday,
      eventLastDate,
      endingShown,
      isEventBattle: false,
      eventRewardMult: {},
      bossesDefeated: (d as any).bossesDefeated || [],
      achievements: (d as any).achievements || [],
      protagonistDice: migratedProtagonist,
      ownedDice: migratedOwnedDice,
      currentScreen: 'town',
      battleState: null,
      currentEnemy: null,
    });
    return true;
  },

  initNewGame: () => {
    const starterDice = [
      applyDefaultSocketTiers({ ...CHAPTER1_MONSTERS.find(m => m.id === 'pyrachnid')!, id: 'pyrachnid_001', baseId: 'pyrachnid' }),
      applyDefaultSocketTiers({ ...CHAPTER1_MONSTERS.find(m => m.id === 'frost-jelly')!, id: 'frost-jelly_001', baseId: 'frost-jelly' }),
    ];
    const starterRunes = SKILL_RUNES
      .filter(r => r.tier === 'common')
      .flatMap(r => [{ ...r }, { ...r }]);

    // 主人公ダイスに初期ルーンをプリセット
    const protoDice = { ...PROTAGONIST_DICE };
    protoDice.customFaces = protoDice.customFaces.map(f => {
      if (f.faceNumber === 1) return { ...f, sockets: [{ skillRuneId: 'iron-bash', socketTier: 'gold' as const }] };
      if (f.faceNumber === 2) return { ...f, sockets: [
        { skillRuneId: 'blaze-strike', socketTier: 'gold' as const },
        { skillRuneId: 'ice-shard', socketTier: 'gold' as const },
      ]};
      if (f.faceNumber === 3) return { ...f, sockets: [
        { skillRuneId: 'spark', socketTier: 'gold' as const },
        { skillRuneId: 'poison-fang', socketTier: 'gold' as const },
        { skillRuneId: 'guard', socketTier: 'gold' as const },
      ]};
      return f;
    });

    set({
      protagonistDice: protoDice,
      ownedDice: starterDice,
      party: ['protagonist', 'pyrachnid_001', 'frost-jelly_001'],
      ownedRunes: starterRunes,
      playerLevel: 1,
      playerExp: 0,
      gold: 500,
      gems: 30,
      gemFragments: 0,
      materials: { 'forge-stone': 3, 'rare-ore': 0, 'expansion-crystal': 0 },
      currentChapter: 1,
      clearedDungeons: [],
      capturedMonsters: ['pyrachnid', 'frost-jelly', 'salamander-v2'],
      bossesDefeated: [],
      achievements: [],
      gachaPityDice: 0,
      gachaPityRune: 0,
      tutorial: { completed: true, currentStep: 0 },
      ownedMagicDice: [],
      equippedMagicDice: null,
      endingShown: false,
      eventCompletedToday: [],
      eventLastDate: '',
      isEventBattle: false,
      eventRewardMult: {},
      isPvpBattle: false,
      isHardMode: false,
      pvpPoints: 0,
      pvpWins: 0,
      pvpLosses: 0,
      battleChapter: 1,
      socketExpansions: {},
      currentScreen: 'town',
    });
    // 即座にセーブ
    setTimeout(() => get().save(), 100);
  },
}));
