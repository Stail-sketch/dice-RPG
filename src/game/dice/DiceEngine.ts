import { DICE_PROBABILITY, type MonsterDice, type DiceRollResult, getAllFaces } from '../../types';

/**
 * 重み付き確率テーブルでダイスの出目を決定する
 */
export function rollDice(): number {
  const rand = Math.random();
  let cumulative = 0;
  for (let face = 1; face <= 6; face++) {
    cumulative += DICE_PROBABILITY[face];
    if (rand < cumulative) return face;
  }
  return 6; // fallback
}

/**
 * モンスターダイス1個を振り、出た面の情報を返す
 */
export function rollMonsterDice(dice: MonsterDice, diceIndex: number): DiceRollResult {
  const faceNumber = rollDice();
  const faces = getAllFaces(dice);
  const face = faces[faceNumber - 1];
  return { diceIndex, faceNumber, face };
}

/**
 * 指定された出目でモンスターダイス1個の結果を生成する
 */
export function rollMonsterDiceFixed(dice: MonsterDice, diceIndex: number, faceNumber: number): DiceRollResult {
  const faces = getAllFaces(dice);
  const face = faces[faceNumber - 1];
  return { diceIndex, faceNumber, face };
}

/**
 * 3個のモンスターダイスを同時に振る
 */
export function rollParty(party: MonsterDice[]): DiceRollResult[] {
  return party.map((dice, index) => rollMonsterDice(dice, index));
}

/**
 * 固定出目で3個のモンスターダイスの結果を生成する
 */
export function rollPartyFixed(party: MonsterDice[], faceNumbers: number[]): DiceRollResult[] {
  return party.map((dice, index) => rollMonsterDiceFixed(dice, index, faceNumbers[index]));
}

/**
 * 出目合計を計算（先攻判定用）
 */
export function sumRolls(rolls: DiceRollResult[]): number {
  return rolls.reduce((sum, r) => sum + r.faceNumber, 0);
}

/**
 * 先攻判定: 出目合計が大きい方が先攻、同じならランダム
 */
export function determineFirstAttacker(
  playerRolls: DiceRollResult[],
  enemyRolls: DiceRollResult[]
): boolean {
  const playerSum = sumRolls(playerRolls);
  const enemySum = sumRolls(enemyRolls);
  if (playerSum === enemySum) return Math.random() < 0.5;
  return playerSum > enemySum;
}
