import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { PVP_OPPONENTS, type PvpOpponent } from '../../data/pvp-opponents';
import { ELEMENT_COLORS } from '../common/ElementBadge';
import { ELEMENT_NAMES } from '../../types';

type Tier = 'bronze' | 'silver' | 'gold';

const TIER_LABELS: Record<Tier, string> = {
  bronze: 'ブロンズ',
  silver: 'シルバー',
  gold: 'ゴールド',
};
const TIER_COLORS: Record<Tier, string> = {
  bronze: '#a08060',
  silver: '#808080',
  gold: '#705828',
};

export function PvpScreen() {
  const { setScreen, setCurrentEnemy, pvpPoints, pvpWins, pvpLosses } = useGameStore();
  const [selectedTier, setSelectedTier] = useState<Tier>('bronze');

  const opponents = PVP_OPPONENTS.filter(o => o.tier === selectedTier);

  const startPvp = (opponent: PvpOpponent) => {
    useGameStore.setState({ isPvpBattle: true });
    setCurrentEnemy(opponent.party);
    setScreen('battle');
  };

  return (
    <div style={{ padding: 8 }}>
      <div className="rpg-panel">
        <div className="rpg-panel-title">決闘場</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, fontSize: 10, color: '#6a5a4a' }}>
          <span>ポイント: <b style={{ color: '#705828' }}>{pvpPoints}</b></span>
          <span>{pvpWins}勝 {pvpLosses}敗</span>
        </div>
      </div>

      {/* ティア選択 */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {(['bronze', 'silver', 'gold'] as Tier[]).map(tier => (
          <button
            key={tier}
            onClick={() => setSelectedTier(tier)}
            style={{
              flex: 1, padding: '6px 0', fontSize: 10, fontWeight: 'bold',
              border: `1px solid ${selectedTier === tier ? TIER_COLORS[tier] : '#c0b8a8'}`,
              borderRadius: 4, cursor: 'pointer',
              background: selectedTier === tier ? TIER_COLORS[tier] : '#ece5d8',
              color: selectedTier === tier ? '#f5f0e8' : '#6a5a4a',
            }}
          >
            {TIER_LABELS[tier]}
          </button>
        ))}
      </div>

      {/* 対戦相手一覧 */}
      <div>
        {opponents.map(op => (
          <div key={op.id} className="rpg-panel" style={{ padding: 8, marginBottom: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div>
                <span style={{ fontSize: 12, color: '#3a2a1a', fontWeight: 'bold' }}>{op.name}</span>
                <span style={{ fontSize: 9, color: '#998a78', marginLeft: 6 }}>HP {op.hp}</span>
              </div>
              <button
                className="rpg-btn rpg-btn-primary"
                style={{ width: 'auto', padding: '4px 12px', margin: 0, fontSize: 10 }}
                onClick={() => startPvp(op)}
              >
                挑む
              </button>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {op.party.map((m, i) => (
                <div key={i} style={{
                  flex: 1, background: '#f5f0e8', borderRadius: 4, padding: '3px 6px',
                  border: `1px solid ${ELEMENT_COLORS[m.element]}30`,
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 8, color: ELEMENT_COLORS[m.element] }}>
                    {'★'.repeat(m.rarity)}
                  </div>
                  <div style={{ fontSize: 9, color: '#3a2a1a' }}>{m.name}</div>
                  <div style={{ fontSize: 7, color: ELEMENT_COLORS[m.element] }}>
                    {ELEMENT_NAMES[m.element]}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 8, color: '#998a78', marginTop: 3 }}>
              報酬: {op.reward.gold}G
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
