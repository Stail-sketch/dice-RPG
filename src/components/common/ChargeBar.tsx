import { useEffect, useRef, useState } from 'react';
import type { ChargeGauge } from '../../types';

export function ChargeBar({ gauge }: { gauge: ChargeGauge }) {
  const pct = Math.min(100, (gauge.current / gauge.max) * 100);
  const prevRef = useRef(gauge.current);
  const [flashing, setFlashing] = useState(false);

  useEffect(() => {
    if (gauge.current > prevRef.current) {
      setFlashing(true);
      const t = setTimeout(() => setFlashing(false), 500);
      prevRef.current = gauge.current;
      return () => clearTimeout(t);
    }
    prevRef.current = gauge.current;
  }, [gauge.current]);

  const barClass = [
    'charge-bar',
    flashing ? 'charge-increasing' : '',
    gauge.bonusActive ? 'charge-max-active' : '',
  ].filter(Boolean).join(' ');

  const fillClass = [
    'charge-fill',
    gauge.bonusActive ? 'max' : '',
    flashing ? 'flash' : '',
  ].filter(Boolean).join(' ');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 8, color: '#998a78', minWidth: 14 }}>CG</span>
      <div className={barClass} style={{ flex: 1 }}>
        <div className={fillClass} style={{ width: `${pct}%` }} />
      </div>
      <span style={{
        fontSize: 8,
        color: gauge.bonusActive ? '#705828' : '#998a78',
        fontWeight: gauge.bonusActive ? 'bold' : 'normal',
        transition: 'color 0.2s',
      }}>
        {gauge.bonusActive ? 'MAX!' : `${gauge.current}/${gauge.max}`}
      </span>
    </div>
  );
}
