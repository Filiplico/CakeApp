import type { OrderPayload } from '../api'
import { activeToppingTiers, tierName, type CakeConfig } from './options'
import type { CakeArt } from './useCakeArt'

export interface OrderForm {
  customerName: string
  phone: string
  email: string
  pickupOrDelivery: 'PICKUP' | 'DELIVERY'
  address: string
  dateNeeded: string
  notes: string
}

export const EMPTY_FORM: OrderForm = {
  customerName: '',
  phone: '',
  email: '',
  pickupOrDelivery: 'PICKUP',
  address: '',
  dateNeeded: '',
  notes: '',
}

/** The id of the form, so the submit button in the panel footer can submit it. */
export const ORDER_FORM_ID = 'order-form'

/**
 * The cake as the bakery needs to read it: only what the customer actually chose,
 * with tiers named the way the customer saw them.
 */
export function describeCake(config: CakeConfig, art: CakeArt | null) {
  return {
    tiers: config.tiers,
    tierColors: config.tierColors.slice(0, config.tiers),
    toppings: config.toppings.map((id) => ({
      id,
      color: config.toppingColors[id],
      tiers: activeToppingTiers(config, id).map((fromTop) => tierName(config.tiers - 1 - fromTop, config.tiers)),
    })),
    decorations: config.decorations.map((id) => ({ id, color: config.decorationColors[id] })),
    sponge: config.sponge,
    filling: config.filling,
    art,
  }
}

export function buildOrderPayload(form: OrderForm, config: CakeConfig, art: CakeArt | null): OrderPayload {
  return {
    customerName: form.customerName.trim(),
    phone: form.phone.trim(),
    email: form.email.trim() || null,
    pickupOrDelivery: form.pickupOrDelivery,
    address: form.pickupOrDelivery === 'DELIVERY' ? form.address.trim() : null,
    dateNeeded: form.dateNeeded,
    notes: form.notes.trim() || null,
    customizationJson: JSON.stringify(describeCake(config, art)),
  }
}
