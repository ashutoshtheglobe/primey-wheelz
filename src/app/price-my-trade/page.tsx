"use client";

import React, { useState } from "react";
import { useWebsite } from "@/context/WebsiteContext";
import {
  submitTradeInApplication,
  uploadMediaFile,
  UploadedMediaItem,
} from "@/services/backendApi";

interface SelectedPhoto {
  file: File;
  previewUrl: string;
}

export default function PriceMyTradePage() {
  const { site } = useWebsite();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    daytimePhone: "",
    mobilePhone: "",
    address: "",
    suburb: "",
    city: "",
    postcode: "",
    year: "",
    make: "",
    model: "",
    variant: "",
    odometer: "",
    transmission: "Automatic",
    engineSize: "",
    colour: "",
    plateNo: "",
    comments: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const fileList = Array.from(e.target.files);

    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedPhotos((prev) =>
            [
              ...prev,
              { file, previewUrl: event.target!.result as string },
            ].slice(0, 5)
          );
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setUploadProgressMsg(null);

    const fullName = `${form.firstName} ${form.lastName}`.trim();

    // 1. Upload photos to backend S3 /upload-guest if any are attached
    const uploadedMedia: UploadedMediaItem[] = [];
    if (selectedPhotos.length > 0) {
      setUploadProgressMsg(`Uploading ${selectedPhotos.length} vehicle photo(s)...`);
      for (let i = 0; i < selectedPhotos.length; i++) {
        const uploaded = await uploadMediaFile(
          selectedPhotos[i].file,
          `photo[${i}]`,
          "trade-in"
        );
        if (uploaded) {
          uploadedMedia.push(uploaded);
        }
      }
    }

    setUploadProgressMsg("Submitting Trade-In Enquiry...");

    const formattedMessage = `
TRADE-IN VEHICLE SPECIFICATIONS:
Vehicle: ${form.year} ${form.make} ${form.model} ${form.variant ? `(${form.variant})` : ""}
Odometer: ${form.odometer} km
Transmission: ${form.transmission}
Plate / Rego: ${form.plateNo || "N/A"}
Color: ${form.colour || "N/A"}

CUSTOMER INFORMATION:
Name: ${fullName}
Email: ${form.email}
Phone: ${form.mobilePhone}
City / Suburb: ${form.city} ${form.suburb ? `(${form.suburb})` : ""}

COMMENTS:
${form.comments || "None"}
`.trim();

    const tradeTitle = `${form.year} ${form.make} ${form.model}`.trim() || "Trade-In Vehicle";

    // 2. Submit CreateTradeInEnquiry GraphQL mutation & notification
    const recipientEmails = site?.email ? [site.email] : [form.email];

    const result = await submitTradeInApplication({
      dealerId: site?.userId || 251,
      numberPlate: form.plateNo || "",
      odometer: form.odometer || "",
      condition: "Good",
      name: fullName,
      phone: form.mobilePhone,
      email: form.email,
      message: formattedMessage,
      listingTitle: tradeTitle,
      photoUrls: uploadedMedia,
      toEmails: recipientEmails,
    });

    setIsSubmitting(false);
    setUploadProgressMsg(null);

    if (result.success) {
      setSubmitted(true);
    } else {
      setErrorMessage(result.message || "Failed to submit trade-in valuation. Please try again.");
    }
  };

  return (
    <div className="bg-black text-white w-full pt-32 pb-20 font-sans min-h-screen">
      {/* Page Header */}
      <div className="max-w-5xl mx-auto px-4 text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black font-mono lowercase tracking-wide mb-6">
          price my trade
        </h1>
        <p className="text-xl md:text-2xl font-light text-[#C2410C]">
          Get a professional valuation for your trade-in vehicle.
        </p>
      </div>

      {/* Success Screen */}
      {submitted ? (
        <div className="max-w-2xl mx-auto px-4 animate-fadeIn">
          <div className="p-12 border border-emerald-500/30 rounded-2xl bg-emerald-500/10 text-center backdrop-blur-xl">
            <div className="text-6xl mb-6">🚗✨</div>
            <h2 className="text-3xl font-bold mb-4 font-mono text-emerald-400">Trade-In Submitted!</h2>
            <p className="text-gray-300 mb-8 leading-relaxed">
              Thank you for submitting your trade-in request to {site?.companyName || "Primey Wheelz"}. Our valuation team will review your vehicle details and photo uploads to provide you with a competitive offer.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setSelectedPhotos([]);
              }}
              className="px-8 py-3 rounded-lg font-semibold transition bg-white text-black hover:bg-gray-200 font-mono text-sm uppercase"
            >
              Submit Another Trade-In
            </button>
          </div>
        </div>
      ) : (
        /* Main Form */
        <div className="max-w-5xl mx-auto px-4">
          <div className="p-8 md:p-12 border border-white/10 rounded-2xl bg-zinc-900 shadow-2xl relative">
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-950/80 border border-red-500/50 text-red-300 rounded-xl text-sm font-mono text-center">
                {errorMessage}
              </div>
            )}

            {uploadProgressMsg && (
              <div className="mb-6 p-4 bg-[#C2410C]/20 border border-[#C2410C]/50 text-[#C2410C] rounded-xl text-sm font-mono text-center animate-pulse">
                {uploadProgressMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* SECTION 1: YOUR DETAILS */}
              <div className="mb-12">
                <h3 className="text-xl font-bold border-b border-white/10 pb-3 mb-6 text-[#C2410C] font-mono">
                  Your Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider block">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={form.firstName}
                      onChange={handleChange}
                      className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider block">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={form.lastName}
                      onChange={handleChange}
                      className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider block">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider block">
                      Best Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="mobilePhone"
                      required
                      value={form.mobilePhone}
                      onChange={handleChange}
                      className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider block">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={form.city}
                      onChange={handleChange}
                      className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider block">
                      Suburb
                    </label>
                    <input
                      type="text"
                      name="suburb"
                      value={form.suburb}
                      onChange={handleChange}
                      className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: TRADE-IN VEHICLE DETAILS */}
              <div className="mb-12">
                <h3 className="text-xl font-bold border-b border-white/10 pb-3 mb-6 text-[#C2410C] font-mono">
                  Trade-In Vehicle Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider block">
                      Year *
                    </label>
                    <input
                      type="number"
                      name="year"
                      placeholder="e.g. 2018"
                      required
                      value={form.year}
                      onChange={handleChange}
                      className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider block">
                      Make *
                    </label>
                    <input
                      type="text"
                      name="make"
                      placeholder="e.g. Toyota"
                      required
                      value={form.make}
                      onChange={handleChange}
                      className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider block">
                      Model *
                    </label>
                    <input
                      type="text"
                      name="model"
                      placeholder="e.g. RAV4"
                      required
                      value={form.model}
                      onChange={handleChange}
                      className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider block">
                      Odometer (km) *
                    </label>
                    <input
                      type="number"
                      name="odometer"
                      placeholder="e.g. 65000"
                      required
                      value={form.odometer}
                      onChange={handleChange}
                      className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider block">
                      Transmission *
                    </label>
                    <select
                      name="transmission"
                      value={form.transmission}
                      onChange={handleChange}
                      className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition"
                    >
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider block">
                      Registration / Plate No.
                    </label>
                    <input
                      type="text"
                      name="plateNo"
                      placeholder="e.g. ABC123"
                      value={form.plateNo}
                      onChange={handleChange}
                      className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: VEHICLE PHOTOS */}
              <div className="mb-12">
                <h3 className="text-xl font-bold border-b border-white/10 pb-3 mb-4 text-[#C2410C] font-mono">
                  Trade-In Vehicle Photos
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  Upload up to 5 photos of your vehicle for a more accurate valuation.
                </p>

                <div className="flex flex-wrap gap-4 items-center mb-4">
                  <label className="cursor-pointer inline-flex items-center justify-center px-6 py-3 rounded-lg text-white font-bold transition transform hover:scale-105 bg-[#C2410C] text-sm font-mono uppercase">
                    <span>Add Images...</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                  <span className="text-sm text-gray-400 font-mono">
                    Uploaded: {selectedPhotos.length} / 5
                  </span>
                </div>

                {selectedPhotos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6">
                    {selectedPhotos.map((photo, idx) => (
                      <div
                        key={idx}
                        className="relative group aspect-square rounded-xl overflow-hidden border border-white/10 bg-neutral-900"
                      >
                        <img src={photo.previewUrl} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-2 right-2 bg-black/80 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center transition text-sm"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 4: COMMENTS */}
              <div className="mb-12">
                <h3 className="text-xl font-bold border-b border-white/10 pb-3 mb-6 text-[#C2410C] font-mono">
                  Additional Comments
                </h3>
                <textarea
                  name="comments"
                  rows={4}
                  value={form.comments}
                  onChange={handleChange}
                  placeholder="Tell us about the vehicle condition, service history, optional extras, or any damage..."
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-white transition placeholder-gray-600 text-sm"
                />
              </div>

              {/* SUBMIT BUTTON */}
              <div className="flex justify-end border-t border-white/10 pt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-block px-12 py-4 rounded-lg text-white font-bold transition transform hover:scale-105 bg-[#C2410C] font-mono uppercase tracking-wider text-sm shadow-xl disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting Request..." : "Submit Trade-In Valuation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
