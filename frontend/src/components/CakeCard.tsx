import { Link } from 'react-router-dom'
import type { Cake } from '../data/cakes'

interface CakeCardProps {
  cake: Cake
}

export default function CakeCard({ cake }: CakeCardProps) {
  return (
    <Link to={`/cakes/${cake.id}`} className="cake-card">
      <div className="cake-card__image-wrap">
        <img src={cake.image} alt={cake.name} loading="lazy" />
        <div className="cake-card__overlay">
          <span>Discover</span>
        </div>
      </div>
      <span className="cake-card__category">{cake.category}</span>
      <h3 className="cake-card__name">{cake.name}</h3>
      <span className="cake-card__price">From ${cake.priceFrom}</span>
    </Link>
  )
}
