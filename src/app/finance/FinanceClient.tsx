"use client";

import React, { useState } from "react";
import { useWebsite } from "@/context/WebsiteContext";
import {
  submitWebsiteFinanceApplication,
  uploadMediaFile,
  UploadedMediaItem,
} from "@/services/backendApi";
import CustomDatePicker from "@/components/CustomDatePicker";

interface SupportingFile {
  file: File;
  preview: string | null;
  name: string;
}

export default function FinanceClient() {
  const { site } = useWebsite();

  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const [errors, setErrors] = useState<Record<string, string | boolean>>({});
  const [activeDatePicker, setActiveDatePicker] = useState<"dob" | "partnerDob" | "expiryDate" | null>(null);
  const [supportingFiles, setSupportingFiles] = useState<SupportingFile[]>([]);

  const secondaryColor = site?.secondaryColor || "#FFB300";

  const [form, setForm] = useState({
    // Step 1: Applicant
    isJointApplication: false,
    residencyStatus: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "", // mobile phone
    homePhone: "",
    workPhone: "",
    dob: "",
    maritalStatus: "",
    dependants: "",
    licenseType: "",
    licenseNumber: "",
    versionNumber: "",
    expiryDate: "",

    // Partner
    partner: {
      firstName: "",
      middleName: "",
      lastName: "",
      dob: "",
      homePhone: "",
      mobilePhone: "",
      maritalStatus: "",
      dependants: "",
      licenseType: "",
      licenseNumber: "",
      versionNumber: "",
    },

    // Step 2: Address & Employment
    addressDetails: {
      livingSituation: "", // Own House, Renting, Boarding, Other
      homeAddress: "",
      suburb: "",
      city: "",
      yearsAt: "",
      monthsAt: "",
    },
    employmentDetails: {
      employmentType: "",
    },

    // Step 3: Financials
    financials: {
      applicant1: {
        primaryIncomeType: "",
        amount: "",
        payFrequency: "",
        otherIncome1: "",
        otherIncomeSource1: "",
        otherIncome2: "",
        otherIncomeSource2: "",
      },
      expenses: {
        rentAmount: "",
        rentFrequency: "",
      },
      loanRepayments: [
        { type: "", amount: "", frequency: "", owedTo: "" },
        { type: "", amount: "", frequency: "", owedTo: "" },
        { type: "", amount: "", frequency: "", owedTo: "" },
      ],
      assets: [
        { description: "" },
        { description: "" },
      ],
    },

    // Step 4: Apply
    nextOfKin: {
      name: "",
      relationship: "",
      phone: "",
      creditRating: "",
    },
  });

  const showToast = (text: string, type: "error" | "success" = "error") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const resetForm = () => {
    setForm({
      isJointApplication: false,
      residencyStatus: "",
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phone: "",
      homePhone: "",
      workPhone: "",
      dob: "",
      maritalStatus: "",
      dependants: "",
      licenseType: "",
      licenseNumber: "",
      versionNumber: "",
      expiryDate: "",
      partner: {
        firstName: "",
        middleName: "",
        lastName: "",
        dob: "",
        homePhone: "",
        mobilePhone: "",
        maritalStatus: "",
        dependants: "",
        licenseType: "",
        licenseNumber: "",
        versionNumber: "",
      },
      addressDetails: {
        livingSituation: "",
        homeAddress: "",
        suburb: "",
        city: "",
        yearsAt: "",
        monthsAt: "",
      },
      employmentDetails: {
        employmentType: "",
      },
      financials: {
        applicant1: {
          primaryIncomeType: "",
          amount: "",
          payFrequency: "",
          otherIncome1: "",
          otherIncomeSource1: "",
          otherIncome2: "",
          otherIncomeSource2: "",
        },
        expenses: {
          rentAmount: "",
          rentFrequency: "",
        },
        loanRepayments: [
          { type: "", amount: "", frequency: "", owedTo: "" },
          { type: "", amount: "", frequency: "", owedTo: "" },
          { type: "", amount: "", frequency: "", owedTo: "" },
        ],
        assets: [
          { description: "" },
          { description: "" },
        ],
      },
      nextOfKin: {
        name: "",
        relationship: "",
        phone: "",
        creditRating: "",
      },
    });
    setSupportingFiles([]);
    setErrors({});
  };

  const openForm = () => {
    setShowForm(true);
    setCurrentStep(1);
    setSuccessMessage(false);
    setErrors({});
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  // Date validators matching theglobe-frontend
  const isValidDob = (dateStr: string): { valid: boolean; error?: string } => {
    if (!dateStr) return { valid: false, error: "Date of Birth is required" };
    const regex = /^\d{2}[\/-]\d{2}[\/-]\d{4}$/;
    if (!regex.test(dateStr)) {
      return { valid: false, error: "Format must be DD/MM/YYYY (e.g. 20/05/1998)" };
    }
    const [dayStr, monthStr, yearStr] = dateStr.split(/[\/-]/);
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);

    if (month < 1 || month > 12) {
      return { valid: false, error: "Invalid month (must be 01-12)" };
    }

    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear) {
      return { valid: false, error: `Year must be between 1900 and ${currentYear}` };
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) {
      return { valid: false, error: `Invalid day for month (max ${daysInMonth} days)` };
    }

    const dateObj = new Date(year, month - 1, day);
    if (dateObj > new Date()) {
      return { valid: false, error: "Date of birth cannot be in the future" };
    }

    return { valid: true };
  };

  const isValidExpiryDate = (dateStr: string): { valid: boolean; error?: string } => {
    if (!dateStr) return { valid: false, error: "Expiry Date is required" };
    const regex = /^\d{2}[\/-]\d{2}[\/-]\d{4}$/;
    if (!regex.test(dateStr)) {
      return { valid: false, error: "Format must be DD/MM/YYYY (e.g. 20/05/2030)" };
    }
    const [dayStr, monthStr, yearStr] = dateStr.split(/[\/-]/);
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);

    if (month < 1 || month > 12) {
      return { valid: false, error: "Invalid month (must be 01-12)" };
    }

    if (year < 2000 || year > 2100) {
      return { valid: false, error: "Please enter a valid expiry year" };
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) {
      return { valid: false, error: `Invalid day for month (max ${daysInMonth} days)` };
    }

    return { valid: true };
  };

  const validateStep = (step: number): boolean => {
    const errs: Record<string, string | boolean> = {};
    const f = form;

    if (step === 1) {
      if (!f.firstName) errs.firstName = true;
      if (!f.lastName) errs.lastName = true;

      if (!f.dob) {
        errs.dob = "Date of Birth is required";
      } else {
        const dobRes = isValidDob(f.dob);
        if (!dobRes.valid) errs.dob = dobRes.error!;
      }

      if (!f.maritalStatus) errs.maritalStatus = true;
      if (!f.dependants) errs.dependants = true;
      if (!f.licenseType) errs.licenseType = true;
      if (!f.licenseNumber) errs.licenseNumber = true;

      if (f.expiryDate) {
        const expRes = isValidExpiryDate(f.expiryDate);
        if (!expRes.valid) errs.expiryDate = expRes.error!;
      }

      if (!f.phone) errs.phone = true;
      if (!f.email) errs.email = true;
      if (!f.residencyStatus) errs.residencyStatus = true;

      if (f.isJointApplication) {
        const p = f.partner;
        if (!p.firstName) errs.partnerFirstName = true;
        if (!p.lastName) errs.partnerLastName = true;
        if (p.dob) {
          const partnerDobRes = isValidDob(p.dob);
          if (!partnerDobRes.valid) errs.partnerDob = partnerDobRes.error!;
        }
      }

      setErrors(errs);
      return Object.keys(errs).length === 0;
    }

    if (step === 2) {
      const a = f.addressDetails;
      if (!a.homeAddress) errs.homeAddress = true;
      if (!a.suburb) errs.suburb = true;
      if (!a.city) errs.city = true;
      if (!a.yearsAt) errs.yearsAt = true;
      if (!f.employmentDetails.employmentType) errs.employmentType = true;

      setErrors(errs);
      return Object.keys(errs).length === 0;
    }

    if (step === 3) {
      const inc = f.financials.applicant1;
      if (!inc.primaryIncomeType) errs.primaryIncomeType = true;
      if (!inc.amount) errs.amount = true;

      const exp = f.financials.expenses;
      if (!exp.rentAmount) errs.rentAmount = true;
      if (!exp.rentFrequency) errs.rentFrequency = true;

      setErrors(errs);
      return Object.keys(errs).length === 0;
    }

    return true;
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      showToast("Please fill all required fields before proceeding.", "error");
      return;
    }
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const setStep = (step: number) => {
    for (let i = 1; i < step; i++) {
      if (!validateStep(i)) {
        showToast(`Please complete Step ${i} first.`, "error");
        return;
      }
    }
    setCurrentStep(step);
  };

  const onDateInput = (field: "dob" | "partnerDob" | "expiryDate", rawValue: string) => {
    const digits = rawValue.replace(/\D/g, "").slice(0, 8);
    let value = digits;
    if (digits.length > 4) {
      value = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    } else if (digits.length > 2) {
      value = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }

    if (field === "dob") {
      setForm((prev) => ({ ...prev, dob: value }));
    } else if (field === "partnerDob") {
      setForm((prev) => ({
        ...prev,
        partner: { ...prev.partner, dob: value },
      }));
    } else if (field === "expiryDate") {
      setForm((prev) => ({ ...prev, expiryDate: value }));
    }
  };

  const handleCustomDateSelect = (field: "dob" | "partnerDob" | "expiryDate", dateStr: string) => {
    if (field === "dob") {
      setForm((prev) => ({ ...prev, dob: dateStr }));
    } else if (field === "partnerDob") {
      setForm((prev) => ({
        ...prev,
        partner: { ...prev.partner, dob: dateStr },
      }));
    } else if (field === "expiryDate") {
      setForm((prev) => ({ ...prev, expiryDate: dateStr }));
    }
    setActiveDatePicker(null);
  };

  const onFilesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (supportingFiles.length + files.length > 3) {
      showToast("You can only upload up to 3 supporting documents.", "error");
      return;
    }

    const newFiles: SupportingFile[] = [];
    const filesArray = Array.from(files);

    filesArray.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          setSupportingFiles((prev) => [
            ...prev,
            { file, preview: e.target?.result as string, name: file.name },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        newFiles.push({ file, preview: null, name: file.name });
      }
    });

    if (newFiles.length > 0) {
      setSupportingFiles((prev) => [...prev, ...newFiles]);
    }
    event.target.value = "";
  };

  const removeFile = (index: number) => {
    setSupportingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!form.nextOfKin.creditRating) {
      setErrors((prev) => ({ ...prev, creditRating: true }));
      showToast("Please provide your credit rating.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedDocuments: any[] = [];

      for (let i = 0; i < supportingFiles.length; i++) {
        const fileObj = supportingFiles[i];
        if (fileObj.file && fileObj.file.size) {
          const uploaded = await uploadMediaFile(
            fileObj.file,
            `supportingDocument_${i + 1}`,
            "finance-details"
          );
          if (uploaded) {
            uploadedDocuments.push({
              fieldName: `supportingDocument_${i + 1}`,
              fileName: uploaded.fileName || fileObj.name,
              filePath: uploaded.filePath,
              fileSize: uploaded.fileSize || fileObj.file.size,
              mimeType: fileObj.file.type,
            });
          }
        }
      }

      const payload = {
        ...form,
        documents: uploadedDocuments,
      };

      const result = await submitWebsiteFinanceApplication(payload, site?.slug || "primey-wheelz");

      setIsSubmitting(false);

      if (result.success) {
        setShowForm(false);
        setSuccessMessage(true);
        showToast("Finance application submitted successfully!", "success");
      } else {
        showToast(result.message || "Failed to submit application. Please try again.", "error");
      }
    } catch (error) {
      setIsSubmitting(false);
      showToast("An error occurred during submission.", "error");
      console.error(error);
    }
  };

  const renderErrorMessage = (errKey: string) => {
    const err = errors[errKey];
    if (!err) return null;
    const msg = typeof err === "string" ? err : "This field is mandatory";
    return <div className="text-red-500 text-xs mt-1">{msg}</div>;
  };

  return (
    <div className="bg-black text-white w-full py-20 min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-lg shadow-2xl font-semibold text-sm transition-all duration-300 ${
            toastMessage.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold lowercase tracking-wide mb-6">
          finance options
        </h1>
        <p className="text-xl md:text-2xl font-light" style={{ color: secondaryColor }}>
          Need help financing? We&apos;ve got you covered.
        </p>
      </div>

      {/* Initial Hero Card (if form not shown and not submitted) */}
      {!showForm && !successMessage && (
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="p-12 border border-white/10 rounded-lg bg-white/5 backdrop-blur-md">
            <div className="text-6xl mb-8">💰</div>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Contact us today to discuss our flexible finance options tailored to your needs. Our team is dedicated to helping you find the perfect payment plan.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {site?.phone && (
                <a
                  href={`tel:${site.phone}`}
                  className="inline-block px-10 py-4 rounded text-black font-bold transition transform hover:scale-105"
                  style={{ backgroundColor: secondaryColor }}
                >
                  Call {site.phone}
                </a>
              )}
              <button
                onClick={openForm}
                className="inline-block px-10 py-4 rounded text-black font-bold transition transform hover:scale-105 bg-white"
              >
                Apply Online
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message Screen */}
      {successMessage && (
        <div className="max-w-2xl mx-auto px-4">
          <div className="p-8 border border-green-500/50 rounded-lg bg-green-500/10 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
            <p className="text-gray-300">
              Your finance application has been successfully sent to {site?.companyName || "our dealership"}. We will be in touch shortly.
            </p>
            <button
              onClick={() => {
                setSuccessMessage(false);
                setShowForm(false);
              }}
              className="mt-6 px-8 py-3 rounded text-black font-bold transition"
              style={{ backgroundColor: secondaryColor }}
            >
              Back to Overview
            </button>
          </div>
        </div>
      )}

      {/* 4-Step Form Wizard */}
      {showForm && !successMessage && (
        <div className="max-w-5xl mx-auto px-4">
          <div className="p-8 md:p-12 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-xl relative">
            <button
              onClick={closeForm}
              className="absolute top-6 right-6 text-gray-400 hover:text-white text-3xl transition-colors cursor-pointer"
            >
              &times;
            </button>

            <h2 className="text-3xl font-semibold mb-12 text-center" style={{ color: secondaryColor }}>
              Finance Application
            </h2>

            {/* Step Indicators Bar */}
            <div className="flex items-center justify-center mb-12 relative max-w-xl mx-auto">
              <div className="absolute w-full h-[2px] bg-white/10 top-5 z-0" />
              <div
                className="absolute h-[2px] top-5 z-0 transition-all duration-300 left-0 origin-left"
                style={{
                  backgroundColor: secondaryColor,
                  width:
                    currentStep === 1
                      ? "12.5%"
                      : currentStep === 2
                      ? "37.5%"
                      : currentStep === 3
                      ? "62.5%"
                      : currentStep === 4
                      ? "87.5%"
                      : "100%",
                  left: "0",
                }}
              />

              <div className="flex justify-between w-full relative z-10">
                {/* Step 1 */}
                <div className="flex flex-col items-center cursor-pointer" onClick={() => setStep(1)}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-all duration-300 text-sm border-2 ${
                      currentStep >= 1
                        ? "text-black border-transparent"
                        : "bg-gray-800 text-gray-400 border-white/10"
                    }`}
                    style={{ backgroundColor: currentStep >= 1 ? secondaryColor : "" }}
                  >
                    1
                  </div>
                  <span
                    className={`text-xs font-medium transition-colors ${
                      currentStep === 1 ? "text-white" : "text-gray-400"
                    }`}
                  >
                    Applicant
                  </span>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center cursor-pointer" onClick={() => setStep(2)}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-all duration-300 text-sm border-2 ${
                      currentStep >= 2
                        ? "text-black border-transparent"
                        : "bg-gray-800 text-gray-400 border-white/10"
                    }`}
                    style={{ backgroundColor: currentStep >= 2 ? secondaryColor : "" }}
                  >
                    2
                  </div>
                  <span
                    className={`text-xs font-medium transition-colors text-center ${
                      currentStep === 2 ? "text-white" : "text-gray-400"
                    }`}
                  >
                    Address &amp;<br />Employment
                  </span>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center cursor-pointer" onClick={() => setStep(3)}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-all duration-300 text-sm border-2 ${
                      currentStep >= 3
                        ? "text-black border-transparent"
                        : "bg-gray-800 text-gray-400 border-white/10"
                    }`}
                    style={{ backgroundColor: currentStep >= 3 ? secondaryColor : "" }}
                  >
                    3
                  </div>
                  <span
                    className={`text-xs font-medium transition-colors text-center ${
                      currentStep === 3 ? "text-white" : "text-gray-400"
                    }`}
                  >
                    Financials
                  </span>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col items-center cursor-pointer" onClick={() => setStep(4)}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-all duration-300 text-sm border-2 ${
                      currentStep >= 4
                        ? "text-black border-transparent"
                        : "bg-gray-800 text-gray-400 border-white/10"
                    }`}
                    style={{ backgroundColor: currentStep >= 4 ? secondaryColor : "" }}
                  >
                    4
                  </div>
                  <span
                    className={`text-xs font-medium transition-colors text-center ${
                      currentStep === 4 ? "text-white" : "text-gray-400"
                    }`}
                  >
                    Apply
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={submitApplication}>
              {/* STEP 1: APPLICANT */}
              {currentStep === 1 && (
                <div className="space-y-8 animate-fadeIn">
                  {/* Applicant Information */}
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-3 mb-6 gap-4">
                      <h3 className="text-xl font-medium" style={{ color: secondaryColor }}>
                        Applicant Information
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-300">Is this a joint application?</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.isJointApplication}
                            onChange={(e) =>
                              setForm((prev) => ({ ...prev, isJointApplication: e.target.checked }))
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFB300]" />
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          First Name(s) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.firstName}
                          onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                          className={`w-full bg-neutral-900 border ${
                            errors.firstName ? "border-red-500" : "border-white/10"
                          } rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200`}
                        />
                        {renderErrorMessage("firstName")}
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Middle Name(s)
                        </label>
                        <input
                          type="text"
                          value={form.middleName}
                          onChange={(e) => setForm((prev) => ({ ...prev, middleName: e.target.value }))}
                          className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.lastName}
                          onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                          className={`w-full bg-neutral-900 border ${
                            errors.lastName ? "border-red-500" : "border-white/10"
                          } rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200`}
                        />
                        {renderErrorMessage("lastName")}
                      </div>

                      <div className="flex flex-col relative">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Date of Birth <span className="text-red-500">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={form.dob}
                            onChange={(e) => onDateInput("dob", e.target.value)}
                            placeholder="DD/MM/YYYY"
                            className={`w-full bg-neutral-900 border ${
                              errors.dob ? "border-red-500" : "border-white/10"
                            } rounded-lg p-3 pr-10 text-white focus:outline-none focus:border-white transition-all duration-200`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setActiveDatePicker((prev) => (prev === "dob" ? null : "dob"))
                            }
                            className="absolute right-3 text-gray-400 hover:text-white text-lg cursor-pointer"
                          >
                            📅
                          </button>
                          {activeDatePicker === "dob" && (
                            <CustomDatePicker
                              value={form.dob}
                              onDateSelect={(dateStr) => handleCustomDateSelect("dob", dateStr)}
                              onClose={() => setActiveDatePicker(null)}
                            />
                          )}
                        </div>
                        {renderErrorMessage("dob")}
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Marital Status <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={form.maritalStatus}
                          onChange={(e) => setForm((prev) => ({ ...prev, maritalStatus: e.target.value }))}
                          className={`w-full bg-neutral-900 border ${
                            errors.maritalStatus ? "border-red-500" : "border-white/10"
                          } rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200`}
                        >
                          <option value="">Please select...</option>
                          <option value="single">Single</option>
                          <option value="married">Married</option>
                          <option value="de_facto">De facto</option>
                          <option value="separated">Separated</option>
                        </select>
                        {renderErrorMessage("maritalStatus")}
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Number of Dependants <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.dependants}
                          onChange={(e) => setForm((prev) => ({ ...prev, dependants: e.target.value }))}
                          className={`w-full bg-neutral-900 border ${
                            errors.dependants ? "border-red-500" : "border-white/10"
                          } rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200`}
                        />
                        {renderErrorMessage("dependants")}
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Drivers Licence Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={form.licenseType}
                          onChange={(e) => setForm((prev) => ({ ...prev, licenseType: e.target.value }))}
                          className={`w-full bg-neutral-900 border ${
                            errors.licenseType ? "border-red-500" : "border-white/10"
                          } rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200`}
                        >
                          <option value="">Please select...</option>
                          <option value="learner">Learner License</option>
                          <option value="restricted">Restricted License</option>
                          <option value="full">Full License</option>
                          <option value="overseas">Overseas</option>
                        </select>
                        {renderErrorMessage("licenseType")}
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Drivers Licence No. <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.licenseNumber}
                          onChange={(e) => setForm((prev) => ({ ...prev, licenseNumber: e.target.value }))}
                          className={`w-full bg-neutral-900 border ${
                            errors.licenseNumber ? "border-red-500" : "border-white/10"
                          } rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200`}
                        />
                        {renderErrorMessage("licenseNumber")}
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Version No.
                        </label>
                        <input
                          type="text"
                          value={form.versionNumber}
                          onChange={(e) => setForm((prev) => ({ ...prev, versionNumber: e.target.value }))}
                          className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200"
                        />
                      </div>

                      <div className="flex flex-col relative">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Expiry Date
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={form.expiryDate}
                            onChange={(e) => onDateInput("expiryDate", e.target.value)}
                            placeholder="DD/MM/YYYY"
                            className={`w-full bg-neutral-900 border ${
                              errors.expiryDate ? "border-red-500" : "border-white/10"
                            } rounded-lg p-3 pr-10 text-white focus:outline-none focus:border-white transition-all duration-200`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setActiveDatePicker((prev) => (prev === "expiryDate" ? null : "expiryDate"))
                            }
                            className="absolute right-3 text-gray-400 hover:text-white text-lg cursor-pointer"
                          >
                            📅
                          </button>
                          {activeDatePicker === "expiryDate" && (
                            <CustomDatePicker
                              value={form.expiryDate}
                              onDateSelect={(dateStr) => handleCustomDateSelect("expiryDate", dateStr)}
                              onClose={() => setActiveDatePicker(null)}
                            />
                          )}
                        </div>
                        {renderErrorMessage("expiryDate")}
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Home Phone
                        </label>
                        <input
                          type="text"
                          value={form.homePhone}
                          onChange={(e) => setForm((prev) => ({ ...prev, homePhone: e.target.value }))}
                          className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Mobile Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.phone}
                          onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                          className={`w-full bg-neutral-900 border ${
                            errors.phone ? "border-red-500" : "border-white/10"
                          } rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200`}
                        />
                        {renderErrorMessage("phone")}
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Work Phone
                        </label>
                        <input
                          type="text"
                          value={form.workPhone}
                          onChange={(e) => setForm((prev) => ({ ...prev, workPhone: e.target.value }))}
                          className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                          className={`w-full bg-neutral-900 border ${
                            errors.email ? "border-red-500" : "border-white/10"
                          } rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200`}
                        />
                        {renderErrorMessage("email")}
                      </div>

                      <div className="flex flex-col lg:col-span-2">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Are you a New Zealand Citizen or Resident? <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={form.residencyStatus}
                          onChange={(e) => setForm((prev) => ({ ...prev, residencyStatus: e.target.value }))}
                          className={`w-full bg-neutral-900 border ${
                            errors.residencyStatus ? "border-red-500" : "border-white/10"
                          } rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200`}
                        >
                          <option value="">Please select...</option>
                          <option value="nz_citizen">NZ Citizen</option>
                          <option value="permanent_resident">Permanent Resident</option>
                          <option value="work_visa">Work Visa</option>
                        </select>
                        {renderErrorMessage("residencyStatus")}
                      </div>
                    </div>
                  </div>

                  {/* Partner Information (Conditional) */}
                  {form.isJointApplication && (
                    <div className="animate-fadeIn">
                      <h3 className="text-xl font-medium border-b border-white/10 pb-3 mb-6" style={{ color: secondaryColor }}>
                        Partner Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                            First Name(s) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={form.partner.firstName}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                partner: { ...prev.partner, firstName: e.target.value },
                              }))
                            }
                            className={`w-full bg-neutral-900 border ${
                              errors.partnerFirstName ? "border-red-500" : "border-white/10"
                            } rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200`}
                          />
                          {renderErrorMessage("partnerFirstName")}
                        </div>

                        <div className="flex flex-col">
                          <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                            Middle Name(s)
                          </label>
                          <input
                            type="text"
                            value={form.partner.middleName}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                partner: { ...prev.partner, middleName: e.target.value },
                              }))
                            }
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200"
                          />
                        </div>

                        <div className="flex flex-col">
                          <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={form.partner.lastName}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                partner: { ...prev.partner, lastName: e.target.value },
                              }))
                            }
                            className={`w-full bg-neutral-900 border ${
                              errors.partnerLastName ? "border-red-500" : "border-white/10"
                            } rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200`}
                          />
                          {renderErrorMessage("partnerLastName")}
                        </div>

                        <div className="flex flex-col relative">
                          <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                            Date of Birth
                          </label>
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              value={form.partner.dob}
                              onChange={(e) => onDateInput("partnerDob", e.target.value)}
                              placeholder="DD/MM/YYYY"
                              className={`w-full bg-neutral-900 border ${
                                errors.partnerDob ? "border-red-500" : "border-white/10"
                              } rounded-lg p-3 pr-10 text-white focus:outline-none focus:border-white transition-all duration-200`}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setActiveDatePicker((prev) => (prev === "partnerDob" ? null : "partnerDob"))
                              }
                              className="absolute right-3 text-gray-400 hover:text-white text-lg cursor-pointer"
                            >
                              📅
                            </button>
                            {activeDatePicker === "partnerDob" && (
                              <CustomDatePicker
                                value={form.partner.dob}
                                onDateSelect={(dateStr) => handleCustomDateSelect("partnerDob", dateStr)}
                                onClose={() => setActiveDatePicker(null)}
                              />
                            )}
                          </div>
                          {renderErrorMessage("partnerDob")}
                        </div>

                        <div className="flex flex-col">
                          <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                            Home Phone
                          </label>
                          <input
                            type="text"
                            value={form.partner.homePhone}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                partner: { ...prev.partner, homePhone: e.target.value },
                              }))
                            }
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200"
                          />
                        </div>

                        <div className="flex flex-col">
                          <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                            Mobile Phone
                          </label>
                          <input
                            type="text"
                            value={form.partner.mobilePhone}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                partner: { ...prev.partner, mobilePhone: e.target.value },
                              }))
                            }
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200"
                          />
                        </div>

                        <div className="flex flex-col">
                          <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                            Marital Status
                          </label>
                          <select
                            value={form.partner.maritalStatus}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                partner: { ...prev.partner, maritalStatus: e.target.value },
                              }))
                            }
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200"
                          >
                            <option value="">Please select...</option>
                            <option value="single">Single</option>
                            <option value="married">Married</option>
                            <option value="de_facto">De facto</option>
                            <option value="separated">Separated</option>
                          </select>
                        </div>

                        <div className="flex flex-col">
                          <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                            Number of Dependants
                          </label>
                          <input
                            type="text"
                            value={form.partner.dependants}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                partner: { ...prev.partner, dependants: e.target.value },
                              }))
                            }
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200"
                          />
                        </div>

                        <div className="flex flex-col">
                          <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                            Drivers Licence Type
                          </label>
                          <select
                            value={form.partner.licenseType}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                partner: { ...prev.partner, licenseType: e.target.value },
                              }))
                            }
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200"
                          >
                            <option value="">Please select...</option>
                            <option value="learner">Learner License</option>
                            <option value="restricted">Restricted License</option>
                            <option value="full">Full License</option>
                            <option value="overseas">Overseas</option>
                          </select>
                        </div>

                        <div className="flex flex-col">
                          <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                            Drivers Licence No.
                          </label>
                          <input
                            type="text"
                            value={form.partner.licenseNumber}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                partner: { ...prev.partner, licenseNumber: e.target.value },
                              }))
                            }
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200"
                          />
                        </div>

                        <div className="flex flex-col">
                          <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                            Version No.
                          </label>
                          <input
                            type="text"
                            value={form.partner.versionNumber}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                partner: { ...prev.partner, versionNumber: e.target.value },
                              }))
                            }
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: ADDRESS & EMPLOYMENT */}
              {currentStep === 2 && (
                <div className="space-y-8 animate-fadeIn">
                  {/* Address Details */}
                  <div>
                    <h3 className="text-xl font-medium border-b border-white/10 pb-3 mb-6" style={{ color: secondaryColor }}>
                      Address Details
                    </h3>

                    <div className="mb-8 bg-neutral-900/50 p-6 rounded-xl border border-white/5">
                      <span className="block text-xs text-gray-400 mb-3 font-semibold uppercase tracking-wider">
                        Living Situation
                      </span>
                      <div className="flex flex-wrap gap-8">
                        {["Own House", "Renting", "Boarding", "Other"].map((sit) => (
                          <label key={sit} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="livingSituation"
                              value={sit}
                              checked={form.addressDetails.livingSituation === sit}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  addressDetails: { ...prev.addressDetails, livingSituation: e.target.value },
                                }))
                              }
                              className="w-4 h-4 accent-[#FFB300]"
                            />
                            <span className="text-sm font-medium">{sit}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="flex flex-col lg:col-span-2">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Home Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.addressDetails.homeAddress}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              addressDetails: { ...prev.addressDetails, homeAddress: e.target.value },
                            }))
                          }
                          className={`w-full bg-neutral-900 border ${
                            errors.homeAddress ? "border-red-500" : "border-white/10"
                          } rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200`}
                        />
                        {renderErrorMessage("homeAddress")}
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Suburb <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.addressDetails.suburb}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              addressDetails: { ...prev.addressDetails, suburb: e.target.value },
                            }))
                          }
                          className={`w-full bg-neutral-900 border ${
                            errors.suburb ? "border-red-500" : "border-white/10"
                          } rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200`}
                        />
                        {renderErrorMessage("suburb")}
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.addressDetails.city}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              addressDetails: { ...prev.addressDetails, city: e.target.value },
                            }))
                          }
                          className={`w-full bg-neutral-900 border ${
                            errors.city ? "border-red-500" : "border-white/10"
                          } rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200`}
                        />
                        {renderErrorMessage("city")}
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Years at Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={form.addressDetails.yearsAt}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              addressDetails: { ...prev.addressDetails, yearsAt: e.target.value },
                            }))
                          }
                          className={`w-full bg-neutral-900 border ${
                            errors.yearsAt ? "border-red-500" : "border-white/10"
                          } rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200`}
                        />
                        {renderErrorMessage("yearsAt")}
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Months at Address
                        </label>
                        <input
                          type="number"
                          value={form.addressDetails.monthsAt}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              addressDetails: { ...prev.addressDetails, monthsAt: e.target.value },
                            }))
                          }
                          className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Employment Details */}
                  <div>
                    <h3 className="text-xl font-medium border-b border-white/10 pb-3 mb-6" style={{ color: secondaryColor }}>
                      Employment Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Employment Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={form.employmentDetails.employmentType}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              employmentDetails: { employmentType: e.target.value },
                            }))
                          }
                          className={`w-full bg-neutral-900 border ${
                            errors.employmentType ? "border-red-500" : "border-white/10"
                          } rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200`}
                        >
                          <option value="">Please select...</option>
                          <option value="retired">Retired</option>
                          <option value="homemaker">Homemaker</option>
                          <option value="beneficiary">Beneficiary</option>
                          <option value="self_employed">Self Employed</option>
                          <option value="full_time">Full Time</option>
                          <option value="part_time">Part Time</option>
                        </select>
                        {renderErrorMessage("employmentType")}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: FINANCIALS */}
              {currentStep === 3 && (
                <div className="space-y-8 animate-fadeIn">
                  {/* Income Section */}
                  <div>
                    <h3 className="text-xl font-medium border-b border-white/10 pb-3 mb-6" style={{ color: secondaryColor }}>
                      Income Details
                    </h3>
                    <h4 className="text-sm font-semibold text-gray-300 mb-4">Applicant 1</h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Primary Income Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={form.financials.applicant1.primaryIncomeType}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              financials: {
                                ...prev.financials,
                                applicant1: {
                                  ...prev.financials.applicant1,
                                  primaryIncomeType: e.target.value,
                                },
                              },
                            }))
                          }
                          className={`w-full bg-neutral-900 border ${
                            errors.primaryIncomeType ? "border-red-500" : "border-white/10"
                          } rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200`}
                        >
                          <option value="">Please select...</option>
                          <option value="wages">Wages</option>
                          <option value="salary">Salary</option>
                          <option value="benefits">Benefits</option>
                          <option value="self_employed">Self Employed</option>
                          <option value="contract">Contract</option>
                          <option value="casual">Casual</option>
                          <option value="other">Other</option>
                        </select>
                        {renderErrorMessage("primaryIncomeType")}
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Amount (in the hand) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-gray-400 font-bold">$</span>
                          <input
                            type="text"
                            value={form.financials.applicant1.amount}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                financials: {
                                  ...prev.financials,
                                  applicant1: {
                                    ...prev.financials.applicant1,
                                    amount: e.target.value,
                                  },
                                },
                              }))
                            }
                            className={`w-full bg-neutral-900 border ${
                              errors.amount ? "border-red-500" : "border-white/10"
                            } rounded-lg py-3 pl-8 pr-12 text-white focus:outline-none focus:border-white transition-all duration-200`}
                          />
                          <span className="absolute right-3 text-gray-400 font-bold text-sm">.00</span>
                        </div>
                        {renderErrorMessage("amount")}
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Pay Frequency <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={form.financials.applicant1.payFrequency}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              financials: {
                                ...prev.financials,
                                applicant1: {
                                  ...prev.financials.applicant1,
                                  payFrequency: e.target.value,
                                },
                              },
                            }))
                          }
                          className={`w-full bg-neutral-900 border ${
                            errors.payFrequency ? "border-red-500" : "border-white/10"
                          } rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200`}
                        >
                          <option value="">Please select...</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="fortnightly">Fortnightly</option>
                          <option value="other">Other</option>
                        </select>
                        {renderErrorMessage("payFrequency")}
                      </div>
                    </div>

                    {/* Other Income 1 & 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Other Income 1
                        </label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-gray-400 font-bold">$</span>
                          <input
                            type="text"
                            value={form.financials.applicant1.otherIncome1}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                financials: {
                                  ...prev.financials,
                                  applicant1: {
                                    ...prev.financials.applicant1,
                                    otherIncome1: e.target.value,
                                  },
                                },
                              }))
                            }
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg py-3 pl-8 pr-12 text-white focus:outline-none focus:border-white transition-all duration-200"
                          />
                          <span className="absolute right-3 text-gray-400 font-bold text-sm">.00</span>
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Other Income Source 1
                        </label>
                        <input
                          type="text"
                          value={form.financials.applicant1.otherIncomeSource1}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              financials: {
                                ...prev.financials,
                                applicant1: {
                                  ...prev.financials.applicant1,
                                  otherIncomeSource1: e.target.value,
                                },
                              },
                            }))
                          }
                          className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Other Income 2
                        </label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-gray-400 font-bold">$</span>
                          <input
                            type="text"
                            value={form.financials.applicant1.otherIncome2}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                financials: {
                                  ...prev.financials,
                                  applicant1: {
                                    ...prev.financials.applicant1,
                                    otherIncome2: e.target.value,
                                  },
                                },
                              }))
                            }
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg py-3 pl-8 pr-12 text-white focus:outline-none focus:border-white transition-all duration-200"
                          />
                          <span className="absolute right-3 text-gray-400 font-bold text-sm">.00</span>
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Other Income Source 2
                        </label>
                        <input
                          type="text"
                          value={form.financials.applicant1.otherIncomeSource2}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              financials: {
                                ...prev.financials,
                                applicant1: {
                                  ...prev.financials.applicant1,
                                  otherIncomeSource2: e.target.value,
                                },
                              },
                            }))
                          }
                          className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Outgoings / Expenses Section */}
                  <div>
                    <h3 className="text-xl font-medium border-b border-white/10 pb-3 mb-6" style={{ color: secondaryColor }}>
                      Outgoings (Expenses &amp; Repayments)
                    </h3>
                    <h4 className="text-sm font-semibold text-gray-300 mb-4">Rent Details</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Rent Amount <span className="text-red-500">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-gray-400 font-bold">$</span>
                          <input
                            type="text"
                            value={form.financials.expenses.rentAmount}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                financials: {
                                  ...prev.financials,
                                  expenses: {
                                    ...prev.financials.expenses,
                                    rentAmount: e.target.value,
                                  },
                                },
                              }))
                            }
                            className={`w-full bg-neutral-900 border ${
                              errors.rentAmount ? "border-red-500" : "border-white/10"
                            } rounded-lg py-3 pl-8 pr-12 text-white focus:outline-none focus:border-white transition-all duration-200`}
                          />
                          <span className="absolute right-3 text-gray-400 font-bold text-sm">.00</span>
                        </div>
                        {renderErrorMessage("rentAmount")}
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Frequency <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={form.financials.expenses.rentFrequency}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              financials: {
                                ...prev.financials,
                                expenses: {
                                  ...prev.financials.expenses,
                                  rentFrequency: e.target.value,
                                },
                              },
                            }))
                          }
                          className={`w-full bg-neutral-900 border ${
                            errors.rentFrequency ? "border-red-500" : "border-white/10"
                          } rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200`}
                        >
                          <option value="">Please select...</option>
                          <option value="weekly">Weekly</option>
                          <option value="fortnightly">Fortnightly</option>
                          <option value="monthly">Monthly</option>
                          <option value="other">Other</option>
                        </select>
                        {renderErrorMessage("rentFrequency")}
                      </div>
                    </div>

                    {/* Loan Repayments Loop */}
                    <div className="mt-8">
                      <h4 className="text-sm font-semibold text-gray-300 mb-4 border-b border-white/5 pb-2">
                        Loan Repayments
                      </h4>
                      {form.financials.loanRepayments.map((loan, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4 bg-neutral-900/30 p-4 rounded-xl border border-white/5"
                        >
                          <div className="flex flex-col">
                            <label className="text-[10px] text-gray-500 mb-1 uppercase font-bold tracking-wider">
                              Loan {i + 1} Type
                            </label>
                            <select
                              value={loan.type}
                              onChange={(e) => {
                                const newLoans = [...form.financials.loanRepayments];
                                newLoans[i].type = e.target.value;
                                setForm((prev) => ({
                                  ...prev,
                                  financials: { ...prev.financials, loanRepayments: newLoans },
                                }));
                              }}
                              className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200"
                            >
                              <option value="">Please select...</option>
                              <option value="loan">Loan</option>
                              <option value="hire_purchase">Hire Purchase</option>
                              <option value="credit_card">Credit Card</option>
                              <option value="other">Other</option>
                            </select>
                          </div>

                          <div className="flex flex-col">
                            <label className="text-[10px] text-gray-500 mb-1 uppercase font-bold tracking-wider">
                              Repayment Amount
                            </label>
                            <div className="relative flex items-center">
                              <span className="absolute left-3 text-gray-400 font-bold">$</span>
                              <input
                                type="text"
                                value={loan.amount}
                                onChange={(e) => {
                                  const newLoans = [...form.financials.loanRepayments];
                                  newLoans[i].amount = e.target.value;
                                  setForm((prev) => ({
                                    ...prev,
                                    financials: { ...prev.financials, loanRepayments: newLoans },
                                  }));
                                }}
                                className="w-full bg-neutral-900 border border-white/10 rounded-lg py-3 pl-8 pr-12 text-white focus:outline-none focus:border-white transition-all duration-200"
                              />
                              <span className="absolute right-3 text-gray-400 font-bold text-sm">.00</span>
                            </div>
                          </div>

                          <div className="flex flex-col">
                            <label className="text-[10px] text-gray-500 mb-1 uppercase font-bold tracking-wider">
                              Frequency
                            </label>
                            <select
                              value={loan.frequency}
                              onChange={(e) => {
                                const newLoans = [...form.financials.loanRepayments];
                                newLoans[i].frequency = e.target.value;
                                setForm((prev) => ({
                                  ...prev,
                                  financials: { ...prev.financials, loanRepayments: newLoans },
                                }));
                              }}
                              className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200"
                            >
                              <option value="">Please select...</option>
                              <option value="weekly">Weekly</option>
                              <option value="fortnightly">Fortnightly</option>
                              <option value="monthly">Monthly</option>
                              <option value="other">Other</option>
                            </select>
                          </div>

                          <div className="flex flex-col">
                            <label className="text-[10px] text-gray-500 mb-1 uppercase font-bold tracking-wider">
                              Owed To
                            </label>
                            <input
                              type="text"
                              value={loan.owedTo}
                              onChange={(e) => {
                                const newLoans = [...form.financials.loanRepayments];
                                newLoans[i].owedTo = e.target.value;
                                setForm((prev) => ({
                                  ...prev,
                                  financials: { ...prev.financials, loanRepayments: newLoans },
                                }));
                              }}
                              className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assets Section */}
                  <div>
                    <h3 className="text-xl font-medium border-b border-white/10 pb-3 mb-6" style={{ color: secondaryColor }}>
                      Assets
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {form.financials.assets.map((asset, i) => (
                        <div key={i} className="flex flex-col bg-neutral-900/30 p-4 rounded-xl border border-white/5">
                          <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                            Asset {i + 1} Description
                          </label>
                          <input
                            type="text"
                            value={asset.description}
                            onChange={(e) => {
                              const newAssets = [...form.financials.assets];
                              newAssets[i].description = e.target.value;
                              setForm((prev) => ({
                                ...prev,
                                financials: { ...prev.financials, assets: newAssets },
                              }));
                            }}
                            placeholder="e.g. Savings, Vehicle value, Property..."
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: APPLY */}
              {currentStep === 4 && (
                <div className="space-y-8 animate-fadeIn">
                  {/* Next of Kin Details */}
                  <div>
                    <h3 className="text-xl font-medium border-b border-white/10 pb-3 mb-6" style={{ color: secondaryColor }}>
                      Next of Kin Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Name
                        </label>
                        <input
                          type="text"
                          value={form.nextOfKin.name}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              nextOfKin: { ...prev.nextOfKin, name: e.target.value },
                            }))
                          }
                          className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Relationship
                        </label>
                        <input
                          type="text"
                          value={form.nextOfKin.relationship}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              nextOfKin: { ...prev.nextOfKin, relationship: e.target.value },
                            }))
                          }
                          className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Phone
                        </label>
                        <input
                          type="text"
                          value={form.nextOfKin.phone}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              nextOfKin: { ...prev.nextOfKin, phone: e.target.value },
                            }))
                          }
                          className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Rate your credit <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={form.nextOfKin.creditRating}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              nextOfKin: { ...prev.nextOfKin, creditRating: e.target.value },
                            }))
                          }
                          className={`w-full bg-neutral-900 border ${
                            errors.creditRating ? "border-red-500" : "border-white/10"
                          } rounded-lg p-3 text-white focus:outline-none focus:border-white transition-all duration-200`}
                        >
                          <option value="">Please select...</option>
                          <option value="poor">Poor</option>
                          <option value="fair">Fair</option>
                          <option value="good">Good</option>
                          <option value="excellent">Excellent</option>
                          <option value="unknown">Unknown</option>
                        </select>
                        {renderErrorMessage("creditRating")}
                      </div>
                    </div>
                  </div>

                  {/* Supporting Documents */}
                  <div>
                    <h3 className="text-xl font-medium border-b border-white/10 pb-3 mb-4" style={{ color: secondaryColor }}>
                      Supporting Documents
                    </h3>
                    <p className="text-sm text-gray-400 mb-6">
                      Please upload any supporting documents here. E.G. Drivers Licence, Pay Slips, and Bank Statements (PDFs and Images supported).
                    </p>

                    <div className="bg-neutral-900/50 p-8 rounded-2xl border border-white/5 border-dashed text-center">
                      <label className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-semibold transition-colors duration-200 shadow-lg cursor-pointer inline-block">
                        Add Files...
                        <input
                          type="file"
                          className="hidden"
                          multiple
                          accept="image/*,.pdf"
                          onChange={onFilesUpload}
                        />
                      </label>

                      <div className="mt-6 flex flex-wrap gap-4 justify-center">
                        {supportingFiles.map((fileObj, i) => (
                          <div
                            key={i}
                            className="relative w-28 bg-neutral-950 p-2 rounded-xl border border-white/10 shadow-xl group"
                          >
                            <button
                              type="button"
                              onClick={() => removeFile(i)}
                              className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white border-0 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg transition-transform duration-200 hover:scale-110 cursor-pointer"
                            >
                              &times;
                            </button>
                            {fileObj.preview ? (
                              <div className="w-full h-20 rounded-lg overflow-hidden border border-white/5 mb-2">
                                <img src={fileObj.preview} alt="Preview" className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-full h-20 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center mb-2">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                  PDF
                                </span>
                              </div>
                            )}
                            <p
                              className="text-[10px] text-gray-400 font-medium truncate text-center"
                              title={fileObj.name || fileObj.file.name}
                            >
                              {fileObj.name || fileObj.file.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex justify-between items-center mt-12 pt-6 border-t border-white/10">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-8 py-3 text-gray-400 hover:text-white transition duration-200 cursor-pointer"
                  >
                    &lt; PREV
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex-grow" />

                {currentStep < 4 && (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-8 py-3 rounded-lg text-black font-semibold transition transform hover:scale-[1.02] cursor-pointer shadow-lg"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    NEXT &gt;
                  </button>
                )}

                {currentStep === 4 && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-10 py-4 rounded-lg text-black font-bold transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xl flex items-center justify-center min-w-[160px]"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    {isSubmitting ? "SUBMITTING..." : "SUBMIT APPLICATION"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
