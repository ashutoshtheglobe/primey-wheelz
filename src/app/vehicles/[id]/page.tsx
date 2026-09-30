import type { Metadata } from "next";
import {
  fetchListingById,
  fetchWebsiteConfig,
  getListingImageUrls,
} from "@/services/backendApi";
import ListingDetailClient from "./ListingDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const listingId = resolvedParams.id;

  const [data, site] = await Promise.all([
    fetchListingById(listingId),
    fetchWebsiteConfig("primey-wheelz"),
  ]);

  const siteName = site?.companyName || "Primey Wheelz";
  const domain = site?.customDomain || "primeywheelz.co.nz";

  if (!data || !data.listing) {
    return {
      title: `Listing #${listingId} Not Found | ${siteName}`,
      description: site?.metaDescription || "Browse quality vehicles from trusted dealers.",
    };
  }

  const listing = data.listing;
  const images = getListingImageUrls(listing);
  const mainImage =
    images[0] ||
    site?.logo ||
    "https://img.theglobe.nz/assets/images/theglobe-logo.svg";

  const priceVal = listing.salePrice || listing.listPrice || listing.basePrice;
  const formattedPrice =
    priceVal && priceVal > 0
      ? `$${priceVal.toLocaleString("en-NZ")}`
      : "Price By Negotiation";

  // Extract year if available
  const yearOpt = listing.listingAttributeOptions?.find(
    (o) =>
      o.listingAttribute?.name?.toLowerCase() === "year" ||
      o.listingAttribute?.name?.toLowerCase() === "year of manufacture"
  );
  const yearStr = yearOpt?.value ? `${yearOpt.value} ` : "";

  const pageTitle = `${yearStr}${listing.title} - ${formattedPrice} | ${siteName}`;

  const rawDesc = listing.description
    ? listing.description.replace(/[\r\n]+/g, " ").trim()
    : "";
  const pageDesc =
    rawDesc.length > 0
      ? rawDesc.length > 160
        ? `${rawDesc.slice(0, 157)}...`
        : rawDesc
      : `View details, photos, finance calculator and enquire for ${yearStr}${listing.title} (${formattedPrice}) at ${siteName}.`;

  const canonicalUrl = `https://${domain}/vehicles/${listing.id}`;

  return {
    title: pageTitle,
    description: pageDesc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: canonicalUrl,
      siteName: siteName,
      images: [
        {
          url: mainImage,
          width: 1200,
          height: 630,
          alt: listing.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDesc,
      images: [mainImage],
    },
  };
}

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <ListingDetailClient params={params} />;
}
