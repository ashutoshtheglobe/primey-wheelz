"use client";

import React, { useState } from "react";
import { useWebsite } from "@/context/WebsiteContext";

export default function ContactPage() {
  const { site } = useWebsite();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-zinc-950 text-white w-full pb-28 font-sans min-h-screen">
      {/* Mini Hero for Contact */}
      <section className="relative w-full h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={site?.aboutBanner || site?.heroBanner || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=80"}
            alt="Contact Us"
            className="w-full h-full object-cover opacity-25 scale-105 filter blur-xs"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-zinc-950/70 to-zinc-950" />
        </div>
        <div className="relative z-10 text-center px-4 pt-20">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest font-mono drop-shadow-lg text-white">
            Contact Us
          </h1>
          <div className="w-16 h-0.5 bg-[#C2410C] mx-auto mt-4" />
        </div>
      </section>

      {/* Main Layout Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-3xl font-extrabold uppercase tracking-wider font-mono text-white mb-2">
              Get In Touch
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              We would love to hear from you. Stop by our dealership, give us a call, or send us a message below.
            </p>

            <div className="grid gap-6">
              {/* Phone Card */}
              {site?.phone && (
                <div className="p-6 bg-zinc-900 border border-white/10 rounded-xl flex gap-5 hover:border-[#C2410C]/50 transition">
                  <div className="w-12 h-12 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-[#C2410C] flex-shrink-0">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M21.384 17.791c-1.422-1.396-3.21-1.396-4.632 0l-1.06 1.062c-3.14-1.603-5.042-3.506-6.645-6.646l1.062-1.06c1.423-1.423 1.423-3.21 0-4.633L8.604 5.01c-1.423-1.423-3.21-1.423-4.633 0L2.91 6.073c-1.848 1.848-1.574 4.887.493 7.842 2.067 2.955 4.811 5.764 7.842 7.842 2.955 2.067 5.994 2.341 7.842.493l1.062-1.06c1.423-1.423 1.423-3.21 0-4.633l-1.06-1.06c.001 0-.001 0 0 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none mb-1.5">
                      Phone
                    </h4>
                    <a
                      href={`tel:${site.phone}`}
                      className="text-white hover:text-[#C2410C] text-lg font-black tracking-wide transition"
                    >
                      {site.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Email Card */}
              {site?.email && (
                <div className="p-6 bg-zinc-900 border border-white/10 rounded-xl flex gap-5 hover:border-[#C2410C]/50 transition">
                  <div className="w-12 h-12 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-[#C2410C] flex-shrink-0">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none mb-1.5">
                      Email
                    </h4>
                    <a
                      href={`mailto:${site.email}`}
                      className="text-white hover:text-[#C2410C] text-base font-black tracking-wide transition break-all"
                    >
                      {site.email}
                    </a>
                  </div>
                </div>
              )}

              {/* Address Card */}
              {site?.address && (
                <div className="p-6 bg-zinc-900 border border-white/10 rounded-xl flex gap-5 hover:border-[#C2410C]/50 transition">
                  <div className="w-12 h-12 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-[#C2410C] flex-shrink-0">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none mb-1.5">
                      Address
                    </h4>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        site.address
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-[#C2410C] text-sm font-bold leading-relaxed transition"
                    >
                      {site.address}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Send Message Form */}
          <div className="lg:col-span-7 bg-zinc-900 border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl relative">
            {submitted ? (
              <div className="p-12 border border-green-500/20 rounded-2xl bg-green-500/10 text-center backdrop-blur-xl animate-fadeIn">
                <div className="text-6xl mb-6">✉️✨</div>
                <h3 className="text-2xl font-extrabold uppercase tracking-wider font-mono text-white mb-4">
                  Message Sent!
                </h3>
                <p className="text-gray-300 mb-8 max-w-md mx-auto leading-relaxed text-sm">
                  Thank you for contacting us. Your message has been sent successfully. Our team will get back to you shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
                  }}
                  className="px-8 py-3.5 bg-[#C2410C] font-bold text-white uppercase tracking-wider rounded font-mono text-xs hover:bg-[#a33509] transition"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-extrabold uppercase tracking-wider font-mono text-white mb-2">
                  Send Us A Message
                </h3>
                <div className="w-10 h-0.5 bg-[#C2410C] mb-8" />

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 block">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C2410C] transition text-sm"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 block">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C2410C] transition text-sm"
                        placeholder="e.g. john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 block">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C2410C] transition text-sm"
                        placeholder="e.g. 021 123 456"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 block">
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C2410C] transition text-sm"
                        placeholder="e.g. Inquiry about vehicle"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 block">
                      Your Message *
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C2410C] transition resize-none text-sm"
                      placeholder="Write your message here..."
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-10 py-4 bg-[#C2410C] text-white font-bold font-mono text-xs uppercase tracking-wider rounded hover:bg-[#a33509] transition shadow-lg"
                    >
                      Submit Message
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
