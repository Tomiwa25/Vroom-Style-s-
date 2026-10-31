import { useEffect, type RefObject } from "react";

/**
 * Custom hook to detect clicks outside a referenced element and Escape key presses.
 * Used for accessible and seamless closing of dropdowns, popovers, and mega-menus.
 */
export const useClickOutside = (
  ref: RefObject<HTMLElement | null>,
  onClose: () => void,
  isActive = true
): void => {
  useEffect(() => {
    if (!isActive) return;

    const handleClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (ref.current && target && !ref.current.contains(target)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [ref, onClose, isActive]);
};
