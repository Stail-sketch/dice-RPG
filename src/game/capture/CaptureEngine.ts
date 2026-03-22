import type { MonsterDice } from '../../types';
import { rollDice } from '../dice/DiceEngine';

export interface CaptureResult {
  success: boolean;
  roll: number;
  captureRate: number;
  effectiveRate: number;
}

/**
 * 捕獲判定
 * 封印のダイスを振り、出目 × 捕獲率 で判定
 */
export function attemptCapture(
  monster: MonsterDice,
  bonusRate = 0 // 香水等のボーナス (%)
): CaptureResult {
  const roll = rollDice();
  const captureRate = monster.baseStats.captureRate + bonusRate;
  // 出目が高いほど成功しやすい (出目/6 を乗算)
  const effectiveRate = Math.min(100, captureRate * (roll / 3));
  const success = Math.random() * 100 < effectiveRate;

  return { success, roll, captureRate, effectiveRate };
}
