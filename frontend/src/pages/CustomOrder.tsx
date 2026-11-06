import { useFadeIn } from '../hooks/useFadeIn'

export default function CustomOrder() {
  const boxRef = useFadeIn<HTMLDivElement>()

  return (
    <main className="custom-order-page">
      <header className="page-header">
        <div className="container">
          <h1>Custom <em>Order</em></h1>
          <p>
            Describe your dream cake — flavour, design, size, occasion —
            and we'll bring it to life, exactly as you imagined.
          </p>
        </div>
      </header>

      <section className="custom-order-content">
        <div className="container">
          <div ref={boxRef} className="order-placeholder reveal">
            <div className="order-placeholder__icon" aria-hidden>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path
                  d="M11 3C7.13 3 4 6.13 4 10c0 2.74 1.54 5.12 3.8 6.37L7 20h8l-.8-3.63C16.46 15.12 18 12.74 18 10c0-3.87-3.13-7-7-7Z"
                  stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"
                />
                <path d="M8.5 20.5h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>

            <h2>Tell Us Your Vision</h2>
            <p>
              Our custom order form is currently being crafted with the same care
              we put into every cake. In the meantime, please reach out directly —
              we'd love to start planning your perfect cake.
            </p>

            <a href="mailto:hello@renescakes.com" className="btn btn-dark">
              Email Us Your Order
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
