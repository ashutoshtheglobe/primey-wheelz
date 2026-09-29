"use client";

import React from "react";
import Link from "next/link";
import { useWebsite } from "@/context/WebsiteContext";

export default function AboutPage() {
  const { site } = useWebsite();

  const aboutParagraphs = site?.about
    ? site.about.split("\n").filter((p) => p.trim().length > 0)
    : [];

  return (
    <div className="bg-zinc-950 text-white w-full pb-28 font-sans min-h-screen">
      {/* Mini Hero Banner */}
      <section
        className="relative w-full h-[45vh] min-h-[350px] flex items-center justify-center overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: site?.aboutBanner
            ? `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(9,9,11,0.9)), url('${site.aboutBanner}')`
            : "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(9,9,11,0.9)), url('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="relative z-10 text-center px-4 pt-20">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest font-mono drop-shadow-lg text-white">
            About Us
          </h1>
          <div className="w-16 h-0.5 bg-[#C2410C] mx-auto mt-4" />
        </div>
      </section>

      {/* Main Section: Bio & Stats Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          {/* Left Column: Biography */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-3xl font-extrabold uppercase tracking-wider font-mono text-white mb-2">
              Our Story
            </h2>
            <div className="w-10 h-0.5 bg-[#C2410C] mb-8" />

            <div className="text-gray-300 leading-relaxed space-y-6 text-base whitespace-pre-line">
              {aboutParagraphs.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Right Column: Stats Grid & Badges */}
          <div className="lg:col-span-5 bg-zinc-900 border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-32 h-32 bg-[#C2410C]/10 rounded-full blur-2xl" />

            <h3 className="text-xl font-bold uppercase tracking-wider font-mono text-white mb-6">
              Why Choose Us
            </h3>

            <div className="space-y-6">
              {/* Stat 1 */}
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-zinc-800/60 transition duration-300">
                <div className="w-12 h-12 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-[#C2410C] flex-shrink-0 mt-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Quality Assured</h4>
                  <p className="text-gray-400 text-sm mt-1">
                    Every vehicle undergoes rigorous safety and mechanical checks before sale.
                  </p>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-zinc-800/60 transition duration-300">
                <div className="w-12 h-12 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-[#C2410C] flex-shrink-0 mt-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Style & Performance</h4>
                  <p className="text-gray-400 text-sm mt-1">
                    Customized options to match your individual style, preference, and lifestyle.
                  </p>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-zinc-800/60 transition duration-300">
                <div className="w-12 h-12 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-[#C2410C] flex-shrink-0 mt-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Flexible Finance</h4>
                  <p className="text-gray-400 text-sm mt-1">
                    Tailored finance solutions designed to fit your monthly budget comfortably.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="border-t border-white/5 bg-zinc-900/50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold uppercase tracking-wider font-mono text-white">
              Our Foundations
            </h2>
            <div className="w-10 h-0.5 bg-[#C2410C] mx-auto mt-3 mb-4" />
            <p className="text-gray-400">
              At {site?.companyName || "Primey Wheelz"}, integrity and customer satisfaction are at the heart of everything we do.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Box 1 */}
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 shadow-lg hover:border-[#C2410C]/60 transition duration-300">
              <h3 className="text-xl font-bold uppercase tracking-wider font-mono text-white mb-4 flex items-center gap-3">
                <span className="w-3 h-3 bg-[#C2410C] rounded-sm transform rotate-45" />
                Our Mission
              </h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                To provide top quality, reliable vehicles at fair prices, ensuring transparency and absolute customer satisfaction in every transaction. We aim to foster trust through integrity.
              </p>
            </div>

            {/* Box 2 */}
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 shadow-lg hover:border-[#C2410C]/60 transition duration-300">
              <h3 className="text-xl font-bold uppercase tracking-wider font-mono text-white mb-4 flex items-center gap-3">
                <span className="w-3 h-3 bg-[#C2410C] rounded-sm transform rotate-45" />
                Our Values
              </h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                We uphold honesty and absolute transparency as core values. We are dedicated to providing exceptional customer service, fostering lifelong relationships, and delivering reliable vehicles.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
