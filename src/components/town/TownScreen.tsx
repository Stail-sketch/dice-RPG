import { useRef, useEffect, useCallback, useState } from 'react';
import { useGameStore, type Screen } from '../../stores/gameStore';
import { AchievementPanel } from './AchievementPanel';

const GAME_TIPS: string[] = [
  'ダイスの目が小さいほど出やすい。面1は23%、面6は10%の確率。',
  '★が高いモンスターほど固有スキルにレアリティ倍率がかかる！',
  '同じ属性のスキルを1面に集めるとシナジー倍率がアップ！',
  'カスタム面のソケットは鍛冶屋でbronze→silver→goldに強化できる。',
  '3体のダイスが同じ属性の面を出すとクロスダイスシナジーが発動！',
  'ヒーローダイスは全ソケットgold。属性も自由に変更できる。',
  '毒や燃焼は毎ターンダメージを与え続ける。長期戦で有利！',
  'シールドスキルは一定ターン攻撃を軽減する。ボス戦で重宝する。',
  'マジックダイスはチャージゲージで使える特殊能力。装備を忘れずに！',
  'ガチャの天井は★4が50回、★5が100回で確定。',
  '章が進むほど敵が強くなるが、報酬も増える。',
  'ボスを撃破すると次の章が解放される。',
  '高難度モードは全章クリア後に解放。敵HP2倍！',
  'セットボーナス：同じセットIDのルーンを複数装備すると攻撃力UP。',
  '属性相性は◎1.5倍、✕0.5倍。有利属性で戦おう！',
  '炎は氷と鋼に強く、雷と毒に弱い。',
  '氷は雷と毒に強く、炎と幻に弱い。',
  '雷は炎と幻に強く、氷と鋼に弱い。',
  '毒は炎と幻に強く、氷と鋼に弱い。',
  '鋼は氷と毒に強く、炎と雷に弱い。',
  '幻は氷と鋼に強く、炎と毒に弱い。',
  'バフとデバフはターン制限あり。タイミングを見計らって使おう。',
  '充填に回したダイスの出目がそのままチャージゲージに加算される。',
  '面6は出にくいが、6個のソケットにスキルを詰め込める！',
  'パッシブスキルは装備するだけで常に効果が発動する。',
  '呪いルーンは威力が高いが自分にもデバフがかかる。',
  'イベントダンジョンは毎日内容が変わる。報酬倍率を活用しよう！',
  'PvP闘技場ではポイントを貯めて報酬をゲット！',
  '素材が足りないときはショップで購入できる。',
  'ルーンは売却すると鍛冶石に変換される。',
  'ダイスは分解するとレアリティに応じた素材がもらえる。',
  'ソケット拡張で面のソケット数を増やせる。1ダイス3回まで。',
  'ボス戦ではマジックダイスが特に有効。チャージを溜めておこう。',
  '図鑑で全モンスターとスキルの情報を確認できる。',
  'レシピコンボ：異なる属性の組み合わせで特殊効果が発動！',
  '炎+氷=蒸気爆発！ 範囲ダメージ+命中率ダウン。',
  '氷+雷=氷雷！ 凍結した敵にクリティカル確定。',
  '反撃スキルは敵のダメージの一部を返す。防御型の強い味方。',
  '吸収スキルはダメージを与えつつHPを回復する。',
  '封印スキルは敵のスキルを1ターン無効化する。',
  'レベルが上がるとHPが50ずつ増加する。',
  '主人公ダイスをパーティに入れるとゴールド報酬が1.2倍に！',
  '実績を確認して目標を決めてプレイしよう。',
  '同じモンスターは何体でも捕獲できる。厳選も可能！',
  '鍛冶でソケットを強化すると、そのソケットのスキル威力が上がる。',
  '設定画面でBGMとSEの音量を個別に調整できる。',
  '全章クリア後の高難度モードでは敵のルーン装着率が100%！',
  'ウロボロスを初めて倒すとエンディングが見られる。',
  '赤い芋虫くんに話しかけると...何かいいことがあるかも？',
  'ダイスは運。でも構築は戦略。それがピップソケットの醍醐味！',
];

// ==============================
// Canvas設定
// ==============================
const W = 320;
const H = 520;

// ==============================
// チャプター別テーマ
// ==============================
interface ChapterTheme {
  grass: string; grass2: string; grass3: string;
  path: string; pathEdge: string;
  treeLeaf: string; treeLeaf2: string; treeLeaf3: string;
  skyTint?: string;
}

const CHAPTER_THEMES: Record<number, ChapterTheme> = {
  1: { grass: '#88a848', grass2: '#80a040', grass3: '#90b050', path: '#c8b890', pathEdge: '#b8a880', treeLeaf: '#407028', treeLeaf2: '#508830', treeLeaf3: '#609838' }, // default
  2: { grass: '#78a0a8', grass2: '#709898', grass3: '#80a8b0', path: '#c0c8d0', pathEdge: '#b0b8c0', treeLeaf: '#285870', treeLeaf2: '#308880', treeLeaf3: '#389890' }, // frost
  3: { grass: '#88a048', grass2: '#80a040', grass3: '#98b050', path: '#c8c090', pathEdge: '#b8b080', treeLeaf: '#507028', treeLeaf2: '#608830', treeLeaf3: '#6a9838' }, // volt
  4: { grass: '#607848', grass2: '#587040', grass3: '#688050', path: '#a0a870', pathEdge: '#909868', treeLeaf: '#306028', treeLeaf2: '#387030', treeLeaf3: '#408038' }, // venom
  5: { grass: '#808878', grass2: '#788070', grass3: '#889080', path: '#b0b0a8', pathEdge: '#a0a098', treeLeaf: '#506850', treeLeaf2: '#607060', treeLeaf3: '#687868' }, // alloy
  6: { grass: '#7878a0', grass2: '#707098', grass3: '#8080a8', path: '#b8b0c8', pathEdge: '#a8a0b8', treeLeaf: '#405080', treeLeaf2: '#485888', treeLeaf3: '#506090' }, // mirage
  7: { grass: '#906050', grass2: '#885848', grass3: '#986858', path: '#c0a898', pathEdge: '#b09888', treeLeaf: '#604028', treeLeaf2: '#684830', treeLeaf3: '#705038' }, // final
};

const CHAPTER_DISPLAY: Record<number, string> = {
  1: '炎の洞窟', 2: '氷結の峡谷', 3: '雷鳴の塔', 4: '毒沼の森', 5: '鋼鉄の遺跡', 6: '幻影の神殿', 7: '運命の回廊',
};

function getTheme(chapter: number): ChapterTheme {
  return CHAPTER_THEMES[chapter] || CHAPTER_THEMES[1];
}

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
  { id: 'dungeon', label: '探索', sub: 'ダンジョン', screen: 'dungeon', x: 16, y: 50, w: 56, h: 48, draw: drawDungeon },
  { id: 'arena', label: '闘技場', sub: '決闘場', screen: 'pvp', x: 192, y: 40, w: 64, h: 52, draw: drawArena },
  { id: 'forge', label: '鍛冶', sub: '鍛冶屋', screen: 'forge', x: 36, y: 170, w: 54, h: 44, draw: drawForge },
  { id: 'dice', label: '装備', sub: 'ダイス装備', screen: 'dice-editor', x: 200, y: 168, w: 54, h: 44, draw: drawDiceShop },
  { id: 'shop', label: '商店', sub: 'ショップ', screen: 'shop', x: 16, y: 288, w: 56, h: 42, draw: drawShop },
  { id: 'gacha', label: '召喚', sub: 'ガチャ', screen: 'gacha', x: 200, y: 286, w: 52, h: 44, draw: drawGacha },
  { id: 'codex', label: '図鑑', sub: '図鑑', screen: 'codex', x: 40, y: 400, w: 48, h: 38, draw: drawCodex },
  { id: 'event', label: '依頼', sub: 'イベント', screen: 'event', x: 204, y: 398, w: 48, h: 38, draw: drawEvent },
];

// ==============================
// 描画ヘルパー
// ==============================
function drawPaths(ctx: CanvasRenderingContext2D, theme: ChapterTheme) {
  ctx.fillStyle = theme.path;
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
  ctx.fillStyle = theme.pathEdge;
  ctx.fillRect(72, 77, 120, 1);
  ctx.fillRect(72, 84, 120, 1);
}

function drawDecorations(ctx: CanvasRenderingContext2D, theme: ChapterTheme) {
  // 木
  const trees: [number, number][] = [[110, 55], [280, 80], [8, 140], [155, 145], [280, 240], [140, 340], [10, 360], [270, 370], [95, 460]];
  for (const [tx, ty] of trees) {
    rect(ctx, tx + 5, ty + 14, 4, 10, '#604828');
    rect(ctx, tx, ty, 14, 15, theme.treeLeaf);
    rect(ctx, tx + 2, ty + 2, 10, 11, theme.treeLeaf2);
    rect(ctx, tx + 4, ty + 4, 6, 7, theme.treeLeaf3);
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

  // テレビ掲示板
  rect(ctx, 128, 250, 24, 18, '#404040');  // frame
  rect(ctx, 130, 252, 20, 12, '#60a0d0');  // screen (blue glow)
  rect(ctx, 131, 253, 18, 10, '#80c0e0');  // screen inner
  rect(ctx, 138, 264, 4, 4, '#505050');    // stand
  rect(ctx, 134, 268, 12, 2, '#404040');   // base
  // antenna
  rect(ctx, 136, 247, 2, 4, '#505050');
  rect(ctx, 142, 247, 2, 4, '#505050');
  rect(ctx, 134, 246, 2, 2, '#606060');
  rect(ctx, 144, 246, 2, 2, '#606060');

  // 赤い芋虫くん
  rect(ctx, 158, 260, 5, 5, '#c04030');  // head
  rect(ctx, 157, 261, 1, 1, '#201010');  // eye
  rect(ctx, 162, 261, 1, 1, '#201010');  // eye
  rect(ctx, 163, 258, 5, 5, '#b03828');  // body1
  rect(ctx, 168, 260, 5, 5, '#c04030');  // body2
  rect(ctx, 173, 258, 4, 5, '#b03828');  // body3 (tail)
  rect(ctx, 159, 257, 1, 3, '#c04030');  // antenna left
  rect(ctx, 161, 257, 1, 3, '#c04030');  // antenna right
  rect(ctx, 159, 256, 1, 1, '#e06050');  // antenna tip
  rect(ctx, 161, 256, 1, 1, '#e06050');  // antenna tip
}

function drawGrass(ctx: CanvasRenderingContext2D, theme: ChapterTheme) {
  ctx.fillStyle = theme.grass;
  ctx.fillRect(0, 0, W, H);
  // テクスチャ
  for (let i = 0; i < 200; i++) {
    ctx.fillStyle = i % 3 === 0 ? theme.grass2 : theme.grass3;
    const gx = (i * 37 + 13) % W;
    const gy = (i * 53 + 7) % H;
    ctx.fillRect(gx, gy, 2, 1);
  }
}

// ==============================
// メインコンポーネント
// ==============================
export function TownScreen() {
  const { setScreen, playerMaxHp, playerLevel, playerExp, getExpToNext, gold, gems, gemFragments, currentChapter, battleChapter, save } = useGameStore();
  // 町のテーマは直近で選んだ章に連動（battleChapterがあればそれを優先）
  const themeChapter = battleChapter || currentChapter;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [saveMsg, setSaveMsg] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [currentTip, setCurrentTip] = useState('');

  const theme = getTheme(themeChapter);

  useEffect(() => {
    if (showTip) {
      setCurrentTip(GAME_TIPS[Math.floor(Math.random() * GAME_TIPS.length)]);
    }
  }, [showTip]);

  // ベースCanvas描画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    drawGrass(ctx, theme);
    drawPaths(ctx, theme);
    drawDecorations(ctx, theme);

    for (const b of BUILDINGS) {
      if (b.disabled) ctx.globalAlpha = 0.5;
      b.draw(ctx, b.x, b.y, b.w, b.h);
      ctx.globalAlpha = 1;
    }
  }, [themeChapter, theme]);

  // アンビエントアニメーション（オーバーレイCanvas）
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    let frame = 0;

    // 煙パーティクル状態
    const smokeParticles = [
      { x: 0, y: 0, life: 0 },
      { x: 0, y: 0, life: 0 },
      { x: 0, y: 0, life: 0 },
    ];
    // 鍛冶屋の煙突位置 (forge: x=36, y=170, w=54)
    const chimneyX = 36 + 54 - 12; // x + w - 12
    const chimneyY = 170 - 18;     // y - 18

    // チャプター別パーティクル
    const chapterParticles: { x: number; y: number; vy: number; vx: number; life: number; maxLife: number }[] = [];
    const MAX_PARTICLES = 12;

    function spawnChapterParticle() {
      if (chapterParticles.length >= MAX_PARTICLES) return;
      const ch = themeChapter;
      let p = { x: 0, y: 0, vy: 0, vx: 0, life: 0, maxLife: 16 };
      if (ch === 2) { // snow
        p = { x: Math.floor(Math.random() * W), y: -2, vy: 1.5, vx: (Math.random() - 0.5) * 0.5, life: 0, maxLife: Math.floor(H / 1.5) };
      } else if (ch === 3) { // lightning flicker (on dungeon building)
        p = { x: 16 + Math.floor(Math.random() * 56), y: 50 + Math.floor(Math.random() * 48), vy: 0, vx: 0, life: 0, maxLife: 2 };
      } else if (ch === 4) { // green fog
        p = { x: Math.floor(Math.random() * W), y: H - 20 + Math.floor(Math.random() * 20), vy: -0.5, vx: (Math.random() - 0.5) * 1, life: 0, maxLife: 20 };
      } else if (ch === 5) { // metallic sparks near forge (forge: x=36, y=170)
        p = { x: 36 + Math.floor(Math.random() * 54), y: 170 + Math.floor(Math.random() * 30), vy: -1, vx: (Math.random() - 0.5) * 2, life: 0, maxLife: 6 };
      } else if (ch === 6) { // purple wisps near gacha shrine (gacha: x=200, y=286)
        p = { x: 200 + Math.floor(Math.random() * 52), y: 286 + Math.floor(Math.random() * 44), vy: -0.8, vx: (Math.random() - 0.5) * 1.5, life: 0, maxLife: 12 };
      } else if (ch === 7) { // red embers
        p = { x: Math.floor(Math.random() * W), y: H, vy: -1.2, vx: (Math.random() - 0.5) * 0.8, life: 0, maxLife: 18 };
      }
      if (ch >= 2) chapterParticles.push(p);
    }

    const interval = setInterval(() => {
      ctx.clearRect(0, 0, W, H);
      frame++;

      // 井戸の水キラキラ (井戸: x=146, y=234, w=12, h=6)
      const wellColors = ['#4080a0', '#50a0c0', '#3878a0', '#60b0d0'];
      for (let wy = 0; wy < 3; wy++) {
        for (let wx = 0; wx < 4; wx++) {
          const ci = (frame + wx + wy * 3) % wellColors.length;
          rect(ctx, 146 + wx * 3, 234 + wy * 2, 2, 2, wellColors[ci]);
        }
      }

      // 鍛冶屋の煙
      for (const sp of smokeParticles) {
        sp.life--;
        if (sp.life <= 0) {
          sp.x = chimneyX + Math.floor(Math.random() * 3);
          sp.y = chimneyY;
          sp.life = 8 + Math.floor(Math.random() * 6);
        }
        sp.y -= 1;
        sp.x += Math.random() > 0.5 ? 1 : -1;
        const alpha = Math.max(0.2, sp.life / 14);
        const gray = 140 + Math.floor((1 - alpha) * 60);
        ctx.fillStyle = `rgba(${gray},${gray},${gray},${alpha.toFixed(2)})`;
        ctx.fillRect(Math.floor(sp.x), Math.floor(sp.y), 3, 2);
      }

      // チャプター別エフェクト
      if (frame % 3 === 0) spawnChapterParticle();

      for (let i = chapterParticles.length - 1; i >= 0; i--) {
        const p = chapterParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        if (p.life >= p.maxLife) {
          chapterParticles.splice(i, 1);
          continue;
        }

        const ch = themeChapter;
        if (ch === 2) { // snow - white dots
          ctx.fillStyle = '#e8e8f0';
          ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 2, 2);
        } else if (ch === 3) { // lightning - yellow flash
          ctx.fillStyle = '#e0d040';
          ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 3, 2);
        } else if (ch === 4) { // green fog
          const fogAlpha = Math.max(0.1, 1 - p.life / p.maxLife);
          ctx.fillStyle = `rgba(80,140,60,${fogAlpha.toFixed(2)})`;
          ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 4, 2);
        } else if (ch === 5) { // metallic sparks
          ctx.fillStyle = p.life % 2 === 0 ? '#d0d0d0' : '#f0e880';
          ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 2, 2);
        } else if (ch === 6) { // purple wisps
          const wispAlpha = Math.max(0.15, 1 - p.life / p.maxLife);
          ctx.fillStyle = `rgba(160,100,220,${wispAlpha.toFixed(2)})`;
          ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 3, 3);
        } else if (ch === 7) { // red embers
          const emberAlpha = Math.max(0.2, 1 - p.life / p.maxLife);
          ctx.fillStyle = `rgba(200,80,40,${emberAlpha.toFixed(2)})`;
          ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 2, 2);
        }
      }
    }, 250); // ~4fps for pixel art feel

    return () => clearInterval(interval);
  }, [themeChapter]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    const scaleX = W / r.width;
    const scaleY = H / r.height;
    const x = (e.clientX - r.left) * scaleX;
    const y = (e.clientY - r.top) * scaleY;

    // テレビ掲示板のヒット判定
    if (x >= 125 && x <= 155 && y >= 245 && y <= 275) {
      setShowTip(true);
      return;
    }

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
      background: theme.grass, alignItems: 'center',
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

        {/* アンビエントアニメーション用オーバーレイCanvas */}
        <canvas
          ref={overlayRef}
          width={W}
          height={H}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            imageRendering: 'pixelated',
            pointerEvents: 'none',
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
              Chapter {themeChapter}
            </div>
            <div style={{ fontSize: 8, color: '#706858', marginTop: 1 }}>
              {CHAPTER_DISPLAY[themeChapter] || ''}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 70 }}>
          <span>Lv{playerLevel} HP{playerMaxHp}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: 8, color: '#998a78' }}>EXP</span>
            <div style={{ flex: 1, height: 5, background: '#d8d0c4', borderRadius: 1, border: '1px solid #c0b8a8', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (playerExp / getExpToNext()) * 100)}%`, height: '100%', background: '#a08830', borderRadius: 1, transition: 'width 0.4s' }} />
            </div>
            <span style={{ fontSize: 7, color: '#998a78' }}>{playerExp}/{getExpToNext()}</span>
          </div>
        </div>
        <span style={{ color: '#705828', fontWeight: 'bold' }}>{gold}G</span>
        <span style={{ color: '#4070a0' }}>{gems}Gem({gemFragments})</span>
        <span>Ch.{themeChapter}</span>
        <span
          onClick={handleSave}
          style={{
            cursor: 'pointer', padding: '2px 8px', pointerEvents: 'auto',
            background: saveMsg ? '#b0c8a0' : '#c8c0a8',
            border: '1px solid #a09878', borderRadius: 2,
            color: saveMsg ? '#305028' : '#605838', fontWeight: 'bold',
          }}
        >
          {saveMsg ? 'OK!' : '保存'}
        </span>
        <span
          onClick={() => setShowAchievements(true)}
          style={{
            cursor: 'pointer', padding: '2px 8px', pointerEvents: 'auto',
            background: '#c8c0a8',
            border: '1px solid #a09878', borderRadius: 2,
            color: '#605838', fontWeight: 'bold',
          }}
        >
          実績
        </span>
        <span
          onClick={() => setScreen('settings')}
          style={{
            cursor: 'pointer', padding: '2px 8px', pointerEvents: 'auto',
            background: '#c8c0a8',
            border: '1px solid #a09878', borderRadius: 2,
            color: '#605838', fontWeight: 'bold',
          }}
        >
          設定
        </span>
      </div>

      {showTip && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9998, cursor: 'pointer',
          }}
          onClick={() => setShowTip(false)}
        >
          <div className="rpg-panel" style={{
            maxWidth: 320, width: '85%', padding: '16px 20px',
            textAlign: 'center',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 12, fontWeight: 'bold', color: '#705828', marginBottom: 8 }}>
              豆知識テレビ
            </div>
            <div style={{
              fontSize: 12, lineHeight: 1.6, color: '#3a2a1a',
              padding: '8px 4px',
              background: '#e8e0d4', borderRadius: 4,
              border: '1px solid #d0c8b8',
            }}>
              {currentTip}
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button className="rpg-btn" style={{ margin: 0, padding: '6px 16px', fontSize: 11 }}
                onClick={() => {
                  setCurrentTip(GAME_TIPS[Math.floor(Math.random() * GAME_TIPS.length)]);
                }}>
                もう1つ
              </button>
              <button className="rpg-btn" style={{ margin: 0, padding: '6px 16px', fontSize: 11 }}
                onClick={() => setShowTip(false)}>
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {showAchievements && (
        <AchievementPanel onClose={() => setShowAchievements(false)} />
      )}
    </div>
  );
}
