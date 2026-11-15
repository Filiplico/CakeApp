const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch {
    throw new ApiError(0, 'We could not reach the bakery. Check your connection and try again.')
  }
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const fieldErrors = data?.errors ? Object.entries(data.errors).map(([field, msg]) => `${field} ${msg}`) : []
    throw new ApiError(response.status, fieldErrors.join(', ') || data?.message || 'Something went wrong.')
  }
  return data as T
}

const post = <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) })

// ---------------------------------------------------------------- products

export type ProductCategory = 'BIRTHDAY' | 'CELEBRATION' | 'WEDDING' | 'EVERYDAY' | 'KIDS' | 'CUPCAKES'

export interface Product {
  id: number
  name: string
  category: ProductCategory
  /** Starting price in cents. */
  priceFrom: number
  imageUrl: string
  shortDescription: string
  fullDescription: string
}

export function getProducts(): Promise<Product[]> {
  return request('/api/products')
}

export function getProduct(id: string): Promise<Product> {
  return request(`/api/products/${encodeURIComponent(id)}`)
}

// ------------------------------------------------------------------ orders

export interface OrderPayload {
  customerName: string
  phone: string
  email: string | null
  pickupOrDelivery: 'PICKUP' | 'DELIVERY'
  address: string | null
  dateNeeded: string
  notes: string | null
  customizationJson: string
}

export function createOrder(payload: OrderPayload): Promise<{ id: number }> {
  return post('/api/orders', payload)
}

// ---------------------------------------------------------------------- AI

/** Asks the AI designer to draw the customer's request. Resolves to SVG markup. */
export async function generateCakeArt(prompt: string, frostingColor: string): Promise<string> {
  const { svg } = await post<{ svg: string }>('/api/ai/cake-art', { prompt, frostingColor })
  return svg
}
