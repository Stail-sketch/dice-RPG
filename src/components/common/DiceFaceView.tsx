interface DiceFaceViewProps {
  faceNumber: number;
  size?: number;
  rolling?: boolean;
  borderColor?: string;
  pipColors?: (string | null)[];
}

const PIP_LAYOUTS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 20], [75, 20], [25, 50], [75, 50], [25, 80], [75, 80]],
};

export function DiceFaceView({ faceNumber, size = 60, rolling, borderColor, pipColors }: DiceFaceViewProps) {
  const pips = PIP_LAYOUTS[faceNumber] || [];
  const pipSize = size * 0.15;
  const border = borderColor || '#c0b8a8';

  return (
    <div
      className={rolling ? 'dice-rolling' : ''}
      style={{
        width: size,
        height: size,
        background: '#ffffff',
        border: `2px solid ${border}`,
        borderRadius: 3,
        position: 'relative',
      }}
    >
      {pips.map(([x, y], i) => {
        const color = pipColors?.[i] ?? null;
        const isEmpty = !color;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
              width: pipSize,
              height: pipSize,
              borderRadius: '50%',
              background: isEmpty ? '#e0d8cc' : color,
              border: isEmpty ? '1px solid #c8c0b0' : `1px solid ${color}`,
            }}
          />
        );
      })}
      <div style={{
        position: 'absolute',
        bottom: 1,
        right: 3,
        fontSize: size * 0.14,
        color: '#c0b8a8',
        lineHeight: 1,
      }}>
        {faceNumber}
      </div>
    </div>
  );
}
