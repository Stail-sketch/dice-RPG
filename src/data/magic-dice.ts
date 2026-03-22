export type MagicTiming =
  | 'this-before-selection' | 'this-during-execution' | 'this-after-damage'
  | 'this-on-lethal' | 'this-initiative' | 'this-extra'
  | 'next-before-roll' | 'next-after-roll' | 'next-replace-roll'
  | 'next-during-selection' | 'next-during-damage' | 'instant';

export type MagicCategory = 'dice_control' | 'attack' | 'defense' | 'sabotage' | 'gamble';
export type MagicTier = 'light' | 'mid' | 'heavy';

export interface MagicDiceData {
  id: string;
  name: string;
  nameEn: string;
  cost: number;
  tier: MagicTier;
  category: MagicCategory;
  timing: MagicTiming;
  effect: string;
  obtain: string;
}

export const ALL_MAGIC_DICE: MagicDiceData[] = [
  // === Dice Control (5) ===
  { id: 'reroll', name: '振り直し', nameEn: 'Re-Roll', cost: 20, tier: 'light', category: 'dice_control', timing: 'next-after-roll', effect: '次ターン、3個全て振り直せる', obtain: 'shop-500' },
  { id: 'lock', name: '固定', nameEn: 'Lock', cost: 22, tier: 'light', category: 'dice_control', timing: 'next-before-roll', effect: '次ターン、1個のダイスを現在の面で固定', obtain: 'ch2-drop' },
  { id: 'flip', name: '反転', nameEn: 'Flip', cost: 20, tier: 'light', category: 'dice_control', timing: 'next-after-roll', effect: '次ターン、全出目を反転(1⇔6,2⇔5,3⇔4)', obtain: 'shop-600' },
  { id: 'swap', name: '交換', nameEn: 'Swap', cost: 24, tier: 'light', category: 'dice_control', timing: 'this-before-selection', effect: 'このターン、ダイス2個の出目を入れ替え', obtain: 'ch3-drop' },
  { id: 'destiny', name: '運命', nameEn: 'Destiny', cost: 50, tier: 'heavy', category: 'dice_control', timing: 'next-replace-roll', effect: '次ターン、全ダイスが1の面確定', obtain: 'endgame' },

  // === Attack (5) ===
  { id: 'echo', name: '反響', nameEn: 'Echo', cost: 30, tier: 'mid', category: 'attack', timing: 'this-during-execution', effect: 'このターン、全スキルが2回発動', obtain: 'ch3-boss' },
  { id: 'unleash', name: '全面発動', nameEn: 'Unleash', cost: 45, tier: 'heavy', category: 'attack', timing: 'this-before-selection', effect: 'このターン3個全て発動(捨てなし)', obtain: 'ch5-boss' },
  { id: 'pierce', name: '貫通', nameEn: 'Pierce', cost: 25, tier: 'mid', category: 'attack', timing: 'this-during-execution', effect: 'このターン、全ダメージが敵防御を無視', obtain: 'shop-1200' },
  { id: 'crit-star', name: '会心星', nameEn: 'Crit Star', cost: 28, tier: 'mid', category: 'attack', timing: 'this-during-execution', effect: 'このターン、全スキル確定クリティカル(×2)', obtain: 'ch4-drop' },
  { id: 'haste', name: '疾風', nameEn: 'Haste', cost: 22, tier: 'light', category: 'attack', timing: 'this-initiative', effect: 'このターン、先攻確定', obtain: 'shop-800' },

  // === Defense (5) ===
  { id: 'drain', name: '吸収', nameEn: 'Drain', cost: 32, tier: 'mid', category: 'defense', timing: 'this-after-damage', effect: 'このターン、与ダメの40%をHP回復', obtain: 'shop-2000' },
  { id: 'barrier', name: '障壁', nameEn: 'Barrier', cost: 25, tier: 'mid', category: 'defense', timing: 'this-during-execution', effect: 'このターン、被ダメージ50%軽減', obtain: 'ch2-boss' },
  { id: 'restore', name: '癒し', nameEn: 'Restore', cost: 28, tier: 'mid', category: 'defense', timing: 'instant', effect: 'HP最大値の40%を即回復', obtain: 'shop-1500' },
  { id: 'reflect', name: '反射', nameEn: 'Reflect', cost: 35, tier: 'mid', category: 'defense', timing: 'this-during-execution', effect: 'このターン、被ダメの30%を敵に跳ね返す', obtain: 'ch5-drop' },
  { id: 'revive', name: '蘇生', nameEn: 'Revive', cost: 48, tier: 'heavy', category: 'defense', timing: 'this-on-lethal', effect: 'このターン、致命ダメージをHP1で耐える', obtain: 'ch6-drop' },

  // === Sabotage (5) ===
  { id: 'freeze-time', name: '時間停止', nameEn: 'Freeze Time', cost: 45, tier: 'heavy', category: 'sabotage', timing: 'this-during-execution', effect: '敵のこのターンの行動を完全スキップ', obtain: 'ch6-boss' },
  { id: 'insight', name: '透視', nameEn: 'Insight', cost: 20, tier: 'light', category: 'sabotage', timing: 'next-during-selection', effect: '次ターン、敵の2個選択が先に見える', obtain: 'ch2-drop' },
  { id: 'jinx', name: '呪縛', nameEn: 'Jinx', cost: 28, tier: 'mid', category: 'sabotage', timing: 'next-replace-roll', effect: '次ターン、敵全ダイスが6の面固定', obtain: 'ch4-boss' },
  { id: 'seal', name: '封印', nameEn: 'Seal', cost: 30, tier: 'mid', category: 'sabotage', timing: 'next-during-damage', effect: '次ターン、敵のシナジー全無効', obtain: 'ch4-drop' },
  { id: 'shift', name: '属性変換', nameEn: 'Shift', cost: 30, tier: 'mid', category: 'sabotage', timing: 'next-during-damage', effect: '次ターン、自分の全スキルが選んだ属性に変化', obtain: 'ch3-drop' },

  // === Gamble (5) ===
  { id: 'chaos', name: '混沌', nameEn: 'Chaos Roll', cost: 18, tier: 'light', category: 'gamble', timing: 'this-before-selection', effect: 'このターン、全面をランダムスキルに一時置換', obtain: 'shop-400' },
  { id: 'all-or-nothing', name: '一か八か', nameEn: 'All or Nothing', cost: 35, tier: 'mid', category: 'gamble', timing: 'this-after-damage', effect: '自分>敵なら×3、負けたら0ダメージ', obtain: 'ch5-drop' },
  { id: 'mirror', name: '模倣', nameEn: 'Mirror', cost: 32, tier: 'mid', category: 'gamble', timing: 'this-before-selection', effect: 'このターン、敵の出目を自分にコピー', obtain: 'ch6-drop' },
  { id: 'sacrifice', name: '犠牲', nameEn: 'Sacrifice', cost: 22, tier: 'light', category: 'gamble', timing: 'instant', effect: 'HP25%失う。次ターン全ダメージ×2', obtain: 'shop-1000' },
  { id: 'jackpot', name: '大当たり', nameEn: 'Jackpot', cost: 40, tier: 'heavy', category: 'gamble', timing: 'this-extra', effect: '7番目ダイスを振る。1-3:空振り 4-5:HP全回復 6:敵即死', obtain: 'endgame' },
];

export function getMagicDice(id: string): MagicDiceData | undefined {
  return ALL_MAGIC_DICE.find(m => m.id === id);
}
