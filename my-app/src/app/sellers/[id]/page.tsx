"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../components/auth/AuthContext";
import { useRouter, useParams } from "next/navigation";

interface Product {
  product_id: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  image_url: string | null;
  category: string | null;
  created_at: string;
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

const mockSellersData: Record<string, Seller> = {
  "clay-light-studio": {
    seller_id: "1",
    name: "Clay & Light Studio",
    slug: "clay-light-studio",
    category: "Ceramics & Pottery",
    description: "Specializes in handcrafted ceramic pieces featuring earth-inspired glazes.",
    location: "Santa Fe, New Mexico",
    rating: 4.9,
    reviews: 324,
    years_active: 5,
    followers: 2840,
    email: "claylight@example.com",
    created_at: "2020-01-01T00:00:00Z",
  },
  "sustainable-textiles-co": {
    seller_id: "2",
    name: "Sustainable Textiles Co",
    slug: "sustainable-textiles-co",
    category: "Organic Textiles",
    description: "Produces premium organic linens and hand-dyed fabrics through zero-waste methods.",
    location: "Portland, Oregon",
    rating: 4.8,
    reviews: 287,
    years_active: 3,
    followers: 1920,
    email: "sustainable@example.com",
    created_at: "2021-01-01T00:00:00Z",
  },
  "forest-grain-workshop": {
    seller_id: "3",
    name: "Forest & Grain Workshop",
    slug: "forest-grain-workshop",
    category: "Woodcraft",
    description: "Offers reclaimed and sustainably sourced wooden home and kitchen products.",
    location: "Asheville, North Carolina",
    rating: 4.7,
    reviews: 412,
    years_active: 7,
    followers: 3650,
    email: "forestgrain@example.com",
    created_at: "2017-01-01T00:00:00Z",
  },
};

const mockProducts: Record<string, Product[]> = {
  "clay-light-studio": [
    {
      product_id: "1",
      name: "Handcrafted Ceramic Mug",
      description: "Beautiful hand-thrown mug with organic glaze",
      price: 45.00,
      quantity: 10,
      image_url: "/placeholder-image.jpg",
      category: "Ceramics & Pottery",
      created_at: "2023-01-01T00:00:00Z",
      rating: 4.8,
      reviews: 12,
    },
    {
      product_id: "2",
      name: "Ceramic Bowl Set",
      description: "Set of 4 nesting bowls",
      price: 120.00,
      quantity: 5,
      image_url: "/placeholder-image.jpg",
      category: "Ceramics & Pottery",
      created_at: "2023-02-01T00:00:00Z",
      rating: 4.9,
      reviews: 8,
    },
  ],
  "sustainable-textiles-co": [
    {
      product_id: "3",
      name: "Organic Linen Pillow",
      description: "Premium organic linen pillow, hand-dyed using zero-waste methods.",
      price: 65.00,
      quantity: 15,
      image_url: "/placeholder-image.jpg",
      category: "Organic Textiles",
      created_at: "2023-03-01T00:00:00Z",
      rating: 4.7,
      reviews: 20,
    },
  ],
  "forest-grain-workshop": [
    {
      product_id: "4",
      name: "Wooden Cutting Board",
      description: "Handcrafted cutting board from sustainably sourced wood.",
      price: 95.00,
      quantity: 8,
      image_url: "/placeholder-image.jpg",
      category: "Woodcraft",
      created_at: "2023-04-01T00:00:00Z",
      rating: 4.9,
      reviews: 15,
    },
  ],
};

const useMock = process.env.NODE_ENV === 'development';

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
    if (useMock) {
      // Mock seller data - fetch based on slug
      const mockSeller = mockSellersData[sellerId];
      if (mockSeller) {
        setSeller(mockSeller);
      } else {
        setError("Seller not found");
      }
      setLoading(false);
    } else {
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
    }
  };

  const fetchProducts = async () => {
    if (!seller) return;
    if (useMock) {
      setProducts(mockProducts[sellerId] || []);
    } else {
      try {
        const res = await fetch(`/api/products?seller_id=${seller.seller_id}`);
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }
  };

  const addProduct = async () => {
    if (!isOwner || !newProduct.name || !newProduct.price) return;

    if (useMock) {
      const product: Product = {
        product_id: Date.now().toString(),
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        quantity: parseInt(newProduct.quantity) || 0,
        image_url: null,
        category: newProduct.category,
        created_at: new Date().toISOString(),
      };
      setProducts([product, ...products]);
      setNewProduct({ name: "", description: "", price: "", quantity: "", category: "" });
      setShowAddProduct(false);
    } else {
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
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
                  ${product.price.toFixed(2)}
                </span>
                <span style={{ fontSize: "0.9rem", color: "#6b4f3a" }}>
                  Stock: {product.quantity}
                </span>
              </div>
              {product.rating && (
                <div style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#6b4f3a" }}>
                  ⭐ {product.rating} ({product.reviews} reviews)
                </div>
              )}
              {!isOwner && (
                <button
                  style={{
                    width: "100%",
                    marginTop: "1rem",
                    padding: "0.75rem",
                    backgroundColor: "#8b5a3c",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                  onClick={() => router.push(`/product/${product.product_id}`)}
                >
                  View Product
                </button>
              )}
            </div>
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