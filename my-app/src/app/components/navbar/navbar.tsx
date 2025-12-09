"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./navbar.module.css";
import { Menu, X, User, LogOut } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState("https://ik.imagekit.io/fara1dandara/logo-loom-white1.png");
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogoError = () => {
    if (logoSrc.startsWith("http")) {
      setLogoSrc("/logo-loom-white1.png");
    }
  };

  const handleProfileNavigation = () => {
  if (!user) return;
  if (user.is_seller && user.seller_id) {
    router.push(`/sellers/${user.seller_id}`);
  } else {
    router.push("/profile");
  }
};


  return (
    <nav className={styles.navbar}>
      {/* Logo */}
      <div className={styles.logo}>
        <Image
          src={logoSrc}
          alt="Logo"
          width={100}
          height={100}
          className={styles.logo}
          onError={handleLogoError}
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
        {isLoading ? (
          <User size={22} />
        ) : user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={handleProfileNavigation}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "inherit",
              }}
            >
              <User size={22} />
            </button>

            <button
              onClick={logout}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "inherit",
              }}
            >
              <LogOut size={22} />
            </button>
          </div>
        ) : (
          <a href="/login" style={{ color: "inherit", textDecoration: "none" }}>
            <User size={22} />
          </a>
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
          {isLoading ? (
            <User size={22} />
          ) : user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={handleProfileNavigation}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "inherit",
                }}
              >
                <User size={22} />
              </button>

              <button
                onClick={logout}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "inherit",
                }}
              >
                <LogOut size={22} />
              </button>
            </div>
          ) : (
            <a href="/login" style={{ color: "inherit", textDecoration: "none" }}>
              <User size={22} />
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}

