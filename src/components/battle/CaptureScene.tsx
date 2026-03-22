import { useState, useEffect } from 'react';
import type { MonsterDice } from '../../types';
import { ELEMENT_COLORS } from '../common/ElementBadge';
import { MonsterSprite } from '../common/MonsterSprite';
import { DiceFaceView } from '../common/DiceFaceView';
import { attemptCapture, type CaptureResult } from '../../game/capture/CaptureEngine';

type CapturePhase =
  | 'intro'       // モンスター表示 + 「封印のダイスを振る」
  | 'rolling'     // ダイス回転中
  | 'landed'      // 出目確定
  | 'judging'     // 判定中（ダイスが揺れる演出）
  | 'success'     // 成功！
  | 'fail';       // 失敗...

interface CaptureSceneProps {
  monster: MonsterDice;
  onComplete: (result: CaptureResult) => void;
  onSkip: () => void;
}

export function CaptureScene({ monster, onComplete, onSkip }: CaptureSceneProps) {
  const [phase, setPhase] = useState<CapturePhase>('intro');
  const [result, setResult] = useState<CaptureResult | null>(null);
  const [diceDisplay, setDiceDisplay] = useState(1);
  const [shakeCount, setShakeCount] = useState(0);
  const elColor = ELEMENT_COLORS[monster.element];

  // ローリング中のダイス面をランダムに切り替え
  useEffect(() => {
    if (phase !== 'rolling') return;
    const interval = setInterval(() => {
      setDiceDisplay(Math.floor(Math.random() * 6) + 1);
    }, 80);
    // 1.5秒後に出目確定
    const timer = setTimeout(() => {
      clearInterval(interval);
      const captureResult = attemptCapture(monster);
      setResult(captureResult);
      setDiceDisplay(captureResult.roll);
      setPhase('landed');
    }, 1500);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, [phase, monster]);

  // 出目確定後 → 判定演出
  useEffect(() => {
    if (phase !== 'landed') return;
    const timer = setTimeout(() => setPhase('judging'), 600);
    return () => clearTimeout(timer);
  }, [phase]);

  // 判定中 → 揺れ3回 → 成功 or 失敗
  useEffect(() => {
    if (phase !== 'judging') return;
    let count = 0;
    const maxShakes = 3;
    const interval = setInterval(() => {
      count++;
      setShakeCount(count);
      if (count >= maxShakes) {
        clearInterval(interval);
        setTimeout(() => {
          setPhase(result?.success ? 'success' : 'fail');
        }, 500);
      }
    }, 600);
    return () => clearInterval(interval);
  }, [phase, result]);

  // 成功/失敗の通知
  useEffect(() => {
    if ((phase === 'success' || phase === 'fail') && result) {
      const timer = setTimeout(() => onComplete(result), 2000);
      return () => clearTimeout(timer);
    }
  }, [phase, result, onComplete]);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at center, #ffffff 0%, #f5f0e8 70%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 250,
    }}>
      {/* モンスター */}
      <div style={{
        marginBottom: 16,
        animation: phase === 'judging' ? `sealShake 0.4s ease ${shakeCount > 0 ? 'infinite' : 'none'}` : undefined,
        opacity: phase === 'success' ? 0 : 1,
        transition: 'opacity 0.5s, transform 0.5s',
        transform: phase === 'success' ? 'scale(0.3)' : 'scale(1)',
      }}>
        <MonsterSprite monsterId={monster.id} element={monster.element} size={64} animate={phase === 'intro'} />
      </div>

      {/* モンスター名 */}
      <div style={{ fontSize: 14, color: elColor, marginBottom: 8 }}>
        {'★'.repeat(monster.rarity)} {monster.name}
      </div>
      <div style={{ fontSize: 10, color: '#998a78', marginBottom: 20 }}>
        捕獲率: {monster.baseStats.captureRate}%
      </div>

      {/* 封印ダイス */}
      {phase !== 'intro' && (
        <div style={{ marginBottom: 16, position: 'relative' }}>
          {/* ダイスの光エフェクト */}
          {(phase === 'judging' || phase === 'success') && (
            <div style={{
              position: 'absolute', inset: -12,
              borderRadius: 16,
              background: phase === 'success'
                ? `radial-gradient(circle, ${elColor}40 0%, transparent 70%)`
                : 'radial-gradient(circle, #ece5d8 0%, transparent 70%)',
              animation: 'pulseGlow 0.8s ease infinite',
              color: phase === 'success' ? elColor : '#705828',
            }} />
          )}
          <div style={{
            animation: phase === 'judging'
              ? `sealShake 0.5s ease ${shakeCount <= 3 ? '' : 'none'}`
              : undefined,
          }}>
            <DiceFaceView
              faceNumber={diceDisplay}
              size={80}
              rolling={phase === 'rolling'}
              borderColor="#b09050"
              pipColors={Array(diceDisplay).fill('#705828')}
            />
          </div>
        </div>
      )}

      {/* 出目 + 判定率 */}
      {result && phase !== 'rolling' && phase !== 'intro' && (
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#705828' }}>
            出目: {result.roll}
          </div>
          <div style={{ fontSize: 11, color: '#998a78', marginTop: 2 }}>
            判定率: {Math.round(result.effectiveRate)}%
          </div>
        </div>
      )}

      {/* 判定中ドット */}
      {phase === 'judging' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 12, height: 12, borderRadius: '50%',
              background: i < shakeCount ? '#b09050' : '#e0d8cc',
              border: '1px solid #c0b8a0',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
      )}

      {/* 成功演出 */}
      {phase === 'success' && (
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
          {/* ダイスに吸い込まれるモンスター */}
          <div style={{
            fontSize: 24, fontWeight: 'bold', color: '#308050',
            marginBottom: 8,
          }}>
            封印成功！
          </div>
          <div style={{ fontSize: 13, color: elColor }}>
            {monster.name} をダイスに封印した！
          </div>
          {/* 光の輪 */}
          <div style={{
            width: 100, height: 100, margin: '12px auto',
            borderRadius: '50%',
            border: `3px solid ${elColor}`,
            animation: 'sealRing 1s ease infinite',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <DiceFaceView faceNumber={result!.roll} size={48} borderColor={elColor}
              pipColors={Array(result!.roll).fill(elColor)} />
          </div>
        </div>
      )}

      {/* 失敗演出 */}
      {phase === 'fail' && (
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
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
      <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
        {phase === 'intro' && (
          <div>
            <button className="rpg-btn rpg-btn-primary"
              style={{ fontSize: 15, padding: '14px 20px', margin: '0 0 8px 0' }}
              onClick={() => setPhase('rolling')}>
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
