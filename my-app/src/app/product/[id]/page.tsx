"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../components/auth/AuthContext";
import { Heart, Star } from "lucide-react";

interface Product {
  product_id: string;
  name: string;
  description: string;
  price: number;
  images: string[] | null;
  stock: number;
  category: string;
  seller_name: string;
  seller_rating: number;
  seller_reviews: number;
  created_at: string;
}

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

interface RelatedProduct {
  product_id: string;
  name: string;
  price: number;
  image_url: string | null;
  seller_name: string;
}

const ProductPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
      fetchRelatedProducts();
      checkIfFavorited();
    }
  }, [id, user]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();
      setProduct(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching product:", error);
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    // For now, mock reviews since reviews API might not be fully implemented
    setReviews([
      {
        id: "1",
        user_id: "user1",
        rating: 5,
        comment: "Absolutely beautiful craftsmanship! Exceeded my expectations.",
        created_at: "2024-01-15T00:00:00Z"
      },
      {
        id: "2",
        user_id: "user2",
        rating: 4,
        comment: "Great quality and fast shipping. Very satisfied.",
        created_at: "2024-01-10T00:00:00Z"
      }
    ]);
  };

  const fetchRelatedProducts = async () => {
    try {
      // Fetch products from same category
      const response = await fetch(`/api/products?limit=4`);
      const data = await response.json();
      setRelatedProducts(data.slice(0, 4).map((p: any) => ({
        product_id: p.product_id,
        name: p.name,
        price: p.price,
        image_url: p.image_url,
        seller_name: p.seller
      })));
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  const checkIfFavorited = async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/favorites");
      const favorites = await response.json();
      const isFav = favorites.some((f: any) => f.product_id === id);
      setIsFavorited(isFav);
    } catch (error) {
      console.error("Error checking favorites:", error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      if (isFavorited) {
        await fetch("/api/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: id }),
        });
        setIsFavorited(false);
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: id }),
        });
        setIsFavorited(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen px-6 pt-20 pb-20 sm:px-10 lg:px-20 bg-isabelline text-ebony">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="mb-8 bg-gray-200 rounded-lg h-96"></div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div>
                <div className="h-8 mb-4 bg-gray-200 rounded"></div>
                <div className="h-4 mb-2 bg-gray-200 rounded"></div>
                <div className="h-4 mb-2 bg-gray-200 rounded"></div>
                <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
              </div>
              <div>
                <div className="h-6 mb-2 bg-gray-200 rounded"></div>
                <div className="w-3/4 h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen px-6 pt-20 pb-20 sm:px-10 lg:px-20 bg-isabelline text-ebony">
        <div className="text-center">
          <h1 className="mb-4 font-serif text-2xl text-cafe">Product Not Found</h1>
          <p className="text-reseda">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : ['/placeholder-image.jpg'];

  return (
    <div className="min-h-screen px-6 pt-20 pb-20 sm:px-10 lg:px-20 bg-isabelline text-ebony">
      <div className="max-w-6xl mx-auto">

        {/* Product Details */}
        <div className="grid grid-cols-1 gap-8 mb-12 lg:grid-cols-2">

          {/* Image Gallery */}
          <div>
            <div className="relative mb-4">
              <img
                src={images[currentImageIndex]}
                alt={product.name}
                className="object-cover w-full rounded-lg h-96"
              />
              <button
                onClick={toggleFavorite}
                className={`absolute top-4 right-4 p-2 rounded-full ${
                  isFavorited ? 'bg-red-500 text-white' : 'bg-white/80 text-cafe'
                }`}
              >
                <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} />
              </button>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded border-2 ${
                      index === currentImageIndex ? 'border-cafe' : 'border-gray-300'
                    }`}
                  >
                    <img src={image} alt="" className="object-cover w-full h-full rounded" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="mb-2 font-serif text-3xl text-cafe">{product.name}</h1>
            <div className="flex items-center mb-4">
              <div className="flex items-center mr-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.floor(product.seller_rating) ? "text-yellow-400 fill-current" : "text-gray-300"}
                  />
                ))}
                <span className="ml-1 text-sm text-reseda">
                  {product.seller_rating} ({product.seller_reviews} reviews)
                </span>
              </div>
            </div>

            <p className="mb-4 text-2xl font-semibold text-chocolate">
              {(() => {
                console.log("PRICE:", product.price, typeof product.price);
                return `$${Number(product.price ?? 0).toFixed(2)}`;
              })()}
            </p>

            <div className="mb-6">
              <p className="mb-2 text-sm text-reseda">Sold by: {product.seller_name}</p>
              <p className="mb-2 text-sm text-reseda">Category: {product.category}</p>
              <p className="text-sm text-reseda">Stock: {product.stock} available</p>
            </div>

            <p className="mb-6 leading-relaxed text-ebony">{product.description}</p>

          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-12">
          <h2 className="mb-6 font-serif text-2xl text-cafe">Customer Reviews</h2>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-lg border border-[#d8d5d0]">
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}
                    />
                  ))}
                  <span className="ml-2 text-sm text-reseda">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && <p className="text-ebony">{review.comment}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Related Products */}
        <div>
          <h2 className="mb-6 font-serif text-2xl text-cafe">You Might Also Like</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <div
                key={relatedProduct.product_id}
                onClick={() => router.push(`/product/${relatedProduct.product_id}`)}
                className="bg-white border border-[#d8d5d0] rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <img
                  src={relatedProduct.image_url || '/placeholder-image.jpg'}
                  alt={relatedProduct.name}
                  className="object-cover w-full h-32 mb-3 rounded"
                />
                <h3 className="mb-1 font-medium truncate text-ebony">{relatedProduct.name}</h3>
                <p className="mb-1 text-sm text-reseda">by {relatedProduct.seller_name}</p>
                <p className="font-semibold text-chocolate">
                  {(() => {
                    console.log("RELATED PRICE:", relatedProduct.price, typeof relatedProduct.price);
                    return `$${Number(relatedProduct.price ?? 0).toFixed(2)}`;
                  })()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;