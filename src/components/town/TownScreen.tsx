import { useRef, useEffect, useCallback, useState } from 'react';
import { useGameStore, type Screen } from '../../stores/gameStore';

// ==============================
// 定数
// ==============================
const W = 160; // 内部解像度
const H = 280;
const SCALE = 2;

const GRASS = '#a0b868';
const PATH_COLOR = '#c8b898';
const LABEL_BG = '#4a3828';
const LABEL_FG = '#f0e8d0';
const BADGE_COLOR = '#c04030';

// ==============================
// 建物定義
// ==============================
interface Building {
  id: string;
  name: string;
  screen: Screen;
  x: number; y: number; w: number; h: number;
  draw: (ctx: CanvasRenderingContext2D, x: number, y: number) => void;
  badge?: boolean;
}

// ドット絵の建物描画関数
function drawStoneGate(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // 石壁
  ctx.fillStyle = '#787068'; ctx.fillRect(x, y + 4, 28, 20);
  ctx.fillStyle = '#908878'; ctx.fillRect(x + 2, y + 6, 24, 16);
  // アーチ門
  ctx.fillStyle = '#3a3028'; ctx.fillRect(x + 8, y + 10, 12, 14);
  ctx.fillStyle = '#504838'; ctx.fillRect(x + 10, y + 10, 8, 12);
  // 松明
  ctx.fillStyle = '#c05030'; ctx.fillRect(x + 3, y + 2, 3, 3);
  ctx.fillStyle = '#c05030'; ctx.fillRect(x + 22, y + 2, 3, 3);
  ctx.fillStyle = '#705030'; ctx.fillRect(x + 4, y + 5, 1, 5);
  ctx.fillStyle = '#705030'; ctx.fillRect(x + 23, y + 5, 1, 5);
}

function drawSmithy(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // 壁
  ctx.fillStyle = '#906848'; ctx.fillRect(x, y + 6, 26, 18);
  ctx.fillStyle = '#a07858'; ctx.fillRect(x + 2, y + 8, 22, 14);
  // 屋根
  ctx.fillStyle = '#604030'; ctx.fillRect(x - 2, y + 2, 30, 6);
  // 煙突
  ctx.fillStyle = '#686058'; ctx.fillRect(x + 20, y - 4, 5, 8);
  // 煙
  ctx.fillStyle = '#c0b8a880'; ctx.fillRect(x + 21, y - 7, 3, 3);
  ctx.fillStyle = '#c0b8a850'; ctx.fillRect(x + 22, y - 10, 2, 2);
  // ドア
  ctx.fillStyle = '#503820'; ctx.fillRect(x + 9, y + 14, 8, 10);
  // アンビル
  ctx.fillStyle = '#505050'; ctx.fillRect(x + 1, y + 20, 6, 3);
}

function drawWorkshop(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // 壁（青系）
  ctx.fillStyle = '#506880'; ctx.fillRect(x, y + 4, 26, 18);
  ctx.fillStyle = '#607890'; ctx.fillRect(x + 2, y + 6, 22, 14);
  // 屋根
  ctx.fillStyle = '#405060'; ctx.fillRect(x - 1, y, 28, 6);
  // 窓
  ctx.fillStyle = '#a0c8e0'; ctx.fillRect(x + 4, y + 8, 5, 5);
  ctx.fillStyle = '#a0c8e0'; ctx.fillRect(x + 17, y + 8, 5, 5);
  // ドア
  ctx.fillStyle = '#304050'; ctx.fillRect(x + 10, y + 14, 6, 8);
  // ダイスマーク
  ctx.fillStyle = '#f0e8d0'; ctx.fillRect(x + 12, y + 16, 2, 2);
}

function drawMarket(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // カウンター
  ctx.fillStyle = '#906848'; ctx.fillRect(x, y + 10, 28, 14);
  // オーニング（赤）
  ctx.fillStyle = '#c04838'; ctx.fillRect(x - 2, y + 4, 32, 8);
  ctx.fillStyle = '#a03828'; ctx.fillRect(x, y + 6, 28, 4);
  // 商品
  ctx.fillStyle = '#e0c050'; ctx.fillRect(x + 4, y + 12, 4, 4);
  ctx.fillStyle = '#50a0c0'; ctx.fillRect(x + 12, y + 12, 4, 4);
  ctx.fillStyle = '#80c060'; ctx.fillRect(x + 20, y + 12, 4, 4);
}

function drawShrine(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // 台座
  ctx.fillStyle = '#787070'; ctx.fillRect(x + 2, y + 14, 22, 10);
  // 柱
  ctx.fillStyle = '#686060'; ctx.fillRect(x + 4, y + 4, 4, 14);
  ctx.fillStyle = '#686060'; ctx.fillRect(x + 18, y + 4, 4, 14);
  // 屋根
  ctx.fillStyle = '#605080'; ctx.fillRect(x, y, 26, 6);
  // クリスタル
  ctx.fillStyle = '#a080d0'; ctx.fillRect(x + 10, y + 8, 6, 8);
  ctx.fillStyle = '#c0a0e0'; ctx.fillRect(x + 11, y + 9, 4, 6);
}

function drawLibrary(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // 壁
  ctx.fillStyle = '#706050'; ctx.fillRect(x, y + 4, 22, 16);
  ctx.fillStyle = '#806858'; ctx.fillRect(x + 2, y + 6, 18, 12);
  // 屋根
  ctx.fillStyle = '#504030'; ctx.fillRect(x - 1, y, 24, 6);
  // 本の窓
  ctx.fillStyle = '#d0c0a0'; ctx.fillRect(x + 4, y + 7, 4, 6);
  ctx.fillStyle = '#c04030'; ctx.fillRect(x + 5, y + 8, 1, 4);
  ctx.fillStyle = '#3070a0'; ctx.fillRect(x + 6, y + 8, 1, 4);
  // ドア
  ctx.fillStyle = '#403020'; ctx.fillRect(x + 12, y + 12, 5, 8);
}

function drawBulletin(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // 柱
  ctx.fillStyle = '#705030'; ctx.fillRect(x + 4, y + 4, 3, 18);
  ctx.fillStyle = '#705030'; ctx.fillRect(x + 17, y + 4, 3, 18);
  // ボード
  ctx.fillStyle = '#c0a870'; ctx.fillRect(x + 2, y + 2, 20, 14);
  ctx.fillStyle = '#a08850'; ctx.fillRect(x + 3, y + 3, 18, 12);
  // メモ
  ctx.fillStyle = '#f0e8d0'; ctx.fillRect(x + 5, y + 5, 5, 4);
  ctx.fillStyle = '#e0d0b0'; ctx.fillRect(x + 12, y + 5, 5, 4);
  ctx.fillStyle = '#f0e0c0'; ctx.fillRect(x + 8, y + 10, 6, 3);
}

function drawColosseum(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // 基壇
  ctx.fillStyle = '#a09888'; ctx.fillRect(x, y + 12, 32, 16);
  ctx.fillStyle = '#b0a898'; ctx.fillRect(x + 2, y + 14, 28, 12);
  // 柱
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = '#c0b8a8'; ctx.fillRect(x + 4 + i * 8, y + 4, 3, 14);
  }
  // 屋根
  ctx.fillStyle = '#908070'; ctx.fillRect(x - 1, y, 34, 6);
  // 旗
  ctx.fillStyle = '#c04838'; ctx.fillRect(x + 14, y - 6, 4, 6);
  ctx.fillStyle = '#c04838'; ctx.fillRect(x + 16, y - 6, 4, 3);
  // 門
  ctx.fillStyle = '#504838'; ctx.fillRect(x + 12, y + 18, 8, 10);
}

const BUILDINGS: Building[] = [
  { id: 'dungeon', name: 'DUNGEON', screen: 'dungeon', x: 10, y: 30, w: 28, h: 24, draw: drawStoneGate },
  { id: 'arena', name: 'ARENA', screen: 'pvp', x: 100, y: 26, w: 32, h: 28, draw: drawColosseum },
  { id: 'forge', name: 'FORGE', screen: 'forge', x: 24, y: 90, w: 26, h: 24, draw: drawSmithy },
  { id: 'dice', name: 'DICE', screen: 'dice-editor', x: 108, y: 92, w: 26, h: 22, draw: drawWorkshop },
  { id: 'shop', name: 'SHOP', screen: 'shop', x: 10, y: 152, w: 28, h: 24, draw: drawMarket },
  { id: 'gacha', name: 'GACHA', screen: 'gacha', x: 106, y: 150, w: 26, h: 24, draw: drawShrine, badge: true },
  { id: 'book', name: 'BOOK', screen: 'codex', x: 22, y: 210, w: 22, h: 20, draw: drawLibrary },
  { id: 'event', name: 'EVENT', screen: 'town', x: 108, y: 212, w: 24, h: 22, draw: drawBulletin, badge: true },
];

// ==============================
// 装飾要素
// ==============================
function drawDecorations(ctx: CanvasRenderingContext2D) {
  // 木
  const trees = [[55, 46], [148, 70], [4, 130], [76, 170], [145, 200], [62, 240]];
  for (const [tx, ty] of trees) {
    ctx.fillStyle = '#705030'; ctx.fillRect(tx + 3, ty + 8, 2, 6);
    ctx.fillStyle = '#508030'; ctx.fillRect(tx, ty, 8, 9);
    ctx.fillStyle = '#608838'; ctx.fillRect(tx + 1, ty + 1, 6, 7);
  }

  // 花
  const flowers: [number, number, string][] = [[40, 68, '#d87088'], [130, 110, '#e0c050'], [90, 200, '#8080d0'], [28, 180, '#d87088'], [140, 164, '#e0c050']];
  for (const [fx, fy, fc] of flowers) {
    ctx.fillStyle = fc; ctx.fillRect(fx, fy, 3, 3);
    ctx.fillStyle = '#608838'; ctx.fillRect(fx + 1, fy + 3, 1, 2);
  }

  // 岩
  ctx.fillStyle = '#989088'; ctx.fillRect(82, 55, 6, 4);
  ctx.fillStyle = '#908880'; ctx.fillRect(125, 140, 5, 3);
  ctx.fillStyle = '#888078'; ctx.fillRect(50, 220, 7, 4);

  // 井戸
  ctx.fillStyle = '#888078'; ctx.fillRect(72, 120, 12, 8);
  ctx.fillStyle = '#687068'; ctx.fillRect(73, 121, 10, 6);
  ctx.fillStyle = '#3070a0'; ctx.fillRect(75, 123, 6, 3);
  // 屋根
  ctx.fillStyle = '#705030'; ctx.fillRect(74, 116, 10, 4);
  ctx.fillStyle = '#705030'; ctx.fillRect(77, 113, 1, 3);
  ctx.fillStyle = '#705030'; ctx.fillRect(80, 113, 1, 3);

  // NPC 1 (青服)
  ctx.fillStyle = '#d0b898'; ctx.fillRect(60, 100, 4, 4); // 頭
  ctx.fillStyle = '#4060a0'; ctx.fillRect(59, 104, 6, 6); // 体
  ctx.fillStyle = '#705030'; ctx.fillRect(60, 110, 2, 3); ctx.fillRect(63, 110, 2, 3); // 足

  // NPC 2 (茶服)
  ctx.fillStyle = '#d0b898'; ctx.fillRect(100, 170, 4, 4);
  ctx.fillStyle = '#906848'; ctx.fillRect(99, 174, 6, 6);
  ctx.fillStyle = '#504030'; ctx.fillRect(100, 180, 2, 3); ctx.fillRect(103, 180, 2, 3);

  // NPC 3 (緑服)
  ctx.fillStyle = '#d0b898'; ctx.fillRect(42, 200, 4, 4);
  ctx.fillStyle = '#508050'; ctx.fillRect(41, 204, 6, 6);
  ctx.fillStyle = '#305030'; ctx.fillRect(42, 210, 2, 3); ctx.fillRect(45, 210, 2, 3);

  // 猫
  ctx.fillStyle = '#d0a040'; ctx.fillRect(90, 130, 5, 3); // 体
  ctx.fillStyle = '#d0a040'; ctx.fillRect(88, 128, 3, 3); // 頭
  ctx.fillStyle = '#3a2a1a'; ctx.fillRect(88, 129, 1, 1); // 目
  ctx.fillStyle = '#d0a040'; ctx.fillRect(95, 131, 3, 1); // 尻尾
}

// ==============================
// パス描画
// ==============================
function drawPaths(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = PATH_COLOR;
  // 水平パス
  ctx.fillRect(38, 46, 62, 4);   // DUNGEON-ARENA間
  ctx.fillRect(50, 106, 58, 4);  // FORGE-DICE間
  ctx.fillRect(38, 168, 68, 4);  // SHOP-GACHA間
  ctx.fillRect(44, 224, 64, 4);  // BOOK-EVENT間
  // 垂直パス
  ctx.fillRect(30, 54, 4, 36);   // DUNGEON→FORGE
  ctx.fillRect(120, 54, 4, 38);  // ARENA→DICE
  ctx.fillRect(30, 110, 4, 42);  // FORGE→SHOP
  ctx.fillRect(120, 110, 4, 40); // DICE→GACHA
  ctx.fillRect(38, 172, 4, 38);  // SHOP→BOOK
  ctx.fillRect(120, 172, 4, 40); // GACHA→EVENT
  // 中央接続
  ctx.fillRect(78, 110, 4, 58);
}

// ==============================
// メインコンポーネント
// ==============================
export function TownScreen() {
  const { setScreen, playerMaxHp, gold, gems, currentChapter, save } = useGameStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pressed, setPressed] = useState<string | null>(null);

  // Canvas描画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    // 背景（草地）
    ctx.fillStyle = GRASS;
    ctx.fillRect(0, 0, W, H);

    // 草のテクスチャ（ランダムドット）
    ctx.fillStyle = '#98b060';
    for (let i = 0; i < 80; i++) {
      const gx = (i * 37 + 13) % W;
      const gy = (i * 53 + 7) % H;
      ctx.fillRect(gx, gy, 1, 1);
    }
    ctx.fillStyle = '#a8c070';
    for (let i = 0; i < 60; i++) {
      const gx = (i * 41 + 23) % W;
      const gy = (i * 47 + 11) % H;
      ctx.fillRect(gx, gy, 1, 1);
    }

    // パス
    drawPaths(ctx);

    // デコレーション
    drawDecorations(ctx);

    // 建物
    for (const b of BUILDINGS) {
      b.draw(ctx, b.x, b.y);

      // ラベル
      ctx.fillStyle = LABEL_BG;
      const labelW = b.name.length * 4 + 4;
      const lx = b.x + (b.w - labelW) / 2;
      ctx.fillRect(lx, b.y - 6, labelW, 7);
      ctx.fillStyle = LABEL_FG;
      ctx.font = '5px monospace';
      ctx.fillText(b.name, lx + 2, b.y - 1);

      // バッジ
      if (b.badge) {
        ctx.fillStyle = BADGE_COLOR;
        ctx.beginPath();
        ctx.arc(b.x + b.w - 1, b.y - 3, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ロゴ
    ctx.fillStyle = '#3a3a1a';
    ctx.font = 'bold 5px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PIP SOCKET CHRONICLE', W / 2, 10);
    ctx.textAlign = 'start';

  }, [pressed]); // pressedが変わったら再描画（クリック演出用）

  // タップ判定
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (rect.width / W);
    const y = (e.clientY - rect.top) / (rect.height / H);

    for (const b of BUILDINGS) {
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        setPressed(b.id);
        setTimeout(() => {
          setPressed(null);
          if (b.screen === 'pvp') return; // 準備中
          setScreen(b.screen);
        }, 120);
        return;
      }
    }
  }, [setScreen]);

  // セーブ
  const handleSave = useCallback(async () => {
    await save();
    setPressed('saved');
    setTimeout(() => setPressed(null), 1200);
  }, [save]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: GRASS, alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        onClick={handleClick}
        style={{
          width: W * SCALE,
          height: H * SCALE,
          imageRendering: 'pixelated',
          cursor: 'pointer',
        }}
      />

      {/* ステータスバー */}
      <div style={{
        width: W * SCALE,
        background: 'rgba(200, 190, 160, 0.88)',
        borderTop: '1px solid #a89870',
        padding: '4px 10px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 10, color: '#3a3018',
        fontFamily: 'monospace',
      }}>
        <span>HP {playerMaxHp}/{playerMaxHp}</span>
        <span style={{ color: '#705828' }}>{gold}G</span>
        <span style={{ color: '#4070a0' }}>{gems}Gem</span>
        <span>Ch.{currentChapter}</span>
        <span
          onClick={handleSave}
          style={{ cursor: 'pointer', color: pressed === 'saved' ? '#308050' : '#705828', fontWeight: 'bold' }}
        >
          {pressed === 'saved' ? 'SAVED!' : 'SAVE'}
        </span>
      </div>
    </div>
  );
}
