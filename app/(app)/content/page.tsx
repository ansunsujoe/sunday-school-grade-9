import Link from "next/link";
import { Icon } from "@/components/icons";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { CONTENT, contentHref, type ContentItem } from "@/lib/content";

export default function ContentListPage() {
  const items = CONTENT;
  const sections = [
    { title: "Lessons", items: items.filter((i) => i.kind === "lesson") },
    { title: "Supplementary", items: items.filter((i) => i.kind === "supplementary") },
  ];

  return (
    <>
      <PageHeader
        title="Content"
        description="Lessons and extra material for class."
      />
      {items.length === 0 ? (
        <Card>
          <EmptyState>Nothing here yet.</EmptyState>
        </Card>
      ) : (
        <div className="space-y-10">
          {sections
            .filter((s) => s.items.length > 0)
            .map((section) => (
              <section key={section.title}>
                <h2 className="mb-4 text-xs font-semibold tracking-[0.2em] text-amber-300/80 uppercase">
                  {section.title}
                </h2>
                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {section.items.map((item) => (
                    <li key={item.slug}>
                      <ContentCard item={item} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
        </div>
      )}
    </>
  );
}

function ContentCard({ item }: { item: ContentItem }) {
  // Link-only items open straight to the material; everything else has a page here.
  const external = !item.page;
  const cardClass =
    "group flex h-full items-center gap-4 rounded-2xl border border-line bg-night-900/70 p-4 transition hover:border-amber-400/30 hover:bg-night-800/70 sm:p-5";
  const inner = (
    <>
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20">
        <Icon name={item.kind === "lesson" ? "book" : "sparkle"} className="size-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-lg leading-snug font-semibold text-slate-50">
          {item.title}
        </span>
        <span className="mt-0.5 block text-sm text-slate-400">
          {item.summary ?? (external ? "Opens link" : "Read here")}
        </span>
      </span>
      <Icon
        name={external ? "external" : "chevronRight"}
        className="size-4 shrink-0 text-slate-500 transition group-hover:text-amber-300"
      />
    </>
  );

  return external ? (
    <a href={contentHref(item)} target="_blank" rel="noopener noreferrer" className={cardClass}>
      {inner}
    </a>
  ) : (
    <Link href={contentHref(item)} className={cardClass}>
      {inner}
    </Link>
  );
}
