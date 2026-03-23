// ==============================
// 属性システム
// ==============================
export type Element = 'blaze' | 'frost' | 'volt' | 'venom' | 'alloy' | 'mirage';

export const ELEMENT_NAMES: Record<Element, string> = {
  blaze: '炎',
  frost: '氷',
  volt: '雷',
  venom: '毒',
  alloy: '鋼',
  mirage: '幻',
};

// 属性相性 ◎=1.5, ✕=0.5, ==1.0
export const ELEMENT_CHART: Record<Element, Record<Element, number>> = {
  blaze:  { blaze: 1.0, frost: 1.5, volt: 0.5, venom: 0.5, alloy: 1.5, mirage: 1.0 },
  frost:  { blaze: 0.5, frost: 1.0, volt: 1.5, venom: 1.5, alloy: 1.0, mirage: 0.5 },
  volt:   { blaze: 1.5, frost: 0.5, volt: 1.0, venom: 1.0, alloy: 0.5, mirage: 1.5 },
  venom:  { blaze: 1.5, frost: 0.5, volt: 1.0, venom: 1.0, alloy: 0.5, mirage: 1.5 },
  alloy:  { blaze: 0.5, frost: 1.0, volt: 1.5, venom: 1.5, alloy: 1.0, mirage: 0.5 },
  mirage: { blaze: 1.0, frost: 1.5, volt: 0.5, venom: 0.5, alloy: 1.5, mirage: 1.0 },
};

// ==============================
// ダイス確率テーブル（低面ほど出やすい）
// ==============================
export const DICE_PROBABILITY: Record<number, number> = {
  1: 0.23,  // 最も出やすい
  2: 0.20,
  3: 0.18,
  4: 0.16,
  5: 0.13,
  6: 0.10,  // 最も出にくい（レア）
};

// ==============================
// 面番号ごとのデフォルトソケット品質
// ==============================
export const FACE_DEFAULT_SOCKET_TIER: Record<number, SocketTier> = {
  1: 'gold',
  2: 'gold',
  3: 'silver',
  4: 'silver',
  5: 'bronze',
  6: 'bronze',
};

// ソケット品質ごとの威力倍率
export const SOCKET_TIER_MULTIPLIER: Record<SocketTier, number> = {
  gold: 1.5,
  silver: 1.0,
  bronze: 0.6,
};

// 同面スキル威力減衰率（1pipあたり10%減衰）
export const PIP_DECAY_RATE = 0.10;

// ==============================
// スキル関連
// ==============================
export type SkillTier = 'common' | 'rare' | 'epic' | 'legendary';
export type SocketTier = 'bronze' | 'silver' | 'gold';

export type SkillEffectType =
  | 'damage'        // 直接ダメージ
  | 'heal'          // 回復
  | 'dot'           // 継続ダメージ (毒/燃焼)
  | 'buff'          // バフ
  | 'debuff'        // デバフ
  | 'shield';       // シールド

export interface SkillEffect {
  type: SkillEffectType;
  power: number;          // 威力/効果量
  duration?: number;      // 継続ターン数 (dot/buff/debuff)
  description: string;
}

export interface SkillRune {
  id: string;
  name: string;
  element: Element;
  tier: SkillTier;
  effect: SkillEffect;
  description: string;
}

// ==============================
// ダイスの面 (Face)
// ==============================
export interface FixedSocket {
  skillId: string;
  element: Element;
}

export interface FixedFace {
  faceNumber: number;       // 1-6
  sockets: FixedSocket[];   // 固有スキル (変更不可)
}

export interface CustomSocket {
  skillRuneId: string | null;
  socketTier: SocketTier;
  locked?: boolean; // trueならルーン変更不可（モンスター固有プリセット）
}

export interface CustomFace {
  faceNumber: number;       // 1-6
  sockets: CustomSocket[];
}

export type DiceFace = FixedFace | CustomFace;

export function isFixedFace(face: DiceFace): face is FixedFace {
  return 'sockets' in face && face.sockets.length > 0 && 'skillId' in face.sockets[0];
}

// ==============================
// モンスターダイス
// ==============================
export interface MonsterDice {
  id: string;
  name: string;
  element: Element;
  rarity: 0 | 1 | 2 | 3 | 4 | 5;
  baseId?: string; // base monster ID (for individual instances)
  fixedFaces: FixedFace[];
  customFaces: CustomFace[];
  baseStats: {
    captureRate: number;   // 捕獲率 (%)
  };
  description: string;
}

// 全6面を取得するヘルパー
export function getAllFaces(dice: MonsterDice): DiceFace[] {
  const faces: DiceFace[] = [];
  const faceMap = new Map<number, DiceFace>();
  for (const f of dice.fixedFaces) faceMap.set(f.faceNumber, f);
  for (const f of dice.customFaces) faceMap.set(f.faceNumber, f);
  for (let i = 1; i <= 6; i++) {
    const face = faceMap.get(i);
    if (face) faces.push(face);
  }
  return faces;
}

// ==============================
// バトルステート
// ==============================
export interface StatusEffect {
  type: 'burn' | 'poison' | 'freeze' | 'slow' | 'atkUp' | 'defUp' | 'atkDown' | 'defDown' | 'shield' | 'confusion';
  power: number;
  remainingTurns: number;
  element: Element;
}

export interface ChargeGauge {
  current: number;
  // no more max/bonusActive - magic dice cost determines when you can use
}

export interface TurnSelection {
  activateIndices: [number, number];
  chargeIndex: number;
}

export interface Combatant {
  hp: number;
  maxHp: number;
  dice: MonsterDice[];
  statusEffects: StatusEffect[];
  damageMultiplier: number;
  defenseMultiplier: number;
  charge: ChargeGauge;
}

export interface DiceRollResult {
  diceIndex: number;
  faceNumber: number;
  face: DiceFace;
}

export interface TurnResult {
  turn: number;
  playerRolls: DiceRollResult[];
  enemyRolls: DiceRollResult[];
  playerSelection: TurnSelection;
  enemySelection: TurnSelection;
  playerFirst: boolean;
  firstActions: SkillAction[];
  secondActions: SkillAction[];
  prePlayerHp: number;
  preEnemyHp: number;
  midPlayerHp: number;
  midEnemyHp: number;
  playerHp: number;
  enemyHp: number;
  playerCharge: ChargeGauge;
  enemyCharge: ChargeGauge;
  synergies: SynergyActivation[];
  magicUsed?: string; // magic dice ID used this turn, if any
  playerStatusDmg: number; // DoT damage dealt to player this turn
  enemyStatusDmg: number;  // DoT damage dealt to enemy this turn
  playerEffects: StatusEffect[]; // player's active effects after this turn
  enemyEffects: StatusEffect[];  // enemy's active effects after this turn
  playerDmgMult: number; // player's damage multiplier after this turn
  enemyDmgMult: number;  // enemy's damage multiplier after this turn
}

export interface SkillAction {
  skillId: string;
  skillName: string;
  element: Element;
  effectType: SkillEffectType;
  rawDamage: number;         // スキル素の威力
  tierMultiplier: number;    // ソケットTier倍率
  decayMultiplier: number;   // 同面減衰倍率
  elementMultiplier: number; // 属性相性倍率
  synergyMultiplier: number; // 同面シナジー倍率
  finalDamage: number;       // raw × tier × decay × element × synergy
  crossDiceMultiplier: number; // クロスダイス倍率（applyActions後に設定）
  buffMultiplier: number;    // バフ/デバフ倍率（applyActions後に設定）
  actualDamage: number;      // 最終的に与えた/受けたダメージ（applyActions後に設定）
  targetIsPlayer: boolean;
}

export interface SynergyActivation {
  type: 'same-face' | 'cross-dice' | 'recipe';
  name: string;
  description: string;
}

export interface BattleState {
  player: Combatant;
  enemy: Combatant;
  turn: number;
  maxTurns: number;
  log: TurnResult[];
  status: 'ongoing' | 'player-win' | 'enemy-win' | 'draw';
}

export const MAX_SAME_MONSTER = 3;

export interface PartyBonus {
  goldMultiplier: number;
  captureBonus: number;
}

export interface DecomposeResult {
  forgeStones: number;
  rareOre: number;
  gold: number;
}

// ==============================
// シナジー
// ==============================
export interface RecipeSynergy {
  id: string;
  name: string;
  requiredElements: Element[];
  effect: SkillEffect;
  description: string;
}

export interface CrossDiceSynergy {
  element: Element;
  name: string;
  effect: SkillEffect;
  description: string;
}

// ==============================
// セーブデータ
// ==============================
export interface SaveData {
  player: {
    name: string;
    maxHp: number;
    gold: number;
    gems: number;
    points: number;
  };
  monsterDice: {
    owned: MonsterDice[];
    party: [string, string, string];
  };
  skillRunes: {
    owned: SkillRune[];
  };
  progress: {
    currentChapter: number;
    capturedMonsters: string[];
  };
  gacha: {
    pityCountDice: number;
    pityCountRune: number;
  };
  pvp: {
    totalWins: number;
    currentStreak: number;
    bestStreak: number;
    points: number;
  };
}
