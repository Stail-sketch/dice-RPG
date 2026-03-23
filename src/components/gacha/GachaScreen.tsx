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
type AnimPhase = 'idle' | 'darken' | 'spin' | 'burst' | 'reveal';

interface DiceResult {
  type: 'dice';
  monster: MonsterDice;
}

interface RuneResult {
  type: 'rune';
  rune: SkillRune;
}

type GachaResult = DiceResult | RuneResult;

function getHighestRarity(results: GachaResult[]): string {
  let best = 'common';
  for (const r of results) {
    if (r.type === 'dice') {
      if (r.monster.rarity >= 5) return 'legendary';
      if (r.monster.rarity >= 4) best = best === 'legendary' ? best : 'epic';
      if (r.monster.rarity >= 3 && best === 'common') best = 'rare';
    } else {
      if (r.rune.tier === 'legendary') return 'legendary';
      if (r.rune.tier === 'epic' && best !== 'legendary') best = 'epic';
      if (r.rune.tier === 'rare' && best === 'common') best = 'rare';
    }
  }
  return best;
}

const RARITY_BURST_COLORS: Record<string, string> = {
  common: '#998a78',
  rare: '#4070a0',
  epic: '#7050a0',
  legendary: '#d4a020',
};

export function GachaScreen() {
  const {
    setScreen, gems, addGems, addDice, addRune,
    gachaPityDice, gachaPityRune,
    setGachaPityDice, setGachaPityRune,
  } = useGameStore();

  const [tab, setTab] = useState<GachaTab>('dice');
  const [results, setResults] = useState<GachaResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [animPhase, setAnimPhase] = useState<AnimPhase>('idle');
  const [crystalLevel, setCrystalLevel] = useState(0); // 0=common,1=rare,2=epic,3=legendary
  const [crystalMsg, setCrystalMsg] = useState('');
  const animating = animPhase !== 'idle';
  const skipTimers = useState<number[]>([])[0];

  const CRYSTAL_COLORS = ['#998a78', '#4070a0', '#9060d0', '#d4a020'];
  const CRYSTAL_LABELS = ['', '— Rare —', '— ◆ Epic ◆ —', '— ★ LEGENDARY ★ —'];
  const CRYSTAL_MSGS = ['運命のダイスが回る...', '何かが光る...！', '強い力を感じる...！', '運命が...揺れている...！！'];
  const currentCrystalColor = CRYSTAL_COLORS[crystalLevel] || CRYSTAL_COLORS[0];

  const skipToResults = () => {
    for (const t of skipTimers) clearTimeout(t);
    skipTimers.length = 0;
    setAnimPhase('idle');
    setCrystalLevel(0);
    setCrystalMsg('');
    setShowResults(true);
  };

  const runAnimation = (newResults: GachaResult[]) => {
    setResults(newResults);
    setShowResults(false);
    const bestRarity = getHighestRarity(newResults);
    const maxLevel = bestRarity === 'legendary' ? 3 : bestRarity === 'epic' ? 2 : bestRarity === 'rare' ? 1 : 0;

    // Phase 1: 暗転
    setCrystalLevel(0);
    setCrystalMsg('');
    setAnimPhase('darken');
    const t1 = window.setTimeout(() => {
      // Phase 2: スピン開始
      setAnimPhase('spin');
      setCrystalMsg(CRYSTAL_MSGS[0]);

      // 昇格タイマー: 溜め→昇格を繰り返す
      let delay = 1200; // 最初のCommon表示時間（長め）
      for (let lvl = 1; lvl <= maxLevel; lvl++) {
        // 昇格フェーズ: 溜めの後に昇格
        delay += lvl === 1 ? 1000 : lvl === 2 ? 1500 : 2000;
        const targetLvl = lvl;
        const t = window.setTimeout(() => {
          setCrystalLevel(targetLvl);
          setCrystalMsg(CRYSTAL_MSGS[targetLvl]);
        }, delay);
        skipTimers.push(t);

        // 昇格後の余韻
        delay += lvl === 1 ? 800 : lvl === 2 ? 1000 : 1200;
      }

      // スピン終了→バースト
      const spinDuration = delay + (maxLevel === 0 ? 1500 : 800);
      const t2 = window.setTimeout(() => {
        setAnimPhase('burst');
        const t3 = window.setTimeout(() => {
          setAnimPhase('idle');
          setCrystalLevel(0);
          setCrystalMsg('');
          setShowResults(true);
        }, maxLevel >= 3 ? 2000 : maxLevel >= 2 ? 1500 : 800);
        skipTimers.push(t3);
      }, spinDuration);
      skipTimers.push(t2);
    }, 800);
    skipTimers.push(t1);
  };

  // ダイスガチャ
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
    runAnimation(newResults);
  };

  // ルーンガチャ
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
    setGachaPityRune(gachaPityRune + count);
    runAnimation(newResults);
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
              コモン: 46.5% / レア: 50% / エピック: 3% / レジェンド: 0.5%
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

      {/* ガチャ演出 */}
      {animating && (
        <div
          onClick={skipToResults}
          style={{
            position: 'fixed', inset: 0, zIndex: 500,
            background: animPhase === 'darken' ? 'rgba(0,0,0,0.8)'
              : animPhase === 'spin' ? 'rgba(0,0,0,0.9)'
              : 'rgba(0,0,0,0.7)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.4s ease',
          }}
        >
          {animPhase === 'darken' && (
            <div style={{ fontSize: 14, color: '#998a78', animation: 'fadeIn 0.3s ease' }}>
              召喚の儀...
            </div>
          )}
          {animPhase === 'spin' && (() => {
            const cc = currentCrystalColor;
            const spinSpeed = crystalLevel >= 3 ? 0.2 : crystalLevel >= 2 ? 0.3 : crystalLevel >= 1 ? 0.4 : 0.5;
            const diceSize = 60 + crystalLevel * 7;
            const particleCount = 4 + crystalLevel * 5;
            const showRings = crystalLevel >= 2;

            return (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: `radial-gradient(circle, ${cc}15 0%, transparent 70%)`,
                transition: 'background 0.5s ease',
              }}>
                {/* 背景グラデ（下から昇格色） */}
                <div style={{
                  position: 'absolute', left: 0, right: 0, bottom: 0,
                  height: '60%',
                  background: `linear-gradient(to top, ${cc}30 0%, transparent 100%)`,
                  transition: 'background 0.5s ease',
                }} />

                {/* オーラリング */}
                {showRings && [0, 1, 2].map(i => (
                  <div key={`ring${i}`} style={{
                    position: 'absolute',
                    width: 130 + i * 30 + crystalLevel * 10, height: 130 + i * 30 + crystalLevel * 10,
                    borderRadius: '50%',
                    border: `${crystalLevel >= 3 ? 2 : 1}px solid ${cc}50`,
                    animation: `gachaOrbitRing ${2.5 + i}s linear infinite${i % 2 ? ' reverse' : ''}`,
                    boxShadow: crystalLevel >= 3 ? `0 0 8px ${cc}40` : 'none',
                    transition: 'border-color 0.5s, box-shadow 0.5s',
                  }} />
                ))}

                {/* パーティクル */}
                {Array.from({ length: particleCount }).map((_, i) => {
                  const angle = (i / particleCount) * Math.PI * 2;
                  const dist = 45 + (i % 3) * 25;
                  return (
                    <div key={`p${i}`} style={{
                      position: 'absolute',
                      width: 3 + crystalLevel, height: 3 + crystalLevel,
                      borderRadius: '50%', background: cc,
                      left: `calc(50% + ${Math.cos(angle) * dist}px)`,
                      top: `calc(50% + ${Math.sin(angle) * dist}px)`,
                      animation: `gachaParticle ${0.5 + (i % 4) * 0.3}s ease infinite`,
                      animationDelay: `${(i % 5) * 0.15}s`,
                      boxShadow: `0 0 ${3 + crystalLevel * 2}px ${cc}`,
                      transition: 'background 0.5s, box-shadow 0.5s',
                    }} />
                  );
                })}

                {/* ダイス⚀ — state駆動で色が変わる */}
                <div style={{
                  width: 80, height: 80,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: `gachaSpinCenter ${spinSpeed}s linear infinite`,
                  zIndex: 10,
                }}>
                  <span style={{
                    fontSize: diceSize,
                    color: cc,
                    textShadow: `0 0 20px ${cc}, 0 0 40px ${cc}80`,
                    lineHeight: 1,
                    transition: 'color 0.4s ease, text-shadow 0.4s ease, font-size 0.4s ease',
                  }}>⚀</span>
                </div>

                {/* 昇格テキスト */}
                {crystalLevel > 0 && (
                  <div key={crystalLevel} style={{
                    marginTop: 16, textAlign: 'center',
                    fontSize: crystalLevel >= 3 ? 18 : crystalLevel >= 2 ? 14 : 11,
                    color: cc,
                    fontWeight: crystalLevel >= 2 ? 'bold' : 'normal',
                    textShadow: crystalLevel >= 2 ? `0 0 12px ${cc}, 0 0 24px ${cc}` : `0 0 6px ${cc}`,
                    letterSpacing: crystalLevel >= 3 ? 6 : crystalLevel >= 2 ? 3 : 1,
                    animation: 'crystalLabelIn 0.4s ease',
                    zIndex: 10,
                  }}>
                    {CRYSTAL_LABELS[crystalLevel]}
                  </div>
                )}

                {/* メッセージ */}
                <div style={{
                  position: 'absolute', bottom: '10%',
                  fontSize: 11, color: cc,
                  animation: 'gachaPulse 0.5s ease infinite',
                  textShadow: `0 0 6px ${cc}`,
                  transition: 'color 0.4s ease',
                  zIndex: 10,
                }}>
                  {crystalMsg}
                </div>
              </div>
            );
          })()}
          {animPhase === 'burst' && (() => {
            const bestRarity = getHighestRarity(results);
            const burstColor = RARITY_BURST_COLORS[bestRarity];
            const isLeg = bestRarity === 'legendary';
            const isEpic = bestRarity === 'epic';
            return (
              <div style={{ textAlign: 'center', position: 'relative' }}>
                {/* 複数リング */}
                {(isLeg || isEpic) && [0, 1, 2].map(i => (
                  <div key={i} style={{
                    position: 'absolute', left: '50%', top: '50%',
                    width: (isLeg ? 200 : 140) + i * 40, height: (isLeg ? 200 : 140) + i * 40,
                    marginLeft: -((isLeg ? 200 : 140) + i * 40) / 2,
                    marginTop: -((isLeg ? 200 : 140) + i * 40) / 2,
                    borderRadius: '50%',
                    border: `2px solid ${burstColor}`,
                    opacity: 0.4 - i * 0.1,
                    animation: `gachaBurstRing ${0.6 + i * 0.2}s ease forwards`,
                  }} />
                ))}
                {/* メインバースト */}
                <div style={{
                  width: isLeg ? 200 : isEpic ? 160 : 120,
                  height: isLeg ? 200 : isEpic ? 160 : 120,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, white 0%, ${burstColor} 30%, transparent 70%)`,
                  animation: 'gachaBurst 0.8s ease forwards',
                  margin: '0 auto',
                  boxShadow: `0 0 ${isLeg ? 120 : isEpic ? 60 : 30}px ${burstColor}, 0 0 ${isLeg ? 200 : isEpic ? 100 : 50}px ${burstColor}40`,
                }} />
                {/* パーティクル爆発 */}
                {(isLeg || isEpic) && Array.from({ length: isLeg ? 24 : 12 }).map((_, i) => {
                  const angle = (i / (isLeg ? 24 : 12)) * Math.PI * 2;
                  const dist = 60 + Math.random() * 40;
                  return (
                    <div key={`p${i}`} style={{
                      position: 'absolute',
                      left: `calc(50% + ${Math.cos(angle) * dist}px)`,
                      top: `calc(50% + ${Math.sin(angle) * dist}px)`,
                      width: isLeg ? 6 : 4, height: isLeg ? 6 : 4,
                      borderRadius: '50%', background: burstColor,
                      animation: `gachaParticleExplode 1s ease forwards`,
                      animationDelay: `${Math.random() * 0.3}s`,
                      boxShadow: `0 0 ${isLeg ? 8 : 4}px ${burstColor}`,
                    }} />
                  );
                })}
                {/* テキスト */}
                <div style={{
                  fontSize: isLeg ? 28 : isEpic ? 20 : 14,
                  color: isLeg ? '#fff' : burstColor,
                  fontWeight: 'bold',
                  marginTop: 20,
                  textShadow: isLeg
                    ? `0 0 10px #d4a020, 0 0 20px #d4a020, 0 0 40px #d4a020`
                    : isEpic ? `0 0 10px ${burstColor}, 0 0 20px ${burstColor}` : `0 0 8px ${burstColor}`,
                  animation: isLeg ? 'legendaryTextPulse 0.5s ease infinite' : 'fadeIn 0.5s ease',
                  letterSpacing: isLeg ? 6 : isEpic ? 4 : 2,
                }}>
                  {isLeg ? '★ LEGENDARY ★' : isEpic ? '◆ EPIC ◆' : bestRarity === 'rare' ? '◇ RARE ◇' : ''}
                </div>
                {isLeg && (
                  <div style={{
                    fontSize: 11, color: '#d4a020', marginTop: 8,
                    animation: 'fadeIn 0.8s ease',
                    textShadow: '0 0 6px #d4a020',
                  }}>
                    伝説の力が目覚めた...！
                  </div>
                )}
              </div>
            );
          })()}
          <div style={{ position: 'absolute', bottom: 30, fontSize: 10, color: '#998a78' }}>
            タップでスキップ
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
  const isLegendary = rune.tier === 'legendary';

  return (
    <div style={{
      width: 72,
      padding: 6,
      border: isLegendary ? '3px solid #d4a020' : `2px solid ${isEpic ? '#7050a0' : '#c0b8a8'}`,
      borderRadius: 6,
      background: isLegendary ? 'linear-gradient(135deg, #fff8e0, #f0d870, #fff8e0)' : isEpic ? '#ece0f0' : '#ece5d8',
      textAlign: 'center',
      boxShadow: isLegendary ? '0 0 12px #d4a020, 0 0 24px rgba(212,160,32,0.4)' : isEpic ? '0 0 6px rgba(112,80,160,0.3)' : 'none',
      animation: isLegendary ? 'legendaryPulse 1.5s ease infinite' : undefined,
      position: 'relative' as const,
    }}>
      {isLegendary && (
        <div style={{
          position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
          fontSize: 10, color: '#d4a020', fontWeight: 'bold',
          textShadow: '0 0 4px rgba(212,160,32,0.6)',
        }}>★</div>
      )}
      <div style={{
        width: 28, height: 28,
        margin: '0 auto 3px',
        border: isLegendary ? '2px solid #d4a020' : `2px solid ${ELEMENT_COLORS[rune.element]}`,
        borderRadius: '50%',
        background: isLegendary ? '#fffae0' : '#f5f0e8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12,
        boxShadow: isLegendary ? '0 0 8px #d4a020' : 'none',
      }}>
        <span style={{ color: isLegendary ? '#d4a020' : ELEMENT_COLORS[rune.element] }}>{isLegendary ? '★' : '◆'}</span>
      </div>
      <div style={{ fontSize: 8, color: tierColor, fontWeight: 'bold' }}>
        {RUNE_TIER_LABELS[rune.tier]}
      </div>
      <div style={{ fontSize: 9, color: isLegendary ? '#8a6010' : '#3a2a1a', fontWeight: 'bold', marginTop: 1 }}>
        {rune.name}
      </div>
      <div style={{ marginTop: 2 }}>
        <ElementBadge element={rune.element} />
      </div>
      <div style={{ fontSize: 7, color: isLegendary ? '#8a6010' : '#998a78', marginTop: 2 }}>
        {rune.effect.description}
      </div>
    </div>
  );
}
