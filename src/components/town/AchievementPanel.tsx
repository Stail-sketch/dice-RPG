import { useGameStore } from '../../stores/gameStore';
import { ACHIEVEMENTS } from '../../data/achievements';

interface Props {
  onClose: () => void;
}

export function AchievementPanel({ onClose }: Props) {
  const achievements = useGameStore((s) => s.achievements);
  const unlocked = achievements.length;
  const total = ACHIEVEMENTS.length;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div
        className="rpg-panel"
        style={{
          width: '90%', maxWidth: 360, maxHeight: '80vh',
          padding: 12, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 8, borderBottom: '1px solid #d8d0c4', paddingBottom: 6,
        }}>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#3a2a1a' }}>
            実績
          </div>
          <div style={{ fontSize: 11, color: '#705828' }}>
            {unlocked}/{total} 達成
          </div>
        </div>

        {/* グリッド */}
        <div style={{
          flex: 1, overflowY: 'auto',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6,
          padding: '4px 0',
        }}>
          {ACHIEVEMENTS.map((a) => {
            const isUnlocked = achievements.includes(a.id);
            return (
              <div
                key={a.id}
                style={{
                  background: isUnlocked ? '#f5f0e8' : '#d8d0c4',
                  border: isUnlocked ? '2px solid #a09060' : '2px solid #c0b8a8',
                  borderRadius: 4,
                  padding: 6,
                  textAlign: 'center',
                  opacity: isUnlocked ? 1 : 0.6,
                  minHeight: 70,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <div style={{
                  fontSize: 22,
                  filter: isUnlocked ? 'none' : 'grayscale(1)',
                  marginBottom: 2,
                }}>
                  {a.icon}
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 'bold',
                  color: isUnlocked ? '#3a2a1a' : '#998a78',
                }}>
                  {isUnlocked ? a.name : '???'}
                </div>
                {isUnlocked && (
                  <div style={{ fontSize: 8, color: '#6a5a4a', marginTop: 1 }}>
                    {a.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 閉じるボタン */}
        <button
          className="rpg-btn"
          style={{ marginTop: 8, padding: '8px 12px' }}
          onClick={onClose}
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
