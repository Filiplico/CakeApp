import { cakes } from '../data/cakes'
import CakeCard from '../components/CakeCard'

export default function Cakes() {
  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Our Cakes</h1>
      <div className="grid">
        {cakes.map((cake) => (
          <CakeCard key={cake.id} cake={cake} />
        ))}
      </div>
    </div>
  )
}
