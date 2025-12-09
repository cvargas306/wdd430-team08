"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../components/auth/AuthContext";
import { useRouter, useParams } from "next/navigation";
import ProductCard from "@/app/components/shop/ProductCard";

interface Product {
  product_id: string;
  name: string;
  price: number;
  description?: string;
  images?: string[];
  image_url?: string;
  seller_name: string;
  category: string;
  rating: number;
  total_reviews: number;
  stock: number;
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

interface Category {
  id: string;
  name: string;
}

export default function SellerProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sellerId = params.id as string;

  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    category_id: "",
    image_url: "",     // NEW
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwner = user && seller && user.seller_id === seller.seller_id;

  /* ---------------------------------------
     FETCH SELLER
  --------------------------------------- */
  useEffect(() => {
    if (sellerId) fetchSellerData();
  }, [sellerId]);

  async function fetchSellerData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/sellers/${sellerId}`);
      if (!res.ok) return setError("Seller not found");

      const data = await res.json();
      setSeller(data);
    } catch {
      setError("Error loading seller");
    }
    setLoading(false);
  }

  /* ---------------------------------------
     FETCH CATEGORIES
  --------------------------------------- */
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) =>
        setCategories(
          data.map((c: any) => ({
            id: String(c.id),
            name: c.name.trim(),
          }))
        )
      )
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  /* ---------------------------------------
     FETCH PRODUCTS
  --------------------------------------- */
  useEffect(() => {
    if (seller) fetchProducts();
  }, [seller]);

  async function fetchProducts() {
    try {
      const res = await fetch(`/api/products?seller_id=${sellerId}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  }

  /* ---------------------------------------
     ADD PRODUCT (NORMAL FETCH)
  --------------------------------------- */
  async function addProduct() {
    if (!isOwner) {
      alert("You are not allowed to add products.");
      return;
    }

    if (!newProduct.name || !newProduct.price || !newProduct.category_id) {
      alert("All fields are required.");
      return;
    }

    const selectedCategory = categories.find(
      (c) => c.id === newProduct.category_id
    );

    if (!selectedCategory) {
      alert("Invalid category");
      return;
    }

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

          // REQUIRED FOR requireSeller()
          "x-user-id": user.user_id,
          "x-user-email": user.email,
          "x-user-role": user.is_seller ? "seller" : "buyer",
          "x-seller-id": user.seller_id ?? "",
        },
        body: JSON.stringify({
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.quantity) || 0,
        category: selectedCategory.name,
        images: newProduct.image_url ? [newProduct.image_url] : [], // NEW
      }),

      });

      const result = await res.json();

      if (!res.ok) {
        console.error("Create error:", result);
        alert(result.error || "Failed to add product");
        return;
      }

      // Add product to UI
      setProducts([result, ...products]);

      // Reset form
      setNewProduct({
        name: "",
        description: "",
        price: "",
        quantity: "",
        category_id: "",
        image_url: "",
      });

      setShowAddProduct(false);
    } catch (err) {
      console.error("Error adding product:", err);
    }
  }

  /* ---------------------------------------
     RENDER
  --------------------------------------- */

  if (loading)
    return <div className="text-center p-6 text-lg">Loading…</div>;

  if (error || !seller)
    return <div className="text-center p-6 text-lg">{error || "Seller not found"}</div>;

  return (
    <div className="bg-white text-ebony min-h-screen">

      {/* HEADER */}
      <section className="p-12 text-center bg-[#f9f5f0]">
        <h1 className="text-4xl font-playfair mb-3">{seller.name}</h1>
        <p className="text-lg max-w-xl mx-auto">
          Discover unique handcrafted items from this artisan.
        </p>
      </section>

      {/* DETAILS */}
      <section className="p-8 max-w-5xl mx-auto">
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><strong>Category:</strong> {seller.category}</div>
            <div><strong>Location:</strong> {seller.location}</div>
            <div><strong>Rating:</strong> ⭐ {seller.rating} ({seller.reviews})</div>
            <div><strong>Followers:</strong> {seller.followers}</div>
            <div><strong>Years Active:</strong> {seller.years_active}</div>
          </div>

          <p className="mt-4">{seller.description}</p>

          {isOwner && (
            <button
              onClick={() => router.push("/seller/profile")}
              className="mt-4 px-4 py-2 bg-chocolate text-white rounded"
            >
              Manage Profile
            </button>
          )}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="p-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-playfair">
            Products ({products.length})
          </h2>

          {isOwner && (
            <button
              onClick={() => setShowAddProduct(true)}
              className="px-4 py-2 rounded text-white"
              style={{ backgroundColor: "#4a2f1b" }}
            >
              Add Product
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p) => (
            <ProductCard key={p.product_id} product={p} />
          ))}
        </div>
      </section>

      {/* ADD PRODUCT MODAL */}
      {isOwner && showAddProduct && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-[400px] text-ebony">

            <h3 className="text-xl mb-4 text-center">Add New Product</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addProduct();
              }}
            >
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                className="w-full border p-2 mb-3 rounded"
                required
              />

              <textarea
                placeholder="Description"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
                className="w-full border p-2 mb-3 rounded min-h-[80px]"
              />

              <input
                type="number"
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
                className="w-full border p-2 mb-3 rounded"
                required
              />

              <input
                type="number"
                placeholder="Stock Quantity"
                value={newProduct.quantity}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, quantity: e.target.value })
                }
                className="w-full border p-2 mb-3 rounded"
              />

              <input
                type="text"
                placeholder="Image URL"
                value={newProduct.image_url}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, image_url: e.target.value })
                }
                className="w-full border p-2 mb-3 rounded"
              />


              {/* CATEGORY DROPDOWN */}
              <select
                value={newProduct.category_id}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category_id: e.target.value })
                }
                required
                className="w-full border p-2 mb-4 rounded"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="w-full py-2 rounded text-white font-bold"
                style={{ backgroundColor: "#4a2f1b" }}
              >
                Add Product
              </button>
            </form>

            <button
              onClick={() => setShowAddProduct(false)}
              className="w-full mt-3 border p-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

