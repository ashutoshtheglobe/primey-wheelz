import type { Metadata } from "next";
import { fetchWebsiteConfig } from "@/services/backendApi";
import VehiclesClient from "./VehiclesClient";

export async function generateMetadata(): Promise<Metadata> {
  const site = await fetchWebsiteConfig("primey-wheels");
  const siteName = site?.companyName || "Primey Wheelz";
  const domain = site?.customDomain || "primewheels.co.nz";

  const title = `Inventory & Vehicles For Sale | ${siteName}`;
  const description =
    site?.metaDescription ||
    `Browse our full selection of quality used vehicles for sale at ${siteName}. Filter by make, body style, price and features.`;
  const logo =
    site?.logo || "https://img.theglobe.nz/assets/images/theglobe-logo.svg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://${domain}/vehicles`,
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

export default function VehiclesPage() {
  return <VehiclesClient />;
}
