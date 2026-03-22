import type { Element, RecipeSynergy, CrossDiceSynergy } from '../types';

// クロスダイスシナジー（3ダイス全てで同属性面が出た場合）
export const CROSS_DICE_SYNERGIES: CrossDiceSynergy[] = [
  { element: 'blaze', name: '業火',
    effect: { type: 'damage', power: 0, description: '全ダメージ3倍' },
    description: '3ダイス全て炎→全ダメージ3倍' },
  { element: 'frost', name: '絶対零度',
    effect: { type: 'debuff', power: 0, duration: 1, description: '敵1ターン行動不能' },
    description: '3ダイス全て氷→敵1ターン行動不能' },
  { element: 'volt', name: '神雷',
    effect: { type: 'damage', power: 0, description: '全スキルダメージ2倍' },
    description: '3ダイス全て雷→全スキルダメージ2倍' },
  { element: 'venom', name: '猛毒沼',
    effect: { type: 'dot', power: 20, duration: 99, description: '毎ターン最大HP20%侵食' },
    description: '3ダイス全て毒→毎ターンHP20%侵食' },
  { element: 'alloy', name: '絶対防御',
    effect: { type: 'shield', power: 9999, duration: 1, description: 'このターン全ダメージ無効' },
    description: '3ダイス全て鋼→このターン全ダメージ無効' },
  { element: 'mirage', name: '万華鏡',
    effect: { type: 'damage', power: 0, description: '敵の出た面を全コピーして追加発動' },
    description: '3ダイス全て幻→敵スキルをコピー' },
];

// レシピコンボ（異なるダイスから出たスキルの属性組み合わせ）
export const RECIPE_SYNERGIES: RecipeSynergy[] = [
  { id: 'steam-explosion', name: '蒸気爆発', requiredElements: ['blaze', 'frost'],
    effect: { type: 'damage', power: 20, description: '全体ダメージ+命中率DOWN' },
    description: '炎+氷→蒸気爆発' },
  { id: 'toxic-smoke', name: '毒煙', requiredElements: ['blaze', 'venom'],
    effect: { type: 'damage', power: 15, description: '範囲ダメージ+毒付与' },
    description: '炎+毒→毒煙' },
  { id: 'ice-thunder', name: '氷雷', requiredElements: ['frost', 'volt'],
    effect: { type: 'damage', power: 25, description: '凍結敵に確定クリティカル' },
    description: '氷+雷→氷雷' },
  { id: 'frozen-venom', name: '凍毒', requiredElements: ['frost', 'venom'],
    effect: { type: 'dot', power: 12, duration: 3, description: '解凍時毒3倍' },
    description: '氷+毒→凍毒' },
  { id: 'thunder-phantom', name: '雷幻', requiredElements: ['volt', 'mirage'],
    effect: { type: 'damage', power: 22, description: '回避不能の一撃' },
    description: '雷+幻→雷幻' },
  { id: 'thunder-fire', name: '雷火', requiredElements: ['volt', 'blaze'],
    effect: { type: 'damage', power: 18, description: '爆発連鎖' },
    description: '雷+炎→雷火' },
  { id: 'phantom-venom', name: '幻毒', requiredElements: ['mirage', 'venom'],
    effect: { type: 'debuff', power: 0.5, duration: 2, description: '敵が自傷する混乱付与' },
    description: '幻+毒→幻毒' },
  { id: 'ice-steel-wall', name: '氷鋼壁', requiredElements: ['alloy', 'frost'],
    effect: { type: 'shield', power: 20, duration: 2, description: '防御大幅UP+反射' },
    description: '鋼+氷→氷鋼壁' },
  { id: 'magnetism', name: '磁力', requiredElements: ['alloy', 'volt'],
    effect: { type: 'debuff', power: 0.3, duration: 1, description: '敵スキルルーン1T封印' },
    description: '鋼+雷→磁力' },
  { id: 'phantom-armor', name: '幻影鎧', requiredElements: ['mirage', 'alloy'],
    effect: { type: 'shield', power: 15, duration: 1, description: '次の攻撃を幻影が受ける' },
    description: '幻+鋼→幻影鎧' },
];

export function getCrossDiceSynergy(element: Element): CrossDiceSynergy | undefined {
  return CROSS_DICE_SYNERGIES.find(s => s.element === element);
}

export function getRecipeSynergy(elements: Element[]): RecipeSynergy[] {
  const elementSet = new Set(elements);
  return RECIPE_SYNERGIES.filter(s =>
    s.requiredElements.every(e => elementSet.has(e))
  );
}
