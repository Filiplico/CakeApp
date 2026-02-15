import { useParams, Link } from 'react-router-dom'
import { cakes } from '../data/cakes'

export default function CakeDetails() {
  const { id } = useParams<{ id: string }>()
  const cake = cakes.find((c) => c.id === id)

  if (!cake) {
    return (
      <div className="container page-placeholder">
        <h1>Cake not found</h1>
        <Link to="/cakes" className="btn">
          Back to catalog
        </Link>
      </div>
    )
  }

  return (
    <div className="container cake-details">
      <img src={cake.image} alt={cake.name} />
      <h1>{cake.name}</h1>
      <p className="meta">
        {cake.category} · From ${cake.priceFrom}
      </p>
      <p className="full-description">{cake.fullDescription}</p>
      <Link to="/custom-order" className="btn">
        Order this cake
      </Link>
    </div>
  )
}
