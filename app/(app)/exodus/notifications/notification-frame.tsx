"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * One notification's box. Remembers whether it was unread when the page
 * opened, so the "new" look stays put after the page marks it read.
 */
export function NotificationFrame({
  unread,
  compact,
  href,
  children,
}: {
  unread: boolean;
  compact: boolean;
  href: string | null;
  children: React.ReactNode;
}) {
  const [isNew] = useState(unread);
  const className = `relative flex gap-3 pr-6 ${
    compact
      ? "py-3"
      : `rounded-2xl border p-3.5 pr-8 sm:p-4 sm:pr-8 ${isNew ? "border-amber-400/30 bg-amber-400/[0.05]" : "border-line-subtle bg-night-900/60"}`
  } ${href ? "transition hover:bg-wash" : ""}`;
  const dot = isNew && (
    <span
      className={`absolute ${compact ? "top-4.5 right-1" : "top-5 right-4"} size-2 rounded-full bg-amber-400 shadow-[0_0_8px] shadow-amber-400/70`}
      aria-label="New"
    />
  );
  return href ? (
    <Link href={href} className={className}>
      {children}
      {dot}
    </Link>
  ) : (
    <div className={className}>
      {children}
      {dot}
    </div>
  );
}
