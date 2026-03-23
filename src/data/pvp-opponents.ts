import { ALL_MONSTERS } from './monsters';
import { SKILL_RUNES } from './skill-runes';
import type { MonsterDice, CustomSocket } from '../types';

export interface PvpOpponent {
  id: string;
  name: string;
  tier: 'bronze' | 'silver' | 'gold';
  party: MonsterDice[];
  hp: number;
  reward: { points: number; gold: number };
}

function getMonster(id: string): MonsterDice {
  const m = ALL_MONSTERS.find(m => m.id === id);
  if (!m) throw new Error(`Monster ${id} not found`);
  return JSON.parse(JSON.stringify(m)); // deep clone
}

function equipRune(dice: MonsterDice, faceNumber: number, socketIndex: number, runeId: string) {
  const face = dice.customFaces.find(f => f.faceNumber === faceNumber);
  if (face && face.sockets[socketIndex]) {
    (face.sockets[socketIndex] as CustomSocket).skillRuneId = runeId;
  }
}

// Bronze tier - ★1-2モンスター、ルーン少なめ
function buildBronzeOpponents(): PvpOpponent[] {
  const op1p1 = getMonster('pyrachnid');
  const op1p2 = getMonster('frost-jelly');
  const op1p3 = getMonster('volt-wisp');

  const op2p1 = getMonster('goblin-knight');
  equipRune(op2p1, 3, 0, 'iron-bash');
  const op2p2 = getMonster('salamander-v2');
  equipRune(op2p2, 3, 0, 'blaze-strike');
  const op2p3 = getMonster('hollow');

  const op3p1 = getMonster('frost-wolf');
  const op3p2 = getMonster('penguin');
  const op3p3 = getMonster('rot-beetle');

  return [
    { id: 'bronze-1', name: '見習い冒険者', tier: 'bronze', party: [op1p1, op1p2, op1p3], hp: 50, reward: { points: 3, gold: 100 } },
    { id: 'bronze-2', name: '旅の剣士', tier: 'bronze', party: [op2p1, op2p2, op2p3], hp: 60, reward: { points: 3, gold: 150 } },
    { id: 'bronze-3', name: '氷原の狩人', tier: 'bronze', party: [op3p1, op3p2, op3p3], hp: 55, reward: { points: 3, gold: 120 } },
  ];
}

// Silver tier - ★2-3モンスター、ルーン装備済み
function buildSilverOpponents(): PvpOpponent[] {
  const op1p1 = getMonster('iron-golem');
  equipRune(op1p1, 4, 0, 'iron-bash');
  equipRune(op1p1, 4, 1, 'guard');
  const op1p2 = getMonster('shadow-serpent');
  const op1p3 = getMonster('hollow');

  const op2p1 = getMonster('blizzard-drake');
  const op2p2 = getMonster('yuki-onna');
  const op2p3 = getMonster('ice-golem');
  equipRune(op2p3, 3, 0, 'ice-shard');

  const op3p1 = getMonster('storm-wizard');
  const op3p2 = getMonster('lightning-elemental');
  const op3p3 = getMonster('thunderbird');
  equipRune(op3p3, 3, 0, 'spark');

  return [
    { id: 'silver-1', name: '闇の使い手', tier: 'silver', party: [op1p1, op1p2, op1p3], hp: 80, reward: { points: 3, gold: 300 } },
    { id: 'silver-2', name: '氷結の女王', tier: 'silver', party: [op2p1, op2p2, op2p3], hp: 90, reward: { points: 3, gold: 350 } },
    { id: 'silver-3', name: '雷鳴の魔術師', tier: 'silver', party: [op3p1, op3p2, op3p3], hp: 85, reward: { points: 3, gold: 320 } },
  ];
}

// Gold tier - ★3-5モンスター、フル装備
function buildGoldOpponents(): PvpOpponent[] {
  const op1p1 = getMonster('inferno-drake');
  const op1p2 = getMonster('iron-golem');
  equipRune(op1p2, 4, 0, 'inferno');
  equipRune(op1p2, 4, 1, 'blaze-wall');
  const op1p3 = getMonster('shadow-serpent');

  const op2p1 = getMonster('hydra');
  const op2p2 = getMonster('death-bloom');
  const op2p3 = getMonster('basilisk');

  const op3p1 = getMonster('adamant-titan');
  const op3p2 = getMonster('orichalcum-dragon');
  const op3p3 = getMonster('shield-knight');
  equipRune(op3p3, 3, 0, 'counter');
  equipRune(op3p3, 3, 1, 'guard');

  const op4p1 = getMonster('banshee');
  const op4p2 = getMonster('void-sphinx');
  const op4p3 = getMonster('nightmare');

  return [
    { id: 'gold-1', name: '炎の竜騎士', tier: 'gold', party: [op1p1, op1p2, op1p3], hp: 120, reward: { points: 3, gold: 500 } },
    { id: 'gold-2', name: '毒沼の主', tier: 'gold', party: [op2p1, op2p2, op2p3], hp: 130, reward: { points: 3, gold: 550 } },
    { id: 'gold-3', name: '鋼鉄の守護者', tier: 'gold', party: [op3p1, op3p2, op3p3], hp: 140, reward: { points: 3, gold: 600 } },
    { id: 'gold-4', name: '幻影の支配者', tier: 'gold', party: [op4p1, op4p2, op4p3], hp: 150, reward: { points: 3, gold: 650 } },
  ];
}

export const PVP_OPPONENTS: PvpOpponent[] = [
  ...buildBronzeOpponents(),
  ...buildSilverOpponents(),
  ...buildGoldOpponents(),
];

export function getPvpOpponent(id: string): PvpOpponent | undefined {
  return PVP_OPPONENTS.find(o => o.id === id);
}
