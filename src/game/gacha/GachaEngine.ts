import type { MonsterDice, SkillRune } from '../../types';
import { CHAPTER1_MONSTERS } from '../../data/monsters';
import { SKILL_RUNES } from '../../data/skill-runes';

// ガチャコスト
export const DICE_GACHA_COST = 5;
export const DICE_GACHA_10_COST = 45;
export const RUNE_GACHA_COST = 3;
export const RUNE_GACHA_10_COST = 27;

// レアリティ排出率
const RARITY_RATES: { rarity: 1 | 2 | 3 | 4 | 5; rate: number }[] = [
  { rarity: 1, rate: 0.40 },
  { rarity: 2, rate: 0.30 },
  { rarity: 3, rate: 0.20 },
  { rarity: 4, rate: 0.08 },
  { rarity: 5, rate: 0.02 },
];

// ルーンティア排出率
const RUNE_TIER_RATES: { tier: 'common' | 'rare' | 'epic'; rate: number }[] = [
  { tier: 'common', rate: 0.50 },
  { tier: 'rare', rate: 0.35 },
  { tier: 'epic', rate: 0.15 },
];

function pickRarity(pityCount: number): 1 | 2 | 3 | 4 | 5 {
  // 天井: 100回で★5確定
  if (pityCount >= 99) return 5;
  // 天井: 50回で★4以上確定
  if (pityCount >= 49) {
    const roll = Math.random();
    // ★5=20%, ★4=80% (50回天井時)
    return roll < 0.20 ? 5 : 4;
  }

  const roll = Math.random();
  let cumulative = 0;
  for (const { rarity, rate } of RARITY_RATES) {
    cumulative += rate;
    if (roll < cumulative) return rarity;
  }
  return 1;
}

function pickMonsterByRarity(rarity: 1 | 2 | 3 | 4 | 5): MonsterDice {
  const pool = CHAPTER1_MONSTERS.filter(m => m.rarity === rarity);
  // ★5はプールにないので★4のボスを返す（最高レア扱い）
  if (pool.length === 0) {
    // ★5の場合は洞窟竜（★4ボス）を特別扱いで返す
    const boss = CHAPTER1_MONSTERS.find(m => m.rarity === 4);
    if (boss) return { ...boss };
    return { ...CHAPTER1_MONSTERS[0] };
  }
  const picked = pool[Math.floor(Math.random() * pool.length)];
  return { ...picked };
}

export interface DiceGachaResult {
  monster: MonsterDice;
  newPity: number;
}

export function rollDiceGacha(pityCount: number): DiceGachaResult {
  const rarity = pickRarity(pityCount);
  const monster = pickMonsterByRarity(rarity);

  // ★4以上でpityリセット
  const newPity = rarity >= 4 ? 0 : pityCount + 1;

  return { monster, newPity };
}

function pickRuneTier(): 'common' | 'rare' | 'epic' {
  const roll = Math.random();
  let cumulative = 0;
  for (const { tier, rate } of RUNE_TIER_RATES) {
    cumulative += rate;
    if (roll < cumulative) return tier;
  }
  return 'common';
}

export function rollRuneGacha(): SkillRune {
  const tier = pickRuneTier();
  const pool = SKILL_RUNES.filter(r => r.tier === tier);
  if (pool.length === 0) {
    return { ...SKILL_RUNES[0] };
  }
  const picked = pool[Math.floor(Math.random() * pool.length)];
  return { ...picked };
}

// レアリティに対応する表示名
export const RARITY_LABELS: Record<number, string> = {
  1: '★',
  2: '★★',
  3: '★★★',
  4: '★★★★',
  5: '★★★★★',
};

export const RUNE_TIER_LABELS: Record<string, string> = {
  common: 'コモン',
  rare: 'レア',
  epic: 'エピック',
  legendary: 'レジェンダリー',
};

export const RUNE_TIER_COLORS: Record<string, string> = {
  common: '#6a5a4a',
  rare: '#4070a0',
  epic: '#7050a0',
  legendary: '#b08020',
};
