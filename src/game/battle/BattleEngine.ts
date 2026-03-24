import type {
  MonsterDice, BattleState, Combatant, DiceRollResult,
  SkillAction, TurnResult, Element, DiceFace, FixedFace, CustomFace,
  StatusEffect, TurnSelection, ChargeGauge,
} from '../../types';
import { ELEMENT_CHART, isFixedFace, SOCKET_TIER_MULTIPLIER, PIP_DECAY_RATE } from '../../types';
import { rollParty } from '../dice/DiceEngine';
import { FIXED_SKILLS, getSkillRune, SKILL_RUNES } from '../../data/skill-runes';
import { calcSameFaceSynergyMultiplier, checkAllSynergies, getFaceElements } from '../synergy/SynergyEngine';
import { getRecipeSynergy } from '../../data/synergies';
import type { RecipeSynergy } from '../../types';

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
function calcDecayMultiplier(totalPips: number, decayRate: number = PIP_DECAY_RATE): number {
  return Math.max(0.1, 1 - (totalPips - 1) * decayRate);
}

// ==============================
// レアリティ別固有面威力倍率
// ==============================
const RARITY_FIXED_MULTIPLIER: Record<number, number> = {
  0: 1.0,  // 主人公
  1: 1.0,  // ★1 - ボーナスなし
  2: 1.3,  // ★2
  3: 1.7,  // ★3
  4: 2.2,  // ★4
  5: 3.0,  // ★5
};

// 固有面の減衰率（カスタム面より低い＝多スキルでもペナルティ少）
const FIXED_FACE_DECAY_RATE = 0.05;

// ==============================
// 面からスキルアクション生成
// ==============================
function getSkillsFromFace(
  face: DiceFace,
  targetElement: Element | null,
  targetIsPlayer: boolean,
  rarity: number = 0,
): SkillAction[] {
  const actions: SkillAction[] = [];
  const { multiplier: synergyMult } = calcSameFaceSynergyMultiplier(face);

  if (isFixedFace(face)) {
    const fixed = face as FixedFace;
    const totalPips = fixed.sockets.length;
    const decayMult = calcDecayMultiplier(totalPips, FIXED_FACE_DECAY_RATE);
    const tierMult = SOCKET_TIER_MULTIPLIER['gold'];
    const rarityMult = RARITY_FIXED_MULTIPLIER[rarity] ?? 1.0;

    for (const socket of fixed.sockets) {
      const skill = FIXED_SKILLS[socket.skillId];
      if (!skill) continue;
      const elementMult = targetElement ? ELEMENT_CHART[socket.element][targetElement] : 1.0;
      const rawDmg = skill.effect.power;
      const finalDmg = Math.round(rawDmg * tierMult * decayMult * elementMult * synergyMult * rarityMult);

      actions.push({
        skillId: socket.skillId, skillName: skill.name, element: socket.element,
        effectType: skill.effect.type, rawDamage: rawDmg,
        tierMultiplier: tierMult, decayMultiplier: decayMult,
        elementMultiplier: elementMult, synergyMultiplier: synergyMult,
        finalDamage: finalDmg,
        crossDiceMultiplier: 1.0, buffMultiplier: 1.0, actualDamage: finalDmg,
        targetIsPlayer,
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
        tierMultiplier: tierMult, decayMultiplier: decayMult,
        elementMultiplier: elementMult, synergyMultiplier: synergyMult,
        finalDamage: finalDmg,
        crossDiceMultiplier: 1.0, buffMultiplier: 1.0, actualDamage: finalDmg,
        targetIsPlayer,
      });
    }

    // 空ソケットのみの面でも「素振り」で最低ダメージ
    if (!hasAnySkill) {
      actions.push({
        skillId: 'basic-hit', skillName: '素振り', element: 'alloy' as Element,
        effectType: 'damage', rawDamage: 2,
        tierMultiplier: 1.0, decayMultiplier: 1.0,
        elementMultiplier: 1.0, synergyMultiplier: 1.0,
        finalDamage: 2,
        crossDiceMultiplier: 1.0, buffMultiplier: 1.0, actualDamage: 2,
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
  actions: SkillAction[], attacker: Combatant, defender: Combatant, crossDiceMult: number,
): void {
  for (const action of actions) {
    const buffMult = attacker.damageMultiplier * crossDiceMult / defender.defenseMultiplier;
    const damage = Math.round(action.finalDamage * buffMult);
    action.crossDiceMultiplier = crossDiceMult;
    action.buffMultiplier = attacker.damageMultiplier / defender.defenseMultiplier;
    switch (action.effectType) {
      case 'damage': {
        // シールドでダメージ軽減
        let remaining = damage;
        for (const eff of defender.statusEffects) {
          if (eff.type === 'shield' && eff.power > 0 && remaining > 0) {
            const absorbed = Math.min(eff.power, remaining);
            eff.power -= absorbed;
            remaining -= absorbed;
          }
        }
        action.actualDamage = remaining;
        defender.hp = Math.max(0, defender.hp - remaining);
        // 反撃チェック: defenderにcounterエフェクトがあればダメージを返す
        for (const eff of defender.statusEffects) {
          if (eff.type === 'counter' && eff.power > 0 && remaining > 0) {
            const counterDmg = Math.round(remaining * eff.power / 100);
            attacker.hp = Math.max(0, attacker.hp - counterDmg);
          }
        }
        break;
      }
      case 'heal':
        action.actualDamage = Math.min(action.rawDamage, attacker.maxHp - attacker.hp);
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + action.rawDamage);
        break;
      case 'dot':
        action.actualDamage = action.rawDamage;
        defender.statusEffects.push({ type: 'poison', power: action.rawDamage, remainingTurns: 3, element: action.element });
        break;
      case 'buff': {
        const buffVal = action.rawDamage > 1 ? action.rawDamage : 1.3;
        action.actualDamage = buffVal;
        attacker.statusEffects.push({ type: 'buff', power: buffVal, remainingTurns: 3, element: action.element });
        attacker.damageMultiplier = Math.min(2.0, attacker.damageMultiplier * buffVal);
        break;
      }
      case 'debuff': {
        const debuffVal = action.rawDamage < 1 ? action.rawDamage : 0.7;
        action.actualDamage = debuffVal;
        defender.statusEffects.push({ type: 'debuff', power: debuffVal, remainingTurns: 3, element: action.element });
        defender.damageMultiplier = Math.max(0.5, defender.damageMultiplier * debuffVal);
        break;
      }
      case 'shield':
        action.actualDamage = action.rawDamage;
        attacker.statusEffects.push({ type: 'shield', power: action.rawDamage, remainingTurns: 2, element: action.element });
        break;
      case 'counter':
        // 反撃: 被ダメージの power% を返す（ステータスエフェクトとして登録）
        action.actualDamage = action.rawDamage;
        attacker.statusEffects.push({ type: 'counter', power: action.rawDamage, remainingTurns: 2, element: action.element });
        break;
      case 'lifesteal': {
        // 吸収: ダメージ + HP回復
        let lsRemaining = damage;
        for (const eff of defender.statusEffects) {
          if (eff.type === 'shield' && eff.power > 0 && lsRemaining > 0) {
            const absorbed = Math.min(eff.power, lsRemaining);
            eff.power -= absorbed;
            lsRemaining -= absorbed;
          }
        }
        action.actualDamage = lsRemaining;
        defender.hp = Math.max(0, defender.hp - lsRemaining);
        const healAmount = Math.round(lsRemaining * 0.5);
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmount);
        break;
      }
      case 'seal':
        // 封印: 敵のダメージ倍率を1Tダウン（控えめ）
        action.actualDamage = action.rawDamage;
        defender.statusEffects.push({ type: 'debuff', power: 0.7, remainingTurns: 1, element: action.element });
        defender.damageMultiplier = Math.max(0.5, defender.damageMultiplier * 0.7);
        break;
      case 'passive':
        // パッシブ: バトル中は何もしない（装備しているだけで効果）
        action.actualDamage = 0;
        break;
    }
    // 呪いルーン: 使用時に自分にダメージ/デバフ
    const runeData = SKILL_RUNES.find(r => r.id === action.skillId);
    if (runeData?.cursed) {
      const curseDmg = Math.round(action.rawDamage * 0.2);
      attacker.hp = Math.max(1, attacker.hp - curseDmg);
      attacker.statusEffects.push({ type: 'poison', power: 3, remainingTurns: 2, element: action.element });
    }
  }
}

// ==============================
// ステータス効果処理
// ==============================
function processStatusEffects(combatant: Combatant): number {
  let totalDotDmg = 0;
  const remaining: StatusEffect[] = [];
  for (const effect of combatant.statusEffects) {
    if (effect.type === 'poison' || effect.type === 'burn') {
      const dmg = Math.min(effect.power, combatant.hp);
      combatant.hp = Math.max(0, combatant.hp - effect.power);
      totalDotDmg += dmg;
    }
    effect.remainingTurns--;
    if (effect.remainingTurns > 0) {
      remaining.push(effect);
    }
    // シールドのpower=0は自然消滅
  }
  combatant.statusEffects = remaining;

  // バフ/デバフ倍率を残存エフェクトから毎ターン再計算（累積誤差防止）
  let dmgMult = 1.0;
  let defMult = 1.0;
  for (const eff of remaining) {
    if (eff.type === 'buff') dmgMult *= eff.power;
    if (eff.type === 'debuff') dmgMult *= eff.power;
  }
  combatant.damageMultiplier = Math.min(2.0, Math.max(0.5, dmgMult));
  combatant.defenseMultiplier = Math.min(2.0, Math.max(0.3, defMult));
  return totalDotDmg;
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
      // GDD準拠: 各属性の3ダイス一致ボーナス
      switch (element) {
        case 'blaze': return 3.0;  // 業火: 全ダメージ3倍
        case 'volt':  return 2.0;  // 神雷: 全ダメージ2倍
        case 'frost': return 2.0;  // 絶対零度: 2倍
        case 'venom': return 2.0;  // 猛毒沼: 2倍
        case 'alloy': return 1.5;  // 絶対防御: 1.5倍（防御寄り）
        case 'mirage': return 2.5; // 万華鏡: 2.5倍
      }
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
// パッシブルーン効果を適用
// ==============================
function applyPassiveEffects(combatant: Combatant, opponent: Combatant): void {
  // 全ダイスの全カスタム面からパッシブルーンを収集
  const passiveIds = new Set<string>();
  const setCount = new Map<string, number>();

  for (const dice of combatant.dice) {
    for (const face of dice.customFaces) {
      for (const sock of face.sockets) {
        if (sock.skillRuneId) {
          const rune = getSkillRune(sock.skillRuneId);
          if (rune && rune.effect.type === 'passive') {
            passiveIds.add(rune.id);
            if (rune.setId) {
              setCount.set(rune.setId, (setCount.get(rune.setId) || 0) + 1);
            }
          }
        }
      }
    }
  }

  // パッシブ効果: description内のキーワードで判定
  for (const id of passiveIds) {
    const rune = getSkillRune(id);
    if (!rune) continue;
    const desc = rune.effect.description;
    if (desc.includes('DoT')) {
      // 敵にDoT
      opponent.statusEffects.push({ type: 'poison', power: rune.effect.power, remainingTurns: 5, element: rune.element });
    } else if (desc.includes('防御')) {
      // defenseMultiplier UP
      combatant.defenseMultiplier *= 1 + rune.effect.power / 100;
    } else if (desc.includes('攻撃')) {
      // damageMultiplier UP
      combatant.damageMultiplier *= 1 + rune.effect.power / 100;
    } else if (desc.includes('HP回復')) {
      // 毎ターン回復（statusEffectとして）
      combatant.statusEffects.push({ type: 'shield', power: rune.effect.power, remainingTurns: 5, element: rune.element });
    }
  }

  // セットボーナス: 同じsetIdが2個以上でボーナス
  for (const [, count] of setCount) {
    if (count >= 2) {
      // 2セット: damageMultiplier +20%
      combatant.damageMultiplier *= 1.2;
    }
    if (count >= 3) {
      // 3セット: さらにdefenseMultiplier +20%
      combatant.defenseMultiplier *= 1.2;
    }
  }
}

// ==============================
// レシピコンボからSkillAction生成
// ==============================
function createRecipeAction(recipe: RecipeSynergy, targetIsPlayer: boolean): SkillAction {
  const eff = recipe.effect;
  return {
    skillId: `recipe-${recipe.id}`,
    skillName: `[${recipe.name}]`,
    element: recipe.requiredElements[0] as Element,
    effectType: eff.type as SkillAction['effectType'],
    rawDamage: eff.power,
    tierMultiplier: 1.0,
    decayMultiplier: 1.0,
    elementMultiplier: 1.0,
    synergyMultiplier: 1.0,
    finalDamage: eff.power,
    crossDiceMultiplier: 1.0,
    buffMultiplier: 1.0,
    actualDamage: eff.power,
    targetIsPlayer,
  };
}

// ==============================
// 敵AI選択ロジック
// ==============================

// 面にヒールスキルが含まれるかチェック
function faceHasHeal(face: DiceFace): boolean {
  if (isFixedFace(face)) {
    const fixed = face as FixedFace;
    for (const s of fixed.sockets) {
      const skill = FIXED_SKILLS[s.skillId];
      if (skill && skill.effect.type === 'heal') return true;
    }
  } else {
    const custom = face as CustomFace;
    for (const s of custom.sockets) {
      if (!s.skillRuneId) continue;
      const rune = getSkillRune(s.skillRuneId);
      if (rune && rune.effect.type === 'heal') return true;
    }
  }
  return false;
}

// 面の属性がプレイヤー主属性に有利かスコア加算
function faceElementAdvantageScore(face: DiceFace, playerElement: Element | null): number {
  if (!playerElement) return 0;
  let bonus = 0;
  if (isFixedFace(face)) {
    const fixed = face as FixedFace;
    for (const s of fixed.sockets) {
      const mult = ELEMENT_CHART[s.element][playerElement];
      if (mult > 1.0) bonus += mult;
    }
  } else {
    const custom = face as CustomFace;
    for (const s of custom.sockets) {
      if (!s.skillRuneId) continue;
      const rune = getSkillRune(s.skillRuneId);
      if (rune) {
        const mult = ELEMENT_CHART[rune.element][playerElement];
        if (mult > 1.0) bonus += mult;
      }
    }
  }
  return bonus;
}

export function aiSelectDice(
  _dice: MonsterDice[],
  rolls: DiceRollResult[],
  _gauge: ChargeGauge,
  enemyHp: number,
  difficulty: number = 1,
  enemyMaxHp: number = 100,
  playerElement: Element | null = null,
): TurnSelection {
  const combos: [number, number, number][] = [[0, 1, 2], [0, 2, 1], [1, 2, 0]];
  let bestScore = -Infinity;
  let best = combos[0];

  const hpRatio = enemyMaxHp > 0 ? enemyHp / enemyMaxHp : 1;

  for (const [a, b, c] of combos) {
    let score = 0;
    // 基本: 発動面の出目合計で威力見積もり
    score += rolls[a].faceNumber * 2;
    score += rolls[b].faceNumber * 2;
    // 充填価値
    const chargeVal = rolls[c].faceNumber;
    score += chargeVal * 0.5;
    // 瀕死なら火力優先
    if (enemyHp < 15) score -= chargeVal * 0.5;

    // 難易度4-5: HP40%未満でヒール面を優先
    if (difficulty >= 4 && hpRatio < 0.4) {
      if (faceHasHeal(rolls[a].face)) score += 8;
      if (faceHasHeal(rolls[b].face)) score += 8;
    }

    // 難易度6-7: 属性有利を考慮
    if (difficulty >= 6 && playerElement) {
      score += faceElementAdvantageScore(rolls[a].face, playerElement) * 3;
      score += faceElementAdvantageScore(rolls[b].face, playerElement) * 3;
    }

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

  // パッシブルーン効果（初回ターンのみ）
  if (state.turn === 1) {
    applyPassiveEffects(state.player, state.enemy);
    applyPassiveEffects(state.enemy, state.player);
  }

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
    const diceRarity = state.player.dice[roll.diceIndex]?.rarity ?? 0;
    playerActions.push(...getSkillsFromFace(roll.face, enemyMainElement, false, diceRarity));
  }
  const enemyActions: SkillAction[] = [];
  for (const roll of enemyActiveRolls) {
    const diceRarity = state.enemy.dice[roll.diceIndex]?.rarity ?? 0;
    enemyActions.push(...getSkillsFromFace(roll.face, playerMainElement, true, diceRarity));
  }

  // クロスダイスシナジー（属性一致は3個全部で判定）
  const playerCrossMult = getCrossDiceMultiplier(playerActiveRolls, playerRolls);
  const enemyCrossMult = getCrossDiceMultiplier(enemyActiveRolls, enemyRolls);

  // シナジー判定（同面+レシピは発動2個、クロスダイスは全3個で判定）
  const playerSynergies = checkAllSynergies(playerActiveRolls, playerRolls);
  const enemySynergies = checkAllSynergies(enemyActiveRolls, enemyRolls);
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

  // レシピコンボ効果適用
  const playerElements = new Set<Element>();
  for (const roll of playerActiveRolls) {
    for (const el of getFaceElements(roll.face)) playerElements.add(el);
  }
  const enemyElements = new Set<Element>();
  for (const roll of enemyActiveRolls) {
    for (const el of getFaceElements(roll.face)) enemyElements.add(el);
  }
  const playerRecipes = getRecipeSynergy(Array.from(playerElements));
  const enemyRecipes = getRecipeSynergy(Array.from(enemyElements));

  for (const recipe of playerRecipes) {
    const bonusAction = createRecipeAction(recipe, false);
    applyActions([bonusAction], state.player, state.enemy, 1.0);
    (playerFirst ? firstActions : secondActions).push(bonusAction);
  }
  for (const recipe of enemyRecipes) {
    const bonusAction = createRecipeAction(recipe, true);
    applyActions([bonusAction], state.enemy, state.player, 1.0);
    (playerFirst ? secondActions : firstActions).push(bonusAction);
  }

  // 充填処理（捨てたダイスの出目=ピップ数を加算）
  const playerChargedPips = playerRolls[playerSelection.chargeIndex].faceNumber;
  const enemyChargedPips = enemyRolls[enemySelection.chargeIndex].faceNumber;
  state.player.charge = processCharge(state.player.charge, playerChargedPips);
  state.enemy.charge = processCharge(state.enemy.charge, enemyChargedPips);

  // ステータス効果
  const playerStatusDmg = processStatusEffects(state.player);
  const enemyStatusDmg = processStatusEffects(state.enemy);

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
    playerStatusDmg, enemyStatusDmg,
    playerEffects: state.player.statusEffects.map(e => ({ ...e })),
    enemyEffects: state.enemy.statusEffects.map(e => ({ ...e })),
    playerDmgMult: state.player.damageMultiplier,
    enemyDmgMult: state.enemy.damageMultiplier,
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
  const eSel = aiSelectDice(state.enemy.dice, enemyRolls, state.enemy.charge, state.enemy.hp, 1, state.enemy.maxHp, null);
  return executeTurnFull(state, playerRolls, enemyRolls, pSel, eSel);
}
