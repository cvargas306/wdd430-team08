"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../components/auth/AuthContext";
import { useRouter, useParams } from "next/navigation";
import ProductCard from "@/app/components/shop/ProductCard";

interface Product {
  product_id: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  image_url: string | null;
  category: string | null;
  created_at: string;

  // Add these to satisfy ProductCard:
  seller_name: string;
  total_reviews: number;

  // Your existing optional fields:
  rating?: number;
  reviews?: number;
}

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


export default function SellerProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sellerId = params.id as string;
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    category: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwner = user && seller && user.seller_id === seller.seller_id;

  useEffect(() => {
    if (sellerId) {
      fetchSellerData();
    }
  }, [sellerId]);

  useEffect(() => {
    if (seller) {
      fetchProducts();
    }
  }, [seller]);

  const fetchSellerData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sellers/${sellerId}`);
      if (res.ok) {
        const data = await res.json();
        setSeller(data);
      } else {
        setError("Seller not found");
      }
    } catch (error) {
      console.error("Error fetching seller:", error);
      setError("Error loading seller");
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/products?seller_id=${sellerId}`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const addProduct = async () => {
    if (!isOwner || !newProduct.name || !newProduct.price) return;

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seller_id: seller.seller_id,
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.quantity) || 0,
          category: newProduct.category,
        }),
      });
      const product = await res.json();
      setProducts([product, ...products]);
      setNewProduct({ name: "", description: "", price: "", quantity: "", category: "" });
      setShowAddProduct(false);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>;
  }

  if (error || !seller) {
    return <div style={{ textAlign: "center", padding: "2rem" }}>{error || "Seller not found"}</div>;
  }

  return (
    <div style={{ backgroundColor: "#ffffff", color: "#4a2f1b", fontFamily: "var(--font-roboto)", minHeight: "100vh" }}>
      {/* Header */}
      <section style={{ padding: "4rem 2rem", textAlign: "center", backgroundColor: "#f9f5f0" }}>
        <h1 style={{
          fontFamily: "var(--font-playfair)",
          fontSize: "3rem",
          marginBottom: "1rem",
          color: "#4a2f1b"
        }}>
          {seller.name}
        </h1>
        <p style={{
          fontSize: "1.2rem",
          maxWidth: "600px",
          margin: "0 auto",
          lineHeight: "1.6"
        }}>
          Discover unique handcrafted items from this artisan.
        </p>
      </section>

      {/* Seller Info */}
      <section style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{
          backgroundColor: "#fefefe",
          border: "1px solid #e0d5c8",
          borderRadius: "12px",
          padding: "2rem",
          marginBottom: "2rem",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div>
              <strong>Category:</strong> {seller.category}
            </div>
            <div>
              <strong>Location:</strong> {seller.location}
            </div>
            <div>
              <strong>Rating:</strong> ⭐ {seller.rating} ({seller.reviews} reviews)
            </div>
            <div>
              <strong>Followers:</strong> {seller.followers.toLocaleString()}
            </div>
            <div>
              <strong>Years Active:</strong> {seller.years_active}
            </div>
          </div>
          <p style={{ marginTop: "1rem", lineHeight: "1.6" }}>{seller.description}</p>
          {isOwner && (
            <button
              onClick={() => router.push("/seller/profile")}
              style={{
                marginTop: "1rem",
                padding: "0.75rem 1.5rem",
                backgroundColor: "#8b5a3c",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Manage Profile
            </button>
          )}
        </div>
      </section>

      {/* Products Section */}
      <section style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem"
        }}>
          <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "2rem" }}>
            Products ({products.length})
          </h2>

          {isOwner && (
            <button
              onClick={() => setShowAddProduct(true)}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#8b5a3c",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Add New Product
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      </section>

      {/* Add Product Modal - Only for owner */}
      {isOwner && showAddProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            width: '400px',
            color: '#4a2f1b'
          }}>
            <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Add New Product</h3>
            <form onSubmit={(e) => { e.preventDefault(); addProduct(); }}>
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginBottom: '1rem',
                  border: '1px solid #4a2f1b',
                  borderRadius: '4px'
                }}
                required
              />
              <textarea
                placeholder="Description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginBottom: '1rem',
                  border: '1px solid #4a2f1b',
                  borderRadius: '4px',
                  minHeight: '80px'
                }}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginBottom: '1rem',
                  border: '1px solid #4a2f1b',
                  borderRadius: '4px'
                }}
                required
              />
              <input
                type="number"
                placeholder="Quantity"
                value={newProduct.quantity}
                onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginBottom: '1rem',
                  border: '1px solid #4a2f1b',
                  borderRadius: '4px'
                }}
              />
              <input
                type="text"
                placeholder="Category"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginBottom: '1rem',
                  border: '1px solid #4a2f1b',
                  borderRadius: '4px'
                }}
              />
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: '#8b5a3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Add Product
              </button>
            </form>
            <button
              onClick={() => setShowAddProduct(false)}
              style={{
                width: '100%',
                padding: '0.5rem',
                marginTop: '1rem',
                backgroundColor: 'transparent',
                color: '#4a2f1b',
                border: '1px solid #4a2f1b',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}