"use client";

import { useState, useEffect } from "react";

interface Seller {
  seller_id: string;
  name: string;
  email: string;
  created_at: string;
}

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const res = await fetch("/api/sellers");
        const data: Seller[] = await res.json();
        setSellers(data);
      } catch (error) {
        console.error("Error fetching sellers:", error);
      }
    };
    fetchSellers();
  }, []);

  const addSeller = async () => {
    if (!name || !email) return alert("Name and email are required!");

    try {
      const res = await fetch("/api/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
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
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "#ffffff", color: "#4a2f1b", fontFamily: "var(--font-roboto)" }}>
      <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "2rem", marginBottom: "1rem" }}>Sellers</h1>
      <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
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
      <ul style={{ listStyle: "none", padding: 0 }}>
        {sellers.map((seller) => (
          <li key={seller.seller_id} style={{ padding: "0.5rem 0", borderBottom: "1px solid #4a2f1b" }}>
            <strong>{seller.name}</strong> - {seller.email} - Joined: {new Date(seller.created_at).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}