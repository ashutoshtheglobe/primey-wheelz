"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Vehicle } from "@/types";
import { fetchUser251Listings } from "@/services/backendApi";
import { useWebsite } from "@/context/WebsiteContext";
import { toggleFavourite } from "@/utils/favourites";
import { determineSaleMethod } from "@/utils/saleMethod";

export default function Home() {
  const { site } = useWebsite();
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);
  const [totalVehicles, setTotalVehicles] = useState<number>(0);
  const [loadingListings, setLoadingListings] = useState<boolean>(true);

  // Scroll reveal observer state for Latest Vehicles
  const [sectionVisible, setSectionVisible] = useState(false);
  const latestSectionRef = useRef<HTMLDivElement>(null);

  // Scroll reveal observer state for Finance Services
  const [financeVisible, setFinanceVisible] = useState(false);
  const financeSectionRef = useRef<HTMLDivElement>(null);

  // Scroll reveal observer state for Body Style Categories ("How car buying should be")
  const [categoriesVisible, setCategoriesVisible] = useState(false);
  const categoriesSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadBackendData() {
      setLoadingListings(true);
      const listingsData = await fetchUser251Listings(251, 1, 3);
      setFeaturedVehicles(listingsData.listings);
      setTotalVehicles(listingsData.total);
      setLoadingListings(false);
    }
    loadBackendData();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCategoriesVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (categoriesSectionRef.current) {
      observer.observe(categoriesSectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (loadingListings) return;

    let timer: NodeJS.Timeout;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => {
            setSectionVisible(true);
          }, 50);
        }
      },
      { threshold: 0.1 }
    );

    if (latestSectionRef.current) {
      observer.observe(latestSectionRef.current);
    }

    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [loadingListings]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFinanceVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (financeSectionRef.current) {
      observer.observe(financeSectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-black text-white font-sans">
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-zinc-950 overflow-hidden">
        {/* Background Video/Image Overlay */}
        <div className="absolute inset-0">
          {site?.heroVideo ? (
            <video
              src={site.heroVideo}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-50"
            />
          ) : (
            <div
              className="w-full h-full bg-cover bg-center opacity-30"
              style={{
                backgroundImage: site?.heroBanner
                  ? `linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url('${site.heroBanner}')`
                  : "linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80')",
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6 py-20">
          <span className="text-[#C2410C] font-mono text-xs md:text-sm uppercase tracking-widest font-extrabold bg-[#C2410C]/10 px-4 py-2 rounded-full border border-[#C2410C]/30 inline-block mb-6">
            Welcome to Christchurch&apos;s Premium Dealership
          </span>

          <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tight font-mono drop-shadow-2xl leading-tight">
            Welcome to <span className="text-[#C2410C]">{site?.companyName || "Primey Wheelz"}</span>
          </h1>

          <p className="mt-6 text-xl md:text-2xl text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
            High quality handpicked vehicles with low interest finance & instant trade-in appraisals.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
            <Link
              href="/vehicles"
              className="relative inline-flex items-center justify-center px-10 py-4 font-bold text-white uppercase tracking-wider transform hover:scale-105 transition duration-300"
            >
              <span className="absolute inset-0 bg-[#C2410C] -skew-x-12" />
              <span className="relative z-10 block skew-x-12 flex items-center gap-2">
                Explore Vehicles
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </Link>

            <Link
              href="/finance"
              className="relative inline-flex items-center justify-center px-10 py-4 font-bold text-white uppercase tracking-wider border border-white/20 hover:border-white rounded bg-white/5 backdrop-blur-md transition duration-300"
            >
              Apply For Finance
            </Link>
          </div>
        </div>
      </section>

      {/* "HOW CAR BUYING SHOULD BE" - BODY STYLE CATEGORIES SECTION */}
      <section ref={categoriesSectionRef} className="py-24 bg-black border-t border-white/10 overflow-hidden relative">
        {/* Ambient Light Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-40 bg-[#C2410C]/15 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div
            className={`text-center mb-16 transition-all duration-700 ease-out transform ${
              categoriesVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-6 pointer-events-none"
            }`}
          >
            <span className="text-[#C2410C] font-mono text-xs uppercase tracking-widest font-extrabold bg-[#C2410C]/10 px-4 py-1.5 rounded-full border border-[#C2410C]/30 inline-block mb-4 shadow-sm">
              ✨ The Primey Experience
            </span>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-cursive font-normal text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-[#C2410C] tracking-wide drop-shadow-2xl py-1">
              &ldquo;How car buying should be&rdquo;
            </h2>
            <p className="mt-3 text-gray-300 font-sans text-sm md:text-base font-light italic max-w-xl mx-auto leading-relaxed">
              Transparent pricing, handpicked vehicles & effortless finance — tailored around you.
            </p>
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#C2410C] to-transparent mx-auto mt-5" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                title: "Ute",
                image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
                href: "/vehicles?bodyStyle=Ute",
                span: "col-span-1",
              },
              {
                title: "SUV",
                image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80",
                href: "/vehicles?bodyStyle=SUV",
                span: "col-span-1",
              },
              {
                title: "Performance",
                image: "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=800&q=80",
                href: "/vehicles?bodyStyle=Performance",
                span: "col-span-1",
              },
              {
                title: "Station Wagon",
                image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80",
                href: "/vehicles?bodyStyle=Station%20Wagon",
                span: "col-span-1",
              },
              {
                title: "Sedan",
                image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
                href: "/vehicles?bodyStyle=Sedan",
                span: "col-span-1",
              },
              {
                title: "Hatchback",
                image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
                href: "/vehicles?bodyStyle=Hatchback",
                span: "col-span-1",
              },
              {
                title: "View all",
                image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80",
                href: "/vehicles",
                span: "col-span-2",
                isMonochrome: true,
              },
            ].map((cat, idx) => (
              <Link
                key={cat.title}
                href={cat.href}
                className={`group relative rounded-xl overflow-hidden bg-zinc-900 border border-white/10 aspect-[4/3] ${cat.span} transition-all duration-700 ease-out transform ${
                  categoriesVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10 pointer-events-none"
                }`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
                    cat.isMonochrome ? "grayscale contrast-125 opacity-70 group-hover:opacity-90" : "opacity-85"
                  }`}
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Label Text */}
                <div className="absolute bottom-4 left-4 md:bottom-5 md:left-5 text-white font-bold text-lg md:text-xl font-sans flex items-center gap-1.5 z-10 group-hover:text-[#C2410C] transition-colors">
                  <span>{cat.title}</span>
                  <span className="text-base font-normal opacity-90 transition-transform duration-300 group-hover:translate-x-1">&rsaquo;</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST VEHICLES SECTION (Matching uploaded image & staggered scroll reveal) */}
      <section ref={latestSectionRef} className="py-24 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div>
              <span className="text-[#C2410C] font-mono text-xs uppercase tracking-widest font-bold">
                Featured Inventory
              </span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-wider font-mono text-white mt-2">
                Latest Vehicles
              </h2>
              <div className="w-12 h-0.5 bg-[#C2410C] mt-4" />
            </div>

            <Link
              href="/vehicles"
              className="text-[#C2410C] hover:text-white font-mono text-sm uppercase tracking-wider font-extrabold flex items-center gap-2 transition"
            >
              View All Showroom Vehicles ({totalVehicles}) &rarr;
            </Link>
          </div>

          {loadingListings ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 animate-pulse h-96" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredVehicles.slice(0, 3).map((vehicle, index) => {
                const specParts = [
                  vehicle.kilometers ? `${vehicle.kilometers.toLocaleString("en-NZ")}km` : "",
                  vehicle.transmission,
                  vehicle.fuelType,
                  vehicle.engineSize,
                  vehicle.bodyStyle,
                  vehicle.location
                ].filter(Boolean);

                const saleMethodInfo = determineSaleMethod(vehicle);

                return (
                  <Link
                    key={vehicle.id}
                    href={`/vehicles/${vehicle.id}`}
                    className={`group flex flex-col transition-all duration-700 ease-out transform cursor-pointer ${
                      sectionVisible
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-16 pointer-events-none"
                    }`}
                    style={{ transitionDelay: `${index * 200}ms` }}
                  >
                    {/* Image Container */}
                    <div className="relative h-64 md:h-72 w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 select-none">
                      <img
                        src={vehicle.images[0]}
                        alt={vehicle.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* Dynamic Pill Badge */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                        {vehicle.isListedToday && (
                          <div className="bg-[#10B981] text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            Listed Today
                          </div>
                        )}
                        {saleMethodInfo.isAuction && (
                          <div className="bg-purple-600 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                            Auction
                          </div>
                        )}
                        {saleMethodInfo.isPBN && (
                          <div className="bg-amber-600 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                            By Negotiation
                          </div>
                        )}
                        {vehicle.isSale && !saleMethodInfo.isPBN && (
                          <div className="bg-[#A855F7] text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                            On Sale
                          </div>
                        )}
                      </div>

                      {/* Top-Right Garage Icon Badge */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavourite(vehicle);
                        }}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-zinc-900 flex items-center justify-center shadow-lg hover:scale-110 transition cursor-pointer z-10"
                        title="Save to My Garage"
                      >
                        <svg className="w-4.5 h-4.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11h4v10" />
                        </svg>
                      </button>
                    </div>

                    {/* Content Details (Dynamic GraphQL payload data) */}
                    <div className="pt-4 flex flex-col space-y-1.5">
                      {/* Title Line */}
                      <h3 className="text-white text-base md:text-lg tracking-tight leading-snug line-clamp-1 font-mono">
                        {vehicle.year && (
                          <span className="font-normal text-gray-300">{vehicle.year} </span>
                        )}
                        <span className="font-black text-white uppercase">{vehicle.title}</span>
                      </h3>

                      {/* Subtitle Spec Line */}
                      {specParts.length > 0 && (
                        <p className="text-gray-400 text-xs font-sans line-clamp-1">
                          {specParts.join(", ")}
                        </p>
                      )}

                      {/* Price Row */}
                      <div className="flex items-center gap-2 pt-1 font-mono flex-wrap">
                        <span className="text-white text-xl md:text-2xl font-extrabold tracking-tight">
                          {saleMethodInfo.formattedDisplay}
                        </span>
                        {vehicle.isSale && !saleMethodInfo.isPBN && (
                          <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                            Sale
                          </span>
                        )}
                        {vehicle.wasPrice && !saleMethodInfo.isPBN && (
                          <span className="text-gray-500 line-through text-xs font-normal">
                            Was ${vehicle.wasPrice.toLocaleString("en-NZ")}
                          </span>
                        )}
                      </div>

                      {/* Finance Estimate Row */}
                      {vehicle.weeklyEstimate > 0 && (
                        <div className="flex items-center justify-between text-xs text-gray-400 pt-1 font-sans">
                          <span>Finance ~${vehicle.weeklyEstimate}/week</span>
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
      </section>

      {/* OUR SERVICES SECTION (NATIONWIDE DELIVERY & TRADE IN CARDS) */}
      {(() => {
        let servicesList: Array<{
          title: string;
          description: string;
          image?: string;
          buttonText?: string;
          buttonLink?: string;
        }> = [];

        if (site?.services) {
          try {
            const raw = typeof site.services === "string" ? JSON.parse(site.services) : site.services;
            if (Array.isArray(raw) && raw.length > 0) {
              servicesList = raw.map((item: any, idx: number) => ({
                ...item,
                image: item.image || (item.title?.toLowerCase().includes("delivery") || idx === 0
                  ? "/images/services/nationwide_delivery.jpg"
                  : "/images/services/trade_in_cars.jpg"),
              }));
            }
          } catch (e) {
            // Ignore parse error
          }
        }

        if (servicesList.length === 0) {
          servicesList = [
            {
              title: "NATIONWIDE DELIVERY",
              description: `No matter where you're located in New Zealand, ${site?.companyName || "Primey wheelz NZ"} brings your new vehicle right to your door — expertly detailed, fully prepared, and delivered with the same care and quality we're known for. Seamless, secure, and showroom-ready — that's the ${site?.companyName || "Primey wheelz NZ"} promise.`,
              image: "/images/services/nationwide_delivery.jpg",
              buttonText: "FIND OUT MORE",
              buttonLink: "/about",
            },
            {
              title: "TRADE IN",
              description: `Looking to upgrade? We make trading in your current vehicle quick and easy. At ${site?.companyName || "Primey wheelz NZ"}, we offer fair market value and a smooth process — so you can get behind the wheel of your next car faster, with no added stress. Your next drive starts here.`,
              image: "/images/services/trade_in_cars.jpg",
              buttonText: "PRICE MY TRADE",
              buttonLink: "/price-my-trade",
            },
          ];
        }

        return (
          <section className="py-20 bg-black border-t border-zinc-900 text-zinc-900">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              <div className="grid md:grid-cols-2 gap-8">
                {servicesList.map((service, idx) => (
                  <div
                    key={service.title || idx}
                    className="bg-[#FAFAFA] rounded-2xl p-6 border border-zinc-200 shadow-xl flex flex-col justify-between hover:border-[#FF2D2D]/60 hover:shadow-2xl transition-all duration-300 group"
                  >
                    <div>
                      {service.image && (
                        <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden mb-6 bg-zinc-200">
                          <img
                            src={service.image}
                            alt={service.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}

                      <h3 className="text-xl md:text-2xl font-black font-mono uppercase text-center text-zinc-900 tracking-wider mb-2">
                        {service.title}
                      </h3>
                      <div className="w-12 h-0.5 bg-[#FF2D2D] mx-auto mb-6" />

                      <p className="text-zinc-600 font-sans text-xs md:text-sm leading-relaxed text-center mb-8 px-2">
                        {service.description}
                      </p>
                    </div>

                    <div className="text-center pb-2">
                      <Link
                        href={service.buttonLink || "/vehicles"}
                        className="inline-block bg-[#FF2D2D] hover:bg-[#d92323] text-white font-mono font-black text-xs uppercase tracking-wider px-8 py-3.5 transform -skew-x-12 rounded transition-all shadow-md hover:scale-105"
                      >
                        <span className="inline-block transform skew-x-12">
                          {service.buttonText || "LEARN MORE"}
                        </span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* ABOUT SECTION */}
      {site?.about && (
        <section className="py-24 bg-black text-white relative">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[#C2410C] font-mono text-xs uppercase tracking-widest font-bold">
                Who We Are
              </span>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-wider font-mono mt-2 mb-6">
                About {site.companyName}
              </h2>
              <div className="w-12 h-0.5 bg-[#C2410C] mb-8" />

              <p className="text-gray-300 leading-relaxed text-base mb-6 whitespace-pre-line">
                {site.about}
              </p>

              <div className="grid sm:grid-cols-2 gap-6 pt-4">
                <div className="p-4 bg-zinc-900 rounded-lg border border-white/5">
                  <h4 className="font-bold text-white font-mono uppercase text-sm mb-1">
                    Quality Assured
                  </h4>
                  <p className="text-xs text-gray-400">
                    Every vehicle undergoes comprehensive safety and mechanical checks.
                  </p>
                </div>
                <div className="p-4 bg-zinc-900 rounded-lg border border-white/5">
                  <h4 className="font-bold text-white font-mono uppercase text-sm mb-1">
                    Flexible Finance
                  </h4>
                  <p className="text-xs text-gray-400">
                    Tailored payment solutions designed around your budget.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/about"
                  className="inline-block px-8 py-3 bg-[#C2410C] text-white font-bold font-mono text-xs uppercase tracking-wider rounded hover:bg-[#a33509] transition"
                >
                  Learn More About Us
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <img
                  src={site?.aboutBanner || "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=80"}
                  alt={`About ${site?.companyName || "Primey Wheelz"}`}
                  className="w-full h-[450px] object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FINANCE SERVICES SECTION */}
      <section ref={financeSectionRef} className="py-24 bg-[#0F172A] text-white border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div
            className={`text-center mb-16 transition-all duration-700 ease-out transform ${
              financeVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-8 pointer-events-none"
            }`}
          >
            <span className="text-[#C2410C] font-mono text-xs uppercase tracking-widest font-bold">
              Easy Payment Options
            </span>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-wider font-mono mt-2">
              Finance Services
            </h2>
            <div className="w-12 h-0.5 bg-[#C2410C] mx-auto mt-4" />
            <p className="mt-6 text-gray-300 max-w-2xl mx-auto text-sm leading-relaxed">
              {site?.financeDescription || "Flexible and affordable finance solutions tailored to your individual budget and lifestyle."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "🚗",
                title: "Car Finance",
                desc: "Quick approvals, competitive rates, and easy weekly repayments.",
              },
              {
                icon: "💼",
                title: "Business Loans",
                desc: "Ute and commercial vehicle leasing & loan options for company fleets.",
              },
              {
                icon: "🔄",
                title: "Trade-In Cash Back",
                desc: "Use your existing vehicle as deposit or trade it in for instant cash credit.",
              },
              {
                icon: "⚡",
                title: "Same-Day Approval",
                desc: "Submit your application online and get approved in under 2 hours.",
              },
            ].map((item, idx) => (
              <div
                key={item.title}
                className={`bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-[#C2410C]/60 hover:bg-white/10 hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 transform group cursor-pointer ${
                  financeVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12 pointer-events-none"
                }`}
                style={{ transitionDelay: `${idx * 150}ms` }}
              >
                <div className="w-12 h-12 bg-[#C2410C]/20 text-[#C2410C] rounded-lg flex items-center justify-center mb-6 text-2xl font-bold transition-transform duration-300 group-hover:scale-110">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold font-mono uppercase mb-3 group-hover:text-[#C2410C] transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div
            className={`mt-14 text-center transition-all duration-700 ease-out delay-500 transform ${
              financeVisible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-6 scale-95 pointer-events-none"
            }`}
          >
            <Link
              href="/finance"
              className="inline-block px-10 py-4 bg-[#C2410C] text-white font-bold font-mono text-sm uppercase tracking-wider rounded hover:bg-[#a33509] hover:scale-105 transition duration-300 shadow-lg"
            >
              Apply Online Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
