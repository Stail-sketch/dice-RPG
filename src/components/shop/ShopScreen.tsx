import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { SHOP_ITEMS } from '../../data/shop';
import { ElementBadge, ELEMENT_COLORS } from '../common/ElementBadge';
import { ELEMENT_NAMES } from '../../types';

type Filter = 'all' | 'rune' | 'material' | 'magic-dice';
type ShopMode = 'buy' | 'sell';

export function ShopScreen() {
  const { setScreen, gold, gems, materials, addGold, addGems, addRune, addMaterial, addMagicDice, ownedMagicDice, ownedDice, ownedRunes, party, sellDice, sellRune, gemFragments } = useGameStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [message, setMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<ShopMode>('buy');

  const filtered = filter === 'all' ? SHOP_ITEMS : SHOP_ITEMS.filter(i => i.type === filter);

  const buy = (item: typeof SHOP_ITEMS[0]) => {
    if (item.currency === 'gold' && gold < item.price) {
      setMessage('ゴールドが足りない！'); setTimeout(() => setMessage(null), 1200); return;
    }
    if (item.currency === 'gems' && gems < item.price) {
      setMessage('ジェムが足りない！'); setTimeout(() => setMessage(null), 1200); return;
    }

    if (item.currency === 'gold') addGold(-item.price);
    else addGems(-item.price);

    if (item.type === 'rune' && item.rune) {
      addRune({ ...item.rune });
      setMessage(`${item.name}を購入！`);
    } else if (item.type === 'material' && item.materialId) {
      addMaterial(item.materialId as 'forge-stone' | 'rare-ore', 1);
      setMessage(`${item.name}を購入！`);
    } else if (item.type === 'magic-dice' && item.magicDiceId) {
      if (ownedMagicDice.includes(item.magicDiceId)) {
        setMessage('すでに所持している！'); setTimeout(() => setMessage(null), 1200); return;
      }
      addMagicDice(item.magicDiceId);
      setMessage(`${item.name}を入手！`);
    }
    setTimeout(() => setMessage(null), 1200);
  };

  return (
    <div style={{ padding: 8 }}>
      <div className="rpg-panel">
        <div className="rpg-panel-title">ショップ</div>
      </div>

      {/* 所持金 */}
      <div className="rpg-panel" style={{ display: 'flex', justifyContent: 'space-around', fontSize: 11, flexWrap: 'wrap', gap: 2 }}>
        <span style={{ color: '#705828' }}>{gold}G</span>
        <span style={{ color: '#4070a0' }}>{gems}Gem({gemFragments})</span>
        <span style={{ color: '#998a78' }}>石:{materials['forge-stone']}</span>
        <span style={{ color: '#7050a0' }}>鉱:{materials['rare-ore']}</span>
      </div>

      {/* 購入/売却切替 */}
      <div style={{ display: 'flex', gap: 4, margin: '4px 0' }}>
        <button
          style={{ flex: 1, padding: '6px 0', fontSize: 11, fontWeight: 'bold', border: `1px solid ${mode === 'buy' ? '#705828' : '#c0b8a8'}`, borderRadius: 4, background: mode === 'buy' ? '#705828' : '#ece5d8', color: mode === 'buy' ? '#f5f0e8' : '#6a5a4a', cursor: 'pointer' }}
          onClick={() => setMode('buy')}
        >購入</button>
        <button
          style={{ flex: 1, padding: '6px 0', fontSize: 11, fontWeight: 'bold', border: `1px solid ${mode === 'sell' ? '#b04030' : '#c0b8a8'}`, borderRadius: 4, background: mode === 'sell' ? '#b04030' : '#ece5d8', color: mode === 'sell' ? '#f5f0e8' : '#6a5a4a', cursor: 'pointer' }}
          onClick={() => setMode('sell')}
        >売却</button>
      </div>

      {message && (
        <div style={{
          position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)',
          padding: '6px 16px', fontSize: 12, borderRadius: 6, zIndex: 1000,
          background: message.includes('足りない') || message.includes('所持') ? '#f8e0e0' : '#e0f0e0',
          color: message.includes('足りない') || message.includes('所持') ? '#b04030' : '#308050',
          border: '1px solid ' + (message.includes('足りない') || message.includes('所持') ? '#d0a0a0' : '#a0d0a0'),
          pointerEvents: 'none',
        }}>
          {message}
        </div>
      )}

      {mode === 'buy' ? (
        <>
          {/* フィルタ */}
          <div style={{ display: 'flex', gap: 4, padding: '4px 8px' }}>
            {([['all', '全て'], ['rune', 'ルーン'], ['material', '素材'], ['magic-dice', '魔法ダイス']] as const).map(([key, label]) => (
              <button key={key}
                style={{
                  fontSize: 10, padding: '3px 8px', cursor: 'pointer',
                  background: filter === key ? '#d8d0c4' : 'transparent',
                  border: '1px solid #c0b8a8', borderRadius: 3, color: '#3a2a1a',
                }}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 商品一覧 */}
          <div style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
            {filtered.map(item => (
              <div key={item.id} className="rpg-panel" style={{ padding: 8, marginBottom: 3 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 12 }}>{item.name}</span>
                      {item.rune && <ElementBadge element={item.rune.element} />}
                      {item.rune && (
                        <span style={{
                          fontSize: 9,
                          color: item.rune.tier === 'rare' ? '#4070a0' : '#998a78',
                        }}>
                          [{item.rune.tier}]
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 9, color: '#998a78', marginTop: 1 }}>
                      {item.description}
                    </div>
                  </div>
                  {item.type === 'magic-dice' && item.magicDiceId && ownedMagicDice.includes(item.magicDiceId) ? (
                    <span style={{ fontSize: 10, color: '#308050', padding: '4px 10px' }}>所持</span>
                  ) : (
                    <button className="rpg-btn"
                      style={{ width: 'auto', padding: '4px 10px', margin: 0, fontSize: 11 }}
                      onClick={() => buy(item)}
                    >
                      {item.price}{item.currency === 'gold' ? 'G' : 'Gem'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* 売却モード */}
          <div style={{ fontSize: 9, color: '#998a78', padding: '4px 8px' }}>
            ダイス売却 → ジェムかけら1個 / ルーン売却 → 鍛冶石1個
          </div>

          <div style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
            {/* ダイス売却 */}
            <div style={{ fontSize: 10, color: '#705828', fontWeight: 'bold', padding: '4px 8px', borderBottom: '1px solid #d8d0c4' }}>
              ダイス ({ownedDice.filter(d => !party.includes(d.id)).length}体売却可)
            </div>
            {ownedDice.map((d, i) => {
              const inParty = party.includes(d.id);
              return (
                <div key={`dice-${d.id}-${i}`} style={{
                  display: 'flex', gap: 6, alignItems: 'center',
                  padding: '5px 8px', borderBottom: '1px solid #e8e0d8',
                  opacity: inParty ? 0.4 : 1,
                }}>
                  <span style={{ fontSize: 8, color: ELEMENT_COLORS[d.element] }}>{'★'.repeat(d.rarity)}</span>
                  <span style={{ fontSize: 11, flex: 1 }}>{d.name}</span>
                  {inParty ? (
                    <span style={{ fontSize: 8, color: '#998a78' }}>パーティ中</span>
                  ) : (
                    <button className="rpg-btn rpg-btn-danger"
                      style={{ width: 'auto', padding: '3px 8px', margin: 0, fontSize: 9 }}
                      onClick={() => {
                        sellDice(d.id);
                        setMessage('売却 → かけら+1');
                        setTimeout(() => setMessage(null), 1000);
                      }}
                    >売却</button>
                  )}
                </div>
              );
            })}
            {ownedDice.filter(d => !party.includes(d.id)).length === 0 && (
              <div style={{ fontSize: 10, color: '#998a78', padding: 8, textAlign: 'center' }}>売却可能なダイスがありません</div>
            )}

            {/* ルーン売却 */}
            <div style={{ fontSize: 10, color: '#705828', fontWeight: 'bold', padding: '4px 8px', borderBottom: '1px solid #d8d0c4', marginTop: 8 }}>
              ルーン ({ownedRunes.length}個)
            </div>
            {ownedRunes.map((r, i) => (
              <div key={`rune-${r.id}-${i}`} style={{
                display: 'flex', gap: 6, alignItems: 'center',
                padding: '4px 8px', borderBottom: '1px solid #e8e0d8',
              }}>
                <ElementBadge element={r.element} />
                <span style={{ fontSize: 10, flex: 1 }}>{r.name}</span>
                <span style={{ fontSize: 8, color: '#998a78' }}>{r.tier}</span>
                <button className="rpg-btn rpg-btn-danger"
                  style={{ width: 'auto', padding: '3px 8px', margin: 0, fontSize: 9 }}
                  onClick={() => {
                    sellRune(r.id);
                    setMessage('売却 → 鍛冶石+1');
                    setTimeout(() => setMessage(null), 1000);
                  }}
                >売却</button>
              </div>
            ))}
            {ownedRunes.length === 0 && (
              <div style={{ fontSize: 10, color: '#998a78', padding: 8, textAlign: 'center' }}>売却可能なルーンがありません</div>
            )}
          </div>
        </>
      )}

      <div style={{ padding: '4px 0' }}>
        <button className="rpg-btn" onClick={() => setScreen('town')}>街に戻る</button>
      </div>
    </div>
  );
}
