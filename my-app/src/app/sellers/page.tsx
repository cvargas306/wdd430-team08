"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Seller {
  seller_id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  location: string;
  rating: number;
  reviews: number;
  years_active: number;
  followers: number;
  image?: string;
  email: string;
  created_at: string;
}


export default function SellersPage() {
  const router = useRouter();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const res = await fetch("/api/sellers");
        const data: Seller[] = await res.json();
        setSellers(data);
      } catch (error) {
        console.error("Error fetching sellers:", error);
      }
    };
    fetchSellers();
  }, []);


  return (
    <div style={{ backgroundColor: "#ffffff", color: "#4a2f1b", fontFamily: "var(--font-roboto)", minHeight: "100vh" }}>
      {/* Introductory Section */}
      <section style={{ padding: "4rem 2rem", textAlign: "center", backgroundColor: "#f9f5f0" }}>
        <span style={{
          display: "inline-block",
          backgroundColor: "#8b5a3c",
          color: "#ffffff",
          padding: "0.5rem 1rem",
          borderRadius: "20px",
          fontSize: "0.9rem",
          fontWeight: "bold",
          marginBottom: "1rem"
        }}>
          Meet Our Artisans
        </span>
        <h1 style={{
          fontFamily: "var(--font-playfair)",
          fontSize: "3rem",
          marginBottom: "1rem",
          color: "#4a2f1b"
        }}>
          Discover Independent Creators
        </h1>
        <p style={{
          fontSize: "1.2rem",
          maxWidth: "600px",
          margin: "0 auto",
          lineHeight: "1.6"
        }}>
          Explore our curated collection of talented artisans who pour their passion into every creation. From handcrafted ceramics to sustainable textiles, discover the stories and craftsmanship behind each piece.
        </p>
      </section>

      {/* Sellers Grid */}
      <section style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <label htmlFor="category-filter" style={{ marginRight: "1rem", fontSize: "1.1rem", fontWeight: "bold" }}>Filter by Category:</label>
          <select
            id="category-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: "0.5rem",
              border: "1px solid #4a2f1b",
              borderRadius: "4px",
              fontSize: "1rem",
              backgroundColor: "#ffffff",
              color: "#4a2f1b"
            }}
          >
            <option value="All">All Categories</option>
            <option value="Ceramics & Pottery">Ceramics & Pottery</option>
            <option value="Organic Textiles">Organic Textiles</option>
            <option value="Woodcraft">Woodcraft</option>
          </select>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "2rem"
        }}>
          {sellers.filter(seller => filter === "All" || seller.category === filter).map((seller) => (
            <div key={seller.seller_id} style={{
              backgroundColor: "#fefefe",
              border: "1px solid #e0d5c8",
              borderRadius: "12px",
              padding: "1.5rem",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              transition: "transform 0.2s",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div
                style={{
                  width: "100%",
                  height: "200px",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  overflow: "hidden",
                  backgroundColor: "#f0e6d6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {seller.image ? (
                  <img
                    src={seller.image}
                    alt={seller.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span style={{ color: "#8b5a3c", fontSize: "1.2rem" }}>🖼️ No image</span>
                )}
              </div>
              <h3 style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "1.5rem",
                marginBottom: "0.5rem",
                color: "#4a2f1b"
              }}>
                {seller.name}
              </h3>
              <p style={{
                fontSize: "0.9rem",
                color: "#8b5a3c",
                fontWeight: "bold",
                marginBottom: "0.5rem"
              }}>
                {seller.category}
              </p>
              <p style={{
                fontSize: "1rem",
                lineHeight: "1.5",
                marginBottom: "1rem",
                color: "#4a2f1b"
              }}>
                {seller.description}
              </p>
              <div style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                color: "#6b4f3a"
              }}>
                📍 {seller.location}
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                color: "#6b4f3a"
              }}>
                ⭐ {seller.rating} ({seller.reviews} reviews)
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.9rem",
                color: "#6b4f3a",
                marginBottom: "1rem"
              }}>
                <span>{seller.years_active} years active</span>
                <span>{seller.followers.toLocaleString()} followers</span>
              </div>
              <button
                onClick={() => router.push(`/sellers/${seller.seller_id}`)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "#8b5a3c",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#6b4f3a"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#8b5a3c"}
              >
                Visit Shop
              </button>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}