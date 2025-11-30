"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  sort: string;
  setSort: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  price: number[];
  setPrice: (v: number[]) => void;
}

export default function Filters({
  sort,
  setSort,
  category,
  setCategory,
  price,
  setPrice,
}: Props) {
  const [openSort, setOpenSort] = useState(true);
  const [openCategory, setOpenCategory] = useState(true);
  const [openPrice, setOpenPrice] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const resetFilters = () => {
    setSort("feature");
    setCategory("all");
    setPrice([0, 500]);
  };

  return (
    <div>
      {/* MOBILE FILTER TOGGLE */}
      <button
        className="w-full mb-4 p-3 bg-chocolate text-cafe font-medium rounded-lg flex justify-between items-center md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle filters"
        {...(mobileOpen ? { 'aria-expanded': 'true' } : { 'aria-expanded': 'false' })}
      >
        Filters
        {mobileOpen ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
      </button>

      {/* FILTERS PANEL */}
      <div className={`p-8 bg-isabelline border border-[#d8d5d0] rounded-lg ${mobileOpen ? "block" : "hidden"} md:block`}>
        {/* SORT BY */}
        <div className="mb-10">
          <button
            onClick={() => setOpenSort(!openSort)}
            className="flex justify-between w-full text-left"
            {...(openSort ? { 'aria-expanded': 'true' } : { 'aria-expanded': 'false' })}
            aria-label="Toggle sort options"
          >
            <h2 className="text-xl font-serif text-cafe">Sort By</h2>
            {openSort ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
          </button>

          {openSort && (
            <div className="mt-4 flex flex-col gap-2 text-sm">
              {[
                { id: "feature", label: "Feature" },
                { id: "newest", label: "Newest" },
                { id: "priceLow", label: "Price: Low to High" },
                { id: "priceHigh", label: "Price: High to Low" },
                { id: "topRated", label: "Top Rated" },
              ].map((item) => (
                <label key={item.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    checked={sort === item.id}
                    onChange={() => setSort(item.id)}
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
            <h2 className="text-xl font-serif text-cafe">Category</h2>
            {openCategory ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
          </button>

          {openCategory && (
            <div className="mt-4 flex flex-col gap-2 text-sm">
              {["all", "ceramics", "textiles", "woodcraft", "home decor"].map((c) => (
                <label key={c} className="flex items-center gap-2 cursor-pointer capitalize">
                  <input
                    type="radio"
                    name="category"
                    checked={category === c}
                    onChange={() => setCategory(c)}
                    className="accent-chocolate"
                    aria-label={`Filter by ${c}`}
                  />
                  {c}
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
            <h2 className="text-xl font-serif text-cafe">Price Range</h2>
            {openPrice ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
          </button>

          {openPrice && (
            <div className="mt-4 text-sm">
              <label htmlFor="price-min" className="block mb-1">
                Min: ${price[0]}
              </label>
              <input
                id="price-min"
                type="range"
                min={0}
                max={500}
                value={price[0]}
                onChange={(e) => setPrice([+e.target.value, price[1]])}
                className="w-full"
                aria-label="Minimum price"
              />

              <label htmlFor="price-max" className="block mb-1 mt-3">
                Max: ${price[1]}
              </label>
              <input
                id="price-max"
                type="range"
                min={0}
                max={500}
                value={price[1]}
                onChange={(e) => setPrice([price[0], +e.target.value])}
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