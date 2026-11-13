import { useEffect } from "react";

/**
 * Scroll reveal.
 *
 * Adds `is-revealed` to every `[data-reveal]` element the first time it enters
 * the viewport, which the stylesheet turns into a mask-style rise. One shared
 * IntersectionObserver for the whole page, unobserving each element after it
 * fires so long catalog pages do not accumulate observers.
 *
 * Elements above the fold are revealed immediately — the largest contentful
 * paint is never started from an invisible state.
 */
export function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed)")
    );
    if (nodes.length === 0) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      nodes.forEach((node) => node.classList.add("is-revealed"));
      return;
    }

    const viewportH = window.innerHeight;
    const pending: HTMLElement[] = [];

    nodes.forEach((node) => {
      if (node.getBoundingClientRect().top < viewportH * 0.92) {
        node.classList.add("is-revealed");
      } else {
        pending.push(node);
      }
    });

    if (pending.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );

    pending.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
