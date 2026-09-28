"use client";

import React from "react";
import Link from "next/link";
import { useWebsite } from "@/context/WebsiteContext";

export default function Footer() {
  const { site } = useWebsite();
  const currentYear = new Date().getFullYear();

  const phone = site?.phone || "";
  const email = site?.email || "";
  const address = site?.address || "";
  const facebookLink = site?.facebookLink || "";
  const instagramLink = site?.instagramLink || "";
  const youtubeLink = site?.youtubeLink || "";
  const companyName = (site?.companyName || "").toUpperCase();
  const poweredBy = (site?.poweredBy || "").toUpperCase();
  const logo = site?.logo;

  const openingHours = site?.openingHours || [];

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-black text-white pt-20 pb-10 border-t border-zinc-900 relative overflow-hidden font-sans">
      {/* Skewed right background graphic matching reference layout */}
      <div className="absolute right-0 top-0 bottom-0 w-[40%] bg-zinc-900/40 transform -skew-x-12 origin-top-right translate-x-24 hidden lg:block border-l border-zinc-800/60 z-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 relative z-10">
        {/* Column 1: CONTACT US */}
        <div className="flex flex-col items-start space-y-6">
          <div>
            {logo && (
              <img
                src={logo}
                alt={companyName || "Logo"}
                className="h-10 w-auto mb-4 object-contain"
              />
            )}
            <h3 className="text-xl font-black uppercase tracking-wider font-mono text-white leading-none">
              CONTACT US
            </h3>
            <div className="w-12 h-0.5 bg-[#C2410C] mt-3" />
          </div>

          <div className="space-y-5 text-sm text-gray-400 w-full">
            {/* Phone */}
            {phone && (
              <div className="flex items-start gap-4 group">
                <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 group-hover:border-[#C2410C] transition">
                  <svg
                    className="w-4 h-4 text-[#C2410C] fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21.384 17.791c-1.422-1.396-3.21-1.396-4.632 0l-1.06 1.062c-3.14-1.603-5.042-3.506-6.645-6.646l1.062-1.06c1.423-1.423 1.423-3.21 0-4.633L8.604 5.01c-1.423-1.423-3.21-1.423-4.633 0L2.91 6.073c-1.848 1.848-1.574 4.887.493 7.842 2.067 2.955 4.811 5.764 7.842 7.842 2.955 2.067 5.994 2.341 7.842.493l1.062-1.06c1.423-1.423 1.423-3.21 0-4.633l-1.06-1.06c.001 0-.001 0 0 0z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider mb-1">
                    PHONE
                  </span>
                  <a
                    href={`tel:${phone}`}
                    className="text-white hover:text-[#C2410C] transition font-mono font-bold text-base"
                  >
                    {phone}
                  </a>
                </div>
              </div>
            )}

            {/* Email */}
            {email && (
              <div className="flex items-start gap-4 group">
                <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 group-hover:border-[#C2410C] transition">
                  <svg
                    className="w-4 h-4 text-[#C2410C] fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider mb-1">
                    EMAIL
                  </span>
                  <a
                    href={`mailto:${email}`}
                    className="text-white hover:text-[#C2410C] transition font-mono font-bold text-sm break-all"
                  >
                    {email}
                  </a>
                </div>
              </div>
            )}

            {/* Facebook Link */}
            {facebookLink && (
              <div className="flex items-center gap-4 group pt-1">
                <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 group-hover:border-[#C2410C] transition">
                  <svg
                    className="w-4 h-4 text-[#C2410C] fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <a
                  href={facebookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#C2410C] transition font-mono font-bold text-sm"
                >
                  Visit our Facebook
                </a>
              </div>
            )}

            {/* Instagram Link */}
            {instagramLink && (
              <div className="flex items-center gap-4 group">
                <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 group-hover:border-[#C2410C] transition">
                  <svg
                    className="w-4 h-4 text-[#C2410C] fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </div>
                <a
                  href={instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#C2410C] transition font-mono font-bold text-sm"
                >
                  Visit our Instagram
                </a>
              </div>
            )}

            {/* YouTube Link */}
            {youtubeLink && (
              <div className="flex items-center gap-4 group">
                <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 group-hover:border-[#C2410C] transition">
                  <svg
                    className="w-4 h-4 text-[#C2410C] fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
                <a
                  href={youtubeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#C2410C] transition font-mono font-bold text-sm"
                >
                  Visit our YouTube
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: WHERE TO FIND US */}
        <div className="flex flex-col items-start space-y-6">
          <div>
            <h3 className="text-xl font-black uppercase tracking-wider font-mono text-white leading-none">
              WHERE TO FIND US
            </h3>
            <div className="w-12 h-0.5 bg-[#C2410C] mt-3" />
          </div>

          <div className="space-y-5 text-sm text-gray-400 w-full">
            {/* Address */}
            {address && (
              <div className="flex items-start gap-4 group">
                <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 group-hover:border-[#C2410C] transition mt-0.5">
                  <svg
                    className="w-4 h-4 text-[#C2410C] fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider mb-1">
                    ADDRESS
                  </span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      address
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-[#C2410C] transition font-mono font-bold text-sm capitalize leading-relaxed"
                  >
                    {address}
                  </a>
                </div>
              </div>
            )}

            {/* Opening Hours */}
            {openingHours.length > 0 && (
              <div className="flex items-start gap-4 group">
                <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 group-hover:border-[#C2410C] transition mt-0.5">
                  <svg
                    className="w-4 h-4 text-[#C2410C] fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider mb-1">
                    OPENING HOURS
                  </span>
                  {openingHours.map((hourLine, idx) => (
                    <p key={idx} className="text-white font-mono text-sm leading-relaxed">
                      {hourLine}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Interactive Google Map Widget */}
        {address && (
          <div className="flex flex-col items-start w-full space-y-4">
            <div className="relative w-full h-[230px] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-950 group">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  address
                )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
              />

              {/* Open in Maps Overlay Tag */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  address
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-3 left-3 bg-zinc-950/90 hover:bg-black text-white text-[11px] font-mono font-bold px-3 py-1.5 rounded-lg border border-zinc-700 shadow-xl backdrop-blur-md transition flex items-center gap-1.5"
              >
                <span>Open in Maps</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar: Copyright and Nav Links */}
      <div className="max-w-7xl mx-auto px-6 pt-10 mt-16 border-t border-zinc-900 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-gray-400 font-mono">
        <p className="text-gray-400 text-xs tracking-wider">
          &copy; {currentYear} {companyName || "PRIMEY WHEELZ"} LIMITED | POWERED BY {poweredBy || "PRIMEY WHEELZ"}
        </p>

        {/* Footer Nav Links */}
        <div className="flex flex-wrap items-center gap-6 text-xs font-mono uppercase tracking-wider text-gray-400">
          <Link href="/" className="hover:text-[#C2410C] transition">
            Home
          </Link>
          <Link href="/vehicles" className="hover:text-[#C2410C] transition">
            Vehicles
          </Link>
          <Link href="/finance" className="hover:text-[#C2410C] transition">
            Finance
          </Link>
          <Link href="/price-my-trade" className="hover:text-[#C2410C] transition">
            Price My Trade
          </Link>
          <Link href="/about" className="hover:text-[#C2410C] transition">
            About Us
          </Link>
          <Link href="/contact" className="hover:text-[#C2410C] transition">
            Contact
          </Link>

          {/* Quick Back to Top button */}
          <button
            onClick={scrollToTop}
            className="ml-2 p-2 bg-zinc-900 hover:bg-[#C2410C] text-white rounded-lg border border-zinc-800 transition"
            title="Scroll to top"
          >
            ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
