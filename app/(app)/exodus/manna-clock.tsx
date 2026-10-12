"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { buttonClass, secondaryButtonClass } from "@/components/ui";

function timeLeft(ms: number) {
  const minutes = Math.max(0, Math.ceil(ms / 60_000));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days > 0) return `${days} ${days === 1 ? "day" : "days"} ${hours} hr`;
  if (hours > 0) return `${hours} hr ${mins} min`;
  return `${mins} min`;
}

/**
 * Time left until `deadline`, ticking every few seconds. When it passes, the
 * page refreshes so the server can settle the day. `now` is the server's time,
 * so the first render matches.
 */
export function MannaCountdown({ deadline, now, className = "" }: { deadline: string; now: number; className?: string }) {
  const router = useRouter();
  const [clock, setClock] = useState(now);
  const left = Date.parse(deadline) - clock;

  useEffect(() => {
    const id = setInterval(() => setClock(Date.now()), 10_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (left > 0) return;
    // Give the server a moment past midnight before asking for the new day.
    const id = setTimeout(() => router.refresh(), 2_000);
    return () => clearTimeout(id);
  }, [left, router]);

  return <span className={`tabular-nums ${className}`}>{left > 0 ? timeLeft(left) : "no time"}</span>;
}

export function GatherButton({ label, disabled }: { label: string; disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    // Gold only when there's something to do; quiet once collected or on the Sabbath.
    <button disabled={disabled || pending} className={disabled ? secondaryButtonClass : buttonClass}>
      {pending ? "Collecting…" : label}
    </button>
  );
}
