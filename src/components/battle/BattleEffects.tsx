import { useEffect, useState } from 'react';
import type { Element } from '../../types';
import { ELEMENT_COLORS } from '../common/ElementBadge';

// === 属性エフェクト（スキル発動時に画面に出る） ===
interface ElementEffectProps {
  element: Element;
  side: 'top' | 'bottom'; // 敵側 or プレイヤー側
}

export function ElementEffect({ element, side }: ElementEffectProps) {
  const color = ELEMENT_COLORS[element];
  return (
    <div style={{
      position: 'absolute',
      left: 0, right: 0,
      top: side === 'top' ? 0 : undefined,
      bottom: side === 'bottom' ? 0 : undefined,
      height: '35%',
      background: `linear-gradient(${side === 'top' ? '180deg' : '0deg'}, ${color}10 0%, transparent 100%)`,
      pointerEvents: 'none',
      animation: 'effectFlash 0.6s ease forwards',
      zIndex: 50,
    }} />
  );
}

// === シナジーカットイン ===
interface SynergyCutInProps {
  name: string;
  onDone: () => void;
}

export function SynergyCutIn({ name, onDone }: SynergyCutInProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 1500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 300, pointerEvents: 'none',
    }}>
      {/* 横線 */}
      <div style={{
        position: 'absolute', left: 0, right: 0,
        height: 3, top: '48%',
        background: 'linear-gradient(90deg, transparent 0%, #b09050 30%, #b09050 70%, transparent 100%)',
        animation: 'cutInLine 0.3s ease forwards',
      }} />
      <div style={{
        position: 'absolute', left: 0, right: 0,
        height: 3, top: '52%',
        background: 'linear-gradient(90deg, transparent 0%, #b09050 30%, #b09050 70%, transparent 100%)',
        animation: 'cutInLine 0.3s ease 0.05s forwards',
      }} />
      {/* テキスト */}
      <div style={{
        fontSize: 22, fontWeight: 'bold', color: '#705828',
        letterSpacing: 6,
        animation: 'cutInText 1.2s ease both',
        background: 'linear-gradient(90deg, transparent, #f5f0e880, #f5f0e880, #f5f0e880, transparent)',
        padding: '12px 40px',
      }}>
        ★ {name} ★
      </div>
    </div>
  );
}

// === パーティクル（属性攻撃時に飛ぶ粒子） ===
interface ParticlesProps {
  color: string;
  count?: number;
  originY?: number; // パーセント
}

export function Particles({ color, count = 8, originY = 50 }: ParticlesProps) {
  const [particles] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      y: originY,
      dx: (Math.random() - 0.5) * 60,
      dy: (Math.random() - 0.5) * 40 - 10,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 0.2,
    }))
  );

  return (
    <>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: p.size, height: p.size,
          borderRadius: '50%',
          background: color,
          pointerEvents: 'none',
          zIndex: 80,
          animation: `particleFly 0.8s ease ${p.delay}s forwards`,
          '--dx': `${p.dx}%`,
          '--dy': `${p.dy}%`,
        } as React.CSSProperties} />
      ))}
    </>
  );
}
