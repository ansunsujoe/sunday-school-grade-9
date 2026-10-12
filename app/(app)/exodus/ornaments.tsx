// The Exodus's own pictures and frames: line glyphs drawn like old rock
// carvings instead of emoji, and the square, double-ruled panels the game is
// built from. The patterns themselves live in globals.css (.ex-*).

const GLYPHS = {
  /** An oxhide ingot, the shape metal was traded in. */
  gold: "M3 17.5 6 9h12l3 8.5zM6 9 4.5 6.5M18 9l1.5-2.5M3 17.5 1.5 19M21 17.5l1.5 1.5M9 13h6",
  /** Two stamped rings of silver. */
  silver: "M9 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM9 12.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4zM14.5 6.5a5 5 0 1 1-1 9.9",
  /** A cut stone, like those on the priest's breastpiece. */
  jewels: "M7 4h10l4 5-9 11L3 9zM3 9h18M9.5 4 12 9l2.5-5M12 9v11M7.5 9 12 20M16.5 9 12 20",
  /** A water jar with the old sign for water across it. */
  water: "M9 3h6M10 3v3C7 7 5 10 5 13.5 5 17.6 8.1 21 12 21s7-3.4 7-7.5C19 10 17 7 14 6V3M7.5 14c1-1 2-1 3 0s2 1 3 0 2-1 3 0",
  /** A stone well with a rope and bucket. */
  wells: "M4 11h16M5.5 11v9h13v-9M4 5h16M7 5v6M17 5v6M12 5v4M10.5 9h3v2h-3zM5.5 15.5h13",
  /** A ram with a curled horn. */
  sheep: "M5 12.5a5.2 3.2 0 1 0 10.4 0 5.2 3.2 0 1 0-10.4 0M8 15.5V19M12.5 15.5V19M15 11.2l2.2-1.7H19v3.2l-2.6 1.2M17.4 9.4a1.7 1.7 0 1 1 1.6 2.3",
  /** A goat with swept-back horns and a beard. */
  goats: "M5 11h10M5 14.5h10M5 11v3.5M5 11 3.5 8.5M6.5 14.5V19M13.5 14.5V19M15 11l2-4.5 3 2.5-2.5 1.5M17 6.5C16 4.5 14 3.5 12 3.5M19.5 10.5v2",
  /** The head of an ox, the old first letter. */
  cattle: "M4 4.5c0 3.8 2.2 6.5 5 6.5h6c2.8 0 5-2.7 5-6.5M9 11l1.2 8.5h3.6L15 11M10.5 14.5h.01M13.5 14.5h.01",
  /** A donkey with its long ears up. */
  donkeys: "M5 11.5h9.5M5 15h9.5M5 11.5v3.5M5 11.5 3.5 14M6.5 15v4.5M13 15v4.5M14.5 11.5 17 8l3 3.5-1.5 1.5M17 8l-.8-4.5M18.2 8.6 19.5 4.5",
  /** A black goat-hair tent with its poles. */
  tents: "M2 19 5.5 9h13L22 19M5.5 9 5 19M18.5 9l.5 10M12 9v10M9.5 19v-5h5v5M2 19h20",
  /** A spear crossed over a round shield. */
  weapons: "M3 21 19 5M19 5l2-2-.5 3.5L17.5 8M9 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z",
  /** A clay oil lamp, burning. */
  morale: "M3 15c3.5 3 13.5 3 17 0l1.5-2H17c-2-1.8-8-1.8-10 0zM12 11c-1.6-1.4-1.2-3.6 0-5.5 1.2 1.9 1.6 4.1 0 5.5z",
  /** An omer jar with manna falling like coriander seed. */
  manna: "M8.5 10h7M9.5 10v1.5C7.5 12.5 6.5 14.5 6.5 16.5c0 2.6 2.4 4.5 5.5 4.5s5.5-1.9 5.5-4.5c0-2-1-4-3-5V10M9 3h.01M12 5h.01M15 3h.01M10.5 7h.01M13.5 7h.01",
  /** A rolled scroll. */
  scroll: "M6 4h11a2 2 0 0 1 2 2v12M6 4a2 2 0 0 0-2 2v1h4M6 4a2 2 0 0 1 2 2v12a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-1H10M11 9h5M11 12h5",
  /** A ram's-horn trumpet, blown for news and gatherings. */
  shofar: "M3 4.5C4 13.5 9 20.5 17 20.5M5 4.5C6.2 11.5 11 16 20 14M17 20.5 20 14M3 4.5h2M9.5 15l1-1.3M13 17.3l.7-1.5",
  /** Two tablets of stone. */
  tablet: "M4 20V8a3 3 0 0 1 6 0v12zM14 20V8a3 3 0 0 1 6 0v12zM6 11h2M6 14h2M16 11h2M16 14h2",
  /** A reed pen, for answers written back. */
  reed: "M4 20 16 8M16 8l3-3 1 1-3 3zM4 20l1-3.5L7.5 19z",
  /** A cracked jar: hunger. */
  hunger: "M9 3h6M10 3v3C7 7 5 10 5 13.5 5 17.6 8.1 21 12 21s7-3.4 7-7.5C19 10 17 7 14 6V3M12 9l-1.5 3 2.5 2-1.5 3.5",
  /** A woman and a man: the people of the clan. */
  people: "M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM16 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 9 5 17h6zM8 17v4M16 9v6M13.5 10.5h5M16 15l-2 6M16 15l2 6",
} as const;

export type GlyphName = keyof typeof GLYPHS;

export function Glyph({ name, className = "size-5" }: { name: GlyphName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d={GLYPHS[name]} />
    </svg>
  );
}

/** A glyph set in a small gold diamond, for lists. */
export function GlyphSeal({ name, tone = "text-[var(--ex-gold)]" }: { name: GlyphName; tone?: string }) {
  return (
    <span className={`relative grid size-10 shrink-0 place-items-center ${tone}`}>
      <span className="absolute inset-1.5 rotate-45 border border-current opacity-40" />
      <Glyph name={name} className="relative size-[18px]" />
    </span>
  );
}

/** A pomegranate, the game's small ornament. */
export function Pomegranate({ className = "size-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 14" aria-hidden className={className} fill="currentColor">
      <path d="M6 2.6 5 1h2ZM6 3c-2.7 0-4.2 2-4.2 4.8S3.7 13 6 13s4.2-2.4 4.2-5.2S8.7 3 6 3Z" />
    </svg>
  );
}

/** A thin gold rule with a pomegranate at its middle. */
export function Divider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 text-[var(--ex-gold)] ${className}`} aria-hidden>
      <span className="h-px flex-1 bg-linear-to-r from-transparent to-[var(--ex-rule)]" />
      <Pomegranate className="size-2.5 opacity-70" />
      <span className="h-px flex-1 bg-linear-to-l from-transparent to-[var(--ex-rule)]" />
    </div>
  );
}

/** Small-caps gold heading with a rule running out from it. */
export function ExHeading({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <h2 className="ex-heading min-w-0 flex-1">{children}</h2>
      {action && <span className="shrink-0 text-sm">{action}</span>}
    </div>
  );
}

/** The game's square, double-ruled panel. */
export function Panel({
  id,
  title,
  action,
  className = "",
  children,
}: {
  id?: string;
  title?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`ex-panel scroll-mt-24 ${className}`}>
      <div className="p-4 sm:p-6">
        {title && <ExHeading action={action}>{title}</ExHeading>}
        {children}
      </div>
    </section>
  );
}

/** A status mark: square, small caps, like a stamp on clay. */
export function Mark({
  tone = "plain",
  children,
}: {
  tone?: "plain" | "gold" | "green" | "red";
  children: React.ReactNode;
}) {
  const tones = {
    plain: "border-line-strong text-slate-400",
    gold: "border-[var(--ex-gold-soft)] text-[var(--ex-gold)]",
    green: "border-emerald-400/40 text-emerald-300",
    red: "border-rose-400/40 text-rose-300",
  };
  return (
    <span
      className={`inline-flex items-center border px-2 py-0.5 text-[10px] font-semibold tracking-[0.16em] whitespace-nowrap uppercase ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/** Sand dunes along the bottom of a banner. */
export function Dunes({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full text-[var(--ex-gold)] sm:h-24 ${className}`}
    >
      <path
        d="M0 80C150 40 300 40 420 70s260 40 380 0 280-50 400 0v50H0Z"
        fill="currentColor"
        opacity="0.05"
      />
      <path d="M0 100c200-30 380-30 560 0s420 20 640-10v30H0Z" fill="currentColor" opacity="0.07" />
    </svg>
  );
}
