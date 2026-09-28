import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { WebsiteProvider } from "@/context/WebsiteContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Primey Wheelz | Quality Vehicles & Easy Finance",
  description: "Browse quality used cars, apply for easy vehicle finance, and get instant trade-in valuations.",
};

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
