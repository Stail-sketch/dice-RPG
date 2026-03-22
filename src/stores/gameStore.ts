import { create } from 'zustand';
import type { MonsterDice, SkillRune, BattleState, SocketTier } from '../types';
import { CHAPTER1_MONSTERS } from '../data/monsters';
import { SKILL_RUNES } from '../data/skill-runes';
import { saveGame, loadGame } from './saveSystem';

export type Screen = 'title' | 'town' | 'dungeon' | 'battle' | 'dice-editor' | 'forge' | 'shop' | 'gacha' | 'codex' | 'pvp' | 'capture';

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

  ownedDice: MonsterDice[];
  party: [string, string, string];
  ownedRunes: SkillRune[];

  currentChapter: number;
  clearedDungeons: string[]; // クリア済みダンジョンID
  capturedMonsters: string[];

  // ガチャ天井
  gachaPityDice: number;
  gachaPityRune: number;
  setGachaPityDice: (n: number) => void;
  setGachaPityRune: (n: number) => void;

  battleState: BattleState | null;
  setBattleState: (state: BattleState | null) => void;
  currentEnemy: MonsterDice[] | null;

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
    ownedDice: s.ownedDice,
    party: s.party,
    ownedRunes: s.ownedRunes,
    currentChapter: s.currentChapter,
    clearedDungeons: s.clearedDungeons,
    capturedMonsters: s.capturedMonsters,
    gachaPityDice: s.gachaPityDice,
    gachaPityRune: s.gachaPityRune,
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

  ownedDice: [],
  party: ['', '', ''],
  ownedRunes: [],

  currentChapter: 1,
  clearedDungeons: [],
  capturedMonsters: [],

  gachaPityDice: 0,
  gachaPityRune: 0,
  setGachaPityDice: (n) => set({ gachaPityDice: n }),
  setGachaPityRune: (n) => set({ gachaPityRune: n }),

  battleState: null,
  setBattleState: (state) => set({ battleState: state }),
  currentEnemy: null,

  addDice: (dice) => set((s) => ({ ownedDice: [...s.ownedDice, dice] })),
  setParty: (party) => set({ party }),

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
    const dice = s.ownedDice.map(d => {
      if (d.id !== diceId) return d;
      const newCustom = d.customFaces.map(f => {
        if (f.faceNumber !== faceNumber) return f;
        const newSockets = f.sockets.map((sock, si) =>
          si !== socketIndex ? sock : { ...sock, skillRuneId: runeId }
        );
        return { ...f, sockets: newSockets };
      });
      return { ...d, customFaces: newCustom };
    });
    return { ownedDice: dice };
  }),

  unequipRune: (diceId, faceNumber, socketIndex) => set((s) => {
    const targetDice = s.ownedDice.find(d => d.id === diceId);
    if (!targetDice) return {};
    const face = targetDice.customFaces.find(f => f.faceNumber === faceNumber);
    if (!face) return {};
    const oldRuneId = face.sockets[socketIndex]?.skillRuneId;

    const dice = s.ownedDice.map(d => {
      if (d.id !== diceId) return d;
      const newCustom = d.customFaces.map(f => {
        if (f.faceNumber !== faceNumber) return f;
        const newSockets = f.sockets.map((sock, si) =>
          si !== socketIndex ? sock : { ...sock, skillRuneId: null }
        );
        return { ...f, sockets: newSockets };
      });
      return { ...d, customFaces: newCustom };
    });

    let newRunes = s.ownedRunes;
    if (oldRuneId) {
      const rune = SKILL_RUNES.find(r => r.id === oldRuneId);
      if (rune) newRunes = [...s.ownedRunes, { ...rune }];
    }
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
    const dice = s.ownedDice.find(d => d.id === diceId);
    if (!dice) return false;
    const face = dice.customFaces.find(f => f.faceNumber === faceNumber);
    if (!face) return false;
    const socket = face.sockets[socketIndex];
    if (!socket || socket.socketTier === 'gold') return false;

    const cost = UPGRADE_COST[socket.socketTier];
    if (s.gold < cost.gold) return false;
    if (s.materials['forge-stone'] < cost.stones) return false;
    if (s.materials['rare-ore'] < cost.ore) return false;

    // コスト消費 + ソケット強化
    set((s) => {
      const newDice = s.ownedDice.map(d => {
        if (d.id !== diceId) return d;
        const newCustom = d.customFaces.map(f => {
          if (f.faceNumber !== faceNumber) return f;
          const newSockets = f.sockets.map((sock, si) =>
            si !== socketIndex ? sock : { ...sock, socketTier: cost.next }
          );
          return { ...f, sockets: newSockets };
        });
        return { ...d, customFaces: newCustom };
      });
      return {
        ownedDice: newDice,
        gold: s.gold - cost.gold,
        materials: {
          ...s.materials,
          'forge-stone': s.materials['forge-stone'] - cost.stones,
          'rare-ore': s.materials['rare-ore'] - cost.ore,
        },
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
      { ...CHAPTER1_MONSTERS.find(m => m.id === 'slime')! },
      { ...CHAPTER1_MONSTERS.find(m => m.id === 'bat')! },
      { ...CHAPTER1_MONSTERS.find(m => m.id === 'salamander')! },
    ];
    const starterRunes = SKILL_RUNES
      .filter(r => r.tier === 'common')
      .flatMap(r => [{ ...r }, { ...r }]);

    set({
      ownedDice: starterDice,
      party: [starterDice[0].id, starterDice[1].id, starterDice[2].id],
      ownedRunes: starterRunes,
      gold: 500,
      gems: 30,
      materials: { 'forge-stone': 3, 'rare-ore': 0 },
      currentChapter: 1,
      clearedDungeons: [],
      capturedMonsters: ['slime', 'bat', 'salamander'],
      gachaPityDice: 0,
      gachaPityRune: 0,
      currentScreen: 'town',
    });
  },
}));
