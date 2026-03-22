import { useState, useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { createBattleState, executeTurnFull, rollParty, aiSelectDice } from '../../game/battle/BattleEngine';
import type { BattleState, TurnResult, MonsterDice, SkillAction, DiceRollResult, TurnSelection, Element } from '../../types';
import { ELEMENT_NAMES } from '../../types';
import { SKILL_RUNES } from '../../data/skill-runes';
import { HpBar } from '../common/HpBar';
import { ChargeBar } from '../common/ChargeBar';
import { DiceFaceView } from '../common/DiceFaceView';
import { ELEMENT_COLORS } from '../common/ElementBadge';
import { getPipColorsForDiceFace } from '../../utils/pipColors';
import { MonsterSprite } from '../common/MonsterSprite';
import { ElementEffect, SynergyCutIn, Particles } from './BattleEffects';
import { CaptureScene } from './CaptureScene';

type Phase =
  | 'ready' | 'rolling' | 'selecting'
  | 'first-label' | 'first-attack'
  | 'second-label' | 'second-attack'
  | 'turn-end' | 'result' | 'capture';

let popupId = 0;
interface Popup { id: number; text: string; color: string; side: 'enemy' | 'player'; idx: number; }

export function BattleScreen() {
  const { currentEnemy, ownedDice, party, setScreen, addDice, addRunes, captureMonster, addGold, addMaterial } = useGameStore();
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
  const [particles, setParticles] = useState<{ color: string; y: number } | null>(null);
  const [synergyCutIn, setSynergyCutIn] = useState<string | null>(null);
  const [hurtEnemy, setHurtEnemy] = useState(false);
  const [hurtPlayer, setHurtPlayer] = useState(false);
  const [diceLanded, setDiceLanded] = useState(false);

  // 選択フェーズ用
  const [currentRolls, setCurrentRolls] = useState<DiceRollResult[] | null>(null);
  const [enemyRolls, setEnemyRolls] = useState<DiceRollResult[] | null>(null);
  const [selectedDice, setSelectedDice] = useState<Set<number>>(new Set()); // 発動するダイスのインデックス

  const playerDice = party.map(id => ownedDice.find(d => d.id === id)).filter(Boolean) as MonsterDice[];
  const enemyDiceList = currentEnemy || [];

  useEffect(() => { if (popups.length > 0) { const t = setTimeout(() => setPopups([]), 1500); return () => clearTimeout(t); } }, [popups]);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);

  const addLog = useCallback((msg: string) => setLog(prev => [...prev, msg]), []);
  const addPopup = useCallback((text: string, color: string, side: 'enemy' | 'player', idx = 0) => {
    setPopups(prev => [...prev, { id: ++popupId, text, color, side, idx }]);
  }, []);
  const doShake = useCallback((side: 'enemy' | 'player') => {
    if (side === 'enemy') { setShakeEnemy(true); setHurtEnemy(true); setTimeout(() => { setShakeEnemy(false); setHurtEnemy(false); }, 400); }
    else { setShakePlayer(true); setHurtPlayer(true); setTimeout(() => { setShakePlayer(false); setHurtPlayer(false); }, 400); }
  }, []);
  const flash = useCallback((msg: string, duration = 800) => { setCenterMessage(msg); setTimeout(() => setCenterMessage(null), duration); }, []);
  const showElementEffect = useCallback((el: Element, side: 'top' | 'bottom') => { setEffectElement(el); setEffectSide(side); setTimeout(() => setEffectElement(null), 600); }, []);
  const showParticles = useCallback((color: string, y: number) => { setParticles({ color, y }); setTimeout(() => setParticles(null), 800); }, []);

  const logActions = useCallback((actions: SkillAction[]) => {
    if (actions.length === 0) { addLog('  (なし)'); return; }
    for (const a of actions) {
      const elName = ELEMENT_NAMES[a.element];
      if (a.effectType === 'damage' && a.finalDamage > 0) addLog(`  ${a.skillName}(${elName}) → ${a.finalDamage}dmg`);
      else if (a.effectType === 'heal') addLog(`  ${a.skillName}(${elName}) → +${a.rawDamage}HP`);
      else addLog(`  ${a.skillName}(${elName}) → ${a.effectType}`);
    }
  }, [addLog]);

  // ===== バトル開始 =====
  const startBattle = useCallback(() => {
    if (playerDice.length < 3 || enemyDiceList.length < 3) return;
    const enemyMaxHp = 40 + Math.max(...enemyDiceList.map(d => d.rarity)) * 10;
    const state = createBattleState(playerDice, enemyDiceList, 60, enemyMaxHp);
    setBattle(state);
    setPhase('rolling');
    setLog([]); addLog('BATTLE START!');
    flash('BATTLE START!', 800);

    // ダイスロール
    setTimeout(() => {
      const pRolls = rollParty(state.player.dice);
      const eRolls = rollParty(state.enemy.dice);
      setCurrentRolls(pRolls);
      setEnemyRolls(eRolls);
      setSelectedDice(new Set());
      setDiceLanded(true);
      setPhase('selecting'); // 選択フェーズへ
      addLog(`── Turn ${state.turn + 1} ──`);
    }, 800);
  }, [playerDice, enemyDiceList, flash, addLog]);

  // ===== ダイス選択トグル =====
  const toggleDiceSelection = useCallback((idx: number) => {
    setSelectedDice(prev => {
      const next = new Set(prev);
      if (next.has(idx)) { next.delete(idx); }
      else if (next.size < 2) { next.add(idx); }
      return next;
    });
  }, []);

  // ===== GO: 選択確定 → ターン実行 =====
  const confirmSelection = useCallback(() => {
    if (!battle || !currentRolls || !enemyRolls || selectedDice.size !== 2) return;

    const activeArr = Array.from(selectedDice) as [number, number];
    const chargeIdx = [0, 1, 2].find(i => !selectedDice.has(i))!;
    const playerSel: TurnSelection = { activateIndices: activeArr, chargeIndex: chargeIdx };

    // 敵AI選択
    const enemySel = aiSelectDice(battle.enemy.dice, enemyRolls, battle.enemy.charge, battle.enemy.hp);

    addLog(`発動: ダイス${activeArr.map(i => i + 1).join(',')} / 充填: ダイス${chargeIdx + 1}(+${currentRolls[chargeIdx].faceNumber})`);

    // ターン実行
    const result = executeTurnFull(battle, currentRolls, enemyRolls, playerSel, enemySel);
    setBattle({ ...battle });
    setLastTurn(result);
    setTurnCount(result.turn);

    addLog(`出目 [${result.playerRolls.map(r => r.faceNumber).join(',')}] vs [${result.enemyRolls.map(r => r.faceNumber).join(',')}]`);
    addLog(result.playerFirst ? '→ プレイヤー先攻' : '→ エネミー先攻');
    if (result.chargedUsedPlayer) addLog('  ★ CHARGED! 威力1.5倍');

    // 演出シーケンス
    const firstIsPlayer = result.playerFirst;
    setPhase('first-label');
    setAttackLabel(firstIsPlayer ? 'PLAYER ATTACK' : 'ENEMY ATTACK');

    setTimeout(() => {
      setCurrentActions(result.firstActions);
      setPhase('first-attack');
      logActions(result.firstActions);

      let dmg = 0;
      for (const a of result.firstActions) {
        const hitEnemy = !a.targetIsPlayer;
        if (a.effectType === 'damage' && a.finalDamage > 0) {
          dmg += a.finalDamage;
          addPopup(`-${a.finalDamage}`, ELEMENT_COLORS[a.element], hitEnemy ? 'enemy' : 'player', Math.floor(Math.random() * 3));
        } else if (a.effectType === 'heal') {
          addPopup(`+${a.rawDamage}`, '#308050', hitEnemy ? 'player' : 'enemy', 1);
        }
      }
      if (dmg > 0) {
        doShake(firstIsPlayer ? 'enemy' : 'player');
        const mainEl = result.firstActions.find(a => a.effectType === 'damage')?.element;
        if (mainEl) { showElementEffect(mainEl, firstIsPlayer ? 'top' : 'bottom'); showParticles(ELEMENT_COLORS[mainEl], firstIsPlayer ? 22 : 65); }
      }

      setTimeout(() => {
        setCurrentActions([]);
        setAttackLabel(firstIsPlayer ? 'ENEMY ATTACK' : 'PLAYER ATTACK');
        setPhase('second-label');

        setTimeout(() => {
          setCurrentActions(result.secondActions);
          setPhase('second-attack');
          logActions(result.secondActions);

          let dmg2 = 0;
          for (const a of result.secondActions) {
            const hitEnemy = !a.targetIsPlayer;
            if (a.effectType === 'damage' && a.finalDamage > 0) {
              dmg2 += a.finalDamage;
              addPopup(`-${a.finalDamage}`, ELEMENT_COLORS[a.element], hitEnemy ? 'enemy' : 'player', Math.floor(Math.random() * 3));
            } else if (a.effectType === 'heal') {
              addPopup(`+${a.rawDamage}`, '#308050', hitEnemy ? 'player' : 'enemy', 1);
            }
          }
          if (dmg2 > 0) {
            doShake(firstIsPlayer ? 'player' : 'enemy');
            const mainEl = result.secondActions.find(a => a.effectType === 'damage')?.element;
            if (mainEl) { showElementEffect(mainEl, firstIsPlayer ? 'bottom' : 'top'); showParticles(ELEMENT_COLORS[mainEl], firstIsPlayer ? 65 : 22); }
          }
          for (const s of result.synergies) addLog(`  ★ ${s.name}`);
          if (result.synergies.length > 0) setTimeout(() => setSynergyCutIn(result.synergies.map(s => s.name).join(' + ')), 300);

          setTimeout(() => {
            setCurrentActions([]); setAttackLabel('');
            addLog(`  HP ${result.playerHp} vs ${result.enemyHp} | CG ${result.playerCharge.current}/${result.playerCharge.max}`);

            if (battle.status !== 'ongoing') {
              setPhase('result');
              if (battle.status === 'player-win') {
                addLog('══ 勝利！ ══'); flash('WIN!', 1500);
                addGold(50 + enemyDiceList[0].rarity * 30);
              } else { addLog('══ 敗北... ══'); flash('LOSE...', 1500); }
            } else {
              setPhase('turn-end');
            }
          }, 800);
        }, 400);
      }, 800);
    }, 400);
  }, [battle, currentRolls, enemyRolls, selectedDice, addLog, addPopup, doShake, flash, addGold, enemyDiceList, logActions, showElementEffect, showParticles]);

  // ===== 次のターン =====
  const doNextTurn = useCallback(() => {
    if (!battle || battle.status !== 'ongoing') return;
    setPhase('rolling');
    setTimeout(() => {
      const pRolls = rollParty(battle.player.dice);
      const eRolls = rollParty(battle.enemy.dice);
      setCurrentRolls(pRolls);
      setEnemyRolls(eRolls);
      setSelectedDice(new Set());
      setDiceLanded(true);
      setPhase('selecting');
      addLog(`── Turn ${battle.turn + 1} ──`);
    }, 600);
  }, [battle, addLog]);

  // ===== 封印 =====
  const startCapture = useCallback(() => setPhase('capture'), []);
  const onCaptureComplete = useCallback((captureRes: { success: boolean; roll: number; captureRate: number; effectiveRate: number }) => {
    if (!currentEnemy || !currentEnemy[0]) return;
    const monster = currentEnemy[0];
    if (captureRes.success) { addDice({ ...monster }); captureMonster(monster.id); addLog(`封印成功！ ${monster.name}をGET！`); }
    else addLog(`封印失敗... ${monster.name}は逃げた`);
    const drops: typeof SKILL_RUNES = [];
    const dropCount = 1 + (Math.random() < 0.4 ? 1 : 0);
    const commonR = SKILL_RUNES.filter(r => r.tier === 'common');
    const rareR = SKILL_RUNES.filter(r => r.tier === 'rare');
    for (let i = 0; i < dropCount; i++) {
      const pool = Math.random() < 0.2 ? rareR : commonR;
      const rune = pool[Math.floor(Math.random() * pool.length)];
      drops.push({ ...rune }); addLog(`  ルーン獲得: ${rune.name}(${ELEMENT_NAMES[rune.element]})`);
    }
    addRunes(drops);
    if (Math.random() < 0.5) { addMaterial('forge-stone', 1); addLog('  素材獲得: 鍛冶石 x1'); }
    if (Math.random() < 0.1) { addMaterial('rare-ore', 1); addLog('  素材獲得: レア鉱石 x1'); }
    setScreen('dungeon');
  }, [currentEnemy, addDice, captureMonster, addRunes, addLog, addMaterial, setScreen]);

  const isRolling = phase === 'rolling';
  const isAnimating = ['first-label', 'first-attack', 'second-label', 'second-attack'].includes(phase);

  // HP表示
  let displayPlayerHp = battle?.player.hp ?? 0;
  let displayEnemyHp = battle?.enemy.hp ?? 0;
  if (lastTurn) {
    if (['selecting', 'rolling', 'first-label'].includes(phase)) {
      displayPlayerHp = lastTurn.prePlayerHp;
      displayEnemyHp = lastTurn.preEnemyHp;
    } else if (['first-attack', 'second-label'].includes(phase)) {
      displayPlayerHp = lastTurn.midPlayerHp;
      displayEnemyHp = lastTurn.midEnemyHp;
    }
  }

  // 選択フェーズ: 充填に回すダイスのインデックス
  // chargeIdxは選択UIのラベル表示で使用（インラインで計算）

  return (
    <div style={{ padding: 0, height: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f0e8', position: 'relative', overflow: 'hidden' }}>
      {centerMessage && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, pointerEvents: 'none' }}>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#705828', animation: 'centerFlash 0.8s ease', letterSpacing: 4 }}>{centerMessage}</div>
        </div>
      )}
      {popups.map(p => {
        const xBase = p.idx === 0 ? 18 : p.idx === 1 ? 50 : 82;
        const yBase = p.side === 'enemy' ? 18 : 58;
        return (<div key={p.id} style={{ position: 'absolute', left: `${xBase + (Math.random() - 0.5) * 10}%`, top: `${yBase}%`, color: p.color, fontSize: p.text.startsWith('+') ? 18 : 26, fontWeight: 'bold', zIndex: 150, pointerEvents: 'none', animation: 'popupFloat 1.2s ease-out forwards' }}>{p.text}</div>);
      })}
      {effectElement && <ElementEffect element={effectElement} side={effectSide} />}
      {particles && <Particles color={particles.color} originY={particles.y} />}
      {synergyCutIn && <SynergyCutIn name={synergyCutIn} onDone={() => setSynergyCutIn(null)} />}

      {/* 敵エリア */}
      <div style={{ padding: '6px 12px 0', flex: '0 0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 10, color: '#b04030', minWidth: 42 }}>ENEMY</span>
          <div style={{ flex: 1 }}>
            {battle ? <HpBar current={displayEnemyHp} max={battle.enemy.maxHp} color="enemy" /> : <div style={{ height: 16 }} />}
            {battle && <ChargeBar gauge={battle.enemy.charge} />}
          </div>
          {battle && <span style={{ fontSize: 9, color: '#6a5a4a', minWidth: 50, textAlign: 'right' }}>T{turnCount}/{battle.maxTurns}</span>}
        </div>
        <div className={shakeEnemy ? 'shake' : ''} style={{ display: 'flex', gap: 12, justifyContent: 'center', padding: '4px 0' }}>
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
        <div style={{ minHeight: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2px 0' }}>
          {attackLabel && (
            <div style={{ fontSize: 12, fontWeight: 'bold', letterSpacing: 3, marginBottom: 4, color: attackLabel.includes('PLAYER') ? '#4070a0' : '#b04030', animation: 'fadeIn 0.3s ease' }}>{attackLabel}</div>
          )}
          {currentActions.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', maxWidth: '100%' }}>
              {currentActions.map((a, i) => (
                <div key={i} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: `${ELEMENT_COLORS[a.element]}20`, border: `1px solid ${ELEMENT_COLORS[a.element]}80`, color: ELEMENT_COLORS[a.element], animation: `skillPop 0.3s ease ${i * 0.06}s both` }}>
                  <span style={{ fontWeight: 'bold' }}>{a.skillName}</span>
                  {a.effectType === 'damage' && a.finalDamage > 0 && <span style={{ marginLeft: 3, color: '#3a2a1a' }}>{a.finalDamage}</span>}
                  {a.effectType === 'heal' && <span style={{ marginLeft: 3, color: '#308050' }}>+{a.rawDamage}</span>}
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
          {log.map((line, i) => (
            <div key={i} style={{
              color: line.startsWith('══') ? (line.includes('勝利') ? '#308050' : '#b04030')
                : line.startsWith('──') ? '#8a7050' : line.startsWith('  ★') ? '#705828'
                : line.includes('ルーン獲得') ? '#4070a0' : line.includes('封印') ? (line.includes('成功') ? '#308050' : '#b04030')
                : line.startsWith('→') ? '#998a78' : '#6a5a4a', lineHeight: 1.3,
            }}>{line}</div>
          ))}
        </div>
      </div>

      {/* プレイヤーエリア */}
      <div style={{ padding: '0 12px 4px', flex: '0 0 auto' }}>
        <div className={shakePlayer ? 'shake' : ''} style={{ display: 'flex', gap: 12, justifyContent: 'center', padding: '4px 0' }}>
          {playerDice.slice(0, 3).map((d, i) => {
            const fn = (currentRolls ?? lastTurn?.playerRolls)?.[i]?.faceNumber ?? 1;
            const isActive = selectedDice.has(i);
            const isCharge = phase === 'selecting' && selectedDice.size === 2 && !selectedDice.has(i);
            return (
              <div key={i} style={{
                textAlign: 'center', cursor: phase === 'selecting' ? 'pointer' : 'default',
                opacity: isCharge ? 0.45 : 1, transition: 'opacity 0.2s',
              }} onClick={() => phase === 'selecting' && toggleDiceSelection(i)}>
                <DiceSlot dice={d} faceNumber={fn} rolling={isRolling} phase={phase} landed={diceLanded}
                  highlight={isActive && phase === 'selecting'} />
                <MonsterSprite monsterId={d.id} element={d.element} size={40} animate={!isRolling && phase !== 'ready'} hurt={hurtPlayer} />
                {/* 選択ラベル */}
                {phase === 'selecting' && (
                  <div style={{ fontSize: 8, fontWeight: 'bold', marginTop: 1, color: isCharge ? '#998a78' : isActive ? '#705828' : '#c0b8a8' }}>
                    {isCharge ? `CHG +${fn}` : isActive ? 'ACT' : '---'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <span style={{ fontSize: 10, color: '#4070a0', minWidth: 42 }}>PLAYER</span>
          <div style={{ flex: 1 }}>
            {battle ? <HpBar current={displayPlayerHp} max={battle.player.maxHp} /> : <div style={{ height: 16 }} />}
            {battle && <ChargeBar gauge={battle.player.charge} />}
          </div>
        </div>
      </div>

      {/* アクションバー */}
      <div style={{ padding: '6px 12px 10px', flex: '0 0 auto', minHeight: 56, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {phase === 'ready' && (
          <button className="rpg-btn rpg-btn-primary" onClick={startBattle} style={{ fontSize: 15, padding: '12px 20px', margin: 0 }}>BATTLE START</button>
        )}
        {phase === 'selecting' && (
          <button className="rpg-btn rpg-btn-primary" onClick={confirmSelection}
            style={{ fontSize: 15, padding: '12px 20px', margin: 0, opacity: selectedDice.size === 2 ? 1 : 0.4 }}
            disabled={selectedDice.size !== 2}>
            GO
          </button>
        )}
        {phase === 'turn-end' && (
          <button className="rpg-btn rpg-btn-primary" onClick={doNextTurn} style={{ fontSize: 15, padding: '12px 20px', margin: 0 }}>ROLL DICE</button>
        )}
        {(isAnimating || isRolling) && (
          <div style={{ textAlign: 'center', padding: '12px 20px', fontSize: 12, color: '#6a5a4a', letterSpacing: 2 }}>
            {isRolling ? '🎲 ...' : '⚡ ...'}
          </div>
        )}
        {phase === 'result' && battle?.status === 'player-win' && (
          <div>
            <div style={{ textAlign: 'center', color: '#705828', fontSize: 11, marginBottom: 4 }}>+{50 + enemyDiceList[0].rarity * 30} GOLD</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="rpg-btn rpg-btn-primary" onClick={startCapture} style={{ flex: 2, margin: 0, padding: '10px 12px' }}>封印する</button>
              <button className="rpg-btn" onClick={() => setScreen('dungeon')} style={{ flex: 1, margin: 0, padding: '10px 12px' }}>スキップ</button>
            </div>
          </div>
        )}
        {phase === 'result' && battle && battle.status !== 'player-win' && (
          <button className="rpg-btn" onClick={() => setScreen('dungeon')} style={{ margin: 0, padding: '10px 12px' }}>戻る</button>
        )}
        {phase === 'capture' && (<div style={{ textAlign: 'center', fontSize: 11, color: '#6a5a4a' }}>封印中...</div>)}
      </div>

      {phase === 'capture' && currentEnemy && currentEnemy[0] && (
        <CaptureScene monster={currentEnemy[0]} onComplete={onCaptureComplete} onSkip={() => setScreen('dungeon')} />
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
      <div className={showLand ? 'dice-land' : ''} style={{
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
          <div style={{ position: 'absolute', inset: -3, border: '2px solid #8a7050', borderRadius: 4, pointerEvents: 'none' }} />
        )}
      </div>
      {!rolling && (
        <div style={{ fontSize: 13, fontWeight: 'bold', color: elColor, lineHeight: 1, marginTop: 1 }}>{faceNumber}</div>
      )}
    </div>
  );
}
