import { useState, useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { createBattleState, executeTurnFull, rollParty, aiSelectDice } from '../../game/battle/BattleEngine';
import type { BattleState, TurnResult, MonsterDice, SkillAction, DiceRollResult, TurnSelection, Element } from '../../types';
import { ELEMENT_NAMES, ELEMENT_CHART } from '../../types';
import { getMagicDice, type MagicDiceData } from '../../data/magic-dice';
import { getAllFaces } from '../../types';
import { SKILL_RUNES } from '../../data/skill-runes';
import { HpBar } from '../common/HpBar';
import { ChargeBar } from '../common/ChargeBar';
import { DiceFaceView } from '../common/DiceFaceView';
import { ELEMENT_COLORS } from '../common/ElementBadge';
import { getPipColorsForDiceFace } from '../../utils/pipColors';
import { MonsterSprite } from '../common/MonsterSprite';
import { ElementEffect, SynergyCutIn, Particles, StatusIndicator, HitFlash } from './BattleEffects';
import { CaptureScene } from './CaptureScene';
import { sfx } from '../../utils/sfx';
import { bgm } from '../../utils/bgm';

type Phase =
  | 'ready' | 'rolling' | 'selecting'
  | 'first-label' | 'first-attack'
  | 'second-label' | 'second-attack'
  | 'turn-end' | 'result' | 'capture';

let popupId = 0;
interface Popup { id: number; text: string; color: string; side: 'enemy' | 'player'; idx: number; big?: boolean; }

export function BattleScreen() {
  const { currentEnemy, ownedDice, party, protagonistDice, setScreen, addDice, addRunes, captureMonster, addGold, addMaterial, getPartyBonus, equippedMagicDice, currentChapter, isPvpBattle, addPvpResult, addGemFragments, addExp, save, defeatBoss, isEventBattle, eventRewardMult, completeEvent } = useGameStore();
  const autoSaveAndGo = useCallback((screen: Parameters<typeof setScreen>[0]) => {
    save().then(() => setScreen(screen));
  }, [save, setScreen]);
  const magicData = equippedMagicDice ? getMagicDice(equippedMagicDice) : undefined;
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [lastTurn, setLastTurn] = useState<TurnResult | null>(null);
  const [phase, setPhase] = useState<Phase>('ready');
  const [popups, setPopups] = useState<Popup[]>([]);
  const [currentActions, setCurrentActions] = useState<SkillAction[]>([]);
  const [turnCount, setTurnCount] = useState(0);
  const [attackLabel, setAttackLabel] = useState('');
  const [shakeEnemy, setShakeEnemy] = useState(false);
  const [shakePlayer, setShakePlayer] = useState(false);
  const [centerMessage, setCenterMessage] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const [effectElement, setEffectElement] = useState<Element | null>(null);
  const [effectSide, setEffectSide] = useState<'top' | 'bottom'>('top');
  const [particles, setParticles] = useState<{ color: string; y: number; element?: Element } | null>(null);
  const [hitFlashSide, setHitFlashSide] = useState<'top' | 'bottom' | null>(null);
  const [statusIndicator, setStatusIndicator] = useState<{ effects: Array<{type: string; element: string}>; side: 'top' | 'bottom' } | null>(null);
  const [synergyCutIn, setSynergyCutIn] = useState<string | null>(null);
  const [hurtEnemy, setHurtEnemy] = useState(false);
  const [hurtPlayer, setHurtPlayer] = useState(false);
  const [diceLanded, setDiceLanded] = useState(false);
  const [screenFlash, setScreenFlash] = useState<string | null>(null);
  const [filmBars, setFilmBars] = useState(false);

  // ボス演出用
  const [bossEntrance, setBossEntrance] = useState(false);

  // マジックダイス用
  const [magicUsedThisTurn, setMagicUsedThisTurn] = useState(false);
  const [magicEffect, setMagicEffect] = useState<string | null>(null);

  // 選択フェーズ用
  const [currentRolls, setCurrentRolls] = useState<DiceRollResult[] | null>(null);
  const [enemyRolls, setEnemyRolls] = useState<DiceRollResult[] | null>(null);
  const [selectedDice, setSelectedDice] = useState<Set<number>>(new Set()); // 発動するダイスのインデックス

  const playerDice = party.map(id => {
    if (id === 'protagonist') return protagonistDice;
    return ownedDice.find(d => d.id === id);
  }).filter(Boolean) as MonsterDice[];
  const enemyDiceList = currentEnemy || [];
  const isBoss = enemyDiceList.length > 0 && enemyDiceList[0].rarity >= 4;
  void isEventBattle; void eventRewardMult; void completeEvent; // event battle hooks (used in reward section)

  useEffect(() => { if (popups.length > 0) { const t = setTimeout(() => setPopups([]), 1500); return () => clearTimeout(t); } }, [popups]);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);

  const addLog = useCallback((msg: string) => setLog(prev => [...prev, msg]), []);
  const addPopup = useCallback((text: string, color: string, side: 'enemy' | 'player', idx = 0, big = false) => {
    setPopups(prev => [...prev, { id: ++popupId, text, color, side, idx, big }]);
  }, []);
  const doShake = useCallback((side: 'enemy' | 'player') => {
    if (side === 'enemy') { setShakeEnemy(true); setHurtEnemy(true); setHitFlashSide('top'); setTimeout(() => { setShakeEnemy(false); setHurtEnemy(false); setHitFlashSide(null); }, 500); }
    else { setShakePlayer(true); setHurtPlayer(true); setHitFlashSide('bottom'); setTimeout(() => { setShakePlayer(false); setHurtPlayer(false); setHitFlashSide(null); }, 500); }
  }, []);
  const [flashDuration, setFlashDuration] = useState(800);
  const flash = useCallback((msg: string, duration = 800) => { setFlashDuration(duration); setCenterMessage(msg); setTimeout(() => setCenterMessage(null), duration); }, []);
  const showElementEffect = useCallback((el: Element, side: 'top' | 'bottom') => { setEffectElement(el); setEffectSide(side); setTimeout(() => setEffectElement(null), 600); }, []);
  const showParticles = useCallback((color: string, y: number, element?: Element) => { setParticles({ color, y, element }); setTimeout(() => setParticles(null), 800); }, []);
  const [screenFlashMs, setScreenFlashMs] = useState(180);
  const doScreenFlash = useCallback((color: string, durationMs = 180) => { setScreenFlashMs(durationMs); setScreenFlash(color); setTimeout(() => setScreenFlash(null), durationMs); }, []);
  const showFilmBars = useCallback(() => { setFilmBars(true); setTimeout(() => setFilmBars(false), 400); }, []);

  const logActions = useCallback((actions: SkillAction[], isPlayerAttacking: boolean) => {
    if (actions.length === 0) { addLog('  (なし)'); return; }
    const who = isPlayerAttacking ? '' : '[敵]';
    for (const a of actions) {
      const elName = ELEMENT_NAMES[a.element];
      if (a.effectType === 'damage') {
        const mults: string[] = [];
        if (a.tierMultiplier !== 1.0) mults.push(`Tier${a.tierMultiplier}`);
        if (a.decayMultiplier !== 1.0) mults.push(`減衰${a.decayMultiplier.toFixed(1)}`);
        if (a.elementMultiplier !== 1.0) mults.push(`属性${a.elementMultiplier}`);
        if (a.synergyMultiplier !== 1.0) mults.push(`同面${a.synergyMultiplier}`);
        if (a.crossDiceMultiplier !== 1.0) mults.push(`共鳴${a.crossDiceMultiplier}`);
        if (a.buffMultiplier !== 1.0) mults.push(`増減${a.buffMultiplier.toFixed(1)}`);
        const multStr = mults.length > 0 ? ` [${mults.join(' ')}]` : '';
        addLog(`  ${who}${a.skillName}(${elName}) ${a.rawDamage}→${a.actualDamage}dmg${multStr}`);
      } else if (a.effectType === 'heal') {
        addLog(`  ${who}${a.skillName}(${elName}) → +${a.actualDamage}HP`);
      } else if (a.effectType === 'dot') {
        addLog(`  ${who}${a.skillName}(${elName}) → 継続${a.rawDamage}dmg/T (3T)`);
      } else if (a.effectType === 'buff') {
        addLog(`  ${who}${a.skillName}(${elName}) → 攻撃x${a.actualDamage}`);
      } else if (a.effectType === 'debuff') {
        addLog(`  ${who}${a.skillName}(${elName}) → 敵攻撃x${a.actualDamage}`);
      } else if (a.effectType === 'shield') {
        addLog(`  ${who}${a.skillName}(${elName}) → シールド${a.actualDamage} (2T)`);
      } else if (a.effectType === 'counter') {
        addLog(`  ${who}${a.skillName}(${elName}) → 反撃${a.actualDamage}% (2T)`);
      } else if (a.effectType === 'lifesteal') {
        addLog(`  ${who}${a.skillName}(${elName}) → 吸収${a.actualDamage}dmg`);
      } else if (a.effectType === 'seal') {
        addLog(`  ${who}${a.skillName}(${elName}) → 封印！`);
      } else if (a.effectType === 'passive') {
        // パッシブはログに出さない
      }
    }
  }, [addLog]);

  // ===== バトル開始 =====
  const startBattle = useCallback(() => {
    if (playerDice.length < 3 || enemyDiceList.length < 3) return;
    sfx.click();
    // プレイヤーHP: playerMaxHpを使用（レベルで成長）
    const { playerMaxHp, isHardMode } = useGameStore.getState();
    const playerHp = playerMaxHp;
    // 敵HP: 章ごとのスケーリングテーブル
    const ENEMY_HP_TABLE: Record<number, { base: number; rarityMult: number }> = {
      1: { base: 40, rarityMult: 10 },
      2: { base: 55, rarityMult: 12 },
      3: { base: 75, rarityMult: 15 },
      4: { base: 100, rarityMult: 20 },
      5: { base: 140, rarityMult: 25 },
      6: { base: 200, rarityMult: 30 },
      7: { base: 280, rarityMult: 40 },
    };
    const maxRarity = Math.max(...enemyDiceList.map(d => d.rarity));
    const hpEntry = ENEMY_HP_TABLE[currentChapter] || ENEMY_HP_TABLE[7];
    let enemyMaxHp = hpEntry.base + maxRarity * hpEntry.rarityMult;
    // 高難度: 敵HP×2 + 敵ダメージ倍率が初期1.3
    if (isHardMode) {
      enemyMaxHp = Math.round(enemyMaxHp * 2);
    }
    const state = createBattleState(playerDice, enemyDiceList, playerHp, enemyMaxHp);
    setBattle(state);
    setPhase('rolling'); // すぐにphaseを変更してボタンを非表示に
    setLog([]);

    // ボス演出: カットイン → 通常開始 + ボスBGM
    const bossDelay = isBoss ? 1500 : 0;
    if (isBoss) {
      setBossEntrance(true);
      // ボスBGMはダイアログ開始時に既に再生中。未再生の場合のみ開始
      if (!bgm.currentTrackName?.startsWith('boss')) {
        const bc = useGameStore.getState().battleChapter;
        const bossMap: Record<number, string> = { 1: 'boss-blaze', 2: 'boss-frost', 3: 'boss-volt', 4: 'boss-venom', 5: 'boss-alloy', 6: 'boss-mirage', 7: 'boss-final' };
        bgm.play((bossMap[bc] ?? 'boss') as any);
      }
      setTimeout(() => setBossEntrance(false), 1500);
    }

    setTimeout(() => {
      addLog('戦闘開始！');
      flash('戦闘開始！', 800);

      // ダイスロール
      setTimeout(() => {
        sfx.diceRoll();
      }, 100);

      setTimeout(() => {
        const pRolls = rollParty(state.player.dice);
        const eRolls = rollParty(state.enemy.dice);
        setCurrentRolls(pRolls);
        setEnemyRolls(eRolls);
        setSelectedDice(new Set());
        setDiceLanded(true);
        sfx.diceLand();
        setPhase('selecting');
        addLog(`── Turn ${state.turn + 1} ──`);
      }, 800);
    }, bossDelay);
  }, [playerDice, enemyDiceList, flash, addLog, isBoss]);

  // ===== ダイス選択トグル =====
  const toggleDiceSelection = useCallback((idx: number) => {
    sfx.select();
    setSelectedDice(prev => {
      const next = new Set(prev);
      if (next.has(idx)) { next.delete(idx); }
      else if (next.size < 2) { next.add(idx); }
      return next;
    });
  }, []);

  // ===== マジックダイス使用 =====
  const useMagicDice = useCallback((md: MagicDiceData) => {
    if (!battle) return;
    sfx.synergy();

    // Consume charge
    battle.player.charge.current = Math.max(0, battle.player.charge.current - md.cost);
    setBattle({ ...battle });
    setMagicUsedThisTurn(true);

    flash(`${md.name}!`, 1000);
    addLog(`  MAGIC: ${md.name} (${md.nameEn})`);

    switch (md.id) {
      case 'reroll': {
        const newRolls = rollParty(battle.player.dice);
        setCurrentRolls(newRolls);
        setSelectedDice(new Set());
        addLog('  -> dice re-rolled!');
        break;
      }
      case 'echo': {
        setMagicEffect('echo');
        addLog('  -> all skills fire twice!');
        break;
      }
      case 'barrier': {
        setMagicEffect('barrier');
        addLog('  -> damage taken halved!');
        break;
      }
      case 'haste': {
        setMagicEffect('haste');
        addLog('  -> guaranteed first strike!');
        break;
      }
      case 'pierce': {
        setMagicEffect('pierce');
        addLog('  -> ignoring enemy defense!');
        break;
      }
      case 'crit-star': {
        setMagicEffect('crit-star');
        addLog('  -> all skills crit x2!');
        break;
      }
      case 'restore': {
        const healAmount = Math.round(battle.player.maxHp * 0.4);
        battle.player.hp = Math.min(battle.player.maxHp, battle.player.hp + healAmount);
        setBattle({ ...battle });
        addLog(`  -> HP +${healAmount}!`);
        sfx.heal();
        break;
      }
      case 'sacrifice': {
        const hpLoss = Math.round(battle.player.hp * 0.25);
        battle.player.hp = Math.max(1, battle.player.hp - hpLoss);
        setBattle({ ...battle });
        setMagicEffect('sacrifice');
        addLog(`  -> HP -${hpLoss}! Next turn damage x2!`);
        break;
      }
      case 'unleash': {
        setMagicEffect('unleash');
        setSelectedDice(new Set([0, 1, 2]));
        addLog('  -> all 3 dice activated!');
        break;
      }
      case 'flip': {
        if (currentRolls) {
          const flipped = currentRolls.map(r => ({
            ...r,
            faceNumber: 7 - r.faceNumber,
            face: getAllFaces(battle.player.dice[r.diceIndex])[7 - r.faceNumber - 1],
          }));
          setCurrentRolls(flipped);
          setSelectedDice(new Set());
          addLog(`  -> faces flipped! [${flipped.map(r => r.faceNumber).join(',')}]`);
        }
        break;
      }
      case 'drain': {
        setMagicEffect('drain');
        addLog('  -> 40% lifesteal on damage dealt!');
        break;
      }
      case 'reflect': {
        setMagicEffect('reflect');
        addLog('  -> 30% damage reflected!');
        break;
      }
      case 'freeze-time': {
        setMagicEffect('freeze-time');
        addLog('  -> enemy actions sealed!');
        break;
      }
      case 'revive': {
        setMagicEffect('revive');
        addLog('  -> survive lethal at HP 1!');
        break;
      }
      case 'lock': {
        // 1個のダイスを現在の面で固定（最大出目のダイスを自動選択）
        if (currentRolls) {
          const bestIdx = currentRolls.reduce((best, r, idx) => r.faceNumber > currentRolls[best].faceNumber ? idx : best, 0);
          setMagicEffect(`lock-${bestIdx}`);
          addLog(`  -> dice ${bestIdx + 1} locked at face ${currentRolls[bestIdx].faceNumber}!`);
        }
        break;
      }
      case 'swap': {
        // ダイス2個の出目を入れ替え（最大と最小を交換）
        if (currentRolls) {
          const sorted = [...currentRolls].sort((a, b) => a.faceNumber - b.faceNumber);
          const minIdx = currentRolls.indexOf(sorted[0]);
          const maxIdx = currentRolls.indexOf(sorted[2]);
          const swapped = currentRolls.map((r, i) => {
            if (i === minIdx) return { ...currentRolls[maxIdx], diceIndex: i };
            if (i === maxIdx) return { ...currentRolls[minIdx], diceIndex: i };
            return r;
          });
          setCurrentRolls(swapped);
          setSelectedDice(new Set());
          addLog(`  -> swapped dice ${minIdx + 1} <-> ${maxIdx + 1}!`);
        }
        break;
      }
      case 'destiny': {
        // 全ダイスが1の面確定
        if (currentRolls) {
          const destinyRolls = currentRolls.map((r) => ({
            ...r,
            faceNumber: 1,
            face: getAllFaces(battle.player.dice[r.diceIndex])[0],
          }));
          setCurrentRolls(destinyRolls);
          setSelectedDice(new Set());
          addLog('  -> all dice set to face 1!');
        }
        break;
      }
      case 'insight': {
        // 敵の選択が見える（次ターンまで効果持続）
        setMagicEffect('insight');
        addLog('  -> enemy selection revealed!');
        break;
      }
      case 'jinx': {
        // 敵全ダイスが6の面固定（最弱面）
        setMagicEffect('jinx');
        addLog('  -> enemy dice cursed to face 6!');
        break;
      }
      case 'seal': {
        // 敵のシナジー全無効
        setMagicEffect('seal');
        addLog('  -> enemy synergies sealed!');
        break;
      }
      case 'shift': {
        // 全スキルの属性をランダム変更
        const elements: Element[] = ['blaze', 'frost', 'volt', 'venom', 'alloy', 'mirage'];
        const chosen = elements[Math.floor(Math.random() * elements.length)];
        setMagicEffect(`shift-${chosen}`);
        addLog(`  -> all skills shift to ${ELEMENT_NAMES[chosen]}!`);
        break;
      }
      case 'chaos': {
        // 全面をランダムスキルに一時置換（出目をランダムに変更）
        if (currentRolls) {
          const chaosRolls = currentRolls.map((r) => {
            const newFace = Math.floor(Math.random() * 6) + 1;
            return {
              ...r,
              faceNumber: newFace,
              face: getAllFaces(battle.player.dice[r.diceIndex])[newFace - 1],
            };
          });
          setCurrentRolls(chaosRolls);
          setSelectedDice(new Set());
          addLog(`  -> chaos! faces: [${chaosRolls.map(r => r.faceNumber).join(',')}]`);
        }
        break;
      }
      case 'all-or-nothing': {
        setMagicEffect('all-or-nothing');
        addLog('  -> all or nothing! Win=x3, Lose=0!');
        break;
      }
      case 'mirror': {
        // 敵の出目を自分にコピー
        if (enemyRolls && currentRolls) {
          const mirrored = currentRolls.map((r, i) => ({
            ...r,
            faceNumber: enemyRolls[i]?.faceNumber ?? r.faceNumber,
            face: enemyRolls[i]
              ? getAllFaces(battle.player.dice[r.diceIndex])[(enemyRolls[i].faceNumber - 1)] ?? r.face
              : r.face,
          }));
          setCurrentRolls(mirrored);
          setSelectedDice(new Set());
          addLog(`  -> mirrored enemy rolls! [${mirrored.map(r => r.faceNumber).join(',')}]`);
        }
        break;
      }
      case 'jackpot': {
        // 7番目ダイスを振る: 1-3空振り, 4-5 HP全回復, 6 敵即死
        const roll = Math.floor(Math.random() * 6) + 1;
        if (roll >= 4 && roll <= 5) {
          battle.player.hp = battle.player.maxHp;
          setBattle({ ...battle });
          sfx.heal();
          addLog(`  -> JACKPOT roll: ${roll}! HP fully restored!`);
        } else if (roll === 6) {
          battle.enemy.hp = 0;
          battle.status = 'player-win';
          setBattle({ ...battle });
          sfx.bigHit();
          addLog(`  -> JACKPOT roll: 6! INSTANT KILL!`);
        } else {
          addLog(`  -> JACKPOT roll: ${roll}... miss!`);
        }
        break;
      }
      default: {
        addLog(`  ${md.effect}`);
        break;
      }
    }
  }, [battle, currentRolls, enemyRolls, flash, addLog]);

  // ===== GO: 選択確定 → ターン実行 =====
  const confirmSelection = useCallback(() => {
    const isUnleash = magicEffect === 'unleash';
    const requiredCount = isUnleash ? 3 : 2;
    if (!battle || !currentRolls || !enemyRolls || selectedDice.size !== requiredCount) return;
    sfx.click();

    const activeArr = isUnleash
      ? Array.from(selectedDice).slice(0, 2) as [number, number]
      : Array.from(selectedDice) as [number, number];
    const chargeIdx = isUnleash ? 0 : [0, 1, 2].find(i => !selectedDice.has(i))!;
    const playerSel: TurnSelection = { activateIndices: activeArr, chargeIndex: chargeIdx };

    // jinx: 敵全ダイスを6の面に固定
    let actualEnemyRolls = enemyRolls;
    if (magicEffect === 'jinx') {
      actualEnemyRolls = enemyRolls.map((r) => ({
        ...r,
        faceNumber: 6,
        face: getAllFaces(battle.enemy.dice[r.diceIndex])[5],
      }));
      addLog('  JINX: enemy dice forced to face 6!');
    }

    // 敵AI選択（章に応じた難易度でAIの賢さが変化）
    const playerMainElement = battle.player.dice[0]?.element || null;
    const enemySel = aiSelectDice(battle.enemy.dice, actualEnemyRolls, battle.enemy.charge, battle.enemy.hp, currentChapter, battle.enemy.maxHp, playerMainElement);

    if (isUnleash) {
      addLog(`発動: ダイス1,2,3 (全面発動)`);
    } else {
      addLog(`発動: ダイス${activeArr.map(i => i + 1).join(',')} / 充填: ダイス${chargeIdx + 1}(+${currentRolls[chargeIdx].faceNumber})`);
    }

    const prevPlayerCharge = battle.player.charge.current;

    // Apply haste effect: force player first
    if (magicEffect === 'haste') {
      // We'll override playerFirst after result
    }

    // ターン実行
    const result = executeTurnFull(battle, currentRolls, actualEnemyRolls, playerSel, enemySel);

    // Apply magic effects to result
    if (magicEffect === 'haste') {
      // Force player first - swap actions if needed
      if (!result.playerFirst) {
        const temp = result.firstActions;
        result.firstActions = result.secondActions;
        result.secondActions = temp;
        result.playerFirst = true;
      }
    }

    if (magicEffect === 'echo') {
      // Double all player actions
      const playerActions = result.playerFirst ? result.firstActions : result.secondActions;
      const doubled = [...playerActions, ...playerActions.map(a => ({ ...a }))];
      if (result.playerFirst) result.firstActions = doubled;
      else result.secondActions = doubled;
    }

    if (magicEffect === 'crit-star') {
      // Double all player action damage
      const playerActions = result.playerFirst ? result.firstActions : result.secondActions;
      for (const a of playerActions) {
        if (a.effectType === 'damage') a.finalDamage = a.finalDamage * 2;
      }
    }

    if (magicEffect === 'pierce') {
      // Player actions ignore defense (already calculated, so boost damage)
      const playerActions = result.playerFirst ? result.firstActions : result.secondActions;
      for (const a of playerActions) {
        if (a.effectType === 'damage') {
          a.finalDamage = Math.round(a.finalDamage * battle.enemy.defenseMultiplier);
        }
      }
    }

    if (magicEffect === 'barrier') {
      // Halve all enemy action damage
      const enemyActions = result.playerFirst ? result.secondActions : result.firstActions;
      for (const a of enemyActions) {
        if (a.effectType === 'damage') a.finalDamage = Math.round(a.finalDamage * 0.5);
      }
    }

    if (magicEffect === 'freeze-time') {
      // Clear all enemy actions
      if (result.playerFirst) result.secondActions = [];
      else result.firstActions = [];
    }

    if (magicEffect === 'seal') {
      // Remove synergy multipliers from enemy actions
      const enemyActions = result.playerFirst ? result.secondActions : result.firstActions;
      for (const a of enemyActions) {
        if (a.synergyMultiplier > 1) {
          a.finalDamage = Math.round(a.finalDamage / a.synergyMultiplier);
          a.synergyMultiplier = 1;
        }
      }
    }

    if (magicEffect?.startsWith('shift-')) {
      // Change all player action elements to chosen element
      const shiftElement = magicEffect.replace('shift-', '') as Element;
      const playerActions = result.playerFirst ? result.firstActions : result.secondActions;
      const enemyMainElement = battle.enemy.dice[0]?.element || null;
      for (const a of playerActions) {
        a.element = shiftElement;
        if (enemyMainElement && a.effectType === 'damage') {
          const newMult = ELEMENT_CHART[shiftElement]?.[enemyMainElement] ?? 1;
          const oldMult = a.elementMultiplier || 1;
          a.finalDamage = Math.round(a.finalDamage * (newMult / oldMult));
          a.elementMultiplier = newMult;
        }
      }
    }

    if (magicEffect === 'all-or-nothing') {
      // Compare total damage: player > enemy = x3, else = 0
      const playerActions = result.playerFirst ? result.firstActions : result.secondActions;
      const enemyActions = result.playerFirst ? result.secondActions : result.firstActions;
      const pDmg = playerActions.filter(a => a.effectType === 'damage').reduce((s, a) => s + a.finalDamage, 0);
      const eDmg = enemyActions.filter(a => a.effectType === 'damage').reduce((s, a) => s + a.finalDamage, 0);
      if (pDmg > eDmg) {
        for (const a of playerActions) { if (a.effectType === 'damage') a.finalDamage *= 3; }
        addLog('  ALL-OR-NOTHING: WIN! x3 damage!');
      } else {
        for (const a of playerActions) { if (a.effectType === 'damage') a.finalDamage = 0; }
        addLog('  ALL-OR-NOTHING: LOSE... 0 damage');
      }
    }

    if (isUnleash) {
      // Add 3rd dice actions to player's action list
      const thirdIdx = [0, 1, 2].find(i => !activeArr.includes(i));
      if (thirdIdx !== undefined) {
        const thirdRoll = currentRolls[thirdIdx];
        // Generate skills for 3rd dice
        // We'll add a bonus hit for simplification
        const extraDmg = thirdRoll.faceNumber * 3;
        const extraActions: SkillAction[] = [{
          skillId: 'unleash-extra', skillName: '解放撃',
          element: (thirdRoll.face as any).element ?? 'alloy',
          effectType: 'damage', rawDamage: extraDmg,
          tierMultiplier: 1.0, decayMultiplier: 1.0,
          elementMultiplier: 1, synergyMultiplier: 1,
          finalDamage: extraDmg,
          crossDiceMultiplier: 1.0, buffMultiplier: 1.0, actualDamage: extraDmg,
          targetIsPlayer: false,
        }];
        if (result.playerFirst) result.firstActions.push(...extraActions);
        else result.secondActions.push(...extraActions);
      }
    }

    // マジックダイス効果でアクションが変更された場合のみHP再計算
    const hasMagicMod = magicEffect !== null || isUnleash;
    if (hasMagicMod) {
      // Reset HP to pre-turn values and re-apply
      battle.player.hp = result.prePlayerHp;
      battle.enemy.hp = result.preEnemyHp;

      // Apply first actions
      for (const a of result.firstActions) {
        if (a.effectType === 'damage' && a.finalDamage > 0) {
          if (a.targetIsPlayer) battle.player.hp = Math.max(0, battle.player.hp - a.finalDamage);
          else battle.enemy.hp = Math.max(0, battle.enemy.hp - a.finalDamage);
        } else if (a.effectType === 'heal') {
          if (!a.targetIsPlayer) battle.player.hp = Math.min(battle.player.maxHp, battle.player.hp + a.rawDamage);
          else battle.enemy.hp = Math.min(battle.enemy.maxHp, battle.enemy.hp + a.rawDamage);
        }
      }
      result.midPlayerHp = battle.player.hp;
      result.midEnemyHp = battle.enemy.hp;

      // Apply second actions
      for (const a of result.secondActions) {
        if (a.effectType === 'damage' && a.finalDamage > 0) {
          if (a.targetIsPlayer) battle.player.hp = Math.max(0, battle.player.hp - a.finalDamage);
          else battle.enemy.hp = Math.max(0, battle.enemy.hp - a.finalDamage);
        } else if (a.effectType === 'heal') {
          if (!a.targetIsPlayer) battle.player.hp = Math.min(battle.player.maxHp, battle.player.hp + a.rawDamage);
          else battle.enemy.hp = Math.min(battle.enemy.maxHp, battle.enemy.hp + a.rawDamage);
        }
      }

      // Drain effect: heal 40% of damage dealt
      if (magicEffect === 'drain') {
        const playerActions = result.playerFirst ? result.firstActions : result.secondActions;
        const totalDmg = playerActions.filter(a => a.effectType === 'damage').reduce((s, a) => s + a.finalDamage, 0);
        const healAmt = Math.round(totalDmg * 0.4);
        if (healAmt > 0) {
          battle.player.hp = Math.min(battle.player.maxHp, battle.player.hp + healAmt);
          addLog(`  DRAIN: +${healAmt}HP`);
        }
      }

      // Reflect effect: 30% of damage taken reflected to enemy
      if (magicEffect === 'reflect') {
        const enemyActions = result.playerFirst ? result.secondActions : result.firstActions;
        const totalDmg = enemyActions.filter(a => a.effectType === 'damage').reduce((s, a) => s + a.finalDamage, 0);
        const reflectAmt = Math.round(totalDmg * 0.3);
        if (reflectAmt > 0) {
          battle.enemy.hp = Math.max(0, battle.enemy.hp - reflectAmt);
          addLog(`  REFLECT: ${reflectAmt}dmg`);
        }
      }

      // Revive effect: survive lethal at HP 1
      if (magicEffect === 'revive' && battle.player.hp <= 0) {
        battle.player.hp = 1;
        addLog('  REVIVE: HP1 survived!');
      }

      // Sacrifice buff: double all damage
      if (magicEffect === 'sacrifice') {
        const playerActions = result.playerFirst ? result.firstActions : result.secondActions;
        for (const a of playerActions) {
          if (a.effectType === 'damage') a.finalDamage = a.finalDamage * 2;
        }
      }

      // Update final HP
      result.playerHp = battle.player.hp;
      result.enemyHp = battle.enemy.hp;

      // Re-check win condition
      if (battle.enemy.hp <= 0) battle.status = 'player-win';
      else if (battle.player.hp <= 0) battle.status = 'enemy-win';
    }

    setBattle({ ...battle });
    setLastTurn(result);
    setTurnCount(result.turn);

    addLog(`出目 [${result.playerRolls.map(r => r.faceNumber).join(',')}] vs [${result.enemyRolls.map(r => r.faceNumber).join(',')}]`);
    addLog(result.playerFirst ? '→ プレイヤー先攻' : '→ エネミー先攻');

    // Charge SFX
    if (result.playerCharge.current > prevPlayerCharge) {
      sfx.chargeUp();
    }
    if (magicData && result.playerCharge.current >= magicData.cost && prevPlayerCharge < magicData.cost) {
      setTimeout(() => sfx.chargeMax(), 200);
    }

    // 演出シーケンス
    const firstIsPlayer = result.playerFirst;
    showFilmBars();
    setPhase('first-label');
    setAttackLabel(firstIsPlayer ? 'プレイヤー攻撃' : 'エネミー攻撃');

    setTimeout(() => {
      setCurrentActions(result.firstActions);
      setPhase('first-attack');
      logActions(result.firstActions, firstIsPlayer);

      let dmg = 0;
      let hasCrit = false;
      for (const a of result.firstActions) {
        const hitEnemy = !a.targetIsPlayer;
        if (a.effectType === 'damage' && a.finalDamage > 0) {
          dmg += a.finalDamage;
          const isBig = a.finalDamage >= 20;
          if (isBig) { sfx.bigHit(); hasCrit = true; } else { sfx.hit(a.element); }
          addPopup(`-${a.finalDamage}`, ELEMENT_COLORS[a.element], hitEnemy ? 'enemy' : 'player', Math.floor(Math.random() * 3), isBig);
        } else if (a.effectType === 'heal') {
          sfx.heal();
          addPopup(`+${a.rawDamage}`, '#308050', hitEnemy ? 'player' : 'enemy', 1);
        } else if (a.effectType === 'buff') {
          sfx.buff();
        } else if (a.effectType === 'debuff') {
          sfx.debuff();
        }
      }
      if (dmg > 0) {
        doShake(firstIsPlayer ? 'enemy' : 'player');
        doScreenFlash(ELEMENT_COLORS[result.firstActions.find(a => a.effectType === 'damage')?.element ?? 'alloy'], hasCrit ? 250 : 180);
        const mainEl = result.firstActions.find(a => a.effectType === 'damage')?.element;
        if (mainEl) { showElementEffect(mainEl, firstIsPlayer ? 'top' : 'bottom'); showParticles(ELEMENT_COLORS[mainEl], firstIsPlayer ? 22 : 65, mainEl); }
      }

      setTimeout(() => {
        setCurrentActions([]);
        showFilmBars();
        setAttackLabel(firstIsPlayer ? 'エネミー攻撃' : 'プレイヤー攻撃');
        setPhase('second-label');

        setTimeout(() => {
          setCurrentActions(result.secondActions);
          setPhase('second-attack');
          logActions(result.secondActions, !firstIsPlayer);

          let dmg2 = 0;
          let hasCrit2 = false;
          for (const a of result.secondActions) {
            const hitEnemy = !a.targetIsPlayer;
            if (a.effectType === 'damage' && a.finalDamage > 0) {
              dmg2 += a.finalDamage;
              const isBig2 = a.finalDamage >= 20;
              if (isBig2) { sfx.bigHit(); hasCrit2 = true; } else { sfx.hit(a.element); }
              addPopup(`-${a.finalDamage}`, ELEMENT_COLORS[a.element], hitEnemy ? 'enemy' : 'player', Math.floor(Math.random() * 3), isBig2);
            } else if (a.effectType === 'heal') {
              sfx.heal();
              addPopup(`+${a.rawDamage}`, '#308050', hitEnemy ? 'player' : 'enemy', 1);
            } else if (a.effectType === 'buff') {
              sfx.buff();
            } else if (a.effectType === 'debuff') {
              sfx.debuff();
            }
          }
          if (dmg2 > 0) {
            doShake(firstIsPlayer ? 'player' : 'enemy');
            doScreenFlash(ELEMENT_COLORS[result.secondActions.find(a => a.effectType === 'damage')?.element ?? 'alloy'], hasCrit2 ? 250 : 180);
            const mainEl = result.secondActions.find(a => a.effectType === 'damage')?.element;
            if (mainEl) { showElementEffect(mainEl, firstIsPlayer ? 'bottom' : 'top'); showParticles(ELEMENT_COLORS[mainEl], firstIsPlayer ? 65 : 22, mainEl); }
          }
          for (const s of result.synergies) addLog(`  ★ ${s.name}: ${s.description}`);
          if (result.synergies.length > 0) {
            setTimeout(() => {
              sfx.synergy();
              setSynergyCutIn(result.synergies.map(s => s.name).join(' + '));
            }, 300);
          }

          setTimeout(() => {
            setCurrentActions([]); setAttackLabel('');
            // 合計ダメージ
            const allActions = [...result.firstActions, ...result.secondActions];
            const playerTotalDmg = allActions.filter(a => !a.targetIsPlayer && a.effectType === 'damage').reduce((s, a) => s + a.actualDamage, 0);
            const enemyTotalDmg = allActions.filter(a => a.targetIsPlayer && a.effectType === 'damage').reduce((s, a) => s + a.actualDamage, 0);
            addLog(`  合計 → 自分${playerTotalDmg}dmg / 敵${enemyTotalDmg}dmg`);
            // HP変動詳細
            const pDelta = result.playerHp - result.prePlayerHp;
            const eDelta = result.enemyHp - result.preEnemyHp;
            addLog(`  HP ${result.prePlayerHp}→${result.playerHp}(${pDelta >= 0 ? '+' : ''}${pDelta}) vs ${result.preEnemyHp}→${result.enemyHp}(${eDelta >= 0 ? '+' : ''}${eDelta})`);
            // ステータスエフェクト
            if (result.playerStatusDmg > 0) addLog(`  → 状態異常で自分に${result.playerStatusDmg}dmg`);
            if (result.enemyStatusDmg > 0) addLog(`  → 状態異常で敵に${result.enemyStatusDmg}dmg`);
            // 残存エフェクト
            const pEffects = result.playerEffects.filter(e => e.remainingTurns > 0);
            const eEffects = result.enemyEffects.filter(e => e.remainingTurns > 0);
            if (pEffects.length > 0) addLog(`  自分: ${pEffects.map(e => `${e.type}(${e.remainingTurns}T)`).join(' ')}`);
            if (eEffects.length > 0) addLog(`  敵: ${eEffects.map(e => `${e.type}(${e.remainingTurns}T)`).join(' ')}`);
            // ステータスインジケータ表示
            if (pEffects.length > 0) {
              setStatusIndicator({ effects: pEffects as Array<{type: string; element: string}>, side: 'bottom' });
              setTimeout(() => setStatusIndicator(null), 2100);
            } else if (eEffects.length > 0) {
              setStatusIndicator({ effects: eEffects as Array<{type: string; element: string}>, side: 'top' });
              setTimeout(() => setStatusIndicator(null), 2100);
            }
            // 倍率
            if (result.playerDmgMult !== 1.0 || result.enemyDmgMult !== 1.0) {
              addLog(`  攻撃倍率 自分x${result.playerDmgMult.toFixed(1)} / 敵x${result.enemyDmgMult.toFixed(1)}`);
            }
            addLog(`  CG ${result.playerCharge.current}${magicData ? '/' + magicData.cost : ''} vs ${result.enemyCharge.current}`);

            if (battle.status !== 'ongoing') {
              setPhase('result');
              if (battle.status === 'player-win') {
                sfx.victory();
                bgm.playOnce('victory');
                addLog('══ 勝利！ ══'); flash('勝利！', 1500);
                if (isPvpBattle) {
                  addPvpResult(true);
                  addGold(300);
                  addLog('  PVP勝利！ +3pt +300G');
                } else {
                  // 報酬まとめ
                  const { isHardMode: hardMode } = useGameStore.getState();
                  const hardMult = hardMode ? 1.5 : 1;
                  addLog(hardMode ? '── 報酬【高難度】 ──' : '── 報酬 ──');
                  const bonus = getPartyBonus();
                  const goldReward = Math.round((80 + enemyDiceList[0].rarity * 50) * bonus.goldMultiplier * hardMult);
                  addGold(goldReward);
                  const expReward = Math.round((20 + enemyDiceList[0].rarity * 15 + (currentChapter - 1) * 10) * hardMult);
                  const expResult = addExp(expReward);
                  addLog(`  ${goldReward}G / ${expReward}EXP`);
                  addLog(`  EXP ${expResult.currentExp}/${expResult.expToNext} (Lv${expResult.newLevel})`);
                  if (expResult.levelsGained > 0) {
                    sfx.levelUp();
                    addLog(`  ★ レベルアップ！ Lv${expResult.newLevel} (HP ${expResult.newMaxHp})`);
                    setTimeout(() => flash(`LEVEL UP! Lv${expResult.newLevel}`, 1500), 500);
                  }
                  // ルーンドロップ（章属性に70%偏り）
                  const chapterElements: Record<number, string> = { 1: 'blaze', 2: 'frost', 3: 'volt', 4: 'venom', 5: 'alloy', 6: 'mirage', 7: 'blaze' };
                  const chapterEl = chapterElements[currentChapter] || 'blaze';
                  const dropCount = 1 + (Math.random() < 0.4 ? 1 : 0);
                  const drops: typeof SKILL_RUNES = [];
                  for (let i = 0; i < dropCount; i++) {
                    const tierRoll = Math.random();
                    const tier = tierRoll < 0.6 ? 'common' : 'rare';
                    const useChapterEl = Math.random() < 0.7; // 70%で章属性
                    let pool = SKILL_RUNES.filter(r => r.tier === tier && (!useChapterEl || r.element === chapterEl));
                    if (pool.length === 0) pool = SKILL_RUNES.filter(r => r.tier === tier);
                    const rune = pool[Math.floor(Math.random() * pool.length)];
                    drops.push({ ...rune });
                    addLog(`  ルーン: ${rune.name}(${ELEMENT_NAMES[rune.element]}) [${rune.tier}]`);
                  }
                  addRunes(drops);
                  // 素材ドロップ
                  if (Math.random() < 0.5) { addMaterial('forge-stone', 1); addLog('  鍛冶石 x1'); }
                  if (Math.random() < 0.1) { addMaterial('rare-ore', 1); addLog('  レア鉱石 x1'); }
                  // 初回ウロボロス撃破 → エンディング
                  if (enemyDiceList[0].id === 'ouroboros' || (enemyDiceList[0] as any).baseId === 'ouroboros') {
                    const { bossesDefeated: prevBosses, endingShown: alreadyShown } = useGameStore.getState();
                    if (!prevBosses.includes('ouroboros') && !alreadyShown) {
                      defeatBoss(enemyDiceList[0].id);
                      addLog('  ボス撃破！');
                      const fragEnding = currentChapter <= 3 ? 1 : currentChapter <= 6 ? 3 : 5;
                      addGemFragments(fragEnding);
                      addLog(`  ジェムのかけら x${fragEnding}`);
                      setTimeout(() => {
                        save().then(() => setScreen('ending'));
                      }, 3000);
                      return; // エンディングへ（封印フェーズスキップ）
                    }
                  }
                  // ボスからかけら + ボス撃破記録
                  if (enemyDiceList[0].rarity >= 4) {
                    const fragments = currentChapter <= 3 ? 1 : currentChapter <= 6 ? 3 : 5;
                    addGemFragments(fragments);
                    addLog(`  ジェムのかけら x${fragments}`);
                    defeatBoss(enemyDiceList[0].id);
                    addLog('  ボス撃破！');
                  }
                }
              } else {
                sfx.defeat();
                bgm.playOnce('defeat');
                addLog('══ 敗北... ══'); flash('敗北...', 1500);
                if (isPvpBattle) {
                  addPvpResult(false);
                  addLog('  PVP敗北... +1pt');
                }
              }
            } else {
              setPhase('turn-end');
            }
          }, 800);
        }, 400);
      }, 800);
    }, 400);
  }, [battle, currentRolls, enemyRolls, selectedDice, addLog, addPopup, doShake, flash, addGold, enemyDiceList, logActions, showElementEffect, showParticles, getPartyBonus, doScreenFlash, showFilmBars]);

  // ===== 次のターン =====
  const doNextTurn = useCallback(() => {
    if (!battle || battle.status !== 'ongoing') return;
    sfx.click();
    setPhase('rolling');
    setTimeout(() => sfx.diceRoll(), 100);
    setTimeout(() => {
      const pRolls = rollParty(battle.player.dice);
      const eRolls = rollParty(battle.enemy.dice);
      setCurrentRolls(pRolls);
      setEnemyRolls(eRolls);
      setSelectedDice(new Set());
      setMagicUsedThisTurn(false);
      setMagicEffect(null);
      setDiceLanded(true);
      sfx.diceLand();
      setPhase('selecting');
      addLog(`── Turn ${battle.turn + 1} ──`);
    }, 600);
  }, [battle, addLog]);

  // ===== 封印 =====
  const startCapture = useCallback(() => { sfx.click(); setPhase('capture'); }, []);
  const onCaptureComplete = useCallback((captureRes: { success: boolean; roll: number; captureRate: number; effectiveRate: number }) => {
    if (!currentEnemy || !currentEnemy[0]) return;
    const monster = currentEnemy[0];
    if (captureRes.success) { addDice({ ...monster }); captureMonster(monster.id); }
    autoSaveAndGo('dungeon');
  }, [currentEnemy, addDice, captureMonster, autoSaveAndGo]);

  const isRolling = phase === 'rolling';
  const isAnimating = ['first-label', 'first-attack', 'second-label', 'second-attack'].includes(phase);

  // HP表示
  let displayPlayerHp = battle?.player.hp ?? 0;
  let displayEnemyHp = battle?.enemy.hp ?? 0;
  if (lastTurn) {
    if (phase === 'first-label') {
      // 先攻演出前: ターン開始時のHP
      displayPlayerHp = lastTurn.prePlayerHp;
      displayEnemyHp = lastTurn.preEnemyHp;
    } else if (['first-attack', 'second-label'].includes(phase)) {
      // 先攻演出中/後攻ラベル: 先攻アクション適用後のHP
      displayPlayerHp = lastTurn.midPlayerHp;
      displayEnemyHp = lastTurn.midEnemyHp;
    }
    // selecting, rolling, turn-end, result: battle.player.hpをそのまま表示
  }

  return (
    <div style={{ padding: 0, height: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f0e8', position: 'relative', overflow: 'hidden' }}>
      {/* Screen flash overlay */}
      {screenFlash && (
        <div style={{
          position: 'absolute', inset: 0,
          background: screenFlash, opacity: 0.15,
          pointerEvents: 'none', zIndex: 300,
          animation: `screenFlash ${screenFlashMs / 1000}s ease forwards`,
        }} />
      )}

      {/* Film bars for turn transition */}
      {filmBars && (
        <>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 24,
            background: '#3a2a1a', zIndex: 250, pointerEvents: 'none',
            transformOrigin: 'left',
            animation: 'filmBarIn 0.15s ease forwards, filmBarOut 0.15s ease 0.25s forwards',
          }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 24,
            background: '#3a2a1a', zIndex: 250, pointerEvents: 'none',
            transformOrigin: 'right',
            animation: 'filmBarIn 0.15s ease forwards, filmBarOut 0.15s ease 0.25s forwards',
          }} />
        </>
      )}

      {centerMessage && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, pointerEvents: 'none', animation: `centerFlash ${flashDuration}ms ease forwards` }}>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#705828', letterSpacing: 4 }}>{centerMessage}</div>
        </div>
      )}
      {popups.map(p => {
        const xBase = p.idx === 0 ? 18 : p.idx === 1 ? 50 : 82;
        const yBase = p.side === 'enemy' ? 18 : 58;
        const isDmg = p.text.startsWith('-');
        const fontSize = p.big ? 38 : isDmg ? 28 : 18;
        return (
          <div key={p.id} style={{
            position: 'absolute',
            left: `${xBase + (Math.random() - 0.5) * 10}%`,
            top: `${yBase}%`,
            color: p.color,
            fontSize,
            fontWeight: 'bold',
            zIndex: 150,
            pointerEvents: 'none',
            animation: p.big ? 'criticalPop 1.2s ease-out forwards' : 'damagePop 1.2s ease-out forwards',
            textShadow: p.big ? `0 0 8px ${p.color}80, 0 0 16px ${p.color}40` : isDmg ? `0 1px 0 ${p.color}40` : 'none',
          }}>{p.text}</div>
        );
      })}
      {effectElement && <ElementEffect element={effectElement} side={effectSide} />}
      {particles && <Particles color={particles.color} originY={particles.y} element={particles.element} />}
      {synergyCutIn && <SynergyCutIn name={synergyCutIn} onDone={() => setSynergyCutIn(null)} />}
      {hitFlashSide && <HitFlash side={hitFlashSide} />}
      {statusIndicator && <StatusIndicator effects={statusIndicator.effects as any} side={statusIndicator.side} />}

      {/* ボス入場カットイン */}
      {bossEntrance && isBoss && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 500,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          animation: 'bossEntranceOverlay 1.5s ease forwards',
        }}>
          {/* WARNING text */}
          <div style={{
            fontSize: 14, color: '#b04030', letterSpacing: 6,
            fontWeight: 'bold', marginBottom: 16,
            animation: 'bossWarning 0.5s ease infinite',
          }}>
            WARNING
          </div>
          {/* Boss sprite */}
          <div style={{ animation: 'bossEntranceSprite 1s ease both' }}>
            <MonsterSprite monsterId={enemyDiceList[0]?.id} element={enemyDiceList[0]?.element} size={80} animate />
          </div>
          {/* Boss name */}
          <div style={{
            fontSize: 20, fontWeight: 'bold', marginTop: 16,
            color: ELEMENT_COLORS[enemyDiceList[0]?.element],
            letterSpacing: 4,
            animation: 'bossEntranceText 1.2s ease both',
          }}>
            {enemyDiceList[0]?.name}
          </div>
          {/* Rarity stars */}
          <div style={{
            fontSize: 16, color: '#d0a030', marginTop: 8,
            animation: 'bossEntranceText 1.2s ease 0.2s both',
          }}>
            {'★'.repeat(enemyDiceList[0]?.rarity || 0)}
          </div>
        </div>
      )}

      {/* 敵エリア */}
      <div style={{ padding: '6px 12px 0', flex: '0 0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 10, color: '#b04030', minWidth: 42 }}>敵</span>
          <div style={{ flex: 1 }}>
            {battle ? <HpBar current={displayEnemyHp} max={battle.enemy.maxHp} color="enemy" /> : <div style={{ height: 16 }} />}
            {battle && <ChargeBar gauge={battle.enemy.charge} />}

          </div>
          {battle && <span style={{ fontSize: 9, color: '#6a5a4a', minWidth: 50, textAlign: 'right' }}>T{turnCount}/{battle.maxTurns}</span>}
        </div>
        <div className={shakeEnemy ? 'heavy-shake' : ''} style={{ display: 'flex', gap: 12, justifyContent: 'center', padding: '4px 0' }}>
          {enemyDiceList.slice(0, 3).map((d, i) => {
            const fn = (enemyRolls ?? lastTurn?.enemyRolls)?.[i]?.faceNumber ?? 1;
            return (
              <div key={i} style={{ textAlign: 'center' }}>
                <MonsterSprite monsterId={d.id} element={d.element} size={40} animate={!isRolling && phase !== 'ready'} hurt={hurtEnemy} />
                <DiceSlot dice={d} faceNumber={fn} rolling={isRolling} phase={phase} landed={diceLanded} />
              </div>
            );
          })}
        </div>
      </div>

      {/* 中央 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, padding: '0 8px' }}>
        {/* スキル演出 */}
        <div style={{ minHeight: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2px 0' }}>
          {attackLabel && (
            <div style={{
              fontSize: 16, fontWeight: 'bold', letterSpacing: 3, marginBottom: 4,
              color: attackLabel.includes('プレイヤー') ? '#4070a0' : '#b04030',
              animation: 'attackLabelIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            }}>{attackLabel}</div>
          )}
          {currentActions.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', maxWidth: '100%' }}>
              {currentActions.map((a, i) => (
                <div key={i} style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 4,
                  background: `${ELEMENT_COLORS[a.element]}20`,
                  border: `1px solid ${ELEMENT_COLORS[a.element]}80`,
                  color: ELEMENT_COLORS[a.element],
                  animation: `skillSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.08}s both`,
                }}>
                  <span style={{ fontWeight: 'bold' }}>{a.skillName}</span>
                  {a.effectType === 'damage' && a.finalDamage > 0 && <span style={{ marginLeft: 3, color: '#3a2a1a', fontWeight: 'bold' }}>{a.finalDamage}</span>}
                  {a.effectType === 'heal' && <span style={{ marginLeft: 3, color: '#308050', fontWeight: 'bold' }}>+{a.rawDamage}</span>}
                </div>
              ))}
            </div>
          )}
          {phase === 'ready' && enemyDiceList[0] && (
            <div style={{ fontSize: 13, color: '#998a78' }}>
              VS <span style={{ color: ELEMENT_COLORS[enemyDiceList[0].element] }}>{'★'.repeat(enemyDiceList[0].rarity)} {enemyDiceList[0].name}</span>
            </div>
          )}
          {phase === 'selecting' && (
            <div style={{ fontSize: 11, color: '#705828' }}>2個を選んで発動、1個は充填へ</div>
          )}
        </div>

        {/* ログ */}
        <div ref={logRef} style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '3px 6px', fontSize: 9, fontFamily: 'monospace', background: '#ece5d8', borderRadius: 2, border: '1px solid #d8d0c4' }}>
          {log.map((line, i) => {
            const c = line.startsWith('══') ? (line.includes('勝利') ? '#308050' : '#b04030')
              : line.startsWith('──') ? '#8a7050'
              : line.startsWith('  ★') ? '#705828'
              : line.includes('ルーン獲得') ? '#4070a0'
              : line.includes('封印') ? (line.includes('成功') ? '#308050' : '#b04030')
              : line.startsWith('  合計') ? '#3a2a1a'
              : line.includes('状態異常で') ? '#906020'
              : line.startsWith('  自分:') || line.startsWith('  敵:') ? '#7050a0'
              : line.startsWith('  攻撃倍率') ? '#3070a0'
              : line.startsWith('  HP ') ? '#4a6a4a'
              : line.startsWith('  CG ') ? '#8a7050'
              : line.includes('[敵]') ? '#b04030'
              : line.startsWith('→') ? '#998a78'
              : '#6a5a4a';
            return <div key={i} style={{ color: c, lineHeight: 1.3 }}>{line}</div>;
          })}
        </div>
      </div>

      {/* プレイヤーエリア */}
      <div style={{ padding: '0 12px 4px', flex: '0 0 auto' }}>
        <div className={shakePlayer ? 'heavy-shake' : ''} style={{ display: 'flex', gap: 12, justifyContent: 'center', padding: '4px 0' }}>
          {playerDice.slice(0, 3).map((d, i) => {
            const fn = (currentRolls ?? lastTurn?.playerRolls)?.[i]?.faceNumber ?? 1;
            const isActive = selectedDice.has(i);
            const isCharge = phase === 'selecting' && selectedDice.size === 2 && !selectedDice.has(i);
            return (
              <div key={i} style={{
                textAlign: 'center', cursor: phase === 'selecting' ? 'pointer' : 'default',
                opacity: isCharge ? 0.35 : 1,
                transform: isCharge ? 'scale(0.9)' : 'scale(1)',
                transition: 'opacity 0.25s, transform 0.25s',
                filter: isCharge ? 'grayscale(0.5)' : 'none',
              }} onClick={() => phase === 'selecting' && toggleDiceSelection(i)}>
                <DiceSlot dice={d} faceNumber={fn} rolling={isRolling} phase={phase} landed={diceLanded}
                  highlight={isActive && phase === 'selecting'} />
                <MonsterSprite monsterId={d.id} element={d.element} size={40} animate={!isRolling && phase !== 'ready'} hurt={hurtPlayer} />
                {/* 選択ラベル */}
                {phase === 'selecting' && (
                  <div style={{
                    fontSize: 9, fontWeight: 'bold', marginTop: 1,
                    color: isCharge ? '#998a78' : isActive ? '#705828' : '#c0b8a8',
                    letterSpacing: isActive ? 1 : 0,
                  }}>
                    {isCharge ? `充填 +${fn}` : isActive ? '発動' : '---'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <span style={{ fontSize: 10, color: '#4070a0', minWidth: 42 }}>味方</span>
          <div style={{ flex: 1 }}>
            {battle ? <HpBar current={displayPlayerHp} max={battle.player.maxHp} /> : <div style={{ height: 16 }} />}
            {battle && <ChargeBar gauge={battle.player.charge} magicCost={magicData?.cost} magicName={magicData?.name} />}
          </div>
        </div>
      </div>

      {/* アクションバー */}
      <div style={{ padding: '6px 12px 10px', flex: '0 0 auto', minHeight: 56, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {phase === 'ready' && (
          <button className="rpg-btn rpg-btn-primary" onClick={startBattle} style={{ fontSize: 15, padding: '12px 20px', margin: 0 }}>戦闘開始</button>
        )}
        {phase === 'selecting' && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="rpg-btn rpg-btn-primary" onClick={confirmSelection}
              style={{ flex: 2, fontSize: 15, padding: '10px 8px', margin: 0, opacity: (magicEffect === 'unleash' ? selectedDice.size === 3 : selectedDice.size === 2) ? 1 : 0.4 }}
              disabled={magicEffect === 'unleash' ? selectedDice.size !== 3 : selectedDice.size !== 2}>
              実行
            </button>
            {equippedMagicDice && battle && !magicUsedThisTurn && (() => {
              const md = getMagicDice(equippedMagicDice);
              if (!md) return null;
              const canUse = battle.player.charge.current >= md.cost;
              return (
                <button className="rpg-btn" onClick={() => useMagicDice(md)}
                  style={{ flex: 1, margin: 0, padding: '10px 8px', opacity: canUse ? 1 : 0.4,
                    borderColor: canUse ? '#b09050' : '#c0b8a8',
                    color: canUse ? '#705828' : '#998a78', fontSize: 11 }}
                  disabled={!canUse}>
                  {canUse ? md.name : `${md.name} (${md.cost})`}
                </button>
              );
            })()}
          </div>
        )}
        {phase === 'turn-end' && (
          <button className="rpg-btn rpg-btn-primary" onClick={doNextTurn} style={{ fontSize: 15, padding: '12px 20px', margin: 0 }}>ダイスロール</button>
        )}
        {(isAnimating || isRolling) && (
          <div style={{ textAlign: 'center', padding: '12px 20px', fontSize: 12, color: '#6a5a4a', letterSpacing: 2 }}>
            {isRolling ? '...' : '...'}
          </div>
        )}
        {phase === 'result' && battle?.status === 'player-win' && !isPvpBattle && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="rpg-btn rpg-btn-primary" onClick={startCapture} style={{ flex: 2, margin: 0, padding: '10px 12px' }}>封印する</button>
            <button className="rpg-btn" onClick={() => { sfx.click(); autoSaveAndGo('dungeon'); }} style={{ flex: 1, margin: 0, padding: '10px 12px' }}>スキップ</button>
          </div>
        )}
        {phase === 'result' && battle?.status === 'player-win' && isPvpBattle && (
          <div>
            <div style={{ textAlign: 'center', color: '#705828', fontSize: 11, marginBottom: 4 }}>PVP勝利！ +3pt +300G</div>
            <button className="rpg-btn" onClick={() => { sfx.click(); autoSaveAndGo('pvp'); }} style={{ margin: 0, padding: '10px 12px' }}>決闘場に戻る</button>
          </div>
        )}
        {phase === 'result' && battle && battle.status !== 'player-win' && (
          <button className="rpg-btn" onClick={() => { sfx.click(); autoSaveAndGo(isPvpBattle ? 'pvp' : 'dungeon'); }} style={{ margin: 0, padding: '10px 12px' }}>戻る</button>
        )}
        {phase === 'capture' && (<div style={{ textAlign: 'center', fontSize: 11, color: '#6a5a4a' }}>封印中...</div>)}
      </div>

      {phase === 'capture' && currentEnemy && currentEnemy[0] && (
        <CaptureScene monster={currentEnemy[0]} onComplete={onCaptureComplete} onSkip={() => autoSaveAndGo('dungeon')} captureBonus={getPartyBonus().captureBonus} />
      )}
    </div>
  );
}

// ===== ダイススロット =====
function DiceSlot({ dice, faceNumber, rolling, phase, landed, highlight }: {
  dice: MonsterDice; faceNumber: number; rolling: boolean; phase: Phase; landed?: boolean; highlight?: boolean;
}) {
  const elColor = ELEMENT_COLORS[dice.element];
  const isActive = ['first-attack', 'second-attack'].includes(phase);
  const showLand = !rolling && landed && phase === 'selecting';

  return (
    <div style={{ textAlign: 'center', position: 'relative' }}>
      <div className={showLand ? 'dice-slam' : ''} style={{
        position: 'relative', transition: 'transform 0.2s',
        transform: isActive ? 'scale(1.08)' : 'scale(1)',
      }}>
        <DiceFaceView faceNumber={faceNumber} size={68} rolling={rolling}
          borderColor={highlight ? '#8a7050' : elColor}
          pipColors={getPipColorsForDiceFace(dice, faceNumber)} />
        {isActive && (
          <div style={{ position: 'absolute', inset: -3, border: `2px solid ${elColor}`, borderRadius: 4, animation: 'pulseGlow 0.8s ease infinite', color: elColor, pointerEvents: 'none' }} />
        )}
        {highlight && (
          <div style={{
            position: 'absolute', inset: -3,
            border: '2px solid #8a7050', borderRadius: 4,
            pointerEvents: 'none',
            animation: 'actGlow 1s ease infinite',
          }} />
        )}
      </div>
      {!rolling && (
        <div style={{ fontSize: 13, fontWeight: 'bold', color: elColor, lineHeight: 1, marginTop: 1 }}>{faceNumber}</div>
      )}
    </div>
  );
}
