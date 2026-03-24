import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { getAllFaces, isFixedFace, ELEMENT_NAMES, type FixedFace, type CustomFace, type Element, type SocketTier, type SkillTier, type MonsterDice } from '../../types';
import { FIXED_SKILLS, getSkillRune, SKILL_RUNES } from '../../data/skill-runes';
import { getMagicDice, type MagicCategory } from '../../data/magic-dice';
import { ElementBadge, ELEMENT_COLORS } from '../common/ElementBadge';
import { DiceFaceView } from '../common/DiceFaceView';
import { MonsterDetailModal } from '../common/MonsterDetailModal';
import { DicePreview } from '../common/DicePreview';
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

const CATEGORY_NAMES: Record<MagicCategory, string> = {
  dice_control: '制御',
  attack: '攻撃',
  defense: '防御',
  sabotage: '妨害',
  gamble: '賭け',
};

const SET_NAMES: Record<string, string> = {
  ember: '残り火セット',
  permafrost: '永久凍土セット',
  static: '静電気セット',
  toxin: '毒素セット',
  fortress: '城壁セット',
  phantom: '残影セット',
};

function getActiveSetBonuses(dice: MonsterDice): Array<{ setId: string; count: number; bonus: string }> {
  const setCounts: Record<string, number> = {};
  for (const face of dice.customFaces) {
    for (const socket of face.sockets) {
      if (socket.skillRuneId) {
        const rune = SKILL_RUNES.find(r => r.id === socket.skillRuneId);
        if (rune?.setId) {
          setCounts[rune.setId] = (setCounts[rune.setId] || 0) + 1;
        }
      }
    }
  }
  return Object.entries(setCounts)
    .filter(([, count]) => count >= 2)
    .map(([setId, count]) => ({
      setId,
      count,
      bonus: count >= 3 ? '攻撃力 x1.5' : '攻撃力 x1.2',
    }));
}

function getEquippedSetCount(dice: MonsterDice, setId: string): number {
  let count = 0;
  for (const face of dice.customFaces) {
    for (const socket of face.sockets) {
      if (socket.skillRuneId) {
        const rune = SKILL_RUNES.find(r => r.id === socket.skillRuneId);
        if (rune?.setId === setId) count++;
      }
    }
  }
  return count;
}

export function DiceEditorScreen() {
  const { setScreen, ownedDice, party, setParty, ownedRunes, equipRune, unequipRune, removeRune, protagonistDice, ownedMagicDice, equippedMagicDice, equipMagicDice, sellDice, sellRune, changeHeroElement } = useGameStore();
  const [message, setMessage] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number>(0);
  const [selectedFace, setSelectedFace] = useState<number | null>(null);
  const [selectedSocket, setSelectedSocket] = useState<number | null>(null);
  const [filterElement, setFilterElement] = useState<Element | 'all'>('all');
  const [runeSort, setRuneSort] = useState<'default' | 'power' | 'tier' | 'type'>('default');
  const [diceSort, setDiceSort] = useState<'default' | 'rarity' | 'element' | 'name'>('default');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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
    if (!socket || socket.locked) return;

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
    // 次の空きソケットに自動移動（なければそのまま維持）
    const nextEmpty = currentCustomFace.sockets.findIndex((s, i) => i > selectedSocket && !s.skillRuneId);
    if (nextEmpty !== -1) {
      setSelectedSocket(nextEmpty);
    }
    // ソケット選択は維持（ルーン一覧が消えないように）
  };

  const handleUnequip = () => {
    if (!currentDice || selectedFace === null || selectedSocket === null || !currentCustomFace) return;
    const socket = currentCustomFace.sockets[selectedSocket];
    if (socket?.locked) return;
    unequipRune(currentDice.id, selectedFace, selectedSocket);
    setSelectedSocket(null);
  };

  // フィルタ + ソート済みルーン
  const TIER_ORDER: Record<string, number> = { common: 0, rare: 1, epic: 2, legendary: 3 };
  const filteredRunes = (() => {
    let runes = filterElement === 'all' ? [...ownedRunes] : ownedRunes.filter(r => r.element === filterElement);
    if (runeSort === 'power') runes.sort((a, b) => b.effect.power - a.effect.power);
    else if (runeSort === 'tier') runes.sort((a, b) => (TIER_ORDER[b.tier] ?? 0) - (TIER_ORDER[a.tier] ?? 0));
    else if (runeSort === 'type') runes.sort((a, b) => a.effect.type.localeCompare(b.effect.type));
    return runes;
  })();

  // 装備可能かチェック
  const canEquipToSocket = (runeTier: SkillTier) => {
    if (!currentCustomFace || selectedSocket === null) return false;
    const socket = currentCustomFace.sockets[selectedSocket];
    return socket ? TIER_COMPAT[socket.socketTier].includes(runeTier) : false;
  };

  // セットボーナス計算
  const setBonuses = currentDice ? getActiveSetBonuses(currentDice) : [];

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

      {/* ヒーロー属性セレクター */}
      {currentDice?.id === 'protagonist' && (
        <div className="rpg-panel" style={{ marginBottom: 8 }}>
          <div className="rpg-panel-title">ヒーロー属性</div>
          <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
            {(['blaze', 'frost', 'volt', 'venom', 'alloy', 'mirage'] as Element[]).map(el => (
              <button
                key={el}
                onClick={() => changeHeroElement(el)}
                style={{
                  padding: '4px 10px', fontSize: 11, cursor: 'pointer',
                  background: protagonistDice.element === el ? ELEMENT_COLORS[el] + '30' : 'transparent',
                  border: `2px solid ${protagonistDice.element === el ? ELEMENT_COLORS[el] : '#c0b8a8'}`,
                  borderRadius: 4,
                  color: ELEMENT_COLORS[el],
                  fontWeight: protagonistDice.element === el ? 'bold' : 'normal',
                }}
              >
                {ELEMENT_NAMES[el]}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 9, color: '#998a78', textAlign: 'center', marginTop: 4 }}>
            属性を変更するとシナジーや相性が変わります
          </div>
        </div>
      )}

      {/* 所持ダイス一覧 */}
      <div className="rpg-panel" style={{ padding: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: '#998a78' }}>
            所持ダイス — {ownedDice.length + 1}個
          </span>
          <div style={{ display: 'flex', gap: 2 }}>
            {([['default', '入手順'], ['rarity', '★順'], ['element', '属性'], ['name', '名前']] as const).map(([key, label]) => (
              <button key={key}
                style={{
                  fontSize: 8, padding: '1px 4px', cursor: 'pointer', borderRadius: 3,
                  background: diceSort === key ? '#d8d0c4' : 'transparent',
                  border: '1px solid #c0b8a8', color: '#3a2a1a',
                }}
                onClick={() => setDiceSort(key)}
              >{label}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {[protagonistDice, ...(() => {
            const ELEM_ORDER: Record<string, number> = { blaze: 0, frost: 1, volt: 2, venom: 3, alloy: 4, mirage: 5 };
            const sorted = [...ownedDice];
            if (diceSort === 'rarity') sorted.sort((a, b) => b.rarity - a.rarity);
            else if (diceSort === 'element') sorted.sort((a, b) => (ELEM_ORDER[a.element] ?? 9) - (ELEM_ORDER[b.element] ?? 9));
            else if (diceSort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
            return sorted;
          })()].map((d, i) => (
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

      {/* トーストメッセージ */}
      {message && (
        <div style={{
          position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)',
          padding: '6px 16px', fontSize: 12, borderRadius: 6, zIndex: 1000,
          background: '#e0f0e0', color: '#308050', border: '1px solid #a0d0a0',
          pointerEvents: 'none',
        }}>{message}</div>
      )}

      {/* ダイス操作ボタン */}
      {currentDice && (
        <div style={{ display: 'flex', gap: 4, margin: '4px 0', flexWrap: 'wrap' }}>
          {selectedFace && currentCustomFace && currentCustomFace.sockets.some(s => s.skillRuneId && !s.locked) && (
            <button className="rpg-btn" style={{ flex: 1, padding: '4px 0', margin: 0, fontSize: 9 }}
              onClick={() => {
                for (let i = 0; i < currentCustomFace.sockets.length; i++) {
                  if (currentCustomFace.sockets[i].skillRuneId && !currentCustomFace.sockets[i].locked) {
                    unequipRune(currentDice.id, selectedFace, i);
                  }
                }
                setSelectedSocket(null);
                setMessage(`${selectedFace}の面のルーンを全て外しました`);
                setTimeout(() => setMessage(null), 1200);
              }}
            >{selectedFace}面ルーン全外し</button>
          )}
          <button className="rpg-btn" style={{ padding: '4px 8px', margin: 0, fontSize: 9 }}
            onClick={() => setShowDetailModal(true)}
          >詳細</button>
          <button className="rpg-btn" style={{
            padding: '4px 8px', margin: 0, fontSize: 9,
            background: showPreview ? '#e0d8cc' : undefined,
            borderColor: showPreview ? '#705828' : undefined,
          }}
            onClick={() => setShowPreview(!showPreview)}
          >全面プレビュー</button>
          {currentDice.id !== 'protagonist' && !party.includes(currentDice.id) && (
            <button className="rpg-btn rpg-btn-danger" style={{ flex: 1, padding: '4px 0', margin: 0, fontSize: 9 }}
              onClick={() => {
                if (confirm(`${currentDice.name}を売却しますか？\nジェムのかけら1個を獲得`)) {
                  sellDice(currentDice.id);
                  setSelectedSlot(0); setSelectedFace(null); setSelectedSocket(null);
                  setMessage('売却しました');
                  setTimeout(() => setMessage(null), 1200);
                }
              }}
            >ダイス売却</button>
          )}
        </div>
      )}

      {/* 全面プレビュー */}
      {currentDice && showPreview && (
        <div className="rpg-panel fade-in" style={{ padding: 8 }}>
          <div className="rpg-panel-title" style={{ margin: '0 0 8px 0', fontSize: 11 }}>
            {currentDice.name} — 全面プレビュー
          </div>
          <DicePreview dice={currentDice} size={48} />
        </div>
      )}

      {/* セットボーナス表示 */}
      {currentDice && setBonuses.length > 0 && (
        <div className="rpg-panel fade-in" style={{ padding: 8 }}>
          <div style={{ fontSize: 11, color: '#b09050', fontWeight: 'bold', marginBottom: 4 }}>
            セットボーナス
          </div>
          {setBonuses.map(({ setId, count, bonus }) => {
            const isComplete = count >= 3;
            return (
              <div key={setId} style={{
                display: 'flex', gap: 6, alignItems: 'center',
                padding: '4px 8px', borderRadius: 4, marginBottom: 3,
                background: isComplete ? '#f8f0d8' : '#e8e0d4',
                border: isComplete ? '2px solid #c0a030' : '1px solid #d0c8b8',
              }}>
                <span style={{ fontSize: 11, fontWeight: 'bold', color: isComplete ? '#b09020' : '#8a7050' }}>
                  {SET_NAMES[setId] || setId}
                </span>
                <span style={{
                  fontSize: 9, color: isComplete ? '#b09020' : '#998a78',
                  background: isComplete ? '#f0e8c8' : '#e0d8cc',
                  padding: '1px 4px', borderRadius: 3,
                }}>
                  {count}/3
                </span>
                <span style={{ fontSize: 9, color: isComplete ? '#907010' : '#998a78', marginLeft: 'auto' }}>
                  {bonus}
                </span>
              </div>
            );
          })}
        </div>
      )}

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
                    const eff = skill?.effect;
                    const etNames: Record<string, string> = { damage: 'ダメージ', heal: '回復', dot: '継続', buff: 'バフ', debuff: 'デバフ', shield: 'シールド' };
                    return (
                      <div key={i} style={{
                        display: 'flex', gap: 6, alignItems: 'center',
                        padding: '4px 6px', background: '#e0d8cc', borderRadius: 4, marginBottom: 3,
                      }}>
                        <span style={{ fontSize: 10, color: '#705828' }}>🔒</span>
                        <ElementBadge element={s.element} />
                        <span style={{ fontSize: 11 }}>{skill?.name ?? s.skillId}</span>
                        {eff && (
                          <span style={{ fontSize: 8, color: '#6a5a4a', display: 'flex', gap: 4, alignItems: 'center', marginLeft: 'auto' }}>
                            <span style={{ padding: '0 3px', borderRadius: 2, background: '#d8d0c4' }}>{etNames[eff.type] ?? eff.type}</span>
                            <span style={{ fontWeight: 'bold' }}>
                              {eff.type === 'buff' || eff.type === 'debuff' ? `x${eff.power}` : eff.power}
                            </span>
                            {eff.duration && <span>{eff.duration}T</span>}
                          </span>
                        )}
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
                    const isLocked = !!s.locked;

                    return (
                      <div
                        key={i}
                        style={{
                          display: 'flex', gap: 6, alignItems: 'center',
                          padding: '5px 6px',
                          background: isLocked ? '#d8d0c8' : isSelected ? '#e8e0d4' : '#e0d8cc',
                          border: isSelected && !isLocked ? '1px solid #8a7050' : '1px solid transparent',
                          borderRadius: 4, marginBottom: 3,
                          cursor: isLocked ? 'default' : 'pointer',
                          opacity: isLocked ? 0.8 : 1,
                        }}
                        onClick={() => !isLocked && setSelectedSocket(isSelected ? null : i)}
                      >
                        {isLocked && <span style={{ fontSize: 9, color: '#705828' }}>🔒</span>}
                        <span style={{
                          fontSize: 9, color: TIER_COLORS[s.socketTier],
                          fontWeight: 'bold', minWidth: isLocked ? 20 : 40,
                        }}>
                          [{s.socketTier}]
                        </span>
                        {rune ? (() => {
                          const eff = rune.effect;
                          const etNames: Record<string, string> = { damage: 'ダメージ', heal: '回復', dot: '継続', buff: 'バフ', debuff: 'デバフ', shield: 'シールド' };
                          return (
                            <>
                              <ElementBadge element={rune.element} />
                              <span style={{ fontSize: 11 }}>{rune.name}</span>
                              <span style={{ fontSize: 8, color: '#6a5a4a', display: 'flex', gap: 4, alignItems: 'center', marginLeft: 'auto' }}>
                                <span style={{ padding: '0 3px', borderRadius: 2, background: '#d8d0c4' }}>{etNames[eff.type] ?? eff.type}</span>
                                <span style={{ fontWeight: 'bold' }}>
                                  {eff.type === 'buff' || eff.type === 'debuff' ? `x${eff.power}` : eff.power}
                                </span>
                                {eff.duration && <span>{eff.duration}T</span>}
                              </span>
                            </>
                          );
                        })() : (
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
          {/* ソートボタン */}
          <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
            <span style={{ fontSize: 8, color: '#998a78', lineHeight: '18px' }}>並び:</span>
            {([['default', '標準'], ['power', '威力'], ['tier', 'レア度'], ['type', '効果']] as const).map(([key, label]) => (
              <button key={key}
                style={{
                  fontSize: 8, padding: '1px 4px', cursor: 'pointer', borderRadius: 3,
                  background: runeSort === key ? '#d8d0c4' : 'transparent',
                  border: '1px solid #c0b8a8', color: '#3a2a1a',
                }}
                onClick={() => setRuneSort(key)}
              >{label}</button>
            ))}
          </div>

          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {filteredRunes.length === 0 && (
              <div style={{ color: '#998a78', fontSize: 11, padding: 8, textAlign: 'center' }}>
                ルーンがありません
              </div>
            )}
            {filteredRunes.map((rune, i) => {
              const compatible = canEquipToSocket(rune.tier);
              // セットID表示: このルーンにsetIdがあれば、現在のダイスに装備済みの同セット数を表示
              const setInfo = rune.setId && currentDice
                ? { setId: rune.setId, equipped: getEquippedSetCount(currentDice, rune.setId) }
                : null;
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
                  {setInfo && (
                    <span style={{
                      fontSize: 8,
                      color: setInfo.equipped >= 2 ? '#b09020' : '#998a78',
                      background: setInfo.equipped >= 2 ? '#f0e8c8' : '#e8e0d8',
                      padding: '0 3px', borderRadius: 2,
                      border: setInfo.equipped >= 2 ? '1px solid #c0a030' : '1px solid #d0c8b8',
                    }}>
                      SET {setInfo.equipped}/3
                    </span>
                  )}
                  <span style={{ fontSize: 9, color: '#998a78', marginLeft: 'auto' }}>
                    {rune.effect.type === 'damage' ? `${rune.effect.power}dmg` :
                     rune.effect.type === 'heal' ? `+${rune.effect.power}HP` :
                     rune.effect.description}
                  </span>
                  <button
                    style={{ fontSize: 7, padding: '1px 4px', marginLeft: 4, border: '1px solid #c0a0a0', borderRadius: 3, background: '#f0e8e0', color: '#b04030', cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); sellRune(rune.id); setMessage('ルーン売却 → 鍛冶石+1'); setTimeout(() => setMessage(null), 1000); }}
                  >売</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* マジックダイス装備 */}
      <div className="rpg-panel" style={{ padding: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span className="rpg-panel-title" style={{ margin: 0, fontSize: 12 }}>
            魔法ダイス装備
          </span>
          {equippedMagicDice && (() => {
            const md = getMagicDice(equippedMagicDice);
            return md ? (
              <span style={{ fontSize: 9, color: '#705828' }}>
                装備中: {md.name} [CG{md.cost}]
              </span>
            ) : null;
          })()}
        </div>

        {ownedMagicDice.length === 0 ? (
          <div style={{ color: '#998a78', fontSize: 11, padding: 8, textAlign: 'center' }}>
            魔法ダイスを所持していません（ショップで購入できます）
          </div>
        ) : (
          <div style={{ maxHeight: 180, overflowY: 'auto' }}>
            {/* 外すボタン */}
            {equippedMagicDice && (
              <div
                style={{
                  display: 'flex', gap: 6, alignItems: 'center',
                  padding: '5px 6px', background: '#f0e8dc',
                  border: '1px solid #c0b8a8', borderRadius: 4, marginBottom: 3,
                  cursor: 'pointer',
                }}
                onClick={() => equipMagicDice(null)}
              >
                <span style={{ fontSize: 10, color: '#998a78' }}>— 外す —</span>
              </div>
            )}
            {ownedMagicDice.map(id => {
              const md = getMagicDice(id);
              if (!md) return null;
              const isEquipped = equippedMagicDice === id;
              return (
                <div
                  key={id}
                  style={{
                    display: 'flex', gap: 6, alignItems: 'center',
                    padding: '5px 6px',
                    background: isEquipped ? '#e8e0d0' : '#e0d8cc',
                    border: isEquipped ? '2px solid #705828' : '1px solid transparent',
                    borderRadius: 4, marginBottom: 3,
                    cursor: 'pointer',
                  }}
                  onClick={() => equipMagicDice(isEquipped ? null : id)}
                >
                  <span style={{
                    fontSize: 9, color: '#8a7050', fontWeight: 'bold', minWidth: 28,
                  }}>
                    [{CATEGORY_NAMES[md.category]}]
                  </span>
                  <span style={{ fontSize: 11, color: '#3a2a1a' }}>{md.name}</span>
                  <span style={{ fontSize: 9, color: '#705828', marginLeft: 2 }}>CG{md.cost}</span>
                  <span style={{ fontSize: 9, color: '#998a78', marginLeft: 'auto', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {md.effect}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ padding: '4px 0' }}>
        <button className="rpg-btn" onClick={() => setScreen('town')}>
          街に戻る
        </button>
      </div>

      {/* モンスター詳細モーダル */}
      {showDetailModal && currentDice && (
        <MonsterDetailModal monster={currentDice} onClose={() => setShowDetailModal(false)} />
      )}
    </div>
  );
}
