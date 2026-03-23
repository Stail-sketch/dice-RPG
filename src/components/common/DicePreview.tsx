import type { MonsterDice } from '../../types';
import { getAllFaces, isFixedFace } from '../../types';
import { DiceFaceView } from './DiceFaceView';
import { getPipColorsForFace } from '../../utils/pipColors';
import { getSkillRune } from '../../data/skill-runes';
import { ELEMENT_COLORS } from './ElementBadge';
import type { CustomFace } from '../../types';

const TIER_DOT_COLORS: Record<string, string> = {
  bronze: '#a08060',
  silver: '#b0b0b0',
  gold: '#c0a030',
};

interface DicePreviewProps {
  dice: MonsterDice;
  size?: number;
}

export function DicePreview({ dice, size = 48 }: DicePreviewProps) {
  const allFaces = getAllFaces(dice);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 6,
      justifyItems: 'center',
    }}>
      {allFaces.map((face, i) => {
        const faceNum = i + 1;
        const isFixed = isFixedFace(face);
        const pipColors = getPipColorsForFace(face);

        // スキル名を取得
        const skillNames: string[] = [];
        if (isFixed) {
          // fixedFaceはFIXED_SKILLSから名前取得（ここではsocket情報を直接使う）
          // fixedFaceのsocketsはFixedSocket型
        } else {
          const custom = face as CustomFace;
          for (const s of custom.sockets) {
            if (s.skillRuneId) {
              const rune = getSkillRune(s.skillRuneId);
              if (rune) skillNames.push(rune.name);
            }
          }
        }

        return (
          <div key={faceNum} style={{
            textAlign: 'center',
            border: isFixed ? '2px solid #c0a030' : '2px solid #c0b8a8',
            borderRadius: 6,
            padding: 4,
            background: isFixed ? '#f8f0e0' : '#f5f0e8',
            minWidth: size + 16,
          }}>
            <DiceFaceView
              faceNumber={faceNum}
              size={size}
              borderColor={ELEMENT_COLORS[dice.element]}
              pipColors={pipColors}
            />
            <div style={{ fontSize: 8, color: isFixed ? '#705828' : '#4070a0', marginTop: 2 }}>
              {isFixed ? '固有' : 'カスタム'}
            </div>

            {/* カスタム面のソケットティア表示 */}
            {!isFixed && (
              <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 2 }}>
                {(face as CustomFace).sockets.map((s, si) => (
                  <div key={si} style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: TIER_DOT_COLORS[s.socketTier] || '#ccc',
                    border: '1px solid rgba(0,0,0,0.15)',
                  }} title={s.socketTier} />
                ))}
              </div>
            )}

            {/* 装備中ルーン名 */}
            {skillNames.length > 0 && (
              <div style={{ fontSize: 7, color: '#6a5a4a', marginTop: 2, lineHeight: 1.3 }}>
                {skillNames.map((name, ni) => (
                  <div key={ni} style={{
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    maxWidth: size + 8,
                  }}>
                    {name}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
