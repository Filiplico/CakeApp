import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Homemade Cakes Made With Love</h1>
          <p>
            Order beautiful, delicious cakes for every occasion. Browse our
            catalog or tell us your dream cake and we'll make it real.
          </p>
          <div className="hero-buttons">
            <Link to="/cakes" className="btn">
              View Catalog
            </Link>
            <Link to="/custom-order" className="btn btn-secondary">
              Order Custom Cake
            </Link>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step card">
              <h3>1. Choose or Customize</h3>
              <p>Pick from our catalog or describe your ideal cake.</p>
            </div>
            <div className="step card">
              <h3>2. We Bake</h3>
              <p>Fresh ingredients, made to order with care.</p>
            </div>
            <div className="step card">
              <h3>3. Pick Up or Deliver</h3>
              <p>Collect at our studio or arrange delivery.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
