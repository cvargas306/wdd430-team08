"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Filters from "@/app/components/shop/Filters";
import ProductCard, { Product } from "@/app/components/shop/ProductCard";

export default function ShopClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // We load API only once
  const allProductsRef = useRef<Product[]>([]);

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Read filters from URL
  const sort = searchParams.get('sort') || 'newest';
  const category = searchParams.get('category') || 'all';
  const minPrice = searchParams.get('minPrice') || '0';
  const maxPrice = searchParams.get('maxPrice') || '500';
  const search = searchParams.get('search') || '';

  // Update URL when filters change
const updateFilters = (newFilters: any) => {
  const params = new URLSearchParams(searchParams.toString());

  Object.entries(newFilters).forEach(([key, value]) => {
    if (value && value !== 'all' && value !== '') {
      params.set(key, value.toString());
    } else {
      params.delete(key);
    }
  });

  router.push(`/shop?${params.toString()}`, { scroll: false });
};

  // Load products once
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      try {
        const response = await fetch(`/api/products`);
        const data = await response.json();

        allProductsRef.current = data;  // Save original list
        setFilteredProducts(data);      // Initial render
      } catch (error) {
        console.error("Error loading products:", error);
      }

      setLoading(false);
    };

    fetchProducts();
  }, []);

  // Apply filters locally when URL params change
  useEffect(() => {
    if (!allProductsRef.current.length) return;

    let products = [...allProductsRef.current];

    // CATEGORY
    if (category !== "all") {
      products = products.filter(
        p => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    // PRICE RANGE
    const min = Number(minPrice);
    const max = Number(maxPrice);

    products = products.filter(p => p.price >= min && p.price <= max);

    // SEARCH
    if (search) {
      const term = search.toLowerCase();
      products = products.filter(
        p =>
          p.name.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term))
      );
    }

    // SORTING
    if (sort === "price_low") {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === "price_high") {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === "rating") {
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      // newest — fallback (no real date, but keeping API behavior)
    }

    setFilteredProducts(products);

  }, [sort, category, minPrice, maxPrice, search]);

  return (
    <div className="min-h-screen px-6 pt-12 pb-20 sm:px-10 lg:px-20 bg-isabelline text-ebony">
      {/* TITLE */}
      <h1 className="mb-3 font-serif text-5xl text-cafe">Artisan Products</h1>

      <p className="max-w-2xl mb-8 text-base text-reseda">
        Browse our curated collection of handcrafted items from independent creators worldwide
      </p>

      {/* MAIN RESPONSIVE LAYOUT */}
      <div className="flex flex-col gap-10 lg:flex-row">

        {/* FILTERS */}
        <aside className="w-full lg:w-[380px]">
          <Filters
            sort={sort}
            category={category}
            minPrice={minPrice}
            maxPrice={maxPrice}
            search={search}
            onFiltersChange={updateFilters}
          />
        </aside>

        {/* PRODUCTS */}
        <div className="flex-1">
          <p className="mb-4 text-sm text-chocolate">
            Showing {filteredProducts.length} products
          </p>

          {loading ? (
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="min-w-[260px] p-4 bg-white border rounded-lg shadow-sm animate-pulse">
                  <div className="h-48 mb-3 bg-gray-200 rounded"></div>
                  <div className="h-6 mb-2 bg-gray-200 rounded"></div>
                  <div className="h-4 mb-1 bg-gray-200 rounded"></div>
                  <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((p) => (
                <ProductCard key={p.product_id} product={p} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
