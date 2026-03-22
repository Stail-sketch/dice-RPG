import type { MonsterDice, SocketTier } from '../types';
import { FACE_DEFAULT_SOCKET_TIER } from '../types';

/**
 * カスタム面のソケット品質を面番号に応じたデフォルト値で初期化する。
 * 既にデフォルトより高い品質（鍛冶済み）の場合はそのまま維持。
 */
const TIER_RANK: Record<SocketTier, number> = { bronze: 0, silver: 1, gold: 2 };

export function applyDefaultSocketTiers(dice: MonsterDice): MonsterDice {
  return {
    ...dice,
    customFaces: dice.customFaces.map(f => {
      const defaultTier = FACE_DEFAULT_SOCKET_TIER[f.faceNumber] || 'bronze';
      return {
        ...f,
        sockets: f.sockets.map(s => {
          // 既に高い品質なら維持
          if (TIER_RANK[s.socketTier] >= TIER_RANK[defaultTier]) return s;
          return { ...s, socketTier: defaultTier };
        }),
      };
    }),
  };
}
