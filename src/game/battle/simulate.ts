/**
 * ダメージ計算検証シミュレーション
 * 実行: npx tsx src/game/battle/simulate.ts
 */
import { ALL_MONSTERS } from '../../data/monsters';
import { createBattleState, executeTurn } from './BattleEngine';
import { ELEMENT_NAMES } from '../../types';
import type { SkillAction, TurnResult } from '../../types';

function verifyAction(a: SkillAction, label: string): string[] {
  const errors: string[] = [];

  // finalDamage = raw × tier × decay × element × synergy
  const expectedFinal = Math.round(a.rawDamage * a.tierMultiplier * a.decayMultiplier * a.elementMultiplier * a.synergyMultiplier);
  if (a.effectType === 'damage' && a.finalDamage !== expectedFinal) {
    errors.push(`[${label}] ${a.skillName}: finalDamage不一致 期待=${expectedFinal} 実際=${a.finalDamage} (raw=${a.rawDamage} tier=${a.tierMultiplier} decay=${a.decayMultiplier} elem=${a.elementMultiplier} syn=${a.synergyMultiplier})`);
  }

  // actualDamage = finalDamage × crossDice × buffMult
  if (a.effectType === 'damage') {
    const expectedActual = Math.round(a.finalDamage * a.crossDiceMultiplier * a.buffMultiplier);
    if (a.actualDamage !== expectedActual) {
      errors.push(`[${label}] ${a.skillName}: actualDamage不一致 期待=${expectedActual} 実際=${a.actualDamage} (final=${a.finalDamage} cross=${a.crossDiceMultiplier} buff=${a.buffMultiplier})`);
    }
  }

  // 倍率の妥当性チェック
  if (a.tierMultiplier !== 0.6 && a.tierMultiplier !== 1.0 && a.tierMultiplier !== 1.5) {
    errors.push(`[${label}] ${a.skillName}: 不正なtierMultiplier=${a.tierMultiplier}`);
  }
  if (a.elementMultiplier !== 0.5 && a.elementMultiplier !== 1.0 && a.elementMultiplier !== 1.5) {
    errors.push(`[${label}] ${a.skillName}: 不正なelementMultiplier=${a.elementMultiplier}`);
  }
  if (a.decayMultiplier < 0.1 || a.decayMultiplier > 1.0) {
    errors.push(`[${label}] ${a.skillName}: decayMultiplier範囲外=${a.decayMultiplier}`);
  }

  return errors;
}

function verifyTurn(result: TurnResult): string[] {
  const errors: string[] = [];

  // 各アクションの計算検証
  for (const a of result.firstActions) {
    errors.push(...verifyAction(a, `T${result.turn} 先攻`));
  }
  for (const a of result.secondActions) {
    errors.push(...verifyAction(a, `T${result.turn} 後攻`));
  }

  // HP変動の整合性チェック
  const allActions = [...result.firstActions, ...result.secondActions];
  const playerDmgReceived = allActions
    .filter(a => a.targetIsPlayer && a.effectType === 'damage')
    .reduce((s, a) => s + a.actualDamage, 0);
  const enemyDmgReceived = allActions
    .filter(a => !a.targetIsPlayer && a.effectType === 'damage')
    .reduce((s, a) => s + a.actualDamage, 0);
  const playerHealReceived = allActions
    .filter(a => !a.targetIsPlayer && a.effectType === 'heal')
    .reduce((s, a) => s + a.actualDamage, 0);
  const enemyHealReceived = allActions
    .filter(a => a.targetIsPlayer && a.effectType === 'heal')
    .reduce((s, a) => s + a.actualDamage, 0);

  // midHP = pre + first攻撃の結果
  // finalHP = mid + second攻撃 + statusEffects

  // 全体的なHP変動チェック（DoT込み）
  // HPは0にclampされるのでoverkillがあると一致しない場合がある
  // ただし最終HPが期待値より大きい場合はバグ
  if (result.playerHp > result.prePlayerHp + playerHealReceived) {
    errors.push(`[T${result.turn}] プレイヤーHP増加異常: ${result.prePlayerHp}→${result.playerHp} (heal=${playerHealReceived})`);
  }
  if (result.enemyHp > result.preEnemyHp + enemyHealReceived) {
    errors.push(`[T${result.turn}] エネミーHP増加異常: ${result.preEnemyHp}→${result.enemyHp} (heal=${enemyHealReceived})`);
  }

  return errors;
}

function runSimulation(name: string, playerIds: string[], enemyIds: string[], turns = 10) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`シミュレーション: ${name}`);
  console.log(`${'='.repeat(60)}`);

  const playerDice = playerIds.map(id => ALL_MONSTERS.find(m => m.id === id)!);
  const enemyDice = enemyIds.map(id => ALL_MONSTERS.find(m => m.id === id)!);

  console.log(`プレイヤー: ${playerDice.map(d => `${d.name}(★${d.rarity}${ELEMENT_NAMES[d.element]})`).join(', ')}`);
  console.log(`エネミー:   ${enemyDice.map(d => `${d.name}(★${d.rarity}${ELEMENT_NAMES[d.element]})`).join(', ')}`);

  const state = createBattleState(playerDice, enemyDice, 60, 80);
  let totalErrors: string[] = [];
  let turnCount = 0;

  while (state.status === 'ongoing' && turnCount < turns) {
    const result = executeTurn(state);
    turnCount++;

    console.log(`\n--- ターン ${result.turn} ---`);
    console.log(`  出目: [${result.playerRolls.map(r => r.faceNumber).join(',')}] vs [${result.enemyRolls.map(r => r.faceNumber).join(',')}]`);
    console.log(`  先攻: ${result.playerFirst ? 'プレイヤー' : 'エネミー'}`);

    // 先攻スキル
    if (result.firstActions.length > 0) {
      console.log(`  【先攻】`);
      for (const a of result.firstActions) {
        if (a.effectType === 'damage') {
          console.log(`    ${a.skillName}(${ELEMENT_NAMES[a.element]}): raw=${a.rawDamage} ×T${a.tierMultiplier} ×D${a.decayMultiplier.toFixed(1)} ×E${a.elementMultiplier} ×S${a.synergyMultiplier} =final${a.finalDamage} ×C${a.crossDiceMultiplier} ×B${a.buffMultiplier.toFixed(1)} =actual${a.actualDamage}`);
        } else {
          console.log(`    ${a.skillName}(${ELEMENT_NAMES[a.element]}): ${a.effectType} actual=${a.actualDamage}`);
        }
      }
    }

    // 後攻スキル
    if (result.secondActions.length > 0) {
      console.log(`  【後攻】`);
      for (const a of result.secondActions) {
        if (a.effectType === 'damage') {
          console.log(`    ${a.skillName}(${ELEMENT_NAMES[a.element]}): raw=${a.rawDamage} ×T${a.tierMultiplier} ×D${a.decayMultiplier.toFixed(1)} ×E${a.elementMultiplier} ×S${a.synergyMultiplier} =final${a.finalDamage} ×C${a.crossDiceMultiplier} ×B${a.buffMultiplier.toFixed(1)} =actual${a.actualDamage}`);
        } else {
          console.log(`    ${a.skillName}(${ELEMENT_NAMES[a.element]}): ${a.effectType} actual=${a.actualDamage}`);
        }
      }
    }

    // シナジー
    if (result.synergies.length > 0) {
      for (const s of result.synergies) console.log(`  ★ ${s.name}`);
    }

    // HP
    console.log(`  HP: ${result.prePlayerHp}→${result.playerHp} vs ${result.preEnemyHp}→${result.enemyHp}`);
    if (result.playerStatusDmg > 0) console.log(`  DoT自分: ${result.playerStatusDmg}`);
    if (result.enemyStatusDmg > 0) console.log(`  DoT敵: ${result.enemyStatusDmg}`);
    console.log(`  倍率: 自分x${result.playerDmgMult.toFixed(2)} 敵x${result.enemyDmgMult.toFixed(2)}`);

    // 検証
    const errors = verifyTurn(result);
    if (errors.length > 0) {
      console.log(`  *** エラー検出 ***`);
      for (const e of errors) console.log(`    ${e}`);
    }
    totalErrors.push(...errors);
  }

  console.log(`\n結果: ${state.status} (${state.turn}ターン)`);
  console.log(`最終HP: ${state.player.hp}/${state.player.maxHp} vs ${state.enemy.hp}/${state.enemy.maxHp}`);

  if (totalErrors.length === 0) {
    console.log(`✓ 計算エラーなし`);
  } else {
    console.log(`✗ ${totalErrors.length}件のエラー`);
  }

  return totalErrors;
}

// 複数パターンでテスト
const allErrors: string[] = [];

// テスト1: 基本（属性相性あり）
allErrors.push(...runSimulation(
  '基本バトル（属性相性テスト）',
  ['pyrachnid', 'salamander-v2', 'goblin-knight'],
  ['rot-beetle', 'hollow', 'frost-jelly'],
));

// テスト2: 同属性パーティ（クロスダイスシナジーテスト）
allErrors.push(...runSimulation(
  '雷統一パーティ（クロスダイステスト）',
  ['volt-wisp', 'volt-wisp', 'volt-wisp'],
  ['frost-jelly', 'frost-jelly', 'frost-jelly'],
));

// テスト3: 高レアvs低レア
allErrors.push(...runSimulation(
  '★4 vs ★1（tier/decayテスト）',
  ['inferno-drake', 'inferno-drake', 'inferno-drake'],
  ['frost-jelly', 'frost-jelly', 'frost-jelly'],
));

// テスト4: DoT/バフ/デバフ重視
allErrors.push(...runSimulation(
  'デバフ/DoTテスト',
  ['shadow-serpent', 'shadow-serpent', 'shadow-serpent'],
  ['goblin-knight', 'goblin-knight', 'goblin-knight'],
));

console.log(`\n${'='.repeat(60)}`);
console.log(`全テスト完了: ${allErrors.length === 0 ? '✓ 全パス' : `✗ ${allErrors.length}件のエラー`}`);
if (allErrors.length > 0) {
  console.log('\nエラー一覧:');
  for (const e of allErrors) console.log(`  ${e}`);
}
