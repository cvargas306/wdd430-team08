import React, { useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";

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
        className="
          w-full mb-4 p-3 bg-chocolate text-cafe font-medium rounded-lg
          flex justify-between items-center md:hidden
        "
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        Filters
        {mobileOpen ? <ChevronUp /> : <ChevronDown />}
      </button>

      {/* FILTERS PANEL */}
      <div
        className={`
          p-8 bg-isabelline border border-[#d8d5d0] rounded-lg
          ${mobileOpen ? "block" : "hidden"}
          md:block
        `}
      >

        {/* SORT BY */}
        <div className="mb-10">
          <button
            onClick={() => setOpenSort(!openSort)}
            className="flex justify-between w-full text-left"
          >
            <h2 className="text-xl font-serif text-cafe">Sort By</h2>
            {openSort ? <ChevronUp /> : <ChevronDown />}
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
            <h2 className="text-xl font-serif text-cafe">Category</h2>
            {openCategory ? <ChevronUp /> : <ChevronDown />}
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
          >
            <h2 className="text-xl font-serif text-cafe">Price Range</h2>
            {openPrice ? <ChevronUp /> : <ChevronDown />}
          </button>

          {openPrice && (
            <div className="mt-4 text-sm">
              <p>Min: ${price[0]}</p>
              <input
                type="range"
                min={0}
                max={500}
                value={price[0]}
                onChange={(e) => setPrice([+e.target.value, price[1]])}
                className="w-full"
              />

              <p className="mt-3">Max: ${price[1]}</p>
              <input
                type="range"
                min={0}
                max={500}
                value={price[1]}
                onChange={(e) => setPrice([price[0], +e.target.value])}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* RESET BUTTON */}
        <button
          onClick={resetFilters}
          className="
            w-full py-2.5 mt-6 
            bg-chocolate text-cafe font-medium rounded-lg
            border border-cafe
            transition-all duration-300
            hover:bg-cafe hover:scale-[1.02] hover:shadow-md
            active:scale-[0.98]
          "
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );
}







