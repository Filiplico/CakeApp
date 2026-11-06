import { useParams, Link } from 'react-router-dom'
import { cakes } from '../data/cakes'

export default function CakeDetails() {
  const { id } = useParams<{ id: string }>()
  const cake = cakes.find((c) => c.id === id)

  if (!cake) {
    return (
      <main className="cake-details-page" style={{ background: 'var(--black)' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          <span className="section-eyebrow" style={{ color: 'var(--gold)' }}>
            404
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 300,
              color: 'var(--white)',
            }}
          >
            Cake Not Found
          </h1>
          <p style={{ color: 'var(--gray-400)', maxWidth: '36ch', lineHeight: 1.8 }}>
            We couldn't find that cake. Perhaps browse our full collection?
          </p>
          <Link to="/cakes" className="btn btn-primary">
            Browse All Cakes
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="cake-details-page">
      <div className="cake-details-split">
        <div className="cake-details__image-col">
          <img src={cake.image} alt={cake.name} />
        </div>

        <div className="cake-details__content-col">
          <Link to="/cakes" className="cake-details__back">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to cakes
          </Link>

          <span className="cake-details__category">{cake.category}</span>
          <h1 className="cake-details__name">{cake.name}</h1>

          <div className="cake-details__divider" aria-hidden />

          <p className="cake-details__desc">{cake.fullDescription}</p>
          <p className="cake-details__price">From ${cake.priceFrom}</p>

          <Link to="/custom-order" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            Order This Cake
          </Link>
        </div>
      </div>
    </main>
  )
}
