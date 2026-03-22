import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { MonsterSprite } from '../common/MonsterSprite';
import { ElementBadge, ELEMENT_COLORS } from '../common/ElementBadge';
import {
  rollDiceGacha,
  rollRuneGacha,
  DICE_GACHA_COST,
  DICE_GACHA_10_COST,
  RUNE_GACHA_COST,
  RUNE_GACHA_10_COST,
  RARITY_LABELS,
  RUNE_TIER_LABELS,
  RUNE_TIER_COLORS,
} from '../../game/gacha/GachaEngine';
import type { MonsterDice, SkillRune } from '../../types';

type GachaTab = 'dice' | 'rune';

interface DiceResult {
  type: 'dice';
  monster: MonsterDice;
}

interface RuneResult {
  type: 'rune';
  rune: SkillRune;
}

type GachaResult = DiceResult | RuneResult;

export function GachaScreen() {
  const {
    setScreen, gems, addGems, addDice, addRune,
    gachaPityDice, gachaPityRune,
    setGachaPityDice, setGachaPityRune,
  } = useGameStore();

  const [tab, setTab] = useState<GachaTab>('dice');
  const [results, setResults] = useState<GachaResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [animating, setAnimating] = useState(false);

  // ダイスガチャ単発
  const doDiceRoll = (count: number) => {
    const cost = count === 1 ? DICE_GACHA_COST : DICE_GACHA_10_COST;
    if (gems < cost) return;
    addGems(-cost);

    const newResults: GachaResult[] = [];
    let pity = gachaPityDice;
    for (let i = 0; i < count; i++) {
      const { monster, newPity } = rollDiceGacha(pity);
      pity = newPity;
      addDice(monster);
      newResults.push({ type: 'dice', monster });
    }
    setGachaPityDice(pity);
    setResults(newResults);
    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
      setShowResults(true);
    }, 400);
  };

  // ルーンガチャ単発
  const doRuneRoll = (count: number) => {
    const cost = count === 1 ? RUNE_GACHA_COST : RUNE_GACHA_10_COST;
    if (gems < cost) return;
    addGems(-cost);

    const newResults: GachaResult[] = [];
    for (let i = 0; i < count; i++) {
      const rune = rollRuneGacha();
      addRune(rune);
      newResults.push({ type: 'rune', rune });
    }
    // ルーンガチャはpity不要だが一応カウント
    setGachaPityRune(gachaPityRune + count);
    setResults(newResults);
    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
      setShowResults(true);
    }, 400);
  };

  const closeResults = () => {
    setShowResults(false);
    setResults([]);
  };

  const canAffordDice1 = gems >= DICE_GACHA_COST;
  const canAffordDice10 = gems >= DICE_GACHA_10_COST;
  const canAffordRune1 = gems >= RUNE_GACHA_COST;
  const canAffordRune10 = gems >= RUNE_GACHA_10_COST;

  return (
    <div style={{ padding: 8, background: '#f5f0e8', minHeight: '100vh' }}>
      {/* ヘッダー */}
      <div className="rpg-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          className="rpg-btn"
          onClick={() => setScreen('town')}
          style={{ width: 'auto', padding: '4px 12px', fontSize: 11 }}
        >
          戻る
        </button>
        <div style={{ fontSize: 14, color: '#705828', fontWeight: 'bold' }}>ガチャ</div>
        <div style={{ fontSize: 12, color: '#4070a0' }}>{gems} Gem</div>
      </div>

      {/* タブ */}
      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
        <button
          onClick={() => { setTab('dice'); closeResults(); }}
          style={{
            flex: 1,
            padding: '6px 0',
            fontSize: 12,
            fontWeight: 'bold',
            border: '2px solid',
            borderColor: tab === 'dice' ? '#705828' : '#c0b8a8',
            background: tab === 'dice' ? '#ece5d8' : '#f5f0e8',
            color: tab === 'dice' ? '#705828' : '#998a78',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          ダイスガチャ
        </button>
        <button
          onClick={() => { setTab('rune'); closeResults(); }}
          style={{
            flex: 1,
            padding: '6px 0',
            fontSize: 12,
            fontWeight: 'bold',
            border: '2px solid',
            borderColor: tab === 'rune' ? '#705828' : '#c0b8a8',
            background: tab === 'rune' ? '#ece5d8' : '#f5f0e8',
            color: tab === 'rune' ? '#705828' : '#998a78',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          ルーンガチャ
        </button>
      </div>

      {/* ガチャ情報 */}
      <div className="rpg-panel" style={{ marginTop: 4 }}>
        {tab === 'dice' ? (
          <>
            <div style={{ fontSize: 11, color: '#3a2a1a', textAlign: 'center', marginBottom: 4 }}>
              モンスターダイスを召喚！
            </div>
            <div style={{ fontSize: 9, color: '#6a5a4a', textAlign: 'center', lineHeight: 1.6 }}>
              ★1: 40% / ★2: 30% / ★3: 20% / ★4: 8% / ★5: 2%
            </div>
            <div style={{
              fontSize: 9, color: '#998a78', textAlign: 'center',
              marginTop: 4, padding: '3px 0',
              borderTop: '1px solid #d8d0c4',
            }}>
              天井: {gachaPityDice}/50 (★4確定) &middot; {gachaPityDice}/100 (★5確定)
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 11, color: '#3a2a1a', textAlign: 'center', marginBottom: 4 }}>
              スキルルーンを入手！
            </div>
            <div style={{ fontSize: 9, color: '#6a5a4a', textAlign: 'center', lineHeight: 1.6 }}>
              コモン: 50% / レア: 35% / エピック: 15%
            </div>
          </>
        )}
      </div>

      {/* ロールボタン */}
      {!showResults && (
        <div className="rpg-panel" style={{ marginTop: 4 }}>
          {tab === 'dice' ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="rpg-btn rpg-btn-primary"
                onClick={() => doDiceRoll(1)}
                disabled={!canAffordDice1 || animating}
                style={{
                  flex: 1,
                  opacity: canAffordDice1 && !animating ? 1 : 0.4,
                }}
              >
                <div>1回</div>
                <div style={{ fontSize: 9 }}>{DICE_GACHA_COST} Gem</div>
              </button>
              <button
                className="rpg-btn rpg-btn-primary"
                onClick={() => doDiceRoll(10)}
                disabled={!canAffordDice10 || animating}
                style={{
                  flex: 1,
                  opacity: canAffordDice10 && !animating ? 1 : 0.4,
                }}
              >
                <div>10連</div>
                <div style={{ fontSize: 9 }}>{DICE_GACHA_10_COST} Gem</div>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="rpg-btn rpg-btn-primary"
                onClick={() => doRuneRoll(1)}
                disabled={!canAffordRune1 || animating}
                style={{
                  flex: 1,
                  opacity: canAffordRune1 && !animating ? 1 : 0.4,
                }}
              >
                <div>1回</div>
                <div style={{ fontSize: 9 }}>{RUNE_GACHA_COST} Gem</div>
              </button>
              <button
                className="rpg-btn rpg-btn-primary"
                onClick={() => doRuneRoll(10)}
                disabled={!canAffordRune10 || animating}
                style={{
                  flex: 1,
                  opacity: canAffordRune10 && !animating ? 1 : 0.4,
                }}
              >
                <div>10連</div>
                <div style={{ fontSize: 9 }}>{RUNE_GACHA_10_COST} Gem</div>
              </button>
            </div>
          )}
        </div>
      )}

      {/* アニメーション中 */}
      {animating && (
        <div className="rpg-panel" style={{
          marginTop: 4, textAlign: 'center', padding: 24,
        }}>
          <div style={{
            fontSize: 14, color: '#705828', fontWeight: 'bold',
            animation: 'gachaPulse 0.4s ease-in-out infinite',
          }}>
            召喚中...
          </div>
        </div>
      )}

      {/* 結果表示 */}
      {showResults && results.length > 0 && (
        <div style={{ marginTop: 4 }}>
          <div className="rpg-panel">
            <div style={{ fontSize: 11, color: '#705828', textAlign: 'center', marginBottom: 6, fontWeight: 'bold' }}>
              結果
            </div>
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 6,
              justifyContent: 'center',
            }}>
              {results.map((r, i) => (
                <div
                  key={i}
                  style={{
                    animation: `gachaFadeIn 0.3s ease-out ${i * 0.08}s both`,
                  }}
                >
                  {r.type === 'dice' ? (
                    <DiceResultCard monster={r.monster} />
                  ) : (
                    <RuneResultCard rune={r.rune} />
                  )}
                </div>
              ))}
            </div>
          </div>
          <button
            className="rpg-btn"
            onClick={closeResults}
            style={{ marginTop: 4 }}
          >
            閉じる
          </button>
        </div>
      )}

      {/* アニメーション用スタイル */}
      <style>{`
        @keyframes gachaFadeIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes gachaPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

// ダイス結果カード
function DiceResultCard({ monster }: { monster: MonsterDice }) {
  const isHighRarity = monster.rarity >= 4;
  const borderColor = isHighRarity ? '#705828' : '#c0b8a8';

  return (
    <div style={{
      width: 72,
      padding: 6,
      border: `2px solid ${borderColor}`,
      borderRadius: 6,
      background: isHighRarity ? '#f0e8d0' : '#ece5d8',
      textAlign: 'center',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}>
        <MonsterSprite monsterId={monster.id} element={monster.element} size={32} />
      </div>
      <div style={{
        fontSize: 9,
        color: ELEMENT_COLORS[monster.element],
        fontWeight: 'bold',
      }}>
        {RARITY_LABELS[monster.rarity]}
      </div>
      <div style={{ fontSize: 9, color: '#3a2a1a', fontWeight: 'bold', marginTop: 1 }}>
        {monster.name}
      </div>
      <div style={{ marginTop: 2 }}>
        <ElementBadge element={monster.element} />
      </div>
    </div>
  );
}

// ルーン結果カード
function RuneResultCard({ rune }: { rune: SkillRune }) {
  const tierColor = RUNE_TIER_COLORS[rune.tier] || '#6a5a4a';
  const isEpic = rune.tier === 'epic';

  return (
    <div style={{
      width: 72,
      padding: 6,
      border: `2px solid ${isEpic ? '#7050a0' : '#c0b8a8'}`,
      borderRadius: 6,
      background: isEpic ? '#ece0f0' : '#ece5d8',
      textAlign: 'center',
    }}>
      <div style={{
        width: 28, height: 28,
        margin: '0 auto 3px',
        border: `2px solid ${ELEMENT_COLORS[rune.element]}`,
        borderRadius: '50%',
        background: '#f5f0e8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12,
      }}>
        <span style={{ color: ELEMENT_COLORS[rune.element] }}>◆</span>
      </div>
      <div style={{ fontSize: 8, color: tierColor, fontWeight: 'bold' }}>
        {RUNE_TIER_LABELS[rune.tier]}
      </div>
      <div style={{ fontSize: 9, color: '#3a2a1a', fontWeight: 'bold', marginTop: 1 }}>
        {rune.name}
      </div>
      <div style={{ marginTop: 2 }}>
        <ElementBadge element={rune.element} />
      </div>
      <div style={{ fontSize: 7, color: '#998a78', marginTop: 2 }}>
        {rune.effect.description}
      </div>
    </div>
  );
}
