import React, { useEffect, useRef, useState, useCallback } from "react";
import type { Product } from "../types";
import {
  px,
  CUTS,
  SHEETS,
  LOOKS,
  money,
  pad,
  wrapAngle,
  shortest,
} from "../data/circleLooks";
import "../circle-lookbook.css";

export interface CircleLookbookProps {
  onAddToCart?: (product: Product, size?: string, color?: string, quantity?: number) => void;
  onExploreCatalog?: () => void;
  cartCount?: number;
  onOpenCart?: () => void;
  isStandalone?: boolean;
  onClose?: () => void;
}

export const CircleLookbook: React.FC<CircleLookbookProps> = ({
  onAddToCart,
  cartCount = 0,
  onOpenCart,
  onClose,
}) => {
  const [active, setActiveIndex] = useState(0);
  const [isGrid, setIsGrid] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFocusOpen, setIsFocusOpen] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [liveText, setLiveText] = useState("Look 1: Somewhere Else");
  const [toastMsg, setToastMsg] = useState("");
  const [isToastActive, setIsToastActive] = useState(false);
  const [clockTime, setClockTime] = useState("06:00");
  const [tallyBump, setTallyBump] = useState(false);

  // Cart state per look and item
  const [cartState, setCartState] = useState(() =>
    LOOKS.map((look) =>
      look.items.map((item) => ({
        added: false,
        size: item.sizes.length > 1 ? item.sizes[1] : item.sizes[0],
        touched: item.sizes.length === 1,
      }))
    )
  );

  const [activePickingLines, setActivePickingLines] = useState<Record<number, boolean>>({});
  const [slipMessage, setSlipMessage] = useState("");

  const deckRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const crowdRef = useRef<HTMLDivElement>(null);
  const loopRingRef = useRef<HTMLSpanElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const focusStageRef = useRef<HTMLDivElement>(null);
  const focusModelRef = useRef<HTMLDivElement | null>(null);
  const followRef = useRef<HTMLSpanElement>(null);
  const qrRef = useRef<SVGSVGElement>(null);

  // Physics animation state
  const physicsRef = useRef({
    pos: -1.15,
    goal: 0,
    vel: 0,
    rafId: null as number | null,
    lastTime: null as number | null,
    stageVisible: true,
    isDragging: false,
    dirty: true,
  });

  const dragRef = useRef({
    pointerId: null as number | null,
    startX: 0,
    startY: 0,
    startGoal: 0,
    trail: [] as { x: number; t: number }[],
    wasDragging: false,
    intentChecked: false,
  });

  const wheelLockRef = useRef(false);
  const wheelSumRef = useRef(0);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slipHoverRef = useRef(false);

  // Live Clock
  useEffect(() => {
    const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" });
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setClockTime(timeFormatter.format(new Date()));
      const nextMs = 60000 - (Date.now() % 60000) + 50;
      timer = setTimeout(tick, nextMs);
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  // Draw Decorative QR Code
  useEffect(() => {
    if (!qrRef.current) return;
    let d = "";
    const finders: [number, number][] = [[0, 0], [18, 0], [0, 18]];
    finders.forEach(([ox, oy]) => {
      for (let dy = 0; dy < 7; dy++) {
        for (let dx = 0; dx < 7; dx++) {
          const isBorder = dx === 0 || dx === 6 || dy === 0 || dy === 6;
          const isCore = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
          if (isBorder || isCore) {
            d += `M${ox + dx} ${oy + dy}h1v1h-1z`;
          }
        }
      }
    });
    let seed = 7;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let y = 0; y < 25; y++) {
      for (let x = 0; x < 25; x++) {
        const inZone = (x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16);
        if (!inZone && rnd() > 0.52) {
          d += `M${x} ${y}h1v1h-1z`;
        }
      }
    }
    qrRef.current.innerHTML = `<path fill="currentColor" d="${d}"/>`;
  }, []);

  const triggerToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setIsToastActive(true);
    setTimeout(() => setIsToastActive(false), 2500);
  }, []);

  // Stop Autoplay helper
  const stopAuto = useCallback(() => {
    setIsAutoplay(false);
  }, []);

  // Layout Placement Logic
  const placeBody = useCallback((b: HTMLElement, x: number, y: number, s: number, op: number, blur: number, z: number, stageH: number, stageW: number, modelH: number) => {
    const w = modelH * 4 / 7;
    if (x + w * s * 0.5 < -4 || x - w * s * 0.5 > stageW + 4) {
      op = 0;
    }
    b.style.transform = `translate3d(${x.toFixed(1)}px, ${(y - stageH).toFixed(1)}px, 0) translateX(-50%) scale(${s.toFixed(4)})`;
    b.style.opacity = op.toFixed(3);
    b.style.visibility = op < 0.01 ? "hidden" : "visible";
    b.style.pointerEvents = op < 0.5 ? "none" : "auto";
    b.style.filter = blur > 0.05 ? `blur(${blur.toFixed(1)}px)` : "none";
    b.style.zIndex = String(z);
  }, []);

  const layoutRing = useCallback(() => {
    if (isGrid || !stageRef.current || !crowdRef.current) return;
    const stage = stageRef.current;
    const stageW = stage.clientWidth;
    const stageH = stage.clientHeight;
    const mobile = window.innerWidth < 810;
    const bottomPad = mobile ? 168 : 120;
    const topPad = 136;
    const modelH = Math.max(200, Math.round((stageH - bottomPad - 18 - topPad) / 1.12));
    stage.style.setProperty("--model-h", `${modelH}px`);

    const STEP = (2 * Math.PI) / 9;
    const cx = stageW * 0.5;
    const cy = topPad + (stageH - topPad - bottomPad) * 0.5 + 6;
    const ry = (stageH - topPad - bottomPad) * (mobile ? 0.34 : 0.37);
    const rx = Math.min(stageW * (mobile ? 0.3 : 0.28), ry * (mobile ? 1.15 : 1.7));
    const frontH = stageH * (mobile ? 0.19 : 0.255);
    const front = frontH / modelH;

    stage.style.setProperty("--loop-y", `${cy - frontH * 0.5 - 6}px`);
    stage.style.setProperty("--ring-y", `${cy}px`);
    if (loopRingRef.current) {
      loopRingRef.current.style.width = `${2 * rx}px`;
      loopRingRef.current.style.height = `${2 * ry}px`;
    }

    const bodies = Array.from(crowdRef.current.children) as HTMLElement[];
    const pos = physicsRef.current.pos;

    for (let i = 0; i < 9; i++) {
      if (!bodies[i]) continue;
      const a = wrapAngle((i - pos) * STEP);
      const depth = (1 + Math.cos(a)) / 2;
      const dist = Math.abs(a) / STEP;
      const near = Math.max(0, Math.min(1, 1 - dist));
      const s = front * (0.5 + 0.5 * depth) * (1 + 0.14 * near);
      const x = cx + rx * Math.sin(a);
      const y = cy + ry * Math.cos(a) + modelH * s * 0.08;
      const blur = Math.max(0, (1 - depth) * 2.2 - 0.3);
      const z = Math.round(depth * 1000) + 10;
      placeBody(bodies[i], x, y, s, 1, blur, z, stageH, stageW, modelH);
    }
  }, [isGrid, placeBody]);

  const layoutGrid = useCallback(() => {
    if (!stageRef.current || !crowdRef.current || !labelsRef.current) return;
    const stage = stageRef.current;
    const stageW = stage.clientWidth;
    const stageH = stage.clientHeight;
    const mobile = window.innerWidth < 810;
    const top = mobile ? 72 : 80;
    const rowH = (stageH - (mobile ? 104 : 96) - top) / 3;
    const colW = stageW / 3;
    const modelH = Math.max(200, Math.round((stageH - (mobile ? 168 : 120) - 18 - 136) / 1.12));
    const s = Math.min(rowH - 40, colW * (7 / 4) * 0.92) / modelH;

    const bodies = Array.from(crowdRef.current.children) as HTMLElement[];
    const labels = Array.from(labelsRef.current.children) as HTMLElement[];

    for (let i = 0; i < 9; i++) {
      if (!bodies[i]) continue;
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = colW * (col + 0.5);
      const y = top + rowH * (row + 1) - 32;
      placeBody(bodies[i], x, y, s, 1, 0, 10 + row, stageH, stageW, modelH);
      if (labels[i]) {
        labels[i].style.transform = `translate3d(${x.toFixed(1)}px, ${(y + 12).toFixed(1)}px, 0) translateX(-50%)`;
      }
    }
  }, [placeBody]);

  // Physics animation loop
  const kickPhysics = useCallback(() => {
    if (physicsRef.current.rafId || !physicsRef.current.stageVisible) return;

    const STIFF = 95;
    const DAMP = 2 * Math.sqrt(95);

    const tick = (t: number) => {
      const p = physicsRef.current;
      const dt = p.lastTime ? Math.min(0.034, (t - p.lastTime) / 1000) : 1 / 60;
      p.lastTime = t;

      const h = dt / 3;
      for (let step = 0; step < 3; step++) {
        const acc = -STIFF * (p.pos - p.goal) - DAMP * p.vel;
        p.vel += acc * h;
        p.pos += p.vel * h;
      }
      if (Math.abs(p.pos - p.goal) <= 5e-4 && Math.abs(p.vel) <= 5e-4) {
        p.pos = p.goal;
        p.vel = 0;
      }

      const moving = p.pos !== p.goal || p.vel !== 0;
      if (moving || p.dirty || p.isDragging) {
        layoutRing();
        p.dirty = false;
      }

      if (deckRef.current) {
        deckRef.current.classList.toggle("is-moving", moving || p.isDragging);
      }

      if (moving || p.isDragging) {
        p.rafId = requestAnimationFrame(tick);
      } else {
        p.rafId = null;
        p.lastTime = null;
      }
    };

    physicsRef.current.lastTime = null;
    physicsRef.current.rafId = requestAnimationFrame(tick);
  }, [layoutRing]);

  // Navigation helpers
  const goTo = useCallback((g: number) => {
    physicsRef.current.goal = g;
    const newIdx = ((Math.round(g) % 9) + 9) % 9;
    setActiveIndex(newIdx);
    setLiveText(`Look ${newIdx + 1}: ${LOOKS[newIdx].name}`);
    kickPhysics();
  }, [kickPhysics]);

  const nextLook = useCallback(() => {
    goTo(Math.round(physicsRef.current.goal) + 1);
  }, [goTo]);

  const prevLook = useCallback(() => {
    goTo(Math.round(physicsRef.current.goal) - 1);
  }, [goTo]);

  const jumpToLook = useCallback((i: number) => {
    goTo(Math.round(physicsRef.current.goal) + shortest(i, active));
  }, [goTo, active]);

  // Autoplay loop
  useEffect(() => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    if (!isAutoplay) return;

    autoTimerRef.current = setTimeout(() => {
      if (
        isAutoplay &&
        physicsRef.current.stageVisible &&
        !physicsRef.current.isDragging &&
        !document.hidden &&
        !slipHoverRef.current &&
        !isFocusOpen &&
        !isGrid &&
        !isDrawerOpen
      ) {
        nextLook();
      }
    }, 5000);

    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [isAutoplay, isFocusOpen, isGrid, isDrawerOpen, active, nextLook]);

  // Initial measure and boot
  useEffect(() => {
    if (!stageRef.current) return;
    const currentStage = stageRef.current;
    const currentPhysics = physicsRef.current;
    const ro = new ResizeObserver(() => {
      if (isGrid) {
        layoutGrid();
      } else {
        layoutRing();
      }
      kickPhysics();
    });
    ro.observe(currentStage);

    const io = new IntersectionObserver((entries) => {
      currentPhysics.stageVisible = entries[0].isIntersecting;
      if (entries[0].isIntersecting) kickPhysics();
    });
    io.observe(currentStage);

    kickPhysics();

    return () => {
      ro.disconnect();
      io.disconnect();
      if (currentPhysics.rafId) cancelAnimationFrame(currentPhysics.rafId);
    };
  }, [isGrid, layoutGrid, layoutRing, kickPhysics]);

  // Toggle Grid / Ring
  const handleToggleGrid = (on: boolean) => {
    if (on === isGrid || isFocusOpen) return;
    stopAuto();
    setIsGrid(on);

    if (crowdRef.current) {
      const bodies = Array.from(crowdRef.current.children) as HTMLElement[];
      const STEP = (2 * Math.PI) / 9;
      bodies.forEach((body, i) => {
        const diff = Math.abs(wrapAngle((i - physicsRef.current.pos) * STEP));
        const stagger = Math.round((diff / Math.PI) * 4);
        const d = stagger * (on ? 0.32 : 0.24);
        body.style.setProperty("--d", `${d}s`);
      });
    }

    if (deckRef.current) {
      deckRef.current.classList.add("is-anim");
      setTimeout(() => {
        deckRef.current?.classList.remove("is-anim");
      }, 1700);
    }

    if (on) {
      setTimeout(() => layoutGrid(), 20);
    } else {
      setTimeout(() => {
        layoutRing();
        kickPhysics();
      }, 20);
    }
  };

  // Open Focus Mode with FLIP
  const openFocus = useCallback((targetLookIndex?: number) => {
    const idx = targetLookIndex !== undefined ? targetLookIndex : active;
    stopAuto();
    if (isDrawerOpen) setIsDrawerOpen(false);

    if (crowdRef.current) {
      const bodies = Array.from(crowdRef.current.children) as HTMLElement[];
      const srcFig = bodies[idx]?.querySelector(".model__fig") as HTMLElement;
      if (srcFig && focusStageRef.current) {
        const srcRect = srcFig.getBoundingClientRect();
        setIsFocusOpen(true);

        setTimeout(() => {
          if (!focusModelRef.current) return;
          const dstFig = focusModelRef.current.querySelector(".model__fig") as HTMLElement;
          if (!dstFig) return;
          const dstRect = dstFig.getBoundingClientRect();
          const dx = srcRect.left - dstRect.left;
          const dy = srcRect.bottom - dstRect.bottom;
          const scale = srcRect.height / dstRect.height;

          focusModelRef.current.style.transition = "none";
          focusModelRef.current.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`;
          void focusModelRef.current.offsetWidth;
          focusModelRef.current.style.transition = "";
          focusModelRef.current.style.transform = "";
        }, 10);
      } else {
        setIsFocusOpen(true);
      }
    } else {
      setIsFocusOpen(true);
    }
  }, [active, isDrawerOpen, stopAuto]);

  const closeFocus = useCallback(() => {
    if (!isFocusOpen) return;
    if (focusModelRef.current && crowdRef.current) {
      const bodies = Array.from(crowdRef.current.children) as HTMLElement[];
      const curFig = bodies[active]?.querySelector(".model__fig") as HTMLElement;
      const dstFig = focusModelRef.current.querySelector(".model__fig") as HTMLElement;
      if (curFig && dstFig) {
        const curRect = curFig.getBoundingClientRect();
        const dstRect = dstFig.getBoundingClientRect();
        const dx = curRect.left - dstRect.left;
        const dy = curRect.bottom - dstRect.bottom;
        const scale = curRect.height / dstRect.height;
        focusModelRef.current.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`;
      }
    }
    setTimeout(() => {
      setIsFocusOpen(false);
    }, 950);
  }, [isFocusOpen, active]);

  // Stage Pointer Drag Events
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isFocusOpen || isGrid || e.button !== 0) return;
    dragRef.current.pointerId = e.pointerId;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    dragRef.current.startGoal = physicsRef.current.goal;
    dragRef.current.trail = [{ x: e.clientX, t: Date.now() }];
    dragRef.current.intentChecked = false;
    dragRef.current.wasDragging = false;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Follow cursor update
    if (followRef.current && stageRef.current && e.pointerType === "mouse") {
      const rect = stageRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      followRef.current.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      followRef.current.classList.add("is-on");
    }

    if (dragRef.current.pointerId === null || e.pointerId !== dragRef.current.pointerId) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    if (!dragRef.current.intentChecked && !physicsRef.current.isDragging) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
        dragRef.current.intentChecked = true;
        dragRef.current.pointerId = null;
        return;
      }
      if (Math.abs(dx) > 8 && Math.abs(dx) > 1.2 * Math.abs(dy)) {
        dragRef.current.intentChecked = true;
        physicsRef.current.isDragging = true;
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {
          // Ignored
        }
        deckRef.current?.classList.add("is-dragging");
        stopAuto();
      }
    }

    if (physicsRef.current.isDragging) {
      dragRef.current.wasDragging = true;
      dragRef.current.trail.push({ x: e.clientX, t: Date.now() });
      if (dragRef.current.trail.length > 6) dragRef.current.trail.shift();
      const dragPx = Math.max(window.innerWidth < 810 ? 90 : 120, (stageRef.current?.clientWidth || 800) * 0.3);
      physicsRef.current.goal = dragRef.current.startGoal - dx / dragPx;
      const newIdx = ((Math.round(physicsRef.current.goal) % 9) + 9) % 9;
      setActiveIndex(newIdx);
      setLiveText(`Look ${newIdx + 1}: ${LOOKS[newIdx].name}`);
      kickPhysics();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId === null || e.pointerId !== dragRef.current.pointerId) return;
    if (physicsRef.current.isDragging) {
      physicsRef.current.isDragging = false;
      deckRef.current?.classList.remove("is-dragging");
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
      dragRef.current.trail.push({ x: e.clientX, t: Date.now() });
      const trail = dragRef.current.trail;
      const first = trail[0];
      const lastT = trail[trail.length - 1];
      const dt = lastT.t - first.t;
      const v = dt > 0 ? (lastT.x - first.x) / dt : 0;
      const base = Math.round(dragRef.current.startGoal);
      const dx = e.clientX - dragRef.current.startX;
      const mobile = window.innerWidth < 810;
      const dragPx = Math.max(mobile ? 90 : 120, (stageRef.current?.clientWidth || 800) * 0.3);

      let target: number;
      if (mobile) {
        target = Math.abs(dx) > 30 || Math.abs(v) > 0.3 ? base + (dx < 0 ? 1 : -1) : base;
      } else {
        target = Math.round(physicsRef.current.goal - (v * 160) / dragPx);
        if (target === base && Math.abs(v) > 0.3) {
          target = base + (v < 0 ? 1 : -1);
        }
        target = Math.max(base - 2, Math.min(base + 2, target));
      }
      goTo(target);
      dragRef.current.wasDragging = true;
      setTimeout(() => {
        dragRef.current.wasDragging = false;
      }, 100);
    }
    dragRef.current.pointerId = null;
  };

  // Model hit click
  const handleModelClick = (i: number) => {
    if (dragRef.current.wasDragging) return;
    if (isGrid) {
      physicsRef.current.goal = physicsRef.current.pos = i;
      physicsRef.current.vel = 0;
      setActiveIndex(i);
      openFocus(i);
    } else {
      const d = shortest(i, Math.round(physicsRef.current.goal));
      if (d === 0) {
        openFocus(i);
      } else {
        stopAuto();
        goTo(Math.round(physicsRef.current.goal) + d);
      }
    }
  };

  // Keyboard Navigation on stage
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      stopAuto();
      nextLook();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      stopAuto();
      prevLook();
    } else if (isGrid && e.key === "ArrowDown") {
      e.preventDefault();
      stopAuto();
      jumpToLook(active + 3);
    } else if (isGrid && e.key === "ArrowUp") {
      e.preventDefault();
      stopAuto();
      jumpToLook(active - 3);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (!isFocusOpen) {
        if (isGrid) {
          physicsRef.current.goal = physicsRef.current.pos = active;
          physicsRef.current.vel = 0;
        }
        openFocus(active);
      }
    } else if (e.key === "Escape") {
      if (isFocusOpen) closeFocus();
      else if (isDrawerOpen) setIsDrawerOpen(false);
      else if (onClose) onClose();
    }
  };

  // Wheel handling
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (isFocusOpen || isGrid) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      if (wheelLockRef.current) return;
      wheelSumRef.current += e.deltaX;
      if (Math.abs(wheelSumRef.current) > 45) {
        stopAuto();
        if (wheelSumRef.current > 0) nextLook();
        else prevLook();
        wheelSumRef.current = 0;
        wheelLockRef.current = true;
        setTimeout(() => {
          wheelLockRef.current = false;
        }, 520);
      }
    }
  };

  // Add Item to Bag (integrates with Vroom onAddToCart)
  const handleAddItemsToBag = (itemIndices: number[]) => {
    setCartState((prev) => {
      const next = prev.map((lState, lIdx) =>
        lIdx !== active
          ? lState
          : lState.map((itState, itIdx) =>
              itemIndices.includes(itIdx)
                ? { ...itState, added: true }
                : itState
            )
      );
      return next;
    });

    // Close any open picking drawers for these items
    setActivePickingLines((prev) => {
      const next = { ...prev };
      itemIndices.forEach((idx) => {
        delete next[idx];
      });
      return next;
    });

    // Bump tally
    setTallyBump(true);
    setTimeout(() => setTallyBump(false), 500);

    // Call store onAddToCart for each added piece
    itemIndices.forEach((pIdx) => {
      const it = LOOKS[active].items[pIdx];
      const state = cartState[active][pIdx];
      const chosenSize = state.size;

      const productToAdd: Product = {
        id: `look-${active + 1}-item-${pIdx + 1}`,
        name: it.name,
        description: `${it.kind} from Look ${pad(active + 1)}: ${LOOKS[active].name}. Vroom Styles editorial drop.`,
        price: it.price * 1500,
        originalPrice: Math.round(it.price * 1500 * 1.3),
        image: px(CUTS[active], 914),
        images: [px(CUTS[active], 914)],
        category: it.kind === "Top" ? "Outerwear" : it.kind === "Shoes" ? "Footwear" : it.kind === "Bottom" ? "Women" : "Accessories",
        brand: "Vroom Atelier × NOWHERE",
        stock: 25,
        sizes: it.sizes,
        colors: [{ name: "Studio Grey", hex: "#ececec" }],
        sellerType: "1P",
        sellerName: "Vroom Atelier",
        isFulfilledByVroom: true,
        isPodEligible: true,
      };

      if (onAddToCart) {
        onAddToCart(productToAdd, chosenSize, "Studio Grey", 1);
      }
    });

    if (itemIndices.length > 1) {
      triggerToast("Fit added to your bag.");
    } else {
      triggerToast("Item added to your bag.");
    }
  };

  // CTA Click: Add Whole Fit
  const handleAddWholeFit = () => {
    stopAuto();
    const unadded: number[] = [];
    LOOKS[active].items.forEach((_, idx) => {
      if (!cartState[active][idx].added) unadded.push(idx);
    });
    if (unadded.length === 0) return;

    const touched = unadded.filter((idx) => cartState[active][idx].touched);
    const untouched = unadded.filter((idx) => !cartState[active][idx].touched);

    if (touched.length > 0) {
      handleAddItemsToBag(touched);
    }

    if (untouched.length > 0) {
      const isMobile = window.innerWidth < 810;
      setActivePickingLines((prev) => {
        const next = { ...prev };
        untouched.forEach((idx, i) => {
          if (!isMobile || i === 0) {
            next[idx] = true;
          }
        });
        return next;
      });
      const names = untouched.map((idx) => LOOKS[active].items[idx].name).join(", ");
      setSlipMessage(`Choose size for: ${names}`);
    } else {
      setSlipMessage("");
    }
  };

  // Active Look Calculations
  const currentLook = LOOKS[active];
  const subtotal = currentLook.items.reduce((acc, it) => acc + it.price, 0);
  const discount = subtotal * 0.1;
  const total = subtotal * 0.9;
  const isLookComplete = cartState[active].every((it) => it.added);

  const sheetIdx = Math.floor(active / 3);
  const sheetRow = active % 3;
  const sheetUrl = px(SHEETS[sheetIdx], 600);

  return (
    <div className="circle-lookbook-root">
      {/* ---------------- 1. Status Bar ---------------- */}
      <header className="bar">
        <span className="stat stat--clock cap" id="clock" aria-hidden="true">
          {clockTime}
        </span>
        <span className="stat stat--signal cap">
          <span className="stat__signal-bars" aria-hidden="true">
            <span className="stat__signal-bar"></span>
            <span className="stat__signal-bar"></span>
            <span className="stat__signal-bar"></span>
            <span className="stat__signal-bar"></span>
          </span>
          <span className="stat__txt">Low signal</span>
        </span>
        <a className="brand" href="#" aria-label="NOWHERE home" onClick={(e) => { e.preventDefault(); if (onClose) onClose(); }}>
          Nowhere<i>®</i>
        </a>
        <span className="stat stat--battery cap">
          <span className="stat__battery-cell" aria-hidden="true">
            <span className="stat__battery-fill"></span>
          </span>
          <span className="stat__txt">12%</span>
        </span>
        <button
          className="bagbtn pill"
          type="button"
          aria-label="Bag"
          onClick={() => {
            if (onOpenCart) onOpenCart();
          }}
        >
          Bag (<span className={`tally ${tallyBump ? "bump" : ""}`}>{cartCount}</span>)
        </button>
      </header>

      {/* ---------------- 2. Main Stage ---------------- */}
      <main>
        <section
          className={`deck ${isGrid ? "is-grid" : ""} ${isFocusOpen ? "is-focus" : ""} ${isDrawerOpen ? "is-drawer" : ""}`}
          id="deck"
          ref={deckRef}
          aria-labelledby="deck-title"
        >
          {/* Accessible Hidden Intro */}
          <div className="deck__intro">
            <h1 id="deck-title">
              <span>Stay out of the</span> <span>loop, <i>pal.</i></span>
            </h1>
            <p>
              <span>Vol. 01. Nine looks for going quiet.</span>{" "}
              <span>Spin the ring, choose a fit, tap a dot to shop the item.</span>
            </p>
          </div>

          {/* Interactive Carousel / Grid Stage */}
          <div
            className="deck__stage"
            id="stage"
            ref={stageRef}
            tabIndex={0}
            role="region"
            aria-roledescription={isGrid ? "grid of looks" : "carousel"}
            aria-label="Looks — arrow keys turn the ring, Enter opens the look"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onKeyDown={handleKeyDown}
            onWheel={handleWheel}
          >
            <span className="loop__ring" id="loopRing" ref={loopRingRef}></span>
            <div className="loop" aria-hidden="true">
              <p className="loop__t">
                Stay out<br />of the loop
              </p>
              <p className="loop__s">Vol. 01 — Nine looks</p>
            </div>

            {/* 9 Model Cutouts */}
            <div className="deck__crowd" id="crowd" ref={crowdRef}>
              {LOOKS.map((look, i) => {
                const imgSrc = px(CUTS[i], 914);
                const imgSmall = px(CUTS[i], 571);
                return (
                  <div
                    key={look.name}
                    className="model"
                    style={{ "--foot": look.foot } as React.CSSProperties}
                  >
                    <div className="model__fig">
                      <span className="model__shadow" aria-hidden="true"></span>
                      <img
                        className="model__pic"
                        src={imgSrc}
                        srcSet={`${imgSmall} 571w, ${imgSrc} 914w`}
                        sizes="(max-width: 809px) 240px, 360px"
                        alt={look.name}
                        draggable={false}
                        decoding="async"
                        fetchPriority={i === 0 ? "high" : "auto"}
                      />
                      <button
                        className="model__hit"
                        type="button"
                        tabIndex={i === active ? 0 : -1}
                        data-i={i}
                        aria-label={`Look ${pad(i + 1)}: ${look.name}`}
                        onClick={() => handleModelClick(i)}
                      ></button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Grid View Labels */}
            <div className="deck__labels" id="labels" ref={labelsRef}>
              {LOOKS.map((look, i) => (
                <span
                  key={look.name}
                  className={`deck__label cap ${i === active ? "is-on" : ""}`}
                  style={{ "--i": i } as React.CSSProperties}
                >
                  {pad(i + 1)}&nbsp;&nbsp;{look.name}
                </span>
              ))}
            </div>

            {/* Glint Light Sweep Overlay */}
            <span className="deck__glint"></span>

            {/* Follow Cursor */}
            <span className="follow" id="follow" ref={followRef}>
              <span className="follow__in">
                <b className="f-drag">Drag</b>
                <b className="f-view">View</b>
              </span>
            </span>

            {/* Polite Aria Live Region */}
            <span className="deck__live" id="live" aria-live="polite">
              {liveText}
            </span>
          </div>

          {/* ---------------- 3. Bottom Dock ---------------- */}
          <div className="dock">
            <div className="dock__now" id="now">
              <div className="dock__count">
                <span className="cap">
                  <span>{pad(active + 1)}</span> / <span>09</span>
                </span>
                <button
                  className="dock__auto"
                  id="auto"
                  type="button"
                  aria-label="Autoplay"
                  aria-pressed={isAutoplay}
                  onClick={() => setIsAutoplay(!isAutoplay)}
                >
                  <svg viewBox="0 0 24 24" width="12" height="12">
                    <path className="icon-pause" fill="currentColor" d="M6.5 4.5h3.5v15H6.5z M14 4.5h3.5v15H14z" />
                    <path className="icon-play" fill="currentColor" d="M7 4.5v15l12.5-7.5z" />
                  </svg>
                </button>
              </div>
              <div className="dock__name" id="nowName">
                {currentLook.name}
              </div>
            </div>

            {/* 3 Dock Items */}
            <ul className="dock__pieces is-in" id="pieces" aria-label="Items in this fit">
              {currentLook.items.map((it, pIdx) => {
                const bgPos = `${pIdx * 50}% ${sheetRow * 50}%`;
                return (
                  <li key={it.name} style={{ "--i": pIdx + 1 } as React.CSSProperties}>
                    <button
                      className="piece"
                      type="button"
                      data-p={pIdx + 1}
                      aria-label={`${it.name}, ${money(it.price)}`}
                      onClick={() => openFocus(active)}
                    >
                      <span className="piece__img">
                        <span
                          className="piece__thumb"
                          style={{
                            backgroundImage: `url('${sheetUrl}')`,
                            backgroundPosition: bgPos,
                          }}
                        ></span>
                      </span>
                      <span className="piece__name">{it.name}</span>
                      <span className="piece__price">
                        <i>{money(it.price)}</i>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <button
              className="dock__shop"
              id="shop"
              type="button"
              aria-label="Shop this fit"
              onClick={() => openFocus(active)}
            >
              <span className="cap">Shop this fit</span>
              <span className="dock__dot">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M12 4v16M4 12h16" />
                </svg>
              </span>
            </button>
          </div>

          {/* ---------------- 4. Side Controls ---------------- */}
          <a className="deck__qr" href="#" aria-label="Nowhere code" onClick={(e) => e.preventDefault()}>
            <svg id="qr" ref={qrRef} viewBox="0 0 25 25" shapeRendering="crispEdges" aria-hidden="true"></svg>
          </a>

          <button
            className="deck__looksbtn pill"
            id="drawerBtn"
            type="button"
            aria-expanded={isDrawerOpen}
            aria-controls="drawer"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          >
            Looks
          </button>

          <div className="deck__view" role="group" aria-label="View">
            <button
              className="deck__vbtn"
              type="button"
              data-v="ring"
              aria-pressed={!isGrid}
              onClick={() => handleToggleGrid(false)}
            >
              Ring
            </button>
            <button
              className="deck__vbtn"
              type="button"
              data-v="grid"
              aria-pressed={isGrid}
              onClick={() => handleToggleGrid(true)}
            >
              Grid
            </button>
          </div>

          {/* ---------------- 5. Looks Drawer ---------------- */}
          <div className="drawer" id="drawer" aria-hidden={!isDrawerOpen}>
            <div className="drawer__top">
              <span className="cap">Looks · Vol. 01</span>
              <button className="pill" id="drawerClose" type="button" onClick={() => setIsDrawerOpen(false)}>
                Close
              </button>
            </div>
            <ol className="drawer__list" id="drawerList">
              {LOOKS.map((look, i) => {
                const sub = look.items.reduce((acc, it) => acc + it.price, 0);
                return (
                  <li key={look.name} style={{ "--i": i } as React.CSSProperties}>
                    <button
                      className="drawer__item"
                      type="button"
                      data-i={i}
                      aria-current={i === active}
                      onClick={() => {
                        jumpToLook(i);
                        setIsDrawerOpen(false);
                      }}
                    >
                      <span className="cap">{pad(i + 1)}</span>
                      <span className="drawer__name">{look.name}</span>
                      <span className="drawer__meta cap">
                        {look.items.length} pieces · {money(sub)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <nav className="drawer__nav" aria-label="Main">
              <a className="pill" href="#" onClick={(e) => e.preventDefault()}>
                Vol. 01
              </a>
              <a className="pill" href="#" onClick={(e) => e.preventDefault()}>
                Places
              </a>
              <a className="pill" href="#" onClick={(e) => e.preventDefault()}>
                Letters
              </a>
              <a className="pill" href="#" onClick={(e) => e.preventDefault()}>
                Postcards
              </a>
            </nav>
          </div>

          {/* ---------------- 6. Focus View (Full Figure + Dots) ---------------- */}
          <div className="focus" id="focus" aria-hidden={!isFocusOpen}>
            <div className="focus__top">
              <p className="focus__cap">
                <span id="focusNum">{pad(active + 1)}.</span>
                <i id="focusName">{currentLook.name}</i>
              </p>
              <button className="focus__close" id="focusClose" type="button" aria-label="Close look" onClick={closeFocus}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M5 5l14 14M19 5L5 19" />
                </svg>
              </button>
            </div>

            <div
              className="focus__stage"
              id="focusStage"
              ref={focusStageRef}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest(".tag, .model__fig")) return;
                closeFocus();
              }}
            >
              {isFocusOpen && (
                <div
                  className="focus__model"
                  ref={focusModelRef}
                  style={{
                    position: "relative",
                    flex: "none",
                    cursor: "default",
                    transformOrigin: "0 100%",
                    transition: "transform .95s var(--ease)",
                    "--foot": currentLook.foot,
                  } as React.CSSProperties}
                >
                  <div className="model__fig">
                    <span className="model__shadow" aria-hidden="true"></span>
                    <img
                      className="model__pic"
                      src={px(CUTS[active], 914)}
                      srcSet={`${px(CUTS[active], 571)} 571w, ${px(CUTS[active], 914)} 914w`}
                      sizes="(max-width: 809px) 240px, 360px"
                      alt={currentLook.name}
                      draggable={false}
                      decoding="async"
                    />
                    <div className="tags">
                      {currentLook.tags.map((tag, tIdx) => {
                        const p = tIdx + 1;
                        const it = currentLook.items[tIdx];
                        return (
                          <button
                            key={it.name}
                            className="tag"
                            type="button"
                            data-p={p}
                            style={{
                              left: `${tag[0]}%`,
                              top: `${tag[1]}%`,
                              "--pi": p,
                            } as React.CSSProperties}
                            aria-label={`${pad(p)}: ${it.name}, ${money(it.price)}`}
                          >
                            <span className="dotnum">{pad(p)}</span>
                            <span className="tag__tip">
                              <b>{it.name}</b>
                              <span>{money(it.price)}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <p className="focus__hint cap">Tap a dot to shop this item</p>
          </div>

          {/* ---------------- 7. Slip Receipt ---------------- */}
          <aside
            className={`slip ${isLookComplete ? "is-complete" : ""}`}
            id="slip"
            aria-label="In this fit"
            aria-hidden={!isFocusOpen}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") slipHoverRef.current = true;
            }}
            onPointerLeave={() => {
              slipHoverRef.current = false;
            }}
          >
            <div className="slip__head">
              <h2 className="slip__logo">
                Nowhere<i>®</i>
              </h2>
              <span className="cap">Vol. 01 · Till 0004 · Lisbon</span>
              <span className="cap" id="slipLook">
                Look {pad(active + 1)} — {currentLook.name}
              </span>
            </div>

            <ul className="slip__lines" id="lines" role="list">
              {currentLook.items.map((it, pIdx) => {
                const p = pIdx + 1;
                const state = cartState[active][pIdx];
                const isPicking = !!activePickingLines[pIdx];

                return (
                  <li key={it.name} className={`line ${state.added ? "is-added" : ""} ${isPicking ? "is-picking" : ""}`} data-p={p}>
                    <span className="line__name">{it.name}</span>
                    <span className="line__price">
                      <i>{money(it.price)}</i>
                    </span>
                    <span className="line__kind cap">{it.kind}</span>
                    <button
                      className="line__add"
                      type="button"
                      aria-expanded={isPicking}
                      aria-label={state.added ? `In bag: ${it.name}` : `Add to bag: ${it.name}`}
                      onClick={() => {
                        stopAuto();
                        if (state.added) return;
                        if (it.sizes.length === 1) {
                          handleAddItemsToBag([pIdx]);
                        } else {
                          setActivePickingLines((prev) => ({ ...prev, [pIdx]: !prev[pIdx] }));
                        }
                      }}
                    ></button>

                    <div className="pick">
                      <div className="pick__sizes" role="group" aria-label="Size">
                        {it.sizes.map((s) => (
                          <button
                            key={s}
                            className="size"
                            type="button"
                            data-s={s}
                            aria-pressed={state.size === s}
                            onClick={() => {
                              setCartState((prev) =>
                                prev.map((lState, lIdx) =>
                                  lIdx !== active
                                    ? lState
                                    : lState.map((itState, itIdx) =>
                                        itIdx === pIdx ? { ...itState, size: s, touched: true } : itState
                                      )
                                )
                              );
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                      <button
                        className="pick__ok"
                        type="button"
                        onClick={() => {
                          setCartState((prev) =>
                            prev.map((lState, lIdx) =>
                              lIdx !== active
                                ? lState
                                : lState.map((itState, itIdx) =>
                                    itIdx === pIdx ? { ...itState, touched: true } : itState
                                  )
                            )
                          );
                          handleAddItemsToBag([pIdx]);
                        }}
                      >
                        Add to bag
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="slip__bundle">
              {slipMessage && <p className="slip__msg cap">{slipMessage}</p>}
              <dl className="sum">
                <div>
                  <dt className="cap">Subtotal</dt>
                  <dd id="sumSub">{money(subtotal)}</dd>
                </div>
                <div>
                  <dt className="cap">Whole fit −10%</dt>
                  <dd id="sumOff">−{money(discount)}</dd>
                </div>
                <div className="sum__total">
                  <dt>Total</dt>
                  <dd id="sumTotal">{money(total)}</dd>
                </div>
              </dl>
              <button className="slip__cta" id="cta" type="button" onClick={handleAddWholeFit}>
                <span className="t-add">Add whole fit to bag</span>
                <span className="t-done">Whole fit in your bag</span>
                <svg className="cta-arrow" viewBox="0 0 26 14" width="22" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 7h24M19 1l6 6-6 6" />
                </svg>
              </button>
            </div>

            <div className="slip__foot" aria-hidden="true">
              <div className="slip__code"></div>
              <span className="cap">Thanks for going nowhere.</span>
            </div>
          </aside>
        </section>
      </main>

      {/* Toast Notification */}
      <div className={`toast ${isToastActive ? "is-on" : ""}`} id="toast" role="status">
        {toastMsg}
      </div>
    </div>
  );
};
