"use client";

import { useState, useEffect } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Products</h1>

      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Name</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Price</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Quantity</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Category</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Seller ID</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.product_id}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{p.name}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>${p.price}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{p.quantity}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{p.category || "-"}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{p.seller_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}