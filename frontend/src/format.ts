import type { ProductCategory } from './api'

const price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

/** Formats a price in cents, e.g. 4500 → "$45". */
export function formatPrice(cents: number): string {
  return price.format(cents / 100)
}

/** Turns an API category into a label, e.g. "BIRTHDAY" → "Birthday". */
export function formatCategory(category: ProductCategory): string {
  return category.charAt(0) + category.slice(1).toLowerCase()
}
