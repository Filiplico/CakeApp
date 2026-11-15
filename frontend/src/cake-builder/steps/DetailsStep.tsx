import type { Dispatch, FormEvent, SetStateAction } from 'react'
import { DECORATIONS, FILLINGS, SPONGES, TOPPINGS, type CakeConfig } from '../options'
import { ORDER_FORM_ID, type OrderForm } from '../order'
import type { CakeArt } from '../useCakeArt'

interface Props {
  config: CakeConfig
  art: CakeArt | null
  form: OrderForm
  setForm: Dispatch<SetStateAction<OrderForm>>
  error: string | null
  onSubmit: (event: FormEvent) => void
}

/** Tomorrow as yyyy-MM-dd in local time, the earliest date a cake can be ordered for. */
function tomorrow(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function DetailsStep({ config, art, form, setForm, error, onSubmit }: Props) {
  const sponge = SPONGES.find((s) => s.id === config.sponge)!
  const filling = FILLINGS.find((f) => f.id === config.filling)!
  const finish = [
    ...TOPPINGS.filter((t) => config.toppings.includes(t.id)),
    ...DECORATIONS.filter((d) => config.decorations.includes(d.id)),
  ].map((o) => o.label.toLowerCase())

  function update<K extends keyof OrderForm>(field: K, value: OrderForm[K]) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  return (
    <form className="studio-body" id={ORDER_FORM_ID} onSubmit={onSubmit}>
      <header className="studio-heading">
        <h1>
          Your <em>details</em>
        </h1>
        <p>Tell us when you need it and how to reach you.</p>
      </header>

      <dl className="studio-summary">
        <div>
          <dt>Cake</dt>
          <dd>
            {config.tiers} {config.tiers === 1 ? 'tier' : 'tiers'}, {sponge.label.toLowerCase()} sponge with{' '}
            {filling.label.toLowerCase()}
          </dd>
        </div>
        {finish.length > 0 && (
          <div>
            <dt>Finish</dt>
            <dd>{finish.join(', ')}</dd>
          </div>
        )}
        {art && (
          <div>
            <dt>On the cake</dt>
            <dd>“{art.prompt}”</dd>
          </div>
        )}
      </dl>

      <div className="studio-fields">
        <label>
          Name
          <input
            required
            autoComplete="name"
            value={form.customerName}
            onChange={(e) => update('customerName', e.target.value)}
          />
        </label>
        <label>
          Phone
          <input
            required
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
          />
        </label>
        <label>
          Email <small>optional</small>
          <input
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </label>
        <label>
          Date needed
          <input
            required
            type="date"
            min={tomorrow()}
            value={form.dateNeeded}
            onChange={(e) => update('dateNeeded', e.target.value)}
          />
        </label>
        <div className="studio-fields__wide">
          <span className="studio-fields__label">Collection</span>
          <div className="studio-segments studio-segments--wide">
            {(['PICKUP', 'DELIVERY'] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={form.pickupOrDelivery === option}
                onClick={() => update('pickupOrDelivery', option)}
              >
                {option === 'PICKUP' ? 'Pick up' : 'Delivery'}
              </button>
            ))}
          </div>
        </div>
        {form.pickupOrDelivery === 'DELIVERY' && (
          <label className="studio-fields__wide">
            Delivery address
            <input
              required
              autoComplete="street-address"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
            />
          </label>
        )}
        <label className="studio-fields__wide">
          Notes <small>optional</small>
          <textarea
            rows={3}
            placeholder="Allergies, the occasion, anything else we should know"
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
          />
        </label>
      </div>
      {error && (
        <p className="studio-error" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
