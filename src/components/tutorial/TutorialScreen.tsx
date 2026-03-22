import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { CHAPTER1_MONSTERS } from '../../data/monsters';
import { SKILL_RUNES } from '../../data/skill-runes';
import { DiceFaceView } from '../common/DiceFaceView';
import { MonsterSprite } from '../common/MonsterSprite';
import { HpBar } from '../common/HpBar';
import { ELEMENT_COLORS } from '../common/ElementBadge';
import { getPipColorsForDiceFace } from '../../utils/pipColors';
import { applyDefaultSocketTiers } from '../../utils/applyDefaultTiers';

// ==============================
// Pip dialogue box
// ==============================
function PipDialogue({ text, onNext, buttonLabel }: { text: string; onNext: () => void; buttonLabel?: string }) {
  return (
    <div style={{
      position: 'absolute', bottom: 60, left: 12, right: 12,
      background: '#ffffff', border: '1.5px solid #c0b8a8',
      borderRadius: 2, padding: '8px 10px', zIndex: 100,
    }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <div style={{
          width: 24, height: 24, background: '#b09050',
          borderRadius: 2, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 14, flexShrink: 0,
        }}>&#9856;</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: '#705828', fontWeight: 'bold', marginBottom: 2 }}>
            ピップ
          </div>
          <div style={{ fontSize: 11, color: '#3a2a1a', lineHeight: 1.5 }}>{text}</div>
        </div>
      </div>
      <div style={{ textAlign: 'right', marginTop: 6 }}>
        <button className="rpg-btn" style={{ width: 'auto', padding: '4px 16px', margin: 0, fontSize: 10 }} onClick={onNext}>
          {buttonLabel || '次へ'}
        </button>
      </div>
    </div>
  );
}

// ==============================
// Tutorial step indicator
// ==============================
function StepIndicator({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
      {[1, 2, 3, 4].map(s => (
        <div key={s} style={{
          width: 8, height: 8, borderRadius: '50%',
          background: s === step ? '#705828' : s < step ? '#b09050' : '#e0d8cc',
          border: '1px solid #c0b8a8',
        }} />
      ))}
    </div>
  );
}

// ==============================
// Main tutorial screen
// ==============================
export function TutorialScreen() {
  const {
    protagonistDice, addRune, equipRune, addDice, setParty,
    completeTutorial, ownedDice,
  } = useGameStore();

  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState(0);

  // Prevent double-execution of side effects
  const effectsDone = useRef<Set<string>>(new Set());

  // ---- Step 1 sub-step 4: auto-equip runes to protagonist ----
  useEffect(() => {
    if (step === 1 && subStep === 4 && !effectsDone.current.has('equip-runes')) {
      effectsDone.current.add('equip-runes');
      // Add runes to owned, then equip them
      const ironBash = SKILL_RUNES.find(r => r.id === 'iron-bash')!;
      const blazeStrike = SKILL_RUNES.find(r => r.id === 'blaze-strike')!;
      const iceShard = SKILL_RUNES.find(r => r.id === 'ice-shard')!;
      const spark = SKILL_RUNES.find(r => r.id === 'spark')!;

      // Add runes first
      addRune({ ...ironBash });
      addRune({ ...blazeStrike });
      addRune({ ...iceShard });
      addRune({ ...spark });

      // Equip: face 1 socket 0 = iron-bash
      setTimeout(() => {
        equipRune('protagonist', 1, 0, 'iron-bash');
      }, 300);
      // Equip: face 3 socket 0-2 = blaze-strike, ice-shard, spark
      setTimeout(() => {
        equipRune('protagonist', 3, 0, 'blaze-strike');
      }, 600);
      setTimeout(() => {
        equipRune('protagonist', 3, 1, 'ice-shard');
      }, 900);
      setTimeout(() => {
        equipRune('protagonist', 3, 2, 'spark');
      }, 1200);
    }
  }, [step, subStep, addRune, equipRune]);

  // ---- Step 3 sub-step 2: capture rot-beetle ----
  useEffect(() => {
    if (step === 3 && subStep === 2 && !effectsDone.current.has('capture-rot-beetle')) {
      effectsDone.current.add('capture-rot-beetle');
      const rotBeetle = CHAPTER1_MONSTERS.find(m => m.id === 'rot-beetle')!;
      addDice(applyDefaultSocketTiers({ ...rotBeetle }));
    }
  }, [step, subStep, addDice]);

  // ---- Step 3 sub-step 3: add frost-jelly ----
  useEffect(() => {
    if (step === 3 && subStep === 3 && !effectsDone.current.has('add-frost-jelly')) {
      effectsDone.current.add('add-frost-jelly');
      const frostJelly = CHAPTER1_MONSTERS.find(m => m.id === 'frost-jelly')!;
      addDice(applyDefaultSocketTiers({ ...frostJelly }));
    }
  }, [step, subStep, addDice]);

  // ---- Step 3 sub-step 4: set party ----
  useEffect(() => {
    if (step === 3 && subStep === 4 && !effectsDone.current.has('set-party')) {
      effectsDone.current.add('set-party');
      setParty(['protagonist', 'rot-beetle_001', 'frost-jelly_001']);
    }
  }, [step, subStep, setParty]);

  const advance = useCallback(() => {
    setSubStep(s => s + 1);
  }, []);

  const nextStep = useCallback(() => {
    setStep(s => s + 1);
    setSubStep(0);
  }, []);

  // ---- Battle state for step 2 (1v1) ----
  const [enemyHp1v1, setEnemyHp1v1] = useState(20);
  const [rolled1v1, setRolled1v1] = useState(false);
  const [rolling1v1, setRolling1v1] = useState(false);
  const [hurtEnemy1v1, setHurtEnemy1v1] = useState(false);

  // ---- Battle state for step 4 (3v3) ----
  const [enemyHp3v3, setEnemyHp3v3] = useState(60);
  const [rolling3v3, setRolling3v3] = useState(false);
  const [rolled3v3, setRolled3v3] = useState(false);
  const [selectedDice3v3, setSelectedDice3v3] = useState<Set<number>>(new Set());
  const [hurtEnemy3v3, setHurtEnemy3v3] = useState(false);
  const [chargeGauge, setChargeGauge] = useState(0);
  const CHARGE_MAX = 10;

  // Rigged roll results for step 4 (used in render below)
  void (subStep <= 2 ? [3, 2, 5] : [4, 1, 6]);

  // ---- Render per step ----
  const renderContent = () => {
    switch (step) {
      // ======================
      // STEP 1: Intro + Dice
      // ======================
      case 1:
        return renderStep1();
      // ======================
      // STEP 2: 1v1 Battle
      // ======================
      case 2:
        return renderStep2();
      // ======================
      // STEP 3: Capture
      // ======================
      case 3:
        return renderStep3();
      // ======================
      // STEP 4: 3v3 Battle
      // ======================
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  // ==============================
  // STEP 1 rendering
  // ==============================
  const renderStep1 = () => {
    const showDice = subStep >= 3;
    const pipColors1 = getPipColorsForDiceFace(protagonistDice, 1);
    const pipColors3 = getPipColorsForDiceFace(protagonistDice, 3);

    return (
      <>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {showDice && (
            <div style={{ textAlign: 'center' }}>
              <MonsterSprite monsterId="protagonist" element="alloy" size={80} animate />
              <div style={{ fontSize: 12, color: '#705828', fontWeight: 'bold', marginTop: 8 }}>Hero Dice</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
                <div style={{ textAlign: 'center' }}>
                  <DiceFaceView faceNumber={1} size={52} borderColor="#b09050" pipColors={pipColors1} />
                  <div style={{ fontSize: 8, color: '#998a78', marginTop: 2 }}>1の面</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <DiceFaceView faceNumber={3} size={52} borderColor="#b09050" pipColors={pipColors3} />
                  <div style={{ fontSize: 8, color: '#998a78', marginTop: 2 }}>3の面</div>
                </div>
              </div>
              {subStep >= 4 && (
                <div style={{ marginTop: 8, fontSize: 10, color: '#6a5a4a' }}>
                  穴にルーンが装着された!
                </div>
              )}
            </div>
          )}
          {!showDice && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>&#9856;</div>
              <div style={{ fontSize: 14, color: '#705828', fontWeight: 'bold' }}>ピップソケット・クロニクル</div>
            </div>
          )}
        </div>

        {subStep === 0 && <PipDialogue text="やあ！ 目が覚めた？" onNext={advance} />}
        {subStep === 1 && <PipDialogue text="ぼくはピップ。きみの相棒さ。" onNext={advance} />}
        {subStep === 2 && <PipDialogue text="世界がモンスターだらけで...きみの力が必要なんだ。" onNext={advance} />}
        {subStep === 3 && <PipDialogue text="これがきみのダイスだよ。面ごとにソケット(穴)があるでしょ？" onNext={advance} />}
        {subStep === 4 && <PipDialogue text="穴にスキルルーンをはめると、その面が出た時にスキルが発動するんだ！" onNext={advance} />}
        {subStep === 5 && <PipDialogue text="よし！面の穴が多いほどスキルがたくさん入るよ。さあ、実戦だ！" onNext={nextStep} />}
      </>
    );
  };

  // ==============================
  // STEP 2 rendering (1v1)
  // ==============================
  const renderStep2 = () => {
    const rotBeetle = CHAPTER1_MONSTERS.find(m => m.id === 'rot-beetle')!;
    const defeated = enemyHp1v1 <= 0;
    const pipColors3 = getPipColorsForDiceFace(protagonistDice, 3);

    const handleRoll = () => {
      setRolling1v1(true);
      setTimeout(() => {
        setRolling1v1(false);
        setRolled1v1(true);
        setSubStep(2);
      }, 1000);
    };

    const handleAttack = () => {
      setHurtEnemy1v1(true);
      setTimeout(() => {
        setEnemyHp1v1(0);
        setHurtEnemy1v1(false);
        setSubStep(3);
      }, 600);
    };

    return (
      <>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          {/* Enemy */}
          <div style={{ textAlign: 'center' }}>
            <MonsterSprite monsterId="rot-beetle" element="venom" size={64} animate={!defeated} hurt={hurtEnemy1v1} />
            <div style={{ fontSize: 11, color: '#3a2a1a', marginTop: 4 }}>{rotBeetle.name}</div>
            <div style={{ width: 120 }}>
              <HpBar current={enemyHp1v1} max={20} color="enemy" />
            </div>
          </div>

          {/* VS divider */}
          <div style={{ fontSize: 12, color: '#998a78', fontWeight: 'bold' }}>VS</div>

          {/* Player dice */}
          <div style={{ textAlign: 'center' }}>
            <MonsterSprite monsterId="protagonist" element="alloy" size={48} animate />
            {rolled1v1 ? (
              <div style={{ marginTop: 8 }}>
                <DiceFaceView faceNumber={3} size={60} borderColor="#b09050" pipColors={pipColors3} />
                <div style={{ fontSize: 10, color: '#705828', marginTop: 4, fontWeight: 'bold' }}>3の面!</div>
              </div>
            ) : (
              <div style={{ marginTop: 8 }}>
                <DiceFaceView faceNumber={1} size={60} rolling={rolling1v1} borderColor="#c0b8a8" />
              </div>
            )}
          </div>

          {/* Roll button */}
          {subStep === 1 && !rolled1v1 && !rolling1v1 && (
            <button className="rpg-btn rpg-btn-primary" style={{ width: 'auto', padding: '6px 28px' }} onClick={handleRoll}>
              ダイスを振る！
            </button>
          )}
        </div>

        {subStep === 0 && <PipDialogue text="きた！モンスターだ！戦い方を教えるよ。" onNext={() => setSubStep(1)} />}
        {subStep === 1 && rolling1v1 && (
          <div style={{ position: 'absolute', bottom: 60, left: 12, right: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#705828' }}>ダイスが回転中...</div>
          </div>
        )}
        {subStep === 2 && !defeated && (
          <PipDialogue text="3の面が出た！3つのスキルが一斉に発動するよ！" onNext={handleAttack} buttonLabel="攻撃！" />
        )}
        {subStep === 3 && <PipDialogue text="やった！出た面のスキルが全部発動するんだ。面の数字が大きいほど穴が多いけど、出にくいよ。" onNext={nextStep} />}
      </>
    );
  };

  // ==============================
  // STEP 3 rendering (Capture)
  // ==============================
  const renderStep3 = () => {
    const [captureRolling, setCaptureRolling] = useState(false);
    const [captureDone, setCaptureDone] = useState(false);

    const handleCapture = () => {
      setCaptureRolling(true);
      setTimeout(() => {
        setCaptureRolling(false);
        setCaptureDone(true);
        setSubStep(2);
      }, 1000);
    };

    const hasRotBeetle = ownedDice.some(d => (d.baseId || d.id) === 'rot-beetle');
    const hasFrostJelly = ownedDice.some(d => (d.baseId || d.id) === 'frost-jelly');

    return (
      <>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          {/* Show captured monster */}
          {subStep >= 2 && hasRotBeetle && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <MonsterSprite monsterId="rot-beetle" element="venom" size={48} animate />
                <div style={{ fontSize: 9, color: '#408030' }}>ロットビートル</div>
              </div>
              {subStep >= 3 && hasFrostJelly && (
                <div style={{ textAlign: 'center' }}>
                  <MonsterSprite monsterId="frost-jelly" element="frost" size={48} animate />
                  <div style={{ fontSize: 9, color: '#3070a0' }}>フロストジェリー</div>
                </div>
              )}
            </div>
          )}

          {/* Capture dice animation */}
          {subStep === 1 && (
            <div style={{ textAlign: 'center' }}>
              <MonsterSprite monsterId="rot-beetle" element="venom" size={64} animate />
              <div style={{ marginTop: 8 }}>
                <DiceFaceView faceNumber={captureDone ? 6 : 1} size={50} rolling={captureRolling} borderColor="#b09050"
                  pipColors={captureDone ? Array(6).fill('#705828') : undefined} />
              </div>
              {!captureRolling && !captureDone && (
                <button className="rpg-btn rpg-btn-primary" style={{ width: 'auto', padding: '6px 28px', marginTop: 8 }} onClick={handleCapture}>
                  封印のダイスを振る！
                </button>
              )}
            </div>
          )}

          {/* Party display (step 3 sub 4) */}
          {subStep >= 4 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 10, color: '#705828', textAlign: 'center', marginBottom: 8, fontWeight: 'bold' }}>パーティ編成</div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <MonsterSprite monsterId="protagonist" element="alloy" size={40} animate />
                  <div style={{ fontSize: 8, color: '#686868' }}>Hero Dice</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <MonsterSprite monsterId="rot-beetle" element="venom" size={40} animate />
                  <div style={{ fontSize: 8, color: '#408030' }}>ロットビートル</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <MonsterSprite monsterId="frost-jelly" element="frost" size={40} animate />
                  <div style={{ fontSize: 8, color: '#3070a0' }}>フロストジェリー</div>
                </div>
              </div>
            </div>
          )}

          {subStep === 0 && !captureRolling && !captureDone && (
            <MonsterSprite monsterId="rot-beetle" element="venom" size={64} animate />
          )}
        </div>

        {subStep === 0 && <PipDialogue text="このモンスター、封印できるかも！ダイスに閉じ込めて仲間にしよう！" onNext={() => setSubStep(1)} />}
        {subStep === 1 && captureRolling && (
          <div style={{ position: 'absolute', bottom: 60, left: 12, right: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#705828' }}>封印中...</div>
          </div>
        )}
        {subStep === 2 && <PipDialogue text="つかまえた！ロットビートルをゲット！こいつも戦力になるぞ。" onNext={() => setSubStep(3)} />}
        {subStep === 3 && <PipDialogue text="もう1体の仲間も見つけたよ！フロストジェリーが加わった！" onNext={() => setSubStep(4)} />}
        {subStep === 4 && <PipDialogue text="3つのダイスが揃った！バトルでは3つ同時に振って戦うのが基本だよ。" onNext={nextStep} />}
      </>
    );
  };

  // ==============================
  // STEP 4 rendering (3v3)
  // ==============================
  const renderStep4 = () => {
    const ironGolem = CHAPTER1_MONSTERS.find(m => m.id === 'iron-golem')!;
    const defeated = enemyHp3v3 <= 0;

    const partyDice = [
      { id: 'protagonist', name: 'Hero Dice', element: 'alloy' as const, monsterId: 'protagonist' },
      { id: 'rot-beetle', name: 'ロットビートル', element: 'venom' as const, monsterId: 'rot-beetle' },
      { id: 'frost-jelly', name: 'フロストジェリー', element: 'frost' as const, monsterId: 'frost-jelly' },
    ];

    const currentRolls = subStep <= 3 ? [3, 2, 5] : [4, 1, 6];

    const handleRoll3v3 = () => {
      setRolling3v3(true);
      setSelectedDice3v3(new Set());
      setTimeout(() => {
        setRolling3v3(false);
        setRolled3v3(true);
        setSubStep(prev => prev + 1);
      }, 1000);
    };

    const toggleDiceSelection = (idx: number) => {
      setSelectedDice3v3(prev => {
        const next = new Set(prev);
        if (next.has(idx)) {
          next.delete(idx);
        } else if (next.size < 2) {
          next.add(idx);
        }
        return next;
      });
    };

    const handleGo = () => {
      const chargeIdx = [0, 1, 2].find(i => !selectedDice3v3.has(i))!;
      const chargeValue = currentRolls[chargeIdx];
      const newCharge = Math.min(CHARGE_MAX, chargeGauge + chargeValue);
      const isMax = newCharge >= CHARGE_MAX;

      // Calculate damage from selected dice
      let dmg = 0;
      selectedDice3v3.forEach(i => { dmg += currentRolls[i] * 4; });
      if (isMax) dmg = Math.floor(dmg * 1.5);

      setHurtEnemy3v3(true);
      setTimeout(() => {
        setChargeGauge(isMax ? 0 : newCharge);
        setEnemyHp3v3(prev => Math.max(0, prev - dmg));
        setHurtEnemy3v3(false);
        setRolled3v3(false);
        setSelectedDice3v3(new Set());
        setSubStep(prev => prev + 1);
      }, 600);
    };

    const renderDiceRow = () => (
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8 }}>
        {partyDice.map((pd, i) => {
          const faceNum = rolled3v3 ? currentRolls[i] : 1;
          const isSelected = selectedDice3v3.has(i);
          const canSelect = (subStep === 2 || subStep === 5) && rolled3v3;
          const elColor = ELEMENT_COLORS[pd.element];

          return (
            <div key={pd.id} style={{ textAlign: 'center', cursor: canSelect ? 'pointer' : 'default' }}
              onClick={() => canSelect && toggleDiceSelection(i)}>
              <DiceFaceView
                faceNumber={faceNum}
                size={52}
                rolling={rolling3v3}
                borderColor={isSelected ? '#705828' : elColor}
                pipColors={rolled3v3 ? Array(faceNum).fill(elColor) : undefined}
              />
              <div style={{ fontSize: 8, color: isSelected ? '#705828' : '#998a78', marginTop: 2, fontWeight: isSelected ? 'bold' : 'normal' }}>
                {pd.name.length > 5 ? pd.name.slice(0, 5) + '..' : pd.name}
              </div>
              {canSelect && (
                <div style={{ fontSize: 8, color: isSelected ? '#705828' : '#c0b8a8', marginTop: 1 }}>
                  {isSelected ? 'ACT' : 'CHG'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );

    return (
      <>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          {/* Enemy */}
          <div style={{ textAlign: 'center' }}>
            <MonsterSprite monsterId="iron-golem" element="alloy" size={56} animate={!defeated} hurt={hurtEnemy3v3} />
            <div style={{ fontSize: 11, color: '#3a2a1a', marginTop: 2 }}>{ironGolem.name}</div>
            <div style={{ width: 140 }}>
              <HpBar current={enemyHp3v3} max={60} color="enemy" />
            </div>
          </div>

          {/* Charge gauge */}
          <div style={{ width: 140, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 8, color: '#998a78', minWidth: 14 }}>CG</span>
            <div style={{
              flex: 1, height: 6, background: '#e0d8cc', borderRadius: 3, overflow: 'hidden',
              border: '1px solid #c0b8a8',
            }}>
              <div style={{
                width: `${Math.min(100, (chargeGauge / CHARGE_MAX) * 100)}%`,
                height: '100%', borderRadius: 2,
                background: chargeGauge >= CHARGE_MAX ? '#c05030' : '#b09050',
                transition: 'width 0.5s ease',
              }} />
            </div>
            <span style={{ fontSize: 8, color: chargeGauge >= CHARGE_MAX ? '#c05030' : '#998a78', fontWeight: chargeGauge >= CHARGE_MAX ? 'bold' : 'normal' }}>
              {chargeGauge >= CHARGE_MAX ? 'MAX!' : `${chargeGauge}/${CHARGE_MAX}`}
            </span>
          </div>

          {/* VS */}
          <div style={{ fontSize: 12, color: '#998a78', fontWeight: 'bold' }}>VS</div>

          {/* Party sprites */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {partyDice.map(pd => (
              <MonsterSprite key={pd.id} monsterId={pd.monsterId} element={pd.element} size={32} animate />
            ))}
          </div>

          {/* Dice */}
          {renderDiceRow()}

          {/* GO button */}
          {(subStep === 2 || subStep === 5) && rolled3v3 && selectedDice3v3.size === 2 && (
            <button className="rpg-btn rpg-btn-primary" style={{ width: 'auto', padding: '6px 28px' }} onClick={handleGo}>
              GO!
            </button>
          )}
        </div>

        {subStep === 0 && <PipDialogue text="今度は本気のバトルだ！3体 vs 強敵アイアンゴーレム！" onNext={() => setSubStep(1)} />}
        {subStep === 1 && !rolling3v3 && !rolled3v3 && (
          <PipDialogue text="3つ同時に振るよ！" onNext={handleRoll3v3} buttonLabel="振る！" />
        )}
        {subStep === 1 && rolling3v3 && (
          <div style={{ position: 'absolute', bottom: 60, left: 12, right: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#705828' }}>ダイスが回転中...</div>
          </div>
        )}
        {subStep === 2 && rolled3v3 && selectedDice3v3.size < 2 && (
          <PipDialogue text="3個のうち2個を選んで攻撃(ACT)！残り1個はチャージ(CHG)に回るよ。タップして選んでね。" onNext={() => {}} buttonLabel="選択中..." />
        )}
        {subStep === 3 && (
          <PipDialogue text="ナイス！チャージゲージが溜まったよ。もう一回振ろう！" onNext={() => setSubStep(4)} />
        )}
        {subStep === 4 && !rolling3v3 && !rolled3v3 && (
          <PipDialogue text="もう1回！大きい目をチャージに回すとゲージが速く溜まるよ。" onNext={handleRoll3v3} buttonLabel="振る！" />
        )}
        {subStep === 4 && rolling3v3 && (
          <div style={{ position: 'absolute', bottom: 60, left: 12, right: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#705828' }}>ダイスが回転中...</div>
          </div>
        )}
        {subStep === 5 && rolled3v3 && selectedDice3v3.size < 2 && (
          <PipDialogue text="6の目は大きいからチャージに回そう！残り2つをACTにしてね。" onNext={() => {}} buttonLabel="選択中..." />
        )}
        {subStep === 6 && !defeated && (
          <PipDialogue text="すごい！チャージMAXで大ダメージだ！" onNext={() => {
            setHurtEnemy3v3(true);
            setTimeout(() => { setEnemyHp3v3(0); setHurtEnemy3v3(false); setSubStep(7); }, 600);
          }} buttonLabel="トドメ！" />
        )}
        {subStep === 6 && defeated && (
          <PipDialogue text="すごい！倒したぞ！" onNext={() => setSubStep(7)} />
        )}
        {subStep === 7 && (
          <PipDialogue text="やったね！街に行こう、冒険はこれからだ！" onNext={() => {
            // Give remaining starter resources and complete
            const store = useGameStore.getState();
            // Add remaining common runes
            const starterRunes = SKILL_RUNES
              .filter(r => r.tier === 'common')
              .flatMap(r => [{ ...r }, { ...r }]);
            useGameStore.getState().addRunes(starterRunes);
            // Add remaining starter dice
            const pyrachnid = CHAPTER1_MONSTERS.find(m => m.id === 'pyrachnid')!;
            const salamander = CHAPTER1_MONSTERS.find(m => m.id === 'salamander-v2')!;
            store.addDice(applyDefaultSocketTiers({ ...pyrachnid }));
            store.addDice(applyDefaultSocketTiers({ ...salamander }));
            store.captureMonster('rot-beetle');
            store.captureMonster('frost-jelly');
            store.captureMonster('pyrachnid');
            store.captureMonster('salamander-v2');
            completeTutorial();
          }} buttonLabel="街へ！" />
        )}
      </>
    );
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      minHeight: '100vh', background: '#f5f0e8',
      position: 'relative', padding: '12px',
      maxWidth: 420, margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <div style={{ fontSize: 10, color: '#998a78' }}>チュートリアル</div>
        <StepIndicator step={step} />
      </div>

      {renderContent()}
    </div>
  );
}
