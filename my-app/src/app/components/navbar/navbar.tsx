"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./navbar.module.css";
import { Menu, X, User, ShoppingBag, LogOut } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, login, logout, isLoading } = useAuth();

  return (
    <nav className={styles.navbar}>
      {/* Logo */}
      <div className={styles.logo}>
        <Image
          src="/logo-loom-white1.png"
          alt="Logo"
          width={100}
          height={100}
          className={styles.logo}
        />
      </div>

      {/* Desktop menu */}
      <ul className={styles.navLinks}>
        <li><a href="/">Home</a></li>
        <li><a href="/shop">Shop</a></li>
        <li><a href="/sellers">Sellers</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>

      {/* Desktop icons */}
      <div className={styles.icons}>
        <ShoppingBag size={22} />
        {isLoading ? (
          <User size={22} />
        ) : user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => window.location.href = user.is_seller ? '/seller/profile' : '/profile'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
            >
              <User size={22} />
            </button>
            <button
              onClick={logout}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
            >
              <LogOut size={22} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowLogin(!showLogin)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <User size={22} />
          </button>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button className={styles.menuButton} onClick={() => setOpen(!open)}>
        {open ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${open ? styles.open : ""}`}>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/shop">Shop</a></li>
          <li><a href="/sellers">Sellers</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>

        <div className={styles.mobileIcons}>
          <ShoppingBag size={22} />
          {isLoading ? (
            <User size={22} />
          ) : user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => window.location.href = user.is_seller ? '/seller/profile' : '/profile'}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
              >
                <User size={22} />
              </button>
              <button
                onClick={logout}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
              >
                <LogOut size={22} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(!showLogin)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
            >
              <User size={22} />
            </button>
          )}
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && !user && (
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
            width: '300px',
            color: '#4a2f1b'
          }}>
            <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Login</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const success = await login(email, password);
              if (success) {
                setShowLogin(false);
                setEmail("");
                setPassword("");
              } else {
                alert("Invalid credentials");
              }
            }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginBottom: '1rem',
                  border: '1px solid #4a2f1b',
                  borderRadius: '4px'
                }}
                required
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
                Login
              </button>
            </form>
            <button
              onClick={() => setShowLogin(false)}
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
    </nav>
  );
}
