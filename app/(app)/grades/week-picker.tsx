"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";

const arrowClass =
  "grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-wash text-slate-300 transition hover:bg-wash-hover hover:text-slate-50 active:scale-95";

/** Previous / next arrows around a native select, which is easy to spin on phones. */
export function WeekPicker({
  weeks,
  value,
  current,
}: {
  weeks: { value: string; label: string }[];
  value: string;
  current: string;
}) {
  const router = useRouter();
  const index = weeks.findIndex((w) => w.value === value);
  const prev = weeks[index - 1];
  const next = weeks[index + 1];
  const href = (week: string) => `/grades?week=${week}`;

  return (
    <div className="flex items-center gap-2">
      {prev ? (
        <Link href={href(prev.value)} className={arrowClass} aria-label="Previous Sunday">
          <Icon name="chevronLeft" />
        </Link>
      ) : (
        <span className={`${arrowClass} pointer-events-none opacity-30`} aria-hidden>
          <Icon name="chevronLeft" />
        </span>
      )}
      <div className="relative min-w-0 flex-1">
        <select
          aria-label="Sunday"
          value={value}
          onChange={(e) => router.push(href(e.target.value))}
          className="h-11 w-full appearance-none rounded-xl border border-amber-400/30 bg-night-800 pr-10 pl-4 text-center text-base font-semibold text-amber-100 focus:ring-2 focus:ring-amber-400/30 focus:outline-none"
        >
          {weeks.map((w) => (
            <option key={w.value} value={w.value}>
              {w.label}
              {w.value === current ? " · Now" : ""}
            </option>
          ))}
        </select>
        <Icon
          name="chevronRight"
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 rotate-90 text-amber-300/70"
        />
      </div>
      {next ? (
        <Link href={href(next.value)} className={arrowClass} aria-label="Next Sunday">
          <Icon name="chevronRight" />
        </Link>
      ) : (
        <span className={`${arrowClass} pointer-events-none opacity-30`} aria-hidden>
          <Icon name="chevronRight" />
        </span>
      )}
    </div>
  );
}
