"use client";

import { useEffect, useRef } from "react";

type HeroPointerGridProps = {
  className?: string;
};

export function HeroPointerGrid({ className }: HeroPointerGridProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const hero =
      overlay?.closest<HTMLElement>("[data-hero-pointer-root]") ??
      overlay?.parentElement;

    if (!overlay || !hero) return;

    const coarsePointer = window.matchMedia("(pointer: coarse)");
    if (coarsePointer.matches) {
      overlay.dataset.active = "false";
      return;
    }

    const previousPointerX = hero.style.getPropertyValue("--pointer-x");
    const previousPointerY = hero.style.getPropertyValue("--pointer-y");

    let animationFrame: number | null = null;
    let latestX = 0;
    let latestY = 0;
    let pointerInside = false;
    let inactivityTimer = 0;

    const hideGrid = () => {
      overlay.dataset.active = "false";
      window.clearTimeout(inactivityTimer);
    };

    const commitPointerPosition = () => {
      hero.style.setProperty("--pointer-x", `${latestX}px`);
      hero.style.setProperty("--pointer-y", `${latestY}px`);

      if (pointerInside) {
        overlay.dataset.active = "true";
        window.clearTimeout(inactivityTimer);
        inactivityTimer = window.setTimeout(hideGrid, 720);
      }
      animationFrame = null;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        pointerInside = false;
        hideGrid();
        return;
      }

      const bounds = hero.getBoundingClientRect();
      latestX = event.clientX - bounds.left;
      latestY = event.clientY - bounds.top;
      pointerInside = true;

      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(commitPointerPosition);
      }
    };

    const handlePointerLeave = () => {
      pointerInside = false;
      hideGrid();
    };

    hero.addEventListener("pointermove", handlePointerMove, { passive: true });
    hero.addEventListener("pointerleave", handlePointerLeave);
    hero.addEventListener("pointercancel", handlePointerLeave);
    window.addEventListener("blur", handlePointerLeave);

    return () => {
      hero.removeEventListener("pointermove", handlePointerMove);
      hero.removeEventListener("pointerleave", handlePointerLeave);
      hero.removeEventListener("pointercancel", handlePointerLeave);
      window.removeEventListener("blur", handlePointerLeave);
      window.clearTimeout(inactivityTimer);

      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }

      if (previousPointerX) {
        hero.style.setProperty("--pointer-x", previousPointerX);
      } else {
        hero.style.removeProperty("--pointer-x");
      }

      if (previousPointerY) {
        hero.style.setProperty("--pointer-y", previousPointerY);
      } else {
        hero.style.removeProperty("--pointer-y");
      }
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      className={className}
      data-active="false"
      aria-hidden="true"
    />
  );
}
