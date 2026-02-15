import { Link } from 'react-router-dom'
import type { Cake } from '../data/cakes'

interface CakeCardProps {
  cake: Cake
}

export default function CakeCard({ cake }: CakeCardProps) {
  return (
    <Link to={`/cakes/${cake.id}`} className="card cake-card">
      <img src={cake.image} alt={cake.name} />
      <div className="cake-card-content">
        <span className="category">{cake.category}</span>
        <h3>{cake.name}</h3>
        <p>{cake.shortDescription}</p>
        <span className="price">From ${cake.priceFrom}</span>
      </div>
    </Link>
  )
}
