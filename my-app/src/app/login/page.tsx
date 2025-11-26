"use client";

import { useState } from "react";
import { useAuth } from "../components/auth/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await login(email, password);
      if (success) {
        router.push("/");
      } else {
        setError("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f9f5f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem"
    }}>
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "3rem",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        width: "100%",
        maxWidth: "400px",
        color: "#4a2f1b"
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "2.5rem",
            marginBottom: "0.5rem",
            color: "#4a2f1b"
          }}>
            Welcome Back
          </h1>
          <p style={{
            fontSize: "1rem",
            color: "#6b4f3a"
          }}>
            Sign in to your account
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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="email" style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "bold",
              color: "#4a2f1b"
            }}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          <div style={{ marginBottom: "2rem" }}>
            <label htmlFor="password" style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "bold",
              color: "#4a2f1b"
            }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              placeholder="Enter your password"
            />
          </div>

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
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div style={{
          textAlign: "center",
          marginTop: "2rem",
          paddingTop: "2rem",
          borderTop: "1px solid #e0d5c8"
        }}>
          <p style={{ color: "#6b4f3a", marginBottom: "1rem" }}>
            Don't have an account?
          </p>
          <Link
            href="/signup"
            style={{
              color: "#8b5a3c",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "1rem"
            }}
          >
            Create an account
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