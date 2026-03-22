import type { MonsterDice } from '../types';

// 第1章モンスター10体（★1x4, ★2x3, ★3x2, ★4ボスx1）
export const CHAPTER1_MONSTERS: MonsterDice[] = [
  // ★1 パイラクニド (炎)
  {
    id: 'pyrachnid', name: 'パイラクニド', element: 'blaze', rarity: 1,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'ember-fang', element: 'blaze' }] },
    ],
    customFaces: [
      { faceNumber: 2, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 3, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 4, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 80 },
    description: '炎を纏う小蜘蛛。炎牙で獲物を仕留める。',
  },

  // ★1 フロストジェリー (氷)
  {
    id: 'frost-jelly', name: 'フロストジェリー', element: 'frost', rarity: 1,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'cryo-splash', element: 'frost' }] },
    ],
    customFaces: [
      { faceNumber: 2, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 3, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 4, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 80 },
    description: '冷気を帯びたゼリー状の生物。冷たい飛沫で攻撃する。',
  },

  // ★1 ボルトウィスプ (雷)
  {
    id: 'volt-wisp', name: 'ボルトウィスプ', element: 'volt', rarity: 1,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'spark-shot', element: 'volt' }] },
    ],
    customFaces: [
      { faceNumber: 2, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 3, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 4, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 80 },
    description: '漂う雷の精霊。放電で敵を痺れさせる。',
  },

  // ★1 ロットビートル (毒)
  {
    id: 'rot-beetle', name: 'ロットビートル', element: 'venom', rarity: 1,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'toxic-bite', element: 'venom' }] },
    ],
    customFaces: [
      { faceNumber: 2, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 3, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 4, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 80 },
    description: '腐食を撒き散らす甲虫。毒の噛みつきが厄介。',
  },

  // ★2 ホロウ (幻)
  {
    id: 'hollow', name: 'ホロウ', element: 'mirage', rarity: 2,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'soul-drain', element: 'mirage' }] },
      { faceNumber: 2, sockets: [{ skillId: 'phase-shift', element: 'mirage' }, { skillId: 'haunt', element: 'mirage' }] },
    ],
    customFaces: [
      { faceNumber: 3, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 4, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 50 },
    description: '虚ろな亡霊。魂を吸い取り、位相をずらして攻撃を避ける。',
  },

  // ★2 ゴブリンナイト (鋼)
  {
    id: 'goblin-knight', name: 'ゴブリンナイト', element: 'alloy', rarity: 2,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'shield-bash-v2', element: 'alloy' }] },
      { faceNumber: 2, sockets: [{ skillId: 'iron-guard', element: 'alloy' }, { skillId: 'war-cry', element: 'alloy' }] },
    ],
    customFaces: [
      { faceNumber: 3, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 4, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 50 },
    description: '鎧を纏ったゴブリン騎士。盾と雄叫びで戦場を制する。',
  },

  // ★2 サラマンダーv2 (炎)
  {
    id: 'salamander-v2', name: 'サラマンダー', element: 'blaze', rarity: 2,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'flame-v2', element: 'blaze' }] },
      { faceNumber: 2, sockets: [{ skillId: 'combustion-v2', element: 'blaze' }, { skillId: 'scorch-v2', element: 'blaze' }] },
    ],
    customFaces: [
      { faceNumber: 3, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 4, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 50 },
    description: '炎を纏うトカゲ。攻撃的な炎属性の中級モンスター。',
  },

  // ★3 アイアンゴーレム (鋼)
  {
    id: 'iron-golem', name: 'アイアンゴーレム', element: 'alloy', rarity: 3,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'iron-fist', element: 'alloy' }] },
      { faceNumber: 2, sockets: [{ skillId: 'fortify', element: 'alloy' }, { skillId: 'wall', element: 'alloy' }] },
      { faceNumber: 3, sockets: [{ skillId: 'crush', element: 'alloy' }, { skillId: 'counter-v2', element: 'alloy' }, { skillId: 'war-roar', element: 'alloy' }] },
    ],
    customFaces: [
      { faceNumber: 4, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 25 },
    description: '鋼鉄の巨人。鉄拳と鉄壁で敵を圧倒する。',
  },

  // ★3 シャドウサーペント (毒)
  {
    id: 'shadow-serpent', name: 'シャドウサーペント', element: 'venom', rarity: 3,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'venom-strike', element: 'venom' }] },
      { faceNumber: 2, sockets: [{ skillId: 'poison-mist', element: 'venom' }, { skillId: 'constrict', element: 'venom' }] },
      { faceNumber: 3, sockets: [{ skillId: 'death-coil', element: 'venom' }, { skillId: 'toxic-cloud', element: 'venom' }, { skillId: 'shed-skin', element: 'venom' }] },
    ],
    customFaces: [
      { faceNumber: 4, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 25 },
    description: '影に潜む毒蛇。猛毒と締め付けで獲物を逃さない。',
  },

  // ★4 インフェルノドレイク (炎) - 第1章ボス
  {
    id: 'inferno-drake', name: 'インフェルノドレイク', element: 'blaze', rarity: 4,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'dragon-breath-v2', element: 'blaze' }] },
      { faceNumber: 2, sockets: [{ skillId: 'flame-claw-v2', element: 'blaze' }, { skillId: 'combustion-v2', element: 'blaze' }] },
      { faceNumber: 3, sockets: [{ skillId: 'eruption-v2', element: 'blaze' }, { skillId: 'heat-wave-v2', element: 'blaze' }, { skillId: 'scorch-v2', element: 'blaze' }] },
      { faceNumber: 4, sockets: [{ skillId: 'magma-shield-v2', element: 'blaze' }, { skillId: 'dragon-roar-v2', element: 'blaze' }, { skillId: 'inferno-blast', element: 'blaze' }, { skillId: 'hellfire', element: 'blaze' }] },
    ],
    customFaces: [
      { faceNumber: 5, sockets: [{ skillRuneId: null, socketTier: 'silver' }, { skillRuneId: null, socketTier: 'silver' }, { skillRuneId: null, socketTier: 'silver' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
      { faceNumber: 6, sockets: [{ skillRuneId: null, socketTier: 'gold' }, { skillRuneId: null, socketTier: 'silver' }, { skillRuneId: null, socketTier: 'silver' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }, { skillRuneId: null, socketTier: 'bronze' }] },
    ],
    baseStats: { captureRate: 10 },
    description: '灼熱の炎竜。地獄の業火で全てを焼き尽くす第1章のボス。',
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
