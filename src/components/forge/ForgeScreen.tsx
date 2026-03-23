import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { getAllFaces, isFixedFace, type CustomFace, type SocketTier } from '../../types';
import { ELEMENT_COLORS, ElementBadge } from '../common/ElementBadge';
import { DiceFaceView } from '../common/DiceFaceView';
import { getPipColorsForFace } from '../../utils/pipColors';
import { getSkillRune } from '../../data/skill-runes';

const TIER_COLORS: Record<SocketTier, string> = {
  bronze: '#a08060', silver: '#808080', gold: '#705828',
};
const TIER_LABEL: Record<SocketTier, string> = {
  bronze: 'Bronze', silver: 'Silver', gold: 'Gold',
};
const UPGRADE_INFO: Record<SocketTier, { next: string; stones: number; gold: number; ore: number } | null> = {
  bronze: { next: 'Silver', stones: 3, gold: 200, ore: 0 },
  silver: { next: 'Gold', stones: 5, gold: 500, ore: 2 },
  gold: null,
};

export function ForgeScreen() {
  const { setScreen, ownedDice, gold, materials, upgradeSocket, socketExpansions, expandSocket } = useGameStore();
  const [selectedDiceIdx, setSelectedDiceIdx] = useState(0);
  const [selectedFace, setSelectedFace] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const dice = ownedDice[selectedDiceIdx];

  const handleUpgrade = (faceNumber: number, socketIndex: number) => {
    if (!dice) return;
    const ok = upgradeSocket(dice.id, faceNumber, socketIndex);
    if (ok) {
      setMessage('強化成功！');
    } else {
      setMessage('素材またはゴールドが足りません');
    }
    setTimeout(() => setMessage(null), 1500);
  };

  return (
    <div style={{ padding: 8 }}>
      <div className="rpg-panel">
        <div className="rpg-panel-title">鍛冶屋</div>
        <div style={{ fontSize: 10, color: '#998a78', textAlign: 'center' }}>
          カスタム面のソケットを強化する
        </div>
      </div>

      {/* 素材表示 */}
      <div className="rpg-panel" style={{ display: 'flex', justifyContent: 'space-around', fontSize: 11 }}>
        <span style={{ color: '#705828' }}>{gold}G</span>
        <span style={{ color: '#998a78' }}>鍛冶石: {materials['forge-stone']}</span>
        <span style={{ color: '#7050a0' }}>レア鉱石: {materials['rare-ore']}</span>
        <span style={{ color: '#3070a0' }}>結晶: {materials['expansion-crystal']}</span>
      </div>

      {/* メッセージ */}
      {message && (
        <div style={{
          textAlign: 'center', padding: 6, fontSize: 12,
          color: message.includes('成功') ? '#308050' : '#b04030',
        }}>
          {message}
        </div>
      )}

      {/* ダイス選択 */}
      <div className="rpg-panel" style={{ padding: 8 }}>
        <div style={{ fontSize: 10, color: '#998a78', marginBottom: 4 }}>ダイスを選択:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {ownedDice.map((d, i) => (
            <button key={`${d.id}-${i}`} className="rpg-btn"
              style={{
                width: 'auto', padding: '3px 6px', margin: 0, fontSize: 10,
                borderColor: selectedDiceIdx === i ? '#705828' : undefined,
              }}
              onClick={() => { setSelectedDiceIdx(i); setSelectedFace(null); }}
            >
              <span style={{ color: ELEMENT_COLORS[d.element] }}>{'★'.repeat(d.rarity)}</span> {d.name}
            </button>
          ))}
        </div>
      </div>

      {/* 6面展開 + ソケット強化 */}
      {dice && (
        <div className="rpg-panel" style={{ padding: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#705828' }}>{dice.name}</span>
            <ElementBadge element={dice.element} />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
            {getAllFaces(dice).map((face, i) => {
              const faceNum = i + 1;
              const isFixed = isFixedFace(face);
              return (
                <div key={faceNum}
                  style={{
                    cursor: isFixed ? 'default' : 'pointer',
                    opacity: isFixed ? 0.4 : 1,
                    border: selectedFace === faceNum ? '2px solid #705828' : '2px solid transparent',
                    borderRadius: 8, padding: 3,
                  }}
                  onClick={() => !isFixed && setSelectedFace(faceNum)}
                >
                  <DiceFaceView faceNumber={faceNum} size={42}
                    borderColor={ELEMENT_COLORS[dice.element]}
                    pipColors={getPipColorsForFace(face)}
                  />
                  <div style={{ fontSize: 8, textAlign: 'center', color: isFixed ? '#998a78' : '#998a78' }}>
                    {isFixed ? '固有' : 'カスタム'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 選択面のソケット一覧 */}
          {selectedFace && (() => {
            const face = getAllFaces(dice)[selectedFace - 1];
            if (!face || isFixedFace(face)) return null;
            const custom = face as CustomFace;

            return (
              <div style={{ borderTop: '1px solid #c0b8a8', paddingTop: 8 }}>
                <div style={{ fontSize: 11, color: '#4070a0', marginBottom: 6 }}>
                  {selectedFace}の面 — ソケット強化
                </div>
                {custom.sockets.map((s, si) => {
                  const info = UPGRADE_INFO[s.socketTier];
                  const rune = s.skillRuneId ? getSkillRune(s.skillRuneId) : null;
                  const canUpgrade = info && gold >= info.gold
                    && materials['forge-stone'] >= info.stones
                    && materials['rare-ore'] >= info.ore;

                  return (
                    <div key={si} style={{
                      display: 'flex', gap: 6, alignItems: 'center',
                      padding: '6px 8px', background: '#e0d8cc',
                      borderRadius: 4, marginBottom: 4,
                    }}>
                      <span style={{
                        fontSize: 10, fontWeight: 'bold',
                        color: TIER_COLORS[s.socketTier], minWidth: 44,
                      }}>
                        [{TIER_LABEL[s.socketTier]}]
                      </span>
                      <span style={{ fontSize: 10, color: '#998a78', flex: 1 }}>
                        {rune ? rune.name : '(空)'}
                      </span>
                      {info ? (
                        <button
                          className="rpg-btn"
                          style={{
                            width: 'auto', padding: '3px 8px', margin: 0,
                            fontSize: 9, opacity: canUpgrade ? 1 : 0.4,
                          }}
                          disabled={!canUpgrade}
                          onClick={() => handleUpgrade(selectedFace, si)}
                        >
                          → {info.next}
                          <span style={{ color: '#705828', marginLeft: 4 }}>
                            {info.gold}G
                          </span>
                          {info.stones > 0 && <span style={{ color: '#998a78', marginLeft: 2 }}>石{info.stones}</span>}
                          {info.ore > 0 && <span style={{ color: '#7050a0', marginLeft: 2 }}>鉱{info.ore}</span>}
                        </button>
                      ) : (
                        <span style={{ fontSize: 9, color: '#705828' }}>MAX</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* 上級鍛冶: ソケット拡張 */}
      {dice && selectedFace && (() => {
        const face = getAllFaces(dice)[selectedFace - 1];
        if (!face || isFixedFace(face)) return null;
        const custom = face as CustomFace;
        const existing = socketExpansions[dice.id] || [];
        const totalExpansions = existing.length;
        const faceExpanded = existing.includes(selectedFace);
        const canExpand = totalExpansions < 3 && !faceExpanded
          && gold >= 1000
          && materials['rare-ore'] >= 3
          && materials['expansion-crystal'] >= 1;

        return (
          <div className="rpg-panel" style={{ padding: 8 }}>
            <div style={{ fontSize: 11, color: '#3070a0', fontWeight: 'bold', marginBottom: 4 }}>
              上級鍛冶 — ソケット拡張
            </div>
            <div style={{ fontSize: 9, color: '#998a78', marginBottom: 6 }}>
              カスタム面にbronzeソケットを+1追加（1ダイス最大3回、同面1回）
            </div>
            <div style={{ fontSize: 9, color: '#6a5a4a', marginBottom: 6 }}>
              {selectedFace}の面: 現在{custom.sockets.length}ソケット
              {faceExpanded && <span style={{ color: '#b04030', marginLeft: 4 }}>（拡張済み）</span>}
              <span style={{ marginLeft: 8 }}>ダイス拡張: {totalExpansions}/3</span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                className="rpg-btn"
                style={{
                  width: 'auto', padding: '4px 12px', margin: 0, fontSize: 10,
                  opacity: canExpand ? 1 : 0.4,
                }}
                disabled={!canExpand}
                onClick={() => {
                  const ok = expandSocket(dice.id, selectedFace);
                  if (ok) {
                    setMessage('ソケット拡張成功！');
                  } else {
                    setMessage('拡張できません');
                  }
                  setTimeout(() => setMessage(null), 1500);
                }}
              >
                拡張する
              </button>
              <span style={{ fontSize: 8, color: '#705828' }}>1000G</span>
              <span style={{ fontSize: 8, color: '#7050a0' }}>鉱石×3</span>
              <span style={{ fontSize: 8, color: '#3070a0' }}>結晶×1</span>
            </div>
          </div>
        );
      })()}

      <div style={{ padding: '4px 0' }}>
        <button className="rpg-btn" onClick={() => setScreen('town')}>街に戻る</button>
      </div>
    </div>
  );
}
