interface HpBarProps {
  current: number;
  max: number;
  label?: string;
  color?: 'player' | 'enemy';
}

export function HpBar({ current, max, label, color }: HpBarProps) {
  const pct = Math.max(0, (current / max) * 100);

  // enemy=常に赤系、player=残量で青→黄→赤
  let barColor: string;
  if (color === 'enemy') {
    barColor = '#b85040';
  } else {
    barColor = pct > 50 ? '#4070a0' : pct > 25 ? '#a08830' : '#b85040';
  }

  return (
    <div>
      {label && <div style={{ fontSize: 11, marginBottom: 2 }}>{label}</div>}
      <div className="hp-bar-container">
        <div style={{
          width: `${pct}%`,
          height: '100%',
          borderRadius: 1,
          background: barColor,
          transition: 'width 0.5s ease',
        }} />
      </div>
      <div style={{ fontSize: 11, textAlign: 'right', color: '#6a5a4a' }}>
        {current}/{max}
      </div>
    </div>
  );
}
