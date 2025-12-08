"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  Star,
  X,
} from "lucide-react";
import styles from "./product-detail.module.css";

interface Review {
  review_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface Product {
  product_id: string;
  name: string;
  seller_name: string;
  price: number;
  rating: number;
  total_reviews: number;
  category: string;
  description: string;
  images: string[];
  stock: number;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);

  // WRITE REVIEW STATE
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch product + reviews
  const loadProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error("Failed to fetch product");

      const data = await res.json();
      setProduct(data.product);
      setReviews(data.reviews);
    } catch (error) {
      console.error("Product fetch error:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!id) return;
    loadProduct();
  }, [id]);

  // ⭐ RATING STARS (read-only)
  const renderStars = (rating: number) => (
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

  // ⭐ RATING INPUT (clickable)
  const renderRatingInput = () => (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={26}
          className={
            star <= newRating ? styles.starFilled : styles.starEmpty
          }
          fill={star <= newRating ? "currentColor" : "none"}
          onClick={() => setNewRating(star)}
          style={{ cursor: "pointer" }}
        />
      ))}
    </div>
  );

  // SUBMIT REVIEW
  const submitReview = async () => {
    if (newRating === 0) {
      setErrorMsg("Please select a rating.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: newRating,
          comment: newComment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to submit review");
        setSubmitting(false);
        return;
      }

      // Refresh product info + reviews
      await loadProduct();

      // Reset modal
      setSubmitting(false);
      setShowReviewModal(false);
      setNewRating(0);
      setNewComment("");

    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong.");
    }

    setSubmitting(false);
  };

  // Loading state
  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.skeletonContainer}>
          
          <div className={styles.skeletonImage}></div>

          <div className={styles.skeletonInfo}>
            <div className={styles.skeletonTitle}></div>
            <div className={styles.skeletonSmall}></div>
            <div className={styles.skeletonPrice}></div>

            <div className={styles.skeletonText}></div>
            <div className={styles.skeletonText}></div>

            <div className={styles.skeletonButton}></div>
          </div>

        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className={styles.main}>
        <p className={styles.error}>Product not found.</p>
      </main>
    );
  }

  // Rating distribution histogram (from reviews)
  const ratingCount = [5, 4, 3, 2, 1].map((star) => ({
    stars: star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const totalRatings = reviews.length;

  return (
    <main className={styles.main}>
      {/* ============================
          PRODUCT SECTION
      ============================= */}
      <div className={styles.productSection}>
        {/* IMAGE GALLERY */}
        <div className={styles.imageGallery}>
          <div className={styles.categoryBadge}>{product.category}</div>

          {/* Main image */}
          <div className={styles.mainImage}>
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              className={styles.productImage}
              priority
            />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className={styles.thumbnailRow}>
              {product.images.map((img, index) => (
                <button
                  key={index}
                  className={`${styles.thumbnail} ${
                    index === selectedImage ? styles.activeThumb : ""
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <Image
                    src={img}
                    alt={`thumb-${index}`}
                    fill
                    className={styles.thumbnailImage}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PRODUCT DETAILS */}
        <div className={styles.productInfo}>
          <div className={styles.sellerName}>{product.seller_name}</div>
          <h1 className={styles.productName}>{product.name}</h1>

          {/* Rating */}
          <div className={styles.ratingSection}>
            {renderStars(product.rating)}
            <span className={styles.ratingNumber}>
              {product.rating} ({product.total_reviews} reviews)
            </span>
          </div>

          {/* Price */}
          <div className={styles.priceSection}>
            <span className={styles.price}>${product.price}</span>
          </div>

          {/* Description */}
          <p className={styles.description}>{product.description}</p>

          {/* Add to cart */}
          <button className={styles.addToCartButton}>Add To Cart</button>
        </div>
      </div>

      {/* ============================
          REVIEWS
      ============================= */}
      <div className={styles.reviewsSection}>
        <h2 className={styles.reviewsTitle}>Customer Reviews</h2>
        <p className={styles.reviewsSubtitle}>
          See what customers think about this artisan creation
        </p>

        {/* Rating Summary */}
        <div className={styles.reviewsContainer}>
          <div className={styles.ratingSummary}>
            <div className={styles.overallRating}>
              <div className={styles.ratingNumber}>{product.rating}</div>
              <div className={styles.ratingText}>out of 5</div>
              {renderStars(product.rating)}
            </div>

            <button
              className={styles.writeReviewButton}
              onClick={() => setShowReviewModal(true)}
            >
              Write a Review
            </button>
          </div>

          {/* Histogram */}
          <div className={styles.ratingDistribution}>
            {ratingCount.map((item) => (
              <div key={item.stars} className={styles.ratingBar}>
                <span className={styles.starLabel}>{item.stars} star</span>
                <div className={styles.barContainer}>
                  <div
                    className={styles.barFill}
                    style={{
                      width:
                        totalRatings > 0
                          ? `${(item.count / totalRatings) * 100}%`
                          : "0%",
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
          {reviews.length === 0 ? (
            <p className={styles.noReviews}>No reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.review_id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <span className={styles.reviewerName}>
                    {review.user_name}
                  </span>
                  {renderStars(review.rating)}
                </div>
                <div className={styles.reviewBody}>
                  <p className={styles.reviewComment}>{review.comment}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ============================
          WRITE REVIEW MODAL
      ============================= */}
      {showReviewModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <button
              className={styles.closeButton}
              onClick={() => setShowReviewModal(false)}
            >
              <X size={20} />
            </button>

            <h3 className={styles.modalTitle}>Write a Review</h3>

            {/* RATING INPUT */}
            <div className={styles.modalRating}>{renderRatingInput()}</div>

            {/* COMMENT INPUT */}
            <textarea
              className={styles.modalTextarea}
              placeholder="Write your thoughts..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />

            {errorMsg && (
              <p className={styles.errorText}>{errorMsg}</p>
            )}

            <button
              className={styles.submitReviewButton}
              disabled={submitting}
              onClick={submitReview}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

