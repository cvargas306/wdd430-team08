"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Filters from "@/app/components/shop/Filters";
import ProductCard, { Product } from "@/app/components/shop/ProductCard";

export default function ShopClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const sort = searchParams.get('sort') || 'newest';
  const category = searchParams.get('category') || 'all';
  const minPrice = searchParams.get('minPrice') || '0';
  const maxPrice = searchParams.get('maxPrice') || '500';
  const search = searchParams.get('search') || '';

  const updateFilters = (newFilters: any) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });

    router.push(`/shop?${params.toString()}`);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (sort && sort !== 'newest') params.set('sort', sort);
      if (category && category !== 'all') params.set('category', category);
      if (minPrice && minPrice !== '0') params.set('minPrice', minPrice);
      if (maxPrice && maxPrice !== '500') params.set('maxPrice', maxPrice);
      if (search) params.set('search', search);

      const queryString = params.toString();
      const url = `/api/products${queryString ? `?${queryString}` : ''}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [sort, category, minPrice, maxPrice, search]);

  return (
    <div className="min-h-screen px-6 pt-20 pb-20 sm:px-10 lg:px-20 bg-isabelline text-ebony">

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
            Showing {products.length} products
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
              {products.map((p) => (
                <ProductCard key={p.product_id} product={p} />
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}