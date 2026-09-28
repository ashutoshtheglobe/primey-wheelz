"use client";

import React, { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  fetchListingById,
  getListingImageUrls,
  fetchUser251Listings,
} from "@/services/backendApi";
import { DetailedListing, Vehicle } from "@/types";
import { isFavourite, toggleFavourite } from "@/utils/favourites";
import { determineSaleMethod } from "@/utils/saleMethod";

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const listingId = resolvedParams.id;

  const [listing, setListing] = useState<DetailedListing | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showLightbox, setShowLightbox] = useState<boolean>(false);
  const [showStickyHeader, setShowStickyHeader] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [similarVehicles, setSimilarVehicles] = useState<Vehicle[]>([]);

  // Modals state
  const [activeModal, setActiveModal] = useState<"enquire" | "testdrive" | "question" | "tradein" | null>(null);
  const [modalSubmitted, setModalSubmitted] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    preferredDate: "",
  });

  // Expand description toggle
  const [isDescExpanded, setIsDescExpanded] = useState<boolean>(false);

  // Finance Calculator state
  const [deposit, setDeposit] = useState<number>(200);
  const [loanTermMonths, setLoanTermMonths] = useState<number>(36);

  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchListingById(listingId);
      setListing(data);
      if (data) {
        setIsSaved(isFavourite(String(data.id)));
      }

      // Fetch similar listings for recently viewed / recommended section
      const recentRes = await fetchUser251Listings(251, 1, 4);
      setSimilarVehicles(recentRes.listings.filter((v) => String(v.id) !== String(listingId)));

      setLoading(false);
    }
    loadData();
  }, [listingId]);

  // Scroll listener for sticky top bar
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setShowStickyHeader(rect.bottom < 80);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleFav = () => {
    if (!listing) return;
    const images = getListingImageUrls(listing);
    const vehicleObj: Vehicle = {
      id: String(listing.id),
      title: listing.title,
      make: getAttr("Make") || listing.title.split(" ")[0] || "Vehicle",
      model: getAttr("Model") || listing.title.split(" ").slice(1).join(" ") || "",
      year: parseInt(getAttr("Year")) || undefined,
      price: listing.salePrice || listing.listPrice || listing.basePrice || 0,
      weeklyEstimate: Math.round(((listing.listPrice || 1500) * 0.1095) / 52),
      location: `${listing.location?.city || ""}, ${listing.location?.state || ""}`,
      images: images,
      description: listing.description || "",
      features: [],
    };
    toggleFavourite(vehicleObj);
    const nextSavedState = isFavourite(String(listing.id));
    setIsSaved(nextSavedState);
    triggerToast(nextSavedState ? "Saved to your Garage! ❤️" : "Removed from Garage");
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      triggerToast("Listing link copied to clipboard! 📋");
    }
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalSubmitted(true);
    setTimeout(() => {
      setModalSubmitted(false);
      setActiveModal(null);
      setFormData({ name: "", email: "", phone: "", message: "", preferredDate: "" });
      triggerToast("Thank you! Your request has been sent to the seller.");
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 pb-24 px-4 max-w-7xl mx-auto animate-pulse">
        <div className="h-8 w-48 bg-zinc-800 rounded mb-6"></div>
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 h-96 bg-zinc-900 rounded-2xl border border-zinc-800"></div>
          <div className="h-96 bg-zinc-900 rounded-2xl border border-zinc-800"></div>
        </div>
        <div className="h-64 bg-zinc-900 rounded-2xl border border-zinc-800"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-black text-white pt-36 pb-24 px-4 text-center max-w-xl mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-500">
          🔍
        </div>
        <h1 className="text-3xl font-black font-mono uppercase mb-2">Listing Not Found</h1>
        <p className="text-gray-400 text-sm mb-6">
          The requested listing #{listingId} could not be found or has been removed.
        </p>
        <Link
          href="/vehicles"
          className="inline-block px-6 py-3 bg-[#C2410C] text-white font-bold font-mono text-xs uppercase tracking-wider rounded-lg hover:bg-[#a33509] transition"
        >
          Browse All Vehicles
        </Link>
      </div>
    );
  }

  // Extract listing attribute helper
  const getAttr = (...names: string[]): string => {
    if (!listing.listingAttributeOptions) return "";
    for (const name of names) {
      const found = listing.listingAttributeOptions.find(
        (o) => o.listingAttribute?.name?.toLowerCase() === name.toLowerCase()
      );
      if (found?.value) return found.value;
    }
    return "";
  };

  const images = getListingImageUrls(listing);
  const currentImage = images[activeImageIndex] || images[0];

  const bodyType = getAttr("Body Type") || "Vehicle";
  const engineSize = getAttr("Engine Size") || "N/A";
  const crashStars = getAttr("Crash Avoidance Stars") || "N/A";
  const odometer = getAttr("Kilometres", "Odometer", "Km") || "N/A";
  const transmission = getAttr("Transmission") || "Automatic";
  const fuelType = getAttr("Fuel Type", "Fuel") || "Petrol";
  const yearStr = getAttr("Year", "Year Of Manufacture") || "2026";

  const price = listing.salePrice || listing.listPrice || listing.basePrice || 0;
  const wasPrice = listing.basePrice && listing.basePrice > price ? listing.basePrice : null;

  // Dealer Business & Finance Details
  const businessDetail = listing.user?.userBusinessDetails?.[0];
  const financeRates = businessDetail?.finance || {
    annualInterestRate: 10,
    loanEstablishmentFee: 20,
    securityFee: 30,
    monthlyMaintenanceFee: 40,
  };

  // Finance calculation logic
  const annualRate = (financeRates.annualInterestRate || 10) / 100;
  const principal = Math.max(0, price - deposit + (financeRates.loanEstablishmentFee || 0));
  const weeklyRate = annualRate / 52;
  const totalWeeks = (loanTermMonths / 12) * 52;
  const estimatedWeekly =
    weeklyRate > 0
      ? Math.round(
          (principal * (weeklyRate * Math.pow(1 + weeklyRate, totalWeeks))) /
            (Math.pow(1 + weeklyRate, totalWeeks) - 1) +
            (financeRates.monthlyMaintenanceFee || 0) / 4
        )
      : Math.round(principal / totalWeeks);
  const totalRepayment = Math.round(estimatedWeekly * totalWeeks);

  const primaryContact = listing.contacts?.[0] || {
    name: `${listing.user?.firstName || ""} ${listing.user?.lastName || ""}`.trim() || "Dealer Contact",
    phone: listing.contact || listing.user?.phone || "07404506030",
    email: listing.user?.email || "ashup8998+123@gmail.com",
  };

  const saleMethodDetails = determineSaleMethod(listing);

  const locationStr = [
    listing.location?.address,
    listing.location?.city,
    listing.location?.state,
  ]
    .filter(Boolean)
    .join(", ") || "Dargaville, Northland";

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-28 pt-24 md:pt-28">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#C2410C] text-white px-5 py-3 rounded-xl shadow-2xl font-mono text-xs font-bold uppercase tracking-wider animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Sticky Top Header Bar (Appears when scrolled past hero) */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 bg-zinc-950/95 border-b border-zinc-800 backdrop-blur-md transition-all duration-300 transform ${
          showStickyHeader ? "translate-y-0 opacity-100 py-3" : "-translate-y-full opacity-0 py-0 pointer-events-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={currentImage}
              alt={listing.title}
              className="w-12 h-12 object-cover rounded-lg border border-zinc-800 flex-shrink-0"
            />
            <div className="truncate">
              <h2 className="text-sm font-bold font-mono text-white uppercase truncate">
                {yearStr} {listing.title}
              </h2>
              <div className="text-xs text-[#C2410C] font-mono font-extrabold">
                {saleMethodDetails.isPBN ? "Price By Negotiation" : `$${price.toLocaleString("en-NZ")}`}
                {wasPrice && !saleMethodDetails.isPBN && (
                  <span className="text-gray-500 line-through text-[10px] ml-2">
                    Was ${wasPrice.toLocaleString("en-NZ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModal("enquire")}
              className="px-4 py-2 bg-[#C2410C] text-white text-xs font-mono font-bold uppercase rounded-lg hover:bg-[#a33509] transition"
            >
              Enquire
            </button>
            <button
              onClick={() => setActiveModal("testdrive")}
              className="hidden sm:inline-flex px-4 py-2 bg-zinc-800 text-white text-xs font-mono font-bold uppercase rounded-lg border border-zinc-700 hover:bg-zinc-700 transition"
            >
              Book Test Drive
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Top Quick Actions & Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <Link
            href="/vehicles"
            className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white uppercase tracking-wider transition"
          >
            <span>&larr;</span> Back to vehicles
          </Link>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/finance"
              className="inline-flex items-center gap-1.5 bg-white text-black text-xs font-mono font-bold px-4 py-2.5 rounded-lg hover:bg-gray-200 transition shadow"
            >
              <span>$</span> APPLY FOR FINANCE
            </Link>
            <button
              onClick={() => setActiveModal("testdrive")}
              className="inline-flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 text-white text-xs font-mono font-bold px-4 py-2.5 rounded-lg hover:bg-zinc-800 transition"
            >
              <span>🚘</span> BOOK A TEST DRIVE
            </button>
            <Link
              href="/price-my-trade"
              className="inline-flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 text-white text-xs font-mono font-bold px-4 py-2.5 rounded-lg hover:bg-zinc-800 transition"
            >
              <span>⇄</span> PRICE MY TRADE
            </Link>
          </div>
        </div>

        {/* Hero Gallery Grid Section */}
        <div ref={heroRef} className="grid lg:grid-cols-3 gap-4 mb-8">
          {/* Main Hero Photo Container (Spans 2 columns) */}
          <div className="lg:col-span-2 relative aspect-[16/10] bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 group select-none">
            <img
              src={currentImage}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102 cursor-pointer"
              onClick={() => setShowLightbox(true)}
            />

            {/* Badges Overlay (Top Left) */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
              <span className="bg-[#C2410C] text-white text-xs font-mono font-extrabold uppercase px-3 py-1 rounded-full shadow-lg">
                {listing.status || "Active"}
              </span>
              <span className="bg-zinc-900/90 text-zinc-300 border border-zinc-700 text-xs font-mono font-semibold uppercase px-3 py-1 rounded-full backdrop-blur-md">
                {saleMethodDetails.label}
              </span>
              {crashStars !== "N/A" && (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold px-3 py-1 rounded-full backdrop-blur-md">
                  ★ {crashStars} Stars Safety
                </span>
              )}
            </div>

            {/* Photo Count Badge (Top Right) */}
            <button
              onClick={() => setShowLightbox(true)}
              className="absolute top-4 right-4 bg-zinc-950/80 hover:bg-black text-white text-xs font-mono font-bold px-3.5 py-1.5 rounded-full backdrop-blur-md border border-zinc-700 shadow-xl transition flex items-center gap-1.5 z-10"
            >
              <span>📷</span> {images.length} Photos
            </button>

            {/* View Fullscreen overlay prompt */}
            <div
              onClick={() => setShowLightbox(true)}
              className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            >
              <span className="bg-black/80 text-white text-xs font-mono uppercase tracking-widest px-4 py-2 rounded-lg border border-zinc-700">
                Click to expand gallery 🔍
              </span>
            </div>
          </div>

          {/* Side Stacked Thumbnails (Desktop Right Column) */}
          <div className="grid grid-rows-2 gap-4 h-full">
            {images.slice(1, 3).map((imgUrl, idx) => (
              <div
                key={idx}
                onClick={() => setActiveImageIndex(idx + 1)}
                className={`relative aspect-[16/10] lg:aspect-auto h-full bg-zinc-900 rounded-2xl overflow-hidden border transition cursor-pointer group ${
                  activeImageIndex === idx + 1 ? "border-[#C2410C] ring-2 ring-[#C2410C]/50" : "border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
            {images.length <= 1 && (
              <div className="relative h-full bg-zinc-900/50 rounded-2xl border border-zinc-800/80 flex items-center justify-center text-zinc-600 font-mono text-xs uppercase p-6 text-center">
                High Quality Vehicle Gallery
              </div>
            )}
          </div>
        </div>

        {/* Horizontal Thumbnail Selector Row */}
        {images.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 scrollbar-thin">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition ${
                  activeImageIndex === idx ? "border-[#C2410C] scale-105" : "border-zinc-800 opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Main Content Layout (Left Details + Right Sticky Card) */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN (65%) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Breadcrumb path */}
            <div className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Link href="/vehicles" className="hover:text-white transition">Vehicles</Link>
              <span>&rsaquo;</span>
              <span className="text-zinc-300">{bodyType}</span>
              <span>&rsaquo;</span>
              <span className="text-[#C2410C] font-bold">Ref #{listing.id}</span>
            </div>

            {/* Vehicle Main Title & Share/Fav Row */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight font-mono leading-none">
                  {yearStr} {listing.title}
                </h1>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleShare}
                    className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 hover:border-zinc-700 text-gray-300 hover:text-white transition"
                    title="Share listing"
                  >
                    <svg className="w-5 h-5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleToggleFav}
                    className={`p-3 rounded-xl border transition ${
                      isSaved
                        ? "bg-red-600 border-red-500 text-white"
                        : "bg-zinc-900 border-zinc-800 text-gray-300 hover:bg-zinc-800 hover:text-white"
                    }`}
                    title={isSaved ? "Remove from Garage" : "Save to Garage"}
                  >
                    <svg className={`w-5 h-5 ${isSaved ? "fill-current" : "fill-none stroke-current stroke-2"}`} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11h4v10" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Highlight Specs Summary Line */}
              <p className="mt-3 text-sm md:text-base text-zinc-400 font-sans">
                {[locationStr, bodyType, engineSize].filter(Boolean).join(" · ")}
              </p>
            </div>

            <hr className="border-zinc-800" />

            {/* DESCRIPTION SECTION */}
            <div>
              <h2 className="text-xl font-black font-mono uppercase tracking-tight text-white mb-4">
                DESCRIPTION
              </h2>
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 text-zinc-300 leading-relaxed text-sm md:text-base">
                <p className={!isDescExpanded && (listing.description?.length || 0) > 300 ? "line-clamp-4" : ""}>
                  {listing.description || listing.shortDescription || "No detailed description provided."}
                </p>
                {(listing.description?.length || 0) > 300 && (
                  <button
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    className="mt-3 text-xs font-mono font-bold text-[#C2410C] hover:underline uppercase tracking-wider"
                  >
                    {isDescExpanded ? "Show Less ▲" : "Read More ▼"}
                  </button>
                )}
              </div>
            </div>

            {/* DETAILS SECTION */}
            <div>
              <h2 className="text-xl font-black font-mono uppercase tracking-tight text-white mb-4">
                DETAILS
              </h2>
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                  <div className="flex justify-between border-b border-zinc-800/60 pb-3">
                    <span className="text-gray-400 font-sans">Stock No / Listing ID</span>
                    <span className="font-mono font-bold text-white">{listing.id}</span>
                  </div>

                  <div className="flex justify-between border-b border-zinc-800/60 pb-3">
                    <span className="text-gray-400 font-sans">Body Style</span>
                    <span className="font-mono font-bold text-white">{bodyType}</span>
                  </div>

                  <div className="flex justify-between border-b border-zinc-800/60 pb-3">
                    <span className="text-gray-400 font-sans">Engine Size</span>
                    <span className="font-mono font-bold text-white">{engineSize}</span>
                  </div>

                  <div className="flex justify-between border-b border-zinc-800/60 pb-3">
                    <span className="text-gray-400 font-sans">Crash Avoidance</span>
                    <span className="font-mono font-bold text-amber-400">{crashStars} Stars</span>
                  </div>

                  <div className="flex justify-between border-b border-zinc-800/60 pb-3">
                    <span className="text-gray-400 font-sans">Odometer</span>
                    <span className="font-mono font-bold text-white">{odometer}</span>
                  </div>

                  <div className="flex justify-between border-b border-zinc-800/60 pb-3">
                    <span className="text-gray-400 font-sans">Transmission</span>
                    <span className="font-mono font-bold text-white">{transmission}</span>
                  </div>

                  <div className="flex justify-between border-b border-zinc-800/60 pb-3">
                    <span className="text-gray-400 font-sans">Fuel Type</span>
                    <span className="font-mono font-bold text-white">{fuelType}</span>
                  </div>

                  <div className="flex justify-between border-b border-zinc-800/60 pb-3">
                    <span className="text-gray-400 font-sans">Location</span>
                    <span className="font-mono font-bold text-white">{listing.location?.city || "Dargaville"}</span>
                  </div>

                  <div className="flex justify-between border-b border-zinc-800/60 pb-3">
                    <span className="text-gray-400 font-sans">Sale Method</span>
                    <span className="font-mono font-bold text-white uppercase">{saleMethodDetails.label}</span>
                  </div>

                  <div className="flex justify-between border-b border-zinc-800/60 pb-3">
                    <span className="text-gray-400 font-sans">Listed Date</span>
                    <span className="font-mono font-bold text-white">
                      {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString("en-NZ", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* FEATURES SECTION */}
            <div>
              <h2 className="text-xl font-black font-mono uppercase tracking-tight text-white mb-4">
                FEATURES & HIGHLIGHTS
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center gap-3">
                  <span className="text-xl">⚡</span>
                  <div>
                    <div className="text-[11px] text-gray-400 uppercase font-mono">Engine</div>
                    <div className="text-sm font-mono font-bold text-white">{engineSize}</div>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center gap-3">
                  <span className="text-xl">🚗</span>
                  <div>
                    <div className="text-[11px] text-gray-400 uppercase font-mono">Body</div>
                    <div className="text-sm font-mono font-bold text-white">{bodyType}</div>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center gap-3">
                  <span className="text-xl">🛡️</span>
                  <div>
                    <div className="text-[11px] text-gray-400 uppercase font-mono">Safety Rating</div>
                    <div className="text-sm font-mono font-bold text-amber-400">{crashStars} Stars</div>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center gap-3">
                  <span className="text-xl">📍</span>
                  <div>
                    <div className="text-[11px] text-gray-400 uppercase font-mono">Location</div>
                    <div className="text-sm font-mono font-bold text-white">{listing.location?.city || "Dargaville"}</div>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center gap-3">
                  <span className="text-xl">🏷️</span>
                  <div>
                    <div className="text-[11px] text-gray-400 uppercase font-mono">Sale Method</div>
                    <div className="text-sm font-mono font-bold text-white capitalize">{saleMethodDetails.label}</div>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center gap-3">
                  <span className="text-xl">✅</span>
                  <div>
                    <div className="text-[11px] text-gray-400 uppercase font-mono">Condition</div>
                    <div className="text-sm font-mono font-bold text-emerald-400">Clear Title</div>
                  </div>
                </div>
              </div>
            </div>

            {/* RATINGS SECTION */}
            <div>
              <h2 className="text-xl font-black font-mono uppercase tracking-tight text-white mb-4">
                SAFETY & RATINGS
              </h2>
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 grid md:grid-cols-3 gap-6">
                <div>
                  <div className="text-xs font-mono uppercase text-gray-400 mb-2">Safety Rating</div>
                  <div className="flex items-center gap-1 text-amber-400 text-xl font-bold mb-1">
                    {"★".repeat(parseInt(crashStars) || 2)}
                    {"☆".repeat(Math.max(0, 5 - (parseInt(crashStars) || 2)))}
                  </div>
                  <p className="text-xs text-gray-400">Based on Crash Avoidance tests & safety specs</p>
                </div>

                <div className="border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-6">
                  <div className="text-xs font-mono uppercase text-gray-400 mb-2">Energy Economy</div>
                  <div className="text-lg font-mono font-bold text-white mb-1">2 Stars out of 6</div>
                  <p className="text-xs text-gray-400">Standard annual fuel economy estimate</p>
                </div>

                <div className="border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-6">
                  <div className="text-xs font-mono uppercase text-gray-400 mb-2">Carbon Emissions</div>
                  <div className="text-lg font-mono font-bold text-white mb-1">226 g/km</div>
                  <p className="text-xs text-gray-400">Estimated carbon footprint</p>
                </div>
              </div>
            </div>

            {/* FINANCE OPTIONS SECTION */}
            <div id="finance-calculator-section">
              <h2 className="text-xl font-black font-mono uppercase tracking-tight text-white mb-2">
                FINANCE OPTIONS
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                We offer quick, easy, and competitive vehicle finance tailored to your financial situation.
              </p>

              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="text-xs font-mono text-gray-400 uppercase">Estimated Repayment</div>
                    <div className="text-3xl font-black font-mono text-[#C2410C]">
                      ${estimatedWeekly} <span className="text-sm text-gray-400 font-sans font-normal">/ weekly</span>
                    </div>
                  </div>

                  <div className="bg-zinc-800/80 px-4 py-2 rounded-xl text-right">
                    <div className="text-[11px] text-gray-400 uppercase font-mono">Interest Rate</div>
                    <div className="text-sm font-mono font-bold text-white">{financeRates.annualInterestRate}% p.a.</div>
                  </div>
                </div>

                {/* Calculator Controls */}
                <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-800">
                  <div>
                    <label className="block text-xs font-mono text-gray-300 uppercase mb-2">
                      Cash Deposit: <span className="font-bold text-white">${deposit}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={Math.min(price, 1000)}
                      step="50"
                      value={deposit}
                      onChange={(e) => setDeposit(Number(e.target.value))}
                      className="w-full accent-[#C2410C] bg-zinc-800 rounded-lg cursor-pointer h-2"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-300 uppercase mb-2">
                      Loan Term: <span className="font-bold text-white">{loanTermMonths} Months</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[12, 24, 36, 48].map((term) => (
                        <button
                          key={term}
                          onClick={() => setLoanTermMonths(term)}
                          className={`py-1.5 text-xs font-mono font-bold rounded-lg border transition ${
                            loanTermMonths === term
                              ? "bg-[#C2410C] text-white border-[#C2410C]"
                              : "bg-zinc-800 text-gray-300 border-zinc-700 hover:bg-zinc-700"
                          }`}
                        >
                          {term}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs text-gray-400 font-mono">
                  <span>Total Loan Repayments: ~${totalRepayment.toLocaleString("en-NZ")}</span>
                  <Link href="/finance" className="text-[#C2410C] font-bold hover:underline">
                    Apply Now &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (35% STICKY SIDEBAR) */}
          <div className="space-y-6">
            {/* Sticky Pricing & CTA Card */}
            <div className="sticky top-28 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6">
              {/* Purchase Price / Repayments Header */}
              <div>
                <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-1">
                  {saleMethodDetails.code === "auction"
                    ? "Auction"
                    : saleMethodDetails.isPBN
                    ? "Sale Method"
                    : "Vehicle Price"}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-black font-mono text-white">
                    {saleMethodDetails.isPBN
                      ? "Price By Negotiation"
                      : saleMethodDetails.code === "enquiries_over"
                      ? saleMethodDetails.label
                      : `$${price.toLocaleString("en-NZ")}`}
                  </span>
                  {wasPrice && !saleMethodDetails.isPBN && (
                    <span className="text-sm font-mono text-gray-500 line-through">
                      ${wasPrice.toLocaleString("en-NZ")}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-emerald-400 font-mono">
                  <span>✓ On road costs: Included</span>
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setActiveModal("enquire")}
                  className="w-full py-4 bg-[#C2410C] text-white font-mono font-extrabold text-sm uppercase tracking-wider rounded-xl hover:bg-[#a33509] transition shadow-lg transform hover:-translate-y-0.5"
                >
                  ENQUIRE
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById("finance-calculator-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full py-3.5 bg-zinc-800 border border-zinc-700 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-zinc-700 transition"
                >
                  FINANCE CALCULATOR
                </button>
              </div>

              <hr className="border-zinc-800" />

              {/* Quick Action Button Stack */}
              <div className="space-y-2">
                <button
                  onClick={() => setActiveModal("question")}
                  className="w-full py-2.5 bg-zinc-950 border border-zinc-800 text-gray-300 font-mono text-xs uppercase font-bold rounded-lg hover:border-zinc-700 hover:text-white transition text-left px-4 flex items-center justify-between"
                >
                  <span>ASK A QUESTION</span>
                  <span>&rsaquo;</span>
                </button>

                <button
                  onClick={() => setActiveModal("testdrive")}
                  className="w-full py-2.5 bg-zinc-950 border border-zinc-800 text-gray-300 font-mono text-xs uppercase font-bold rounded-lg hover:border-zinc-700 hover:text-white transition text-left px-4 flex items-center justify-between"
                >
                  <span>BOOK A TEST DRIVE</span>
                  <span>&rsaquo;</span>
                </button>

                <Link
                  href="/price-my-trade"
                  className="w-full py-2.5 bg-zinc-950 border border-zinc-800 text-gray-300 font-mono text-xs uppercase font-bold rounded-lg hover:border-zinc-700 hover:text-white transition text-left px-4 flex items-center justify-between block"
                >
                  <span>TRADE IN ESTIMATE</span>
                  <span>&rsaquo;</span>
                </Link>

                <Link
                  href="/finance"
                  className="w-full py-2.5 bg-zinc-950 border border-zinc-800 text-gray-300 font-mono text-xs uppercase font-bold rounded-lg hover:border-zinc-700 hover:text-white transition text-left px-4 flex items-center justify-between block"
                >
                  <span>APPLY FOR FINANCE</span>
                  <span>&rsaquo;</span>
                </Link>
              </div>

              <hr className="border-zinc-800" />

              {/* Dealer Location & Contact Info Box */}
              <div className="space-y-4">
                <div className="text-xs font-mono uppercase text-gray-400 tracking-wider">
                  View This Vehicle At
                </div>

                <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 space-y-3">
                  <div className="font-mono font-bold text-white text-sm">
                    {locationStr}
                  </div>

                  <div className="text-xs text-gray-400 space-y-1">
                    <div><strong>Contact:</strong> {primaryContact.name}</div>
                    <div><strong>Ph:</strong> <a href={`tel:${primaryContact.phone}`} className="text-white hover:underline">{primaryContact.phone}</a></div>
                    <div><strong>Email:</strong> <a href={`mailto:${primaryContact.email}`} className="text-white hover:underline truncate block">{primaryContact.email}</a></div>
                  </div>

                  {/* Dealer Rating Badge */}
                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      ★★★★★ 4.91
                    </span>
                    <span className="text-gray-400 font-mono text-[10px]">2,875 reviews</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recently Viewed / Similar Listings */}
            {similarVehicles.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-sm font-mono font-black uppercase text-white mb-4">
                  SIMILAR VEHICLES
                </h3>

                <div className="space-y-4">
                  {similarVehicles.map((v) => (
                    <Link
                      key={v.id}
                      href={`/vehicles/${v.id}`}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-800/80 transition group"
                    >
                      <img
                        src={v.images[0]}
                        alt={v.title}
                        className="w-16 h-12 object-cover rounded-lg border border-zinc-800 flex-shrink-0"
                      />
                      <div className="truncate flex-1">
                        <div className="text-xs font-mono font-bold text-white truncate group-hover:text-[#C2410C]">
                          {v.title}
                        </div>
                        <div className="text-[11px] font-mono text-gray-400">
                          ${v.price.toLocaleString("en-NZ")}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LIGHTBOX GALLERY MODAL */}
      {showLightbox && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn">
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-6 right-6 text-white text-3xl font-mono hover:text-[#C2410C] transition z-50"
          >
            &times;
          </button>

          <div className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center">
            <img
              src={currentImage}
              alt="Gallery View"
              className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl border border-zinc-800"
            />

            {/* Lightbox Controls */}
            <div className="flex items-center justify-between w-full mt-4 max-w-xl">
              <button
                onClick={() =>
                  setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                }
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-lg hover:bg-zinc-800 text-xs font-mono uppercase"
              >
                &larr; Previous
              </button>

              <span className="text-xs font-mono text-gray-400">
                {activeImageIndex + 1} of {images.length}
              </span>

              <button
                onClick={() =>
                  setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                }
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-lg hover:bg-zinc-800 text-xs font-mono uppercase"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE ACTION MODALS (Enquire / Test Drive / Ask Question) */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-mono"
            >
              &times;
            </button>

            <h3 className="text-xl font-black font-mono uppercase text-white mb-1">
              {activeModal === "enquire" && "Enquire About Vehicle"}
              {activeModal === "testdrive" && "Book a Test Drive"}
              {activeModal === "question" && "Ask a Question"}
            </h3>
            <p className="text-xs text-gray-400 font-mono mb-4">
              Ref #{listing.id} - {listing.title} (${price.toLocaleString("en-NZ")})
            </p>

            {modalSubmitted ? (
              <div className="py-8 text-center text-emerald-400 font-mono text-sm space-y-2">
                <div className="text-3xl">✓</div>
                <div className="font-bold">Message Sent Successfully!</div>
                <div className="text-xs text-gray-400">The dealer will get back to you shortly.</div>
              </div>
            ) : (
              <form onSubmit={handleModalSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C2410C]"
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C2410C]"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Phone</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C2410C]"
                      placeholder="021 123 4567"
                    />
                  </div>
                </div>

                {activeModal === "testdrive" && (
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C2410C]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Message</label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C2410C]"
                    placeholder="Hi, I'm interested in this listing..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#C2410C] text-white font-mono font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#a33509] transition"
                >
                  Submit Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
