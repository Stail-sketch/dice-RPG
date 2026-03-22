import type { ChargeGauge } from '../../types';

export function ChargeBar({ gauge }: { gauge: ChargeGauge }) {
  const pct = Math.min(100, (gauge.current / gauge.max) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 8, color: '#998a78', minWidth: 14 }}>CG</span>
      <div className="charge-bar" style={{ flex: 1 }}>
        <div className={`charge-fill${gauge.bonusActive ? ' max' : ''}`} style={{ width: `${pct}%` }} />
      </div>
      <span style={{ fontSize: 8, color: gauge.bonusActive ? '#705828' : '#998a78', fontWeight: gauge.bonusActive ? 'bold' : 'normal' }}>
        {gauge.bonusActive ? 'MAX!' : `${gauge.current}/${gauge.max}`}
      </span>
    </div>
  );
}
