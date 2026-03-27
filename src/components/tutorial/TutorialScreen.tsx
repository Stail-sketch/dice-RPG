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
import { CaptureScene } from '../battle/CaptureScene';

// ==============================
// Pip dialogue box
// ==============================
type PipMood = 'normal' | 'excited' | 'worried' | 'thinking';

function PipDialogue({ text, onNext, buttonLabel, mood = 'normal' }: {
  text: string; onNext: () => void; buttonLabel?: string; mood?: PipMood;
}) {
  const moodStyles: Record<PipMood, { border: string; nameColor: string }> = {
    normal: { border: '#c0b8a8', nameColor: '#705828' },
    excited: { border: '#b09050', nameColor: '#a07020' },
    worried: { border: '#c08080', nameColor: '#905050' },
    thinking: { border: '#8098b0', nameColor: '#506878' },
  };
  const s = moodStyles[mood];

  return (
    <div style={{
      position: 'absolute', bottom: 60, left: 12, right: 12,
      background: '#ffffff', border: `1.5px solid ${s.border}`,
      borderRadius: 2, padding: '8px 10px', zIndex: 100,
    }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <div style={{
          width: 24, height: 24, background: '#b09050',
          borderRadius: 2, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 14, flexShrink: 0,
        }}>&#9856;</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: s.nameColor, fontWeight: 'bold', marginBottom: 2 }}>
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
// Tutorial step indicator (5 steps)
// ==============================
function StepIndicator({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
      {[1, 2, 3, 4, 5].map(s => (
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
// Attack label overlay
// ==============================
function AttackOverlay({ label }: { label: string }) {
  if (!label) return null;
  return (
    <div style={{
      position: 'absolute', top: '40%', left: 0, right: 0, textAlign: 'center', zIndex: 110,
      pointerEvents: 'none',
    }}>
      <div style={{
        display: 'inline-block', fontSize: 14, color: '#b04030', fontWeight: 'bold',
        background: 'rgba(255,255,255,0.85)', padding: '4px 16px', borderRadius: 4,
      }}>{label}</div>
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

  // ---- Step 1 sub-step 5: auto-equip runes to protagonist ----
  useEffect(() => {
    if (step === 1 && subStep === 5 && !effectsDone.current.has('equip-runes')) {
      effectsDone.current.add('equip-runes');
      const ironBash = SKILL_RUNES.find(r => r.id === 'iron-bash')!;
      const blazeStrike = SKILL_RUNES.find(r => r.id === 'blaze-strike')!;
      const iceShard = SKILL_RUNES.find(r => r.id === 'ice-shard')!;
      const spark = SKILL_RUNES.find(r => r.id === 'spark')!;

      addRune({ ...ironBash });
      addRune({ ...blazeStrike });
      addRune({ ...iceShard });
      addRune({ ...spark });

      setTimeout(() => { equipRune('protagonist', 1, 0, 'iron-bash'); }, 300);
      setTimeout(() => { equipRune('protagonist', 3, 0, 'blaze-strike'); }, 600);
      setTimeout(() => { equipRune('protagonist', 3, 1, 'ice-shard'); }, 900);
      setTimeout(() => { equipRune('protagonist', 3, 2, 'spark'); }, 1200);
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

  const advance = useCallback(() => { setSubStep(s => s + 1); }, []);
  const nextStep = useCallback(() => { setStep(s => s + 1); setSubStep(0); }, []);

  // ==============================
  // Step 2 state: 1v1 multi-turn battle
  // ==============================
  const ENEMY_MAX_HP_1V1 = 25;
  const PLAYER_MAX_HP_1V1 = 30;
  const [enemyHp1v1, setEnemyHp1v1] = useState(ENEMY_MAX_HP_1V1);
  const [playerHp1v1, setPlayerHp1v1] = useState(PLAYER_MAX_HP_1V1);
  const [rolling1v1, setRolling1v1] = useState(false);
  const [hurtEnemy1v1, setHurtEnemy1v1] = useState(false);
  const [hurtPlayer1v1, setHurtPlayer1v1] = useState(false);
  const [attackLabel1v1, setAttackLabel1v1] = useState('');
  const [turn1v1, setTurn1v1] = useState(0);

  // Scripted rolls for 1v1: [face, playerDmg, enemyDmg]
  const SCRIPT_1V1: Array<{ face: number; playerDmg: number; enemyDmg: number }> = [
    { face: 1, playerDmg: 8, enemyDmg: 5 },
    { face: 3, playerDmg: 15, enemyDmg: 4 },
    { face: 1, playerDmg: 8, enemyDmg: 0 }, // kill shot, no counter
  ];

  // ==============================
  // Step 4 state: 3v3 multi-turn battle
  // ==============================
  const ENEMY_MAX_HP_3V3 = 65;
  const PLAYER_MAX_HP_3V3 = 50;
  const [enemyHp3v3, setEnemyHp3v3] = useState(ENEMY_MAX_HP_3V3);
  const [playerHp3v3, setPlayerHp3v3] = useState(PLAYER_MAX_HP_3V3);
  const [rolling3v3, setRolling3v3] = useState(false);
  const [rolled3v3, setRolled3v3] = useState(false);
  const [selectedDice3v3, setSelectedDice3v3] = useState<Set<number>>(new Set());
  const [hurtEnemy3v3, setHurtEnemy3v3] = useState(false);
  const [hurtPlayer3v3, setHurtPlayer3v3] = useState(false);
  const [attackLabel3v3, setAttackLabel3v3] = useState('');
  const [chargeGauge, setChargeGauge] = useState(0);
  const [turn3v3, setTurn3v3] = useState(0);
  const CHARGE_MAX_TUT = 10;

  // Scripted rolls per turn for 3v3
  const ROLLS_3V3 = [[3, 2, 5], [4, 1, 6], [2, 4, 3], [5, 3, 2]];
  // Enemy damage per turn
  const ENEMY_DMG_3V3 = [8, 6, 5, 0];

  // ---- Render per step ----
  const renderContent = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5Town();
      default: return null;
    }
  };

  // ==============================
  // STEP 1: Intro + Dice explanation
  // ==============================
  const renderStep1 = () => {
    const showDice = subStep >= 4;
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
              {subStep >= 5 && (
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

        {subStep === 0 && <PipDialogue text="やあ！目が覚めた？ ぼくはずっとここで待ってたんだ！" onNext={advance} mood="excited" />}
        {subStep === 1 && <PipDialogue text="ぼくはピップ。きみの相棒さ。よろしくね！" onNext={advance} />}
        {subStep === 2 && <PipDialogue text="世界がモンスターだらけで...って、ちょっとヤバいかな？ でもきみなら大丈夫！" onNext={advance} mood="worried" />}
        {subStep === 3 && <PipDialogue text="さっそくだけど、この世界の戦い方を教えるね。ダイスを使って戦うんだ！" onNext={advance} />}
        {subStep === 4 && <PipDialogue text="これがきみのダイスだよ。面ごとにソケット(穴)があるでしょ？ここにスキルルーンをはめるんだ。" onNext={advance} mood="thinking" />}
        {subStep === 5 && <PipDialogue text="穴にスキルルーンをはめると、その面が出た時にスキルが発動するんだ！やってみたよ！" onNext={advance} />}
        {subStep === 6 && <PipDialogue text="面の穴が多いほどスキルがたくさん入るよ。でも大きい面は出にくい！ リスクとリターンだね。" onNext={advance} mood="thinking" />}
        {subStep === 7 && <PipDialogue text="HEROダイスは全部の面を自由にカスタムできる特別なダイスだよ！モンスターダイスには最初からロックされたスキルが入ってるんだ。" onNext={advance} />}
        {subStep === 8 && <PipDialogue text="よし、説明はここまで！実際に戦って覚えよう！" onNext={nextStep} buttonLabel="バトルへ！" mood="excited" />}
      </>
    );
  };

  // ==============================
  // STEP 2: 1v1 Multi-turn Battle
  // ==============================
  const renderStep2 = () => {
    const rotBeetle = CHAPTER1_MONSTERS.find(m => m.id === 'rot-beetle')!;
    const defeated = enemyHp1v1 <= 0;
    const script = SCRIPT_1V1[turn1v1] || SCRIPT_1V1[2];
    const currentFace = script.face;
    const pipColors = getPipColorsForDiceFace(protagonistDice, currentFace);

    const handleRoll = () => {
      setRolling1v1(true);
      setTimeout(() => {
        setRolling1v1(false);
        advance();
      }, 1000);
    };

    // Player attacks, then enemy counterattacks
    const handleAttack = () => {
      setAttackLabel1v1('スキル発動！');
      setHurtEnemy1v1(true);
      setTimeout(() => {
        setEnemyHp1v1(prev => Math.max(0, prev - script.playerDmg));
        setHurtEnemy1v1(false);
        setAttackLabel1v1('');

        // Check if enemy dead
        const newEnemyHp = Math.max(0, enemyHp1v1 - script.playerDmg);
        if (newEnemyHp <= 0 || script.enemyDmg === 0) {
          advance(); // go to post-attack dialogue
          return;
        }

        // Enemy counterattack after a delay
        setTimeout(() => {
          setAttackLabel1v1(`${rotBeetle.name}の反撃！`);
          setTimeout(() => {
            setHurtPlayer1v1(true);
            setPlayerHp1v1(prev => Math.max(0, prev - script.enemyDmg));
            setTimeout(() => {
              setHurtPlayer1v1(false);
              setAttackLabel1v1('');
              advance(); // go to post-attack dialogue
            }, 500);
          }, 400);
        }, 600);
      }, 600);
    };

    // Sub-step mapping per turn:
    // Each turn uses 4 sub-steps: [intro/roll-prompt, rolling, post-roll, attack+counter -> post-battle dialogue]
    // Turn 0: subStep 0-3,  Turn 1: 4-7,  Turn 2: 8-11
    const turnBase = turn1v1 * 4;
    const localSub = subStep - turnBase;

    // Determine if we're showing rolled dice
    const showRolled = localSub >= 2;

    return (
      <>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          {/* Enemy */}
          <div style={{ textAlign: 'center' }}>
            <MonsterSprite monsterId="rot-beetle" element="venom" size={64} animate={!defeated} hurt={hurtEnemy1v1} />
            <div style={{ fontSize: 11, color: '#3a2a1a', marginTop: 4 }}>{rotBeetle.name}</div>
            <div style={{ width: 120 }}>
              <HpBar current={enemyHp1v1} max={ENEMY_MAX_HP_1V1} color="enemy" />
            </div>
          </div>

          <div style={{ fontSize: 12, color: '#998a78', fontWeight: 'bold' }}>VS</div>

          {/* Player */}
          <div style={{ textAlign: 'center' }}>
            <MonsterSprite monsterId="protagonist" element="alloy" size={48} animate hurt={hurtPlayer1v1} />
            <div style={{ width: 120 }}>
              <HpBar current={playerHp1v1} max={PLAYER_MAX_HP_1V1} color="player" />
            </div>
            {showRolled && !defeated ? (
              <div style={{ marginTop: 8 }}>
                <DiceFaceView faceNumber={currentFace} size={60} borderColor="#b09050" pipColors={pipColors} />
                <div style={{ fontSize: 10, color: '#705828', marginTop: 4, fontWeight: 'bold' }}>{currentFace}の面!</div>
              </div>
            ) : !defeated ? (
              <div style={{ marginTop: 8 }}>
                <DiceFaceView faceNumber={1} size={60} rolling={rolling1v1} borderColor="#c0b8a8" />
              </div>
            ) : null}
          </div>

          {/* Roll button */}
          {localSub === 1 && !rolling1v1 && (
            <button className="rpg-btn rpg-btn-primary" style={{ width: 'auto', padding: '6px 28px' }} onClick={handleRoll}>
              ダイスを振る！
            </button>
          )}
        </div>

        <AttackOverlay label={attackLabel1v1} />

        {/* ==== Turn 0 ==== */}
        {subStep === 0 && <PipDialogue text="きた！ロットビートルだ！こいつは毒属性。まずは戦い方を教えるよ！" onNext={advance} mood="worried" />}
        {subStep === 1 && !rolling1v1 && (
          <PipDialogue text="ダイスを振って攻撃！出た面のスキルが全部発動するよ。さぁ振ってみて！" onNext={() => {}} buttonLabel="↑ボタンを押して！" mood="excited" />
        )}
        {subStep === 2 && (
          <PipDialogue text="1の面が出た！鉄バッシュが発動するよ！攻撃だ！" onNext={handleAttack} buttonLabel="攻撃！" mood="excited" />
        )}
        {subStep === 3 && (
          <PipDialogue
            text="うっ、反撃された！ でも大丈夫、HPが残ってればまだ戦えるよ！もう一回振ろう！"
            onNext={() => { setTurn1v1(1); setSubStep(4); }}
            mood="worried"
          />
        )}

        {/* ==== Turn 1 ==== */}
        {subStep === 4 && !rolling1v1 && (
          <PipDialogue text="次はもっと大きい面を狙いたいな...！振ってみて！" onNext={() => { setSubStep(5); }} mood="thinking" />
        )}
        {subStep === 5 && !rolling1v1 && (
          <button className="rpg-btn rpg-btn-primary" style={{
            position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
            width: 'auto', padding: '6px 28px', zIndex: 100,
          }} onClick={handleRoll}>
            ダイスを振る！
          </button>
        )}
        {subStep === 6 && (
          <PipDialogue
            text="おお、3の面だ！炎撃・氷片・スパークの3つが一斉発動！面のソケットが多いほどスキルも多いんだ！"
            onNext={handleAttack} buttonLabel="攻撃！" mood="excited"
          />
        )}
        {subStep === 7 && (
          <PipDialogue
            text="いい感じ！ちなみに属性は6種類あるよ。炎・氷・雷・毒・鋼・幻。有利なら1.5倍、不利なら0.5倍のダメージだ！"
            onNext={() => { setTurn1v1(2); setSubStep(8); }}
            mood="thinking"
          />
        )}

        {/* ==== Turn 2 (finish) ==== */}
        {subStep === 8 && !rolling1v1 && (
          <PipDialogue text="あと少し！トドメだ！" onNext={() => { setSubStep(9); }} mood="excited" />
        )}
        {subStep === 9 && !rolling1v1 && (
          <button className="rpg-btn rpg-btn-primary" style={{
            position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
            width: 'auto', padding: '6px 28px', zIndex: 100,
          }} onClick={handleRoll}>
            ダイスを振る！
          </button>
        )}
        {subStep === 10 && (
          <PipDialogue text="よし、1の面！これで仕留めるよ！" onNext={handleAttack} buttonLabel="トドメ！" mood="excited" />
        )}
        {subStep === 11 && (
          <PipDialogue
            text="やったあ！初勝利おめでとう！ どの面が出るかで戦い方が変わるんだ。大きい面はスキルが多いけど出にくい...そのドキドキが楽しいんだよ！"
            onNext={nextStep} mood="excited"
          />
        )}
      </>
    );
  };

  // ==============================
  // STEP 3: Capture
  // ==============================
  const renderStep3 = () => {
    const hasRotBeetle = ownedDice.some(d => (d.baseId || d.id) === 'rot-beetle');
    const hasFrostJelly = ownedDice.some(d => (d.baseId || d.id) === 'frost-jelly');

    const rotBeetle = CHAPTER1_MONSTERS.find(m => m.id === 'rot-beetle')!;
    const tutorialMonster = { ...rotBeetle, baseStats: { captureRate: 100 } };

    return (
      <>
        {subStep === 1 ? (
          <CaptureScene
            monster={tutorialMonster}
            onComplete={() => { setSubStep(2); }}
            onSkip={() => setSubStep(2)}
          />
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            {subStep >= 2 && hasRotBeetle && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <MonsterSprite monsterId="rot-beetle" element="venom" size={48} animate />
                  <div style={{ fontSize: 9, color: '#408030' }}>ロットビートル</div>
                </div>
                {subStep >= 4 && hasFrostJelly && (
                  <div style={{ textAlign: 'center' }}>
                    <MonsterSprite monsterId="frost-jelly" element="frost" size={48} animate />
                    <div style={{ fontSize: 9, color: '#3070a0' }}>フロストジェリー</div>
                  </div>
                )}
              </div>
            )}

            {subStep >= 5 && (
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

            {subStep === 0 && (
              <MonsterSprite monsterId="rot-beetle" element="venom" size={64} animate />
            )}
          </div>
        )}

        {subStep === 0 && <PipDialogue text="あっ、さっきのロットビートルがまだいる！弱ったモンスターはダイスに封印できるんだ。やってみよう！" onNext={() => setSubStep(1)} mood="excited" />}
        {subStep === 2 && <PipDialogue text="やった！ロットビートルをゲット！封印したモンスターはダイスとして使えるよ。強いモンスターほど捕まえにくいけどね。" onNext={() => setSubStep(3)} mood="excited" />}
        {subStep === 3 && <PipDialogue text="お、もう1体見つけたよ！フロストジェリーだ！氷属性の仲間が加わった！" onNext={() => setSubStep(4)} />}
        {subStep === 4 && <PipDialogue text="これで3体のダイスが揃ったよ！パーティは3体で組むんだ。" onNext={() => setSubStep(5)} />}
        {subStep === 5 && <PipDialogue text="いろんな属性の仲間を集めると、どんな敵にも対応できるよ！次は3体同時のバトルを体験しよう！" onNext={nextStep} buttonLabel="3v3バトルへ！" mood="excited" />}
      </>
    );
  };

  // ==============================
  // STEP 4: 3v3 Multi-turn Battle
  // ==============================
  const renderStep4 = () => {
    const ironGolem = CHAPTER1_MONSTERS.find(m => m.id === 'iron-golem')!;
    const defeated = enemyHp3v3 <= 0;

    const partyDice = [
      { id: 'protagonist', name: 'Hero Dice', element: 'alloy' as const, monsterId: 'protagonist' },
      { id: 'rot-beetle', name: 'ロットビートル', element: 'venom' as const, monsterId: 'rot-beetle' },
      { id: 'frost-jelly', name: 'フロストジェリー', element: 'frost' as const, monsterId: 'frost-jelly' },
    ];

    const currentRolls = ROLLS_3V3[turn3v3] || ROLLS_3V3[3];

    const handleRoll3v3 = () => {
      setRolling3v3(true);
      setSelectedDice3v3(new Set());
      setTimeout(() => {
        setRolling3v3(false);
        setRolled3v3(true);
        advance();
      }, 1000);
    };

    const toggleDiceSelection = (idx: number) => {
      setSelectedDice3v3(prev => {
        const next = new Set(prev);
        if (next.has(idx)) { next.delete(idx); }
        else if (next.size < 2) { next.add(idx); }
        return next;
      });
    };

    const handleGo = () => {
      const chargeIdx = [0, 1, 2].find(i => !selectedDice3v3.has(i))!;
      const chargeValue = currentRolls[chargeIdx];
      const newCharge = Math.min(CHARGE_MAX_TUT, chargeGauge + chargeValue);
      const isMax = newCharge >= CHARGE_MAX_TUT;

      let dmg = 0;
      selectedDice3v3.forEach(i => { dmg += currentRolls[i] * 4; });
      if (isMax) dmg = Math.floor(dmg * 1.5);

      // Player attack
      setAttackLabel3v3('スキル発動！');
      setHurtEnemy3v3(true);
      setTimeout(() => {
        setChargeGauge(isMax ? 0 : newCharge);
        setEnemyHp3v3(prev => Math.max(0, prev - dmg));
        setHurtEnemy3v3(false);
        setAttackLabel3v3('');

        const newEnemyHp = Math.max(0, enemyHp3v3 - dmg);
        const enemyDmg = ENEMY_DMG_3V3[turn3v3] || 0;

        if (newEnemyHp <= 0 || enemyDmg === 0) {
          setRolled3v3(false);
          setSelectedDice3v3(new Set());
          advance();
          return;
        }

        // Enemy counterattack
        setTimeout(() => {
          setAttackLabel3v3(`${ironGolem.name}の反撃！`);
          setTimeout(() => {
            setHurtPlayer3v3(true);
            setPlayerHp3v3(prev => Math.max(0, prev - enemyDmg));
            setTimeout(() => {
              setHurtPlayer3v3(false);
              setAttackLabel3v3('');
              setRolled3v3(false);
              setSelectedDice3v3(new Set());
              advance();
            }, 500);
          }, 400);
        }, 600);
      }, 600);
    };

    const renderDiceRow = () => (
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8 }}>
        {partyDice.map((pd, i) => {
          const faceNum = rolled3v3 ? currentRolls[i] : 1;
          const isSelected = selectedDice3v3.has(i);
          const canSelect = rolled3v3 && !rolling3v3 && (
            // Only allow selection on specific sub-steps
            [2, 7, 12, 17].includes(subStep)
          );
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

    // Sub-steps per turn: [intro, roll, select, attack+counter, post-commentary]
    // Turn 0: 0-4, Turn 1: 5-9, Turn 2: 10-14, Turn 3: 15-19

    return (
      <>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {/* Enemy */}
          <div style={{ textAlign: 'center' }}>
            <MonsterSprite monsterId="iron-golem" element="alloy" size={56} animate={!defeated} hurt={hurtEnemy3v3} />
            <div style={{ fontSize: 11, color: '#3a2a1a', marginTop: 2 }}>{ironGolem.name}</div>
            <div style={{ width: 140 }}>
              <HpBar current={enemyHp3v3} max={ENEMY_MAX_HP_3V3} color="enemy" />
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
                width: `${Math.min(100, (chargeGauge / CHARGE_MAX_TUT) * 100)}%`,
                height: '100%', borderRadius: 2,
                background: chargeGauge >= CHARGE_MAX_TUT ? '#c05030' : '#b09050',
                transition: 'width 0.5s ease',
              }} />
            </div>
            <span style={{ fontSize: 8, color: chargeGauge >= CHARGE_MAX_TUT ? '#c05030' : '#998a78', fontWeight: chargeGauge >= CHARGE_MAX_TUT ? 'bold' : 'normal' }}>
              {chargeGauge >= CHARGE_MAX_TUT ? 'MAX!' : `${chargeGauge}/${CHARGE_MAX_TUT}`}
            </span>
          </div>

          {/* Player HP */}
          <div style={{ width: 140 }}>
            <HpBar current={playerHp3v3} max={PLAYER_MAX_HP_3V3} color="player" />
          </div>

          <div style={{ fontSize: 12, color: '#998a78', fontWeight: 'bold' }}>VS</div>

          {/* Party sprites */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {partyDice.map(pd => (
              <MonsterSprite key={pd.id} monsterId={pd.monsterId} element={pd.element} size={32} animate hurt={pd.id === 'protagonist' && hurtPlayer3v3} />
            ))}
          </div>

          {/* Dice */}
          {renderDiceRow()}

          {/* GO button */}
          {[2, 7, 12, 17].includes(subStep) && rolled3v3 && selectedDice3v3.size === 2 && (
            <button className="rpg-btn rpg-btn-primary" style={{ width: 'auto', padding: '6px 28px' }} onClick={handleGo}>
              GO!
            </button>
          )}
        </div>

        <AttackOverlay label={attackLabel3v3} />

        {/* ==== Turn 0 ==== */}
        {subStep === 0 && <PipDialogue text="今度は3対1！強敵アイアンゴーレムとの本気バトルだ！" onNext={advance} mood="excited" />}
        {subStep === 1 && !rolling3v3 && !rolled3v3 && (
          <PipDialogue text="3つのダイスを同時に振るよ！全部のダイスが一斉に出目を出す！" onNext={handleRoll3v3} buttonLabel="振る！" mood="excited" />
        )}
        {subStep === 1 && rolling3v3 && (
          <div style={{ position: 'absolute', bottom: 60, left: 12, right: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#705828' }}>ダイスが回転中...</div>
          </div>
        )}
        {subStep === 2 && rolled3v3 && selectedDice3v3.size < 2 && (
          <PipDialogue text="3個のうち2個をタップしてACT(攻撃)に！残り1個はCHG(チャージ)に回るよ。大きい目をCHGに回すとゲージが速く溜まる！" onNext={() => {}} buttonLabel="2個選んでね" mood="thinking" />
        )}
        {subStep === 3 && (
          <PipDialogue
            text="ナイス！チャージゲージが溜まり始めたよ。これがMAXになると次の攻撃が1.5倍になるんだ！"
            onNext={() => { setTurn3v3(1); setSubStep(5); }}
            mood="excited"
          />
        )}
        {subStep === 4 && (
          <PipDialogue
            text="うっ、反撃されちゃった！でもまだいける！チャージを溜めて一気にいこう！"
            onNext={() => { setTurn3v3(1); setSubStep(5); }}
            mood="worried"
          />
        )}

        {/* ==== Turn 1 ==== */}
        {subStep === 5 && !rolling3v3 && !rolled3v3 && (
          <PipDialogue text="2ターン目だ！今度はどんな目が出るかな？" onNext={() => { setSubStep(6); }} />
        )}
        {subStep === 6 && !rolling3v3 && !rolled3v3 && (
          <PipDialogue text="振って振って！" onNext={handleRoll3v3} buttonLabel="振る！" mood="excited" />
        )}
        {subStep === 6 && rolling3v3 && (
          <div style={{ position: 'absolute', bottom: 60, left: 12, right: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#705828' }}>ダイスが回転中...</div>
          </div>
        )}
        {subStep === 7 && rolled3v3 && selectedDice3v3.size < 2 && (
          <PipDialogue text="6の目が出た！大きい目はチャージに回すと得だよ。6をCHGにして残り2つをACTにしよう！" onNext={() => {}} buttonLabel="2個選んでね" mood="thinking" />
        )}
        {subStep === 8 && (
          <PipDialogue
            text={chargeGauge >= CHARGE_MAX_TUT
              ? "きたきた！チャージMAXだ！次の攻撃が1.5倍になるよ！一気に畳みかけよう！"
              : "いいぞ！チャージがどんどん溜まってる！あと少しでMAXだ！"
            }
            onNext={() => { setTurn3v3(2); setSubStep(10); }}
            mood={chargeGauge >= CHARGE_MAX_TUT ? 'excited' : 'normal'}
          />
        )}
        {subStep === 9 && (
          <PipDialogue
            text="痛っ！でもチャージが溜まってきてるから、もう少しの辛抱だ！"
            onNext={() => { setTurn3v3(2); setSubStep(10); }}
            mood="worried"
          />
        )}

        {/* ==== Turn 2 ==== */}
        {subStep === 10 && !rolling3v3 && !rolled3v3 && (
          <PipDialogue text="3ターン目！ここで決めるぞ！" onNext={() => { setSubStep(11); }} mood="excited" />
        )}
        {subStep === 11 && !rolling3v3 && !rolled3v3 && (
          <PipDialogue text="最後の一押し！" onNext={handleRoll3v3} buttonLabel="振る！" mood="excited" />
        )}
        {subStep === 11 && rolling3v3 && (
          <div style={{ position: 'absolute', bottom: 60, left: 12, right: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#705828' }}>ダイスが回転中...</div>
          </div>
        )}
        {subStep === 12 && rolled3v3 && selectedDice3v3.size < 2 && (
          <PipDialogue text="さぁ、2個選んで全力攻撃だ！" onNext={() => {}} buttonLabel="2個選んでね" mood="excited" />
        )}
        {subStep === 13 && !defeated && (
          <PipDialogue text="もう少しだ！トドメの一撃！" onNext={() => {
            setHurtEnemy3v3(true);
            setTimeout(() => { setEnemyHp3v3(0); setHurtEnemy3v3(false); setSubStep(14); }, 600);
          }} buttonLabel="トドメ！" mood="excited" />
        )}
        {subStep === 13 && defeated && (
          <PipDialogue text="やった！倒したぞ！" onNext={() => setSubStep(14)} mood="excited" />
        )}
        {subStep === 14 && (
          <PipDialogue
            text="お見事！ACTとCHGの使い分けがバトルの鍵だよ。大きい目をチャージに回してMAXを狙うか、攻撃に使って速攻するか...戦略が大事！"
            onNext={() => setSubStep(15)}
            mood="thinking"
          />
        )}
        {subStep === 15 && (
          <PipDialogue
            text="ちなみに、同じ面に同属性のスキルを集めるとシナジーで威力UP！異なる属性を組み合わせるとレシピコンボも発動するよ！"
            onNext={() => {
              // Give remaining starter resources
              const store = useGameStore.getState();
              const starterRunes = SKILL_RUNES
                .filter(r => r.tier === 'common')
                .flatMap(r => [{ ...r }, { ...r }]);
              store.addRunes(starterRunes);
              const pyrachnid = CHAPTER1_MONSTERS.find(m => m.id === 'pyrachnid')!;
              store.addDice(applyDefaultSocketTiers({ ...pyrachnid }));
              store.captureMonster('rot-beetle');
              store.captureMonster('frost-jelly');
              store.captureMonster('pyrachnid');
              nextStep();
            }}
            buttonLabel="次へ！"
            mood="thinking"
          />
        )}
      </>
    );
  };

  // ==============================
  // STEP 5: Town facilities (was Step 6)
  // ==============================
  const renderStep5Town = () => {
    const facilities = [
      { name: 'ダンジョン', desc: 'モンスターと戦い、ダイスに封印する', icon: '🏔' },
      { name: '鍛冶屋', desc: 'ソケットを強化（bronze→silver→gold）＋拡張', icon: '🔨' },
      { name: 'ショップ', desc: 'ルーンや素材を購入。売却もできる', icon: '🏪' },
      { name: 'ダイス装備', desc: 'パーティ編成とルーン装着', icon: '🎲' },
      { name: 'ガチャ', desc: 'ジェムで新しいダイスやルーンをゲット', icon: '🎰' },
      { name: '決闘場', desc: 'AI対戦でポイントを稼ぐ', icon: '⚔' },
      { name: '図鑑', desc: 'モンスター・ルーン・スキル・レシピを確認', icon: '📖' },
    ];

    return (
      <>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {subStep >= 1 && (
            <div style={{ width: '100%', maxWidth: 300 }}>
              <div style={{ fontSize: 11, color: '#705828', fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>町の施設</div>
              {facilities.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 8, alignItems: 'center',
                  padding: '4px 8px', background: i % 2 === 0 ? '#ece5d8' : '#f5f0e8',
                  borderRadius: 4, marginBottom: 2,
                }}>
                  <span style={{ fontSize: 16 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: 10, color: '#3a2a1a', fontWeight: 'bold' }}>{f.name}</div>
                    <div style={{ fontSize: 8, color: '#998a78' }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {subStep === 0 && <PipDialogue text="最後に町の施設を紹介するよ！ここが冒険の拠点だ！" onNext={advance} />}
        {subStep === 1 && <PipDialogue text="ダンジョンで戦って、鍛冶屋で強化、ショップで買い物！いろんな施設を活用しよう。" onNext={advance} />}
        {subStep === 2 && <PipDialogue text="ボスを倒して封印すると次の章に進めるよ。全7章の冒険が待ってる！レベルが上がるとHPも増えるからね。" onNext={advance} />}
        {subStep === 3 && (
          <PipDialogue
            text="準備はいい？ ぼくはいつでもきみの味方だよ。さぁ、冒険の始まりだ！"
            onNext={() => { completeTutorial(); }}
            buttonLabel="冒険へ！"
            mood="excited"
          />
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
