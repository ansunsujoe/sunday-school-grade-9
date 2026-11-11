import Link from "next/link";
import { Icon } from "@/components/icons";

export default function WorldLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ex-scope mx-auto max-w-[96rem]">
      <Link
        href="/activities"
        className="relative mb-2 inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-slate-100"
      >
        <Icon name="arrowLeft" className="size-4" /> Activities
      </Link>
      <header className="mb-1 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-50">Verse Royale</h1>
          <p className="font-display text-xs font-semibold tracking-[0.25em] text-[var(--ex-gold)] uppercase">
            70 verses · 70 territories
          </p>
        </div>
        <p className="font-display text-sm text-[var(--ex-gold)] italic opacity-70">
          “The sword of the Spirit, which is the word of God” · Ephesians 6:17
        </p>
      </header>
      <div className="ex-bells mb-6" aria-hidden />
      {children}
    </div>
  );
}
