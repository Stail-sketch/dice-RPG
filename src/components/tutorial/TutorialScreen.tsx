import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { CHAPTER1_MONSTERS } from '../../data/monsters';
import { SKILL_RUNES } from '../../data/skill-runes';
import { DiceFaceView } from '../common/DiceFaceView';
import { MonsterSprite } from '../common/MonsterSprite';
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
// Tutorial step indicator (4 steps)
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
    completeTutorial, ownedDice, setCurrentEnemy, setScreen,
    tutorial, setTutorialStep,
  } = useGameStore();

  // Restore step from store if returning from battle (currentStep >= 30 = post-battle)
  const initialStep = tutorial.currentStep >= 30 ? 3 : 1;
  const initialSubStep = tutorial.currentStep >= 30 ? 2 : 0;

  const [step, setStep] = useState(initialStep);
  const [subStep, setSubStep] = useState(initialSubStep);

  // Prevent double-execution of side effects
  const effectsDone = useRef<Set<string>>(new Set());

  // If we returned from battle, mark capture effects as done
  useEffect(() => {
    if (initialStep === 3) {
      effectsDone.current.add('equip-runes');
      effectsDone.current.add('capture-rot-beetle');
      effectsDone.current.add('add-frost-jelly');
      effectsDone.current.add('set-party');
    }
  }, [initialStep]);

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

  // ---- Step 2 sub-step 2: capture rot-beetle ----
  useEffect(() => {
    if (step === 2 && subStep === 2 && !effectsDone.current.has('capture-rot-beetle')) {
      effectsDone.current.add('capture-rot-beetle');
      const rotBeetle = CHAPTER1_MONSTERS.find(m => m.id === 'rot-beetle')!;
      addDice(applyDefaultSocketTiers({ ...rotBeetle }));
    }
  }, [step, subStep, addDice]);

  // ---- Step 2 sub-step 3: add frost-jelly ----
  useEffect(() => {
    if (step === 2 && subStep === 3 && !effectsDone.current.has('add-frost-jelly')) {
      effectsDone.current.add('add-frost-jelly');
      const frostJelly = CHAPTER1_MONSTERS.find(m => m.id === 'frost-jelly')!;
      addDice(applyDefaultSocketTiers({ ...frostJelly }));
    }
  }, [step, subStep, addDice]);

  // ---- Step 2 sub-step 4: set party (look up actual instance IDs) ----
  useEffect(() => {
    if (step === 2 && subStep === 4 && !effectsDone.current.has('set-party')) {
      effectsDone.current.add('set-party');
      const currentOwned = useGameStore.getState().ownedDice;
      const rbId = currentOwned.find(d => (d.baseId || d.id) === 'rot-beetle')?.id || '';
      const fjId = currentOwned.find(d => (d.baseId || d.id) === 'frost-jelly')?.id || '';
      setParty(['protagonist', rbId, fjId]);
    }
  }, [step, subStep, setParty]);

  const advance = useCallback(() => { setSubStep(s => s + 1); }, []);
  const nextStep = useCallback(() => { setStep(s => s + 1); setSubStep(0); }, []);

  // Launch real battle
  const startTutorialBattle = useCallback(() => {
    // Save step 30+ so we know to resume at step 3 post-battle
    setTutorialStep(30);
    // Set up 3 weak enemies for tutorial
    const enemy1 = applyDefaultSocketTiers({ ...CHAPTER1_MONSTERS.find(m => m.id === 'rot-beetle')! });
    const enemy2 = applyDefaultSocketTiers({ ...CHAPTER1_MONSTERS.find(m => m.id === 'pyrachnid')! });
    const enemy3 = applyDefaultSocketTiers({ ...CHAPTER1_MONSTERS.find(m => m.id === 'frost-jelly')! });
    setCurrentEnemy([enemy1, enemy2, enemy3]);
    useGameStore.setState({ isTutorialBattle: true });
    setScreen('battle');
  }, [setCurrentEnemy, setScreen, setTutorialStep]);

  // ---- Render per step ----
  const renderContent = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4Town();
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
        {subStep === 5 && <PipDialogue text="穴にスキルルーンをはめると、その面が出た時にスキルが発動する！やってみたよ！" onNext={advance} />}
        {subStep === 6 && <PipDialogue text="面の穴が多いほどスキルがたくさん入るよ。でも大きい面は出にくい！ リスクとリターンだね。" onNext={advance} mood="thinking" />}
        {subStep === 7 && <PipDialogue text="HEROダイスは全部の面を自由にカスタムできる特別なダイスだよ！モンスターダイスには最初からロックされたスキルが入ってるんだ。" onNext={advance} />}
        {subStep === 8 && <PipDialogue text="よし！まずは仲間を集めよう！" onNext={nextStep} buttonLabel="次へ！" mood="excited" />}
      </>
    );
  };

  // ==============================
  // STEP 2: Capture + Party setup
  // ==============================
  const renderStep2 = () => {
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

        {subStep === 0 && <PipDialogue text="あっ、モンスターだ！弱ったモンスターはダイスに封印できるんだ。やってみよう！" onNext={() => setSubStep(1)} mood="excited" />}
        {subStep === 2 && <PipDialogue text="やった！ロットビートルをゲット！封印したモンスターはダイスとして使えるよ。強いモンスターほど捕まえにくいけどね。" onNext={() => setSubStep(3)} mood="excited" />}
        {subStep === 3 && <PipDialogue text="お、もう1体見つけたよ！フロストジェリーだ！氷属性の仲間が加わった！" onNext={() => setSubStep(4)} />}
        {subStep === 4 && <PipDialogue text="これで3体のダイスが揃ったよ！パーティは3体で組むんだ。" onNext={() => setSubStep(5)} />}
        {subStep === 5 && <PipDialogue text="パーティが揃った！いろんな属性の仲間を集めると、どんな敵にも対応できるよ！" onNext={advance} />}
        {subStep === 6 && <PipDialogue text="よし、実戦だ！本物のバトルを体験しよう！3体同時にダイスを振って戦うよ！" onNext={nextStep} buttonLabel="バトルへ！" mood="excited" />}
      </>
    );
  };

  // ==============================
  // STEP 3: Real Battle (navigate to BattleScreen)
  // ==============================
  const renderStep3 = () => {
    // subStep 0: pre-battle dialogue
    // subStep 1: navigating to battle (will leave this screen)
    // subStep 2+: returned from battle (post-battle dialogue)

    return (
      <>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          {subStep === 0 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <MonsterSprite monsterId="rot-beetle" element="venom" size={48} animate />
                <MonsterSprite monsterId="pyrachnid" element="blaze" size={48} animate />
                <MonsterSprite monsterId="frost-jelly" element="frost" size={48} animate />
              </div>
              <div style={{ fontSize: 11, color: '#b04030', marginTop: 8, fontWeight: 'bold' }}>VS</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8 }}>
                <MonsterSprite monsterId="protagonist" element="alloy" size={40} animate />
                <MonsterSprite monsterId="rot-beetle" element="venom" size={40} animate />
                <MonsterSprite monsterId="frost-jelly" element="frost" size={40} animate />
              </div>
            </div>
          )}
          {subStep >= 2 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>&#9856;</div>
              <div style={{ fontSize: 13, color: '#705828', fontWeight: 'bold' }}>バトル完了！</div>
            </div>
          )}
        </div>

        {subStep === 0 && (
          <PipDialogue
            text="3対3のバトルだ！ダイスを振って、2個をACT(攻撃)、1個をCHG(チャージ)に回すよ。チャージMAXで攻撃力1.5倍！"
            onNext={() => {
              setSubStep(1);
              startTutorialBattle();
            }}
            buttonLabel="戦闘開始！"
            mood="excited"
          />
        )}
        {subStep >= 2 && (
          <PipDialogue
            text="お疲れさま！実際のバトルはこんな感じだよ。ACTとCHGの使い分け、属性の有利不利、シナジーコンボ...奥が深いでしょ？"
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
            mood="excited"
          />
        )}
      </>
    );
  };

  // ==============================
  // STEP 4: Town facilities
  // ==============================
  const renderStep4Town = () => {
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
