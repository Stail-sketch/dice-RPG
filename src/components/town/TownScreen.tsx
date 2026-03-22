import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { DiceFaceView } from '../common/DiceFaceView';
import { ELEMENT_COLORS } from '../common/ElementBadge';

export function TownScreen() {
  const { setScreen, playerName, gold, gems, materials, ownedDice, ownedRunes, party, capturedMonsters, save } = useGameStore();
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const partyDice = party.map(id => ownedDice.find(d => d.id === id));

  const handleSave = async () => {
    await save();
    setSaveMsg('セーブしました！');
    setTimeout(() => setSaveMsg(null), 1500);
  };

  return (
    <div style={{ padding: 8 }}>
      {/* ステータス */}
      <div className="rpg-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 14, color: '#705828' }}>{playerName}</div>
          <div style={{ fontSize: 9, color: '#998a78' }}>
            ダイス:{ownedDice.length} ルーン:{ownedRunes.length} 図鑑:{capturedMonsters.length}
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 11 }}>
          <div style={{ color: '#705828' }}>{gold}G</div>
          <div style={{ color: '#4070a0' }}>{gems} Gem</div>
          <div style={{ fontSize: 9, color: '#998a78' }}>
            石{materials['forge-stone']} 鉱{materials['rare-ore']}
          </div>
        </div>
      </div>

      {/* パーティ */}
      <div className="rpg-panel" style={{ padding: 8 }}>
        <div style={{ fontSize: 9, color: '#998a78', marginBottom: 4 }}>パーティ</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          {partyDice.map((d, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              {d ? (
                <>
                  <DiceFaceView faceNumber={i + 1} size={40} borderColor={ELEMENT_COLORS[d.element]} />
                  <div style={{ fontSize: 8, marginTop: 1 }}>
                    <span style={{ color: ELEMENT_COLORS[d.element] }}>{'★'.repeat(d.rarity)}</span> {d.name}
                  </div>
                </>
              ) : (
                <div style={{
                  width: 40, height: 40, border: '2px dashed #c0b8a8',
                  borderRadius: 8, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 9, color: '#998a78',
                }}>空</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* メニュー */}
      <div className="rpg-panel">
        <button className="rpg-btn rpg-btn-primary" onClick={() => setScreen('dungeon')}>
          ダンジョン
        </button>
        <button className="rpg-btn" onClick={() => setScreen('dice-editor')}>
          ダイス装備 ({ownedRunes.length}ルーン)
        </button>
        <button className="rpg-btn" onClick={() => setScreen('forge')}>
          鍛冶屋 (石{materials['forge-stone']})
        </button>
        <button className="rpg-btn" onClick={() => setScreen('shop')}>
          ショップ
        </button>
        <button className="rpg-btn" style={{ opacity: 0.4 }} disabled>
          決闘場（準備中）
        </button>
        <button className="rpg-btn" onClick={() => setScreen('gacha')}>
          ガチャ ({gems} Gem)
        </button>
        <button className="rpg-btn" onClick={() => setScreen('codex')}>
          図鑑 ({capturedMonsters.length}体発見)
        </button>
      </div>

      {/* セーブ */}
      <div style={{ padding: '4px 0' }}>
        <button className="rpg-btn" onClick={handleSave}
          style={{ background: '#d8e8d8', borderColor: '#308050' }}>
          {saveMsg || 'セーブ'}
        </button>
      </div>
    </div>
  );
}
