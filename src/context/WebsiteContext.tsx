"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { WebsiteData } from "@/types";
import { fetchWebsiteConfig } from "@/services/backendApi";

interface WebsiteContextType {
  site: WebsiteData | null;
  loading: boolean;
}

const WebsiteContext = createContext<WebsiteContextType>({
  site: null,
  loading: true,
});

export function WebsiteProvider({ children }: { children: React.ReactNode }) {
  const [site, setSite] = useState<WebsiteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchWebsiteConfig("primey-wheelz");
        setSite(data);
      } catch (err) {
        console.error("Error loading website config:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center select-none font-sans">
        <div className="relative flex flex-col items-center">
          {/* Outer glowing ring */}
          <div className="w-20 h-20 border-4 border-zinc-800 border-t-[#C2410C] rounded-full animate-spin mb-6" />

          {/* Center Brand Pulse */}
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-white font-mono uppercase tracking-widest animate-pulse">
              PRIMEY <span className="text-[#C2410C]">WHEELZ</span>
            </span>
          </div>

          <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mt-3 animate-pulse">
            Loading Live Website Data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <WebsiteContext.Provider value={{ site, loading }}>
      {children}
    </WebsiteContext.Provider>
  );
}

export function useWebsite() {
  return useContext(WebsiteContext);
}
