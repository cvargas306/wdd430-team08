import { Heart } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export interface Product {
  product_id: string;
  name: string;
  price: number;
  seller: string;
  rating: number;
  reviews: number;
  category: string;
  image_url?: string;
  stock?: number;
  description?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/product/${product.product_id}`);
  };

  return (
    <div
      className="bg-white border rounded-lg shadow-sm p-4 relative hover:shadow-md transition min-w-[260px] cursor-pointer"
      onClick={handleClick}
    >

      {/* CATEGORY TAG */}
      <span className="absolute z-20 px-3 py-1 text-xs border rounded-full shadow-sm top-3 left-3 bg-white/90 text-cafe border-cafe/10 backdrop-blur-sm">
        {product.category}
      </span>

      {/* HEART */}
      <button
        className="absolute z-20 p-1 rounded-full shadow top-3 right-3 bg-white/80"
        aria-label="Add to favorites"
        onClick={(e) => e.stopPropagation()}
      >
        <Heart size={18} className="text-cafe" />
      </button>

      {/* IMAGE */}
      {product.image_url ? (
        <div className="relative w-full h-48 mb-3 overflow-hidden rounded">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-48 mb-3 bg-gray-200 rounded">
          <span className="text-gray-500">No Image</span>
        </div>
      )}

      {/* NAME */}
      <h3 className="text-lg font-medium text-ebony">{product.name}</h3>

      {/* SELLER */}
      <p className="text-xs text-reseda">by {product.seller}</p>

      {/* RATING */}
      <p className="my-1 text-sm">⭐ {product.rating} ({product.reviews})</p>

      {/* PRICE */}
      <p className="text-lg font-semibold text-chocolate">
        ${product.price}
      </p>
    </div>
  );
}




