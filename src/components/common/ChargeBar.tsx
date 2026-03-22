import { useEffect, useRef, useState } from 'react';
import type { ChargeGauge } from '../../types';

interface ChargeBarProps {
  gauge: ChargeGauge;
  magicCost?: number; // cost of equipped magic dice
  magicName?: string; // name of equipped magic dice
}

export function ChargeBar({ gauge, magicCost, magicName }: ChargeBarProps) {
  const target = magicCost ?? 0;
  const pct = target > 0 ? Math.min(100, (gauge.current / target) * 100) : 0;
  const ready = target > 0 && gauge.current >= target;
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
    ready ? 'charge-max-active' : '',
  ].filter(Boolean).join(' ');

  const fillClass = [
    'charge-fill',
    ready ? 'max' : '',
    flashing ? 'flash' : '',
  ].filter(Boolean).join(' ');

  // Label: show magic name when equipped, or just the gauge value
  let label: string;
  if (ready && magicName) {
    label = 'READY!';
  } else if (target > 0) {
    label = `${gauge.current}/${target}`;
  } else {
    label = `${gauge.current}`;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 8, color: '#998a78', minWidth: 14 }}>CG</span>
      <div className={barClass} style={{ flex: 1 }}>
        <div className={fillClass} style={{ width: `${target > 0 ? pct : 0}%` }} />
      </div>
      {magicName && !ready && (
        <span style={{
          fontSize: 7,
          color: '#8a7050',
          maxWidth: 48,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {magicName}
        </span>
      )}
      <span style={{
        fontSize: 8,
        color: ready ? '#705828' : '#998a78',
        fontWeight: ready ? 'bold' : 'normal',
        transition: 'color 0.2s',
      }}>
        {label}
      </span>
    </div>
  );
}
