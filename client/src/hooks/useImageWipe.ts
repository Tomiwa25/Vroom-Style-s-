import { useCallback, useRef } from "react";

/**
 * Garment-style image swap.
 *
 * When a card swaps photography — hover angle, size change, colour change —
 * the outgoing image drops away first and the incoming one wipes in from the
 * left. React cannot animate a src change on its own, so the hook holds the
 * swap for one beat and reports back once it is safe to change the source.
 *
 * Honours prefers-reduced-motion: the swap is instant for those users.
 */
export function useImageWipe<T extends HTMLElement>(holdMs = 120) {
  const frameRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elRef = useRef<T | null>(null);

  const ref = useCallback((node: T | null) => {
    elRef.current = node;
  }, []);

  const wipe = useCallback(
    (swap: () => void) => {
      const el = elRef.current;
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

      if (!el || reduce) {
        swap();
        return;
      }

      if (timerRef.current) clearTimeout(timerRef.current);

      el.classList.add("is-swapping");

      timerRef.current = setTimeout(() => {
        swap();
        frameRef.current = requestAnimationFrame(() => {
          el.classList.remove("is-swapping");
          el.classList.add("is-wiping");
          timerRef.current = setTimeout(() => {
            el.classList.remove("is-wiping");
          }, 560);
        });
      }, holdMs);
    },
    [holdMs]
  );

  return { ref, wipe };
}
