import Link from "next/link";

// text-base on phones keeps iOS from zooming in when an input is focused.
export const inputClass =
  "w-full rounded-xl border border-line bg-night-800/80 px-3.5 py-2.5 text-base text-slate-100 placeholder:text-slate-500 transition focus:border-amber-400/60 focus:outline-none focus:ring-2 focus:ring-amber-400/20 sm:text-sm";

export const buttonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-linear-to-b from-amber-400 to-amber-500 px-5 py-2 text-sm font-semibold text-ink shadow-lg shadow-amber-500/15 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50";

export const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-wash px-5 py-2 text-sm font-medium text-slate-200 transition hover:bg-wash-hover active:scale-[0.98] disabled:opacity-50";

export const dangerButtonClass =
  "inline-flex min-h-10 items-center justify-center rounded-xl border border-rose-400/25 bg-rose-400/5 px-3.5 py-1.5 text-sm font-medium text-rose-300 transition hover:bg-rose-400/15";

/** A pill in a segmented toggle; pair with a `peer sr-only` radio before it, plus a tone. */
export const segmentClass =
  "grid min-h-10 min-w-9 place-items-center rounded-lg px-2 text-sm font-semibold text-slate-400 transition hover:text-slate-100 peer-checked:shadow peer-focus-visible:ring-2 peer-focus-visible:ring-amber-300";

export const segmentTones = {
  gold: "peer-checked:bg-amber-400 peer-checked:text-ink",
  yes: "peer-checked:bg-emerald-400 peer-checked:text-ink",
  no: "peer-checked:bg-rose-400 peer-checked:text-ink",
  blank: "peer-checked:bg-night-600 peer-checked:text-slate-200",
};

export function PageHeader({
  title,
  eyebrow,
  description,
  action,
}: {
  title: string;
  eyebrow?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4 sm:mb-6">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold tracking-[0.2em] text-amber-300/80 uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl font-semibold tracking-tight text-balance text-slate-50 sm:text-4xl">
          {title}
        </h1>
        {description && <p className="mt-2 text-sm text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({
  title,
  children,
  className = "",
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-line bg-night-900/70 p-4 shadow-xl shadow-black/20 backdrop-blur-sm sm:p-5 ${className}`}
    >
      {title && <h2 className="mb-4 text-base font-semibold text-slate-100">{title}</h2>}
      {children}
    </section>
  );
}

export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-300">
        {label}
      </label>
      {children}
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="py-8 text-center text-sm text-slate-500">{children}</p>;
}

export function Badge({
  tone = "slate",
  children,
}: {
  tone?: "slate" | "green" | "amber" | "red" | "gold";
  children: React.ReactNode;
}) {
  const tones = {
    slate: "bg-wash text-slate-300 ring-line",
    green: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20",
    amber: "bg-orange-400/10 text-orange-300 ring-orange-400/20",
    red: "bg-rose-400/10 text-rose-300 ring-rose-400/20",
    gold: "bg-amber-400/10 text-amber-200 ring-amber-400/25",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="font-medium text-amber-300 underline-offset-4 hover:text-amber-200 hover:underline"
    >
      {children}
    </Link>
  );
}

export function scoreTone(pct: number | null) {
  if (pct === null) return "slate" as const;
  if (pct >= 80) return "green" as const;
  if (pct >= 60) return "amber" as const;
  return "red" as const;
}

/** A big number with a label, e.g. "92%" over "Quiz average". */
export function Stat({
  label,
  value,
  suffix = "%",
}: {
  label: string;
  value: number | null | undefined;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border border-line-subtle bg-wash p-3 sm:p-4">
      <div className="font-display text-2xl font-semibold text-slate-50 sm:text-3xl">
        {value == null ? "—" : `${value}${suffix}`}
      </div>
      <div className="mt-0.5 text-xs text-slate-400 sm:text-sm">{label}</div>
    </div>
  );
}
