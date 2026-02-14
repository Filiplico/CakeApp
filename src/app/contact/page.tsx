import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="contact-page">
      <div className="container">
        <h1 className="section-title">Contact Us</h1>
        <ul className="contact-list">
          <li>
            <span className="contact-label">Phone:</span>
            (555) 123-4567
          </li>
          <li>
            <span className="contact-label">Instagram:</span>
            @moms_cake_studio
          </li>
          <li>
            <span className="contact-label">Pickup city:</span>
            Portland, OR
          </li>
        </ul>
        <p style={{ marginTop: "1.5rem" }}>
          <Link href="/" className="detail-link">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
