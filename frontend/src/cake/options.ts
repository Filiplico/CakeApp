export type ToppingId = 'candles' | 'stars' | 'hearts' | 'clouds' | 'roses' | 'balls'
export type DecorationId = 'pearls' | 'ribbon' | 'sprinkles' | 'flowers'
export type SpongeId = 'vanilla' | 'chocolate' | 'redvelvet' | 'lemon' | 'pistachio' | 'carrot'
export type FillingId = 'buttercream' | 'ganache' | 'strawberry' | 'lemoncurd' | 'creamcheese' | 'caramel'

/** Sprinkles can be one colour or this multicolour mix. */
export const RAINBOW = 'rainbow'

export interface CakeConfig {
  tiers: number
  /** Index 0 is the bottom tier. Always holds MAX_TIERS entries. */
  tierColors: string[]
  toppings: ToppingId[]
  /** Colour for every topping, whether or not it is currently selected. */
  toppingColors: Record<ToppingId, string>
  /**
   * Which tiers each topping sits on, counted down from the top (0 is the top tier),
   * so a choice keeps its meaning when the number of tiers changes.
   */
  toppingTiers: Record<ToppingId, number[]>
  decorations: DecorationId[]
  /** Colour for every decoration. Sprinkles may also be RAINBOW. */
  decorationColors: Record<DecorationId, string>
  sponge: SpongeId
  filling: FillingId
}

export const MAX_TIERS = 4

export interface NamedColor {
  name: string
  hex: string
}

export const FROSTING_COLORS: NamedColor[] = [
  { name: 'White', hex: '#ffffff' },
  { name: 'Ivory', hex: '#f6efe4' },
  { name: 'Blush', hex: '#f0c4c4' },
  { name: 'Sage', hex: '#b7c8aa' },
  { name: 'Sky', hex: '#b9d2e6' },
  { name: 'Lavender', hex: '#cbbde2' },
  { name: 'Lemon', hex: '#f2e2a0' },
  { name: 'Cocoa', hex: '#5e3c2b' },
  { name: 'Noir', hex: '#262321' },
]

/** Stronger colours for toppings and decorations, which need to stand out from the frosting. */
export const ACCENT_COLORS: NamedColor[] = [
  { name: 'Gold', hex: '#c9a87c' },
  { name: 'White', hex: '#fffaf0' },
  { name: 'Rose', hex: '#e58fa0' },
  { name: 'Red', hex: '#c8202f' },
  { name: 'Sky', hex: '#7fb8e0' },
  { name: 'Mint', hex: '#8fcfae' },
  { name: 'Lilac', hex: '#b79adf' },
  { name: 'Sunshine', hex: '#f4cf58' },
  { name: 'Noir', hex: '#262321' },
]

export const TOPPINGS: { id: ToppingId; label: string }[] = [
  { id: 'candles', label: 'Candles' },
  { id: 'stars', label: 'Stars' },
  { id: 'hearts', label: 'Hearts' },
  { id: 'clouds', label: 'Clouds' },
  { id: 'roses', label: 'Roses' },
  { id: 'balls', label: 'Balls' },
]

export const DECORATIONS: { id: DecorationId; label: string }[] = [
  { id: 'pearls', label: 'Pearl border' },
  { id: 'ribbon', label: 'Ribbon' },
  { id: 'sprinkles', label: 'Sprinkles' },
  { id: 'flowers', label: 'Sugar flowers' },
]

export const SPONGES: { id: SpongeId; label: string; note: string; color: string }[] = [
  { id: 'vanilla', label: 'Vanilla', note: 'Madagascan vanilla bean', color: '#f1dba6' },
  { id: 'chocolate', label: 'Chocolate', note: 'Dark Belgian cocoa', color: '#4a2c1e' },
  { id: 'redvelvet', label: 'Red velvet', note: 'Buttermilk and cocoa', color: '#8f1f2b' },
  { id: 'lemon', label: 'Lemon', note: 'Fresh zest and juice', color: '#f4e27c' },
  { id: 'pistachio', label: 'Pistachio', note: 'Roasted Sicilian pistachio', color: '#a9bd7c' },
  { id: 'carrot', label: 'Carrot', note: 'Spiced, with walnuts', color: '#c98a4b' },
]

export const FILLINGS: { id: FillingId; label: string; color: string }[] = [
  { id: 'buttercream', label: 'Vanilla buttercream', color: '#fbf3df' },
  { id: 'ganache', label: 'Chocolate ganache', color: '#2f1a12' },
  { id: 'strawberry', label: 'Strawberry jam', color: '#c9354a' },
  { id: 'lemoncurd', label: 'Lemon curd', color: '#f2c935' },
  { id: 'creamcheese', label: 'Cream cheese', color: '#f7f1e6' },
  { id: 'caramel', label: 'Salted caramel', color: '#b96f2c' },
]

/** A plain white three-tier cake. The customer adds everything else. */
export const DEFAULT_CONFIG: CakeConfig = {
  tiers: 3,
  tierColors: ['#ffffff', '#ffffff', '#ffffff', '#ffffff'],
  toppings: [],
  toppingColors: {
    candles: '#e58fa0',
    stars: '#c9a87c',
    hearts: '#c8202f',
    clouds: '#fffaf0',
    roses: '#e58fa0',
    balls: '#c9a87c',
  },
  toppingTiers: { candles: [0], stars: [0], hearts: [0], clouds: [0], roses: [0], balls: [0] },
  decorations: [],
  decorationColors: {
    pearls: '#fffaf0',
    ribbon: '#c9a87c',
    sprinkles: RAINBOW,
    flowers: '#e58fa0',
  },
  sponge: 'vanilla',
  filling: 'buttercream',
}

/**
 * The tiers a topping is actually shown on for the current cake, counted down from the
 * top. Falls back to the top tier if none of the chosen tiers exist any more.
 */
export function activeToppingTiers(config: CakeConfig, id: ToppingId): number[] {
  const valid = config.toppingTiers[id].filter((t) => t < config.tiers)
  return valid.length ? valid : [0]
}

/** Names the tiers the way a customer would, from the bottom up. */
export function tierName(index: number, tiers: number): string {
  if (tiers === 1) return 'Cake'
  if (index === 0) return 'Base tier'
  if (index === tiers - 1) return 'Top tier'
  if (tiers === 3) return 'Middle tier'
  return index === 1 ? 'Lower middle' : 'Upper middle'
}
