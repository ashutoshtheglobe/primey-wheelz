import type { Metadata } from "next";
import { fetchWebsiteConfig } from "@/services/backendApi";
import FinanceClient from "./FinanceClient";

export async function generateMetadata(): Promise<Metadata> {
  const site = await fetchWebsiteConfig("primey-wheels");
  const siteName = site?.companyName || "Primey Wheelz";
  const domain = site?.customDomain || "primewheels.co.nz";

  const title = `Apply for Vehicle Finance | ${siteName}`;
  const description =
    site?.financeDescription ||
    site?.metaDescription ||
    `Apply online for quick, flexible vehicle finance at ${siteName}. Low interest rates and tailored payment options available.`;
  const bannerOrLogo =
    site?.financeBanner ||
    site?.logo ||
    "https://img.theglobe.nz/assets/images/theglobe-logo.svg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://${domain}/finance`,
      siteName,
      images: [{ url: bannerOrLogo, alt: siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [bannerOrLogo],
    },
  };
}

export default function FinancePage() {
  return <FinanceClient />;
}
