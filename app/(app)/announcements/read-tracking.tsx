"use client";

import { useEffect, useState } from "react";
import { markAnnouncementsRead } from "@/lib/actions/announcements";

/** Marks the listed announcements as read once the page has been shown. */
export function MarkRead({ ids }: { ids: number[] }) {
  const key = ids.join(",");
  useEffect(() => {
    if (key) markAnnouncementsRead(key.split(",").map(Number));
  }, [key]);
  return null;
}

/**
 * The card around one announcement. Remembers whether it was unread when the
 * page opened, so the "New" highlight stays put after MarkRead refreshes the page.
 */
export function AnnouncementFrame({
  id,
  unread,
  children,
}: {
  id: number;
  unread: boolean;
  children: React.ReactNode;
}) {
  const [isNew] = useState(unread);
  return (
    <article
      id={`a-${id}`}
      className={`relative scroll-mt-24 overflow-hidden rounded-2xl border p-5 shadow-xl shadow-black/20 backdrop-blur-sm sm:p-6 ${
        isNew
          ? "border-amber-400/35 bg-linear-to-br from-amber-400/[0.07] via-night-900/80 to-night-900/80"
          : "border-white/[0.07] bg-night-900/70"
      }`}
    >
      {isNew && (
        <>
          <span className="absolute inset-y-0 left-0 w-1 bg-amber-400 shadow-[0_0_14px] shadow-amber-400/70" />
          <span className="absolute top-4 right-4 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold tracking-widest text-night-950 uppercase shadow-lg shadow-amber-400/30 sm:top-5 sm:right-5">
            New
          </span>
        </>
      )}
      {children}
    </article>
  );
}
