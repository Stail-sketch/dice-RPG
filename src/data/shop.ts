import { SKILL_RUNES } from './skill-runes';
import type { SkillRune } from '../types';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: 'rune' | 'material' | 'consumable';
  price: number;
  currency: 'gold' | 'gems';
  rune?: SkillRune;
  materialId?: string;
}

// ショップラインナップ
export const SHOP_ITEMS: ShopItem[] = [
  // commonルーン（ゴールドで買える）
  ...SKILL_RUNES.filter(r => r.tier === 'common').map(r => ({
    id: `shop-${r.id}`,
    name: r.name,
    description: r.description,
    type: 'rune' as const,
    price: 80,
    currency: 'gold' as const,
    rune: r,
  })),
  // rareルーン（ちょっと高い）
  ...SKILL_RUNES.filter(r => r.tier === 'rare').map(r => ({
    id: `shop-${r.id}`,
    name: r.name,
    description: r.description,
    type: 'rune' as const,
    price: 200,
    currency: 'gold' as const,
    rune: r,
  })),
  // 鍛冶素材
  {
    id: 'shop-forge-stone',
    name: '鍛冶石',
    description: 'ソケット強化に必要な素材',
    type: 'material',
    price: 150,
    currency: 'gold',
    materialId: 'forge-stone',
  },
  {
    id: 'shop-rare-ore',
    name: 'レア鉱石',
    description: 'gold強化に必要なレア素材',
    type: 'material',
    price: 5,
    currency: 'gems',
    materialId: 'rare-ore',
  },
];
