import type {
  MonsterDice, BattleState, Combatant, DiceRollResult,
  SkillAction, TurnResult, Element, DiceFace, FixedFace, CustomFace,
  StatusEffect,
} from '../../types';
import { ELEMENT_CHART, isFixedFace, SOCKET_TIER_MULTIPLIER, PIP_DECAY_RATE } from '../../types';
import { rollParty, determineFirstAttacker } from '../dice/DiceEngine';
import { FIXED_SKILLS, getSkillRune } from '../../data/skill-runes';
import { calcSameFaceSynergyMultiplier, checkAllSynergies, getFaceElements } from '../synergy/SynergyEngine';

// ==============================
// バトル初期化
// ==============================
export function createBattleState(
  playerDice: MonsterDice[],
  enemyDice: MonsterDice[],
  playerMaxHp = 50,
  enemyMaxHp = 50
): BattleState {
  return {
    player: {
      hp: playerMaxHp,
      maxHp: playerMaxHp,
      dice: playerDice,
      statusEffects: [],
      damageMultiplier: 1.0,
      defenseMultiplier: 1.0,
    },
    enemy: {
      hp: enemyMaxHp,
      maxHp: enemyMaxHp,
      dice: enemyDice,
      statusEffects: [],
      damageMultiplier: 1.0,
      defenseMultiplier: 1.0,
    },
    turn: 0,
    maxTurns: 30,
    log: [],
    status: 'ongoing',
  };
}

// ==============================
// 同面スキル威力減衰を計算
// ==============================
function calcDecayMultiplier(totalPipsOnFace: number): number {
  return Math.max(0.1, 1 - (totalPipsOnFace - 1) * PIP_DECAY_RATE);
}

// ==============================
// 面からスキルアクションを生成
// ==============================
function getSkillsFromFace(
  face: DiceFace,
  targetElement: Element | null,
  targetIsPlayer: boolean
): SkillAction[] {
  const actions: SkillAction[] = [];
  const { multiplier: synergyMult } = calcSameFaceSynergyMultiplier(face);

  if (isFixedFace(face)) {
    const fixed = face as FixedFace;
    const totalPips = fixed.sockets.length;
    const decayMult = calcDecayMultiplier(totalPips);
    // 固有面はgold品質相当
    const tierMult = SOCKET_TIER_MULTIPLIER['gold'];

    for (const socket of fixed.sockets) {
      const skill = FIXED_SKILLS[socket.skillId];
      if (!skill) continue;
      const elementMult = targetElement ? ELEMENT_CHART[socket.element][targetElement] : 1.0;
      const rawDmg = skill.effect.power;
      const finalDmg = Math.round(rawDmg * tierMult * decayMult * elementMult * synergyMult);

      actions.push({
        skillId: socket.skillId,
        skillName: skill.name,
        element: socket.element,
        effectType: skill.effect.type,
        rawDamage: rawDmg,
        elementMultiplier: elementMult,
        synergyMultiplier: synergyMult,
        finalDamage: finalDmg,
        targetIsPlayer,
      });
    }
  } else {
    const custom = face as CustomFace;
    const filledSockets = custom.sockets.filter(s => s.skillRuneId !== null);
    const totalPips = filledSockets.length;
    const decayMult = calcDecayMultiplier(totalPips);

    for (const socket of custom.sockets) {
      if (!socket.skillRuneId) continue;
      const rune = getSkillRune(socket.skillRuneId);
      if (!rune) continue;
      const tierMult = SOCKET_TIER_MULTIPLIER[socket.socketTier];
      const elementMult = targetElement ? ELEMENT_CHART[rune.element][targetElement] : 1.0;
      const rawDmg = rune.effect.power;
      const finalDmg = Math.round(rawDmg * tierMult * decayMult * elementMult * synergyMult);

      actions.push({
        skillId: rune.id,
        skillName: rune.name,
        element: rune.element,
        effectType: rune.effect.type,
        rawDamage: rawDmg,
        elementMultiplier: elementMult,
        synergyMultiplier: synergyMult,
        finalDamage: finalDmg,
        targetIsPlayer,
      });
    }
  }

  return actions;
}

// ==============================
// スキルアクション適用
// ==============================
function applyActions(
  actions: SkillAction[],
  attacker: Combatant,
  defender: Combatant,
  crossDiceMult: number
): void {
  for (const action of actions) {
    const damage = Math.round(action.finalDamage * attacker.damageMultiplier * crossDiceMult / defender.defenseMultiplier);

    switch (action.effectType) {
      case 'damage':
        defender.hp = Math.max(0, defender.hp - damage);
        break;
      case 'heal':
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + action.rawDamage);
        break;
      case 'dot': {
        defender.statusEffects.push({
          type: 'poison',
          power: action.rawDamage,
          remainingTurns: 3,
          element: action.element,
        });
        break;
      }
      case 'buff':
        attacker.damageMultiplier *= action.rawDamage > 1 ? action.rawDamage : 1.3;
        break;
      case 'debuff':
        defender.damageMultiplier *= action.rawDamage < 1 ? action.rawDamage : 0.7;
        break;
      case 'shield':
        attacker.statusEffects.push({
          type: 'shield',
          power: action.rawDamage,
          remainingTurns: 2,
          element: action.element,
        });
        break;
    }
  }
}

// ==============================
// ステータス効果の処理
// ==============================
function processStatusEffects(combatant: Combatant): void {
  const remaining: StatusEffect[] = [];
  for (const effect of combatant.statusEffects) {
    if (effect.type === 'poison' || effect.type === 'burn') {
      combatant.hp = Math.max(0, combatant.hp - effect.power);
    }
    effect.remainingTurns--;
    if (effect.remainingTurns > 0) {
      remaining.push(effect);
    }
  }
  combatant.statusEffects = remaining;

  // バフ/デバフリセット（毎ターン徐々に戻す）
  combatant.damageMultiplier = Math.min(2.0, Math.max(0.3, combatant.damageMultiplier));
  combatant.defenseMultiplier = Math.min(2.0, Math.max(0.3, combatant.defenseMultiplier));
}

// ==============================
// クロスダイスシナジーの倍率取得
// ==============================
function getCrossDiceMultiplier(rolls: DiceRollResult[]): number {
  if (rolls.length < 3) return 1.0;

  const elementSets = rolls.map(r => new Set(getFaceElements(r.face)));
  const allElements: Element[] = ['blaze', 'frost', 'volt', 'venom', 'alloy', 'mirage'];

  for (const element of allElements) {
    if (elementSets.every(set => set.has(element))) {
      if (element === 'blaze') return 3.0;   // 業火: 全ダメージ3倍
      if (element === 'volt') return 2.0;    // 神雷: 全ダメージ2倍
    }
  }
  return 1.0;
}

// ==============================
// 1ターン実行
// ==============================
export function executeTurn(state: BattleState): TurnResult {
  state.turn++;

  // ターン開始前のHP
  const prePlayerHp = state.player.hp;
  const preEnemyHp = state.enemy.hp;

  // ダイスを振る
  const playerRolls = rollParty(state.player.dice);
  const enemyRolls = rollParty(state.enemy.dice);

  // 先攻判定
  const playerFirst = determineFirstAttacker(playerRolls, enemyRolls);

  // 敵の主属性（属性相性計算に使用）
  const enemyMainElement = state.enemy.dice[0]?.element || null;
  const playerMainElement = state.player.dice[0]?.element || null;

  // スキルアクション生成
  const playerActions: SkillAction[] = [];
  for (const roll of playerRolls) {
    playerActions.push(...getSkillsFromFace(roll.face, enemyMainElement, false));
  }

  const enemyActions: SkillAction[] = [];
  for (const roll of enemyRolls) {
    enemyActions.push(...getSkillsFromFace(roll.face, playerMainElement, true));
  }

  // クロスダイスシナジー倍率
  const playerCrossMult = getCrossDiceMultiplier(playerRolls);
  const enemyCrossMult = getCrossDiceMultiplier(enemyRolls);

  // シナジー判定
  const playerSynergies = checkAllSynergies(playerRolls);
  const enemySynergies = checkAllSynergies(enemyRolls);
  const allSynergies = [...playerSynergies, ...enemySynergies];

  // 先攻→後攻の順にアクション適用
  const firstActions = playerFirst ? playerActions : enemyActions;
  const secondActions = playerFirst ? enemyActions : playerActions;
  const firstAttacker = playerFirst ? state.player : state.enemy;
  const firstDefender = playerFirst ? state.enemy : state.player;
  const firstCrossMult = playerFirst ? playerCrossMult : enemyCrossMult;
  const secondCrossMult = playerFirst ? enemyCrossMult : playerCrossMult;

  applyActions(firstActions, firstAttacker, firstDefender, firstCrossMult);

  // 先攻攻撃後の中間HP
  const midPlayerHp = state.player.hp;
  const midEnemyHp = state.enemy.hp;

  // 先攻で倒れていなければ後攻
  if (firstDefender.hp > 0) {
    applyActions(secondActions, firstDefender, firstAttacker, secondCrossMult);
  }

  // ステータス効果処理
  processStatusEffects(state.player);
  processStatusEffects(state.enemy);

  // 勝敗判定
  if (state.enemy.hp <= 0) state.status = 'player-win';
  else if (state.player.hp <= 0) state.status = 'enemy-win';
  else if (state.turn >= state.maxTurns) {
    state.status = state.player.hp >= state.enemy.hp ? 'player-win' : 'enemy-win';
  }

  const turnResult: TurnResult = {
    turn: state.turn,
    playerRolls,
    enemyRolls,
    playerFirst,
    firstActions: playerFirst ? playerActions : enemyActions,
    secondActions: playerFirst ? enemyActions : playerActions,
    prePlayerHp,
    preEnemyHp,
    midPlayerHp,
    midEnemyHp,
    playerHp: state.player.hp,
    enemyHp: state.enemy.hp,
    synergies: allSynergies,
  };

  state.log.push(turnResult);
  return turnResult;
}

// ==============================
// バトル全体を実行
// ==============================
export function runBattle(state: BattleState): BattleState {
  while (state.status === 'ongoing') {
    executeTurn(state);
  }
  return state;
}
