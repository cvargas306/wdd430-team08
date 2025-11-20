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
    <div style={{ padding: "2rem" }}>
      <h1>Sellers</h1>
      <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button onClick={addSeller}>Add Seller</button>
      </div>
      <ul>
        {sellers.map((seller) => (
          <li key={seller.seller_id}>
            {seller.name} - {seller.email} - {new Date(seller.created_at).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}



