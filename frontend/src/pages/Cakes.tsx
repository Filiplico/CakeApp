import { cakes } from '../data/cakes'
import CakeCard from '../components/CakeCard'
import { useFadeIn } from '../hooks/useFadeIn'

export default function Cakes() {
  const gridRef = useFadeIn<HTMLElement>()

  return (
    <main className="cakes-page">
      <header className="page-header">
        <div className="container">
          <h1>Our <em>Cakes</em></h1>
          <p>
            Every cake is handcrafted to order using seasonal, quality ingredients.
            Browse our collection and find your perfect creation.
          </p>
        </div>
      </header>

      <section className="cakes-grid-section">
        <div className="container">
          <div ref={gridRef} className="cakes-grid reveal stagger">
            {cakes.map((cake) => (
              <CakeCard key={cake.id} cake={cake} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
