"use client";

import { useState, useEffect } from "react";

interface Seller {
  seller_id: string;
  name: string;
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

const mockSellers: Seller[] = [
  {
    seller_id: "1",
    name: "Clay & Light Studio",
    category: "Ceramics & Pottery",
    description: "Specializes in handcrafted ceramic pieces featuring earth-inspired glazes.",
    location: "Santa Fe, New Mexico",
    rating: 4.9,
    reviews: 324,
    years_active: 5,
    followers: 2840,
    image: "/placeholder-image.jpg", // placeholder
    email: "claylight@example.com",
    created_at: "2020-01-01T00:00:00Z",
  },
  {
    seller_id: "2",
    name: "Sustainable Textiles Co",
    category: "Organic Textiles",
    description: "Produces premium organic linens and hand-dyed fabrics through zero-waste methods.",
    location: "Portland, Oregon",
    rating: 4.8,
    reviews: 287,
    years_active: 3,
    followers: 1920,
    image: "/placeholder-image.jpg",
    email: "sustainable@example.com",
    created_at: "2021-01-01T00:00:00Z",
  },
  {
    seller_id: "3",
    name: "Forest & Grain Workshop",
    category: "Woodcraft",
    description: "Offers reclaimed and sustainably sourced wooden home and kitchen products.",
    location: "Asheville, North Carolina",
    rating: 4.7,
    reviews: 412,
    years_active: 7,
    followers: 3650,
    image: "/placeholder-image.jpg",
    email: "forestgrain@example.com",
    created_at: "2017-01-01T00:00:00Z",
  },
];

const useMock = false; // Fetch from database

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    if (useMock) {
      setSellers(mockSellers);
    } else {
      const fetchSellers = async () => {
        try {
          const res = await fetch("/api/sellers");
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const data = await res.json();
          if (Array.isArray(data)) {
            setSellers(data);
          } else {
            console.error("Expected array of sellers, got:", data);
            setSellers([]);
          }
        } catch (error) {
          console.error("Error fetching sellers:", error);
          setSellers([]);
        }
      };
      fetchSellers();
    }
  }, []);

  const addSeller = async () => {
    if (!name || !email) return alert("Name and email are required!");

    if (useMock) {
      const newSeller: Seller = {
        seller_id: Date.now().toString(),
        name,
        category: "New Category",
        description: "New description",
        location: "New Location",
        rating: 0,
        reviews: 0,
        years_active: 0,
        followers: 0,
        email,
        created_at: new Date().toISOString(),
      };
      setSellers([newSeller, ...sellers]);
      setName("");
      setEmail("");
    } else {
      try {
        const res = await fetch("/api/sellers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            category: "New Category",
            description: "New description",
            location: "New Location",
            rating: 0,
            reviews: 0,
            years_active: 0,
            followers: 0,
            email,
            password_hash: "testhash123",
          }),
        });
        const newSeller: Seller = await res.json();
        setSellers([newSeller, ...sellers]);
        setName("");
        setEmail("");
      } catch (error) {
        console.error("Error adding seller:", error);
      }
    }
  };

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
              <div style={{
                width: "100%",
                height: "200px",
                backgroundColor: "#f0e6d6",
                borderRadius: "8px",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#8b5a3c",
                fontSize: "1.2rem"
              }}>
                🖼️ Image Placeholder
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
              <button style={{
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

      {/* Admin Add Seller Form - Hidden in production */}
      {useMock && (
        <section style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto", borderTop: "1px solid #e0d5c8" }}>
          <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "2rem", marginBottom: "1rem" }}>Add New Seller (Dev Only)</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ padding: "0.5rem", border: "1px solid #4a2f1b", borderRadius: "4px" }}
            />
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: "0.5rem", border: "1px solid #4a2f1b", borderRadius: "4px" }}
            />
            <button
              onClick={addSeller}
              style={{ padding: "0.5rem 1rem", backgroundColor: "#4a2f1b", color: "#ffffff", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Add Seller
            </button>
          </div>
        </section>
      )}
    </div>
  );
}