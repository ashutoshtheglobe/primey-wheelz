import type { Metadata } from "next";
import { fetchWebsiteConfig } from "@/services/backendApi";
import PriceMyTradeClient from "./PriceMyTradeClient";

export async function generateMetadata(): Promise<Metadata> {
  const site = await fetchWebsiteConfig("primey-wheelz");
  const siteName = site?.companyName || "Primey Wheelz";
  const domain = site?.customDomain || "primeywheelz.co.nz";

  const title = `Price My Trade - Free Vehicle Valuation | ${siteName}`;
  const description =
    `Get a professional valuation for your trade-in vehicle at ${siteName}. Submit your vehicle details online for a competitive offer.`;
  const logo =
    site?.logo || "https://img.theglobe.nz/assets/images/theglobe-logo.svg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://${domain}/price-my-trade`,
      siteName,
      images: [{ url: logo, alt: siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [logo],
    },
  };
}

export default function PriceMyTradePage() {
  return <PriceMyTradeClient />;
}
