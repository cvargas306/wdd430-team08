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
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([]);

  useEffect(() => {
    // Fetch categories
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  const handleSortChange = (newSort: string) => {
    onFiltersChange({ sort: newSort });
  };

  const handleCategoryChange = (newCategory: string) => {
    onFiltersChange({ category: newCategory });
  };

  const handlePriceChange = (min: string, max: string) => {
    onFiltersChange({ minPrice: min, maxPrice: max });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // Debounce search
    const timeoutId = setTimeout(() => {
      onFiltersChange({ search: query });
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  const resetFilters = () => {
    setSearchQuery('');
    onFiltersChange({
      sort: 'newest',
      category: 'all',
      minPrice: '0',
      maxPrice: '500',
      search: ''
    });
  };

  return (
    <div>
      {/* MOBILE FILTER TOGGLE */}
      <button
        className="flex items-center justify-between w-full p-3 mb-4 font-medium rounded-lg bg-chocolate text-cafe md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle filters"
        {...(mobileOpen ? { 'aria-expanded': 'true' } : { 'aria-expanded': 'false' })}
      >
        Filters
        {mobileOpen ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
      </button>

      {/* FILTERS PANEL */}
      <div className={`p-8 bg-isabelline border border-[#d8d5d0] rounded-lg ${mobileOpen ? "block" : "hidden"} md:block`}>
        {/* SEARCH */}
        <div className="mb-10">
          <h2 className="mb-4 font-serif text-xl text-cafe">Search</h2>
          <div className="relative">
            <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-chocolate"
            />
          </div>
        </div>

        {/* SORT BY */}
        <div className="mb-10">
          <button
            onClick={() => setOpenSort(!openSort)}
            className="flex justify-between w-full text-left"
            {...(openSort ? { 'aria-expanded': 'true' } : { 'aria-expanded': 'false' })}
            aria-label="Toggle sort options"
          >
            <h2 className="font-serif text-xl text-cafe">Sort By</h2>
            {openSort ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
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
                    aria-label={`Sort by ${item.label}`}
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
            {...(openCategory ? { 'aria-expanded': 'true' } : { 'aria-expanded': 'false' })}
            aria-label="Toggle category options"
          >
            <h2 className="font-serif text-xl text-cafe">Category</h2>
            {openCategory ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
          </button>

          {openCategory && (
            <div className="flex flex-col gap-2 mt-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  checked={category === 'all'}
                  onChange={() => handleCategoryChange('all')}
                  className="accent-chocolate"
                  aria-label="Show all categories"
                />
                All Categories
              </label>
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={category === cat.name.toLowerCase()}
                    onChange={() => handleCategoryChange(cat.name.toLowerCase())}
                    className="accent-chocolate"
                    aria-label={`Filter by ${cat.name}`}
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* PRICE RANGE */}
        <div className="mb-10">
          <button
            onClick={() => setOpenPrice(!openPrice)}
            className="flex justify-between w-full text-left"
            {...(openPrice ? { 'aria-expanded': 'true' } : { 'aria-expanded': 'false' })}
            aria-label="Toggle price range options"
          >
            <h2 className="font-serif text-xl text-cafe">Price Range</h2>
            {openPrice ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
          </button>

          {openPrice && (
            <div className="mt-4 text-sm">
              <label htmlFor="price-min" className="block mb-1">
                Min: ${minPrice}
              </label>
              <input
                id="price-min"
                type="range"
                min={0}
                max={500}
                value={minPrice}
                onChange={(e) => handlePriceChange(e.target.value, maxPrice)}
                className="w-full"
                aria-label="Minimum price"
              />

              <label htmlFor="price-max" className="block mt-3 mb-1">
                Max: ${maxPrice}
              </label>
              <input
                id="price-max"
                type="range"
                min={0}
                max={500}
                value={maxPrice}
                onChange={(e) => handlePriceChange(minPrice, e.target.value)}
                className="w-full"
                aria-label="Maximum price"
              />
            </div>
          )}
        </div>

        {/* RESET BUTTON */}
        <button
          onClick={resetFilters}
          className="w-full py-2.5 mt-6 bg-chocolate text-cafe font-medium rounded-lg border border-cafe transition-all duration-300 hover:bg-cafe hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
          aria-label="Reset all filters"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );
}