"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SignupData {
  // Common fields
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  isSeller: boolean;

  // Seller specific fields
  category?: string;
  description?: string;
  location?: string;
  yearsActive?: string;
}

export default function SignupPage() {
  const [formData, setFormData] = useState<SignupData>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    isSeller: false,
    category: "",
    description: "",
    location: "",
    yearsActive: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const signupData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        is_seller: formData.isSeller,
        ...(formData.isSeller && {
          category: formData.category,
          description: formData.description,
          location: formData.location,
          years_active: parseInt(formData.yearsActive || "0"),
          rating: 0,
          reviews: 0,
          followers: 0,
        })
      };

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f9f5f0",
      padding: "2rem 0"
    }}>
      <div style={{
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "3rem",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        color: "#4a2f1b"
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "2.5rem",
            marginBottom: "0.5rem",
            color: "#4a2f1b"
          }}>
            Join Loom & Thread
          </h1>
          <p style={{
            fontSize: "1rem",
            color: "#6b4f3a"
          }}>
            Create your account to start your handcrafted journey
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: "#ffe6e6",
            color: "#d32f2f",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            border: "1px solid #ffcdd2",
            textAlign: "center",
            fontSize: "0.9rem"
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: "#e8f5e8",
            color: "#2e7d32",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            border: "1px solid #c8e6c9",
            textAlign: "center",
            fontSize: "0.9rem"
          }}>
            Account created successfully! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ opacity: success ? 0.6 : 1, pointerEvents: success ? 'none' : 'auto' }}>
          {/* Account Type */}
          <div style={{ marginBottom: "2rem" }}>
            <label style={{
              display: "block",
              marginBottom: "1rem",
              fontWeight: "bold",
              color: "#4a2f1b",
              fontSize: "1.1rem"
            }}>
              I want to:
            </label>
            <div style={{ display: "flex", gap: "2rem" }}>
              <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="isSeller"
                  checked={!formData.isSeller}
                  onChange={() => setFormData(prev => ({ ...prev, isSeller: false }))}
                  style={{ marginRight: "0.5rem" }}
                />
                Shop for handcrafted items
              </label>
              <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="isSeller"
                  checked={formData.isSeller}
                  onChange={() => setFormData(prev => ({ ...prev, isSeller: true }))}
                  style={{ marginRight: "0.5rem" }}
                />
                Sell my handcrafted items
              </label>
            </div>
          </div>

          {/* Basic Information */}
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "1.5rem",
              marginBottom: "1rem",
              color: "#4a2f1b"
            }}>
              Account Information
            </h3>

            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="name" style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "bold",
                color: "#4a2f1b"
              }}>
                {formData.isSeller ? "Business/Shop Name" : "Full Name"} *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e0d5c8",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  backgroundColor: "#ffffff",
                  color: "#4a2f1b"
                }}
                placeholder={formData.isSeller ? "Enter your business name" : "Enter your full name"}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="email" style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "bold",
                color: "#4a2f1b"
              }}>
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e0d5c8",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  backgroundColor: "#ffffff",
                  color: "#4a2f1b"
                }}
                placeholder="Enter your email"
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="password" style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "bold",
                color: "#4a2f1b"
              }}>
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={6}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e0d5c8",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  backgroundColor: "#ffffff",
                  color: "#4a2f1b"
                }}
                placeholder="Create a password (min 6 characters)"
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="confirmPassword" style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "bold",
                color: "#4a2f1b"
              }}>
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e0d5c8",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  backgroundColor: "#ffffff",
                  color: "#4a2f1b"
                }}
                placeholder="Confirm your password"
              />
            </div>
          </div>

          {/* Seller Information */}
          {formData.isSeller && (
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "1.5rem",
                marginBottom: "1rem",
                color: "#4a2f1b"
              }}>
                Business Information
              </h3>

              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="category" style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                  color: "#4a2f1b"
                }}>
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e0d5c8",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    backgroundColor: "#ffffff",
                    color: "#4a2f1b"
                  }}
                >
                  <option value="">Select a category</option>
                  <option value="Ceramics & Pottery">Ceramics & Pottery</option>
                  <option value="Organic Textiles">Organic Textiles</option>
                  <option value="Woodcraft">Woodcraft</option>
                  <option value="Jewelry">Jewelry</option>
                  <option value="Leather Goods">Leather Goods</option>
                  <option value="Glass Art">Glass Art</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="location" style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                  color: "#4a2f1b"
                }}>
                  Location *
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e0d5c8",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    backgroundColor: "#ffffff",
                    color: "#4a2f1b"
                  }}
                  placeholder="City, State/Country"
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="yearsActive" style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                  color: "#4a2f1b"
                }}>
                  Years in Business
                </label>
                <input
                  id="yearsActive"
                  name="yearsActive"
                  type="number"
                  min="0"
                  value={formData.yearsActive}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e0d5c8",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    backgroundColor: "#ffffff",
                    color: "#4a2f1b"
                  }}
                  placeholder="How many years have you been creating?"
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="description" style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                  color: "#4a2f1b"
                }}>
                  Business Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e0d5c8",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    backgroundColor: "#ffffff",
                    color: "#4a2f1b",
                    resize: "vertical"
                  }}
                  placeholder="Tell us about your business, your craft, and what makes your work special..."
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "#8b5a3c",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "bold",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "#6b4f3a")}
            onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "#8b5a3c")}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div style={{
          textAlign: "center",
          marginTop: "2rem",
          paddingTop: "2rem",
          borderTop: "1px solid #e0d5c8"
        }}>
          <p style={{ color: "#6b4f3a", marginBottom: "1rem" }}>
            Already have an account?
          </p>
          <Link
            href="/login"
            style={{
              color: "#8b5a3c",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "1rem"
            }}
          >
            Sign in instead
          </Link>
        </div>

        <div style={{
          textAlign: "center",
          marginTop: "1rem"
        }}>
          <Link
            href="/"
            style={{
              color: "#6b4f3a",
              textDecoration: "none",
              fontSize: "0.9rem"
            }}
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}