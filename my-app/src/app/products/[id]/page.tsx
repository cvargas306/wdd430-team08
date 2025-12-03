"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, Truck, ShieldCheck, RotateCcw, Minus, Plus } from "lucide-react";
import styles from "./product-detail.module.css";

// TODO: Replace with actual data from database
interface Review {
  id: number;
  userName: string;
  rating: number;
  date: string;
  comment: string;
}

interface Product {
  id: number;
  name: string;
  seller: string;
  price: number;
  rating: number;
  totalReviews: number;
  category: string;
  description: string;
  imageUrl: string;
  stock: number;
}

// MOCK DATA - Replace with database fetch
const mockProduct: Product = {
  id: 1,
  name: "Handwoven Ceramic Bowl",
  seller: "Clay & Light Studio",
  price: 85,
  rating: 4.9,
  totalReviews: 124,
  category: "Ceramics",
  description:
    "A beautifully handcrafted ceramic bowl made using traditional wheel-throwing techniques. Each piece is uniquely glazed with natural, earth-inspired colors that showcase the artisan's attention to detail.",
  imageUrl: "/ceramic-bowl-img.png", // Replace with actual image
  stock: 12,
};

const mockReviews: Review[] = [
  {
    id: 1,
    userName: "Sarah M.",
    rating: 5,
    date: "2024-01-15",
    comment:
      "Beautiful and well-crafted! This ceramic bowl is absolutely stunning. The glazing is perfect and it arrived beautifully packaged. Highly recommend this artisan!",
  },
  {
    id: 2,
    userName: "James T.",
    rating: 5,
    date: "2024-01-10",
    comment:
      "Exceeded my expectations. I bought this as a gift and the recipient loved it. The quality is exceptional and the attention to detail is remarkable.",
  },
];

const ratingDistribution = [
  { stars: 5, count: 3 },
  { stars: 4, count: 1 },
  { stars: 3, count: 0 },
  { stars: 2, count: 0 },
  { stars: 1, count: 0 },
];

export default function ProductDetail() {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = mockProduct; // TODO: Fetch from database using product ID from URL

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    console.log(`Added ${quantity} items to cart`);
    alert(`Added ${quantity} ${product.name} to cart!`);
  };

  const renderStars = (rating: number) => {
    return (
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            className={star <= rating ? styles.starFilled : styles.starEmpty}
            fill={star <= rating ? "currentColor" : "none"}
          />
        ))}
      </div>
    );
  };

  const totalRatings = ratingDistribution.reduce(
    (sum, item) => sum + item.count,
    0
  );

  return (
    <main className={styles.main}>
      {/* Product Section */}
      <div className={styles.productSection}>
        {/* Image Gallery */}
        <div className={styles.imageGallery}>
          <div className={styles.categoryBadge}>{product.category}</div>
          <div className={styles.mainImage}>
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className={styles.productImage}
              priority
            />
          </div>
          {/* TODO: Add thumbnail images when multiple images available */}
        </div>

        {/* Product Info */}
        <div className={styles.productInfo}>
          <div className={styles.sellerName}>{product.seller}</div>
          <h1 className={styles.productName}>{product.name}</h1>

          {/* Rating */}
          <div className={styles.ratingSection}>
            {renderStars(product.rating)}
            <span className={styles.ratingNumber}>
              {product.rating} ({product.totalReviews} reviews)
            </span>
          </div>

          {/* Price */}
          <div className={styles.priceSection}>
            <span className={styles.price}>${product.price}</span>
          </div>

          {/* Description */}
          <p className={styles.description}>{product.description}</p>

          {/* Quantity Selector */}
          <div className={styles.quantitySection}>
            <button
              onClick={decrementQuantity}
              className={styles.quantityButton}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus size={20} />
            </button>
            <span className={styles.quantity}>{quantity}</span>
            <button
              onClick={incrementQuantity}
              className={styles.quantityButton}
              disabled={quantity >= product.stock}
              aria-label="Increase quantity"
            >
              <Plus size={20} />
            </button>
            <span className={styles.totalPrice}>Total: ${product.price * quantity}</span>
          </div>

          {/* Add to Cart Button */}
          <button onClick={handleAddToCart} className={styles.addToCartButton}>
            Add To Cart
          </button>

          {/* Features */}
          <div className={styles.features}>
            <div className={styles.feature}>
              <Truck size={20} />
              <span>Free shipping on orders over $100</span>
            </div>
            <div className={styles.feature}>
              <ShieldCheck size={20} />
              <span>Secure checkout with buyer protection</span>
            </div>
            <div className={styles.feature}>
              <RotateCcw size={20} />
              <span>30-day return policy for peace of mind</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className={styles.reviewsSection}>
        <h2 className={styles.reviewsTitle}>Customer Reviews</h2>
        <p className={styles.reviewsSubtitle}>
          See what customers think about this artisan creation
        </p>

        <div className={styles.reviewsContainer}>
          {/* Rating Summary */}
          <div className={styles.ratingSummary}>
            <div className={styles.overallRating}>
              <div className={styles.ratingNumber}>{product.rating}</div>
              <div className={styles.ratingText}>out of 5</div>
              {renderStars(product.rating)}
            </div>

            <button className={styles.writeReviewButton}>Write a review</button>
          </div>

          {/* Rating Distribution */}
          <div className={styles.ratingDistribution}>
            {ratingDistribution.map((item) => (
              <div key={item.stars} className={styles.ratingBar}>
                <span className={styles.starLabel}>{item.stars} star</span>
                <div className={styles.barContainer}>
                  <div
                    className={styles.barFill}
                    style={{
                      width: totalRatings > 0 ? `${(item.count / totalRatings) * 100}%` : "0%",
                    }}
                  />
                </div>
                <span className={styles.countLabel}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Individual Reviews */}
        <div className={styles.reviewsList}>
          {mockReviews.map((review) => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <span className={styles.reviewerName}>{review.userName}</span>
                {renderStars(review.rating)}
              </div>
              <div className={styles.reviewBody}>
                <h4 className={styles.reviewTitle}>
                  {review.rating === 5
                    ? "Beautiful and well-crafted!"
                    : "Exceeded my expectations"}
                </h4>
                <p className={styles.reviewComment}>{review.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}