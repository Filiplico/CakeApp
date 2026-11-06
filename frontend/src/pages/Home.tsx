import { Link } from 'react-router-dom'
import { cakes } from '../data/cakes'
import CakeCard from '../components/CakeCard'
import { useFadeIn } from '../hooks/useFadeIn'
import LogoVideo from '../components/LogoVideo'

export default function Home() {
  const featuredRef = useFadeIn<HTMLElement>()
  const processRef  = useFadeIn<HTMLElement>()
  const ctaRef      = useFadeIn<HTMLElement>()

  return (
    <>
      {/* ── HERO ───────────────────────────────────── */}
      <section className="hero">
        <div className="hero__inner">
          <span className="hero__eyebrow">Artisanal Patisserie &middot; Est. 2024</span>

          <LogoVideo className="hero__logo" />

          <p className="hero__slogan">Handcrafted for life's sweetest moments.</p>

          <div className="hero__ornament" aria-hidden>
            <span className="hero__ornament-line" />
            <span className="hero__ornament-diamond" />
            <span className="hero__ornament-line" />
          </div>

          <p className="hero__subtitle">
            Bespoke cakes for life's most meaningful moments —
            handcrafted with the finest ingredients and an eye for every detail.
          </p>

          <div className="hero__actions">
            <Link to="/cakes" className="btn btn-primary">Explore Our Cakes</Link>
            <Link to="/custom-order" className="btn btn-outline">Custom Order</Link>
          </div>
        </div>

        <div className="hero__scroll-hint" aria-hidden>
          <span className="hero__scroll-text">Scroll</span>
          <span className="hero__scroll-line" />
        </div>
      </section>

      {/* ── FEATURED ───────────────────────────────── */}
      <section className="featured">
        <div className="container">
          <header
            ref={featuredRef}
            className="section-header reveal stagger"
          >
            <span className="section-eyebrow">Featured Creations</span>
            <h2 className="section-title">Baked to <em>Impress</em></h2>
            <p className="section-desc">
              From intimate gatherings to grand celebrations, each cake is a canvas
              shaped by your vision and our craft.
            </p>
          </header>

          <div className="featured-grid">
            {cakes.map((cake) => (
              <CakeCard key={cake.id} cake={cake} />
            ))}
          </div>

          <div className="view-all-wrap">
            <Link to="/cakes" className="btn btn-dark">View All Cakes</Link>
          </div>
        </div>
      </section>

      {/* ── PROCESS ────────────────────────────────── */}
      <section className="process">
        <div className="container">
          <header
            ref={processRef}
            className="section-header reveal stagger"
          >
            <span className="section-eyebrow">How It Works</span>
            <h2 className="section-title">Simple as <em>Three Steps</em></h2>
          </header>

          <div className="process-steps">
            {[
              {
                n: '01',
                title: 'Choose or Design',
                desc: 'Pick from our curated catalog or describe your dream cake — flavour, shape, and occasion.',
              },
              {
                n: '02',
                title: 'We Bake',
                desc: 'Using only the finest ingredients, each cake is made fresh to order with meticulous care.',
              },
              {
                n: '03',
                title: 'Pick Up or Deliver',
                desc: 'Collect from our studio or arrange delivery straight to your celebration.',
              },
            ].map((step) => (
              <div key={step.n} className="process-step">
                <div className="process-step__number" aria-hidden>{step.n}</div>
                <h3 className="process-step__title">{step.title}</h3>
                <p className="process-step__desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ───────────────────────────────── */}
      <section className="cta-band">
        <div className="container">
          <header
            ref={ctaRef}
            className="section-header reveal stagger"
          >
            <span className="section-eyebrow">Custom Orders</span>
            <h2 className="section-title">Something <em>Uniquely Yours</em></h2>
          </header>
          <p className="cta-band__desc">
            Have a specific vision in mind? We'll collaborate with you to design a cake
            that is entirely bespoke — from the shape and flavour to the finest decorative detail.
          </p>
          <Link to="/custom-order" className="btn btn-dark">Start Your Order</Link>
        </div>
      </section>
    </>
  )
}
