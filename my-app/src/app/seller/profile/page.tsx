"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../components/auth/AuthContext";
import { useRouter } from "next/navigation";
import ImageUpload from "../../components/ImageUpload";

interface Product {
  product_id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  category: string | null;
  rating?: number;
  reviews?: number;
}

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
  created_at: string;
}


export default function SellerProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingSellerImage, setEditingSellerImage] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    images: [] as string[],
  });

  useEffect(() => {
    if (!isLoading && (!user || !user.is_seller)) {
      router.push("/");
      return;
    }

    if (user && user.is_seller) {
      fetchSellerData();
      fetchProducts();
    }
  }, [user, isLoading, router]);

  const fetchSellerData = async () => {
    if (!user?.seller_id) return;

    try {
      const res = await fetch(`/api/sellers/${user.seller_id}`);
      const data = await res.json();
      setSeller(data);
    } catch (error) {
      console.error("Error fetching seller:", error);
    }
  };

  const fetchProducts = async () => {
    if (!user?.seller_id) return;

    try {
      const res = await fetch(`/api/products?seller_id=${user.seller_id}`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const updateSellerImage = async (imageUrl: string) => {
    if (!user?.seller_id) return;

    try {
      const res = await fetch(`/api/sellers/${user.seller_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageUrl }),
      });
      const updatedSeller = await res.json();
      setSeller(updatedSeller);
      setEditingSellerImage(false);
    } catch (error) {
      console.error("Error updating seller image:", error);
    }
  };

  const addProduct = async () => {
    if (!user?.seller_id || !newProduct.name || !newProduct.price) return;

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seller_id: user.seller_id,
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock) || 0,
          category: newProduct.category,
          images: newProduct.images,
        }),
      });
      const product = await res.json();
      setProducts([product, ...products]);
      setNewProduct({ name: "", description: "", price: "", stock: "", category: "", images: [] });
      setShowAddProduct(false);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  if (isLoading) {
    return <div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>;
  }

  if (!user || !user.is_seller) {
    return <div style={{ textAlign: "center", padding: "2rem" }}>Access denied. Please login as a seller.</div>;
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
          Seller Dashboard
        </h1>
        <p style={{
          fontSize: "1.2rem",
          maxWidth: "600px",
          margin: "0 auto",
          lineHeight: "1.6"
        }}>
          Manage your products and view your seller profile.
        </p>
      </section>

      {/* Seller Info */}
      {seller && (
        <section style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{
            backgroundColor: "#fefefe",
            border: "1px solid #e0d5c8",
            borderRadius: "12px",
            padding: "2rem",
            marginBottom: "2rem",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
          }}>
            <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "2rem", marginBottom: "1rem" }}>
              {seller.name}
            </h2>
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
            {seller.image && (
              <img
                src={seller.image}
                alt="Seller Profile"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  marginTop: "1rem",
                  objectFit: "cover"
                }}
              />
            )}
            <button
              onClick={() => setEditingSellerImage(true)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#8b5a3c",
                color: "#ffffff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginTop: "1rem"
              }}
            >
              {seller.image ? "Update Profile Image" : "Add Profile Image"}
            </button>
            {editingSellerImage && (
              <div style={{ marginTop: "1rem" }}>
                <ImageUpload
                  onImageUpload={updateSellerImage}
                  currentImage={seller.image}
                  onRemove={() => updateSellerImage("")}
                />
                <button
                  onClick={() => setEditingSellerImage(false)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "transparent",
                    color: "#4a2f1b",
                    border: "1px solid #4a2f1b",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginTop: "0.5rem"
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Products Section */}
      <section style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "2rem" }}>
            Your Products ({products.length})
          </h2>
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
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem"
        }}>
          {products.map((product) => (
            <div key={product.product_id} style={{
              backgroundColor: "#fefefe",
              border: "1px solid #e0d5c8",
              borderRadius: "12px",
              padding: "1.5rem",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
            }}>
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
                marginBottom: "0.5rem"
              }}>
                {product.name}
              </h3>
              <p style={{
                fontSize: "1rem",
                lineHeight: "1.5",
                marginBottom: "1rem",
                color: "#6b4f3a"
              }}>
                {product.description}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#8b5a3c" }}>
                  ${Number(product.price ?? 0).toFixed(2)}
                </span>
                <span style={{ fontSize: "0.9rem", color: "#6b4f3a" }}>
                  Stock: {product.stock}
                </span>
              </div>
              {product.rating && (
                <div style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#6b4f3a" }}>
                  ⭐ {product.rating} ({product.reviews} reviews)
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Add Product Modal */}
      {showAddProduct && (
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
                placeholder="Stock"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
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
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Product Image:</label>
                <ImageUpload
                  onImageUpload={(url) => setNewProduct({ ...newProduct, images: [url] })}
                  currentImage={newProduct.images[0]}
                  onRemove={() => setNewProduct({ ...newProduct, images: [] })}
                />
              </div>
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