"use client";

import Image from "next/image";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { getLocaleOption, localeOptions, type Locale } from "@/lib/i18n";
import { useI18n } from "./i18n-provider";
import styles from "./language-switcher.module.css";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const current = getLocaleOption(locale);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function choose(nextLocale: Locale) {
    setLocale(nextLocale);
    const next = getLocaleOption(nextLocale);
    setAnnouncement(t("language.changed", { language: next.label }));
    setOpen(false);
  }

  return (
    <div className={styles.switcher} data-compact={compact || undefined} ref={rootRef}>
      <button className={styles.trigger} type="button" aria-label={t("a11y.language")} aria-controls={menuId} aria-expanded={open} aria-haspopup="listbox" onClick={() => setOpen((value) => !value)}>
        <Image className={styles.flag} src={current.flag} alt="" width={24} height={16} aria-hidden="true" />
        <span>{current.shortLabel}</span>
        <ChevronDown className={styles.chevron} aria-hidden="true" />
      </button>
      <div className={`${styles.menu} ${open ? styles.menuOpen : ""}`} id={menuId} role="listbox" aria-label={t("a11y.language")} aria-hidden={!open}>
        {localeOptions.map((option) => (
          <button className={`${styles.option} ${option.code === locale ? styles.optionActive : ""}`} key={option.code} type="button" role="option" aria-selected={option.code === locale} tabIndex={open ? 0 : -1} onClick={() => choose(option.code)}>
            <Image className={styles.flag} src={option.flag} alt="" width={24} height={16} aria-hidden="true" />
            <span>{option.label}</span>
            {option.code === locale ? <Check className={styles.check} aria-hidden="true" /> : <span className={styles.optionCode}>{option.shortLabel}</span>}
          </button>
        ))}
      </div>
      <span className={styles.live} aria-live="polite">{announcement}</span>
    </div>
  );
}
