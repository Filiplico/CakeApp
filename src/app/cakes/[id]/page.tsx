import Link from "next/link";
import { cakes } from "@/data/cakes";
import { CakeImage } from "@/components/CakeImage";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CakeDetailPage({ params }: Props) {
  const { id } = await params;
  const cake = cakes.find((c) => c.id === id);

  if (!cake) {
    return (
      <div className="catalog-page">
        <div className="container">
          <div className="not-found-box">
            <h2>Not found</h2>
            <p>We couldn&apos;t find that cake.</p>
            <Link href="/cakes" className="btn btn-primary">
              Back to catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="catalog-page detail-page">
      <div className="container">
        <div className="detail-content">
          <div className="detail-image-wrap">
            <CakeImage src={cake.image} alt={cake.name} sizes="(max-width: 700px) 100vw, 700px" />
          </div>
          <span className="detail-category">{cake.category}</span>
          <h1>{cake.name}</h1>
          <p className="description">{cake.shortDescription}</p>
          <p className="detail-price">From ${cake.priceFrom}</p>
          <Link href="/custom-order" className="detail-link">
            Order a similar cake →
          </Link>
        </div>
      </div>
    </div>
  );
}
