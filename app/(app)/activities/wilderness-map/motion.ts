"use client";

import { useEffect, useRef, useState } from "react";

export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
export const easeOut = (t: number) => 1 - (1 - t) ** 3;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Glides a list of numbers to `target` over `ms`, starting after `delay`.
 * Jumps straight there for anyone who prefers reduced motion (and so does
 * `useCountUp`).
 */
export function useTween(target: number[], ms: number, { delay = 0, ease = easeInOut } = {}) {
  const [value, setValue] = useState(target);
  const current = useRef(target);
  const key = target.join(",");

  useEffect(() => {
    const from = current.current;
    const to = key.split(",").map(Number);
    const set = (v: number[]) => {
      current.current = v;
      setValue(v);
    };
    // Reduced motion: the first frame lands on the end.
    const still = prefersReducedMotion();
    let frame = 0;
    const start = performance.now() + delay;
    const step = (now: number) => {
      const t = still ? 1 : Math.min(1, Math.max(0, (now - start) / ms));
      const e = ease(t);
      set(from.map((f, i) => f + (to[i] - f) * e));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [key, ms, delay, ease]);

  return value;
}

/** A number that counts up from zero to `value`, and on from there when `value` changes. */
export function useCountUp(value: number, ms = 900, delay = 0) {
  const [shown, setShown] = useState(0);
  const current = useRef(0);
  useEffect(() => {
    const from = current.current;
    const still = prefersReducedMotion();
    let frame = 0;
    const start = performance.now() + delay;
    const step = (now: number) => {
      const t = still ? 1 : Math.min(1, Math.max(0, (now - start) / ms));
      current.current = Math.round(from + (value - from) * easeOut(t));
      setShown(current.current);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, ms, delay]);
  return shown;
}

/** Milliseconds since `since`, refreshed about ten times a second while `running`. */
export function useElapsed(since: number | null, running: boolean) {
  const [now, setNow] = useState(() => since ?? 0);
  useEffect(() => {
    if (!running || since === null) return;
    const id = setInterval(() => setNow(performance.now()), 100);
    return () => clearInterval(id);
  }, [since, running]);
  return since === null ? 0 : Math.max(0, now - since);
}
