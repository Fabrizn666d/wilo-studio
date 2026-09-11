"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MessageCircle, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { primaryNav } from "@/lib/content";
import { Brand } from "./brand";
import { useSiteSettings } from "./site-settings-provider";
import { useCart } from "./cart-provider";
import { LanguageSwitcher } from "./language-switcher";
import { useI18n } from "./i18n-provider";
import { publicHref } from "@/lib/public-release";

const navKeys = ["nav.work", "nav.projects", "nav.services", "nav.about", "nav.ecosystem", "nav.contact"] as const;

export function SiteHeader() {
  const settings = useSiteSettings();
  const { t } = useI18n();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count, open: cartOpen, setOpen: setCartOpen } = useCart();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const menuTrigger = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => menuCloseRef.current?.focus());
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? [],
      ).filter((element) => element.tabIndex >= 0);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        event.preventDefault();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      menuTrigger?.focus();
    };
  }, [menuOpen]);

  const isActive = (href: string) => {
    if (href.includes("#")) return false;
    return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  };

  const releaseHref = (href: string) => {
    if (href === "/proyectos") return publicHref("projects", href);
    if (href === "/nosotros") return publicHref("about", href);
    if (href === "/contacto") return "/#contacto-home";
    return href;
  };

  return (
    <>
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`} data-i18n-manual>
        <div className="header-inner">
          <Brand />
          <nav className="desktop-nav" aria-label={t("a11y.mainNavigation")}>
            {primaryNav.map((item, index) => (
              <Link aria-current={isActive(item.href) ? "page" : undefined} key={item.href} className={isActive(item.href) ? "is-active" : ""} href={releaseHref(item.href)}>
                {t(navKeys[index])}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <LanguageSwitcher compact />
            <button aria-controls="cart-drawer" aria-expanded={cartOpen} className="icon-button cart-button" type="button" onClick={() => setCartOpen(true)} aria-label={t("a11y.openCart", { count })}>
              <ShoppingBag size={20} />
              {count > 0 && <span>{count}</span>}
            </button>
            <Link className="button button-dark header-quote" href={publicHref("quote", "/cotizar")}>
              <MessageCircle size={18} /> {t("nav.quote")}
            </Link>
            <button aria-controls="mobile-navigation" aria-expanded={menuOpen} className="icon-button menu-button" type="button" onClick={() => setMenuOpen(true)} aria-label={t("a11y.openMenu")} ref={menuButtonRef}>
              <Menu size={23} />
            </button>
          </div>
        </div>
      </header>

      <div aria-hidden={!menuOpen} aria-label={t("a11y.mobileNavigation")} aria-modal="true" className={`mobile-menu ${menuOpen ? "is-open" : ""}`} data-i18n-manual id="mobile-navigation" inert={!menuOpen} ref={menuRef} role="dialog">
        <div className="mobile-menu-head">
          <Brand inverted />
          <button className="icon-button light" type="button" onClick={() => setMenuOpen(false)} aria-label={t("a11y.closeMenu")} ref={menuCloseRef}><X /></button>
        </div>
        <nav aria-label={t("a11y.mobileNavigation")}>
          <Link aria-current={pathname === "/" ? "page" : undefined} href="/">{t("nav.home")}</Link>
          {primaryNav.map((item, index) => <Link aria-current={isActive(item.href) ? "page" : undefined} key={item.href} href={releaseHref(item.href)}><span>0{index + 1}</span>{t(navKeys[index])}</Link>)}
          <Link aria-current={pathname === "/contacto" ? "page" : undefined} href="/#contacto-home"><span>07</span>{t("nav.contact")}</Link>
        </nav>
        <a className="button button-yellow" href={settings.whatsapp} target="_blank" rel="noreferrer">{t("nav.whatsapp")}</a>
      </div>
    </>
  );
}
