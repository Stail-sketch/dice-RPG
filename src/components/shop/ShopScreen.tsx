import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { SHOP_ITEMS } from '../../data/shop';
import { ElementBadge, ELEMENT_COLORS } from '../common/ElementBadge';

import { ELEMENT_NAMES } from '../../types';

type Filter = 'all' | 'rune' | 'material' | 'magic-dice';
type ShopMode = 'buy' | 'sell';

const SELL_TIER_COLORS: Record<string, string> = {
  common: '#6a5a4a', rare: '#3070a0', epic: '#7050a0', legendary: '#b08020',
};
const SELL_TIER_NAMES: Record<string, string> = {
  common: 'コモン', rare: 'レア', epic: 'エピック', legendary: 'レジェンド',
};

export function ShopScreen() {
  const { setScreen, gold, gems, materials, addGold, addGems, addRune, addMaterial, addMagicDice, ownedMagicDice, ownedDice, ownedRunes, party, sellDice, sellRune, gemFragments } = useGameStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [message, setMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<ShopMode>('buy');
  const [sellSort, setSellSort] = useState<'default' | 'rarity' | 'element' | 'tier'>('default');

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
            ダイス売却 → かけら1個 / ルーン売却 → 鍛冶石1個
          </div>

          {/* ソートボタン */}
          <div style={{ display: 'flex', gap: 2, padding: '2px 8px', marginBottom: 4 }}>
            <span style={{ fontSize: 8, color: '#998a78', lineHeight: '18px' }}>並び:</span>
            {([['default', '入手順'], ['rarity', '★順'], ['element', '属性'], ['tier', 'レア度']] as const).map(([key, label]) => (
              <button key={key} style={{
                fontSize: 8, padding: '1px 5px', cursor: 'pointer', borderRadius: 3,
                background: sellSort === key ? '#d8d0c4' : 'transparent',
                border: '1px solid #c0b8a8', color: '#3a2a1a',
              }} onClick={() => setSellSort(key)}>{label}</button>
            ))}
          </div>

          {/* 一括売却ボタン */}
          <div style={{ display: 'flex', gap: 4, padding: '0 8px 4px' }}>
            {(() => {
              const commonRunes = ownedRunes.filter(r => r.tier === 'common');
              const rareAndBelow = ownedRunes.filter(r => r.tier === 'common' || r.tier === 'rare');
              return (
                <>
                  <button className="rpg-btn" style={{ flex: 1, padding: '3px 0', margin: 0, fontSize: 8 }}
                    disabled={commonRunes.length === 0}
                    onClick={() => {
                      if (!confirm(`コモンルーン${commonRunes.length}個を全て売却しますか？\n鍛冶石+${commonRunes.length}`)) return;
                      let count = 0;
                      for (const r of [...commonRunes]) { sellRune(r.id); count++; }
                      setMessage(`コモン${count}個売却 → 鍛冶石+${count}`);
                      setTimeout(() => setMessage(null), 1500);
                    }}
                  >コモン全売却({commonRunes.length})</button>
                  <button className="rpg-btn" style={{ flex: 1, padding: '3px 0', margin: 0, fontSize: 8 }}
                    disabled={rareAndBelow.length === 0}
                    onClick={() => {
                      if (!confirm(`コモン+レアルーン${rareAndBelow.length}個を全て売却しますか？\n鍛冶石+${rareAndBelow.length}`)) return;
                      let count = 0;
                      for (const r of [...rareAndBelow]) { sellRune(r.id); count++; }
                      setMessage(`${count}個売却 → 鍛冶石+${count}`);
                      setTimeout(() => setMessage(null), 1500);
                    }}
                  >レア以下全売却({rareAndBelow.length})</button>
                </>
              );
            })()}
          </div>

          <div style={{ maxHeight: 'calc(100vh - 350px)', overflowY: 'auto' }}>
            {/* ダイス売却 */}
            <div style={{ fontSize: 10, color: '#705828', fontWeight: 'bold', padding: '4px 8px', borderBottom: '1px solid #d8d0c4' }}>
              ダイス ({ownedDice.filter(d => !party.includes(d.id)).length}体売却可)
            </div>
            {(() => {
              const ELEM_ORDER: Record<string, number> = { blaze: 0, frost: 1, volt: 2, venom: 3, alloy: 4, mirage: 5 };
              const sorted = [...ownedDice];
              if (sellSort === 'rarity') sorted.sort((a, b) => b.rarity - a.rarity);
              else if (sellSort === 'element') sorted.sort((a, b) => (ELEM_ORDER[a.element] ?? 9) - (ELEM_ORDER[b.element] ?? 9));
              return sorted;
            })().map((d, i) => {
              const inParty = party.includes(d.id);
              return (
                <div key={`dice-${d.id}-${i}`} style={{
                  display: 'flex', gap: 6, alignItems: 'center',
                  padding: '5px 8px', borderBottom: '1px solid #e8e0d8',
                  opacity: inParty ? 0.4 : 1,
                }}>
                  <span style={{ fontSize: 8, color: ELEMENT_COLORS[d.element] }}>{'★'.repeat(d.rarity)}</span>
                  <span style={{ fontSize: 10, color: ELEMENT_COLORS[d.element], minWidth: 20 }}>{ELEMENT_NAMES[d.element]}</span>
                  <span style={{ fontSize: 11, flex: 1 }}>{d.name}</span>
                  {inParty ? (
                    <span style={{ fontSize: 8, color: '#998a78' }}>PT中</span>
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
            {(() => {
              const TIER_ORDER: Record<string, number> = { legendary: 0, epic: 1, rare: 2, common: 3 };
              const ELEM_ORDER: Record<string, number> = { blaze: 0, frost: 1, volt: 2, venom: 3, alloy: 4, mirage: 5 };
              const sorted = [...ownedRunes];
              if (sellSort === 'tier') sorted.sort((a, b) => (TIER_ORDER[a.tier] ?? 9) - (TIER_ORDER[b.tier] ?? 9));
              else if (sellSort === 'element') sorted.sort((a, b) => (ELEM_ORDER[a.element] ?? 9) - (ELEM_ORDER[b.element] ?? 9));
              else if (sellSort === 'rarity') sorted.sort((a, b) => (TIER_ORDER[a.tier] ?? 9) - (TIER_ORDER[b.tier] ?? 9));
              return sorted;
            })().map((r, i) => (
              <div key={`rune-${r.id}-${i}`} style={{
                display: 'flex', gap: 6, alignItems: 'center',
                padding: '4px 8px', borderBottom: '1px solid #e8e0d8',
                background: r.tier === 'legendary' ? '#fff8e020' : r.tier === 'epic' ? '#ece0f010' : 'transparent',
              }}>
                <ElementBadge element={r.element} />
                <span style={{ fontSize: 10, flex: 1 }}>{r.name}</span>
                <span style={{
                  fontSize: 7, padding: '1px 4px', borderRadius: 3,
                  color: SELL_TIER_COLORS[r.tier],
                  background: SELL_TIER_COLORS[r.tier] + '20',
                  border: `1px solid ${SELL_TIER_COLORS[r.tier]}40`,
                  fontWeight: 'bold',
                }}>{SELL_TIER_NAMES[r.tier]}</span>
                {r.tier === 'epic' || r.tier === 'legendary' ? (
                  <span style={{ fontSize: 7, color: '#b04030', minWidth: 28, textAlign: 'center' }}>保護</span>
                ) : (
                  <button className="rpg-btn rpg-btn-danger"
                    style={{ width: 'auto', padding: '3px 8px', margin: 0, fontSize: 9 }}
                    onClick={() => {
                      sellRune(r.id);
                      setMessage('売却 → 鍛冶石+1');
                      setTimeout(() => setMessage(null), 1000);
                    }}
                  >売却</button>
                )}
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
