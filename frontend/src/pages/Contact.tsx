import { useFadeIn } from '../hooks/useFadeIn'

export default function Contact() {
  const contentRef = useFadeIn()

  return (
    <main className="contact-page">
      <header className="page-header">
        <div className="container">
          <h1>Get in <em>Touch</em></h1>
          <p>
            We'd love to hear about your next occasion. Reach out with questions,
            custom requests, or simply to say hello.
          </p>
        </div>
      </header>

      <section className="contact-content">
        <div className="container">
          <div ref={contentRef} className="contact-grid reveal stagger">
            <div className="contact-info">
              <h2 className="contact-info__title">
                Let's create something beautiful together.
              </h2>
              <p>
                Whether you have a precise vision or just a vague idea, we are here
                to guide you from concept to a cake that exceeds expectations.
              </p>

              <div className="contact-detail">
                <span className="contact-detail__label">Location</span>
                <span className="contact-detail__value">
                  123 Baker Street<br />Ljubljana, Slovenia
                </span>
              </div>

              <div className="contact-detail">
                <span className="contact-detail__label">Hours</span>
                <span className="contact-detail__value">
                  Tuesday – Saturday, 9am – 6pm
                </span>
              </div>

              <div className="contact-detail">
                <span className="contact-detail__label">Email</span>
                <span className="contact-detail__value">hello@renescakes.com</span>
              </div>

              <div className="contact-detail">
                <span className="contact-detail__label">Phone</span>
                <span className="contact-detail__value">+386 1 234 5678</span>
              </div>
            </div>

            <div className="contact-form-box">
              <h3>Send Us a Message</h3>
              <p>
                Our contact form is on its way. In the meantime, reach us directly
                by email or phone — we typically respond within one business day.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
