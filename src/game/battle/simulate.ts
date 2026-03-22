/**
 * コンソールでバトルシミュレーションを実行するテストスクリプト
 * 実行: npx tsx src/game/battle/simulate.ts
 */
import { CHAPTER1_MONSTERS } from '../../data/monsters';
import { createBattleState, executeTurn } from './BattleEngine';
import { ELEMENT_NAMES } from '../../types';

function simulate() {
  console.log('=== ピップソケット・クロニクル バトルシミュレーション ===\n');

  // プレイヤーパーティ: スライム、サラマンダー、ゴブリン
  const playerDice = [
    CHAPTER1_MONSTERS.find(m => m.id === 'slime')!,
    CHAPTER1_MONSTERS.find(m => m.id === 'salamander')!,
    CHAPTER1_MONSTERS.find(m => m.id === 'goblin')!,
  ];

  // 敵パーティ: スケルトン、ハーピー、コウモリ
  const enemyDice = [
    CHAPTER1_MONSTERS.find(m => m.id === 'skeleton')!,
    CHAPTER1_MONSTERS.find(m => m.id === 'harpy')!,
    CHAPTER1_MONSTERS.find(m => m.id === 'bat')!,
  ];

  console.log('【プレイヤーパーティ】');
  for (const d of playerDice) {
    console.log(`  ${d.name} (★${d.rarity} ${ELEMENT_NAMES[d.element]})`);
  }
  console.log('\n【エネミーパーティ】');
  for (const d of enemyDice) {
    console.log(`  ${d.name} (★${d.rarity} ${ELEMENT_NAMES[d.element]})`);
  }
  console.log('');

  const state = createBattleState(playerDice, enemyDice, 50, 50);

  while (state.status === 'ongoing') {
    const result = executeTurn(state);

    console.log(`--- ターン ${result.turn} ---`);
    console.log(`  プレイヤー出目: [${result.playerRolls.map(r => r.faceNumber).join(', ')}] 合計=${result.playerRolls.reduce((s, r) => s + r.faceNumber, 0)}`);
    console.log(`  エネミー出目:   [${result.enemyRolls.map(r => r.faceNumber).join(', ')}] 合計=${result.enemyRolls.reduce((s, r) => s + r.faceNumber, 0)}`);
    console.log(`  先攻: ${result.playerFirst ? 'プレイヤー' : 'エネミー'}`);

    if (result.firstActions.length > 0) {
      console.log(`  先攻スキル:`);
      for (const a of result.firstActions) {
        console.log(`    ${a.skillName}(${ELEMENT_NAMES[a.element]}) → ${a.effectType === 'damage' ? `${a.finalDamage}ダメージ` : a.effectType} [属性×${a.elementMultiplier} シナジー×${a.synergyMultiplier}]`);
      }
    }

    if (result.secondActions.length > 0) {
      console.log(`  後攻スキル:`);
      for (const a of result.secondActions) {
        console.log(`    ${a.skillName}(${ELEMENT_NAMES[a.element]}) → ${a.effectType === 'damage' ? `${a.finalDamage}ダメージ` : a.effectType} [属性×${a.elementMultiplier} シナジー×${a.synergyMultiplier}]`);
      }
    }

    if (result.synergies.length > 0) {
      console.log(`  シナジー発動:`);
      for (const s of result.synergies) {
        console.log(`    [${s.type}] ${s.name}: ${s.description}`);
      }
    }

    console.log(`  HP: プレイヤー ${result.playerHp}/50 | エネミー ${result.enemyHp}/50`);
    console.log('');
  }

  console.log('=== バトル終了 ===');
  console.log(`結果: ${state.status === 'player-win' ? 'プレイヤー勝利!' : state.status === 'enemy-win' ? 'エネミー勝利...' : '引き分け'}`);
  console.log(`ターン数: ${state.turn}`);
  console.log(`最終HP: プレイヤー ${state.player.hp}/${state.player.maxHp} | エネミー ${state.enemy.hp}/${state.enemy.maxHp}`);
}

simulate();
