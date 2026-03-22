import { useState, useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { createBattleState, executeTurn } from '../../game/battle/BattleEngine';
import type { BattleState, TurnResult, MonsterDice, SkillAction } from '../../types';
import { ELEMENT_NAMES } from '../../types';
import { SKILL_RUNES } from '../../data/skill-runes';
import { HpBar } from '../common/HpBar';
import { DiceFaceView } from '../common/DiceFaceView';
import { ELEMENT_COLORS } from '../common/ElementBadge';
import { getPipColorsForDiceFace } from '../../utils/pipColors';
import { MonsterSprite } from '../common/MonsterSprite';
import { ElementEffect, SynergyCutIn, Particles } from './BattleEffects';
import { CaptureScene } from './CaptureScene';
import type { Element } from '../../types';

type Phase =
  | 'ready' | 'rolling' | 'show-rolls'
  | 'first-label' | 'first-attack'
  | 'second-label' | 'second-attack'
  | 'turn-end' | 'result' | 'capture';

let popupId = 0;

interface Popup {
  id: number; text: string; color: string;
  side: 'enemy' | 'player'; idx: number;
}

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

  const playerDice = party.map(id => ownedDice.find(d => d.id === id)).filter(Boolean) as MonsterDice[];
  const enemyDice = currentEnemy || [];

  useEffect(() => {
    if (popups.length === 0) return;
    const t = setTimeout(() => setPopups([]), 1500);
    return () => clearTimeout(t);
  }, [popups]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const addLog = useCallback((msg: string) => setLog(prev => [...prev, msg]), []);

  const addPopup = useCallback((text: string, color: string, side: 'enemy' | 'player', idx = 0) => {
    setPopups(prev => [...prev, { id: ++popupId, text, color, side, idx }]);
  }, []);

  const doShake = useCallback((side: 'enemy' | 'player') => {
    if (side === 'enemy') {
      setShakeEnemy(true); setHurtEnemy(true);
      setTimeout(() => { setShakeEnemy(false); setHurtEnemy(false); }, 400);
    } else {
      setShakePlayer(true); setHurtPlayer(true);
      setTimeout(() => { setShakePlayer(false); setHurtPlayer(false); }, 400);
    }
  }, []);

  const showElementEffect = useCallback((el: Element, side: 'top' | 'bottom') => {
    setEffectElement(el); setEffectSide(side);
    setTimeout(() => setEffectElement(null), 600);
  }, []);

  const showParticles = useCallback((color: string, y: number) => {
    setParticles({ color, y });
    setTimeout(() => setParticles(null), 800);
  }, []);

  const flash = useCallback((msg: string, duration = 800) => {
    setCenterMessage(msg);
    setTimeout(() => setCenterMessage(null), duration);
  }, []);

  // スキルアクションをログに出す
  const logActions = useCallback((actions: SkillAction[], label: string) => {
    if (actions.length === 0) { addLog(`  ${label}: (なし)`); return; }
    for (const a of actions) {
      const elName = ELEMENT_NAMES[a.element];
      if (a.effectType === 'damage' && a.finalDamage > 0) {
        addLog(`  ${a.skillName}(${elName}) → ${a.finalDamage}dmg`);
      } else if (a.effectType === 'heal') {
        addLog(`  ${a.skillName}(${elName}) → +${a.rawDamage}HP`);
      } else {
        addLog(`  ${a.skillName}(${elName}) → ${a.effectType}`);
      }
    }
  }, [addLog]);

  // === ターン処理 ===
  const processTurn = useCallback((state: BattleState) => {
    const result = executeTurn(state);
    setBattle({ ...state });
    setLastTurn(result);
    setTurnCount(result.turn);
    setDiceLanded(false);
    setPhase('show-rolls');
    setTimeout(() => setDiceLanded(true), 100);

    flash(`Turn ${result.turn}`, 600);
    addLog(`── Turn ${result.turn} ──`);
    addLog(`出目 [${result.playerRolls.map(r => r.faceNumber).join(',')}] vs [${result.enemyRolls.map(r => r.faceNumber).join(',')}]`);

    const firstIsPlayer = result.playerFirst;
    addLog(firstIsPlayer ? '→ プレイヤー先攻' : '→ エネミー先攻');

    setTimeout(() => {
      setAttackLabel(firstIsPlayer ? 'PLAYER ATTACK' : 'ENEMY ATTACK');
      setPhase('first-label');

      setTimeout(() => {
        setCurrentActions(result.firstActions);
        setPhase('first-attack');
        logActions(result.firstActions, '先攻');

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
          if (mainEl) {
            showElementEffect(mainEl, firstIsPlayer ? 'top' : 'bottom');
            showParticles(ELEMENT_COLORS[mainEl], firstIsPlayer ? 22 : 65);
          }
        }

        setTimeout(() => {
          setCurrentActions([]);
          setAttackLabel(firstIsPlayer ? 'ENEMY ATTACK' : 'PLAYER ATTACK');
          setPhase('second-label');

          setTimeout(() => {
            setCurrentActions(result.secondActions);
            setPhase('second-attack');
            logActions(result.secondActions, '後攻');

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
              if (mainEl) {
                showElementEffect(mainEl, firstIsPlayer ? 'bottom' : 'top');
                showParticles(ELEMENT_COLORS[mainEl], firstIsPlayer ? 65 : 22);
              }
            }

            for (const s of result.synergies) {
              addLog(`  ★ ${s.name}`);
            }
            if (result.synergies.length > 0) {
              setTimeout(() => {
                setSynergyCutIn(result.synergies.map(s => s.name).join(' + '));
              }, 300);
            }

            setTimeout(() => {
              setCurrentActions([]);
              setAttackLabel('');
              addLog(`  HP ${result.playerHp} vs ${result.enemyHp}`);

              if (state.status !== 'ongoing') {
                setPhase('result');
                if (state.status === 'player-win') {
                  addLog('══ 勝利！ ══');
                  flash('WIN!', 1500);
                  addGold(50 + enemyDice[0].rarity * 30);
                } else {
                  addLog('══ 敗北... ══');
                  flash('LOSE...', 1500);
                }
              } else {
                setPhase('turn-end');
              }
            }, 800);
          }, 400);
        }, 800);
      }, 400);
    }, 700);
  }, [addPopup, doShake, flash, addGold, addLog, logActions, showElementEffect, showParticles]);

  const startBattle = useCallback(() => {
    if (playerDice.length < 3 || enemyDice.length < 3) return;
    const enemyMaxHp = 40 + Math.max(...enemyDice.map(d => d.rarity)) * 10;
    const state = createBattleState(playerDice, enemyDice, 60, enemyMaxHp);
    setBattle(state);
    setPhase('rolling');
    setLog([]);
    addLog('BATTLE START!');
    flash('BATTLE START!', 800);
    setTimeout(() => processTurn(state), 900);
  }, [playerDice, enemyDice, processTurn, flash, addLog]);

  const doNextTurn = useCallback(() => {
    if (!battle || battle.status !== 'ongoing') return;
    setPhase('rolling');
    setTimeout(() => processTurn(battle), 600);
  }, [battle, processTurn]);

  // 封印シーン開始
  const startCapture = useCallback(() => {
    setPhase('capture');
  }, []);

  // 封印完了時のコールバック
  const onCaptureComplete = useCallback((captureRes: { success: boolean; roll: number; captureRate: number; effectiveRate: number }) => {
    if (!currentEnemy || currentEnemy.length === 0) return;
    const monster = currentEnemy[0];


    if (captureRes.success) {
      addDice({ ...monster });
      captureMonster(monster.id);
      addLog(`封印成功！ ${monster.name}をGET！`);
    } else {
      addLog(`封印失敗... ${monster.name}は逃げた`);
    }

    // ドロップ
    const dropCount = 1 + (Math.random() < 0.4 ? 1 : 0);
    const commonRunes = SKILL_RUNES.filter(r => r.tier === 'common');
    const rareRunes = SKILL_RUNES.filter(r => r.tier === 'rare');
    const drops: typeof SKILL_RUNES = [];
    for (let i = 0; i < dropCount; i++) {
      const pool = Math.random() < 0.2 ? rareRunes : commonRunes;
      const rune = pool[Math.floor(Math.random() * pool.length)];
      drops.push({ ...rune });
      addLog(`  ルーン獲得: ${rune.name}(${ELEMENT_NAMES[rune.element]})`);
    }
    addRunes(drops);
    if (Math.random() < 0.5) {
      addMaterial('forge-stone', 1);
      addLog('  素材獲得: 鍛冶石 x1');
    }
    if (Math.random() < 0.1) {
      addMaterial('rare-ore', 1);
      addLog('  素材獲得: レア鉱石 x1');
    }

    // ダンジョンへ戻る
    setScreen('dungeon');
  }, [currentEnemy, addDice, captureMonster, addRunes, addLog, addMaterial, setScreen]);

  const isRolling = phase === 'rolling';
  const isAnimating = ['rolling', 'show-rolls', 'first-label', 'first-attack', 'second-label', 'second-attack'].includes(phase);

  // フェーズに応じた表示HP
  let displayPlayerHp = battle?.player.hp ?? 0;
  let displayEnemyHp = battle?.enemy.hp ?? 0;
  if (lastTurn) {
    if (['rolling', 'show-rolls', 'first-label'].includes(phase)) {
      // まだ攻撃前 → ターン開始時のHP
      displayPlayerHp = lastTurn.prePlayerHp;
      displayEnemyHp = lastTurn.preEnemyHp;
    } else if (['first-attack', 'second-label'].includes(phase)) {
      // 先攻分だけ反映
      displayPlayerHp = lastTurn.midPlayerHp;
      displayEnemyHp = lastTurn.midEnemyHp;
    }
    // second-attack以降: battle.hp = 最終HP（デフォルト）
  }

  return (
    <div style={{
      padding: 0, height: '100vh', display: 'flex', flexDirection: 'column',
      background: '#f5f0e8',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* 中央フラッシュ */}
      {centerMessage && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, pointerEvents: 'none',
        }}>
          <div style={{
            fontSize: 28, fontWeight: 'bold', color: '#705828',
            textShadow: 'none',
            animation: 'centerFlash 0.8s ease', letterSpacing: 4,
          }}>
            {centerMessage}
          </div>
        </div>
      )}

      {/* ダメージポップアップ */}
      {popups.map(p => {
        const xBase = p.idx === 0 ? 18 : p.idx === 1 ? 50 : 82;
        const yBase = p.side === 'enemy' ? 18 : 58;
        return (
          <div key={p.id} style={{
            position: 'absolute',
            left: `${xBase + (Math.random() - 0.5) * 10}%`,
            top: `${yBase}%`,
            color: p.color,
            fontSize: p.text.startsWith('+') ? 18 : 26,
            fontWeight: 'bold',
            textShadow: 'none',
            zIndex: 150, pointerEvents: 'none',
            animation: 'popupFloat 1.2s ease-out forwards',
          }}>
            {p.text}
          </div>
        );
      })}

      {/* 属性エフェクト */}
      {effectElement && <ElementEffect element={effectElement} side={effectSide} />}
      {/* パーティクル */}
      {particles && <Particles color={particles.color} originY={particles.y} />}
      {/* シナジーカットイン */}
      {synergyCutIn && <SynergyCutIn name={synergyCutIn} onDone={() => setSynergyCutIn(null)} />}

      {/* ===== 敵エリア ===== */}
      <div style={{ padding: '6px 12px 0', flex: '0 0 auto' }}>
        {/* ターン + 敵HP */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: '#b04030', minWidth: 42 }}>ENEMY</span>
          <div style={{ flex: 1 }}>
            {battle ? <HpBar current={displayEnemyHp} max={battle.enemy.maxHp} color="enemy" /> : <div style={{ height: 16 }} />}
          </div>
          {battle && (
            <span style={{ fontSize: 9, color: '#6a5a4a', minWidth: 50, textAlign: 'right' }}>
              T{turnCount}/{battle.maxTurns}
            </span>
          )}
        </div>
        {/* 敵モンスター + ダイス */}
        <div className={shakeEnemy ? 'shake' : ''} style={{
          display: 'flex', gap: 12, justifyContent: 'center', padding: '4px 0',
        }}>
          {enemyDice.slice(0, 3).map((d, i) => {
            const fn = lastTurn?.enemyRolls[i]?.faceNumber ?? 1;
            return (
              <div key={i} style={{ textAlign: 'center' }}>
                <MonsterSprite monsterId={d.id} element={d.element} size={40}
                  animate={!isRolling && phase !== 'ready'}
                  hurt={hurtEnemy}
                />
                <DiceSlot dice={d} faceNumber={fn} rolling={isRolling} phase={phase} landed={diceLanded} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== 中央: スキル演出 + ログ ===== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, padding: '0 8px' }}>
        {/* スキル発動エリア */}
        <div style={{
          minHeight: 44, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '2px 0',
        }}>
          {/* 攻撃ラベル */}
          {attackLabel && (
            <div style={{
              fontSize: 12, fontWeight: 'bold', letterSpacing: 3, marginBottom: 4,
              color: attackLabel.includes('PLAYER') ? '#4070a0' : '#b04030',
              textShadow: 'none',
              animation: 'fadeIn 0.3s ease',
            }}>
              {attackLabel}
            </div>
          )}
          {/* スキルバッジ */}
          {currentActions.length > 0 && (
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 3,
              justifyContent: 'center', maxWidth: '100%',
            }}>
              {currentActions.map((a, i) => (
                <div key={i} style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 4,
                  background: `${ELEMENT_COLORS[a.element]}20`,
                  border: `1px solid ${ELEMENT_COLORS[a.element]}80`,
                  color: ELEMENT_COLORS[a.element],
                  animation: `skillPop 0.3s ease ${i * 0.06}s both`,
                }}>
                  <span style={{ fontWeight: 'bold' }}>{a.skillName}</span>
                  {a.effectType === 'damage' && a.finalDamage > 0 && (
                    <span style={{ marginLeft: 3, color: '#3a2a1a' }}>{a.finalDamage}</span>
                  )}
                  {a.effectType === 'heal' && (
                    <span style={{ marginLeft: 3, color: '#308050' }}>+{a.rawDamage}</span>
                  )}
                  {['buff', 'debuff', 'shield', 'dot'].includes(a.effectType) && (
                    <span style={{ marginLeft: 3, fontSize: 9, opacity: 0.7 }}>
                      {a.effectType === 'buff' ? 'UP' : a.effectType === 'debuff' ? 'DOWN' :
                       a.effectType === 'shield' ? 'DEF' : 'DOT'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* 待機中テキスト */}
          {phase === 'ready' && enemyDice[0] && (
            <div style={{ fontSize: 13, color: '#998a78' }}>
              VS <span style={{ color: ELEMENT_COLORS[enemyDice[0].element] }}>
                {'★'.repeat(enemyDice[0].rarity)} {enemyDice[0].name}
              </span>
            </div>
          )}
        </div>

        {/* ログ */}
        <div ref={logRef} style={{
          flex: 1, overflowY: 'auto', minHeight: 0,
          padding: '3px 6px', fontSize: 9, fontFamily: 'monospace',
          background: '#ece5d8', borderRadius: 2,
          border: '1px solid #d8d0c4',
        }}>
          {log.map((line, i) => (
            <div key={i} style={{
              color: line.startsWith('══') ? (line.includes('勝利') ? '#308050' : '#b04030')
                : line.startsWith('──') ? '#8a7050'
                : line.startsWith('  ★') ? '#705828'
                : line.includes('ルーン獲得') ? '#4070a0'
                : line.includes('封印成功') ? '#308050'
                : line.includes('封印失敗') ? '#b04030'
                : line.startsWith('→') ? '#998a78'
                : '#6a5a4a',
              lineHeight: 1.3,
            }}>
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* ===== プレイヤーエリア ===== */}
      <div style={{ padding: '0 12px 4px', flex: '0 0 auto' }}>
        <div className={shakePlayer ? 'shake' : ''} style={{
          display: 'flex', gap: 12, justifyContent: 'center', padding: '4px 0',
        }}>
          {playerDice.slice(0, 3).map((d, i) => {
            const fn = lastTurn?.playerRolls[i]?.faceNumber ?? 1;
            return (
              <div key={i} style={{ textAlign: 'center' }}>
                <DiceSlot dice={d} faceNumber={fn} rolling={isRolling} phase={phase} landed={diceLanded} />
                <MonsterSprite monsterId={d.id} element={d.element} size={40}
                  animate={!isRolling && phase !== 'ready'}
                  hurt={hurtPlayer}
                />
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <span style={{ fontSize: 10, color: '#4070a0', minWidth: 42 }}>PLAYER</span>
          <div style={{ flex: 1 }}>
            {battle ? <HpBar current={displayPlayerHp} max={battle.player.maxHp} /> : <div style={{ height: 16 }} />}
          </div>
        </div>
      </div>

      {/* ===== アクションバー（高さ固定） ===== */}
      <div style={{
        padding: '6px 12px 10px', flex: '0 0 auto',
        minHeight: 56, display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        {phase === 'ready' && (
          <button className="rpg-btn rpg-btn-primary" onClick={startBattle}
            style={{ fontSize: 15, padding: '12px 20px', margin: 0 }}>
            BATTLE START
          </button>
        )}
        {phase === 'turn-end' && (
          <button className="rpg-btn rpg-btn-primary" onClick={doNextTurn}
            style={{ fontSize: 15, padding: '12px 20px', margin: 0 }}>
            ROLL DICE
          </button>
        )}
        {isAnimating && (
          <div style={{
            textAlign: 'center', padding: '12px 20px', fontSize: 12,
            color: '#6a5a4a', letterSpacing: 2,
          }}>
            {isRolling ? '🎲 ...' : '⚡ ...'}
          </div>
        )}
        {phase === 'result' && battle?.status === 'player-win' && (
          <div>
            <div style={{ textAlign: 'center', color: '#705828', fontSize: 11, marginBottom: 4 }}>
              +100 GOLD
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="rpg-btn rpg-btn-primary" onClick={startCapture}
                style={{ flex: 2, margin: 0, padding: '10px 12px' }}>
                封印する
              </button>
              <button className="rpg-btn" onClick={() => setScreen('dungeon')}
                style={{ flex: 1, margin: 0, padding: '10px 12px' }}>
                スキップ
              </button>
            </div>
          </div>
        )}
        {phase === 'result' && battle && battle.status !== 'player-win' && (
          <button className="rpg-btn" onClick={() => setScreen('dungeon')}
            style={{ margin: 0, padding: '10px 12px' }}>
            戻る
          </button>
        )}
        {phase === 'capture' && (
          <div style={{ textAlign: 'center', fontSize: 11, color: '#6a5a4a' }}>
            封印中...
          </div>
        )}
      </div>

      {/* 封印シーン（オーバーレイ） */}
      {phase === 'capture' && currentEnemy && currentEnemy[0] && (
        <CaptureScene
          monster={currentEnemy[0]}
          onComplete={onCaptureComplete}
          onSkip={() => setScreen('dungeon')}
        />
      )}
    </div>
  );
}

// ===== ダイススロット =====
function DiceSlot({ dice, faceNumber, rolling, phase, landed }: {
  dice: MonsterDice; faceNumber: number; rolling: boolean; phase: Phase; landed?: boolean;
}) {
  const elColor = ELEMENT_COLORS[dice.element];
  const isActive = ['first-attack', 'second-attack'].includes(phase);
  const showLand = !rolling && landed && ['show-rolls', 'first-label'].includes(phase);

  return (
    <div style={{ textAlign: 'center', position: 'relative' }}>
      <div className={showLand ? 'dice-land' : ''} style={{
        position: 'relative',
        transition: 'transform 0.2s',
        transform: isActive ? 'scale(1.08)' : 'scale(1)',
      }}>
        <DiceFaceView
          faceNumber={faceNumber} size={68} rolling={rolling}
          borderColor={elColor}
          pipColors={getPipColorsForDiceFace(dice, faceNumber)}
        />
        {isActive && (
          <div style={{
            position: 'absolute', inset: -3,
            border: `2px solid ${elColor}`, borderRadius: 10,
            animation: 'pulseGlow 0.8s ease infinite',
            color: elColor, pointerEvents: 'none',
          }} />
        )}
      </div>
      {!rolling && (
        <div style={{
          fontSize: 13, fontWeight: 'bold', color: elColor,
          textShadow: 'none', lineHeight: 1, marginTop: 1,
        }}>
          {faceNumber}
        </div>
      )}
    </div>
  );
}
