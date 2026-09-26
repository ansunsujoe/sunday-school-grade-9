"use client";

import { useEffect } from "react";
import { markNotificationsRead } from "@/lib/actions/exodus";

/** Marks notifications up to `upTo` as read once the page has been shown. */
export function MarkNotificationsRead({ upTo }: { upTo: number | null }) {
  useEffect(() => {
    if (upTo !== null) markNotificationsRead(upTo);
  }, [upTo]);
  return null;
}
