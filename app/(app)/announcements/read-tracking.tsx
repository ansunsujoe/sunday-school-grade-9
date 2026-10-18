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
      className="ex-panel scroll-mt-24 overflow-hidden p-5 sm:p-6"
    >
      {isNew && (
        <>
          {/* .ex-panel paints its own background, so the gold wash for a new one is a layer behind the words. */}
          <span className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-br from-amber-400/[0.08] to-transparent" aria-hidden />
          <span className="absolute inset-y-0 left-0 w-1 bg-amber-400 shadow-[0_0_14px] shadow-amber-400/70" />
          <span className="absolute top-4 right-4 bg-amber-400 px-2 py-0.5 text-[10px] font-bold tracking-widest text-ink uppercase shadow-lg shadow-amber-400/30 sm:top-5 sm:right-5">
            New
          </span>
        </>
      )}
      {children}
    </article>
  );
}
