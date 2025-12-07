"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../components/auth/AuthContext";
import { useRouter } from "next/navigation";

interface Product {
  product_id: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  image_url: string | null;
  category: string | null;
  category_id: string;
  created_at: string;
  rating?: number;
  reviews?: number;
}

interface Category {
  id: string;
  name: string;
}

interface Analytics {
  totalSales: number;
  totalRevenue: number;
  totalReviews: number;
  averageRating: number;
}

const SellerDashboardPage = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    category_id: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || !user.is_seller)) {
      router.push("/");
      return;
    }

    if (user && user.is_seller) {
      fetchCategories();
      fetchProducts();
      fetchAnalytics();
    }
  }, [user, isLoading, router]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
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

  const fetchAnalytics = async () => {
    if (!user?.seller_id) return;

    try {
      // Assuming we have an analytics API
      const res = await fetch(`/api/sellers/${user.seller_id}/analytics`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      } else {
        // Mock analytics if API doesn't exist
        setAnalytics({
          totalSales: 1250,
          totalRevenue: 45678.90,
          totalReviews: 89,
          averageRating: 4.7,
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setAnalytics({
        totalSales: 1250,
        totalRevenue: 45678.90,
        totalReviews: 89,
        averageRating: 4.7,
      });
    }
    setLoading(false);
  };

  const handleCreateProduct = async () => {
    if (!user?.seller_id || !newProduct.name || !newProduct.price || !newProduct.category_id) return;

    const categoryName = categories.find(cat => cat.id === newProduct.category_id)?.name;
    if (!categoryName) return;

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seller_id: user.seller_id,
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.quantity) || 0,
          category: categoryName,
        }),
      });
      const product = await res.json();
      setProducts([product, ...products]);
      setNewProduct({ name: "", description: "", price: "", quantity: "", category_id: "" });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  const handleUpdateProduct = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.product_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.quantity,
          category_id: product.category_id,
        }),
      });
      if (res.ok) {
        setProducts(products.map(p => p.product_id === product.product_id ? product : p));
        setEditingProduct(null);
      }
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts(products.filter(p => p.product_id !== productId));
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  if (isLoading || loading) {
    return (
      <div style={{ backgroundColor: "#ffffff", color: "#4a2f1b", fontFamily: "var(--font-roboto)", minHeight: "100vh" }}>
        {/* Header Skeleton */}
        <section style={{ padding: "4rem 2rem", textAlign: "center", backgroundColor: "#f9f5f0" }}>
          <div className="animate-pulse">
            <div style={{ height: "3rem", backgroundColor: "#e0d5c8", borderRadius: "8px", marginBottom: "1rem", maxWidth: "400px", margin: "0 auto" }}></div>
            <div style={{ height: "1.5rem", backgroundColor: "#e0d5c8", borderRadius: "4px", maxWidth: "600px", margin: "0 auto" }}></div>
          </div>
        </section>

        {/* Analytics Skeleton */}
        <section style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
          <div className="animate-pulse">
            <div style={{ height: "2rem", backgroundColor: "#e0d5c8", borderRadius: "8px", marginBottom: "2rem", maxWidth: "200px" }}></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem" }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{
                  height: "150px",
                  backgroundColor: "#f0e6d6",
                  borderRadius: "12px"
                }}></div>
              ))}
            </div>
          </div>
        </section>

        {/* Products Skeleton */}
        <section style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
          <div className="animate-pulse">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <div style={{ height: "2rem", backgroundColor: "#e0d5c8", borderRadius: "8px", width: "200px" }}></div>
              <div style={{ height: "3rem", backgroundColor: "#e0d5c8", borderRadius: "8px", width: "150px" }}></div>
            </div>
            <div style={{ height: "400px", backgroundColor: "#f0e6d6", borderRadius: "12px" }}></div>
          </div>
        </section>
      </div>
    );
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
          Manage your products and track your performance.
        </p>
      </section>

      {/* Analytics */}
      {analytics && (
        <section style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "2rem", marginBottom: "2rem" }}>
            Analytics
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "2rem"
          }}>
            <div style={{
              backgroundColor: "#fefefe",
              border: "1px solid #e0d5c8",
              borderRadius: "12px",
              padding: "2rem",
              textAlign: "center",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
            }}>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Total Sales</h3>
              <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#8b5a3c" }}>
                {analytics.totalSales.toLocaleString()}
              </p>
            </div>
            <div style={{
              backgroundColor: "#fefefe",
              border: "1px solid #e0d5c8",
              borderRadius: "12px",
              padding: "2rem",
              textAlign: "center",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
            }}>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Revenue</h3>
              <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#8b5a3c" }}>
                ${analytics.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div style={{
              backgroundColor: "#fefefe",
              border: "1px solid #e0d5c8",
              borderRadius: "12px",
              padding: "2rem",
              textAlign: "center",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
            }}>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Reviews</h3>
              <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#8b5a3c" }}>
                {analytics.totalReviews}
              </p>
            </div>
            <div style={{
              backgroundColor: "#fefefe",
              border: "1px solid #e0d5c8",
              borderRadius: "12px",
              padding: "2rem",
              textAlign: "center",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
            }}>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Avg Rating</h3>
              <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#8b5a3c" }}>
                ⭐ {analytics.averageRating}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Products Management */}
      <section style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "2rem" }}>
            Products ({products.length})
          </h2>
          <button
            onClick={() => setShowCreateForm(true)}
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

        {/* Products List - Responsive */}
        <div className="hidden md:block">
          {/* Desktop Table */}
          <div style={{
            backgroundColor: "#fefefe",
            border: "1px solid #e0d5c8",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9f5f0" }}>
                  <th style={{ padding: "1rem", textAlign: "left", borderBottom: "1px solid #e0d5c8" }}>Name</th>
                  <th style={{ padding: "1rem", textAlign: "left", borderBottom: "1px solid #e0d5c8" }}>Category</th>
                  <th style={{ padding: "1rem", textAlign: "left", borderBottom: "1px solid #e0d5c8" }}>Price</th>
                  <th style={{ padding: "1rem", textAlign: "left", borderBottom: "1px solid #e0d5c8" }}>Stock</th>
                  <th style={{ padding: "1rem", textAlign: "left", borderBottom: "1px solid #e0d5c8" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.product_id} style={{ borderBottom: "1px solid #e0d5c8" }}>
                    <td style={{ padding: "1rem" }}>
                      {editingProduct?.product_id === product.product_id ? (
                        <input
                          type="text"
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          style={{ width: "100%", padding: "0.5rem", border: "1px solid #4a2f1b", borderRadius: "4px" }}
                        />
                      ) : (
                        product.name
                      )}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {editingProduct?.product_id === product.product_id ? (
                        <select
                          value={editingProduct.category_id || ""}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                          style={{ width: "100%", padding: "0.5rem", border: "1px solid #4a2f1b", borderRadius: "4px" }}
                        >
                          <option value="">Select Category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      ) : (
                        categories.find(cat => cat.id === product.category_id)?.name || product.category
                      )}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {editingProduct?.product_id === product.product_id ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                          style={{ width: "100%", padding: "0.5rem", border: "1px solid #4a2f1b", borderRadius: "4px" }}
                        />
                      ) : (
                        `$${product.price.toFixed(2)}`
                      )}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {editingProduct?.product_id === product.product_id ? (
                        <input
                          type="number"
                          value={editingProduct.quantity}
                          onChange={(e) => setEditingProduct({ ...editingProduct, quantity: parseInt(e.target.value) })}
                          style={{ width: "100%", padding: "0.5rem", border: "1px solid #4a2f1b", borderRadius: "4px" }}
                        />
                      ) : (
                        product.quantity
                      )}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {editingProduct?.product_id === product.product_id ? (
                        <div>
                          <button
                            onClick={() => handleUpdateProduct(editingProduct)}
                            style={{
                              padding: "0.25rem 0.5rem",
                              backgroundColor: "#8b5a3c",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              marginRight: "0.5rem",
                              cursor: "pointer"
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingProduct(null)}
                            style={{
                              padding: "0.25rem 0.5rem",
                              backgroundColor: "transparent",
                              color: "#4a2f1b",
                              border: "1px solid #4a2f1b",
                              borderRadius: "4px",
                              cursor: "pointer"
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div>
                          <button
                            onClick={() => setEditingProduct(product)}
                            style={{
                              padding: "0.25rem 0.5rem",
                              backgroundColor: "#8b5a3c",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              marginRight: "0.5rem",
                              cursor: "pointer"
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.product_id)}
                            style={{
                              padding: "0.25rem 0.5rem",
                              backgroundColor: "#dc3545",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer"
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="space-y-4 md:hidden">
          {products.map((product) => (
            <div key={product.product_id} style={{
              backgroundColor: "#fefefe",
              border: "1px solid #e0d5c8",
              borderRadius: "12px",
              padding: "1rem",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
            }}>
              <div style={{ marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                  {editingProduct?.product_id === product.product_id ? (
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      style={{ width: "100%", padding: "0.5rem", border: "1px solid #4a2f1b", borderRadius: "4px" }}
                    />
                  ) : (
                    product.name
                  )}
                </h3>
                <p style={{ color: "#6b4f3a", marginBottom: "0.5rem" }}>
                  Category: {editingProduct?.product_id === product.product_id ? (
                    <select
                      value={editingProduct.category_id || ""}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                      style={{ padding: "0.25rem", border: "1px solid #4a2f1b", borderRadius: "4px" }}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  ) : (
                    categories.find(cat => cat.id === product.category_id)?.name || product.category
                  )}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "bold", color: "#8b5a3c" }}>
                    {editingProduct?.product_id === product.product_id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                        style={{ width: "80px", padding: "0.25rem", border: "1px solid #4a2f1b", borderRadius: "4px" }}
                      />
                    ) : (
                      `$${product.price.toFixed(2)}`
                    )}
                  </span>
                  <span style={{ color: "#6b4f3a" }}>
                    Stock: {editingProduct?.product_id === product.product_id ? (
                      <input
                        type="number"
                        value={editingProduct.quantity}
                        onChange={(e) => setEditingProduct({ ...editingProduct, quantity: parseInt(e.target.value) })}
                        style={{ width: "60px", padding: "0.25rem", border: "1px solid #4a2f1b", borderRadius: "4px" }}
                      />
                    ) : (
                      product.quantity
                    )}
                  </span>
                </div>
              </div>
              <div>
                {editingProduct?.product_id === product.product_id ? (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => handleUpdateProduct(editingProduct)}
                      style={{
                        flex: 1,
                        padding: "0.5rem",
                        backgroundColor: "#8b5a3c",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingProduct(null)}
                      style={{
                        flex: 1,
                        padding: "0.5rem",
                        backgroundColor: "transparent",
                        color: "#4a2f1b",
                        border: "1px solid #4a2f1b",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => setEditingProduct(product)}
                      style={{
                        flex: 1,
                        padding: "0.5rem",
                        backgroundColor: "#8b5a3c",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.product_id)}
                      style={{
                        flex: 1,
                        padding: "0.5rem",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Create Product Modal */}
      {showCreateForm && (
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
            <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Create New Product</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateProduct(); }}>
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
              <select
                value={newProduct.category_id}
                onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginBottom: '1rem',
                  border: '1px solid #4a2f1b',
                  borderRadius: '4px'
                }}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
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
                Create Product
              </button>
            </form>
            <button
              onClick={() => setShowCreateForm(false)}
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
};

export default SellerDashboardPage;