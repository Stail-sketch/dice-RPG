import type { MonsterDice, Element, CustomSocket, CustomFace, SocketTier } from '../types';

// カスタム面生成ヘルパー: 各面の先頭1-2ソケットにlocked属性ルーンをプリセット
const ELEMENT_RUNES: Record<Element, [string, string]> = {
  blaze: ['blaze-strike', 'burn'],
  frost: ['ice-shard', 'freeze'],
  volt: ['spark', 'chain-bolt'],
  venom: ['poison-fang', 'toxic'],
  alloy: ['iron-bash', 'guard'],
  mirage: ['illusion', 'drain'],
};

function makeCustomFaces(element: Element, startFace: number, rarity: number = 1): CustomFace[] {
  const [rune1, rune2] = ELEMENT_RUNES[element];
  // レアリティに応じたベースソケット品質
  const baseTier: SocketTier = rarity >= 3 ? 'silver' : 'bronze';
  const lockedTier: SocketTier = rarity >= 4 ? 'gold' : rarity >= 2 ? 'silver' : 'bronze';
  const faces: CustomFace[] = [];
  for (let f = startFace; f <= 6; f++) {
    const sockets: CustomSocket[] = [];
    // 面のソケット数 = 面番号
    for (let s = 0; s < f; s++) {
      if (s === 0) {
        // 先頭ソケット: locked属性ダメージルーン
        sockets.push({ skillRuneId: rune1, socketTier: lockedTier, locked: true });
      } else if (s === 1 && f >= 4) {
        // 面4以上の2番目: locked属性補助ルーン
        sockets.push({ skillRuneId: rune2, socketTier: lockedTier, locked: true });
      } else {
        sockets.push({ skillRuneId: null, socketTier: baseTier });
      }
    }
    faces.push({ faceNumber: f, sockets });
  }
  return faces;
}

// ボス用: カスタム面が少ないが高Tierソケット
function makeBossCustomFaces(element: Element, startFace: number): CustomFace[] {
  const [rune1, rune2] = ELEMENT_RUNES[element];
  const faces: CustomFace[] = [];
  for (let f = startFace; f <= 6; f++) {
    const sockets: CustomSocket[] = [];
    for (let s = 0; s < f; s++) {
      if (s === 0) {
        sockets.push({ skillRuneId: rune1, socketTier: 'gold', locked: true });
      } else if (s === 1) {
        sockets.push({ skillRuneId: rune2, socketTier: 'gold', locked: true });
      } else if (s < 3) {
        sockets.push({ skillRuneId: null, socketTier: 'silver' });
      } else {
        sockets.push({ skillRuneId: null, socketTier: 'silver' });
      }
    }
    faces.push({ faceNumber: f, sockets });
  }
  return faces;
}

export const PROTAGONIST_DICE: MonsterDice = {
  id: 'protagonist',
  name: 'Hero Dice',
  element: 'alloy' as Element, // neutral, use alloy as placeholder
  rarity: 0,
  fixedFaces: [],
  customFaces: [
    { faceNumber: 1, sockets: [{ skillRuneId: null, socketTier: 'gold' }] },
    { faceNumber: 2, sockets: Array.from({length: 2}, () => ({ skillRuneId: null, socketTier: 'gold' as const })) },
    { faceNumber: 3, sockets: Array.from({length: 3}, () => ({ skillRuneId: null, socketTier: 'gold' as const })) },
    { faceNumber: 4, sockets: Array.from({length: 4}, () => ({ skillRuneId: null, socketTier: 'gold' as const })) },
    { faceNumber: 5, sockets: Array.from({length: 5}, () => ({ skillRuneId: null, socketTier: 'gold' as const })) },
    { faceNumber: 6, sockets: Array.from({length: 6}, () => ({ skillRuneId: null, socketTier: 'gold' as const })) },
  ],
  baseStats: { captureRate: 0 },
  description: 'あなた自身のダイス。全ソケットがgold。自由にカスタマイズせよ。',
};

// 第1章モンスター10体（★1x4, ★2x3, ★3x2, ★4ボスx1）
export const CHAPTER1_MONSTERS: MonsterDice[] = [
  // ★1 パイラクニド (炎)
  {
    id: 'pyrachnid', name: 'パイラクニド', element: 'blaze', rarity: 1,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'ember-fang', element: 'blaze' }] },
    ],
    customFaces: makeCustomFaces('blaze', 2),
    baseStats: { captureRate: 80 },
    description: '炎を纏う小蜘蛛。炎牙で獲物を仕留める。',
  },

  // ★1 フロストジェリー (氷)
  {
    id: 'frost-jelly', name: 'フロストジェリー', element: 'frost', rarity: 1,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'cryo-splash', element: 'frost' }] },
    ],
    customFaces: makeCustomFaces('frost', 2),
    baseStats: { captureRate: 80 },
    description: '冷気を帯びたゼリー状の生物。冷たい飛沫で攻撃する。',
  },

  // ★1 ボルトウィスプ (雷)
  {
    id: 'volt-wisp', name: 'ボルトウィスプ', element: 'volt', rarity: 1,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'spark-shot', element: 'volt' }] },
    ],
    customFaces: makeCustomFaces('volt', 2),
    baseStats: { captureRate: 80 },
    description: '漂う雷の精霊。放電で敵を痺れさせる。',
  },

  // ★1 ロットビートル (毒)
  {
    id: 'rot-beetle', name: 'ロットビートル', element: 'venom', rarity: 1,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'toxic-bite', element: 'venom' }] },
    ],
    customFaces: makeCustomFaces('venom', 2),
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
    customFaces: makeCustomFaces('mirage', 3, 2),
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
    customFaces: makeCustomFaces('alloy', 3, 2),
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
    customFaces: makeCustomFaces('blaze', 3, 2),
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
    customFaces: makeCustomFaces('alloy', 4, 3),
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
    customFaces: makeCustomFaces('venom', 4, 3),
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
    customFaces: makeBossCustomFaces('blaze', 5),
    baseStats: { captureRate: 15 },
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
    customFaces: makeCustomFaces('frost', 2),
    baseStats: { captureRate: 80 },
    description: '峡谷を駆ける氷の狼。素早い氷牙が武器。',
  },

  // ★1 ペンギン (frost)
  {
    id: 'penguin', name: 'ペンギン', element: 'frost', rarity: 1,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'slide', element: 'frost' }] },
    ],
    customFaces: makeCustomFaces('frost', 2),
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
    customFaces: makeCustomFaces('alloy', 3, 2),
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
    customFaces: makeCustomFaces('frost', 3, 2),
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
    customFaces: makeCustomFaces('frost', 4, 3),
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
    customFaces: makeBossCustomFaces('frost', 5),
    baseStats: { captureRate: 15 },
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
    customFaces: makeCustomFaces('volt', 2),
    baseStats: { captureRate: 80 },
    description: '雷の塔を漂う電気の精霊。小さいが素早い。',
  },

  // ★1 デンキネズミ (volt)
  {
    id: 'electric-mouse', name: 'デンキネズミ', element: 'volt', rarity: 1,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'thunder-tail', element: 'volt' }] },
    ],
    customFaces: makeCustomFaces('volt', 2),
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
    customFaces: makeCustomFaces('volt', 3, 2),
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
    customFaces: makeCustomFaces('volt', 3, 2),
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
    customFaces: makeCustomFaces('volt', 4, 3),
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
    customFaces: makeBossCustomFaces('volt', 5),
    baseStats: { captureRate: 15 },
    description: '雷鳴の塔に君臨する雷の古龍。第3章のボス。',
  },
];

// ==============================
// 第4章: 毒沼の森 (venom focus)
// ==============================
export const CHAPTER4_MONSTERS: MonsterDice[] = [
  // ★1 マッシュスポア (毒)
  {
    id: 'mush-spore', name: 'マッシュスポア', element: 'venom', rarity: 1,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'spore-shot', element: 'venom' }] },
    ],
    customFaces: makeCustomFaces('venom', 2),
    baseStats: { captureRate: 80 },
    description: '毒沼に生える巨大キノコ。胞子で攻撃する。',
  },
  // ★1 ポイズントード (毒)
  {
    id: 'poison-toad', name: 'ポイズントード', element: 'venom', rarity: 1,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'venom-tongue', element: 'venom' }] },
    ],
    customFaces: makeCustomFaces('venom', 2),
    baseStats: { captureRate: 80 },
    description: '毒沼に棲む巨大ガエル。長い毒舌が武器。',
  },
  // ★1 スワンプリーチ (毒)
  {
    id: 'swamp-leech', name: 'スワンプリーチ', element: 'venom', rarity: 1,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'leech-bite', element: 'venom' }] },
    ],
    customFaces: makeCustomFaces('venom', 2),
    baseStats: { captureRate: 80 },
    description: '沼地に潜む巨大ヒル。吸着して体力を奪う。',
  },
  // ★1 プラントワーム (毒)
  {
    id: 'plant-worm', name: 'プラントワーム', element: 'venom', rarity: 1,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'acid-spit', element: 'venom' }] },
    ],
    customFaces: makeCustomFaces('venom', 2),
    baseStats: { captureRate: 80 },
    description: '植物に寄生する芋虫。強酸を吐く。',
  },
  // ★2 マンティコア (毒)
  {
    id: 'manticore', name: 'マンティコア', element: 'venom', rarity: 2,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'scorpion-sting', element: 'venom' }] },
      { faceNumber: 2, sockets: [{ skillId: 'venom-spray', element: 'venom' }, { skillId: 'weaken', element: 'venom' }] },
    ],
    customFaces: makeCustomFaces('venom', 3, 2),
    baseStats: { captureRate: 50 },
    description: '蠍の尾を持つ獅子。毒針と毒噴射で敵を弱らせる。',
  },
  // ★2 バジリスク (毒)
  {
    id: 'basilisk', name: 'バジリスク', element: 'venom', rarity: 2,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'petrify-gaze', element: 'venom' }] },
      { faceNumber: 2, sockets: [{ skillId: 'fang-strike', element: 'venom' }, { skillId: 'toxic-scale', element: 'venom' }] },
    ],
    customFaces: makeCustomFaces('venom', 3, 2),
    baseStats: { captureRate: 50 },
    description: '石化の瞳を持つ大蛇。見つめられると動けなくなる。',
  },
  // ★2 ヴェノムキメラ (毒)
  {
    id: 'venom-chimera', name: 'ヴェノムキメラ', element: 'venom', rarity: 2,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'chimera-bite', element: 'venom' }] },
      { faceNumber: 2, sockets: [{ skillId: 'poison-breath', element: 'venom' }, { skillId: 'acid-armor', element: 'venom' }] },
    ],
    customFaces: makeCustomFaces('venom', 3, 2),
    baseStats: { captureRate: 50 },
    description: '3つの頭を持つ合成獣。毒息と酸の外殻で攻防一体。',
  },
  // ★3 デスブルーム (毒)
  {
    id: 'death-bloom', name: 'デスブルーム', element: 'venom', rarity: 3,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'bloom-burst', element: 'venom' }] },
      { faceNumber: 2, sockets: [{ skillId: 'pollen-cloud', element: 'venom' }, { skillId: 'root-bind', element: 'venom' }] },
      { faceNumber: 3, sockets: [{ skillId: 'nectar-heal', element: 'venom' }, { skillId: 'thorn-whip', element: 'venom' }, { skillId: 'decay-aura', element: 'venom' }] },
    ],
    customFaces: makeCustomFaces('venom', 4, 3),
    baseStats: { captureRate: 25 },
    description: '死を撒く巨大な毒花。美しくも恐ろしい。',
  },
  // ★3 ヒドラ (毒)
  {
    id: 'hydra', name: 'ヒドラ', element: 'venom', rarity: 3,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'hydra-bite', element: 'venom' }] },
      { faceNumber: 2, sockets: [{ skillId: 'regen-head', element: 'venom' }, { skillId: 'multi-poison', element: 'venom' }] },
      { faceNumber: 3, sockets: [{ skillId: 'acid-blood', element: 'venom' }, { skillId: 'hydra-roar', element: 'venom' }, { skillId: 'serpent-coil', element: 'venom' }] },
    ],
    customFaces: makeCustomFaces('venom', 4, 3),
    baseStats: { captureRate: 25 },
    description: '首を切っても再生する多頭蛇。毒と回復を兼ね備える。',
  },
  // ★5 毒龍ニーズヘッグ (毒) - 第4章ボス
  {
    id: 'nidhogg', name: '毒龍ニーズヘッグ', element: 'venom', rarity: 5,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'venom-breath', element: 'venom' }] },
      { faceNumber: 2, sockets: [{ skillId: 'nidhogg-fang', element: 'venom' }, { skillId: 'world-poison', element: 'venom' }] },
      { faceNumber: 3, sockets: [{ skillId: 'venom-domain', element: 'venom' }, { skillId: 'nidhogg-roar', element: 'venom' }, { skillId: 'decay-breath', element: 'venom' }] },
      { faceNumber: 4, sockets: [{ skillId: 'yggdrasil-rot', element: 'venom' }, { skillId: 'corpse-devour', element: 'venom' }, { skillId: 'world-poison', element: 'venom' }, { skillId: 'venom-breath', element: 'venom' }] },
      { faceNumber: 5, sockets: [{ skillId: 'nidhogg-fang', element: 'venom' }, { skillId: 'decay-breath', element: 'venom' }, { skillId: 'yggdrasil-rot', element: 'venom' }, { skillId: 'corpse-devour', element: 'venom' }, { skillId: 'nidhogg-roar', element: 'venom' }] },
    ],
    customFaces: makeBossCustomFaces('venom', 6),
    baseStats: { captureRate: 10 },
    description: '世界樹を蝕む毒の古龍。その毒は大地すら腐らせる。第4章ボス。',
  },
];

// ==============================
// 第5章: 鋼鉄の遺跡 (alloy focus)
// ==============================
export const CHAPTER5_MONSTERS: MonsterDice[] = [
  // ★1 メタルスライム (鋼)
  {
    id: 'metal-slime', name: 'メタルスライム', element: 'alloy', rarity: 1,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'metal-tackle', element: 'alloy' }] },
    ],
    customFaces: makeCustomFaces('alloy', 2),
    baseStats: { captureRate: 80 },
    description: '金属質のスライム。硬い体でぶつかってくる。',
  },
  // ★1 ギアパペット (鋼)
  {
    id: 'gear-puppet', name: 'ギアパペット', element: 'alloy', rarity: 1,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'gear-strike', element: 'alloy' }] },
    ],
    customFaces: makeCustomFaces('alloy', 2),
    baseStats: { captureRate: 80 },
    description: '歯車で動く人形。単純だが力強い。',
  },
  // ★1 ルストバグ (鋼)
  {
    id: 'rust-bug', name: 'ルストバグ', element: 'alloy', rarity: 1,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'rust-bite', element: 'alloy' }] },
    ],
    customFaces: makeCustomFaces('alloy', 2),
    baseStats: { captureRate: 80 },
    description: '鉄を喰らう甲虫。錆びた顎は意外と強力。',
  },
  // ★1 アイアンバット (鋼)
  {
    id: 'iron-bat', name: 'アイアンバット', element: 'alloy', rarity: 1,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'steel-wing', element: 'alloy' }] },
    ],
    customFaces: makeCustomFaces('alloy', 2),
    baseStats: { captureRate: 80 },
    description: '鋼鉄の翼を持つ蝙蝠。遺跡の番人。',
  },
  // ★2 シールドナイト (鋼)
  {
    id: 'shield-knight', name: 'シールドナイト', element: 'alloy', rarity: 2,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'heavy-slash', element: 'alloy' }] },
      { faceNumber: 2, sockets: [{ skillId: 'tower-shield', element: 'alloy' }, { skillId: 'armor-up', element: 'alloy' }] },
    ],
    customFaces: makeCustomFaces('alloy', 3, 2),
    baseStats: { captureRate: 50 },
    description: '重装の騎士。大盾で味方を守りつつ重い一撃を放つ。',
  },
  // ★2 スチームゴーレム (鋼)
  {
    id: 'steam-golem', name: 'スチームゴーレム', element: 'alloy', rarity: 2,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'steam-punch', element: 'alloy' }] },
      { faceNumber: 2, sockets: [{ skillId: 'boiler-guard', element: 'alloy' }, { skillId: 'overheat', element: 'alloy' }] },
    ],
    customFaces: makeCustomFaces('alloy', 3, 2),
    baseStats: { captureRate: 50 },
    description: '蒸気で動くゴーレム。オーバーヒートで瞬間火力を出す。',
  },
  // ★2 ミスリルセンチネル (鋼)
  {
    id: 'mithril-sentinel', name: 'ミスリルセンチネル', element: 'alloy', rarity: 2,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'mithril-slash', element: 'alloy' }] },
      { faceNumber: 2, sockets: [{ skillId: 'mithril-guard', element: 'alloy' }, { skillId: 'sentinel-stance', element: 'alloy' }] },
    ],
    customFaces: makeCustomFaces('alloy', 3, 2),
    baseStats: { captureRate: 50 },
    description: 'ミスリル製の衛兵。攻守のバランスに優れる。',
  },
  // ★3 アダマンタイタン (鋼)
  {
    id: 'adamant-titan', name: 'アダマンタイタン', element: 'alloy', rarity: 3,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'titan-crush', element: 'alloy' }] },
      { faceNumber: 2, sockets: [{ skillId: 'adamant-wall', element: 'alloy' }, { skillId: 'quake-stomp', element: 'alloy' }] },
      { faceNumber: 3, sockets: [{ skillId: 'titan-roar', element: 'alloy' }, { skillId: 'fortress', element: 'alloy' }, { skillId: 'iron-maiden', element: 'alloy' }] },
    ],
    customFaces: makeCustomFaces('alloy', 4, 3),
    baseStats: { captureRate: 25 },
    description: 'アダマンタイト製の巨人。圧倒的な防御力を誇る。',
  },
  // ★3 オリハルコンドラゴン (鋼)
  {
    id: 'orichalcum-dragon', name: 'オリハルコンドラゴン', element: 'alloy', rarity: 3,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'orichalcum-fang', element: 'alloy' }] },
      { faceNumber: 2, sockets: [{ skillId: 'metal-breath', element: 'alloy' }, { skillId: 'chrome-shield', element: 'alloy' }] },
      { faceNumber: 3, sockets: [{ skillId: 'alloy-roar', element: 'alloy' }, { skillId: 'magnetize', element: 'alloy' }, { skillId: 'heavy-tail', element: 'alloy' }] },
    ],
    customFaces: makeCustomFaces('alloy', 4, 3),
    baseStats: { captureRate: 25 },
    description: 'オリハルコンの鱗を持つ龍。金属のブレスが強力。',
  },
  // ★5 鋼龍ファフニール (鋼) - 第5章ボス
  {
    id: 'fafnir', name: '鋼龍ファフニール', element: 'alloy', rarity: 5,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'fafnir-breath', element: 'alloy' }] },
      { faceNumber: 2, sockets: [{ skillId: 'fafnir-claw', element: 'alloy' }, { skillId: 'absolute-defense', element: 'alloy' }] },
      { faceNumber: 3, sockets: [{ skillId: 'fafnir-roar', element: 'alloy' }, { skillId: 'meteor-strike', element: 'alloy' }, { skillId: 'alloy-domain', element: 'alloy' }] },
      { faceNumber: 4, sockets: [{ skillId: 'rust-curse', element: 'alloy' }, { skillId: 'juggernaut', element: 'alloy' }, { skillId: 'fafnir-breath', element: 'alloy' }, { skillId: 'absolute-defense', element: 'alloy' }] },
      { faceNumber: 5, sockets: [{ skillId: 'meteor-strike', element: 'alloy' }, { skillId: 'fafnir-claw', element: 'alloy' }, { skillId: 'juggernaut', element: 'alloy' }, { skillId: 'fafnir-roar', element: 'alloy' }, { skillId: 'alloy-domain', element: 'alloy' }] },
    ],
    customFaces: makeBossCustomFaces('alloy', 6),
    baseStats: { captureRate: 10 },
    description: '伝説の鋼龍。絶対防御と隕鉄の一撃で全てを砕く。第5章ボス。',
  },
];

// ==============================
// 第6章: 幻影の神殿 (mirage focus)
// ==============================
export const CHAPTER6_MONSTERS: MonsterDice[] = [
  // ★1 シェイドウィスプ (幻)
  {
    id: 'shade-wisp', name: 'シェイドウィスプ', element: 'mirage', rarity: 1,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'shadow-touch', element: 'mirage' }] },
    ],
    customFaces: makeCustomFaces('mirage', 2),
    baseStats: { captureRate: 80 },
    description: '影から生まれた小さな精霊。触れると冷たい。',
  },
  // ★1 ミラーフォックス (幻)
  {
    id: 'mirror-fox', name: 'ミラーフォックス', element: 'mirage', rarity: 1,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'mirror-claw', element: 'mirage' }] },
    ],
    customFaces: makeCustomFaces('mirage', 2),
    baseStats: { captureRate: 80 },
    description: '鏡のような毛皮を持つ狐。幻術で敵を惑わす。',
  },
  // ★1 ファントムマウス (幻)
  {
    id: 'phantom-mouse', name: 'ファントムマウス', element: 'mirage', rarity: 1,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'phantom-bite', element: 'mirage' }] },
    ],
    customFaces: makeCustomFaces('mirage', 2),
    baseStats: { captureRate: 80 },
    description: '実体を持たないネズミ。壁をすり抜ける。',
  },
  // ★1 ドッペルゲンガー (幻)
  {
    id: 'doppelganger', name: 'ドッペルゲンガー', element: 'mirage', rarity: 1,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'doppel-strike', element: 'mirage' }] },
    ],
    customFaces: makeCustomFaces('mirage', 2),
    baseStats: { captureRate: 80 },
    description: '自分の分身を生み出す謎の存在。',
  },
  // ★2 イリュージョニスト (幻)
  {
    id: 'illusionist', name: 'イリュージョニスト', element: 'mirage', rarity: 2,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'mind-blast', element: 'mirage' }] },
      { faceNumber: 2, sockets: [{ skillId: 'confusion', element: 'mirage' }, { skillId: 'mirror-image', element: 'mirage' }] },
    ],
    customFaces: makeCustomFaces('mirage', 3, 2),
    baseStats: { captureRate: 50 },
    description: '幻術を操る魔術師。混乱と回避を駆使する。',
  },
  // ★2 ナイトメア (幻)
  {
    id: 'nightmare', name: 'ナイトメア', element: 'mirage', rarity: 2,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'nightmare-scream', element: 'mirage' }] },
      { faceNumber: 2, sockets: [{ skillId: 'sleep-curse', element: 'mirage' }, { skillId: 'dream-drain', element: 'mirage' }] },
    ],
    customFaces: makeCustomFaces('mirage', 3, 2),
    baseStats: { captureRate: 50 },
    description: '悪夢を具現化した存在。眠りの呪いが恐ろしい。',
  },
  // ★2 ファントムナイト (幻)
  {
    id: 'phantom-knight', name: 'ファントムナイト', element: 'mirage', rarity: 2,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'ghost-blade', element: 'mirage' }] },
      { faceNumber: 2, sockets: [{ skillId: 'phase-guard', element: 'mirage' }, { skillId: 'specter-strike', element: 'mirage' }] },
    ],
    customFaces: makeCustomFaces('mirage', 3, 2),
    baseStats: { captureRate: 50 },
    description: '幽霊の騎士。位相をずらして攻撃を避ける。',
  },
  // ★3 バンシー (幻)
  {
    id: 'banshee', name: 'バンシー', element: 'mirage', rarity: 3,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'wail', element: 'mirage' }] },
      { faceNumber: 2, sockets: [{ skillId: 'soul-rend', element: 'mirage' }, { skillId: 'death-wail', element: 'mirage' }] },
      { faceNumber: 3, sockets: [{ skillId: 'spirit-shield', element: 'mirage' }, { skillId: 'banshee-cry', element: 'mirage' }, { skillId: 'life-drain', element: 'mirage' }] },
    ],
    customFaces: makeCustomFaces('mirage', 4, 3),
    baseStats: { captureRate: 25 },
    description: '嘆きの亡霊。慟哭は生者の魂を震わせる。',
  },
  // ★3 ヴォイドスフィンクス (幻)
  {
    id: 'void-sphinx', name: 'ヴォイドスフィンクス', element: 'mirage', rarity: 3,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'void-claw', element: 'mirage' }] },
      { faceNumber: 2, sockets: [{ skillId: 'riddle-curse', element: 'mirage' }, { skillId: 'sphinx-wisdom', element: 'mirage' }] },
      { faceNumber: 3, sockets: [{ skillId: 'void-shield', element: 'mirage' }, { skillId: 'dimension-rift', element: 'mirage' }, { skillId: 'enigma-heal', element: 'mirage' }] },
    ],
    customFaces: makeCustomFaces('mirage', 4, 3),
    baseStats: { captureRate: 25 },
    description: '虚空に座すスフィンクス。謎かけに答えられぬ者は滅ぶ。',
  },
  // ★5 幻龍ティアマト (幻) - 第6章ボス
  {
    id: 'tiamat', name: '幻龍ティアマト', element: 'mirage', rarity: 5,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'tiamat-breath', element: 'mirage' }] },
      { faceNumber: 2, sockets: [{ skillId: 'tiamat-claw', element: 'mirage' }, { skillId: 'reality-warp', element: 'mirage' }] },
      { faceNumber: 3, sockets: [{ skillId: 'mirage-domain', element: 'mirage' }, { skillId: 'tiamat-roar', element: 'mirage' }, { skillId: 'chaos-breath', element: 'mirage' }] },
      { faceNumber: 4, sockets: [{ skillId: 'soul-devour', element: 'mirage' }, { skillId: 'oblivion', element: 'mirage' }, { skillId: 'tiamat-breath', element: 'mirage' }, { skillId: 'reality-warp', element: 'mirage' }] },
      { faceNumber: 5, sockets: [{ skillId: 'chaos-breath', element: 'mirage' }, { skillId: 'tiamat-claw', element: 'mirage' }, { skillId: 'oblivion', element: 'mirage' }, { skillId: 'tiamat-roar', element: 'mirage' }, { skillId: 'soul-devour', element: 'mirage' }] },
    ],
    customFaces: makeBossCustomFaces('mirage', 6),
    baseStats: { captureRate: 10 },
    description: '幻影の神殿に眠る原初の龍。現実そのものを歪める。第6章ボス。',
  },
];

// ==============================
// 第7章: 運命の回廊 (mixed elements - final chapter)
// ==============================
export const CHAPTER7_MONSTERS: MonsterDice[] = [
  // ★2 エレメンタルキメラ (炎/氷/雷 mixed)
  {
    id: 'elemental-chimera', name: 'エレメンタルキメラ', element: 'blaze', rarity: 2,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'chaos-fang', element: 'blaze' }] },
      { faceNumber: 2, sockets: [{ skillId: 'chaos-ice', element: 'frost' }, { skillId: 'chaos-bolt', element: 'volt' }] },
    ],
    customFaces: makeCustomFaces('blaze', 3, 2),
    baseStats: { captureRate: 50 },
    description: '3属性の力を持つ合成獣。炎・氷・雷を自在に操る。',
  },
  // ★3 エンシェントガーディアン (鋼/幻 mixed)
  {
    id: 'ancient-guardian', name: 'エンシェントガーディアン', element: 'alloy', rarity: 3,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'ancient-slash', element: 'alloy' }] },
      { faceNumber: 2, sockets: [{ skillId: 'ancient-shield', element: 'alloy' }, { skillId: 'ancient-roar', element: 'alloy' }] },
      { faceNumber: 3, sockets: [{ skillId: 'time-slash', element: 'mirage' }, { skillId: 'fate-guard', element: 'mirage' }, { skillId: 'epoch-strike', element: 'alloy' }] },
    ],
    customFaces: makeCustomFaces('alloy', 4, 3),
    baseStats: { captureRate: 25 },
    description: '太古の守護者。時を超えて回廊を守り続ける。',
  },
  // ★3 カオスドラゴン (全属性 mixed)
  {
    id: 'chaos-dragon', name: 'カオスドラゴン', element: 'blaze', rarity: 3,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'primal-fire', element: 'blaze' }] },
      { faceNumber: 2, sockets: [{ skillId: 'primal-ice', element: 'frost' }, { skillId: 'primal-thunder', element: 'volt' }] },
      { faceNumber: 3, sockets: [{ skillId: 'primal-venom', element: 'venom' }, { skillId: 'primal-shield', element: 'alloy' }, { skillId: 'primal-illusion', element: 'mirage' }] },
    ],
    customFaces: makeCustomFaces('blaze', 4, 3),
    baseStats: { captureRate: 15 },
    description: '6属性全ての力を持つ原初の龍。カオスの具現。',
  },
  // ★5 運命龍ウロボロス (全属性) - 最終ボス
  {
    id: 'ouroboros', name: '運命龍ウロボロス', element: 'mirage', rarity: 5,
    fixedFaces: [
      { faceNumber: 1, sockets: [{ skillId: 'ouroboros-breath', element: 'blaze' }] },
      { faceNumber: 2, sockets: [{ skillId: 'infinity-claw', element: 'alloy' }, { skillId: 'fate-warp', element: 'mirage' }] },
      { faceNumber: 3, sockets: [{ skillId: 'genesis-shield', element: 'alloy' }, { skillId: 'ouroboros-roar', element: 'mirage' }, { skillId: 'apocalypse', element: 'blaze' }] },
      { faceNumber: 4, sockets: [{ skillId: 'eternal-heal', element: 'mirage' }, { skillId: 'omega-bolt', element: 'volt' }, { skillId: 'entropy', element: 'venom' }, { skillId: 'absolute-zero-final', element: 'frost' }] },
      { faceNumber: 5, sockets: [{ skillId: 'apocalypse', element: 'blaze' }, { skillId: 'omega-bolt', element: 'volt' }, { skillId: 'absolute-zero-final', element: 'frost' }, { skillId: 'ouroboros-roar', element: 'mirage' }, { skillId: 'infinity-claw', element: 'alloy' }] },
    ],
    customFaces: makeBossCustomFaces('mirage', 6),
    baseStats: { captureRate: 5 },
    description: '始まりと終わりを司る究極の龍。全属性を操り世界を巡る。最終ボス。',
  },
];

// 全モンスター統合
export const ALL_MONSTERS: MonsterDice[] = [
  ...CHAPTER1_MONSTERS,
  ...CHAPTER2_MONSTERS,
  ...CHAPTER3_MONSTERS,
  ...CHAPTER4_MONSTERS,
  ...CHAPTER5_MONSTERS,
  ...CHAPTER6_MONSTERS,
  ...CHAPTER7_MONSTERS,
];

export function getMonster(id: string): MonsterDice | undefined {
  return ALL_MONSTERS.find(m => m.id === id);
}
