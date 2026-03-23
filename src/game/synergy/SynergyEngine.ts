import type { Element, DiceRollResult, DiceFace, FixedFace, CustomFace, SynergyActivation } from '../../types';
import { isFixedFace } from '../../types';
import { getSkillRune } from '../../data/skill-runes';
import { getCrossDiceSynergy, getRecipeSynergy } from '../../data/synergies';

/**
 * 面からスキルの属性リストを取得
 */
export function getFaceElements(face: DiceFace): Element[] {
  if (isFixedFace(face)) {
    return (face as FixedFace).sockets.map(s => s.element);
  }
  const custom = face as CustomFace;
  return custom.sockets
    .filter(s => s.skillRuneId !== null)
    .map(s => {
      const rune = getSkillRune(s.skillRuneId!);
      return rune ? rune.element : null;
    })
    .filter((e): e is Element => e !== null);
}

/**
 * 同面シナジー判定: 同一面に同属性スキルが複数ある場合のボーナス倍率
 */
export function calcSameFaceSynergyMultiplier(face: DiceFace): { multiplier: number; element: Element | null } {
  const elements = getFaceElements(face);
  if (elements.length < 2) return { multiplier: 1.0, element: null };

  // 各属性の出現数をカウント
  const counts = new Map<Element, number>();
  for (const el of elements) {
    counts.set(el, (counts.get(el) || 0) + 1);
  }

  // 最も多い同属性を見つける
  let maxCount = 0;
  let maxElement: Element | null = null;
  for (const [el, count] of counts) {
    if (count > maxCount) {
      maxCount = count;
      maxElement = el;
    }
  }

  if (maxCount >= 3) return { multiplier: 1.8, element: maxElement };
  if (maxCount >= 2) return { multiplier: 1.3, element: maxElement };
  return { multiplier: 1.0, element: null };
}

/**
 * クロスダイスシナジー判定: 3ダイス全てで同属性が出ているか
 */
export function checkCrossDiceSynergy(rolls: DiceRollResult[]): SynergyActivation[] {
  if (rolls.length < 3) return [];

  // 各ダイスの出た面の属性セットを取得
  const elementSets = rolls.map(r => new Set(getFaceElements(r.face)));

  // 全6属性をチェック
  const allElements: Element[] = ['blaze', 'frost', 'volt', 'venom', 'alloy', 'mirage'];
  const activations: SynergyActivation[] = [];

  for (const element of allElements) {
    // 3ダイス全てにこの属性がある？
    if (elementSets.every(set => set.has(element))) {
      const synergy = getCrossDiceSynergy(element);
      if (synergy) {
        activations.push({
          type: 'cross-dice',
          name: synergy.name,
          description: synergy.description,
        });
      }
    }
  }

  return activations;
}

/**
 * レシピコンボ判定: 異なるダイスから出た属性の組み合わせ
 */
export function checkRecipeSynergies(rolls: DiceRollResult[]): SynergyActivation[] {
  // 全ダイスの出た面の属性を集約
  const allElements = new Set<Element>();
  for (const roll of rolls) {
    for (const el of getFaceElements(roll.face)) {
      allElements.add(el);
    }
  }

  const recipes = getRecipeSynergy(Array.from(allElements));
  return recipes.map(r => ({
    type: 'recipe' as const,
    name: r.name,
    description: r.description,
  }));
}

/**
 * 全シナジーをまとめて判定
 * @param activeRolls 発動する2個のロール（同面+レシピ判定用）
 * @param allRolls 全3個のロール（クロスダイス判定用、省略時はactiveRollsを使用）
 */
export function checkAllSynergies(activeRolls: DiceRollResult[], allRolls?: DiceRollResult[]): SynergyActivation[] {
  const synergies: SynergyActivation[] = [];

  // 同面シナジー（発動2個のみ）
  for (const roll of activeRolls) {
    const { multiplier, element } = calcSameFaceSynergyMultiplier(roll.face);
    if (multiplier > 1.0 && element) {
      synergies.push({
        type: 'same-face',
        name: `同面シナジー(${element})`,
        description: `${roll.faceNumber}の面で${element}属性×${multiplier}`,
      });
    }
  }

  // クロスダイスシナジー（全3個で判定）
  synergies.push(...checkCrossDiceSynergy(allRolls || activeRolls));

  // レシピコンボ（発動2個のみ）
  synergies.push(...checkRecipeSynergies(activeRolls));

  return synergies;
}
