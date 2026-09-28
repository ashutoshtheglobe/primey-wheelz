"use client";

import React, { useState } from "react";
import { useWebsite } from "@/context/WebsiteContext";

export default function FinancePage() {
  const { site } = useWebsite();
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    isJointApplication: false,
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    maritalStatus: "",
    dependants: "0",
    licenseType: "",
    licenseNumber: "",
    versionNumber: "",
    expiryDate: "",
    phone: "",
    email: "",
    residencyStatus: "",
    // Partner
    partnerFirstName: "",
    partnerLastName: "",
    // Step 2
    livingSituation: "Renting",
    homeAddress: "",
    suburb: "",
    city: "",
    yearsAt: "2",
    employmentType: "",
    // Step 3
    primaryIncomeType: "",
    incomeAmount: "",
    payFrequency: "weekly",
    rentAmount: "",
    rentFrequency: "weekly",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setForm((prev) => ({ ...prev, [name]: target.checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-black text-white w-full pt-32 pb-20 font-sans min-h-screen">
      {/* Page Header */}
      <div className="max-w-5xl mx-auto px-4 text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black font-mono lowercase tracking-wide mb-6">
          finance options
        </h1>
        <p className="text-xl md:text-2xl font-light text-[#C2410C]">
          Need help financing? We&apos;ve got you covered.
        </p>
      </div>

      {/* Hero CTA view (if form not open and not submitted) */}
      {!showForm && !submitted && (
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="p-12 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md">
            <div className="text-6xl mb-8">💰</div>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              Contact us today to discuss our flexible finance options tailored to your needs. Our team is dedicated to helping you find the perfect payment plan.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href={site?.phone ? `tel:${site.phone}` : "#"}
                className="inline-block px-10 py-4 rounded text-black font-bold transition transform hover:scale-105 bg-[#C2410C] text-white"
              >
                Call {site?.phone || "Us"}
              </a>
              <button
                onClick={() => setShowForm(true)}
                className="inline-block px-10 py-4 rounded text-black font-bold transition transform hover:scale-105 bg-white hover:bg-gray-200"
              >
                Apply Online Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Screen */}
      {submitted && (
        <div className="max-w-2xl mx-auto px-4 animate-fadeIn">
          <div className="p-10 border border-green-500/50 rounded-2xl bg-green-500/10 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold mb-3 font-mono">Application Submitted!</h2>
            <p className="text-gray-300 text-base leading-relaxed mb-6">
              Your finance application has been successfully submitted to {site?.companyName || "Primey Wheelz"}. One of our finance specialists will review your details and contact you shortly.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setShowForm(false);
                setCurrentStep(1);
              }}
              className="px-8 py-3 bg-white text-black font-bold rounded hover:bg-gray-200 transition"
            >
              Back to Finance Overview
            </button>
          </div>
        </div>
      )}

      {/* 4-Step Form Wizard */}
      {showForm && !submitted && (
        <div className="max-w-5xl mx-auto px-4 animate-fadeIn">
          <div className="p-8 md:p-12 border border-white/10 rounded-2xl bg-zinc-900 backdrop-blur-xl relative shadow-2xl">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white text-3xl transition-colors"
            >
              &times;
            </button>

            <h2 className="text-3xl font-bold font-mono mb-12 text-center text-[#C2410C]">
              Finance Application
            </h2>

            {/* Step Indicators */}
            <div className="flex items-center justify-between max-w-xl mx-auto mb-12 relative">
              <div className="absolute w-full h-[2px] bg-white/10 top-5 z-0" />
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  onClick={() => setCurrentStep(step)}
                  className="flex flex-col items-center cursor-pointer relative z-10"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-all text-sm border-2 ${
                      currentStep >= step
                        ? "bg-[#C2410C] text-white border-transparent"
                        : "bg-gray-800 text-gray-400 border-white/10"
                    }`}
                  >
                    {step}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      currentStep === step ? "text-white font-bold" : "text-gray-400"
                    }`}
                  >
                    {step === 1 && "Applicant"}
                    {step === 2 && "Address/Work"}
                    {step === 3 && "Financials"}
                    {step === 4 && "Submit"}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              {/* STEP 1: APPLICANT */}
              {currentStep === 1 && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-3 mb-6 gap-4">
                    <h3 className="text-xl font-medium text-[#C2410C] font-mono">
                      Applicant Information
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-300">Joint Application?</span>
                      <input
                        type="checkbox"
                        name="isJointApplication"
                        checked={form.isJointApplication}
                        onChange={handleChange}
                        className="w-5 h-5 accent-[#C2410C] cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        name="dob"
                        required
                        value={form.dob}
                        onChange={handleChange}
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider block">
                        Marital Status *
                      </label>
                      <select
                        name="maritalStatus"
                        required
                        value={form.maritalStatus}
                        onChange={handleChange}
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition"
                      >
                        <option value="">Please select...</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="De facto">De facto</option>
                        <option value="Separated">Separated</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider block">
                        Drivers License Type *
                      </label>
                      <select
                        name="licenseType"
                        required
                        value={form.licenseType}
                        onChange={handleChange}
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition"
                      >
                        <option value="">Please select...</option>
                        <option value="Full">Full License</option>
                        <option value="Restricted">Restricted License</option>
                        <option value="Learner">Learner License</option>
                        <option value="Overseas">Overseas License</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider block">
                        Drivers License No. *
                      </label>
                      <input
                        type="text"
                        name="licenseNumber"
                        required
                        value={form.licenseNumber}
                        onChange={handleChange}
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider block">
                        Mobile Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={form.phone}
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
                        NZ Residency Status *
                      </label>
                      <select
                        name="residencyStatus"
                        required
                        value={form.residencyStatus}
                        onChange={handleChange}
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition"
                      >
                        <option value="">Please select...</option>
                        <option value="NZ Citizen">NZ Citizen</option>
                        <option value="Permanent Resident">Permanent Resident</option>
                        <option value="Work Visa">Work Visa</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-8 py-3 bg-[#C2410C] text-white font-bold rounded hover:bg-[#a33509] transition"
                    >
                      Next Step: Address & Work &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: ADDRESS & EMPLOYMENT */}
              {currentStep === 2 && (
                <div className="space-y-8 animate-fadeIn">
                  <h3 className="text-xl font-medium text-[#C2410C] font-mono border-b border-white/10 pb-3 mb-6">
                    Address & Employment Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="col-span-full">
                      <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider block">
                        Home Address *
                      </label>
                      <input
                        type="text"
                        name="homeAddress"
                        required
                        value={form.homeAddress}
                        onChange={handleChange}
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider block">
                        Suburb *
                      </label>
                      <input
                        type="text"
                        name="suburb"
                        required
                        value={form.suburb}
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
                        Living Situation *
                      </label>
                      <select
                        name="livingSituation"
                        value={form.livingSituation}
                        onChange={handleChange}
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition"
                      >
                        <option value="Own House">Own House</option>
                        <option value="Renting">Renting</option>
                        <option value="Boarding">Boarding</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider block">
                        Employment Type *
                      </label>
                      <select
                        name="employmentType"
                        required
                        value={form.employmentType}
                        onChange={handleChange}
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition"
                      >
                        <option value="">Please select...</option>
                        <option value="Full Time">Full Time</option>
                        <option value="Part Time">Part Time</option>
                        <option value="Self Employed">Self Employed</option>
                        <option value="Beneficiary">Beneficiary</option>
                        <option value="Retired">Retired</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between pt-6">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-3 bg-zinc-800 text-gray-300 font-bold rounded hover:bg-zinc-700 transition"
                    >
                      &larr; Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-8 py-3 bg-[#C2410C] text-white font-bold rounded hover:bg-[#a33509] transition"
                    >
                      Next Step: Financials &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: FINANCIALS */}
              {currentStep === 3 && (
                <div className="space-y-8 animate-fadeIn">
                  <h3 className="text-xl font-medium text-[#C2410C] font-mono border-b border-white/10 pb-3 mb-6">
                    Income & Outgoings
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider block">
                        Primary Income Source *
                      </label>
                      <select
                        name="primaryIncomeType"
                        required
                        value={form.primaryIncomeType}
                        onChange={handleChange}
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition"
                      >
                        <option value="">Please select...</option>
                        <option value="Wages / Salary">Wages / Salary</option>
                        <option value="Self Employed">Self Employed</option>
                        <option value="Benefits">Benefits</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider block">
                        Net Income Amount ($ in hand) *
                      </label>
                      <input
                        type="number"
                        name="incomeAmount"
                        placeholder="e.g. 950"
                        required
                        value={form.incomeAmount}
                        onChange={handleChange}
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider block">
                        Pay Frequency *
                      </label>
                      <select
                        name="payFrequency"
                        value={form.payFrequency}
                        onChange={handleChange}
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="fortnightly">Fortnightly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider block">
                        Rent / Mortgage Payment ($) *
                      </label>
                      <input
                        type="number"
                        name="rentAmount"
                        placeholder="e.g. 450"
                        required
                        value={form.rentAmount}
                        onChange={handleChange}
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider block">
                        Rent Frequency *
                      </label>
                      <select
                        name="rentFrequency"
                        value={form.rentFrequency}
                        onChange={handleChange}
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="fortnightly">Fortnightly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between pt-6">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-3 bg-zinc-800 text-gray-300 font-bold rounded hover:bg-zinc-700 transition"
                    >
                      &larr; Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="px-8 py-3 bg-[#C2410C] text-white font-bold rounded hover:bg-[#a33509] transition"
                    >
                      Next Step: Review & Apply &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: SUBMIT */}
              {currentStep === 4 && (
                <div className="space-y-8 animate-fadeIn">
                  <h3 className="text-xl font-medium text-[#C2410C] font-mono border-b border-white/10 pb-3 mb-6">
                    Application Summary
                  </h3>

                  <div className="bg-zinc-800/50 p-6 rounded-xl border border-white/10 space-y-3 text-sm text-gray-300">
                    <p><strong>Applicant:</strong> {form.firstName} {form.lastName} ({form.email}, {form.phone})</p>
                    <p><strong>NZ License:</strong> {form.licenseType} ({form.licenseNumber})</p>
                    <p><strong>Address:</strong> {form.homeAddress}, {form.suburb}, {form.city}</p>
                    <p><strong>Employment:</strong> {form.employmentType} ({form.primaryIncomeType} - ${form.incomeAmount}/{form.payFrequency})</p>
                  </div>

                  <div className="p-4 bg-zinc-900 rounded-lg border border-white/10 text-xs text-gray-400">
                    By submitting this application, you consent to {site?.companyName || "Primey Wheelz"} conducting credit checks and verifying your employment details in accordance with NZ Privacy Laws.
                  </div>

                  <div className="flex justify-between pt-6">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-3 bg-zinc-800 text-gray-300 font-bold rounded hover:bg-zinc-700 transition"
                    >
                      &larr; Back
                    </button>
                    <button
                      type="submit"
                      className="px-10 py-4 bg-[#C2410C] text-white font-bold rounded text-sm uppercase tracking-wider hover:bg-[#a33509] transition shadow-lg"
                    >
                      Submit Finance Application
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
