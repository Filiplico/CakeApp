import Link from "next/link";

export default function CustomOrderPage() {
  return (
    <div className="custom-order-page">
      <div className="container">
        <h1 className="section-title">Custom Order</h1>
        <div className="placeholder-page">
          <p>This page will include the cake customizer + order form.</p>
          <Link href="/" className="detail-link">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
