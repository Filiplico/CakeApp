import CakeGrid from '../components/CakeGrid'

export default function Cakes() {
  return (
    <main>
      <header className="page-header">
        <div className="container">
          <h1>
            Our <em>Cakes</em>
          </h1>
          <p>
            Every cake is handcrafted to order using seasonal, quality ingredients. Browse our collection and find your
            perfect creation.
          </p>
        </div>
      </header>

      <section className="cakes-grid-section">
        <div className="container">
          <CakeGrid className="cakes-grid" />
        </div>
      </section>
    </main>
  )
}
