import { useState, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { bgm } from '../utils/bgm';

export function EndingScreen() {
  const { setScreen, setEndingShown, save } = useGameStore();
  const [phase, setPhase] = useState(0); // 0=dark, 1-4=epilogue lines, 5=credits, 6=done
  const [brightness, setBrightness] = useState(0);
  const [creditsOffset, setCreditsOffset] = useState(0);
  const [showButton, setShowButton] = useState(false);

  const epilogueLines = [
    '「全ての運命の糸が、ひとつに結ばれた──」',
    '「ウロボロスは倒れ、回廊に静寂が戻った。」',
    '「だが、ダイスの秘密はまだ眠っている。\n　新たな冒険が、君を待っている──」',
    '「ピップソケット・クロニクル　完」',
  ];

  // Mark ending as shown on mount
  useEffect(() => {
    setEndingShown(true);
    save();
  }, [setEndingShown, save]);

  // Play victory BGM
  useEffect(() => {
    bgm.playOnce('victory');
  }, []);

  // Gradually brighten background
  useEffect(() => {
    const timer = setInterval(() => {
      setBrightness(prev => {
        if (prev >= 1) { clearInterval(timer); return 1; }
        return Math.min(1, prev + 0.02);
      });
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Auto-advance phases
  useEffect(() => {
    const timers: number[] = [];
    // Phase 1-4: epilogue lines
    let delay = 2000;
    for (let i = 1; i <= 4; i++) {
      const t = window.setTimeout(() => setPhase(i), delay);
      timers.push(t);
      delay += i === 4 ? 4000 : 3000;
    }
    // Phase 5: credits
    const t5 = window.setTimeout(() => setPhase(5), delay);
    timers.push(t5);
    // Phase 6: done (show button)
    const t6 = window.setTimeout(() => {
      setPhase(6);
      setShowButton(true);
    }, delay + 8000);
    timers.push(t6);
    return () => timers.forEach(clearTimeout);
  }, []);

  // Credits scroll
  useEffect(() => {
    if (phase < 5) return;
    const timer = setInterval(() => {
      setCreditsOffset(prev => prev + 0.5);
    }, 50);
    return () => clearInterval(timer);
  }, [phase]);

  const handleSkip = () => {
    setShowButton(true);
    setPhase(6);
    setBrightness(1);
  };

  const handleReturn = () => {
    save().then(() => setScreen('title'));
  };

  const bgColor = `rgb(${Math.round(26 + brightness * 20)}, ${Math.round(20 + brightness * 16)}, ${Math.round(16 + brightness * 12)})`;

  return (
    <div
      onClick={phase < 6 ? handleSkip : undefined}
      style={{
        position: 'fixed', inset: 0, zIndex: 600,
        background: bgColor,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DotGothic16', monospace",
        cursor: phase < 6 ? 'pointer' : 'default',
        overflow: 'hidden',
      }}
    >
      {/* Congratulations */}
      {phase >= 1 && (
        <div style={{
          fontSize: 24, color: '#d0a030', fontWeight: 'bold',
          textAlign: 'center', marginBottom: 20,
          animation: 'endingCongrats 2s ease both',
          textShadow: '0 0 8px rgba(208,160,48,0.4)',
        }}>
          おめでとう！
          <div style={{ fontSize: 14, marginTop: 4, color: '#b89030' }}>
            Congratulations!
          </div>
        </div>
      )}

      {/* Epilogue lines */}
      <div style={{
        maxWidth: 320, textAlign: 'center',
        minHeight: 160, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', gap: 16,
      }}>
        {epilogueLines.map((line, i) => (
          phase >= i + 1 && (
            <div key={i} style={{
              fontSize: 12, color: '#d0a030', lineHeight: 1.8,
              animation: `endingLineIn 1s ease ${i * 0.2}s both`,
              whiteSpace: 'pre-wrap',
              opacity: phase >= 5 ? Math.max(0, 1 - (phase - 5) * 0.3) : 1,
              transition: 'opacity 1s ease',
            }}>
              {line}
            </div>
          )
        ))}
      </div>

      {/* Credits */}
      {phase >= 5 && (
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, top: 0,
          display: 'flex', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            textAlign: 'center', color: '#d0a030',
            fontSize: 11, lineHeight: 2.5,
            transform: `translateY(${300 - creditsOffset}px)`,
            transition: 'none',
          }}>
            <div style={{ height: 200 }} />
            <div style={{ fontSize: 10, color: '#998a78', marginBottom: 8 }}>GAME DESIGN</div>
            <div>ピップソケット・クロニクル チーム</div>
            <div style={{ height: 40 }} />
            <div style={{ fontSize: 10, color: '#998a78', marginBottom: 8 }}>PROGRAMMING</div>
            <div>Claude AI & Player</div>
            <div style={{ height: 40 }} />
            <div style={{ fontSize: 10, color: '#998a78', marginBottom: 8 }}>MUSIC & SOUND</div>
            <div>Web Audio API Procedural Generation</div>
            <div style={{ height: 60 }} />
            <div style={{ fontSize: 14, color: '#d0a030' }}>
              Thank you for playing!
            </div>
            <div style={{ height: 100 }} />
          </div>
        </div>
      )}

      {/* Return button */}
      {showButton && (
        <div style={{
          position: 'absolute', bottom: 40,
          animation: 'endingLineIn 1s ease both',
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); handleReturn(); }}
            style={{
              padding: '12px 32px',
              fontSize: 14,
              fontFamily: "'DotGothic16', monospace",
              background: 'transparent',
              border: '2px solid #d0a030',
              color: '#d0a030',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            タイトルに戻る
          </button>
        </div>
      )}

      {/* Skip hint */}
      {phase < 6 && (
        <div style={{
          position: 'absolute', bottom: 12,
          fontSize: 9, color: '#665840',
        }}>
          タップでスキップ
        </div>
      )}
    </div>
  );
}
