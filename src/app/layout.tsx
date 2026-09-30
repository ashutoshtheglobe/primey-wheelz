import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { WebsiteProvider } from "@/context/WebsiteContext";
import { fetchWebsiteConfig } from "@/services/backendApi";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await fetchWebsiteConfig("primey-wheelz");
  const companyName = site?.companyName || "Primey Wheelz";
  const defaultTitle = `${companyName} | Quality Vehicles & Easy Finance`;
  const description =
    site?.metaDescription ||
    "Browse quality used cars, apply for easy vehicle finance, and get instant trade-in valuations.";
  const logo =
    site?.logo || "https://img.theglobe.nz/assets/images/theglobe-logo.svg";

  return {
    title: {
      default: defaultTitle,
      template: `%s | ${companyName}`,
    },
    description,
    icons: {
      icon: logo,
      shortcut: logo,
      apple: logo,
    },
    openGraph: {
      title: defaultTitle,
      description,
      siteName: companyName,
      images: [
        {
          url: logo,
          alt: companyName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description,
      images: [logo],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-black text-white`}
    >
      <body className="min-h-full flex flex-col bg-black text-white font-sans">
        <WebsiteProvider>
          <Header />
          <main className="flex-grow bg-black">{children}</main>
          <Footer />
        </WebsiteProvider>
      </body>
    </html>
  );
}
