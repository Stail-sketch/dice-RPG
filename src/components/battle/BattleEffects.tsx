import { useEffect, useState } from 'react';
import type { Element, StatusEffect } from '../../types';
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

// === 属性別パーティクル形状 ===
function getParticleStyle(element: Element | undefined, size: number): React.CSSProperties {
  switch (element) {
    case 'blaze':
      // 炎: 三角/火の形
      return {
        width: size, height: size,
        clipPath: 'polygon(50% 0%, 15% 100%, 85% 100%)',
        borderRadius: 0,
      };
    case 'frost':
      // 氷: ダイヤモンド形（45度回転の正方形）
      return {
        width: size, height: size,
        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        borderRadius: 0,
      };
    case 'volt':
      // 雷: 稲妻ボルト形
      return {
        width: size, height: size * 1.4,
        clipPath: 'polygon(30% 0%, 70% 0%, 55% 35%, 80% 35%, 35% 100%, 50% 55%, 20% 55%)',
        borderRadius: 0,
      };
    case 'venom':
      // 毒: 水滴/バブル形
      return {
        width: size, height: size,
        borderRadius: '50% 50% 50% 20%',
      };
    case 'alloy':
      // 鋼: 正方形/シャード
      return {
        width: size, height: size,
        borderRadius: 0,
      };
    case 'mirage':
      // 幻: 五芒星
      return {
        width: size, height: size,
        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
        borderRadius: 0,
      };
    default:
      // デフォルト: 円
      return {
        width: size, height: size,
        borderRadius: '50%',
      };
  }
}

// === パーティクル（属性攻撃時に飛ぶ粒子） ===
interface ParticlesProps {
  color: string;
  count?: number;
  originY?: number; // パーセント
  element?: Element; // 属性別形状
}

export function Particles({ color, count = 8, originY = 50, element }: ParticlesProps) {
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
      {particles.map(p => {
        const shapeStyle = getParticleStyle(element, p.size);
        return (
          <div key={p.id} style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            ...shapeStyle,
            background: color,
            pointerEvents: 'none',
            zIndex: 80,
            animation: `particleFly 0.8s ease ${p.delay}s forwards`,
            '--dx': `${p.dx}%`,
            '--dy': `${p.dy}%`,
          } as React.CSSProperties} />
        );
      })}
    </>
  );
}

// === ステータスエフェクト表示 ===
const STATUS_COLORS: Record<string, string> = {
  burn: '#c05030',
  poison: '#408030',
  freeze: '#3070a0',
  slow: '#7050a0',
  atkUp: '#a08820',
  defUp: '#3070a0',
  atkDown: '#b04030',
  defDown: '#b04030',
  shield: '#4070a0',
  confusion: '#7050a0',
  buff: '#a08820',
  debuff: '#686868',
  counter: '#c05030',
};

const STATUS_LABELS: Record<string, string> = {
  burn: '燃',
  poison: '毒',
  freeze: '凍',
  slow: '鈍',
  atkUp: '攻↑',
  defUp: '防↑',
  atkDown: '攻↓',
  defDown: '防↓',
  shield: '盾',
  confusion: '混',
  buff: '強',
  debuff: '弱',
  counter: '反',
};

export function StatusIndicator({ effects, side }: { effects: StatusEffect[]; side: 'top' | 'bottom' }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(t);
  }, []);

  if (!visible || effects.length === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      left: 8, right: 8,
      top: side === 'top' ? '32%' : undefined,
      bottom: side === 'bottom' ? '32%' : undefined,
      display: 'flex',
      gap: 4,
      justifyContent: 'center',
      pointerEvents: 'none',
      zIndex: 90,
    }}>
      {effects.map((e, i) => (
        <div key={`${e.type}-${i}`} style={{
          width: 18, height: 18,
          borderRadius: '50%',
          background: STATUS_COLORS[e.type] || '#686868',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 8, fontWeight: 'bold', color: '#fff',
          animation: 'statusPop 0.4s ease both',
          animationDelay: `${i * 0.08}s`,
          border: '1px solid rgba(255,255,255,0.3)',
        }}>
          {STATUS_LABELS[e.type] || '?'}
        </div>
      ))}
    </div>
  );
}

// === ヒットフラッシュ ===
export function HitFlash({ side }: { side: 'top' | 'bottom' }) {
  return (
    <div style={{
      position: 'absolute',
      left: 0, right: 0,
      top: side === 'top' ? 0 : undefined,
      bottom: side === 'bottom' ? 0 : undefined,
      height: '40%',
      background: 'rgba(255, 255, 255, 0.6)',
      pointerEvents: 'none',
      zIndex: 60,
      animation: 'hitFlash 50ms ease-out forwards',
    }} />
  );
}
