"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

interface Props {
  sort: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  search: string;
  onFiltersChange: (filters: any) => void;
}

export default function Filters({
  sort,
  category,
  minPrice,
  maxPrice,
  search,
  onFiltersChange,
}: Props) {
  const [openSort, setOpenSort] = useState(true);
  const [openCategory, setOpenCategory] = useState(true);
  const [openPrice, setOpenPrice] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState(search);

  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // 🔥 Dynamic max price from DB
  const [maxPossiblePrice, setMaxPossiblePrice] = useState<number>(500);

  // Slider values
  const [localMin, setLocalMin] = useState<number>(Number(minPrice) || 0);
  const [localMax, setLocalMax] = useState<number>(Number(maxPrice) || 500);

  // Load categories + maxPrice from API
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

    // Load max price dynamically from /api/products
    fetch("/api/products")
      .then((r) => r.json())
      .then((products) => {
        const computedMax = Math.max(...products.map((p: any) => p.price), 500);
        setMaxPossiblePrice(computedMax);

        // If current max filter is outside new range, adjust it
        if (Number(maxPrice) > computedMax) {
          onFiltersChange({ maxPrice: String(computedMax) });
          setLocalMax(computedMax);
        }
      })
      .catch((err) => console.error("Error loading max price:", err));
  }, []);

  // Sync state when URL params change
  useEffect(() => {
    setLocalMin(Number(minPrice));
    setLocalMax(Number(maxPrice));
  }, [minPrice, maxPrice]);

  // SEARCH — debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== search) {
        onFiltersChange({ search: searchQuery });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // PRICE — debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (String(localMin) !== minPrice || String(localMax) !== maxPrice) {
        onFiltersChange({
          minPrice: String(localMin),
          maxPrice: String(localMax),
        });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [localMin, localMax]);

  const handleSortChange = (value: string) => {
    if (value !== sort) onFiltersChange({ sort: value });
  };

  const handleCategoryChange = (value: string) => {
    if (value !== category) onFiltersChange({ category: value });
  };

  const resetFilters = () => {
    setSearchQuery("");
    setLocalMin(0);
    setLocalMax(maxPossiblePrice);

    onFiltersChange({
      sort: "newest",
      category: "all",
      minPrice: "0",
      maxPrice: String(maxPossiblePrice),
      search: "",
    });
  };

  return (
    <div>
      <button
        className="flex items-center justify-between w-full p-3 mb-4 font-medium rounded-lg bg-chocolate text-cafe md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        Filters
        {mobileOpen ? <ChevronUp /> : <ChevronDown />}
      </button>

      <div
        className={`p-8 bg-isabelline border border-[#d8d5d0] rounded-lg ${
          mobileOpen ? "block" : "hidden"
        } md:block`}
      >
        {/* SEARCH */}
        <div className="mb-10">
          <h2 className="mb-4 font-serif text-xl text-cafe">Search</h2>
          <div className="relative">
            <Search className="absolute text-gray-400 left-3 top-1/2 -translate-y-1/2" size={18} />
            <input
              type="text"
              value={searchQuery}
              placeholder="Search products..."
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border rounded-lg"
            />
          </div>
        </div>

        {/* SORT */}
        <div className="mb-10">
          <button
            onClick={() => setOpenSort(!openSort)}
            className="flex justify-between w-full text-left"
          >
            <h2 className="font-serif text-xl text-cafe">Sort By</h2>
            {openSort ? <ChevronUp /> : <ChevronDown />}
          </button>

          {openSort && (
            <div className="flex flex-col gap-2 mt-4 text-sm">
              {[
                { id: "newest", label: "Newest" },
                { id: "price_low", label: "Price: Low to High" },
                { id: "price_high", label: "Price: High to Low" },
                { id: "rating", label: "Top Rated" },
              ].map((item) => (
                <label key={item.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    checked={sort === item.id}
                    onChange={() => handleSortChange(item.id)}
                    className="accent-chocolate"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* CATEGORY */}
        <div className="mb-10">
          <button
            onClick={() => setOpenCategory(!openCategory)}
            className="flex justify-between w-full text-left"
          >
            <h2 className="font-serif text-xl text-cafe">Category</h2>
            {openCategory ? <ChevronUp /> : <ChevronDown />}
          </button>

          {openCategory && (
            <div className="flex flex-col gap-2 mt-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  checked={category === "all"}
                  onChange={() => handleCategoryChange("all")}
                  className="accent-chocolate"
                />
                All Categories
              </label>

              {categories.map((cat) => {
                const normalized = cat.name.trim().toLowerCase();
                return (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer capitalize">
                    <input
                      type="radio"
                      name="category"
                      checked={category === normalized}
                      onChange={() => handleCategoryChange(normalized)}
                      className="accent-chocolate"
                    />
                    {cat.name}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* PRICE RANGE */}
        <div className="mb-10">
          <button
            onClick={() => setOpenPrice(!openPrice)}
            className="flex justify-between w-full text-left"
          >
            <h2 className="font-serif text-xl text-cafe">Price Range</h2>
            {openPrice ? <ChevronUp /> : <ChevronDown />}
          </button>

          {openPrice && (
            <div className="mt-4 text-sm">
              <label className="block mb-1">Min: ${localMin}</label>
              <input
                type="range"
                min={0}
                max={maxPossiblePrice}
                value={localMin}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v <= localMax) setLocalMin(v);
                }}
                className="w-full"
              />

              <label className="block mt-3 mb-1">Max: ${localMax}</label>
              <input
                type="range"
                min={0}
                max={maxPossiblePrice}
                value={localMax}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v >= localMin) setLocalMax(v);
                }}
                className="w-full"
              />
            </div>
          )}
        </div>

        <button
          onClick={resetFilters}
          className="w-full py-2.5 mt-6 bg-chocolate text-cafe font-medium rounded-lg border border-cafe hover:bg-cafe hover:scale-[1.02]"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );
}





