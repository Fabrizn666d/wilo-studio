"use client";

import { createContext, useContext } from "react";
import type { PublicSiteSettings } from "@/lib/site-settings";

const SiteSettingsContext = createContext<PublicSiteSettings | null>(null);

export function SiteSettingsProvider({ initialValue, children }: { initialValue: PublicSiteSettings; children: React.ReactNode }) {
  return <SiteSettingsContext.Provider value={initialValue}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  const value = useContext(SiteSettingsContext);
  if (!value) throw new Error("useSiteSettings must be used inside SiteSettingsProvider");
  return value;
}
