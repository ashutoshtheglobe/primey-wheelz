"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { WebsiteData, Vehicle } from "@/types";
import { useWebsite } from "@/context/WebsiteContext";
import { getFavourites, toggleFavourite } from "@/utils/favourites";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { site } = useWebsite();

  const [menuOpen, setMenuOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [garageOpen, setGarageOpen] = useState(false);

  const [favourites, setFavourites] = useState<Vehicle[]>([]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const syncFavs = () => {
      setFavourites(getFavourites());
    };
    syncFavs();

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("favouritesUpdated", syncFavs);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("favouritesUpdated", syncFavs);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Vehicles", href: "/vehicles" },
    { label: "Finance", href: "/finance" },
    { label: "Price My Trade", href: "/price-my-trade" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleSearchClick = () => {
    router.push("/vehicles");
  };

  return (
    <>
      {/* Top Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 px-3 sm:px-4 md:px-10 py-2.5 sm:py-4 transition-all duration-300 ${
          scrolled
            ? "bg-black/95 backdrop-blur-md shadow-2xl"
            : "bg-gradient-to-b from-black/90 via-black/30 to-transparent"
        }`}
      >
        <div className="w-full flex items-center justify-between gap-2">
          
          {/* Left: MENU Button (Hamburger + Text) */}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2.5 text-white hover:text-[#C2410C] focus:outline-none transition group cursor-pointer flex-shrink-0"
            aria-label="Open menu"
          >
            <div className="space-y-1 w-4 sm:w-5 flex flex-col items-start">
              <span className="block w-4 sm:w-5 h-0.5 bg-current transition-all group-hover:w-6" />
              <span className="block w-3 sm:w-3.5 h-0.5 bg-current transition-all group-hover:w-6" />
              <span className="block w-4 sm:w-5 h-0.5 bg-current transition-all group-hover:w-6" />
            </div>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest font-mono select-none hidden min-[380px]:inline">
              MENU
            </span>
          </button>

          {/* Center: Brand Logo & Name */}
          {(() => {
            const name = site?.companyName || "PRIMEY WHEELZ";
            const words = name.trim().split(/\s+/);
            const firstWord = words[0] || "";
            const restWords = words.slice(1).join(" ");
            const hasLogo = Boolean(site?.logo);

            return (
              <Link href="/" className="flex items-center gap-2 sm:gap-3 group select-none justify-center">
                {hasLogo && site?.logo && (
                  <img
                    src={site.logo}
                    alt={site.companyName || "Logo"}
                    className="h-7 sm:h-9 md:h-10 w-auto object-contain transition-transform group-hover:scale-105 rounded flex-shrink-0"
                  />
                )}
                <div className={`items-center gap-1.5 text-lg md:text-2xl tracking-widest font-mono uppercase leading-none ${hasLogo ? "hidden sm:flex" : "flex text-xs sm:text-lg"}`}>
                  <span className="font-black text-white text-shadow-sm">{firstWord}</span>
                  {restWords && (
                    <span className="font-light text-gray-300 tracking-widest">{restWords}</span>
                  )}
                </div>
              </Link>
            );
          })()}

          {/* Right: Three Action Icons (Map Pin, Search, Garage) */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6 text-white relative flex-shrink-0">
            
            {/* 1. Location Map Pin Icon */}
            <button
              onClick={() => setInfoOpen(!infoOpen)}
              className="hover:text-[#C2410C] transition transform hover:scale-110 p-1 sm:p-1.5 rounded-full hover:bg-white/5 cursor-pointer relative"
              title="Our Information"
              aria-label="Location"
            >
              <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-none stroke-current stroke-[2.2]" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* 2. Search Icon (Navigates directly to /vehicles) */}
            <button
              onClick={handleSearchClick}
              className="hover:text-[#C2410C] transition transform hover:scale-110 p-1 sm:p-1.5 rounded-full hover:bg-white/5 cursor-pointer"
              title="Search Vehicles"
              aria-label="Search"
            >
              <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-none stroke-current stroke-[2.2]" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* 3. My Garage Icon */}
            <button
              onClick={() => setGarageOpen(true)}
              className="hover:text-[#C2410C] transition transform hover:scale-110 p-1 sm:p-1.5 rounded-full hover:bg-white/5 cursor-pointer relative"
              title="My Garage"
              aria-label="My Garage"
            >
              <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-none stroke-current stroke-[2.2]" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11h4v10" />
              </svg>
              {favourites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C2410C] text-white text-[9px] sm:text-[10px] font-bold w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center">
                  {favourites.length}
                </span>
              )}
            </button>

            {/* ------------------------------------------------------------- */}
            {/* OUR INFORMATION POPUP CARD (Matching media_1790222910704.png) */}
            {/* ------------------------------------------------------------- */}
            {infoOpen && (
              <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-w-[420px] bg-black border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-2xl animate-fadeIn text-white">
                <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                  <h3 className="font-extrabold text-base tracking-tight font-sans text-white">
                    Our information
                  </h3>
                  <button
                    onClick={() => setInfoOpen(false)}
                    className="text-gray-400 hover:text-white transition p-1"
                  >
                    <svg className="w-5 h-5 stroke-current stroke-2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="pt-4 flex gap-4 items-start">
                  {/* Left: Map Preview Image */}
                  <div className="w-24 h-24 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0 relative">
                    <img
                      src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=300&q=80"
                      alt="Map Location"
                      className="w-full h-full object-cover opacity-75"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Right: Info Details */}
                  <div className="flex-1 text-xs space-y-1.5 font-sans leading-snug">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        site?.address || "Auckland"
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-sm text-white hover:text-[#C2410C] flex items-center gap-1 transition"
                    >
                      {site?.address?.split(",")[0] || "Auckland"} &rsaquo;
                    </a>

                    <p className="text-gray-300 font-normal">
                      {site?.address || "allen bell drive auckland"}
                    </p>

                    <div className="flex items-center gap-2 pt-0.5">
                      {site?.phone && (
                        <a href={`tel:${site.phone}`} className="underline font-semibold hover:text-[#C2410C]">
                          ({site.phone})
                        </a>
                      )}
                      <span>&bull;</span>
                      {site?.email && (
                        <a href={`mailto:${site.email}`} className="underline font-semibold hover:text-[#C2410C]">
                          Email us
                        </a>
                      )}
                    </div>

                    <p className="text-gray-400 text-[11px] pt-1 font-mono">
                      Today&apos;s Hours: {site?.openingHours[0] || "8.30am - 5.30pm"}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* SLIDE DRAWER MENU */}
      {/* ------------------------------------------------------------- */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fadeIn"
            onClick={() => setMenuOpen(false)}
          />

          <div className="relative w-full max-w-sm md:max-w-md bg-white text-zinc-900 min-h-screen shadow-2xl z-50 flex flex-col justify-between p-8 transform transition-transform animate-slideInLeft overflow-y-auto">
            <div>
              <div className="flex justify-between items-center pb-6 border-b border-gray-100">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 text-zinc-800 hover:text-black hover:bg-gray-100 rounded-full transition"
                  aria-label="Close menu"
                >
                  <svg className="w-6 h-6 stroke-current stroke-2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <span className="text-xs font-mono uppercase tracking-widest text-gray-400 font-bold">
                  Menu
                </span>
              </div>

              <nav className="mt-8 space-y-2">
                {navLinks.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={`block px-5 py-3.5 rounded-lg text-lg font-medium transition duration-200 ${
                        active
                          ? "bg-gray-100 text-black font-extrabold shadow-xs"
                          : "text-zinc-700 hover:text-black hover:bg-gray-50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-8 border-t border-gray-100 space-y-4">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setGarageOpen(true);
                }}
                className="w-full flex items-center justify-between px-5 py-3.5 rounded-lg text-base font-semibold text-zinc-800 bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
              >
                <span>My garage</span>
                <span className="bg-gray-300 text-zinc-800 px-3 py-0.5 rounded-full text-xs font-bold">
                  {favourites.length}
                </span>
              </button>

              {site?.phone && (
                <div className="px-5 text-xs text-gray-500 font-mono">
                  Call Us: <a href={`tel:${site.phone}`} className="text-black font-bold hover:underline">{site.phone}</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MY GARAGE OVERLAY MODAL / DRAWER */}
      {/* ------------------------------------------------------------- */}
      {garageOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setGarageOpen(false)}
          />

          <div className="relative w-full max-w-md bg-zinc-950 border-l border-white/10 text-white min-h-screen shadow-2xl z-50 flex flex-col justify-between p-6 overflow-y-auto">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🚗</span>
                  <h3 className="text-lg font-bold font-mono uppercase tracking-wider">
                    My Garage ({favourites.length})
                  </h3>
                </div>
                <button
                  onClick={() => setGarageOpen(false)}
                  className="text-gray-400 hover:text-white transition p-1"
                >
                  <svg className="w-6 h-6 stroke-current stroke-2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {favourites.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <span className="text-4xl block mb-3">🚗</span>
                  <p className="font-mono text-sm uppercase font-bold text-gray-300 mb-1">
                    Your Garage is Empty
                  </p>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto mb-6">
                    Click the heart icon on any vehicle listing to save it to your garage.
                  </p>
                  <button
                    onClick={() => {
                      setGarageOpen(false);
                      router.push("/vehicles");
                    }}
                    className="px-6 py-2.5 bg-[#C2410C] hover:bg-[#a33509] text-white text-xs font-bold uppercase font-mono rounded transition"
                  >
                    Browse Vehicles
                  </button>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {favourites.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-zinc-900 border border-white/10 rounded-xl flex gap-3 items-center group relative"
                    >
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-[#C2410C] transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-xs text-[#C2410C] font-mono font-bold mt-0.5">
                          ${item.price.toLocaleString("en-NZ")}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          {item.year ? `${item.year} • ` : ""}{item.kilometers ? `${item.kilometers.toLocaleString("en-NZ")} km` : ""}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          toggleFavourite(item);
                          setFavourites(getFavourites());
                        }}
                        className="text-gray-500 hover:text-red-500 transition p-1.5"
                        title="Remove from Garage"
                      >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {favourites.length > 0 && (
              <div className="pt-6 border-t border-white/10">
                <button
                  onClick={() => {
                    setGarageOpen(false);
                    router.push("/vehicles");
                  }}
                  className="w-full text-center py-3 bg-[#C2410C] hover:bg-[#a33509] text-white font-bold font-mono text-xs uppercase tracking-wider rounded-lg transition"
                >
                  View All Garage Vehicles ({favourites.length})
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
