import { Link, useParams } from 'react-router-dom'
import { getProduct } from '../api'
import { formatCategory, formatPrice } from '../format'
import { useApi } from '../hooks/useApi'

export default function CakeDetails() {
  const { id = '' } = useParams<{ id: string }>()
  const product = useApi(() => getProduct(id), id)

  if (product.status === 'loading') {
    return (
      <main className="cake-details-page">
        <div className="cake-details-message">
          <p>Loading…</p>
        </div>
      </main>
    )
  }

  if (product.status === 'error') {
    return (
      <main className="cake-details-page">
        <div className="cake-details-message">
          <span className="section-eyebrow">Not found</span>
          <h1>We couldn't find that cake</h1>
          <p>It may no longer be on the menu. Have a look at the rest of our collection.</p>
          <Link to="/cakes" className="btn btn-primary">
            Browse all cakes
          </Link>
        </div>
      </main>
    )
  }

  const cake = product.data
  return (
    <main className="cake-details-page">
      <div className="cake-details-split">
        <div className="cake-details__image-col">
          <img src={cake.imageUrl} alt={cake.name} />
        </div>

        <div className="cake-details__content-col">
          <Link to="/cakes" className="cake-details__back">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M9 2L4 7L9 12"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to cakes
          </Link>

          <span className="cake-details__category">{formatCategory(cake.category)}</span>
          <h1 className="cake-details__name">{cake.name}</h1>

          <div className="cake-details__divider" aria-hidden />

          <p className="cake-details__desc">{cake.fullDescription}</p>
          <p className="cake-details__price">From {formatPrice(cake.priceFrom)}</p>

          <Link to="/custom-order" className="btn btn-primary cake-details__cta">
            Order This Cake
          </Link>
        </div>
      </div>
    </main>
  )
}
