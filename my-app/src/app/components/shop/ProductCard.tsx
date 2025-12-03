import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface Product {
  product_id: number;
  name: string;
  price: number;
  seller: string;
  rating: number;
  reviews: number;
  category: string;
  image_url?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link 
      href={`/products/${product.product_id}`}
      className="block"
    >
      <div className="bg-white border rounded-lg shadow-sm p-4 relative hover:shadow-md transition min-w-[260px] cursor-pointer">

        {/* CATEGORY TAG */}
        <span className="
          absolute top-3 left-3 
          bg-white/90 
          text-cafe 
          text-xs 
          px-3 py-1 
          rounded-full 
          shadow-sm 
          border border-cafe/10
          backdrop-blur-sm
          z-20
        ">
          {product.category}
        </span>

        {/* HEART */}
        <button 
          className="absolute top-3 right-3 bg-white/80 p-1 rounded-full shadow z-20"
          onClick={(e) => {
            e.preventDefault(); // Prevent navigation when clicking heart
            // TODO: Add to favorites functionality
            console.log("Added to favorites:", product.product_id);
          }}
          aria-label="Add to favorites"
        >
          <Heart size={18} className="text-cafe" />
        </button>

        {/* IMAGE */}
        {product.image_url ? (
          <div className="relative w-full h-48 mb-3 rounded overflow-hidden">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="bg-gray-200 h-48 rounded flex items-center justify-center mb-3">
            <span className="text-gray-500">No Image</span>
          </div>
        )}

        {/* NAME */}
        <h3 className="text-lg font-medium text-ebony">{product.name}</h3>

        {/* SELLER */}
        <p className="text-xs text-reseda">by {product.seller}</p>

        {/* RATING */}
        <p className="text-sm my-1">⭐ {product.rating} ({product.reviews})</p>

        {/* PRICE */}
        <p className="text-lg font-semibold text-chocolate">
          ${product.price}
        </p>
      </div>
    </Link>
  );
}




