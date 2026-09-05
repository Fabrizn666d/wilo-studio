"use client";

import { useEffect } from "react";
import "./home-scenes.css";

/** Internal scene motion only. FullPageController remains the sole scroll owner. */
export function HomeSceneMotion() {
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let dispose = () => {};
    const connect = () => {
      dispose();
      if (preference.matches) return;
      const sections = [...document.querySelectorAll<HTMLElement>("main > [data-fullpage-section]:not([data-fullpage-section='hero'])")];
      const animations = new Set<Animation>();
      const visited = new Set<HTMLElement>();
      const targets = new Map<HTMLElement, HTMLElement[]>();
      let pointerFrame = 0;
      let currentMedia: HTMLElement[] = [];
      sections.forEach(section => {
        const elements = [...section.querySelectorAll<HTMLElement>("[data-reveal]")].filter(element => !element.parentElement?.closest("[data-reveal]"));
        targets.set(section, elements);
        elements.forEach(element => { element.style.opacity = "0"; });
      });
      const reveal = (section: HTMLElement) => {
        if (visited.has(section)) return;
        visited.add(section);
        (targets.get(section) || []).forEach((element, index) => {
          const isMedia = element.dataset.reveal === "media";
          const animation = element.animate([
            { opacity: 0, translate: isMedia ? "0 16px" : "0 28px", scale: isMedia ? ".985" : "1" },
            { opacity: 1, translate: "0 0", scale: "1" },
          ], { duration: isMedia ? 950 : 800, delay: Math.min(index, 7) * 80, easing: "cubic-bezier(.16,1,.3,1)", fill: "both" });
          animations.add(animation);
          animation.finished.then(() => {
            element.style.removeProperty("opacity");
            animation.cancel();
            animations.delete(animation);
          }).catch(() => {});
        });
      };
      // One shared observer also supports native-scroll tablets and tall mobile sections.
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const section = entry.target as HTMLElement;
          section.dataset.sceneVisible = String(entry.isIntersecting);
          if (entry.isIntersecting) reveal(section);
        });
      }, { threshold: .12 });
      sections.forEach(section => observer.observe(section));
      const resetMedia = () => currentMedia.forEach(element => element.style.removeProperty("translate"));
      const onPointer = (event: PointerEvent) => {
        if (event.pointerType !== "mouse" || !matchMedia("(pointer: fine)").matches) return;
        const section = (event.target as Element | null)?.closest<HTMLElement>("main > [data-fullpage-section]:not([data-fullpage-section='hero'])");
        cancelAnimationFrame(pointerFrame);
        pointerFrame = requestAnimationFrame(() => {
          resetMedia();
          if (!section) { currentMedia = []; return; }
          const rect = section.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - .5;
          const y = (event.clientY - rect.top) / rect.height - .5;
          currentMedia = [...section.querySelectorAll<HTMLElement>("[data-parallax]")];
          currentMedia.forEach(element => {
            const range = Math.max(0, Math.min(20, Number(element.dataset.parallax) || 8));
            element.style.translate = `${(x * range).toFixed(2)}px ${(y * range).toFixed(2)}px`;
          });
        });
      };
      document.addEventListener("pointermove", onPointer, { passive: true });
      document.addEventListener("pointerleave", resetMedia);
      dispose = () => {
        observer.disconnect();
        sections.forEach(section => delete section.dataset.sceneVisible);
        animations.forEach(animation => animation.cancel());
        targets.forEach(elements => elements.forEach(element => element.style.removeProperty("opacity")));
        cancelAnimationFrame(pointerFrame);
        resetMedia();
        document.removeEventListener("pointermove", onPointer);
        document.removeEventListener("pointerleave", resetMedia);
      };
    };
    connect();
    preference.addEventListener("change", connect);
    return () => { dispose(); preference.removeEventListener("change", connect); };
  }, []);
  return null;
}
