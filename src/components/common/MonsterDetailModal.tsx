import type { MonsterDice, FixedFace, CustomFace } from '../../types';
import { getAllFaces, isFixedFace } from '../../types';
import { FIXED_SKILLS, getSkillRune } from '../../data/skill-runes';
import { ElementBadge, ELEMENT_COLORS } from './ElementBadge';
import { MonsterSprite } from './MonsterSprite';

interface MonsterDetailModalProps {
  monster: MonsterDice;
  onClose: () => void;
}

const EFFECT_TYPE_NAMES: Record<string, string> = {
  damage: 'ダメージ',
  heal: '回復',
  dot: '継続',
  buff: 'バフ',
  debuff: 'デバフ',
  shield: 'シールド',
  counter: '反撃',
  lifesteal: '吸収',
  seal: '封印',
  passive: 'パッシブ',
};

const TIER_LABELS: Record<string, string> = {
  bronze: 'B',
  silver: 'S',
  gold: 'G',
};

const TIER_COLORS: Record<string, string> = {
  bronze: '#a08060',
  silver: '#808080',
  gold: '#705828',
};

export function MonsterDetailModal({ monster, onClose }: MonsterDetailModalProps) {
  const allFaces = getAllFaces(monster);
  const fixedFaces = allFaces.filter(f => isFixedFace(f)) as FixedFace[];
  const customFaces = allFaces.filter(f => !isFixedFace(f)) as CustomFace[];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="rpg-panel"
        style={{
          maxWidth: 380,
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          padding: 16,
        }}
      >
        {/* ヘッダー */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <MonsterSprite monsterId={monster.baseId || monster.id} element={monster.element} size={64} animate />
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 'bold', color: '#3a2a1a' }}>{monster.name}</span>
            <ElementBadge element={monster.element} />
          </div>
          <div style={{ marginTop: 4 }}>
            {monster.id === 'protagonist' ? (
              <span style={{ color: '#b09050', fontSize: 12, fontWeight: 'bold' }}>HERO</span>
            ) : (
              <span style={{ color: ELEMENT_COLORS[monster.element], fontSize: 14 }}>
                {'★'.repeat(monster.rarity)}{'☆'.repeat(Math.max(0, 5 - monster.rarity))}
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: '#6a5a4a', marginTop: 6 }}>
            {monster.description}
          </div>
        </div>

        {/* 基本ステータス */}
        <div style={{
          background: '#e8e0d4', borderRadius: 6, padding: '6px 10px', marginBottom: 10,
          fontSize: 11, color: '#6a5a4a',
        }}>
          <span>捕獲率: <b>{monster.baseStats.captureRate}%</b></span>
          <span style={{ marginLeft: 16 }}>固有面: <b>{fixedFaces.length}</b></span>
          <span style={{ marginLeft: 16 }}>カスタム面: <b>{customFaces.length}</b></span>
        </div>

        {/* レアリティ固有スキルボーナス */}
        {monster.rarity >= 2 && fixedFaces.length > 0 && (
          <div style={{
            background: '#f0e8d0', borderRadius: 6, padding: '6px 10px', marginBottom: 10,
            fontSize: 11, color: '#705828', border: '1px solid #d8c8a0',
          }}>
            {'★'.repeat(monster.rarity)} 固有スキル威力 x{
              ({ 2: '1.3', 3: '1.7', 4: '2.2', 5: '3.0' } as Record<number, string>)[monster.rarity] ?? '1.0'
            }
          </div>
        )}

        {/* 固有面セクション */}
        {fixedFaces.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: '#705828', fontWeight: 'bold', marginBottom: 4 }}>
              固有面
            </div>
            {fixedFaces.map((face) => (
              <div key={face.faceNumber} style={{
                background: '#e8e0d4', borderRadius: 4, padding: '5px 8px', marginBottom: 4,
                border: '1px solid #d0c8b8',
              }}>
                <div style={{ fontSize: 10, color: '#705828', fontWeight: 'bold', marginBottom: 3 }}>
                  {face.faceNumber}の面 ({face.sockets.length}ソケット)
                </div>
                {face.sockets.map((s, i) => {
                  const skill = FIXED_SKILLS[s.skillId];
                  const eff = skill?.effect;
                  return (
                    <div key={i} style={{
                      display: 'flex', gap: 4, alignItems: 'center', fontSize: 10,
                      padding: '2px 0',
                    }}>
                      <ElementBadge element={s.element} />
                      <span>{skill?.name ?? s.skillId}</span>
                      {eff && (
                        <span style={{ color: '#998a78', marginLeft: 'auto', fontSize: 9 }}>
                          {EFFECT_TYPE_NAMES[eff.type] ?? eff.type}
                          {' '}
                          {eff.type === 'buff' || eff.type === 'debuff' ? `x${eff.power}` : eff.power}
                          {eff.duration ? ` ${eff.duration}T` : ''}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* カスタム面セクション */}
        {customFaces.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: '#4070a0', fontWeight: 'bold', marginBottom: 4 }}>
              カスタム面
            </div>
            {customFaces.map((face) => (
              <div key={face.faceNumber} style={{
                background: '#e0e4e8', borderRadius: 4, padding: '5px 8px', marginBottom: 4,
                border: '1px solid #c8ccd0',
              }}>
                <div style={{ fontSize: 10, color: '#4070a0', fontWeight: 'bold', marginBottom: 3 }}>
                  {face.faceNumber}の面 ({face.sockets.length}ソケット)
                </div>
                {face.sockets.map((s, i) => {
                  const rune = s.skillRuneId ? getSkillRune(s.skillRuneId) : null;
                  return (
                    <div key={i} style={{
                      display: 'flex', gap: 4, alignItems: 'center', fontSize: 10,
                      padding: '2px 0',
                    }}>
                      <span style={{
                        color: TIER_COLORS[s.socketTier], fontWeight: 'bold', fontSize: 9,
                        minWidth: 14,
                      }}>
                        {TIER_LABELS[s.socketTier]}
                      </span>
                      {s.locked && <span style={{ fontSize: 8, color: '#705828' }}>🔒</span>}
                      {rune ? (
                        <>
                          <ElementBadge element={rune.element} />
                          <span>{rune.name}</span>
                          <span style={{ color: '#998a78', marginLeft: 'auto', fontSize: 9 }}>
                            {EFFECT_TYPE_NAMES[rune.effect.type] ?? rune.effect.type}
                            {' '}
                            {rune.effect.type === 'buff' || rune.effect.type === 'debuff' ? `x${rune.effect.power}` : rune.effect.power}
                          </span>
                        </>
                      ) : (
                        <span style={{ color: '#998a78', fontSize: 9 }}>空き</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* 閉じるボタン */}
        <button
          className="rpg-btn"
          style={{ width: '100%', padding: '8px 0', fontSize: 13 }}
          onClick={onClose}
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
