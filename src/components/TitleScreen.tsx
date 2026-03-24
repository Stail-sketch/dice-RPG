import { useState, useEffect, useRef, useMemo } from 'react';
import { useGameStore } from '../stores/gameStore';
import { hasSaveData } from '../stores/saveSystem';

// タイトル文字
const TITLE_TEXT = 'ピップソケット・クロニクル';

// パーティクル型
interface Sparkle {
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
}

export function TitleScreen() {
  const { initNewGame, load, startTutorial } = useGameStore();
  const [hasSave, setHasSave] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState<'new' | 'skip' | null>(null);
  const [titleReady, setTitleReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // パーティクル生成
  const sparkles = useMemo<Sparkle[]>(() => {
    const arr: Sparkle[] = [];
    for (let i = 0; i < 20; i++) {
      arr.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 4,
        duration: 2 + Math.random() * 3,
        size: 2 + Math.random() * 3,
      });
    }
    return arr;
  }, []);

  useEffect(() => {
    hasSaveData().then(setHasSave);
    // タイトルアニメーション開始を少し遅延
    const t = setTimeout(() => setTitleReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  // Canvas背景描画: シンプルなピクセルアート町並みシルエット
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const W = 320;
    const H = 480;

    // 空 (グラデーション風: ピクセルアートなので段階的)
    const skyColors = ['#2a2040', '#302848', '#383050', '#403858', '#484060', '#504868'];
    const bandH = Math.ceil(H * 0.55 / skyColors.length);
    for (let i = 0; i < skyColors.length; i++) {
      ctx.fillStyle = skyColors[i];
      ctx.fillRect(0, i * bandH, W, bandH);
    }

    // 星
    ctx.fillStyle = '#d0c8a0';
    const starPositions = [
      [30, 20], [80, 35], [140, 15], [200, 40], [250, 25], [290, 50],
      [50, 60], [170, 55], [220, 10], [100, 45], [270, 30], [15, 50],
    ];
    for (const [sx, sy] of starPositions) {
      ctx.fillRect(sx, sy, 1, 1);
    }
    // 明るい星
    ctx.fillStyle = '#e8e0c0';
    ctx.fillRect(120, 28, 2, 2);
    ctx.fillRect(230, 18, 2, 2);

    // 地面
    const groundY = Math.floor(H * 0.55);
    ctx.fillStyle = '#304828';
    ctx.fillRect(0, groundY, W, H - groundY);
    // 草テクスチャ
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = i % 3 === 0 ? '#285020' : '#385830';
      const gx = (i * 37 + 13) % W;
      const gy = groundY + (i * 53 + 7) % (H - groundY);
      ctx.fillRect(gx, gy, 2, 1);
    }

    // 道
    const pathY = groundY + 40;
    ctx.fillStyle = '#8a7860';
    ctx.fillRect(0, pathY, W, 8);
    ctx.fillStyle = '#7a6850';
    ctx.fillRect(0, pathY, W, 1);
    ctx.fillRect(0, pathY + 7, W, 1);

    // 建物シルエット (3棟)
    const drawBuilding = (x: number, y: number, w: number, h: number, roofH: number) => {
      // 壁
      ctx.fillStyle = '#1a1420';
      ctx.fillRect(x, y, w, h);
      // 屋根
      ctx.fillStyle = '#221830';
      ctx.fillRect(x - 3, y - roofH, w + 6, roofH + 2);
      // 窓 (淡い光)
      ctx.fillStyle = '#605030';
      const winW = 6;
      const winH = 5;
      const winY = y + Math.floor(h * 0.3);
      ctx.fillRect(x + 5, winY, winW, winH);
      if (w > 30) {
        ctx.fillRect(x + w - 5 - winW, winY, winW, winH);
      }
      // 窓の光
      ctx.fillStyle = '#806840';
      ctx.fillRect(x + 6, winY + 1, winW - 2, winH - 2);
      if (w > 30) {
        ctx.fillRect(x + w - 4 - winW, winY + 1, winW - 2, winH - 2);
      }
    };

    // 左の建物 (大)
    drawBuilding(30, groundY - 50, 50, 50, 10);
    // 中央の建物 (小さい, 奥)
    drawBuilding(140, groundY - 35, 30, 35, 8);
    // 右の建物 (中)
    drawBuilding(230, groundY - 45, 45, 45, 9);

    // 煙突
    ctx.fillStyle = '#1a1420';
    ctx.fillRect(50, groundY - 60, 6, 12);
    ctx.fillRect(252, groundY - 55, 5, 12);

    // 木のシルエット
    const drawTree = (tx: number, ty: number) => {
      ctx.fillStyle = '#182018';
      ctx.fillRect(tx + 4, ty + 12, 3, 8);
      ctx.fillStyle = '#1a2818';
      ctx.fillRect(tx, ty, 11, 13);
      ctx.fillRect(tx + 2, ty - 3, 7, 5);
    };
    drawTree(10, groundY - 22);
    drawTree(100, groundY - 18);
    drawTree(195, groundY - 20);
    drawTree(290, groundY - 16);

  }, []);

  const handleContinue = async () => {
    setLoading(true);
    const ok = await load();
    if (!ok) setLoading(false);
  };

  const handleNewGame = (mode: 'new' | 'skip') => {
    if (hasSave) {
      setConfirm(mode);
    } else {
      mode === 'new' ? startTutorial() : initNewGame();
    }
  };

  return (
    <div style={{
      position: 'relative',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: 20,
      overflow: 'hidden',
    }}>
      {/* Canvas背景 */}
      <canvas
        ref={canvasRef}
        width={320}
        height={480}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          imageRendering: 'pixelated',
          zIndex: 0,
          opacity: 0.7,
        }}
      />

      {/* パーティクル (sparkles) */}
      {sparkles.map((sp, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${sp.x}%`,
          top: `${sp.y}%`,
          width: sp.size,
          height: sp.size,
          borderRadius: '50%',
          background: '#d0c8a0',
          animation: `titleSparkle ${sp.duration}s ease infinite`,
          animationDelay: `${sp.delay}s`,
          zIndex: 1,
          pointerEvents: 'none',
        }} />
      ))}

      {/* コンテンツ */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginBottom: 30 }}>
        <div style={{ fontSize: 14, color: '#c0b8a0', marginBottom: 8, letterSpacing: 2 }}>
          Pip Socket Chronicle
        </div>

        {/* タイトル文字: 1文字ずつフェードイン */}
        <h1 style={{
          fontSize: 26, color: '#f0e8d0',
          lineHeight: 1.5,
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          margin: 0,
        }}>
          {TITLE_TEXT.split('').map((char, i) => (
            <span key={i} style={{
              display: 'inline-block',
              opacity: titleReady ? 1 : 0,
              animation: titleReady ? `titleLetterIn 0.4s ease ${i * 0.06}s both` : 'none',
            }}>
              {char === '・' ? <span style={{ margin: '0 2px' }}>{char}</span> : char}
            </span>
          ))}
        </h1>

        {/* ダイスアニメーション */}
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 8 }}>
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} style={{
              width: 28, height: 28,
              background: '#f0e8d0',
              border: '2px solid #a09070',
              borderRadius: 3,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 'bold', color: '#3a2a1a',
              animation: `titleDiceRoll ${1.5 + n * 0.3}s linear infinite`,
              animationDelay: `${n * 0.2}s`,
            }}>
              {n}
            </div>
          ))}
        </div>

        <p style={{ color: '#a09880', fontSize: 12, marginTop: 16 }}>
          モンスターを倒してダイスに封印せよ
        </p>
      </div>

      {/* ボタン */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 280 }}>
        <button className="rpg-btn rpg-btn-primary" onClick={() => handleNewGame('new')}>
          はじめから
        </button>
        <button className="rpg-btn" onClick={() => handleNewGame('skip')} style={{ fontSize: 11 }}>
          チュートリアルスキップ
        </button>
        <button className="rpg-btn"
          onClick={handleContinue}
          style={{ opacity: hasSave ? 1 : 0.4 }}
          disabled={!hasSave || loading}
        >
          {loading ? '読み込み中...' : 'つづきから'}
        </button>
      </div>

      {/* Press to Start パルステキスト */}
      <div style={{
        position: 'relative', zIndex: 2,
        marginTop: 20,
        fontSize: 12, color: '#a09880', letterSpacing: 3,
        animation: 'titlePulse 2s ease infinite',
      }}>
        ― Press to Start ―
      </div>

      {/* 確認ダイアログ */}
      {confirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#f5f0e8', border: '2px solid #705828', borderRadius: 8,
            padding: 20, maxWidth: 280, textAlign: 'center',
          }}>
            <div style={{ fontSize: 13, color: '#3a2a1a', fontWeight: 'bold', marginBottom: 12 }}>
              セーブデータが存在します
            </div>
            <div style={{ fontSize: 11, color: '#6a5a4a', marginBottom: 16 }}>
              はじめからプレイすると<br />現在のセーブデータは上書きされます。<br />本当によろしいですか？
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="rpg-btn"
                style={{ flex: 1 }}
                onClick={() => setConfirm(null)}
              >
                やめる
              </button>
              <button
                className="rpg-btn rpg-btn-danger"
                style={{ flex: 1 }}
                onClick={() => {
                  setConfirm(null);
                  confirm === 'new' ? startTutorial() : initNewGame();
                }}
              >
                はじめる
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 2, marginTop: 30, fontSize: 10, color: '#706858' }}>
        v1.1.0
      </div>
    </div>
  );
}
