import { useRef, useEffect, useCallback, useState } from 'react';
import { useGameStore, type Screen } from '../../stores/gameStore';

// ==============================
// Canvas設定
// ==============================
const W = 320;
const H = 520;

const GRASS = '#88a848';
const GRASS2 = '#80a040';
const GRASS3 = '#90b050';
const PATH = '#c8b890';
const PATH_EDGE = '#b8a880';

// ==============================
// 建物
// ==============================
interface Building {
  id: string;
  label: string;
  sub: string;
  screen: Screen;
  x: number; y: number; w: number; h: number;
  draw: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => void;
  disabled?: boolean;
}

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color; ctx.fillRect(x, y, w, h);
}

// --- ダンジョン: 石造りの門 ---
function drawDungeon(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  rect(ctx, x, y + 8, w, h - 8, '#707068');
  rect(ctx, x + 3, y + 11, w - 6, h - 14, '#888078');
  // アーチ門
  rect(ctx, x + w / 2 - 10, y + 18, 20, h - 18, '#2a2420');
  rect(ctx, x + w / 2 - 7, y + 20, 14, h - 22, '#3a3430');
  // 松明
  rect(ctx, x + 6, y + 2, 5, 6, '#d06030');
  rect(ctx, x + 7, y, 3, 3, '#e0a030');
  rect(ctx, x + w - 11, y + 2, 5, 6, '#d06030');
  rect(ctx, x + w - 10, y, 3, 3, '#e0a030');
  // 煉瓦ライン
  rect(ctx, x, y + 8, w, 2, '#606058');
  rect(ctx, x, y + 20, w, 1, '#606058');
}

// --- 闘技場 ---
function drawArena(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  rect(ctx, x, y + 12, w, h - 12, '#a09888');
  rect(ctx, x + 3, y + 15, w - 6, h - 18, '#b0a898');
  // 柱
  for (let i = 0; i < 5; i++) {
    rect(ctx, x + 5 + i * ((w - 14) / 4), y + 6, 5, h - 12, '#c8c0b0');
    rect(ctx, x + 6 + i * ((w - 14) / 4), y + 6, 3, h - 12, '#d0c8b8');
  }
  // 屋根
  rect(ctx, x - 2, y, w + 4, 8, '#807068');
  rect(ctx, x, y + 2, w, 4, '#908070');
  // 旗
  rect(ctx, x + w / 2 - 2, y - 10, 3, 12, '#705030');
  rect(ctx, x + w / 2, y - 10, 8, 6, '#c04838');
  // 門
  rect(ctx, x + w / 2 - 8, y + h - 16, 16, 16, '#504838');
}

// --- 鍛冶屋 ---
function drawForge(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // 壁
  rect(ctx, x, y + 10, w, h - 10, '#906848');
  rect(ctx, x + 3, y + 13, w - 6, h - 16, '#a07858');
  // 屋根
  rect(ctx, x - 3, y + 4, w + 6, 8, '#604030');
  rect(ctx, x - 1, y + 6, w + 2, 4, '#705040');
  // 煙突
  rect(ctx, x + w - 14, y - 10, 8, 16, '#686058');
  rect(ctx, x + w - 12, y - 14, 4, 4, '#b0a89080');
  rect(ctx, x + w - 11, y - 18, 3, 3, '#b0a89050');
  // ドア
  rect(ctx, x + w / 2 - 7, y + h - 18, 14, 18, '#503820');
  rect(ctx, x + w / 2 - 5, y + h - 16, 10, 14, '#604830');
  // アンビル
  rect(ctx, x + 5, y + h - 8, 10, 4, '#484848');
  rect(ctx, x + 7, y + h - 12, 6, 4, '#585858');
  // 看板
  rect(ctx, x + w - 8, y + 16, 2, 12, '#705030');
  rect(ctx, x + w - 14, y + 14, 10, 8, '#c0a870');
}

// --- ダイス工房 ---
function drawDiceShop(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  rect(ctx, x, y + 8, w, h - 8, '#506880');
  rect(ctx, x + 3, y + 11, w - 6, h - 14, '#607890');
  // 屋根
  rect(ctx, x - 2, y + 2, w + 4, 8, '#405060');
  // 窓
  rect(ctx, x + 6, y + 16, 10, 8, '#a0c8e0');
  rect(ctx, x + 7, y + 17, 8, 6, '#b0d8f0');
  rect(ctx, x + w - 16, y + 16, 10, 8, '#a0c8e0');
  rect(ctx, x + w - 15, y + 17, 8, 6, '#b0d8f0');
  // ドア
  rect(ctx, x + w / 2 - 6, y + h - 16, 12, 16, '#304050');
  // ダイスマーク
  rect(ctx, x + w / 2 - 3, y + h - 12, 6, 6, '#e0d8c0');
  rect(ctx, x + w / 2, y + h - 9, 2, 2, '#304050');
}

// --- ショップ ---
function drawShop(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  rect(ctx, x, y + 12, w, h - 12, '#a08060');
  rect(ctx, x + 3, y + 15, w - 6, h - 18, '#b09070');
  // オーニング
  rect(ctx, x - 3, y + 4, w + 6, 10, '#c04838');
  for (let i = 0; i < 6; i++) {
    rect(ctx, x - 3 + i * ((w + 6) / 6), y + 10, (w + 6) / 12, 4, '#a03020');
  }
  // カウンター
  rect(ctx, x + 4, y + 20, w - 8, 6, '#806040');
  // 商品
  rect(ctx, x + 8, y + 16, 6, 5, '#e0c050');
  rect(ctx, x + 18, y + 16, 6, 5, '#50a0c0');
  rect(ctx, x + w - 14, y + 16, 6, 5, '#80c060');
}

// --- ガチャ祠 ---
function drawGacha(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // 台座
  rect(ctx, x + 4, y + h - 14, w - 8, 14, '#787070');
  rect(ctx, x + 6, y + h - 12, w - 12, 10, '#888080');
  // 柱
  rect(ctx, x + 6, y + 8, 6, h - 16, '#787070');
  rect(ctx, x + w - 12, y + 8, 6, h - 16, '#787070');
  // 屋根
  rect(ctx, x, y + 2, w, 8, '#605080');
  rect(ctx, x + 2, y + 4, w - 4, 4, '#706090');
  // クリスタル
  rect(ctx, x + w / 2 - 6, y + 14, 12, 16, '#9070c0');
  rect(ctx, x + w / 2 - 4, y + 16, 8, 12, '#b090e0');
  rect(ctx, x + w / 2 - 2, y + 18, 4, 8, '#c8b0f0');
}

// --- 図鑑 ---
function drawCodex(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  rect(ctx, x, y + 6, w, h - 6, '#706050');
  rect(ctx, x + 3, y + 9, w - 6, h - 12, '#806858');
  // 屋根
  rect(ctx, x - 2, y, w + 4, 8, '#504030');
  // 本棚（窓の代わり）
  rect(ctx, x + 5, y + 12, 12, 10, '#d0c0a0');
  rect(ctx, x + 6, y + 13, 2, 8, '#c04030');
  rect(ctx, x + 9, y + 13, 2, 8, '#3070a0');
  rect(ctx, x + 12, y + 13, 2, 8, '#508040');
  // ドア
  rect(ctx, x + w / 2 - 5, y + h - 14, 10, 14, '#403020');
}

// --- 掲示板 ---
function drawEvent(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // 柱
  rect(ctx, x + 6, y + 8, 4, h - 8, '#705030');
  rect(ctx, x + w - 10, y + 8, 4, h - 8, '#705030');
  // ボード
  rect(ctx, x + 2, y + 4, w - 4, h - 16, '#c0a870');
  rect(ctx, x + 4, y + 6, w - 8, h - 20, '#b09850');
  // メモ
  rect(ctx, x + 8, y + 10, 10, 8, '#f0e8d0');
  rect(ctx, x + w - 18, y + 10, 10, 8, '#e8e0c8');
  rect(ctx, x + 12, y + 22, 12, 6, '#f0e0c0');
}

const BUILDINGS: Building[] = [
  { id: 'dungeon', label: 'DUNGEON', sub: 'ダンジョン', screen: 'dungeon', x: 16, y: 50, w: 56, h: 48, draw: drawDungeon },
  { id: 'arena', label: 'ARENA', sub: '決闘場', screen: 'pvp', x: 192, y: 40, w: 64, h: 52, draw: drawArena },
  { id: 'forge', label: 'FORGE', sub: '鍛冶屋', screen: 'forge', x: 36, y: 170, w: 54, h: 44, draw: drawForge },
  { id: 'dice', label: 'DICE', sub: 'ダイス装備', screen: 'dice-editor', x: 200, y: 168, w: 54, h: 44, draw: drawDiceShop },
  { id: 'shop', label: 'SHOP', sub: 'ショップ', screen: 'shop', x: 16, y: 288, w: 56, h: 42, draw: drawShop },
  { id: 'gacha', label: 'GACHA', sub: 'ガチャ', screen: 'gacha', x: 200, y: 286, w: 52, h: 44, draw: drawGacha },
  { id: 'codex', label: 'BOOK', sub: '図鑑', screen: 'codex', x: 40, y: 400, w: 48, h: 38, draw: drawCodex },
  { id: 'event', label: 'EVENT', sub: 'イベント', screen: 'town', x: 204, y: 398, w: 48, h: 38, draw: drawEvent, disabled: true },
];

// ==============================
// 描画ヘルパー
// ==============================
function drawPaths(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = PATH;
  // 水平
  ctx.fillRect(72, 78, 120, 6);
  ctx.fillRect(90, 194, 110, 6);
  ctx.fillRect(72, 310, 128, 6);
  ctx.fillRect(88, 420, 124, 6);
  // 垂直
  ctx.fillRect(48, 98, 6, 72);
  ctx.fillRect(222, 92, 6, 76);
  ctx.fillRect(48, 214, 6, 74);
  ctx.fillRect(228, 212, 6, 74);
  ctx.fillRect(48, 330, 6, 70);
  ctx.fillRect(228, 330, 6, 68);
  // 中央縦
  ctx.fillRect(155, 194, 6, 116);
  // エッジ
  ctx.fillStyle = PATH_EDGE;
  ctx.fillRect(72, 77, 120, 1);
  ctx.fillRect(72, 84, 120, 1);
}

function drawDecorations(ctx: CanvasRenderingContext2D) {
  // 木
  const trees: [number, number][] = [[110, 55], [280, 80], [8, 140], [155, 145], [280, 240], [140, 340], [10, 360], [270, 370], [95, 460]];
  for (const [tx, ty] of trees) {
    rect(ctx, tx + 5, ty + 14, 4, 10, '#604828');
    rect(ctx, tx, ty, 14, 15, '#407028');
    rect(ctx, tx + 2, ty + 2, 10, 11, '#508830');
    rect(ctx, tx + 4, ty + 4, 6, 7, '#609838');
  }

  // 花
  const flowers: [number, number, string][] = [
    [85, 120, '#d87088'], [170, 100, '#e8c848'], [120, 260, '#8888d0'],
    [50, 250, '#d87088'], [265, 310, '#e8c848'], [180, 450, '#d87088'],
  ];
  for (const [fx, fy, fc] of flowers) {
    rect(ctx, fx, fy, 4, 4, fc);
    rect(ctx, fx + 1, fy + 4, 2, 3, '#508830');
  }

  // 岩
  rect(ctx, 148, 100, 10, 6, '#989088');
  rect(ctx, 250, 260, 8, 5, '#908880');
  rect(ctx, 90, 380, 12, 6, '#888078');

  // 井戸
  rect(ctx, 142, 230, 20, 14, '#808078');
  rect(ctx, 144, 232, 16, 10, '#607060');
  rect(ctx, 146, 234, 12, 6, '#4080a0');
  rect(ctx, 145, 224, 14, 6, '#705030');
  rect(ctx, 149, 218, 2, 6, '#705030');
  rect(ctx, 155, 218, 2, 6, '#705030');

  // NPC
  const npcs: [number, number, string][] = [[115, 170, '#4060a0'], [180, 300, '#906848'], [70, 340, '#408050']];
  for (const [nx, ny, nc] of npcs) {
    rect(ctx, nx, ny, 8, 6, '#d0b898');  // 頭
    rect(ctx, nx - 1, ny + 6, 10, 10, nc); // 体
    rect(ctx, nx, ny + 16, 3, 5, '#504030'); // 足
    rect(ctx, nx + 5, ny + 16, 3, 5, '#504030');
  }

  // 猫
  rect(ctx, 170, 240, 8, 5, '#d0a040');
  rect(ctx, 166, 238, 6, 5, '#d0a040');
  rect(ctx, 167, 239, 1, 1, '#302018');
  rect(ctx, 170, 239, 1, 1, '#302018');
  rect(ctx, 178, 242, 5, 2, '#d0a040');
}

function drawGrass(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = GRASS;
  ctx.fillRect(0, 0, W, H);
  // テクスチャ
  for (let i = 0; i < 200; i++) {
    ctx.fillStyle = i % 3 === 0 ? GRASS2 : GRASS3;
    const gx = (i * 37 + 13) % W;
    const gy = (i * 53 + 7) % H;
    ctx.fillRect(gx, gy, 2, 1);
  }
}

// ==============================
// メインコンポーネント
// ==============================
export function TownScreen() {
  const { setScreen, playerMaxHp, playerLevel, gold, gems, gemFragments, currentChapter, save } = useGameStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [saveMsg, setSaveMsg] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    drawGrass(ctx);
    drawPaths(ctx);
    drawDecorations(ctx);

    for (const b of BUILDINGS) {
      if (b.disabled) ctx.globalAlpha = 0.5;
      b.draw(ctx, b.x, b.y, b.w, b.h);
      ctx.globalAlpha = 1;
    }
    // テキストはCanvas外のHTML overlayで描画
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    const scaleX = W / r.width;
    const scaleY = H / r.height;
    const x = (e.clientX - r.left) * scaleX;
    const y = (e.clientY - r.top) * scaleY;

    for (const b of BUILDINGS) {
      // ヒットエリアを少し広げる（ラベル含む）
      if (x >= b.x - 8 && x <= b.x + b.w + 8 && y >= b.y - 16 && y <= b.y + b.h + 14) {
        if (b.disabled) return;
        setScreen(b.screen);
        return;
      }
    }
  }, [setScreen]);

  const handleSave = useCallback(async () => {
    await save();
    setSaveMsg(true);
    setTimeout(() => setSaveMsg(false), 1500);
  }, [save]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: GRASS, alignItems: 'center',
    }}>
      {/* マップコンテナ（Canvas + HTMLオーバーレイ） */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 400, flex: 1 }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onClick={handleClick}
          style={{
            width: '100%',
            height: '100%',
            imageRendering: 'pixelated',
            cursor: 'pointer',
            display: 'block',
          }}
        />

        {/* HTMLオーバーレイ: テキストラベル（ドット化されない） */}
        <div style={{
          position: 'absolute', inset: 0,
          pointerEvents: 'none',
        }}>
          {/* ロゴ */}
          <div style={{
            position: 'absolute', top: '1.5%', left: 0, right: 0,
            textAlign: 'center', fontFamily: "'DotGothic16', monospace",
          }}>
            <div style={{ fontSize: 12, fontWeight: 'bold', color: '#3a3a1a', letterSpacing: 1.5 }}>
              PIP SOCKET CHRONICLE
            </div>
            <div style={{ fontSize: 9, color: '#606050', marginTop: 1 }}>
              Chapter {currentChapter}
            </div>
          </div>

          {/* 建物ラベル */}
          {BUILDINGS.map(b => {
            // Canvas座標→%座標に変換
            const left = ((b.x + b.w / 2) / W) * 100;
            const topLabel = ((b.y - 4) / H) * 100;
            const topSub = ((b.y + b.h + 2) / H) * 100;
            return (
              <div key={b.id}>
                {/* メインラベル */}
                <div style={{
                  position: 'absolute',
                  left: `${left}%`, top: `${topLabel}%`,
                  transform: 'translate(-50%, -100%)',
                  background: '#4a3828e0', color: '#f0e8d0',
                  padding: '1px 6px', borderRadius: 2,
                  fontSize: 10, fontWeight: 'bold', fontFamily: "'DotGothic16', monospace",
                  letterSpacing: 0.5, whiteSpace: 'nowrap',
                  opacity: b.disabled ? 0.5 : 1,
                }}>
                  {b.label}
                </div>
                {/* サブラベル */}
                <div style={{
                  position: 'absolute',
                  left: `${left}%`, top: `${topSub}%`,
                  transform: 'translateX(-50%)',
                  color: '#4a3828', fontSize: 9,
                  fontFamily: "'DotGothic16', monospace",
                  whiteSpace: 'nowrap',
                  opacity: b.disabled ? 0.4 : 0.8,
                }}>
                  {b.sub}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ステータスバー */}
      <div style={{
        width: '100%', maxWidth: 400,
        background: 'rgba(210, 200, 170, 0.92)',
        borderTop: '2px solid #a89870',
        padding: '6px 12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 11, color: '#3a3018', fontFamily: "'DotGothic16', monospace",
      }}>
        <span>Lv{playerLevel}</span>
        <span>HP {playerMaxHp}</span>
        <span style={{ color: '#705828', fontWeight: 'bold' }}>{gold}G</span>
        <span style={{ color: '#4070a0' }}>{gems}Gem({gemFragments})</span>
        <span>Ch.{currentChapter}</span>
        <span
          onClick={handleSave}
          style={{
            cursor: 'pointer', padding: '2px 8px', pointerEvents: 'auto',
            background: saveMsg ? '#b0c8a0' : '#c8c0a8',
            border: '1px solid #a09878', borderRadius: 2,
            color: saveMsg ? '#305028' : '#605838', fontWeight: 'bold',
          }}
        >
          {saveMsg ? 'OK!' : 'SAVE'}
        </span>
      </div>
    </div>
  );
}
