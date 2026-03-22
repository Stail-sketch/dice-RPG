import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { getAllFaces, isFixedFace, ELEMENT_NAMES, type FixedFace, type CustomFace, type Element, type SocketTier, type SkillTier } from '../../types';
import { FIXED_SKILLS, getSkillRune } from '../../data/skill-runes';
import { ElementBadge, ELEMENT_COLORS } from '../common/ElementBadge';
import { DiceFaceView } from '../common/DiceFaceView';
import { calcSameFaceSynergyMultiplier } from '../../game/synergy/SynergyEngine';
import { getPipColorsForFace } from '../../utils/pipColors';

const TIER_COMPAT: Record<SocketTier, SkillTier[]> = {
  bronze: ['common'],
  silver: ['common', 'rare'],
  gold: ['common', 'rare', 'epic', 'legendary'],
};

const TIER_COLORS: Record<SocketTier, string> = {
  bronze: '#a08060',
  silver: '#808080',
  gold: '#705828',
};

export function DiceEditorScreen() {
  const { setScreen, ownedDice, party, setParty, ownedRunes, equipRune, unequipRune, removeRune, protagonistDice } = useGameStore();
  const [selectedSlot, setSelectedSlot] = useState<number>(0);
  const [selectedFace, setSelectedFace] = useState<number | null>(null);
  const [selectedSocket, setSelectedSocket] = useState<number | null>(null);
  const [filterElement, setFilterElement] = useState<Element | 'all'>('all');

  const partyDice = party.map(id => {
    if (id === 'protagonist') return protagonistDice;
    return ownedDice.find(d => d.id === id);
  });
  const currentDice = partyDice[selectedSlot];

  const swapDice = (slotIndex: number, diceId: string) => {
    const newParty = [...party] as [string, string, string];
    // 既に別スロットにいる場合は入れ替え
    const existingSlot = newParty.indexOf(diceId);
    if (existingSlot !== -1 && existingSlot !== slotIndex) {
      newParty[existingSlot] = newParty[slotIndex]; // 元のスロットに今のダイスを移動
    }
    newParty[slotIndex] = diceId;
    setParty(newParty);
    setSelectedFace(null);
    setSelectedSocket(null);
  };

  // 現在選択中のカスタム面のソケット情報
  const currentFace = currentDice && selectedFace
    ? getAllFaces(currentDice)[selectedFace - 1]
    : null;
  const isCurrentFixed = currentFace ? isFixedFace(currentFace) : false;
  const currentCustomFace = currentFace && !isCurrentFixed ? currentFace as CustomFace : null;

  // ルーン装備処理
  const handleEquip = (runeId: string) => {
    if (!currentDice || selectedFace === null || selectedSocket === null || !currentCustomFace) return;
    const socket = currentCustomFace.sockets[selectedSocket];
    if (!socket) return;

    // ソケットTierチェック
    const rune = ownedRunes.find(r => r.id === runeId);
    if (!rune) return;
    if (!TIER_COMPAT[socket.socketTier].includes(rune.tier)) return;

    // 既に何か装備中なら外す
    if (socket.skillRuneId) {
      unequipRune(currentDice.id, selectedFace, selectedSocket);
    }

    equipRune(currentDice.id, selectedFace, selectedSocket, runeId);
    removeRune(runeId);
    setSelectedSocket(null);
  };

  const handleUnequip = () => {
    if (!currentDice || selectedFace === null || selectedSocket === null) return;
    unequipRune(currentDice.id, selectedFace, selectedSocket);
    setSelectedSocket(null);
  };

  // フィルタ済みルーン
  const filteredRunes = filterElement === 'all'
    ? ownedRunes
    : ownedRunes.filter(r => r.element === filterElement);

  // 装備可能かチェック
  const canEquipToSocket = (runeTier: SkillTier) => {
    if (!currentCustomFace || selectedSocket === null) return false;
    const socket = currentCustomFace.sockets[selectedSocket];
    return socket ? TIER_COMPAT[socket.socketTier].includes(runeTier) : false;
  };

  return (
    <div style={{ padding: 8 }}>
      <div className="rpg-panel">
        <div className="rpg-panel-title">ダイス装備・カスタマイズ</div>
      </div>

      {/* パーティスロット */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', margin: '4px 0' }}>
        {[0, 1, 2].map(slot => {
          const dice = partyDice[slot];
          return (
            <div
              key={slot}
              className="rpg-panel"
              style={{
                flex: 1,
                textAlign: 'center',
                cursor: 'pointer',
                borderColor: selectedSlot === slot ? '#705828' : undefined,
                padding: 8,
              }}
              onClick={() => { setSelectedSlot(slot); setSelectedFace(null); setSelectedSocket(null); }}
            >
              <div style={{ fontSize: 9, color: '#998a78' }}>Slot {slot + 1}</div>
              {dice ? (
                <>
                  <DiceFaceView faceNumber={slot + 1} size={36} borderColor={ELEMENT_COLORS[dice.element]} />
                  <div style={{ fontSize: 10, marginTop: 2 }}>{dice.name}</div>
                  {dice.id === 'protagonist' ? (
                    <span style={{ color: '#b09050', fontSize: 9, fontWeight: 'bold' }}>HERO</span>
                  ) : (
                    <span className="rarity" style={{ fontSize: 9 }}>{'★'.repeat(dice.rarity)}</span>
                  )}
                </>
              ) : (
                <div style={{ color: '#998a78', fontSize: 11, padding: 8 }}>空</div>
              )}
            </div>
          );
        })}
      </div>

      {/* 所持ダイス一覧 */}
      <div className="rpg-panel" style={{ padding: 8 }}>
        <div style={{ fontSize: 10, color: '#998a78', marginBottom: 4 }}>
          所持ダイス（タップで装備） — {ownedDice.length + 1}個
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {[protagonistDice, ...ownedDice].map((d, i) => (
            <button
              key={`${d.id}-${i}`}
              className="rpg-btn"
              style={{
                width: 'auto', padding: '3px 6px', margin: 0, fontSize: 10,
                borderColor: party.includes(d.id) ? '#705828' : undefined,
                opacity: party.includes(d.id) ? 0.6 : 1,
              }}
              onClick={() => swapDice(selectedSlot, d.id)}
            >
              {d.id === 'protagonist' ? (
                <span style={{ color: '#b09050', fontWeight: 'bold' }}>HERO</span>
              ) : (
                <span style={{ color: ELEMENT_COLORS[d.element] }}>{'★'.repeat(d.rarity)}</span>
              )} {d.name}
            </button>
          ))}
        </div>
      </div>

      {/* 6面展開図 */}
      {currentDice && (
        <div className="rpg-panel" style={{ padding: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span className="rpg-panel-title" style={{ margin: 0, fontSize: 12 }}>
              {currentDice.name} — 6面展開図
            </span>
            <ElementBadge element={currentDice.element} />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
            {getAllFaces(currentDice).map((face, i) => {
              const faceNum = i + 1;
              const isFixed = isFixedFace(face);
              const synergy = calcSameFaceSynergyMultiplier(face);

              return (
                <div
                  key={faceNum}
                  style={{
                    cursor: 'pointer',
                    border: selectedFace === faceNum ? '2px solid #705828' : '2px solid transparent',
                    borderRadius: 8,
                    padding: 3,
                    textAlign: 'center',
                    position: 'relative',
                  }}
                  onClick={() => { setSelectedFace(faceNum); setSelectedSocket(null); }}
                >
                  <DiceFaceView
                    faceNumber={faceNum}
                    size={44}
                    borderColor={ELEMENT_COLORS[currentDice.element]}
                    pipColors={getPipColorsForFace(face)}
                  />
                  <div style={{ fontSize: 8, marginTop: 1, color: isFixed ? '#705828' : '#998a78' }}>
                    {isFixed ? '固有' : 'カスタム'}
                  </div>
                  {synergy.multiplier > 1 && (
                    <div style={{
                      position: 'absolute', top: -4, right: -4,
                      background: '#705828', color: '#f5f0e8', fontSize: 8,
                      borderRadius: 8, padding: '0 3px', fontWeight: 'bold',
                    }}>
                      x{synergy.multiplier}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 選択面の詳細 */}
          {selectedFace && currentFace && (
            <div style={{ marginTop: 8, borderTop: '1px solid #c0b8a8', paddingTop: 8 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6,
              }}>
                <span style={{ fontSize: 12, color: isCurrentFixed ? '#705828' : '#4070a0' }}>
                  {selectedFace}の面 — {selectedFace}ソケット — {isCurrentFixed ? '固有面' : 'カスタム面'}
                </span>
              </div>

              {isCurrentFixed ? (
                // 固有面: 表示のみ
                <div>
                  {(currentFace as FixedFace).sockets.map((s, i) => {
                    const skill = FIXED_SKILLS[s.skillId];
                    return (
                      <div key={i} style={{
                        display: 'flex', gap: 6, alignItems: 'center',
                        padding: '4px 6px', background: '#e0d8cc', borderRadius: 4, marginBottom: 3,
                      }}>
                        <span style={{ fontSize: 10, color: '#705828' }}>🔒</span>
                        <ElementBadge element={s.element} />
                        <span style={{ fontSize: 11 }}>{skill?.name ?? s.skillId}</span>
                        <span style={{ fontSize: 9, color: '#998a78', marginLeft: 'auto' }}>{skill?.effect.description}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // カスタム面: ルーン装着可能
                <div>
                  {(currentFace as CustomFace).sockets.map((s, i) => {
                    const rune = s.skillRuneId ? getSkillRune(s.skillRuneId) : null;
                    const isSelected = selectedSocket === i;

                    return (
                      <div
                        key={i}
                        style={{
                          display: 'flex', gap: 6, alignItems: 'center',
                          padding: '5px 6px',
                          background: isSelected ? '#e8e0d4' : '#e0d8cc',
                          border: isSelected ? '1px solid #8a7050' : '1px solid transparent',
                          borderRadius: 4, marginBottom: 3,
                          cursor: 'pointer',
                        }}
                        onClick={() => setSelectedSocket(isSelected ? null : i)}
                      >
                        <span style={{
                          fontSize: 9, color: TIER_COLORS[s.socketTier],
                          fontWeight: 'bold', minWidth: 40,
                        }}>
                          [{s.socketTier}]
                        </span>
                        {rune ? (
                          <>
                            <ElementBadge element={rune.element} />
                            <span style={{ fontSize: 11 }}>{rune.name}</span>
                            <span style={{ fontSize: 9, color: '#998a78', marginLeft: 'auto' }}>{rune.effect.description}</span>
                          </>
                        ) : (
                          <span style={{ fontSize: 10, color: '#998a78' }}>— 空きソケット —</span>
                        )}
                      </div>
                    );
                  })}

                  {/* 取り外しボタン */}
                  {selectedSocket !== null && currentCustomFace && currentCustomFace.sockets[selectedSocket]?.skillRuneId && (
                    <button
                      className="rpg-btn rpg-btn-danger"
                      style={{ padding: '6px 12px', fontSize: 11, marginTop: 4 }}
                      onClick={handleUnequip}
                    >
                      ルーンを外す
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ルーン一覧（ソケット選択中のみ表示） */}
      {selectedSocket !== null && currentCustomFace && !isCurrentFixed && (
        <div className="rpg-panel fade-in" style={{ padding: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: '#4070a0' }}>
              所持ルーン ({filteredRunes.length})
            </span>
            {/* 属性フィルタ */}
            <div style={{ display: 'flex', gap: 2 }}>
              <button
                style={{
                  fontSize: 9, padding: '2px 4px', cursor: 'pointer',
                  background: filterElement === 'all' ? '#d8d0c4' : 'transparent',
                  border: '1px solid #c0b8a8', borderRadius: 3, color: '#3a2a1a',
                }}
                onClick={() => setFilterElement('all')}
              >
                全
              </button>
              {(['blaze', 'frost', 'volt', 'venom', 'alloy', 'mirage'] as Element[]).map(el => (
                <button
                  key={el}
                  style={{
                    fontSize: 9, padding: '2px 4px', cursor: 'pointer',
                    background: filterElement === el ? ELEMENT_COLORS[el] + '40' : 'transparent',
                    border: `1px solid ${ELEMENT_COLORS[el]}60`, borderRadius: 3,
                    color: ELEMENT_COLORS[el],
                  }}
                  onClick={() => setFilterElement(el)}
                >
                  {ELEMENT_NAMES[el]}
                </button>
              ))}
            </div>
          </div>

          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {filteredRunes.length === 0 && (
              <div style={{ color: '#998a78', fontSize: 11, padding: 8, textAlign: 'center' }}>
                ルーンがありません
              </div>
            )}
            {filteredRunes.map((rune, i) => {
              const compatible = canEquipToSocket(rune.tier);
              return (
                <div
                  key={`${rune.id}-${i}`}
                  style={{
                    display: 'flex', gap: 6, alignItems: 'center',
                    padding: '4px 6px', borderRadius: 4, marginBottom: 2,
                    background: compatible ? '#e0d8cc' : '#f0d8d8',
                    opacity: compatible ? 1 : 0.4,
                    cursor: compatible ? 'pointer' : 'default',
                  }}
                  onClick={() => compatible && handleEquip(rune.id)}
                >
                  <ElementBadge element={rune.element} />
                  <span style={{ fontSize: 11 }}>{rune.name}</span>
                  <span style={{
                    fontSize: 9,
                    color: rune.tier === 'rare' ? '#4070a0' : rune.tier === 'epic' ? '#7050a0' : rune.tier === 'legendary' ? '#705828' : '#998a78',
                  }}>
                    [{rune.tier}]
                  </span>
                  <span style={{ fontSize: 9, color: '#998a78', marginLeft: 'auto' }}>
                    {rune.effect.type === 'damage' ? `${rune.effect.power}dmg` :
                     rune.effect.type === 'heal' ? `+${rune.effect.power}HP` :
                     rune.effect.description}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ padding: '4px 0' }}>
        <button className="rpg-btn" onClick={() => setScreen('town')}>
          街に戻る
        </button>
      </div>
    </div>
  );
}
