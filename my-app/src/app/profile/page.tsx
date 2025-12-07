"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../components/auth/AuthContext";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  total_price: number;
  status: string;
  created_at: string;
  seller_name: string;
  items: Array<{
    product_id: string;
    quantity: number;
    price_at_time: number;
    product_name: string;
  }>;
}

interface Favorite {
  product_id: string;
  name: string;
  price: number;
  description: string | null;
  images: string[] | null;
  stock: number;
  created_at: string;
  seller_name: string;
  category: string;
}

interface User {
  user_id: string;
  email: string;
  name: string;
  is_seller: boolean;
  image?: string;
  created_at: string;
}

const ProfilePage = () => {
  const { user, isLoading, updateUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSettings, setEditingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (user && !user.is_seller) {
      fetchOrders();
      fetchFavorites();
      fetchUserData();
    }
  }, [user, isLoading, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await fetch("/api/favorites");
      const data = await res.json();
      setFavorites(data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUserData(data);
      setSettingsForm({ ...settingsForm, name: data.name, email: data.email });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    setError(null);
    setSuccess(null);
    try {
      const body = {
        name: settingsForm.name,
        email: settingsForm.email,
      };

      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUserData(updatedUser);
        setEditingSettings(false);
        // Update auth context user
        updateUser(updatedUser);
        setSuccess("Settings saved successfully");
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      setError("An unexpected error occurred");
    }
  };

  const removeFavorite = async (productId: string) => {
    try {
      const res = await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });

      if (res.ok) {
        setFavorites(favorites.filter(f => f.product_id !== productId));
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  if (isLoading || loading) {
    return (
      <div style={{ backgroundColor: "#ffffff", color: "#4a2f1b", fontFamily: "var(--font-roboto)", minHeight: "100vh" }}>
        {/* Header Skeleton */}
        <section style={{ padding: "4rem 2rem", textAlign: "center", backgroundColor: "#f9f5f0" }}>
          <div className="animate-pulse">
            <div style={{ height: "3rem", backgroundColor: "#e0d5c8", borderRadius: "8px", marginBottom: "1rem", maxWidth: "300px", margin: "0 auto" }}></div>
            <div style={{ height: "1.5rem", backgroundColor: "#e0d5c8", borderRadius: "4px", maxWidth: "500px", margin: "0 auto" }}></div>
          </div>
        </section>

        {/* Tabs Skeleton */}
        <section style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
          <div className="animate-pulse">
            <div style={{ display: "flex", borderBottom: "1px solid #e0d5c8", marginBottom: "2rem", gap: "2rem" }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ height: "3rem", backgroundColor: "#e0d5c8", borderRadius: "8px", width: "120px" }}></div>
              ))}
            </div>
            <div style={{ height: "400px", backgroundColor: "#f0e6d6", borderRadius: "12px" }}></div>
          </div>
        </section>
      </div>
    );
  }

  if (!user || user.is_seller) {
    return <div style={{ textAlign: "center", padding: "2rem" }}>Access denied. This page is for buyers only.</div>;
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
          My Profile
        </h1>
        <p style={{
          fontSize: "1.2rem",
          maxWidth: "600px",
          margin: "0 auto",
          lineHeight: "1.6"
        }}>
          Manage your orders, favorites, and account settings.
        </p>
      </section>

      {/* Tabs */}
      <section style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", borderBottom: "1px solid #e0d5c8", marginBottom: "2rem" }}>
          {[
            { id: "orders", label: "Order History" },
            { id: "favorites", label: "Saved Products" },
            { id: "addresses", label: "Addresses" },
            { id: "settings", label: "Settings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "1rem 2rem",
                backgroundColor: activeTab === tab.id ? "#8b5a3c" : "transparent",
                color: activeTab === tab.id ? "#ffffff" : "#4a2f1b",
                border: "none",
                borderBottom: activeTab === tab.id ? "2px solid #8b5a3c" : "none",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "bold"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Order History */}
        {activeTab === "orders" && (
          <div>
            <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "2rem", marginBottom: "2rem" }}>
              Order History
            </h2>
            {orders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              <div style={{ display: "grid", gap: "2rem" }}>
                {orders.map((order) => (
                  <div key={order.id} style={{
                    backgroundColor: "#fefefe",
                    border: "1px solid #e0d5c8",
                    borderRadius: "12px",
                    padding: "2rem",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <h3 style={{ fontSize: "1.5rem" }}>Order #{order.id.slice(-8)}</h3>
                      <span style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: order.status === 'completed' ? '#d4edda' : '#fff3cd',
                        color: order.status === 'completed' ? '#155724' : '#856404',
                        borderRadius: "4px",
                        fontSize: "0.9rem"
                      }}>
                        {order.status}
                      </span>
                    </div>
                    <p style={{ marginBottom: "1rem" }}>Seller: {order.seller_name}</p>
                    <p style={{ marginBottom: "1rem" }}>Date: {new Date(order.created_at).toLocaleDateString()}</p>
                    <div style={{ marginBottom: "1rem" }}>
                      <h4>Items:</h4>
                      <ul>
                        {order.items.map((item, index) => (
                          <li key={index}>
                            {item.product_name} - Quantity: {item.quantity} - ${item.price_at_time.toFixed(2)} each
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Total: ${order.total_price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Saved Products */}
        {activeTab === "favorites" && (
          <div>
            <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "2rem", marginBottom: "2rem" }}>
              Saved Products
            </h2>
            {favorites.length === 0 ? (
              <p>No saved products.</p>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "2rem"
              }}>
                {favorites.map((product) => (
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
                      🖼️ Image
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
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <span style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#8b5a3c" }}>
                        ${product.price.toFixed(2)}
                      </span>
                      <span style={{ fontSize: "0.9rem", color: "#6b4f3a" }}>
                        Stock: {product.stock}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.9rem", color: "#6b4f3a", marginBottom: "1rem" }}>
                      Seller: {product.seller_name} | Category: {product.category}
                    </p>
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <button
                        onClick={() => router.push(`/products/${product.product_id}`)}
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
                        View Product
                      </button>
                      <button
                        onClick={() => removeFavorite(product.product_id)}
                        style={{
                          padding: "0.5rem",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Addresses */}
        {activeTab === "addresses" && (
          <div>
            <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "2rem", marginBottom: "2rem" }}>
              Addresses
            </h2>
            <p>Address management coming soon. For now, your account information is used for shipping.</p>
            {userData && (
              <div style={{
                backgroundColor: "#fefefe",
                border: "1px solid #e0d5c8",
                borderRadius: "12px",
                padding: "2rem",
                maxWidth: "600px"
              }}>
                <h3>Account Information</h3>
                <p><strong>Name:</strong> {userData.name}</p>
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>Member since:</strong> {new Date(userData.created_at).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <div>
            <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "2rem", marginBottom: "2rem" }}>
              Account Settings
            </h2>
            {error && (
              <div style={{
                backgroundColor: "#f8d7da",
                color: "#721c24",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1rem",
                border: "1px solid #f5c6cb"
              }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{
                backgroundColor: "#d4edda",
                color: "#155724",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1rem",
                border: "1px solid #c3e6cb"
              }}>
                {success}
              </div>
            )}
            {userData && (
              <div style={{
                backgroundColor: "#fefefe",
                border: "1px solid #e0d5c8",
                borderRadius: "12px",
                padding: "2rem",
                maxWidth: "600px"
              }}>
                {!editingSettings ? (
                  <div>
                    <p><strong>Name:</strong> {userData.name}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                    <button
                      onClick={() => setEditingSettings(true)}
                      style={{
                        padding: "0.75rem 1.5rem",
                        backgroundColor: "#8b5a3c",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        fontWeight: "bold",
                        cursor: "pointer",
                        marginTop: "1rem"
                      }}
                    >
                      Edit Profile
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: "1rem" }}>
                      <label style={{ display: "block", marginBottom: "0.5rem" }}>Name:</label>
                      <input
                        type="text"
                        value={settingsForm.name}
                        onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          border: "1px solid #4a2f1b",
                          borderRadius: "4px"
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: "1rem" }}>
                      <label style={{ display: "block", marginBottom: "0.5rem" }}>Email:</label>
                      <input
                        type="email"
                        value={settingsForm.email}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          border: "1px solid #4a2f1b",
                          borderRadius: "4px"
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <button
                        onClick={handleUpdateSettings}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: "#8b5a3c",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingSettings(false)}
                        style={{
                          padding: "0.5rem 1rem",
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
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;