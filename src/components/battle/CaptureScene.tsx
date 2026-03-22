import { useState, useEffect, useCallback } from 'react';
import type { MonsterDice } from '../../types';
import { ELEMENT_COLORS } from '../common/ElementBadge';
import { MonsterSprite } from '../common/MonsterSprite';
import { DiceFaceView } from '../common/DiceFaceView';
import { attemptCapture, type CaptureResult } from '../../game/capture/CaptureEngine';
import { sfx } from '../../utils/sfx';

type CapturePhase =
  | 'intro'       // モンスター表示 + 「封印のダイスを振る」
  | 'charging'    // 魔法陣チャージ演出
  | 'rolling'     // ダイス回転中
  | 'slam'        // ダイス叩きつけ
  | 'landed'      // 出目確定
  | 'judging'     // 判定中（ダイスが揺れる演出）
  | 'absorb'      // 成功時: モンスターがダイスに吸い込まれる
  | 'success'     // 成功！
  | 'crack'       // 失敗時: ダイスにヒビ
  | 'fail';       // 失敗...

interface CaptureSceneProps {
  monster: MonsterDice;
  onComplete: (result: CaptureResult) => void;
  onSkip: () => void;
}

// パーティクル
interface Particle {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
  size: number;
  life: number;
}

let pid = 0;

export function CaptureScene({ monster, onComplete, onSkip }: CaptureSceneProps) {
  const [phase, setPhase] = useState<CapturePhase>('intro');
  const [result, setResult] = useState<CaptureResult | null>(null);
  const [diceDisplay, setDiceDisplay] = useState(1);
  const [shakeCount, setShakeCount] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [circleScale, setCircleScale] = useState(0);
  const [screenDark, setScreenDark] = useState(0);
  const [monsterScale, setMonsterScale] = useState(1);
  const [monsterOpacity, setMonsterOpacity] = useState(1);
  const [diceGlow, setDiceGlow] = useState(0);
  const [textShown, setTextShown] = useState(false);
  const elColor = ELEMENT_COLORS[monster.element];

  // パーティクル発射
  const emitParticles = useCallback((count: number, color: string, spread = 60) => {
    const newP: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = spread * (0.5 + Math.random() * 0.5);
      newP.push({
        id: pid++,
        x: 0, y: 0,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 4,
        life: 800 + Math.random() * 400,
      });
    }
    setParticles(prev => [...prev, ...newP]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newP.includes(p)));
    }, 1200);
  }, []);

  // ===== チャージ演出 =====
  useEffect(() => {
    if (phase !== 'charging') return;
    sfx.chargeUp();
    // 魔法陣がぐるっと展開
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      setCircleScale(Math.min(1, frame / 20));
      setScreenDark(Math.min(0.5, frame / 40));
    }, 30);
    const timer = setTimeout(() => {
      clearInterval(interval);
      sfx.chargeMax();
      setPhase('rolling');
    }, 800);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, [phase]);

  // ===== ローリング =====
  useEffect(() => {
    if (phase !== 'rolling') return;
    sfx.diceRoll();
    const interval = setInterval(() => {
      setDiceDisplay(Math.floor(Math.random() * 6) + 1);
    }, 60);
    const timer = setTimeout(() => {
      clearInterval(interval);
      const captureResult = attemptCapture(monster);
      setResult(captureResult);
      setDiceDisplay(captureResult.roll);
      setPhase('slam');
    }, 1200);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, [phase, monster]);

  // ===== ダイス叩きつけ =====
  useEffect(() => {
    if (phase !== 'slam') return;
    sfx.diceLand();
    emitParticles(8, '#b09050', 30);
    const timer = setTimeout(() => setPhase('landed'), 500);
    return () => clearTimeout(timer);
  }, [phase, emitParticles]);

  // ===== 出目確定 → 判定演出 =====
  useEffect(() => {
    if (phase !== 'landed') return;
    sfx.click();
    const timer = setTimeout(() => setPhase('judging'), 600);
    return () => clearTimeout(timer);
  }, [phase]);

  // ===== 判定中: 3回揺れ → 成功 or 失敗 =====
  useEffect(() => {
    if (phase !== 'judging') return;
    let count = 0;
    const maxShakes = 3;
    const interval = setInterval(() => {
      count++;
      setShakeCount(count);
      sfx.click();
      emitParticles(4, elColor, 20);
      // 揺れるたびにダイスが光る
      setDiceGlow(0.6);
      setTimeout(() => setDiceGlow(0.2), 200);

      if (count >= maxShakes) {
        clearInterval(interval);
        setTimeout(() => {
          if (result?.success) {
            setPhase('absorb');
          } else {
            setPhase('crack');
          }
        }, 600);
      }
    }, 700);
    return () => clearInterval(interval);
  }, [phase, result, elColor, emitParticles]);

  // ===== 成功: 吸い込み演出 =====
  useEffect(() => {
    if (phase !== 'absorb') return;
    sfx.synergy();
    // モンスターが縮小してダイスに吸い込まれる
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      const t = frame / 30;
      setMonsterScale(Math.max(0, 1 - t));
      setMonsterOpacity(Math.max(0, 1 - t));
      setDiceGlow(Math.min(1, t * 2));
      setScreenDark(0.5 + t * 0.2);
    }, 25);
    const timer = setTimeout(() => {
      clearInterval(interval);
      // 大爆発パーティクル
      emitParticles(20, elColor, 80);
      emitParticles(12, '#f0e8c0', 60);
      sfx.chargeMax();
      setScreenDark(0.8);
      setTimeout(() => {
        setScreenDark(0);
        setPhase('success');
      }, 400);
    }, 800);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, [phase, elColor, emitParticles]);

  // ===== 成功: テキスト表示 =====
  useEffect(() => {
    if (phase !== 'success') return;
    sfx.victory();
    setTextShown(false);
    const timer = setTimeout(() => setTextShown(true), 200);
    const complete = setTimeout(() => onComplete(result!), 3000);
    return () => { clearTimeout(timer); clearTimeout(complete); };
  }, [phase, result, onComplete]);

  // ===== 失敗: ヒビ演出 =====
  useEffect(() => {
    if (phase !== 'crack') return;
    sfx.debuff();
    setDiceGlow(0);
    emitParticles(6, '#998a78', 40);
    const timer = setTimeout(() => setPhase('fail'), 800);
    return () => clearTimeout(timer);
  }, [phase, emitParticles]);

  // ===== 失敗: テキスト =====
  useEffect(() => {
    if (phase !== 'fail') return;
    setTextShown(false);
    const timer = setTimeout(() => setTextShown(true), 200);
    const complete = setTimeout(() => onComplete(result!), 2500);
    return () => { clearTimeout(timer); clearTimeout(complete); };
  }, [phase, result, onComplete]);

  const showDice = phase !== 'intro' && phase !== 'charging';
  const showMonster = phase !== 'success' && phase !== 'fail';
  const judgingOrLater = phase === 'judging' || phase === 'absorb' || phase === 'success';

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#f5f0e8',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 250,
    }}>
      {/* 背景グラデーション（不透明） */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at center, #ffffff 0%, #f5f0e8 70%)`,
        pointerEvents: 'none',
      }} />
      {/* 暗転オーバーレイ */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `rgba(20,15,10,${screenDark})`,
        transition: 'background 0.4s',
        pointerEvents: 'none',
      }} />

      {/* 魔法陣 */}
      {(phase === 'charging' || judgingOrLater) && (
        <div style={{
          position: 'absolute',
          width: 200, height: 200,
          borderRadius: '50%',
          border: `2px solid ${elColor}60`,
          transform: `scale(${circleScale}) rotate(${phase === 'charging' ? 0 : 45}deg)`,
          transition: 'transform 0.8s ease',
          opacity: phase === 'success' ? 0 : 0.6,
        }}>
          {/* 内側の円 */}
          <div style={{
            position: 'absolute', inset: 20,
            borderRadius: '50%',
            border: `1px solid ${elColor}40`,
            animation: 'sealCircleSpin 4s linear infinite',
          }} />
          {/* 十字 */}
          <div style={{
            position: 'absolute', top: '50%', left: 10, right: 10,
            height: 1, background: `${elColor}30`,
            transform: 'translateY(-0.5px)',
          }} />
          <div style={{
            position: 'absolute', left: '50%', top: 10, bottom: 10,
            width: 1, background: `${elColor}30`,
            transform: 'translateX(-0.5px)',
          }} />
          {/* ルーン文字風ドット */}
          {[0, 60, 120, 180, 240, 300].map(deg => (
            <div key={deg} style={{
              position: 'absolute',
              width: 6, height: 6,
              borderRadius: '50%',
              background: elColor,
              opacity: 0.5,
              top: `${50 - 48 * Math.cos(deg * Math.PI / 180)}%`,
              left: `${50 + 48 * Math.sin(deg * Math.PI / 180)}%`,
              transform: 'translate(-50%, -50%)',
            }} />
          ))}
        </div>
      )}

      {/* モンスター */}
      {showMonster && (
        <div style={{
          marginBottom: 16,
          position: 'relative',
          zIndex: 2,
          transform: `scale(${monsterScale})`,
          opacity: monsterOpacity,
          transition: phase === 'absorb' ? undefined : 'transform 0.5s, opacity 0.5s',
          animation: phase === 'judging' ? `sealShake 0.4s ease infinite` : undefined,
        }}>
          <MonsterSprite monsterId={monster.id} element={monster.element} size={64} animate={phase === 'intro' || phase === 'charging'} />
        </div>
      )}

      {/* モンスター名 */}
      {showMonster && (
        <>
          <div style={{ fontSize: 14, color: elColor, marginBottom: 4, zIndex: 2 }}>
            {'★'.repeat(monster.rarity)} {monster.name}
          </div>
          <div style={{ fontSize: 10, color: '#998a78', marginBottom: 16, zIndex: 2 }}>
            捕獲率: {monster.baseStats.captureRate}%
          </div>
        </>
      )}

      {/* 封印ダイス */}
      {showDice && (
        <div style={{ marginBottom: 16, position: 'relative', zIndex: 3 }}>
          {/* ダイスの光エフェクト */}
          <div style={{
            position: 'absolute', inset: -20,
            borderRadius: 20,
            background: `radial-gradient(circle, ${elColor}${Math.round(diceGlow * 99).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
            transition: 'background 0.2s',
            pointerEvents: 'none',
          }} />

          {/* パーティクル */}
          {particles.map(p => (
            <div key={p.id} style={{
              position: 'absolute',
              left: '50%', top: '50%',
              width: p.size, height: p.size,
              borderRadius: '50%',
              background: p.color,
              opacity: 0.8,
              pointerEvents: 'none',
              animation: `particleFly ${p.life}ms ease-out forwards`,
              ['--dx' as string]: `${p.dx}px`,
              ['--dy' as string]: `${p.dy}px`,
            }} />
          ))}

          <div style={{
            animation: phase === 'rolling'
              ? 'diceRoll 0.3s ease infinite'
              : phase === 'slam'
                ? 'diceSlamLand 0.5s cubic-bezier(0.34,1.56,0.64,1) both'
                : phase === 'judging'
                  ? `sealDiceShake 0.5s ease`
                  : phase === 'crack'
                    ? 'sealCrack 0.4s ease both'
                    : phase === 'absorb'
                      ? 'sealAbsorbDice 0.8s ease both'
                      : undefined,
            animationIterationCount: phase === 'judging' ? shakeCount <= 3 ? '' : 'none' : undefined,
          }}>
            <DiceFaceView
              faceNumber={diceDisplay}
              size={phase === 'rolling' ? 72 : 80}
              rolling={phase === 'rolling'}
              borderColor={judgingOrLater ? elColor : '#b09050'}
              pipColors={Array(diceDisplay).fill(judgingOrLater ? elColor : '#705828')}
            />
          </div>
        </div>
      )}

      {/* 出目 + 判定率 */}
      {result && phase !== 'rolling' && phase !== 'intro' && phase !== 'charging' && phase !== 'slam' && (
        <div style={{ textAlign: 'center', marginBottom: 8, zIndex: 2, animation: 'fadeIn 0.3s ease' }}>
          <div style={{
            fontSize: phase === 'landed' ? 28 : 20,
            fontWeight: 'bold',
            color: '#705828',
            transition: 'font-size 0.3s',
          }}>
            {result.roll}
          </div>
          <div style={{ fontSize: 10, color: '#998a78', marginTop: 2 }}>
            判定率: {Math.round(result.effectiveRate)}%
          </div>
        </div>
      )}

      {/* 判定中ドット */}
      {phase === 'judging' && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, zIndex: 2 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 14, height: 14, borderRadius: '50%',
              background: i < shakeCount ? elColor : '#e0d8cc',
              border: `2px solid ${i < shakeCount ? elColor : '#c0b8a0'}`,
              transition: 'all 0.3s',
              transform: i < shakeCount ? 'scale(1.2)' : 'scale(1)',
            }} />
          ))}
        </div>
      )}

      {/* 成功演出 */}
      {phase === 'success' && textShown && (
        <div style={{ textAlign: 'center', zIndex: 4, animation: 'sealSuccessText 0.6s ease both' }}>
          <div style={{
            fontSize: 28, fontWeight: 'bold', color: '#308050',
            marginBottom: 8, letterSpacing: 4,
          }}>
            封印成功！
          </div>
          <div style={{ fontSize: 14, color: elColor, marginBottom: 16 }}>
            {monster.name} をダイスに封印した！
          </div>
          {/* 属性の輪 + ダイス */}
          <div style={{
            width: 110, height: 110, margin: '0 auto',
            borderRadius: '50%',
            border: `3px solid ${elColor}`,
            animation: 'sealRing 1s ease infinite',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            {/* 光の放射 */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
              <div key={deg} style={{
                position: 'absolute',
                width: 2, height: 30,
                background: `linear-gradient(to bottom, ${elColor}80, transparent)`,
                transformOrigin: '50% 0',
                transform: `rotate(${deg}deg) translateY(-55px)`,
                opacity: 0.5,
                animation: `sealRay 1.5s ease infinite ${deg / 360}s`,
              }} />
            ))}
            <DiceFaceView faceNumber={result!.roll} size={52} borderColor={elColor}
              pipColors={Array(result!.roll).fill(elColor)} />
          </div>
          <div style={{ fontSize: 11, color: '#998a78', marginTop: 10 }}>
            {'★'.repeat(monster.rarity)} {monster.element.toUpperCase()}
          </div>
        </div>
      )}

      {/* 失敗演出 */}
      {phase === 'fail' && textShown && (
        <div style={{ textAlign: 'center', zIndex: 4, animation: 'sealFailText 0.5s ease both' }}>
          <div style={{
            fontSize: 24, fontWeight: 'bold', color: '#b04030',
            marginBottom: 8,
          }}>
            封印失敗...
          </div>
          <div style={{ fontSize: 13, color: '#998a78' }}>
            {monster.name} は逃げてしまった
          </div>
        </div>
      )}

      {/* アクションボタン */}
      <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, zIndex: 5 }}>
        {phase === 'intro' && (
          <div>
            <button className="rpg-btn rpg-btn-primary"
              style={{
                fontSize: 15, padding: '14px 20px', margin: '0 0 8px 0',
                animation: 'fadeIn 0.5s ease',
              }}
              onClick={() => setPhase('charging')}>
              封印のダイスを振る！
            </button>
            <button className="rpg-btn" style={{ margin: 0, padding: '10px 12px' }}
              onClick={onSkip}>
              スキップ
            </button>
          </div>
        )}
        {(phase === 'success' || phase === 'fail') && (
          <button className="rpg-btn" style={{ margin: 0, padding: '10px 12px' }}
            onClick={() => result && onComplete(result)}>
            OK
          </button>
        )}
      </div>
    </div>
  );
}
