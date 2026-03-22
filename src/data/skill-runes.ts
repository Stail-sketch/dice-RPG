import type { SkillRune, Element, SkillEffect } from '../types';

export const SKILL_RUNES: SkillRune[] = [
  // ===== 炎 (Blaze) =====
  { id: 'blaze-strike', name: '火炎撃', element: 'blaze', tier: 'common',
    effect: { type: 'damage', power: 8, description: '炎の一撃' }, description: '基本的な炎攻撃' },
  { id: 'burn', name: '燃焼', element: 'blaze', tier: 'common',
    effect: { type: 'dot', power: 3, duration: 3, description: '3T燃焼' }, description: '敵を燃やし続ける' },
  { id: 'inferno', name: '業炎', element: 'blaze', tier: 'rare',
    effect: { type: 'damage', power: 15, description: '強力な炎攻撃' }, description: '猛烈な炎で焼き尽くす' },
  { id: 'blaze-wall', name: '火炎壁', element: 'blaze', tier: 'rare',
    effect: { type: 'shield', power: 8, duration: 2, description: '2T炎シールド' }, description: '炎の壁で身を守る' },

  // ===== 氷 (Frost) =====
  { id: 'ice-shard', name: '氷礫', element: 'frost', tier: 'common',
    effect: { type: 'damage', power: 7, description: '氷の礫' }, description: '鋭い氷の破片を飛ばす' },
  { id: 'freeze', name: '凍結', element: 'frost', tier: 'common',
    effect: { type: 'debuff', power: 0.5, duration: 1, description: '1T減速' }, description: '敵の動きを鈍らせる' },
  { id: 'blizzard', name: '吹雪', element: 'frost', tier: 'rare',
    effect: { type: 'damage', power: 12, description: '広範囲氷攻撃' }, description: '激しい吹雪を巻き起こす' },
  { id: 'ice-armor', name: '氷鎧', element: 'frost', tier: 'rare',
    effect: { type: 'buff', power: 1.3, duration: 2, description: '2T防御UP' }, description: '氷の鎧で防御強化' },

  // ===== 雷 (Volt) =====
  { id: 'spark', name: '電撃', element: 'volt', tier: 'common',
    effect: { type: 'damage', power: 9, description: '雷の一撃' }, description: '電撃を放つ' },
  { id: 'chain-bolt', name: '連鎖雷', element: 'volt', tier: 'common',
    effect: { type: 'damage', power: 5, description: '2回ヒット雷撃' }, description: '連鎖する雷' },
  { id: 'thunder', name: '落雷', element: 'volt', tier: 'rare',
    effect: { type: 'damage', power: 18, description: '高威力雷撃' }, description: '天から稲妻を落とす' },
  { id: 'charge', name: '帯電', element: 'volt', tier: 'rare',
    effect: { type: 'buff', power: 1.5, duration: 1, description: '1T攻撃UP' }, description: '電気を纏い攻撃力UP' },

  // ===== 毒 (Venom) =====
  { id: 'poison-fang', name: '毒牙', element: 'venom', tier: 'common',
    effect: { type: 'damage', power: 6, description: '毒の一撃' }, description: '毒の牙で噛みつく' },
  { id: 'toxic', name: '猛毒', element: 'venom', tier: 'common',
    effect: { type: 'dot', power: 4, duration: 3, description: '3T毒' }, description: '強い毒を付与する' },
  { id: 'venom-mist', name: '毒霧', element: 'venom', tier: 'rare',
    effect: { type: 'debuff', power: 0.7, duration: 2, description: '2T攻撃DOWN' }, description: '毒霧で敵の攻撃力を下げる' },

  // ===== 鋼 (Alloy) =====
  { id: 'iron-bash', name: '鉄槌', element: 'alloy', tier: 'common',
    effect: { type: 'damage', power: 7, description: '鋼の一撃' }, description: '鉄の拳で殴る' },
  { id: 'guard', name: '守護', element: 'alloy', tier: 'common',
    effect: { type: 'shield', power: 10, duration: 1, description: '1Tシールド' }, description: '鋼のシールドで守る' },
  { id: 'counter', name: '反撃', element: 'alloy', tier: 'rare',
    effect: { type: 'damage', power: 12, description: 'カウンターダメージ' }, description: '受けたダメージを返す' },

  // ===== 幻 (Mirage) =====
  { id: 'illusion', name: '幻影', element: 'mirage', tier: 'common',
    effect: { type: 'debuff', power: 0.6, duration: 1, description: '1T攻撃DOWN' }, description: '幻で敵を惑わす' },
  { id: 'drain', name: '吸収', element: 'mirage', tier: 'common',
    effect: { type: 'heal', power: 5, description: 'HP5回復' }, description: '敵の力を吸い取る' },
  { id: 'mirage-blade', name: '幻刃', element: 'mirage', tier: 'rare',
    effect: { type: 'damage', power: 14, description: '幻の刃で切る' }, description: '実体なき刃で切り裂く' },

  // ===== エピック (Epic) =====
  { id: 'inferno-rune', name: '獄炎', element: 'blaze', tier: 'epic',
    effect: { type: 'damage', power: 22, description: '極大炎ダメージ' }, description: '灼熱の極み' },
  { id: 'absolute-zero', name: '絶対零度', element: 'frost', tier: 'epic',
    effect: { type: 'damage', power: 20, description: '凍てつく一撃' }, description: '全てを凍らせる' },
  { id: 'judgment-bolt', name: '裁きの雷', element: 'volt', tier: 'epic',
    effect: { type: 'damage', power: 24, description: '神罰の雷撃' }, description: '天からの裁き' },
];

// スキルルーンをIDで検索
export function getSkillRune(id: string): SkillRune | undefined {
  return SKILL_RUNES.find(r => r.id === id);
}

// 固有スキル（モンスター専用、ルーンとしては入手不可）
export interface FixedSkill {
  id: string;
  name: string;
  element: Element;
  effect: SkillEffect;
}

export const FIXED_SKILLS: Record<string, FixedSkill> = {
  // スライム
  'slime-shot': { id: 'slime-shot', name: '粘液弾', element: 'frost',
    effect: { type: 'damage', power: 5, description: '粘液で攻撃' } },
  // コウモリ
  'vampirism': { id: 'vampirism', name: '吸血', element: 'mirage',
    effect: { type: 'heal', power: 4, description: 'HP4回復' } },
  // ゴブリン
  'shield-bash': { id: 'shield-bash', name: '盾打ち', element: 'alloy',
    effect: { type: 'damage', power: 6, description: '盾で殴る' } },
  'defend': { id: 'defend', name: '守り', element: 'alloy',
    effect: { type: 'shield', power: 5, duration: 1, description: '1Tシールド' } },
  'taunt': { id: 'taunt', name: '挑発', element: 'alloy',
    effect: { type: 'debuff', power: 0.8, duration: 1, description: '1T攻撃DOWN' } },
  // サラマンダー
  'flame': { id: 'flame', name: '火炎', element: 'blaze',
    effect: { type: 'damage', power: 7, description: '火炎で攻撃' } },
  'combustion': { id: 'combustion', name: '燃焼', element: 'blaze',
    effect: { type: 'dot', power: 3, duration: 2, description: '2T燃焼' } },
  'scorch': { id: 'scorch', name: '灼熱', element: 'blaze',
    effect: { type: 'damage', power: 5, description: '灼熱ダメージ' } },
  // スケルトン
  'bone-throw': { id: 'bone-throw', name: '骨投げ', element: 'venom',
    effect: { type: 'damage', power: 6, description: '骨を投げつける' } },
  'miasma': { id: 'miasma', name: '瘴気', element: 'venom',
    effect: { type: 'dot', power: 3, duration: 2, description: '2T毒' } },
  'curse': { id: 'curse', name: '呪い', element: 'venom',
    effect: { type: 'debuff', power: 0.7, duration: 2, description: '2T防御DOWN' } },
  // ハーピー
  'wind-blade': { id: 'wind-blade', name: '風刃', element: 'volt',
    effect: { type: 'damage', power: 8, description: '風の刃' } },
  'lightning': { id: 'lightning', name: '雷撃', element: 'volt',
    effect: { type: 'damage', power: 10, description: '雷撃' } },
  'rapid-strike': { id: 'rapid-strike', name: '連撃', element: 'volt',
    effect: { type: 'damage', power: 5, description: '素早く2回攻撃' } },
  'storm': { id: 'storm', name: '嵐', element: 'volt',
    effect: { type: 'damage', power: 7, description: '嵐を巻き起こす' } },
  'haste': { id: 'haste', name: '加速', element: 'volt',
    effect: { type: 'buff', power: 1.3, duration: 2, description: '2T速度UP' } },
  'flight': { id: 'flight', name: '飛翔', element: 'volt',
    effect: { type: 'buff', power: 1.2, duration: 1, description: '1T回避UP' } },
  // ミミック
  'mimic': { id: 'mimic', name: '擬態', element: 'mirage',
    effect: { type: 'debuff', power: 0.6, duration: 1, description: '1T混乱' } },
  'steal': { id: 'steal', name: '盗み', element: 'mirage',
    effect: { type: 'damage', power: 6, description: '盗みつつ攻撃' } },
  'transform': { id: 'transform', name: '変身', element: 'mirage',
    effect: { type: 'buff', power: 1.5, duration: 1, description: '1T攻撃UP' } },
  'copy': { id: 'copy', name: 'コピー', element: 'mirage',
    effect: { type: 'damage', power: 10, description: '敵技をコピーして攻撃' } },
  'split': { id: 'split', name: '分裂', element: 'mirage',
    effect: { type: 'damage', power: 4, description: '分裂して攻撃' } },
  'trap': { id: 'trap', name: '罠', element: 'mirage',
    effect: { type: 'debuff', power: 0.5, duration: 1, description: '1T行動制限' } },
  // 洞窟竜
  'dragon-breath': { id: 'dragon-breath', name: '竜の息吹', element: 'blaze',
    effect: { type: 'damage', power: 15, description: '強力なブレス' } },
  'flame-claw': { id: 'flame-claw', name: '炎爪', element: 'blaze',
    effect: { type: 'damage', power: 12, description: '炎を纏った爪' } },
  'magma-shield': { id: 'magma-shield', name: 'マグマの盾', element: 'blaze',
    effect: { type: 'shield', power: 12, duration: 2, description: '2Tシールド' } },
  'eruption': { id: 'eruption', name: '噴火', element: 'blaze',
    effect: { type: 'damage', power: 20, description: '大爆発' } },
  'heat-wave': { id: 'heat-wave', name: '熱波', element: 'blaze',
    effect: { type: 'dot', power: 5, duration: 3, description: '3T燃焼' } },
  'dragon-roar': { id: 'dragon-roar', name: '竜の咆哮', element: 'blaze',
    effect: { type: 'buff', power: 1.5, duration: 2, description: '2T攻撃UP' } },
  'inferno-fixed': { id: 'inferno-fixed', name: '獄炎', element: 'blaze',
    effect: { type: 'damage', power: 18, description: '極大炎ダメージ' } },

  // ==============================
  // 第1章 新モンスター固有スキル
  // ==============================
  // パイラクニド
  'ember-fang': { id: 'ember-fang', name: '炎牙', element: 'blaze',
    effect: { type: 'damage', power: 6, description: '炎牙で噛みつく' } },
  // フロストジェリー
  'cryo-splash': { id: 'cryo-splash', name: '冷気飛沫', element: 'frost',
    effect: { type: 'damage', power: 5, description: '冷気の飛沫' } },
  // ボルトウィスプ
  'spark-shot': { id: 'spark-shot', name: '放電弾', element: 'volt',
    effect: { type: 'damage', power: 7, description: '放電' } },
  // ロットビートル
  'toxic-bite': { id: 'toxic-bite', name: '毒噛み', element: 'venom',
    effect: { type: 'damage', power: 5, description: '毒の噛みつき' } },
  // ホロウ
  'soul-drain': { id: 'soul-drain', name: '魂吸収', element: 'mirage',
    effect: { type: 'heal', power: 5, description: '魂を吸い取る' } },
  'phase-shift': { id: 'phase-shift', name: '位相変位', element: 'mirage',
    effect: { type: 'buff', power: 1.3, duration: 1, description: '位相をずらす' } },
  'haunt': { id: 'haunt', name: '憑依', element: 'mirage',
    effect: { type: 'debuff', power: 0.7, duration: 2, description: '取り憑く' } },
  // ゴブリンナイト
  'shield-bash-v2': { id: 'shield-bash-v2', name: '盾強打', element: 'alloy',
    effect: { type: 'damage', power: 7, description: '盾で殴る' } },
  'iron-guard': { id: 'iron-guard', name: '鉄壁の守り', element: 'alloy',
    effect: { type: 'shield', power: 6, duration: 1, description: '鉄壁の守り' } },
  'war-cry': { id: 'war-cry', name: '雄叫び', element: 'alloy',
    effect: { type: 'debuff', power: 0.8, duration: 1, description: '雄叫び' } },
  // サラマンダーv2
  'flame-v2': { id: 'flame-v2', name: '火炎', element: 'blaze',
    effect: { type: 'damage', power: 8, description: '火炎で焼く' } },
  'combustion-v2': { id: 'combustion-v2', name: '燃焼', element: 'blaze',
    effect: { type: 'dot', power: 3, duration: 2, description: '燃焼' } },
  'scorch-v2': { id: 'scorch-v2', name: '灼熱', element: 'blaze',
    effect: { type: 'damage', power: 6, description: '灼熱' } },
  // アイアンゴーレム
  'iron-fist': { id: 'iron-fist', name: '鉄拳', element: 'alloy',
    effect: { type: 'damage', power: 10, description: '鉄拳' } },
  'fortify': { id: 'fortify', name: '防御強化', element: 'alloy',
    effect: { type: 'buff', power: 1.4, duration: 2, description: '防御強化' } },
  'wall': { id: 'wall', name: '鉄壁', element: 'alloy',
    effect: { type: 'shield', power: 8, duration: 2, description: '鉄壁' } },
  'crush': { id: 'crush', name: '粉砕', element: 'alloy',
    effect: { type: 'damage', power: 12, description: '粉砕' } },
  'counter-v2': { id: 'counter-v2', name: '反撃', element: 'alloy',
    effect: { type: 'damage', power: 10, description: '反撃' } },
  'war-roar': { id: 'war-roar', name: '戦嘶き', element: 'alloy',
    effect: { type: 'buff', power: 1.3, duration: 1, description: '戦嘶き' } },
  // シャドウサーペント
  'venom-strike': { id: 'venom-strike', name: '毒撃', element: 'venom',
    effect: { type: 'damage', power: 7, description: '毒撃' } },
  'poison-mist': { id: 'poison-mist', name: '毒霧', element: 'venom',
    effect: { type: 'dot', power: 4, duration: 3, description: '毒霧' } },
  'constrict': { id: 'constrict', name: '締め付け', element: 'venom',
    effect: { type: 'debuff', power: 0.6, duration: 2, description: '締め付け' } },
  'death-coil': { id: 'death-coil', name: '死の螺旋', element: 'venom',
    effect: { type: 'damage', power: 12, description: '死の螺旋' } },
  'toxic-cloud': { id: 'toxic-cloud', name: '毒雲', element: 'venom',
    effect: { type: 'dot', power: 5, duration: 3, description: '毒雲' } },
  'shed-skin': { id: 'shed-skin', name: '脱皮', element: 'venom',
    effect: { type: 'heal', power: 8, description: '脱皮で回復' } },
  // インフェルノドレイク
  'dragon-breath-v2': { id: 'dragon-breath-v2', name: '竜のブレス', element: 'blaze',
    effect: { type: 'damage', power: 15, description: '竜のブレス' } },
  'flame-claw-v2': { id: 'flame-claw-v2', name: '炎爪', element: 'blaze',
    effect: { type: 'damage', power: 12, description: '炎爪' } },
  'eruption-v2': { id: 'eruption-v2', name: '噴火', element: 'blaze',
    effect: { type: 'damage', power: 18, description: '噴火' } },
  'heat-wave-v2': { id: 'heat-wave-v2', name: '熱波', element: 'blaze',
    effect: { type: 'dot', power: 5, duration: 3, description: '熱波' } },
  'magma-shield-v2': { id: 'magma-shield-v2', name: 'マグマの盾', element: 'blaze',
    effect: { type: 'shield', power: 12, duration: 2, description: 'マグマの盾' } },
  'dragon-roar-v2': { id: 'dragon-roar-v2', name: '竜の咆哮', element: 'blaze',
    effect: { type: 'buff', power: 1.5, duration: 2, description: '竜の咆哮' } },
  'inferno-blast': { id: 'inferno-blast', name: '獄炎の爆発', element: 'blaze',
    effect: { type: 'damage', power: 20, description: '獄炎の爆発' } },
  'hellfire': { id: 'hellfire', name: '地獄の業火', element: 'blaze',
    effect: { type: 'damage', power: 16, description: '地獄の業火' } },

  // ==============================
  // 第2章: 氷結の峡谷
  // ==============================
  // フロストウルフ
  'ice-fang': { id: 'ice-fang', name: '氷牙', element: 'frost',
    effect: { type: 'damage', power: 6, description: '氷の牙で噛みつく' } },
  // ペンギン
  'slide': { id: 'slide', name: '滑走', element: 'frost',
    effect: { type: 'damage', power: 5, description: '氷上を滑って体当たり' } },
  // アイスゴーレム
  'frost-punch': { id: 'frost-punch', name: '凍拳', element: 'alloy',
    effect: { type: 'damage', power: 7, description: '凍った拳で殴る' } },
  'ice-wall': { id: 'ice-wall', name: '氷壁', element: 'alloy',
    effect: { type: 'shield', power: 8, duration: 2, description: '2T氷の壁' } },
  'frost-armor': { id: 'frost-armor', name: '凍鎧', element: 'alloy',
    effect: { type: 'buff', power: 1.3, duration: 2, description: '2T防御UP' } },
  // ユキオンナ
  'cold-breath': { id: 'cold-breath', name: '冷気', element: 'frost',
    effect: { type: 'damage', power: 7, description: '冷たい息を吹きかける' } },
  'snow-bind': { id: 'snow-bind', name: '雪縛り', element: 'frost',
    effect: { type: 'debuff', power: 0.5, duration: 1, description: '1T減速' } },
  'frost-kiss': { id: 'frost-kiss', name: '凍てつく口づけ', element: 'frost',
    effect: { type: 'dot', power: 4, duration: 2, description: '2T凍結' } },
  // ブリザードドレイク
  'frost-breath': { id: 'frost-breath', name: '氷竜のブレス', element: 'frost',
    effect: { type: 'damage', power: 10, description: '氷のブレス攻撃' } },
  'ice-claw': { id: 'ice-claw', name: '氷爪', element: 'frost',
    effect: { type: 'damage', power: 8, description: '氷の爪で切り裂く' } },
  'hail-storm': { id: 'hail-storm', name: '雹嵐', element: 'frost',
    effect: { type: 'damage', power: 12, description: '氷の礫の嵐' } },
  'glacial-roar': { id: 'glacial-roar', name: '氷河の咆哮', element: 'frost',
    effect: { type: 'buff', power: 1.4, duration: 2, description: '2T攻撃UP' } },
  'permafrost': { id: 'permafrost', name: '永久凍土', element: 'frost',
    effect: { type: 'debuff', power: 0.6, duration: 2, description: '2T防御DOWN' } },
  'frost-wing': { id: 'frost-wing', name: '氷翼', element: 'frost',
    effect: { type: 'buff', power: 1.2, duration: 1, description: '1T回避UP' } },
  // 氷龍
  'absolute-zero-breath': { id: 'absolute-zero-breath', name: '絶対零度ブレス', element: 'frost',
    effect: { type: 'damage', power: 16, description: '全てを凍らせるブレス' } },
  'ice-fang-dragon': { id: 'ice-fang-dragon', name: '氷龍の牙', element: 'frost',
    effect: { type: 'damage', power: 13, description: '氷龍の巨大な牙' } },
  'diamond-dust': { id: 'diamond-dust', name: 'ダイヤモンドダスト', element: 'frost',
    effect: { type: 'damage', power: 20, description: '極小の氷晶で切り刻む' } },
  'frost-domain': { id: 'frost-domain', name: '凍土領域', element: 'frost',
    effect: { type: 'shield', power: 12, duration: 2, description: '2T氷のシールド' } },
  'ice-dragon-roar': { id: 'ice-dragon-roar', name: '氷龍の咆哮', element: 'frost',
    effect: { type: 'buff', power: 1.5, duration: 2, description: '2T攻撃UP' } },
  'cocytus': { id: 'cocytus', name: 'コキュートス', element: 'frost',
    effect: { type: 'damage', power: 18, description: '極大氷ダメージ' } },

  // ==============================
  // 第3章: 雷鳴の塔
  // ==============================
  // スパーク
  'static-shock': { id: 'static-shock', name: '静電撃', element: 'volt',
    effect: { type: 'damage', power: 5, description: '静電気で攻撃' } },
  // デンキネズミ
  'thunder-tail': { id: 'thunder-tail', name: '雷尻尾', element: 'volt',
    effect: { type: 'damage', power: 6, description: '帯電した尻尾で叩く' } },
  // サンダーバード
  'thunder-wing': { id: 'thunder-wing', name: '雷翼', element: 'volt',
    effect: { type: 'damage', power: 8, description: '雷を纏った翼で打つ' } },
  'volt-dive': { id: 'volt-dive', name: '電撃急降下', element: 'volt',
    effect: { type: 'damage', power: 10, description: '帯電しながら急降下' } },
  'spark-feather': { id: 'spark-feather', name: '放電羽', element: 'volt',
    effect: { type: 'dot', power: 3, duration: 2, description: '2T感電' } },
  // ライトニングエレメンタル
  'ball-lightning': { id: 'ball-lightning', name: '球電', element: 'volt',
    effect: { type: 'damage', power: 8, description: '球状の雷で攻撃' } },
  'discharge': { id: 'discharge', name: '放電', element: 'volt',
    effect: { type: 'damage', power: 10, description: '周囲に放電する' } },
  'overcharge': { id: 'overcharge', name: '過充電', element: 'volt',
    effect: { type: 'buff', power: 1.4, duration: 1, description: '1T攻撃UP' } },
  // ストームウィザード
  'thunder-bolt': { id: 'thunder-bolt', name: '雷鳴弾', element: 'volt',
    effect: { type: 'damage', power: 10, description: '雷の弾丸を放つ' } },
  'chain-lightning': { id: 'chain-lightning', name: '連鎖落雷', element: 'volt',
    effect: { type: 'damage', power: 12, description: '連鎖する落雷' } },
  'magnetic-field': { id: 'magnetic-field', name: '磁場', element: 'volt',
    effect: { type: 'debuff', power: 0.6, duration: 2, description: '2T攻撃DOWN' } },
  'tempest': { id: 'tempest', name: '大嵐', element: 'volt',
    effect: { type: 'damage', power: 14, description: '暴風雷を巻き起こす' } },
  'volt-barrier': { id: 'volt-barrier', name: '雷結界', element: 'volt',
    effect: { type: 'shield', power: 10, duration: 2, description: '2T雷のシールド' } },
  'overclock': { id: 'overclock', name: '加速術', element: 'volt',
    effect: { type: 'buff', power: 1.3, duration: 2, description: '2T速度UP' } },
  // 雷龍
  'thunder-breath': { id: 'thunder-breath', name: '雷竜のブレス', element: 'volt',
    effect: { type: 'damage', power: 16, description: '全てを焼く雷のブレス' } },
  'lightning-claw': { id: 'lightning-claw', name: '雷爪', element: 'volt',
    effect: { type: 'damage', power: 13, description: '帯電した爪で切り裂く' } },
  'mjolnir': { id: 'mjolnir', name: 'ミョルニル', element: 'volt',
    effect: { type: 'damage', power: 20, description: '神雷の一撃' } },
  'thunder-domain': { id: 'thunder-domain', name: '雷域', element: 'volt',
    effect: { type: 'shield', power: 12, duration: 2, description: '2T雷のシールド' } },
  'thunder-dragon-roar': { id: 'thunder-dragon-roar', name: '雷龍の咆哮', element: 'volt',
    effect: { type: 'buff', power: 1.5, duration: 2, description: '2T攻撃UP' } },
  'ragnarok-bolt': { id: 'ragnarok-bolt', name: 'ラグナロク', element: 'volt',
    effect: { type: 'damage', power: 18, description: '極大雷ダメージ' } },
};
