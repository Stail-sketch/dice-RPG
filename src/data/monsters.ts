import type { MonsterDice } from '../types';

// 第1章モンスター8体 + ボス
export const CHAPTER1_MONSTERS: MonsterDice[] = [
  // ★1 スライム (氷)
  {
    id: 'slime', name: 'スライム', element: 'frost', rarity: 1,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'slime-shot', element: 'frost' }] },
    ],
    customFaces: [
      { faceNumber: 2, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 3, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 4, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 80 },
    description: 'どこにでもいる粘液生物。カスタム自由度MAX。',
  },

  // ★1 コウモリ (幻)
  {
    id: 'bat', name: 'コウモリ', element: 'mirage', rarity: 1,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'vampirism', element: 'mirage' }] },
    ],
    customFaces: [
      { faceNumber: 2, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 3, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 4, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 80 },
    description: '闇に潜む吸血コウモリ。幻属性の入門ダイス。',
  },

  // ★2 ゴブリン (鋼)
  {
    id: 'goblin', name: 'ゴブリン', element: 'alloy', rarity: 2,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'shield-bash', element: 'alloy' }] },
      { faceNumber: 2, sockets: [{ skillId: 'defend', element: 'alloy' }, { skillId: 'taunt', element: 'alloy' }] },
    ],
    customFaces: [
      { faceNumber: 3, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 4, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 50 },
    description: '盾を持つ小鬼。防御に長けた鋼属性。',
  },

  // ★2 サラマンダー (炎)
  {
    id: 'salamander', name: 'サラマンダー', element: 'blaze', rarity: 2,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'flame', element: 'blaze' }] },
      { faceNumber: 2, sockets: [{ skillId: 'combustion', element: 'blaze' }, { skillId: 'scorch', element: 'blaze' }] },
    ],
    customFaces: [
      { faceNumber: 3, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 4, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 50 },
    description: '炎を纏うトカゲ。攻撃的な炎属性。',
  },

  // ★2 スケルトン (毒)
  {
    id: 'skeleton', name: 'スケルトン', element: 'venom', rarity: 2,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'bone-throw', element: 'venom' }] },
      { faceNumber: 2, sockets: [{ skillId: 'miasma', element: 'venom' }, { skillId: 'curse', element: 'venom' }] },
    ],
    customFaces: [
      { faceNumber: 3, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 4, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 50 },
    description: '不死の骨戦士。毒と呪いで削る。',
  },

  // ★3 ハーピー (雷)
  {
    id: 'harpy', name: 'ハーピー', element: 'volt', rarity: 3,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'wind-blade', element: 'volt' }] },
      { faceNumber: 2, sockets: [{ skillId: 'lightning', element: 'volt' }, { skillId: 'rapid-strike', element: 'volt' }] },
      { faceNumber: 3, sockets: [{ skillId: 'storm', element: 'volt' }, { skillId: 'haste', element: 'volt' }, { skillId: 'flight', element: 'volt' }] },
    ],
    customFaces: [
      { faceNumber: 4, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'silver' }, { skillRuneId: null, socketTier: 'silver' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 25 },
    description: '空を舞う雷鳥人。連撃と速度が武器。',
  },

  // ★3 ミミック (幻)
  {
    id: 'mimic-monster', name: 'ミミック', element: 'mirage', rarity: 3,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'mimic', element: 'mirage' }] },
      { faceNumber: 2, sockets: [{ skillId: 'steal', element: 'mirage' }, { skillId: 'transform', element: 'mirage' }] },
      { faceNumber: 3, sockets: [{ skillId: 'copy', element: 'mirage' }, { skillId: 'split', element: 'mirage' }, { skillId: 'trap', element: 'mirage' }] },
    ],
    customFaces: [
      { faceNumber: 4, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'silver' }, { skillRuneId: null, socketTier: 'silver' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 25 },
    description: '宝箱に擬態する魔物。トリックが得意。',
  },

  // ★4 洞窟竜 (炎) - 第1章ボス
  {
    id: 'cave-dragon', name: '洞窟竜', element: 'blaze', rarity: 4,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'dragon-breath', element: 'blaze' }] },
      { faceNumber: 2, sockets: [{ skillId: 'flame-claw', element: 'blaze' }, { skillId: 'combustion', element: 'blaze' }] },
      { faceNumber: 3, sockets: [{ skillId: 'eruption', element: 'blaze' }, { skillId: 'heat-wave', element: 'blaze' }, { skillId: 'scorch', element: 'blaze' }] },
      { faceNumber: 4, sockets: [{ skillId: 'magma-shield', element: 'blaze' }, { skillId: 'dragon-roar', element: 'blaze' }, { skillId: 'flame', element: 'blaze' }, { skillId: 'inferno-fixed', element: 'blaze' }] },
    ],
    customFaces: [
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'silver' }, { skillRuneId: null, socketTier: 'silver' }, { skillRuneId: null, socketTier: 'silver' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'gold' }, { skillRuneId: null, socketTier: 'silver' }, { skillRuneId: null, socketTier: 'silver' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 10 },
    description: '洞窟の奥に棲む炎竜。第1章のボス。',
  },
];

// ==============================
// 第2章: 氷結の峡谷 (frost focus)
// ==============================
export const CHAPTER2_MONSTERS: MonsterDice[] = [
  // ★1 フロストウルフ (frost)
  {
    id: 'frost-wolf', name: 'フロストウルフ', element: 'frost', rarity: 1,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'ice-fang', element: 'frost' }] },
    ],
    customFaces: [
      { faceNumber: 2, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 3, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 4, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 80 },
    description: '峡谷を駆ける氷の狼。素早い氷牙が武器。',
  },

  // ★1 ペンギン (frost)
  {
    id: 'penguin', name: 'ペンギン', element: 'frost', rarity: 1,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'slide', element: 'frost' }] },
    ],
    customFaces: [
      { faceNumber: 2, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 3, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 4, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 80 },
    description: '氷上を滑走する愛らしいペンギン。意外と攻撃的。',
  },

  // ★2 アイスゴーレム (alloy)
  {
    id: 'ice-golem', name: 'アイスゴーレム', element: 'alloy', rarity: 2,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'frost-punch', element: 'alloy' }] },
      { faceNumber: 2, sockets: [{ skillId: 'ice-wall', element: 'alloy' }, { skillId: 'frost-armor', element: 'alloy' }] },
    ],
    customFaces: [
      { faceNumber: 3, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 4, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 50 },
    description: '氷と鋼で出来た巨人。防御力が極めて高い。',
  },

  // ★2 ユキオンナ (frost)
  {
    id: 'yuki-onna', name: 'ユキオンナ', element: 'frost', rarity: 2,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'cold-breath', element: 'frost' }] },
      { faceNumber: 2, sockets: [{ skillId: 'snow-bind', element: 'frost' }, { skillId: 'frost-kiss', element: 'frost' }] },
    ],
    customFaces: [
      { faceNumber: 3, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 4, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 50 },
    description: '雪の中に佇む氷の女。凍結デバフが得意。',
  },

  // ★3 ブリザードドレイク (frost)
  {
    id: 'blizzard-drake', name: 'ブリザードドレイク', element: 'frost', rarity: 3,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'frost-breath', element: 'frost' }] },
      { faceNumber: 2, sockets: [{ skillId: 'ice-claw', element: 'frost' }, { skillId: 'hail-storm', element: 'frost' }] },
      { faceNumber: 3, sockets: [{ skillId: 'glacial-roar', element: 'frost' }, { skillId: 'permafrost', element: 'frost' }, { skillId: 'frost-wing', element: 'frost' }] },
    ],
    customFaces: [
      { faceNumber: 4, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'silver' }, { skillRuneId: null, socketTier: 'silver' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 25 },
    description: '吹雪を纏うドレイク。広範囲の氷攻撃が得意。',
  },

  // ★4 氷龍 (frost) - 第2章ボス
  {
    id: 'ice-dragon', name: '氷龍', element: 'frost', rarity: 4,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'absolute-zero-breath', element: 'frost' }] },
      { faceNumber: 2, sockets: [{ skillId: 'ice-fang-dragon', element: 'frost' }, { skillId: 'hail-storm', element: 'frost' }] },
      { faceNumber: 3, sockets: [{ skillId: 'diamond-dust', element: 'frost' }, { skillId: 'glacial-roar', element: 'frost' }, { skillId: 'permafrost', element: 'frost' }] },
      { faceNumber: 4, sockets: [{ skillId: 'frost-domain', element: 'frost' }, { skillId: 'ice-dragon-roar', element: 'frost' }, { skillId: 'cold-breath', element: 'frost' }, { skillId: 'cocytus', element: 'frost' }] },
    ],
    customFaces: [
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'silver' }, { skillRuneId: null, socketTier: 'silver' }, { skillRuneId: null, socketTier: 'silver' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'gold' }, { skillRuneId: null, socketTier: 'silver' }, { skillRuneId: null, socketTier: 'silver' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 10 },
    description: '峡谷を支配する氷の古龍。第2章のボス。',
  },
];

// ==============================
// 第3章: 雷鳴の塔 (volt focus)
// ==============================
export const CHAPTER3_MONSTERS: MonsterDice[] = [
  // ★1 スパーク (volt)
  {
    id: 'spark-elemental', name: 'スパーク', element: 'volt', rarity: 1,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'static-shock', element: 'volt' }] },
    ],
    customFaces: [
      { faceNumber: 2, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 3, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 4, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 80 },
    description: '雷の塔を漂う電気の精霊。小さいが素早い。',
  },

  // ★1 デンキネズミ (volt)
  {
    id: 'electric-mouse', name: 'デンキネズミ', element: 'volt', rarity: 1,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'thunder-tail', element: 'volt' }] },
    ],
    customFaces: [
      { faceNumber: 2, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 3, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 4, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 80 },
    description: '帯電する小さなネズミ。頬の電気袋から放電する。',
  },

  // ★2 サンダーバード (volt)
  {
    id: 'thunderbird', name: 'サンダーバード', element: 'volt', rarity: 2,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'thunder-wing', element: 'volt' }] },
      { faceNumber: 2, sockets: [{ skillId: 'volt-dive', element: 'volt' }, { skillId: 'spark-feather', element: 'volt' }] },
    ],
    customFaces: [
      { faceNumber: 3, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 4, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 50 },
    description: '雷雲を呼ぶ大鳥。翼から電撃を放つ。',
  },

  // ★2 ライトニングエレメンタル (volt)
  {
    id: 'lightning-elemental', name: 'ライトニングエレメンタル', element: 'volt', rarity: 2,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'ball-lightning', element: 'volt' }] },
      { faceNumber: 2, sockets: [{ skillId: 'discharge', element: 'volt' }, { skillId: 'overcharge', element: 'volt' }] },
    ],
    customFaces: [
      { faceNumber: 3, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 4, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 50 },
    description: '純粋な雷の精霊。強力な放電で敵を焼く。',
  },

  // ★3 ストームウィザード (volt)
  {
    id: 'storm-wizard', name: 'ストームウィザード', element: 'volt', rarity: 3,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'thunder-bolt', element: 'volt' }] },
      { faceNumber: 2, sockets: [{ skillId: 'chain-lightning', element: 'volt' }, { skillId: 'magnetic-field', element: 'volt' }] },
      { faceNumber: 3, sockets: [{ skillId: 'tempest', element: 'volt' }, { skillId: 'volt-barrier', element: 'volt' }, { skillId: 'overclock', element: 'volt' }] },
    ],
    customFaces: [
      { faceNumber: 4, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'silver' }, { skillRuneId: null, socketTier: 'silver' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 25 },
    description: '嵐を操る魔術師。連鎖雷と結界の達人。',
  },

  // ★4 雷龍 (volt) - 第3章ボス
  {
    id: 'thunder-dragon', name: '雷龍', element: 'volt', rarity: 4,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'thunder-breath', element: 'volt' }] },
      { faceNumber: 2, sockets: [{ skillId: 'lightning-claw', element: 'volt' }, { skillId: 'chain-lightning', element: 'volt' }] },
      { faceNumber: 3, sockets: [{ skillId: 'mjolnir', element: 'volt' }, { skillId: 'tempest', element: 'volt' }, { skillId: 'volt-barrier', element: 'volt' }] },
      { faceNumber: 4, sockets: [{ skillId: 'thunder-domain', element: 'volt' }, { skillId: 'thunder-dragon-roar', element: 'volt' }, { skillId: 'discharge', element: 'volt' }, { skillId: 'ragnarok-bolt', element: 'volt' }] },
    ],
    customFaces: [
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'silver' }, { skillRuneId: null, socketTier: 'silver' }, { skillRuneId: null, socketTier: 'silver' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'gold' }, { skillRuneId: null, socketTier: 'silver' }, { skillRuneId: null, socketTier: 'silver' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 10 },
    description: '雷鳴の塔に君臨する雷の古龍。第3章のボス。',
  },
];

// 全モンスター統合
export const ALL_MONSTERS: MonsterDice[] = [
  ...CHAPTER1_MONSTERS,
  ...CHAPTER2_MONSTERS,
  ...CHAPTER3_MONSTERS,
];

export function getMonster(id: string): MonsterDice | undefined {
  return ALL_MONSTERS.find(m => m.id === id);
}
