import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface Product {
  product_id: string;
  name: string;
  price: number;
  seller_name: string;
  rating: number;
  total_reviews: number;
  category: string;
  images?: string[];
  image_url?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  // Pick the first image from images[] or fallback to image_url
  const imageSrc =
    product.images?.[0] ||
    product.image_url ||
    "/placeholder.jpg";

  return (
    <Link
      href={`/products/${product.product_id}`}
      className="
        block bg-white border rounded-lg shadow-sm p-4 relative min-w-[260px]
        transition-all duration-300 transform
        hover:-translate-y-1 hover:shadow-lg
      "
    >
      {/* CATEGORY TAG */}
      <span className="absolute z-20 px-3 py-1 text-xs border rounded-full shadow-sm top-3 left-3 bg-white/90 text-cafe border-cafe/10 backdrop-blur-sm">
        {product.category}
      </span>

      {/* HEART BUTTON */}
      <button
        className="absolute z-20 p-1 rounded-full shadow top-3 right-3 bg-white/80"
        aria-label="Add to favorites"
        onClick={(e) => e.stopPropagation()}
      >
        <Heart size={18} className="text-cafe" />
      </button>

      {/* PRODUCT IMAGE */}
      <div className="relative w-full h-48 mb-3 overflow-hidden rounded">
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* NAME */}
      <h3 className="text-lg font-medium text-ebony">{product.name}</h3>

      {/* SELLER */}
      <p className="text-xs text-reseda">by {product.seller_name}</p>

      {/* RATING */}
      <p className="my-1 text-sm">
        ⭐ {product.rating?.toFixed(1) ?? "0.0"} ({product.total_reviews})
      </p>

      {/* PRICE */}
      <p className="text-lg font-semibold text-chocolate">
        ${product.price}
      </p>
    </Link>
  );
}


