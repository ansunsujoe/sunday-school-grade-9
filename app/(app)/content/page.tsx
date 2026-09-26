import Link from "next/link";
import { Icon } from "@/components/icons";
import { Card, EmptyState, PageHeader, buttonClass } from "@/components/ui";
import { requireUser } from "@/lib/dal";
import { getContent } from "@/lib/queries";

type Item = Awaited<ReturnType<typeof getContent>>[number];

export default async function ContentPage() {
  const user = await requireUser();
  const isTeacher = user.role === "teacher";
  const items = await getContent();
  const sections = [
    { title: "Lessons", items: items.filter((i) => i.kind === "lesson") },
    { title: "Supplementary", items: items.filter((i) => i.kind === "supplementary") },
  ];

  return (
    <>
      <PageHeader
        title="Content"
        description="Lessons and extra material for class."
        action={
          isTeacher && (
            <Link href="/content/new" className={buttonClass}>
              New content
            </Link>
          )
        }
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
                    <li key={item.id}>
                      <ContentCard item={item} isTeacher={isTeacher} />
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

function ContentCard({ item, isTeacher }: { item: Item; isTeacher: boolean }) {
  // Link-only items open straight to the material; everything else has a page here.
  const external = !item.body && item.url;
  const cardClass =
    "group flex h-full items-center gap-4 rounded-2xl border border-white/[0.07] bg-night-900/70 p-4 transition hover:border-amber-400/30 hover:bg-night-800/70 sm:p-5";
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
          {external ? "Opens link" : item.url ? "Read here · has a link" : "Read here"}
        </span>
      </span>
      <Icon
        name={external ? "external" : "chevronRight"}
        className="size-4 shrink-0 text-slate-500 transition group-hover:text-amber-300"
      />
    </>
  );

  return (
    <div className="relative h-full">
      {external ? (
        <a href={item.url!} target="_blank" rel="noopener noreferrer" className={cardClass}>
          {inner}
        </a>
      ) : (
        <Link href={`/content/${item.id}`} className={cardClass}>
          {inner}
        </Link>
      )}
      {isTeacher && external && (
        <Link
          href={`/content/${item.id}`}
          className="absolute top-2 right-2 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-white/5 hover:text-amber-300"
        >
          Edit
        </Link>
      )}
    </div>
  );
}
