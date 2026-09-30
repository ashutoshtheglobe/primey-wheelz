import type { Metadata } from "next";
import { fetchWebsiteConfig } from "@/services/backendApi";
import AboutClient from "./AboutClient";

export async function generateMetadata(): Promise<Metadata> {
  const site = await fetchWebsiteConfig("primey-wheelz");
  const siteName = site?.companyName || "Primey Wheelz";
  const domain = site?.customDomain || "primeywheelz.co.nz";

  const title = `About Us | ${siteName}`;
  const description =
    site?.about
      ? (site.about.length > 160 ? `${site.about.slice(0, 157)}...` : site.about)
      : `Learn more about ${siteName} - your trusted dealership for quality used vehicles and seamless automotive experience.`;
  const bannerOrLogo =
    site?.aboutBanner ||
    site?.logo ||
    "https://img.theglobe.nz/assets/images/theglobe-logo.svg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://${domain}/about`,
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

export default function AboutPage() {
  return <AboutClient />;
}
