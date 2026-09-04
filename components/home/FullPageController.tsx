"use client";

import {
  createContext,
  type ComponentPropsWithoutRef,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import styles from "./full-page-controller.module.css";

const SECTION_SELECTOR = "[data-fullpage-section]";
const DESKTOP_QUERY = "(min-width: 1024px) and (pointer: fine)";
const WHEEL_THRESHOLD = 72;
const TRANSITION_MS = 1480;
const REDUCED_TRANSITION_MS = 520;
const COOLDOWN_MS = 220;
const ACCUMULATOR_RESET_MS = 900;

type FullPageContextValue = {
  activeIndex: number;
  enabled: boolean;
  goToSection: (target: number | string, historyMode?: "push" | "replace" | "none") => void;
};

const FullPageContext = createContext<FullPageContextValue>({
  activeIndex: 0,
  enabled: false,
  goToSection: () => undefined,
});

function getSections() {
  return Array.from(document.querySelectorAll<HTMLElement>(SECTION_SELECTOR));
}

function sectionId(section: HTMLElement) {
  return section.id || section.dataset.fullpageId || "";
}

function easeInOutSine(progress: number) {
  return -(Math.cos(Math.PI * progress) - 1) / 2;
}

function normalizeWheelDelta(event: WheelEvent) {
  const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE
    ? 16
    : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
      ? window.innerHeight
      : 1;
  return { x: event.deltaX * unit, y: event.deltaY * unit };
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("input, textarea, select, [contenteditable='true'], [contenteditable='']"));
}

function hasOpenOverlay() {
  return Boolean(document.querySelector(
    "dialog[open], [role='dialog'][aria-modal='true']:not([aria-hidden='true']), [data-modal-open='true']",
  ));
}

function canScrollWithin(target: EventTarget | null, direction: number) {
  if (!(target instanceof HTMLElement)) return false;
  let element: HTMLElement | null = target;

  while (element && element !== document.body) {
    const style = window.getComputedStyle(element);
    const canOverflow = /(auto|scroll)/.test(style.overflowY);
    if (canOverflow && element.scrollHeight > element.clientHeight + 2) {
      const atStart = element.scrollTop <= 1;
      const atEnd = element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
      if ((direction < 0 && !atStart) || (direction > 0 && !atEnd)) return true;
    }
    element = element.parentElement;
  }
  return false;
}

function isHomeHashLink(anchor: HTMLAnchorElement) {
  const url = new URL(anchor.href, window.location.href);
  return url.origin === window.location.origin
    && url.pathname.replace(/\/$/, "") === window.location.pathname.replace(/\/$/, "")
    && Boolean(url.hash);
}

export function FullPageController({ children }: { children: ReactNode }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const desktopMedia = window.matchMedia(DESKTOP_QUERY);
    const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.documentElement;
    let desktopEnabled = desktopMedia.matches;
    let currentIndex = 0;
    let animationFrame = 0;
    let animationTimer = 0;
    let resizeTimer = 0;
    let accumulator = 0;
    let accumulatorDirection = 0;
    let lastWheelAt = 0;
    let lockedUntil = 0;
    let animating = false;
    let observer: IntersectionObserver | null = null;
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    const updateMode = () => {
      desktopEnabled = desktopMedia.matches;
      root.classList.toggle("wilo-fullpage", desktopEnabled);
      root.classList.toggle("wilo-native-sections", !desktopEnabled);
      root.style.setProperty("--wilo-home-header-height", desktopEnabled ? "72px" : "0px");
      setEnabled(desktopEnabled);
      accumulator = 0;
      accumulatorDirection = 0;
    };

    const targetTop = (section: HTMLElement, index: number) => {
      const absoluteTop = section.getBoundingClientRect().top + window.scrollY;
      const headerOffset = index === 0 ? 0 : 72;
      return Math.max(0, Math.round(absoluteTop - headerOffset));
    };

    const setActive = (index: number) => {
      const sections = getSections();
      if (!sections[index]) return;
      currentIndex = index;
      setActiveIndex(index);
      sections.forEach((section, sectionIndex) => {
        section.dataset.fullpageActive = String(sectionIndex === index);
      });
      window.dispatchEvent(new CustomEvent("wilo:fullpagechange", {
        detail: { id: sectionId(sections[index]), index },
      }));
    };

    const updateHistory = (section: HTMLElement, mode: "push" | "replace" | "none") => {
      if (mode === "none") return;
      const id = sectionId(section);
      const nextUrl = id && id !== "inicio"
        ? `${window.location.pathname}${window.location.search}#${id}`
        : `${window.location.pathname}${window.location.search}`;
      window.history[mode === "push" ? "pushState" : "replaceState"]({}, "", nextUrl);
    };

    const goTo = (target: number | string, mode: "push" | "replace" | "none" = "replace") => {
      const sections = getSections();
      const requestedIndex = typeof target === "number"
        ? target
        : sections.findIndex((section) => sectionId(section) === target.replace(/^#/, ""));
      const nextIndex = Math.max(0, Math.min(sections.length - 1, requestedIndex));
      const section = sections[nextIndex];
      if (!section || requestedIndex < 0) return;

      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(animationTimer);
      const start = window.scrollY;
      const destination = targetTop(section, nextIndex);
      const distance = destination - start;
      const reducedMotion = reducedMotionMedia.matches;
      const duration = reducedMotion ? REDUCED_TRANSITION_MS : TRANSITION_MS;
      const startedAt = performance.now();
      animating = true;
      lockedUntil = startedAt + duration + COOLDOWN_MS;
      accumulator = 0;
      accumulatorDirection = 0;
      setActive(nextIndex);
      updateHistory(section, mode);

      if (Math.abs(distance) < 2) {
        window.scrollTo(0, destination);
        animating = false;
        return;
      }

      const tick = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        window.scrollTo(0, start + distance * easeInOutSine(progress));
        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(tick);
          return;
        }
        window.scrollTo(0, targetTop(section, nextIndex));
        window.clearTimeout(animationTimer);
        animating = false;
      };
      animationFrame = window.requestAnimationFrame(tick);
      animationTimer = window.setTimeout(() => {
        window.cancelAnimationFrame(animationFrame);
        window.scrollTo(0, targetTop(section, nextIndex));
        animating = false;
      }, duration + 50);
    };

    const nearestSectionIndex = () => {
      const sections = getSections();
      let nearest = 0;
      let smallestDistance = Number.POSITIVE_INFINITY;
      sections.forEach((section, index) => {
        const distance = Math.abs(window.scrollY - targetTop(section, index));
        if (distance < smallestDistance) {
          smallestDistance = distance;
          nearest = index;
        }
      });
      return nearest;
    };

    const onWheel = (event: WheelEvent) => {
      if (!desktopEnabled || hasOpenOverlay() || root.classList.contains("is-wilo-loading")) return;
      const delta = normalizeWheelDelta(event);
      if (Math.abs(delta.x) > Math.abs(delta.y)) {
        event.preventDefault();
        const horizontalScroller = event.target instanceof HTMLElement
          ? event.target.closest<HTMLElement>("[data-horizontal-scroll]")
          : null;
        if (horizontalScroller) horizontalScroller.scrollLeft += delta.x;
        return;
      }
      if (Math.abs(delta.y) < 0.1) return;
      const direction = Math.sign(delta.y);
      if (canScrollWithin(event.target, direction)) return;

      const sections = getSections();
      const baseIndex = animating ? currentIndex : nearestSectionIndex();
      const nextIndex = baseIndex + direction;
      if (nextIndex < 0 || nextIndex >= sections.length) return;

      event.preventDefault();
      const now = performance.now();
      if (animating || now < lockedUntil) {
        // Keep inertial wheel tails from skipping a second scene, while still
        // accepting a new deliberate gesture after a short quiet period.
        lockedUntil = Math.max(lockedUntil, now + COOLDOWN_MS);
        return;
      }
      if (now - lastWheelAt > ACCUMULATOR_RESET_MS || direction !== accumulatorDirection) accumulator = 0;
      lastWheelAt = now;
      accumulatorDirection = direction;
      accumulator += Math.abs(delta.y);
      if (accumulator < WHEEL_THRESHOLD) return;
      goTo(nextIndex, "replace");
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!desktopEnabled || event.defaultPrevented || hasOpenOverlay() || isEditableTarget(event.target)) return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (event.key === " " && target?.closest("a, button, [role='button']")) return;
      let nextIndex: number | null = null;
      if (["ArrowDown", "PageDown", " "].includes(event.key)) nextIndex = currentIndex + 1;
      if (["ArrowUp", "PageUp"].includes(event.key)) nextIndex = currentIndex - 1;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = getSections().length - 1;
      if (nextIndex === null || nextIndex < 0 || nextIndex >= getSections().length) return;
      event.preventDefault();
      if (!animating && performance.now() >= lockedUntil) goTo(nextIndex, "replace");
    };

    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!anchor || !isHomeHashLink(anchor)) return;
      const id = new URL(anchor.href, window.location.href).hash.slice(1);
      if (!getSections().some((section) => sectionId(section) === id)) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      goTo(id, "push");
    };

    const onHistoryNavigation = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      goTo(id || 0, "none");
    };

    const onControllerRequest = (event: Event) => {
      const request = (event as CustomEvent<{ target: number | string; mode: "push" | "replace" | "none" }>).detail;
      if (request) goTo(request.target, request.mode);
    };

    const connectObserver = () => {
      observer?.disconnect();
      observer = new IntersectionObserver((entries) => {
        if (animating) return;
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = getSections().indexOf(visible.target as HTMLElement);
        if (index >= 0 && index !== currentIndex) {
          setActive(index);
          if (desktopEnabled) updateHistory(visible.target as HTMLElement, "replace");
        }
      }, { rootMargin: desktopEnabled ? "-72px 0px -28% 0px" : "0px", threshold: [0.2, 0.4, 0.6, 0.8] });
      getSections().forEach((section) => observer?.observe(section));
    };

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        updateMode();
        connectObserver();
        const index = Math.min(currentIndex, getSections().length - 1);
        if (desktopEnabled && index >= 0) window.scrollTo(0, targetTop(getSections()[index], index));
      }, 180);
    };

    updateMode();
    connectObserver();
    const initialId = decodeURIComponent(window.location.hash.slice(1));
    const initialIndex = initialId
      ? getSections().findIndex((section) => sectionId(section) === initialId)
      : nearestSectionIndex();
    setActive(Math.max(0, initialIndex));
    if (initialId && initialIndex >= 0) requestAnimationFrame(() => window.scrollTo(0, targetTop(getSections()[initialIndex], initialIndex)));

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("popstate", onHistoryNavigation);
    window.addEventListener("hashchange", onHistoryNavigation);
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });
    window.addEventListener("wilo:fullpage-request", onControllerRequest);
    document.addEventListener("click", onDocumentClick, true);
    desktopMedia.addEventListener("change", onResize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(animationTimer);
      window.clearTimeout(resizeTimer);
      observer?.disconnect();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("popstate", onHistoryNavigation);
      window.removeEventListener("hashchange", onHistoryNavigation);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.removeEventListener("wilo:fullpage-request", onControllerRequest);
      document.removeEventListener("click", onDocumentClick, true);
      desktopMedia.removeEventListener("change", onResize);
      root.classList.remove("wilo-fullpage", "wilo-native-sections");
      root.style.removeProperty("--wilo-home-header-height");
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  const value = useMemo<FullPageContextValue>(() => ({
    activeIndex,
    enabled,
    goToSection: (target, mode = "push") => window.dispatchEvent(new CustomEvent("wilo:fullpage-request", {
      detail: { target, mode },
    })),
  }), [activeIndex, enabled]);

  return <FullPageContext.Provider value={value}>{children}</FullPageContext.Provider>;
}

export function useFullPageController() {
  return useContext(FullPageContext);
}

type FullPageSectionProps = ComponentPropsWithoutRef<"section">;

export function FullPageSection({ className, ...props }: FullPageSectionProps) {
  return <section className={`${styles.section} ${className ?? ""}`} data-fullpage-section="" {...props} />;
}
