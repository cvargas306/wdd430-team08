"use client";

import { useState, useEffect } from "react";
import Filters from "@/app/components/shop/Filters";
import ProductCard, { Product } from "@/app/components/shop/ProductCard";

export default function ShopPage() {
  const [sort, setSort] = useState("feature");
  const [category, setCategory] = useState("all");
  const [price, setPrice] = useState([0, 500]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d));
  }, []);

  return (
    <div className="px-6 sm:px-10 lg:px-20 pt-20 pb-20 min-h-screen bg-isabelline text-ebony">

      {/* TITLE */}
      <h1 className="text-5xl font-serif text-cafe mb-3">Artisan Products</h1>

      <p className="text-reseda text-base mb-8 max-w-2xl">
        Browse our curated collection of handcrafted items from independent creators worldwide
      </p>

      {/* MAIN RESPONSIVE LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-10">

        {/* FILTERS */}
        <aside className="w-full lg:w-[380px]">
          <Filters
            sort={sort}
            setSort={setSort}
            category={category}
            setCategory={setCategory}
            price={price}
            setPrice={setPrice}
          />
        </aside>

        {/* PRODUCTS */}
        <div className="flex-1">

          <p className="text-chocolate text-sm mb-4">
            Showing {products.length} products
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {products.map((p) => (
              <ProductCard key={p.product_id} product={p} />
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}








