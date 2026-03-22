import type { DiceFace, FixedFace, CustomFace, MonsterDice } from '../types';
import { isFixedFace, getAllFaces } from '../types';
import { getSkillRune } from '../data/skill-runes';
import { ELEMENT_COLORS } from '../components/common/ElementBadge';

/**
 * 面からピップの色配列を生成する
 * - 固有面: 各ソケットのスキル属性色
 * - カスタム面: 装備中ルーンの属性色、空きはnull
 */
export function getPipColorsForFace(face: DiceFace): (string | null)[] {
  if (isFixedFace(face)) {
    const fixed = face as FixedFace;
    return fixed.sockets.map(s => ELEMENT_COLORS[s.element]);
  }

  const custom = face as CustomFace;
  return custom.sockets.map(s => {
    if (!s.skillRuneId) return null;
    const rune = getSkillRune(s.skillRuneId);
    return rune ? ELEMENT_COLORS[rune.element] : null;
  });
}

/**
 * ダイスの特定面番号のピップ色を取得
 */
export function getPipColorsForDiceFace(dice: MonsterDice, faceNumber: number): (string | null)[] {
  const faces = getAllFaces(dice);
  const face = faces[faceNumber - 1];
  if (!face) return [];
  return getPipColorsForFace(face);
}
