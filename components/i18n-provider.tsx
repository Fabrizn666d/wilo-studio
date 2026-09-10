"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getLocaleOption, isLocale, localeCookieName, translate, type Locale, type MessageKey } from "@/lib/i18n";
import { getContentDictionary } from "@/lib/i18n-content";

type I18nValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, values?: Record<string, string | number>) => string;
  formatCurrency: (amount: number, currency?: string) => string;
};

const I18nContext = createContext<I18nValue | null>(null);
const textSources = new WeakMap<Text, string>();
const expectedText = new WeakMap<Text, string>();
const attributeSources = new WeakMap<Element, Map<string, string>>();
const expectedAttributes = new WeakMap<Element, Map<string, string>>();
const translatedAttributes = ["placeholder", "aria-label", "title", "alt"] as const;

function normalizeSource(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function shouldSkip(node: Node) {
  const parent = node instanceof Element ? node : node.parentElement;
  return !parent || Boolean(parent.closest("script, style, noscript, [data-no-i18n], [data-i18n-manual], [data-i18n-message]"));
}

function translateTextNode(node: Text, dictionary: Record<string, string>) {
  if (shouldSkip(node)) return;
  const current = node.nodeValue ?? "";
  let source = textSources.get(node);
  const expected = expectedText.get(node);
  if (!source || (expected !== undefined && current !== expected)) {
    source = current;
    textSources.set(node, source);
  }
  const key = normalizeSource(source);
  if (!key) return;
  const translated = dictionary[key] ?? key;
  const leading = source.match(/^\s*/)?.[0] ?? "";
  const trailing = source.match(/\s*$/)?.[0] ?? "";
  const next = `${leading}${translated}${trailing}`;
  expectedText.set(node, next);
  if (current !== next) node.nodeValue = next;
}

function translateElementAttributes(element: Element, dictionary: Record<string, string>) {
  if (shouldSkip(element)) return;
  const sources = attributeSources.get(element) ?? new Map<string, string>();
  const expected = expectedAttributes.get(element) ?? new Map<string, string>();
  for (const attribute of translatedAttributes) {
    const current = element.getAttribute(attribute);
    if (!current) continue;
    const previousExpected = expected.get(attribute);
    if (!sources.has(attribute) || (previousExpected !== undefined && current !== previousExpected)) sources.set(attribute, current);
    const source = sources.get(attribute) ?? current;
    const translated = dictionary[normalizeSource(source)] ?? source;
    expected.set(attribute, translated);
    if (current !== translated) element.setAttribute(attribute, translated);
  }
  attributeSources.set(element, sources);
  expectedAttributes.set(element, expected);
}

function translateTree(root: Node, dictionary: Record<string, string>) {
  if (root instanceof Text) {
    translateTextNode(root, dictionary);
    return;
  }
  if (root instanceof Element) translateElementAttributes(root, dictionary);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node instanceof Text) translateTextNode(node, dictionary);
    else if (node instanceof Element) translateElementAttributes(node, dictionary);
  }
}

export function I18nProvider({ children, initialLocale }: { children: React.ReactNode; initialLocale: Locale }) {
  const [locale, updateLocale] = useState<Locale>(initialLocale);

  useEffect(() => {
    const storedLocale = window.localStorage.getItem(localeCookieName);
    if (isLocale(storedLocale)) updateLocale((currentLocale) => storedLocale === currentLocale ? currentLocale : storedLocale);
  }, []); // The persisted browser preference intentionally wins after hydration.

  useEffect(() => {
    const option = getLocaleOption(locale);
    document.documentElement.lang = option.htmlLang;
    document.documentElement.dataset.locale = locale;
    window.localStorage.setItem(localeCookieName, locale);
    document.cookie = `${localeCookieName}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent("wilo:localechange", { detail: { locale } }));
  }, [locale]);

  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) return;
    let cancelled = false;
    let observer: MutationObserver | undefined;
    void getContentDictionary(locale).then((dictionary) => {
      if (cancelled) return;
      document.querySelectorAll<HTMLElement>("[data-i18n-message]").forEach((element) => {
        const key = element.dataset.i18nMessage as MessageKey | undefined;
        if (key) element.textContent = translate(locale, key);
      });
      translateTree(document.body, dictionary);
      observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "characterData") translateTextNode(mutation.target as Text, dictionary);
          else if (mutation.type === "attributes") translateElementAttributes(mutation.target as Element, dictionary);
          else for (const node of mutation.addedNodes) translateTree(node, dictionary);
        }
      });
      observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...translatedAttributes] });
    });
    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => updateLocale(nextLocale), []);
  const t = useCallback((key: MessageKey, values?: Record<string, string | number>) => translate(locale, key, values), [locale]);
  const formatCurrency = useCallback((amount: number, currency = "PEN") => new Intl.NumberFormat(getLocaleOption(locale).numberLocale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount), [locale]);

  const value = useMemo(() => ({ locale, setLocale, t, formatCurrency }), [formatCurrency, locale, setLocale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n debe usarse dentro de I18nProvider");
  return context;
}
