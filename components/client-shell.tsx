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
import { FullPageController, FullPageSection } from "./home/FullPageController";
import fullPageStyles from "./home/full-page-controller.module.css";
import type { PublicSiteSettings } from "@/lib/site-settings";

export function ClientShell({ children, settings }: { children: React.ReactNode; settings: PublicSiteSettings }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return <SiteSettingsProvider initialValue={settings}>{children}</SiteSettingsProvider>;
  }
  return (
    <SiteSettingsProvider initialValue={settings}>
      <CartProvider>
        {pathname === "/" ? <Preloader /> : null}
        {pathname === "/" ? null : <SmoothScroll />}
        {pathname === "/" ? null : <SiteHeader />}
        {pathname === "/" ? (
          <FullPageController>
            {children}
            <FullPageSection className={fullPageStyles.footerSection} id="pie-de-pagina" aria-label="Pie de pÃ¡gina">
              <SiteFooter />
            </FullPageSection>
          </FullPageController>
        ) : children}
        <CartDrawer />
        {pathname === "/" ? null : <SiteFooter />}
        {pathname === "/" ? null : <WhatsappFab />}
      </CartProvider>
    </SiteSettingsProvider>
  );
}
