import { Link } from 'react-router-dom'
import type { OrderForm } from '../order'

interface Props {
  /** True while the boxing animation is still playing. */
  boxing: boolean
  orderId: number | null
  form: OrderForm
  onStartOver: () => void
}

export default function OrderComplete({ boxing, orderId, form, onStartOver }: Props) {
  if (boxing) {
    return (
      <div className="studio-body studio-done" aria-live="polite">
        <header className="studio-heading">
          <h1>
            Boxing up your <em>cake</em>
          </h1>
          <p>One moment while we tie the ribbon.</p>
        </header>
      </div>
    )
  }

  const firstName = form.customerName.trim().split(' ')[0]
  const date = new Date(`${form.dateNeeded}T00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })

  return (
    <div className="studio-body studio-done" aria-live="polite">
      <span className="section-eyebrow">Order {orderId !== null ? `No. ${orderId}` : 'received'}</span>
      <header className="studio-heading">
        <h1>
          Boxed and <em>ready</em>
        </h1>
        <p>
          Thank you, {firstName}. We have your order for {date} and will call you on {form.phone} to confirm the
          details.
        </p>
      </header>
      <div className="studio-done__actions">
        <button type="button" className="btn btn-dark" onClick={onStartOver}>
          Design another cake
        </button>
        <Link to="/cakes" className="studio-link">
          Browse our cakes
        </Link>
      </div>
    </div>
  )
}
