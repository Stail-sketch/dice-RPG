import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { SHOP_ITEMS } from '../../data/shop';
import { ElementBadge } from '../common/ElementBadge';

type Filter = 'all' | 'rune' | 'material';

export function ShopScreen() {
  const { setScreen, gold, gems, materials, addGold, addGems, addRune, addMaterial } = useGameStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [message, setMessage] = useState<string | null>(null);

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
    }
    setTimeout(() => setMessage(null), 1200);
  };

  return (
    <div style={{ padding: 8 }}>
      <div className="rpg-panel">
        <div className="rpg-panel-title">ショップ</div>
      </div>

      {/* 所持金 */}
      <div className="rpg-panel" style={{ display: 'flex', justifyContent: 'space-around', fontSize: 11 }}>
        <span style={{ color: '#705828' }}>{gold}G</span>
        <span style={{ color: '#4070a0' }}>{gems} Gem</span>
        <span style={{ color: '#998a78' }}>鍛冶石: {materials['forge-stone']}</span>
        <span style={{ color: '#7050a0' }}>鉱石: {materials['rare-ore']}</span>
      </div>

      {message && (
        <div style={{
          textAlign: 'center', padding: 4, fontSize: 12,
          color: message.includes('足りない') ? '#b04030' : '#308050',
        }}>
          {message}
        </div>
      )}

      {/* フィルタ */}
      <div style={{ display: 'flex', gap: 4, padding: '4px 8px' }}>
        {([['all', '全て'], ['rune', 'ルーン'], ['material', '素材']] as const).map(([key, label]) => (
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
      <div style={{ maxHeight: 'calc(100vh - 260px)', overflowY: 'auto' }}>
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
              <button className="rpg-btn"
                style={{ width: 'auto', padding: '4px 10px', margin: 0, fontSize: 11 }}
                onClick={() => buy(item)}
              >
                {item.price}{item.currency === 'gold' ? 'G' : 'Gem'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '4px 0' }}>
        <button className="rpg-btn" onClick={() => setScreen('town')}>街に戻る</button>
      </div>
    </div>
  );
}
