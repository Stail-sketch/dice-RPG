import { create } from 'zustand';
import type { MonsterDice, SkillRune, BattleState, SocketTier } from '../types';
import { MAX_SAME_MONSTER } from '../types';
import type { DecomposeResult, PartyBonus } from '../types';
import { CHAPTER1_MONSTERS, PROTAGONIST_DICE } from '../data/monsters';
import { SKILL_RUNES } from '../data/skill-runes';
import { saveGame, loadGame } from './saveSystem';
import { applyDefaultSocketTiers } from '../utils/applyDefaultTiers';

export type Screen = 'title' | 'town' | 'dungeon' | 'battle' | 'dice-editor' | 'forge' | 'shop' | 'gacha' | 'codex' | 'pvp' | 'capture' | 'tutorial';

interface TutorialState {
  completed: boolean;
  currentStep: number; // 0=not started, 1-4=steps
}

interface Materials {
  'forge-stone': number;
  'rare-ore': number;
}

interface GameState {
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;

  playerName: string;
  playerMaxHp: number;
  gold: number;
  gems: number;
  materials: Materials;

  protagonistDice: MonsterDice;
  ownedDice: MonsterDice[];
  party: [string, string, string];
  ownedRunes: SkillRune[];

  decomposeDice: (diceInstanceId: string) => DecomposeResult | null;
  getPartyBonus: () => PartyBonus;

  currentChapter: number;
  clearedDungeons: string[]; // クリア済みダンジョンID
  capturedMonsters: string[];

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

  // 鍛冶
  upgradeSocket: (diceId: string, faceNumber: number, socketIndex: number) => boolean;

  // 章進行
  advanceChapter: () => void;

  // セーブ/ロード
  save: () => Promise<void>;
  load: () => Promise<boolean>;
  initNewGame: () => void;
}

const UPGRADE_COST: Record<SocketTier, { next: SocketTier; stones: number; gold: number; ore: number }> = {
  bronze: { next: 'silver', stones: 3, gold: 200, ore: 0 },
  silver: { next: 'gold', stones: 5, gold: 500, ore: 2 },
  gold: { next: 'gold', stones: 0, gold: 0, ore: 0 }, // can't upgrade further
};

function getSaveableState(s: GameState) {
  return {
    playerName: s.playerName,
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
    gachaPityDice: s.gachaPityDice,
    gachaPityRune: s.gachaPityRune,
    tutorial: s.tutorial,
    ownedMagicDice: s.ownedMagicDice,
    equippedMagicDice: s.equippedMagicDice,
  };
}

export const useGameStore = create<GameState>((set, get) => ({
  currentScreen: 'title',
  setScreen: (screen) => set({ currentScreen: screen }),

  playerName: 'ダイスマスター',
  playerMaxHp: 50,
  gold: 500,
  gems: 10,
  materials: { 'forge-stone': 0, 'rare-ore': 0 },

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
    materials: { 'forge-stone': s.materials['forge-stone'] + 3, 'rare-ore': s.materials['rare-ore'] },
    currentScreen: 'town' as Screen,
  })),

  startTutorial: () => {
    set({
      protagonistDice: { ...PROTAGONIST_DICE },
      ownedDice: [],
      party: ['protagonist', '', ''],
      ownedRunes: [],
      gold: 0,
      gems: 0,
      materials: { 'forge-stone': 0, 'rare-ore': 0 },
      currentChapter: 1,
      clearedDungeons: [],
      capturedMonsters: [],
      gachaPityDice: 0,
      gachaPityRune: 0,
      tutorial: { completed: false, currentStep: 1 },
      currentScreen: 'tutorial' as Screen,
    });
  },

  currentChapter: 1,
  clearedDungeons: [],
  capturedMonsters: [],

  gachaPityDice: 0,
  gachaPityRune: 0,
  setGachaPityDice: (n) => set({ gachaPityDice: n }),
  setGachaPityRune: (n) => set({ gachaPityRune: n }),

  ownedMagicDice: [],
  equippedMagicDice: null,
  addMagicDice: (id) => set((s) => ({
    ownedMagicDice: s.ownedMagicDice.includes(id) ? s.ownedMagicDice : [...s.ownedMagicDice, id],
  })),
  equipMagicDice: (id) => set({ equippedMagicDice: id }),

  battleState: null,
  setBattleState: (state) => set({ battleState: state }),
  currentEnemy: null,

  addDice: (dice) => {
    const s = get();
    // Count existing instances of this base monster
    const baseId = dice.id;
    const existing = s.ownedDice.filter(d => (d.baseId || d.id) === baseId);
    if (existing.length >= MAX_SAME_MONSTER) return; // can't add more

    const instanceId = `${baseId}_${String(existing.length + 1).padStart(3, '0')}`;
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

  addGold: (amount) => set((s) => ({ gold: Math.max(0, s.gold + amount) })),
  addGems: (amount) => set((s) => ({ gems: Math.max(0, s.gems + amount) })),
  addMaterial: (id, amount) => set((s) => ({
    materials: { ...s.materials, [id]: Math.max(0, (s.materials[id] || 0) + amount) },
  })),

  setCurrentEnemy: (enemy) => set({ currentEnemy: enemy }),
  captureMonster: (monsterId) => set((s) => ({
    capturedMonsters: s.capturedMonsters.includes(monsterId) ? s.capturedMonsters : [...s.capturedMonsters, monsterId],
  })),
  clearDungeon: (dungeonId) => set((s) => ({
    clearedDungeons: s.clearedDungeons.includes(dungeonId) ? s.clearedDungeons : [...s.clearedDungeons, dungeonId],
  })),

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
    return true;
  },

  // 章進行
  advanceChapter: () => set((s) => ({
    currentChapter: Math.min(3, s.currentChapter + 1),
  })),

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
    set({
      ...d,
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
      applyDefaultSocketTiers({ ...CHAPTER1_MONSTERS.find(m => m.id === 'salamander-v2')!, id: 'salamander-v2_001', baseId: 'salamander-v2' }),
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
      gold: 500,
      gems: 30,
      materials: { 'forge-stone': 3, 'rare-ore': 0 },
      currentChapter: 1,
      clearedDungeons: [],
      capturedMonsters: ['pyrachnid', 'frost-jelly', 'salamander-v2'],
      gachaPityDice: 0,
      gachaPityRune: 0,
      tutorial: { completed: true, currentStep: 0 },
      ownedMagicDice: [],
      equippedMagicDice: null,
      currentScreen: 'town',
    });
  },
}));
