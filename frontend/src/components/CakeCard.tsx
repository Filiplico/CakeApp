import { Link } from 'react-router-dom'
import type { Product } from '../api'
import { formatCategory, formatPrice } from '../format'

export default function CakeCard({ cake }: { cake: Product }) {
  return (
    <Link to={`/cakes/${cake.id}`} className="cake-card">
      <div className="cake-card__image-wrap">
        <img src={cake.imageUrl} alt={cake.name} loading="lazy" />
        <div className="cake-card__overlay">
          <span>Discover</span>
        </div>
      </div>
      <span className="cake-card__category">{formatCategory(cake.category)}</span>
      <h3 className="cake-card__name">{cake.name}</h3>
      <span className="cake-card__price">From {formatPrice(cake.priceFrom)}</span>
    </Link>
  )
}
