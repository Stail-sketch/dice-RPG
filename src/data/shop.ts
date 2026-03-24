import { SKILL_RUNES } from './skill-runes';
import { ALL_MAGIC_DICE } from './magic-dice';
import type { SkillRune } from '../types';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: 'rune' | 'material' | 'consumable' | 'magic-dice';
  price: number;
  currency: 'gold' | 'gems';
  rune?: SkillRune;
  materialId?: string;
  magicDiceId?: string;
}

// ショップラインナップ
export const SHOP_ITEMS: ShopItem[] = [
  // commonルーン（ゴールドで買える）
  ...SKILL_RUNES.filter(r => r.tier === 'common').map(r => ({
    id: `shop-${r.id}`,
    name: r.name,
    description: r.description,
    type: 'rune' as const,
    price: 150,
    currency: 'gold' as const,
    rune: r,
  })),
  // rareルーン（ちょっと高い）
  ...SKILL_RUNES.filter(r => r.tier === 'rare').map(r => ({
    id: `shop-${r.id}`,
    name: r.name,
    description: r.description,
    type: 'rune' as const,
    price: 500,
    currency: 'gold' as const,
    rune: r,
  })),
  // 鍛冶素材
  {
    id: 'shop-forge-stone',
    name: '鍛冶石',
    description: 'ソケット強化に必要な素材',
    type: 'material',
    price: 300,
    currency: 'gold',
    materialId: 'forge-stone',
  },
  {
    id: 'shop-rare-ore',
    name: 'レア鉱石',
    description: 'gold強化に必要なレア素材',
    type: 'material',
    price: 8,
    currency: 'gems',
    materialId: 'rare-ore',
  },
  {
    id: 'shop-expansion-crystal',
    name: '拡張結晶',
    description: 'ソケット拡張に必要な希少素材',
    type: 'material',
    price: 15,
    currency: 'gems',
    materialId: 'expansion-crystal',
  },
  // マジックダイス（shopで買えるもの）
  ...ALL_MAGIC_DICE
    .filter(m => m.obtain.startsWith('shop-'))
    .map(m => {
      const goldPrice = parseInt(m.obtain.replace('shop-', ''), 10);
      return {
        id: `shop-magic-${m.id}`,
        name: `魔法ダイス: ${m.name}`,
        description: `[CG${m.cost}] ${m.effect}`,
        type: 'magic-dice' as const,
        price: goldPrice * 2,
        currency: 'gold' as const,
        magicDiceId: m.id,
      };
    }),
];
