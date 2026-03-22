import type {
  MonsterDice, BattleState, Combatant, DiceRollResult,
  SkillAction, TurnResult, Element, DiceFace, FixedFace, CustomFace,
  StatusEffect, TurnSelection, ChargeGauge,
} from '../../types';
import { ELEMENT_CHART, isFixedFace, SOCKET_TIER_MULTIPLIER, PIP_DECAY_RATE } from '../../types';
import { rollParty } from '../dice/DiceEngine';
import { FIXED_SKILLS, getSkillRune } from '../../data/skill-runes';
import { calcSameFaceSynergyMultiplier, checkAllSynergies, getFaceElements } from '../synergy/SynergyEngine';

// ==============================
// バトル初期化
// ==============================
function newChargeGauge(): ChargeGauge {
  return { current: 0 };
}

export function createBattleState(
  playerDice: MonsterDice[],
  enemyDice: MonsterDice[],
  playerMaxHp = 50,
  enemyMaxHp = 50
): BattleState {
  return {
    player: {
      hp: playerMaxHp, maxHp: playerMaxHp, dice: playerDice,
      statusEffects: [], damageMultiplier: 1.0, defenseMultiplier: 1.0,
      charge: newChargeGauge(),
    },
    enemy: {
      hp: enemyMaxHp, maxHp: enemyMaxHp, dice: enemyDice,
      statusEffects: [], damageMultiplier: 1.0, defenseMultiplier: 1.0,
      charge: newChargeGauge(),
    },
    turn: 0, maxTurns: 30, log: [], status: 'ongoing',
  };
}

// ==============================
// 同面スキル威力減衰
// ==============================
function calcDecayMultiplier(totalPips: number): number {
  return Math.max(0.1, 1 - (totalPips - 1) * PIP_DECAY_RATE);
}

// ==============================
// 面からスキルアクション生成
// ==============================
function getSkillsFromFace(
  face: DiceFace,
  targetElement: Element | null,
  targetIsPlayer: boolean,
): SkillAction[] {
  const actions: SkillAction[] = [];
  const { multiplier: synergyMult } = calcSameFaceSynergyMultiplier(face);

  if (isFixedFace(face)) {
    const fixed = face as FixedFace;
    const totalPips = fixed.sockets.length;
    const decayMult = calcDecayMultiplier(totalPips);
    const tierMult = SOCKET_TIER_MULTIPLIER['gold'];

    for (const socket of fixed.sockets) {
      const skill = FIXED_SKILLS[socket.skillId];
      if (!skill) continue;
      const elementMult = targetElement ? ELEMENT_CHART[socket.element][targetElement] : 1.0;
      const rawDmg = skill.effect.power;
      const finalDmg = Math.round(rawDmg * tierMult * decayMult * elementMult * synergyMult);

      actions.push({
        skillId: socket.skillId, skillName: skill.name, element: socket.element,
        effectType: skill.effect.type, rawDamage: rawDmg,
        elementMultiplier: elementMult, synergyMultiplier: synergyMult,
        finalDamage: finalDmg, targetIsPlayer,
      });
    }
  } else {
    const custom = face as CustomFace;
    const filledSockets = custom.sockets.filter(s => s.skillRuneId !== null);
    const totalPips = Math.max(1, filledSockets.length);
    const decayMult = calcDecayMultiplier(totalPips);

    let hasAnySkill = false;
    for (const socket of custom.sockets) {
      if (!socket.skillRuneId) continue;
      hasAnySkill = true;
      const rune = getSkillRune(socket.skillRuneId);
      if (!rune) continue;
      const tierMult = SOCKET_TIER_MULTIPLIER[socket.socketTier];
      const elementMult = targetElement ? ELEMENT_CHART[rune.element][targetElement] : 1.0;
      const rawDmg = rune.effect.power;
      const finalDmg = Math.round(rawDmg * tierMult * decayMult * elementMult * synergyMult);

      actions.push({
        skillId: rune.id, skillName: rune.name, element: rune.element,
        effectType: rune.effect.type, rawDamage: rawDmg,
        elementMultiplier: elementMult, synergyMultiplier: synergyMult,
        finalDamage: finalDmg, targetIsPlayer,
      });
    }

    // 空ソケットのみの面でも「素振り」で最低ダメージ
    if (!hasAnySkill) {
      actions.push({
        skillId: 'basic-hit', skillName: '素振り', element: 'alloy' as Element,
        effectType: 'damage', rawDamage: 2,
        elementMultiplier: 1.0, synergyMultiplier: 1.0,
        finalDamage: 2, targetIsPlayer,
      });
    }
  }
  return actions;
}

// ==============================
// スキルアクション適用
// ==============================
function applyActions(
  actions: SkillAction[], attacker: Combatant, defender: Combatant, crossDiceMult: number,
): void {
  for (const action of actions) {
    const damage = Math.round(action.finalDamage * attacker.damageMultiplier * crossDiceMult / defender.defenseMultiplier);
    switch (action.effectType) {
      case 'damage': defender.hp = Math.max(0, defender.hp - damage); break;
      case 'heal': attacker.hp = Math.min(attacker.maxHp, attacker.hp + action.rawDamage); break;
      case 'dot':
        defender.statusEffects.push({ type: 'poison', power: action.rawDamage, remainingTurns: 3, element: action.element });
        break;
      case 'buff': attacker.damageMultiplier *= action.rawDamage > 1 ? action.rawDamage : 1.3; break;
      case 'debuff': defender.damageMultiplier *= action.rawDamage < 1 ? action.rawDamage : 0.7; break;
      case 'shield':
        attacker.statusEffects.push({ type: 'shield', power: action.rawDamage, remainingTurns: 2, element: action.element });
        break;
    }
  }
}

// ==============================
// ステータス効果処理
// ==============================
function processStatusEffects(combatant: Combatant): void {
  const remaining: StatusEffect[] = [];
  for (const effect of combatant.statusEffects) {
    if (effect.type === 'poison' || effect.type === 'burn') {
      combatant.hp = Math.max(0, combatant.hp - effect.power);
    }
    effect.remainingTurns--;
    if (effect.remainingTurns > 0) remaining.push(effect);
  }
  combatant.statusEffects = remaining;
  combatant.damageMultiplier = Math.min(2.0, Math.max(0.3, combatant.damageMultiplier));
  combatant.defenseMultiplier = Math.min(2.0, Math.max(0.3, combatant.defenseMultiplier));
}

// ==============================
// クロスダイスシナジー（発動2個 + 充填1個の属性で属性一致判定）
// ==============================
function getCrossDiceMultiplier(
  activeRolls: DiceRollResult[],
  allRolls: DiceRollResult[], // 属性一致は3個全部見る
): number {
  if (activeRolls.length < 2) return 1.0;

  // 属性一致は全3個で判定
  const allElementSets = allRolls.map(r => new Set(getFaceElements(r.face)));
  const allElements: Element[] = ['blaze', 'frost', 'volt', 'venom', 'alloy', 'mirage'];

  for (const element of allElements) {
    if (allElementSets.every(set => set.has(element))) {
      if (element === 'blaze') return 3.0;
      if (element === 'volt') return 2.0;
    }
  }
  return 1.0;
}

// ==============================
// 充填処理 (just accumulates, no cap)
// ==============================
function processCharge(gauge: ChargeGauge, pips: number): ChargeGauge {
  return { current: gauge.current + pips };
}

// Consume charge cost for magic dice
export function consumeChargeCost(gauge: ChargeGauge, cost: number): ChargeGauge {
  return { current: Math.max(0, gauge.current - cost) };
}

// ==============================
// 敵AI選択ロジック
// ==============================
export function aiSelectDice(
  _dice: MonsterDice[],
  rolls: DiceRollResult[],
  _gauge: ChargeGauge,
  enemyHp: number,
): TurnSelection {
  const combos: [number, number, number][] = [[0, 1, 2], [0, 2, 1], [1, 2, 0]];
  let bestScore = -Infinity;
  let best = combos[0];

  for (const [a, b, c] of combos) {
    let score = 0;
    // 発動面のスキル数 × 出目で雑に威力見積もり
    score += rolls[a].faceNumber * 2;
    score += rolls[b].faceNumber * 2;
    // 充填価値
    const chargeVal = rolls[c].faceNumber;
    score += chargeVal * 0.5;
    // 瀕死なら火力優先
    if (enemyHp < 15) score -= chargeVal * 0.5;

    if (score > bestScore) { bestScore = score; best = [a, b, c]; }
  }
  return { activateIndices: [best[0], best[1]], chargeIndex: best[2] };
}

// ==============================
// ダイスロール（外部から呼べるよう公開）
// ==============================
export { rollParty };

// ==============================
// 先攻判定（発動2個の出目合計）
// ==============================
function determineFirst(
  playerRolls: DiceRollResult[], playerSel: TurnSelection,
  enemyRolls: DiceRollResult[], enemySel: TurnSelection,
): boolean {
  const pSum = playerSel.activateIndices.reduce((s, i) => s + playerRolls[i].faceNumber, 0);
  const eSum = enemySel.activateIndices.reduce((s, i) => s + enemyRolls[i].faceNumber, 0);
  if (pSum === eSum) return Math.random() < 0.5;
  return pSum > eSum;
}

export function executeTurnFull(
  state: BattleState,
  playerRolls: DiceRollResult[],
  enemyRolls: DiceRollResult[],
  playerSelection: TurnSelection,
  enemySelection: TurnSelection,
): TurnResult {
  state.turn++;
  const prePlayerHp = state.player.hp;
  const preEnemyHp = state.enemy.hp;

  // 先攻判定（発動2個の出目合計）
  const playerFirst = determineFirst(playerRolls, playerSelection, enemyRolls, enemySelection);

  // 発動するロールだけ抽出
  const playerActiveRolls = playerSelection.activateIndices.map(i => playerRolls[i]);
  const enemyActiveRolls = enemySelection.activateIndices.map(i => enemyRolls[i]);

  const enemyMainElement = state.enemy.dice[0]?.element || null;
  const playerMainElement = state.player.dice[0]?.element || null;

  // スキルアクション生成（発動2個のみ、チャージボーナスなし）
  const playerActions: SkillAction[] = [];
  for (const roll of playerActiveRolls) {
    playerActions.push(...getSkillsFromFace(roll.face, enemyMainElement, false));
  }
  const enemyActions: SkillAction[] = [];
  for (const roll of enemyActiveRolls) {
    enemyActions.push(...getSkillsFromFace(roll.face, playerMainElement, true));
  }

  // クロスダイスシナジー（属性一致は3個全部で判定）
  const playerCrossMult = getCrossDiceMultiplier(playerActiveRolls, playerRolls);
  const enemyCrossMult = getCrossDiceMultiplier(enemyActiveRolls, enemyRolls);

  // シナジー判定（発動2個のみ）
  const playerSynergies = checkAllSynergies(playerActiveRolls);
  const enemySynergies = checkAllSynergies(enemyActiveRolls);
  const allSynergies = [...playerSynergies, ...enemySynergies];

  // 先攻→後攻
  const firstActions = playerFirst ? playerActions : enemyActions;
  const secondActions = playerFirst ? enemyActions : playerActions;
  const firstAttacker = playerFirst ? state.player : state.enemy;
  const firstDefender = playerFirst ? state.enemy : state.player;
  const firstCrossMult = playerFirst ? playerCrossMult : enemyCrossMult;
  const secondCrossMult = playerFirst ? enemyCrossMult : playerCrossMult;

  applyActions(firstActions, firstAttacker, firstDefender, firstCrossMult);
  const midPlayerHp = state.player.hp;
  const midEnemyHp = state.enemy.hp;

  if (firstDefender.hp > 0) {
    applyActions(secondActions, firstDefender, firstAttacker, secondCrossMult);
  }

  // 充填処理（捨てたダイスの出目=ピップ数を加算）
  const playerChargedPips = playerRolls[playerSelection.chargeIndex].faceNumber;
  const enemyChargedPips = enemyRolls[enemySelection.chargeIndex].faceNumber;
  state.player.charge = processCharge(state.player.charge, playerChargedPips);
  state.enemy.charge = processCharge(state.enemy.charge, enemyChargedPips);

  // ステータス効果
  processStatusEffects(state.player);
  processStatusEffects(state.enemy);

  // 勝敗判定
  if (state.enemy.hp <= 0) state.status = 'player-win';
  else if (state.player.hp <= 0) state.status = 'enemy-win';
  else if (state.turn >= state.maxTurns) {
    state.status = state.player.hp >= state.enemy.hp ? 'player-win' : 'enemy-win';
  }

  const result: TurnResult = {
    turn: state.turn,
    playerRolls, enemyRolls,
    playerSelection, enemySelection,
    playerFirst,
    firstActions: playerFirst ? playerActions : enemyActions,
    secondActions: playerFirst ? enemyActions : playerActions,
    prePlayerHp, preEnemyHp, midPlayerHp, midEnemyHp,
    playerHp: state.player.hp, enemyHp: state.enemy.hp,
    playerCharge: { ...state.player.charge },
    enemyCharge: { ...state.enemy.charge },
    synergies: allSynergies,
  };

  state.log.push(result);
  return result;
}

// 後方互換: 旧executeTurn（AI自動選択で3個中2個選ぶ）
export function executeTurn(state: BattleState): TurnResult {
  const playerRolls = rollParty(state.player.dice);
  const enemyRolls = rollParty(state.enemy.dice);
  // AI選択（プレイヤー側もAI自動 — シミュレーション用）
  const pSel = aiSelectDice(state.player.dice, playerRolls, state.player.charge, state.player.hp);
  const eSel = aiSelectDice(state.enemy.dice, enemyRolls, state.enemy.charge, state.enemy.hp);
  return executeTurnFull(state, playerRolls, enemyRolls, pSel, eSel);
}
