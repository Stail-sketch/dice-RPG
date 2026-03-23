export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // single kanji or emoji character
  check: (state: any) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-win', name: '初勝利', description: '初めてバトルに勝利した', icon: '剣', check: (s) => s.clearedDungeons.length > 0 || s.pvpWins > 0 },
  { id: 'collector-5', name: '収集家', description: '5種類のモンスターを捕獲', icon: '箱', check: (s) => s.capturedMonsters.length >= 5 },
  { id: 'collector-15', name: '大収集家', description: '15種類のモンスターを捕獲', icon: '宝', check: (s) => s.capturedMonsters.length >= 15 },
  { id: 'full-party', name: 'フルパーティ', description: '3体のダイスをパーティに編成', icon: '隊', check: (s) => s.party.filter((id: string) => id !== '').length >= 3 },
  { id: 'rich', name: '金持ち', description: '5000G以上所持', icon: '金', check: (s) => s.gold >= 5000 },
  { id: 'ch1-clear', name: '第1章クリア', description: '第1章のボスを撃破', icon: '壱', check: (s) => s.currentChapter >= 2 },
  { id: 'ch3-clear', name: '第3章クリア', description: '第3章のボスを撃破', icon: '参', check: (s) => s.currentChapter >= 4 },
  { id: 'ch7-clear', name: '全章制覇', description: '最終章をクリア', icon: '覇', check: (s) => s.currentChapter >= 7 && s.capturedMonsters.length >= 25 },
  { id: 'pvp-3', name: '闘士', description: 'PvPで3勝', icon: '闘', check: (s) => s.pvpWins >= 3 },
  { id: 'pvp-10', name: '闘将', description: 'PvPで10勝', icon: '将', check: (s) => s.pvpWins >= 10 },
  { id: 'lv10', name: '成長', description: 'レベル10に到達', icon: '昇', check: (s) => s.playerLevel >= 10 },
  { id: 'forge-master', name: '鍛冶名人', description: 'ソケットをゴールドに強化', icon: '鍛', check: (s) => {
    const checkDice = (d: any) => d.customFaces?.some((f: any) => f.sockets?.some((sk: any) => sk.socketTier === 'gold'));
    return checkDice(s.protagonistDice) || s.ownedDice?.some(checkDice);
  }},
];
