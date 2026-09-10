"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "./cart-provider";
import { CartDrawer } from "./cart-drawer";
import { Preloader } from "./preloader";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { SiteSettingsProvider } from "./site-settings-provider";
import { SmoothScroll } from "./smooth-scroll";
import { WhatsappFab } from "./whatsapp-fab";
import { FullPageController } from "./home/FullPageController";
import type { PublicSiteSettings } from "@/lib/site-settings";
import type { Locale } from "@/lib/i18n";
import { I18nProvider } from "./i18n-provider";

export function ClientShell({ children, settings, initialLocale }: { children: React.ReactNode; settings: PublicSiteSettings; initialLocale: Locale }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return <I18nProvider initialLocale={initialLocale}><SiteSettingsProvider initialValue={settings}>{children}</SiteSettingsProvider></I18nProvider>;
  }
  return (
    <I18nProvider initialLocale={initialLocale}>
      <SiteSettingsProvider initialValue={settings}>
        <CartProvider>
          {pathname === "/" ? <Preloader /> : null}
          {pathname === "/" ? null : <SmoothScroll />}
          {pathname === "/" ? null : <SiteHeader />}
          {pathname === "/" ? (
            <>
              <FullPageController>{children}</FullPageController>
              <SiteFooter />
            </>
          ) : children}
          <CartDrawer />
          {pathname === "/" ? null : <SiteFooter />}
          {pathname === "/" ? null : <WhatsappFab />}
        </CartProvider>
      </SiteSettingsProvider>
    </I18nProvider>
  );
}
