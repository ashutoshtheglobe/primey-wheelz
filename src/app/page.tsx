import type { Metadata } from "next";
import { fetchWebsiteConfig } from "@/services/backendApi";
import HomeClient from "./HomeClient";

export async function generateMetadata(): Promise<Metadata> {
  const site = await fetchWebsiteConfig("primey-wheelz");
  const siteName = site?.companyName || "Primey Wheelz";
  const domain = site?.customDomain || "primeywheelz.co.nz";

  const title = `${siteName} | Quality Vehicles & Easy Finance`;
  const description =
    site?.metaDescription ||
    "Browse quality used cars, apply for easy vehicle finance, and get instant trade-in valuations.";
  const bannerOrLogo =
    site?.heroBanner ||
    site?.logo ||
    "https://img.theglobe.nz/assets/images/theglobe-logo.svg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://${domain}`,
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

export default function Home() {
  return <HomeClient />;
}
