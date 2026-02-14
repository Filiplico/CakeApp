import Link from "next/link";
import { cakes } from "@/data/cakes";
import { CakeImage } from "@/components/CakeImage";

export default function CatalogPage() {
  return (
    <div className="catalog-page">
      <div className="container">
        <h1 className="section-title">Our Cakes</h1>
        <div className="catalog-grid">
          {cakes.map((cake) => (
            <Link key={cake.id} href={`/cakes/${cake.id}`} className="card">
              <div className="card-image-wrap">
                <CakeImage src={cake.image} alt={cake.name} />
              </div>
              <div className="card-body">
                <span className="card-category">{cake.category}</span>
                <h2>{cake.name}</h2>
                <p>{cake.shortDescription}</p>
                <span className="card-price">From ${cake.priceFrom}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
