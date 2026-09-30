"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Vehicle } from "@/types";
import { fetchUser883Listings } from "@/services/backendApi";
import { isFavourite, toggleFavourite, getFavourites } from "@/utils/favourites";
import { determineSaleMethod } from "@/utils/saleMethod";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMake, setSelectedMake] = useState<string>("All");
  const [selectedBody, setSelectedBody] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("latest");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [favCount, setFavCount] = useState<number>(0);
  const [favIds, setFavIds] = useState<string[]>([]);
  const [cardsVisible, setCardsVisible] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setCardsVisible(false);
      const response = await fetchUser883Listings(883, 1, 36, searchQuery);
      setVehicles(response.listings);
      setTotalCount(response.total);
      setLoading(false);
      setTimeout(() => setCardsVisible(true), 50);
    }
    loadData();

    const updateFavs = () => {
      const favs = getFavourites();
      setFavCount(favs.length);
      setFavIds(favs.map((f) => String(f.id)));
    };
    updateFavs();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const bodyParam = params.get("bodyStyle");
      if (bodyParam) {
        setSelectedBody(bodyParam);
      }
    }

    window.addEventListener("favouritesUpdated", updateFavs);
    return () => window.removeEventListener("favouritesUpdated", updateFavs);
  }, [searchQuery]);

  const makes = ["All", ...Array.from(new Set(vehicles.map((v) => v.make)))];
  const bodyStyles = ["All", ...Array.from(new Set(vehicles.map((v) => v.bodyStyle)))];

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesMake = selectedMake === "All" || vehicle.make === selectedMake;
    const matchesBody = selectedBody === "All" || vehicle.bodyStyle === selectedBody;
    return matchesMake && matchesBody;
  });

  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "kms-asc") return (a.kilometers || 0) - (b.kilometers || 0);
    if (sortBy === "year-desc") return (b.year || 0) - (a.year || 0);
    return 0;
  });

  const handleFavToggle = (e: React.MouseEvent, vehicle: Vehicle) => {
    e.stopPropagation();
    toggleFavourite(vehicle);
    setFavCount(getFavourites().length);
  };

  const hasActiveFilters = selectedMake !== "All" || selectedBody !== "All" || searchQuery !== "";

  const clearAllFilters = () => {
    setSelectedMake("All");
    setSelectedBody("All");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-28 pt-28 md:pt-32">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
        
        {/* Page Title Header (e.g. "Ute listings for sale" matching screenshot) */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight font-sans">
            {selectedBody !== "All"
              ? `${selectedBody} listings for sale`
              : selectedMake !== "All"
              ? `${selectedMake} listings for sale`
              : "Showroom listings for sale"}
          </h1>
        </div>

        {/* Full-width Search Input */}
        <div className="mb-6">
          <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1.5 shadow-xl focus-within:border-[#C2410C] transition-colors">
            <div className="pl-4 text-gray-400">
              <svg className="w-5 h-5 stroke-current stroke-2" viewBox="0 0 24 24" fill="none">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <input
              type="text"
              placeholder="Search by make, model or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none px-4 py-3 text-white text-sm md:text-base placeholder-gray-500 focus:outline-none"
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="px-3 text-gray-400 hover:text-white transition"
                title="Clear search"
              >
                <svg className="w-5 h-5 stroke-current stroke-2" viewBox="0 0 24 24" fill="none">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Custom Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800">
          {/* Custom Dropdown Filters (Make & Body Style) */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedMake}
              onChange={(e) => setSelectedMake(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-xs font-mono uppercase text-white focus:outline-none focus:border-[#C2410C] cursor-pointer"
            >
              <option value="All">All Makes</option>
              {makes.filter((m) => m !== "All").map((make) => (
                <option key={make} value={make}>
                  {make}
                </option>
              ))}
            </select>

            <select
              value={selectedBody}
              onChange={(e) => setSelectedBody(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-xs font-mono uppercase text-white focus:outline-none focus:border-[#C2410C] cursor-pointer"
            >
              <option value="All">All Body Styles</option>
              {bodyStyles.filter((b) => b !== "All").map((body) => (
                <option key={body} value={body}>
                  {body}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-mono uppercase">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C2410C] cursor-pointer"
            >
              <option value="latest">Latest Listings</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="kms-asc">Kilometers: Low to High</option>
              <option value="year-desc">Year: Newest First</option>
            </select>
          </div>
        </div>

        {/* Active Filter Tags Row (Matching media_1790231448681.png pill tags) */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {selectedBody !== "All" && (
              <button
                onClick={() => setSelectedBody("All")}
                className="inline-flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 text-white text-xs px-3 py-1 rounded-full hover:border-zinc-700 transition"
              >
                <span>{selectedBody}</span>
                <span className="text-gray-400 hover:text-white">✕</span>
              </button>
            )}

            {selectedMake !== "All" && (
              <button
                onClick={() => setSelectedMake("All")}
                className="inline-flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 text-white text-xs px-3 py-1 rounded-full hover:border-zinc-700 transition"
              >
                <span>{selectedMake}</span>
                <span className="text-gray-400 hover:text-white">✕</span>
              </button>
            )}

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 text-white text-xs px-3 py-1 rounded-full hover:border-zinc-700 transition"
              >
                <span>&quot;{searchQuery}&quot;</span>
                <span className="text-gray-400 hover:text-white">✕</span>
              </button>
            )}

            <button
              onClick={clearAllFilters}
              className="text-xs text-gray-400 hover:text-white underline font-sans ml-2 transition"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results Counter Line */}
        <div className="mb-6 flex items-center justify-between text-xs text-gray-400 font-sans">
          <span>{sortedVehicles.length} results</span>
        </div>

        {/* Vehicle Cards Grid (4 Columns Desktop layout matching screenshot) */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
              <div key={idx} className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 animate-pulse h-80" />
            ))}
          </div>
        ) : sortedVehicles.length === 0 ? (
          <div className="text-center py-24 text-zinc-400 bg-zinc-900/40 rounded-2xl border border-zinc-800 max-w-xl mx-auto">
            <svg className="w-16 h-16 mx-auto mb-4 text-zinc-600 fill-none stroke-current" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-lg font-mono uppercase tracking-wider mb-2 text-zinc-300 font-bold">
              No Vehicles Found
            </p>
            <p className="text-xs text-zinc-500 mb-6">
              Try adjusting your make/body style filters or clear search.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-2.5 bg-[#C2410C] text-white font-bold font-mono text-xs uppercase tracking-wider rounded-lg hover:bg-[#a33509] transition"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedVehicles.map((vehicle, index) => {
              const fav = favIds.includes(String(vehicle.id));
              const saleMethodInfo = determineSaleMethod(vehicle);
              const specParts = [
                vehicle.kilometers ? `${vehicle.kilometers.toLocaleString("en-NZ")}km` : "",
                vehicle.transmission,
                vehicle.fuelType,
                vehicle.engineSize,
              ].filter(Boolean);

              return (
                <Link
                  key={vehicle.id}
                  href={`/vehicles/${vehicle.id}`}
                  className={`group flex flex-col transition-all duration-500 ease-out transform cursor-pointer ${
                    cardsVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${(index % 8) * 60}ms` }}
                >
                  {/* Vehicle Image Container */}
                  <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 select-none">
                    <img
                      src={vehicle.images[0]}
                      alt={vehicle.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Top Left Pill Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                      {vehicle.isListedToday && (
                        <div className="bg-[#10B981] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                          Just landed
                        </div>
                      )}
                      {saleMethodInfo.isAuction && (
                        <div className="bg-purple-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                          Auction
                        </div>
                      )}
                      {saleMethodInfo.isPBN && (
                        <div className="bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                          By Negotiation
                        </div>
                      )}
                      {vehicle.isSale && !saleMethodInfo.isPBN && (
                        <div className="bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                          Hot
                        </div>
                      )}
                    </div>

                    {/* Top Right Garage Button */}
                    <button
                      onClick={(e) => handleFavToggle(e, vehicle)}
                      className={`absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center shadow-lg transition transform hover:scale-110 z-10 ${
                        fav ? "bg-red-600 text-white" : "bg-white/90 text-zinc-900 hover:bg-white"
                      }`}
                      title={fav ? "Remove from Garage" : "Save to Garage"}
                    >
                      <svg className={`w-4 h-4 ${fav ? "fill-current" : "fill-none stroke-current stroke-2"}`} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11h4v10" />
                      </svg>
                    </button>
                  </div>

                  {/* Vehicle Info Content */}
                  <div className="pt-3.5 flex flex-col space-y-1">
                    {/* Title */}
                    <h3 className="text-white text-sm md:text-base font-bold tracking-tight leading-snug line-clamp-1 group-hover:text-[#C2410C] transition-colors font-mono">
                      {vehicle.year && <span className="font-normal text-gray-400">{vehicle.year} </span>}
                      <span className="uppercase">{vehicle.title}</span>
                    </h3>

                    {/* Specs Subtitle Line */}
                    {specParts.length > 0 && (
                      <p className="text-gray-400 text-xs font-sans line-clamp-1">
                        {specParts.join(" · ")}
                      </p>
                    )}

                    {/* Price */}
                    <div className="text-white text-xl md:text-2xl font-extrabold tracking-tight font-mono pt-1">
                      {saleMethodInfo.formattedDisplay}
                    </div>

                    {/* Finance Estimate Line */}
                    {vehicle.weeklyEstimate > 0 && (
                      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-0.5 font-sans">
                        <span>Finance ~${vehicle.weeklyEstimate} / week</span>
                        <span className="hover:text-white transition flex items-center gap-0.5">
                          About this estimate &rsaquo;
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Vehicle Detail Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative text-white">
            <button
              onClick={() => setSelectedVehicle(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center transition"
            >
              &times;
            </button>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <img
                  src={selectedVehicle.images[0]}
                  alt={selectedVehicle.title}
                  className="w-full h-64 object-cover rounded-xl border border-zinc-800"
                />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {selectedVehicle.images.slice(1).map((img, i) => (
                    <img key={i} src={img} alt="Thumbnail" className="w-full h-24 object-cover rounded-lg border border-zinc-800" />
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[#C2410C] font-mono text-xs uppercase font-bold tracking-wider">
                      {selectedVehicle.year} • {selectedVehicle.make}
                    </span>
                    <button
                      onClick={(e) => handleFavToggle(e, selectedVehicle)}
                      className={`text-xs px-3 py-1 rounded-full font-bold transition flex items-center gap-1 ${
                        favIds.includes(String(selectedVehicle.id))
                          ? "bg-red-600 text-white"
                          : "bg-zinc-800 text-gray-300 hover:text-white"
                      }`}
                    >
                      ❤️ {favIds.includes(String(selectedVehicle.id)) ? "Saved in Garage" : "Save to Garage"}
                    </button>
                  </div>

                  <h2 className="text-2xl font-black font-mono mt-1 mb-2">
                    {selectedVehicle.title}
                  </h2>

                  <div className="text-2xl font-extrabold text-[#C2410C] font-mono mb-4">
                    ${selectedVehicle.price.toLocaleString("en-NZ")}
                    <span className="text-xs text-gray-400 font-sans block">
                      Est. ${selectedVehicle.weeklyEstimate}/week
                    </span>
                  </div>

                  <p className="text-gray-300 text-xs leading-relaxed mb-4">
                    {selectedVehicle.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 bg-zinc-800/50 p-3 rounded-lg border border-zinc-800 mb-4">
                    <div><strong>Odometer:</strong> {selectedVehicle.kilometers ? `${selectedVehicle.kilometers.toLocaleString("en-NZ")} km` : "N/A"}</div>
                    <div><strong>Engine:</strong> {selectedVehicle.engineSize}</div>
                    <div><strong>Transmission:</strong> {selectedVehicle.transmission}</div>
                    <div><strong>Fuel Type:</strong> {selectedVehicle.fuelType}</div>
                    <div><strong>Body Style:</strong> {selectedVehicle.bodyStyle}</div>
                    <div><strong>Color:</strong> {selectedVehicle.color}</div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-zinc-800">
                  <Link
                    href="/finance"
                    className="flex-1 text-center py-3 bg-[#C2410C] text-white font-bold text-xs uppercase tracking-wider rounded hover:bg-[#a33509] transition"
                  >
                    Apply Finance
                  </Link>
                  <Link
                    href="/contact"
                    className="flex-1 text-center py-3 bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded border border-zinc-700 hover:bg-zinc-700 transition"
                  >
                    Contact Dealer
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
