import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Custom cakes for birthdays, weddings & celebrations</h1>
          <p>
            Handcrafted with love. Choose from our catalog or order a custom
            design tailored to your event.
          </p>
          <div className="hero-buttons">
            <Link href="/cakes" className="btn btn-primary">
              View Catalog
            </Link>
            <Link href="/custom-order" className="btn btn-secondary">
              Order Custom Cake
            </Link>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How it works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <h3>Choose or customize</h3>
              <p>
                Browse our catalog or tell us your vision for a custom cake.
              </p>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <h3>Confirm & pay</h3>
              <p>We confirm details and you secure your order with a deposit.</p>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <h3>Pick up & enjoy</h3>
              <p>Collect your cake on the day and make your celebration special.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
