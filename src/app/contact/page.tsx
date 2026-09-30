import type { Metadata } from "next";
import { fetchWebsiteConfig } from "@/services/backendApi";
import ContactClient from "./ContactClient";

export async function generateMetadata(): Promise<Metadata> {
  const site = await fetchWebsiteConfig("primey-wheelz");
  const siteName = site?.companyName || "Primey Wheelz";
  const domain = site?.customDomain || "primeywheelz.co.nz";

  const title = `Contact Us | ${siteName}`;
  const description =
    `Get in touch with ${siteName}. Location: ${site?.address || "Dargaville, Northland"}. Call ${site?.phone || "us"} or send an online enquiry.`;
  const logo =
    site?.logo || "https://img.theglobe.nz/assets/images/theglobe-logo.svg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://${domain}/contact`,
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

export default function ContactPage() {
  return <ContactClient />;
}
