import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { CHAPTER1_MONSTERS } from '../../data/monsters';
import { SKILL_RUNES } from '../../data/skill-runes';
import { DiceFaceView } from '../common/DiceFaceView';
import { MonsterSprite } from '../common/MonsterSprite';
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
// Tutorial step indicator (6 steps)
// ==============================
const STEP_LABELS = ['目覚め', 'ダイス', '封印', 'バトル', '知識', '冒険'];

function StepIndicator({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 8 }}>
      {STEP_LABELS.map((label, i) => {
        const s = i + 1;
        return (
          <div key={s} style={{ textAlign: 'center' }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', margin: '0 auto',
              background: s === step ? '#705828' : s < step ? '#b09050' : '#e0d8cc',
              border: '1px solid #c0b8a8',
            }} />
            <div style={{ fontSize: 7, color: s <= step ? '#705828' : '#c0b8a8', marginTop: 1 }}>{label}</div>
          </div>
        );
      })}
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
  const initialStep = tutorial.currentStep >= 30 ? 5 : 1;
  const initialSubStep = tutorial.currentStep >= 30 ? 0 : 0;

  const [step, setStep] = useState(initialStep);
  const [subStep, setSubStep] = useState(initialSubStep);

  // Prevent double-execution of side effects
  const effectsDone = useRef<Set<string>>(new Set());

  // If we returned from battle, mark earlier effects as done
  useEffect(() => {
    if (initialStep >= 5) {
      effectsDone.current.add('equip-runes');
      effectsDone.current.add('capture-rot-beetle');
      effectsDone.current.add('add-frost-jelly');
      effectsDone.current.add('set-party');
    }
  }, [initialStep]);

  // ---- Step 2 sub-step 6: auto-equip runes to protagonist ----
  useEffect(() => {
    if (step === 2 && subStep === 6 && !effectsDone.current.has('equip-runes')) {
      effectsDone.current.add('equip-runes');
      const ironBash = SKILL_RUNES.find(r => r.id === 'iron-bash')!;
      const guard = SKILL_RUNES.find(r => r.id === 'guard')!;
      const blazeStrike = SKILL_RUNES.find(r => r.id === 'blaze-strike')!;
      const iceShard = SKILL_RUNES.find(r => r.id === 'ice-shard')!;
      const spark = SKILL_RUNES.find(r => r.id === 'spark')!;

      addRune({ ...ironBash });
      addRune({ ...guard });
      addRune({ ...blazeStrike });
      addRune({ ...iceShard });
      addRune({ ...spark });
      addRune({ ...ironBash });  // 面4用の追加ルーン
      addRune({ ...blazeStrike });
      addRune({ ...spark });

      setTimeout(() => { equipRune('protagonist', 1, 0, 'iron-bash'); }, 300);
      setTimeout(() => { equipRune('protagonist', 2, 0, 'guard'); }, 450);
      setTimeout(() => { equipRune('protagonist', 2, 1, 'iron-bash'); }, 600);
      setTimeout(() => { equipRune('protagonist', 3, 0, 'blaze-strike'); }, 750);
      setTimeout(() => { equipRune('protagonist', 3, 1, 'ice-shard'); }, 900);
      setTimeout(() => { equipRune('protagonist', 3, 2, 'spark'); }, 1050);
      setTimeout(() => { equipRune('protagonist', 4, 0, 'blaze-strike'); }, 1200);
      setTimeout(() => { equipRune('protagonist', 4, 1, 'spark'); }, 1350);
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

  // ---- Step 3 sub-step 4: add frost-jelly ----
  useEffect(() => {
    if (step === 3 && subStep === 4 && !effectsDone.current.has('add-frost-jelly')) {
      effectsDone.current.add('add-frost-jelly');
      const frostJelly = CHAPTER1_MONSTERS.find(m => m.id === 'frost-jelly')!;
      addDice(applyDefaultSocketTiers({ ...frostJelly }));
    }
  }, [step, subStep, addDice]);

  // ---- Step 3 sub-step 5: set party ----
  useEffect(() => {
    if (step === 3 && subStep === 5 && !effectsDone.current.has('set-party')) {
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
    setTutorialStep(30);
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
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return null;
    }
  };

  // ==============================
  // STEP 1: 目覚め — ストーリー導入
  // ==============================
  const renderStep1 = () => {
    return (
      <>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {subStep <= 2 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>&#9856;</div>
              <div style={{ fontSize: 14, color: '#705828', fontWeight: 'bold' }}>ピップソケット・クロニクル</div>
            </div>
          )}
          {subStep >= 3 && (
            <div style={{ textAlign: 'center' }}>
              <MonsterSprite monsterId="protagonist" element="alloy" size={80} animate />
              <div style={{ fontSize: 12, color: '#705828', fontWeight: 'bold', marginTop: 8 }}>???</div>
            </div>
          )}
        </div>

        {subStep === 0 && <PipDialogue text="...おーい！聞こえる？" onNext={advance} />}
        {subStep === 1 && <PipDialogue text="やあ！やっと目が覚めた！ ぼくはずっとここで待ってたんだ！" onNext={advance} mood="excited" />}
        {subStep === 2 && <PipDialogue text="ぼくはピップ。きみの相棒さ。よろしくね！" onNext={advance} />}
        {subStep === 3 && <PipDialogue text="実はね、この世界がモンスターだらけになっちゃって...まいってるんだ。" onNext={advance} mood="worried" />}
        {subStep === 4 && <PipDialogue text="でも大丈夫！きみには特別な力がある。モンスターをダイスに封印して、その力で戦えるんだ！" onNext={advance} />}
        {subStep === 5 && <PipDialogue text="まだよくわかんないよね。大丈夫、ひとつずつ教えるよ！まずはきみのダイスを見てみよう。" onNext={nextStep} buttonLabel="見てみる！" mood="excited" />}
      </>
    );
  };

  // ==============================
  // STEP 2: ダイスとルーン説明
  // ==============================
  const renderStep2 = () => {
    const pipColors1 = getPipColorsForDiceFace(protagonistDice, 1);
    const pipColors6 = getPipColorsForDiceFace(protagonistDice, 6);

    const showAllFaces = subStep >= 2;
    const showEquipped = subStep >= 6;

    return (
      <>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <MonsterSprite monsterId="protagonist" element="alloy" size={64} animate />
            <div style={{ fontSize: 12, color: '#705828', fontWeight: 'bold', marginTop: 4 }}>Hero Dice</div>

            {/* 面の表示 */}
            {showAllFaces && (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {[1, 2, 3, 4, 5, 6].map(f => (
                    <div key={f} style={{ textAlign: 'center' }}>
                      <DiceFaceView
                        faceNumber={f} size={44} borderColor={showEquipped && (f === 1 || f === 3) ? '#b09050' : '#c0b8a8'}
                        pipColors={showEquipped ? getPipColorsForDiceFace(protagonistDice, f) : undefined}
                      />
                      <div style={{ fontSize: 7, color: '#998a78', marginTop: 1 }}>{f}の面({f}穴)</div>
                    </div>
                  ))}
                </div>
                {showEquipped && (
                  <div style={{ marginTop: 8, fontSize: 10, color: '#6a5a4a' }}>
                    1の面と3の面にルーンを装着！
                  </div>
                )}
              </div>
            )}

            {/* ルーン装着前: 1と3の面だけ大きく見せる */}
            {!showAllFaces && subStep >= 1 && (
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12 }}>
                <div style={{ textAlign: 'center' }}>
                  <DiceFaceView faceNumber={1} size={56} borderColor="#b09050" pipColors={pipColors1} />
                  <div style={{ fontSize: 8, color: '#998a78', marginTop: 2 }}>1の面 — 1穴</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <DiceFaceView faceNumber={6} size={56} borderColor="#c0b8a8" pipColors={pipColors6} />
                  <div style={{ fontSize: 8, color: '#998a78', marginTop: 2 }}>6の面 — 6穴</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {subStep === 0 && <PipDialogue text="これがきみ専用のHERO(ヒーロー)ダイスだよ！サイコロみたいに6つの面があるんだ。" onNext={advance} />}
        {subStep === 1 && <PipDialogue text="各面にはソケット(穴)があるでしょ？面の数字と同じ数だけ穴があるよ。1の面は1穴、6の面は6穴！" onNext={advance} mood="thinking" />}
        {subStep === 2 && <PipDialogue text="全部の面を見てみよう！穴が多い面ほどたくさんスキルが入るけど...実は大きい面ほど出にくいんだ。" onNext={advance} mood="thinking" />}
        {subStep === 3 && <PipDialogue text="1の面は出やすいけどスキル1個。6の面はスキル6個入るけど滅多に出ない...リスクとリターンだね！" onNext={advance} />}
        {subStep === 4 && <PipDialogue text="穴にはスキルルーンをはめるよ。ルーンをはめるとバトルでその面が出た時にスキルが発動するんだ！" onNext={advance} />}
        {subStep === 5 && <PipDialogue text="HEROダイスは全部の面を自由にカスタムできる特別なダイス！モンスターダイスは最初からスキルがロックされてる面があるよ。" onNext={advance} />}
        {subStep === 6 && <PipDialogue text="試しにルーンをたくさんはめてみたよ！1〜4の面にバランスよくセットしたから、どの目が出てもそこそこ戦えるはず！" onNext={advance} mood="excited" />}
        {subStep === 7 && <PipDialogue text="スキルには種類があるよ。ダメージ、回復、シールド、バフ、デバフ、継続ダメージ...組み合わせが大事！" onNext={advance} mood="thinking" />}
        {subStep === 8 && <PipDialogue text="同じ面に同属性のスキルを集めるとシナジーで威力UP！異なる属性を組み合わせるとレシピコンボも発動するよ！" onNext={advance} />}
        {subStep === 9 && <PipDialogue text="よし、ダイスの基本はバッチリ！次は仲間を集めよう！" onNext={nextStep} buttonLabel="次へ！" mood="excited" />}
      </>
    );
  };

  // ==============================
  // STEP 3: 封印 + パーティ編成
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
            forceSuccess
          />
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            {/* 捕獲後のモンスター表示 */}
            {subStep >= 2 && hasRotBeetle && (
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <MonsterSprite monsterId="rot-beetle" element="venom" size={48} animate />
                  <div style={{ fontSize: 9, color: ELEMENT_COLORS['venom'] }}>ロットビートル</div>
                  <div style={{ fontSize: 7, color: '#998a78' }}>★1 毒属性</div>
                </div>
                {subStep >= 4 && hasFrostJelly && (
                  <div style={{ textAlign: 'center' }}>
                    <MonsterSprite monsterId="frost-jelly" element="frost" size={48} animate />
                    <div style={{ fontSize: 9, color: ELEMENT_COLORS['frost'] }}>フロストジェリー</div>
                    <div style={{ fontSize: 7, color: '#998a78' }}>★1 氷属性</div>
                  </div>
                )}
              </div>
            )}

            {/* パーティ表示 */}
            {subStep >= 5 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 10, color: '#705828', textAlign: 'center', marginBottom: 8, fontWeight: 'bold' }}>パーティ編成</div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  {[
                    { id: 'protagonist', el: 'alloy' as const, name: 'Hero Dice', star: '' },
                    { id: 'rot-beetle', el: 'venom' as const, name: 'ロットビートル', star: '★1' },
                    { id: 'frost-jelly', el: 'frost' as const, name: 'フロストジェリー', star: '★1' },
                  ].map(d => (
                    <div key={d.id} style={{ textAlign: 'center' }}>
                      <MonsterSprite monsterId={d.id} element={d.el} size={40} animate />
                      <div style={{ fontSize: 8, color: ELEMENT_COLORS[d.el] }}>{d.name}</div>
                      {d.star && <div style={{ fontSize: 7, color: '#998a78' }}>{d.star}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 封印前 */}
            {subStep === 0 && (
              <MonsterSprite monsterId="rot-beetle" element="venom" size={64} animate />
            )}
          </div>
        )}

        {subStep === 0 && <PipDialogue text="あっ、モンスターだ！弱ったモンスターはダイスに封印できるんだよ。実際にやってみよう！" onNext={() => setSubStep(1)} mood="excited" />}
        {subStep === 2 && <PipDialogue text="やった！ロットビートルを封印した！封印したモンスターはダイスとしてパーティに入れられるよ。" onNext={advance} mood="excited" />}
        {subStep === 3 && <PipDialogue text="モンスターダイスは固有スキルがロックされてるんだ。レアリティが高いほど強いスキルが入ってるよ！捕獲率は低いけどね。" onNext={() => setSubStep(4)} mood="thinking" />}
        {subStep === 4 && <PipDialogue text="お、もう1体見つけたよ！フロストジェリーだ！氷属性の仲間が加わった！" onNext={() => setSubStep(5)} />}
        {subStep === 5 && <PipDialogue text="3体揃った！パーティは3体で組むよ。いろんな属性の仲間を集めると、どんな敵にも対応できる！" onNext={advance} />}
        {subStep === 6 && <PipDialogue text="パーティ編成は町の「ダイス装備」で自由に変えられるよ。ルーンの付け替えもそこでできるんだ。" onNext={advance} mood="thinking" />}
        {subStep === 7 && <PipDialogue text="よし、仲間も揃った！いよいよ本物のバトルだ！" onNext={nextStep} buttonLabel="バトルへ！" mood="excited" />}
      </>
    );
  };

  // ==============================
  // STEP 4: バトル（実戦前説明 → 本物のBattleScreen）
  // ==============================
  const renderStep4 = () => {
    return (
      <>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          {subStep <= 3 && (
            <div style={{ textAlign: 'center' }}>
              {/* VS表示 */}
              <div style={{ fontSize: 9, color: '#998a78', marginBottom: 4 }}>敵パーティ</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <MonsterSprite monsterId="rot-beetle" element="venom" size={44} animate />
                <MonsterSprite monsterId="pyrachnid" element="blaze" size={44} animate />
                <MonsterSprite monsterId="frost-jelly" element="frost" size={44} animate />
              </div>
              <div style={{ fontSize: 14, color: '#b04030', marginTop: 8, fontWeight: 'bold' }}>VS</div>
              <div style={{ fontSize: 9, color: '#998a78', marginTop: 8, marginBottom: 4 }}>きみのパーティ</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <MonsterSprite monsterId="protagonist" element="alloy" size={44} animate />
                <MonsterSprite monsterId="rot-beetle" element="venom" size={44} animate />
                <MonsterSprite monsterId="frost-jelly" element="frost" size={44} animate />
              </div>
            </div>
          )}

          {/* ACT/CHGの説明ビジュアル */}
          {subStep >= 1 && subStep <= 3 && (
            <div style={{
              background: '#ece5d8', borderRadius: 6, padding: 8, marginTop: 8, width: '90%', maxWidth: 280,
            }}>
              {subStep === 1 && (
                <div style={{ fontSize: 9, color: '#3a2a1a', lineHeight: 1.6, textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 4, color: '#705828' }}>バトルの流れ</div>
                  <div>3体のダイスを同時に振る</div>
                  <div>↓</div>
                  <div><span style={{ color: '#b04030', fontWeight: 'bold' }}>2個をACT(攻撃)</span>に選ぶ</div>
                  <div><span style={{ color: '#4070a0', fontWeight: 'bold' }}>1個をCHG(チャージ)</span>に回す</div>
                  <div>↓</div>
                  <div>双方のスキルが発動！</div>
                </div>
              )}
              {subStep === 2 && (
                <div style={{ fontSize: 9, color: '#3a2a1a', lineHeight: 1.6, textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 4, color: '#705828' }}>チャージゲージ</div>
                  <div>CHGに回した出目の数だけゲージが溜まる</div>
                  <div style={{ marginTop: 4 }}>
                    <span style={{ color: '#c05030', fontWeight: 'bold' }}>MAX到達 → 次の攻撃が1.5倍！</span>
                  </div>
                  <div style={{ marginTop: 4, color: '#6a5a4a' }}>大きい目をCHGに回すと速く溜まるよ</div>
                </div>
              )}
              {subStep === 3 && (
                <div style={{ fontSize: 9, color: '#3a2a1a', lineHeight: 1.6, textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 4, color: '#705828' }}>属性相性</div>
                  <div>
                    <span style={{ color: '#308050' }}>有利 → ×1.5倍</span>
                    {'　'}
                    <span style={{ color: '#b04030' }}>不利 → ×0.5倍</span>
                  </div>
                  <div style={{ marginTop: 4, fontSize: 8, color: '#6a5a4a' }}>
                    炎→氷鋼 / 氷→雷毒 / 雷→炎幻 / 毒→炎幻 / 鋼→雷毒 / 幻→氷鋼
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {subStep === 0 && <PipDialogue text="3対3のバトルだ！野生のモンスターが3体現れた！戦い方を説明するね。" onNext={advance} mood="excited" />}
        {subStep === 1 && <PipDialogue text="毎ターン3個のダイスを振って、2個をACT(攻撃)に、1個をCHG(チャージ)に振り分けるよ。" onNext={advance} mood="thinking" />}
        {subStep === 2 && <PipDialogue text="CHGに回した出目でチャージゲージが溜まる！MAXになると攻撃が1.5倍だ！大きい目をCHGに回すのが戦略のポイントだよ。" onNext={advance} mood="thinking" />}
        {subStep === 3 && <PipDialogue text="属性の有利不利も重要！炎は氷に強いけど雷には弱い...パーティの属性を考えて戦おう！" onNext={advance} mood="thinking" />}
        {subStep === 4 && (
          <PipDialogue
            text="よし、準備はいい？実際にやってみるのが一番！負けても大丈夫、何度でも挑戦できるよ！"
            onNext={() => {
              setSubStep(5);
              startTutorialBattle();
            }}
            buttonLabel="戦闘開始！"
            mood="excited"
          />
        )}
      </>
    );
  };

  // ==============================
  // STEP 5: バトル振り返り + 知識
  // ==============================
  const renderStep5 = () => {
    return (
      <>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {subStep <= 1 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>&#9856;</div>
              <div style={{ fontSize: 13, color: '#705828', fontWeight: 'bold' }}>バトル完了！</div>
            </div>
          )}

          {/* 属性相性表 */}
          {subStep >= 2 && subStep <= 4 && (
            <div style={{ background: '#ece5d8', borderRadius: 6, padding: 10, width: '100%', maxWidth: 300 }}>
              <div style={{ fontSize: 10, color: '#705828', fontWeight: 'bold', marginBottom: 6, textAlign: 'center' }}>属性相性表</div>
              <div style={{ fontSize: 8, color: '#6a5a4a', lineHeight: 1.8 }}>
                {[
                  { name: '炎', el: 'blaze', strong: '氷・鋼', weak: '雷・毒' },
                  { name: '氷', el: 'frost', strong: '雷・毒', weak: '炎・幻' },
                  { name: '雷', el: 'volt', strong: '炎・幻', weak: '氷・鋼' },
                  { name: '毒', el: 'venom', strong: '炎・幻', weak: '氷・鋼' },
                  { name: '鋼', el: 'alloy', strong: '雷・毒', weak: '炎・幻' },
                  { name: '幻', el: 'mirage', strong: '氷・鋼', weak: '雷・毒' },
                ].map(a => (
                  <div key={a.el}>
                    <span style={{ color: ELEMENT_COLORS[a.el as keyof typeof ELEMENT_COLORS], fontWeight: 'bold' }}>{a.name}</span>
                    {' → '}
                    <span style={{ color: '#308050' }}>{a.strong}に強い</span>
                    {' / '}
                    <span style={{ color: '#b04030' }}>{a.weak}に弱い</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* スキルタイプ */}
          {subStep >= 4 && subStep <= 5 && (
            <div style={{ background: '#ece5d8', borderRadius: 6, padding: 10, width: '100%', maxWidth: 300 }}>
              <div style={{ fontSize: 10, color: '#705828', fontWeight: 'bold', marginBottom: 6, textAlign: 'center' }}>スキルタイプ</div>
              <div style={{ fontSize: 8, color: '#6a5a4a', lineHeight: 1.8 }}>
                <div><span style={{ color: '#a04030', fontWeight: 'bold' }}>ダメージ</span> — 直接ダメージ</div>
                <div><span style={{ color: '#906020', fontWeight: 'bold' }}>継続(DoT)</span> — 毎ターンダメージ</div>
                <div><span style={{ color: '#30a050', fontWeight: 'bold' }}>回復</span> — HPを回復</div>
                <div><span style={{ color: '#5080a0', fontWeight: 'bold' }}>シールド</span> — ダメージ吸収</div>
                <div><span style={{ color: '#3070a0', fontWeight: 'bold' }}>バフ</span> — 攻撃力UP</div>
                <div><span style={{ color: '#7050a0', fontWeight: 'bold' }}>デバフ</span> — 敵攻撃力DOWN</div>
              </div>
            </div>
          )}

          {/* ソケット品質 */}
          {subStep >= 6 && (
            <div style={{ background: '#ece5d8', borderRadius: 6, padding: 10, width: '100%', maxWidth: 300 }}>
              <div style={{ fontSize: 10, color: '#705828', fontWeight: 'bold', marginBottom: 6, textAlign: 'center' }}>ソケット品質</div>
              <div style={{ fontSize: 8, color: '#6a5a4a', lineHeight: 1.8 }}>
                <div><span style={{ color: '#8a6030', fontWeight: 'bold' }}>bronze</span> → <span style={{ color: '#808888', fontWeight: 'bold' }}>silver</span> → <span style={{ color: '#c0a020', fontWeight: 'bold' }}>gold</span></div>
                <div>品質が高いほどスキル威力UP！鍛冶屋で強化できるよ。</div>
              </div>
            </div>
          )}
        </div>

        {subStep === 0 && <PipDialogue text="お疲れさま！実際のバトルはどうだった？" onNext={advance} mood="excited" />}
        {subStep === 1 && (
          <PipDialogue
            text="ACTとCHGの使い分けが大事だったでしょ？大きい目をCHGに回してMAXを狙うか、小さい目でコツコツ溜めるか...戦略が奥深いんだ。"
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
              advance();
            }}
            mood="thinking"
          />
        )}
        {subStep === 2 && <PipDialogue text="バトルで重要な属性相性をおさらいしよう。これはいつでも図鑑で確認できるよ！" onNext={advance} mood="thinking" />}
        {subStep === 3 && <PipDialogue text="有利属性なら1.5倍、不利なら0.5倍のダメージ！パーティの属性バランスが大事だね。" onNext={advance} />}
        {subStep === 4 && <PipDialogue text="スキルも種類がたくさんあるよ。攻撃だけじゃなく、シールドやバフも上手く使おう！" onNext={advance} mood="thinking" />}
        {subStep === 5 && <PipDialogue text="同じ面に同属性スキルを集めるとシナジーで威力UP！違う属性を組み合わせるとレシピコンボも発動する...奥が深いでしょ？" onNext={advance} />}
        {subStep === 6 && <PipDialogue text="ソケットの品質も大事！bronzeからsilver、goldに強化すると、同じスキルでもダメージがアップするよ。" onNext={advance} mood="thinking" />}
        {subStep === 7 && <PipDialogue text="よし、知識は十分！最後に町を案内するね！" onNext={nextStep} buttonLabel="次へ！" mood="excited" />}
      </>
    );
  };

  // ==============================
  // STEP 6: 町の施設 + 旅立ち
  // ==============================
  const renderStep6 = () => {
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

        {subStep === 0 && <PipDialogue text="ここが冒険の拠点、町だよ！いろんな施設があるから紹介するね。" onNext={advance} />}
        {subStep === 1 && <PipDialogue text="ダンジョンでモンスターと戦って仲間を増やそう！鍛冶屋でソケットを強化、ショップで素材やルーンを買えるよ。" onNext={advance} />}
        {subStep === 2 && <PipDialogue text="ガチャでレアなダイスやルーンが手に入るかも！決闘場ではAI相手にポイントを稼げるよ。" onNext={advance} />}
        {subStep === 3 && <PipDialogue text="各章のボスを倒して封印すると次の章に進めるんだ。全7章の冒険が待ってる！" onNext={advance} />}
        {subStep === 4 && <PipDialogue text="レベルが上がるとHPが増えるよ。どんどん戦って強くなろう！" onNext={advance} />}
        {subStep === 5 && <PipDialogue text="困ったら図鑑を見てね。属性相性、モンスター、ルーン、レシピコンボ...全部載ってるよ！" onNext={advance} mood="thinking" />}
        {subStep === 6 && (
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
