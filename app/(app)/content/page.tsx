import Link from "next/link";
import { Icon } from "@/components/icons";
import { Card, EmptyState, PageHeader, Seal, buttonClass } from "@/components/ui";
import { CONTENT, contentHref, type ContentItem } from "@/lib/content";
import { requireUser } from "@/lib/dal";
import { QuizList } from "../quizzes/quiz-list";

export default async function ContentListPage() {
  const user = await requireUser();
  const lessons = CONTENT.filter((i) => i.kind === "lesson");
  const extras = CONTENT.filter((i) => i.kind === "supplementary");

  return (
    <>
      <PageHeader title="Content" description="Lessons, quizzes, and extra material for class." />
      <div className="space-y-10">
        <ContentSection title="Lessons" items={lessons} empty="No lessons posted yet." />
        <section id="quizzes" className="scroll-mt-24">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className={headingClass}>Quizzes</h2>
            {user.role === "teacher" && (
              <Link href="/quizzes/new" className={`${buttonClass} min-h-9 px-4`}>
                New quiz
              </Link>
            )}
          </div>
          {user.role === "teacher" && (
            <p className="-mt-2 mb-3 text-sm text-slate-500">Drafts are only visible to teachers until you publish them.</p>
          )}
          <QuizList user={user} />
        </section>
        {extras.length > 0 && <ContentSection title="Supplementary" items={extras} />}
      </div>
    </>
  );
}

const headingClass = "text-xs font-semibold tracking-[0.2em] text-amber-300/80 uppercase";

function ContentSection({ title, items, empty }: { title: string; items: ContentItem[]; empty?: string }) {
  return (
    <section>
      <h2 className={`${headingClass} mb-4`}>{title}</h2>
      {items.length === 0 ? (
        <Card>
          <EmptyState>{empty}</EmptyState>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <li key={item.slug}>
              <ContentCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ContentCard({ item }: { item: ContentItem }) {
  // Link-only items open straight to the material; everything else has a page here.
  const external = !item.page;
  const cardClass =
    "group ex-panel flex h-full items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px] hover:shadow-amber-500/30 sm:p-5";
  const inner = (
    <>
      <Seal className="size-12">
        <Icon name={item.kind === "lesson" ? "book" : "sparkle"} className="size-5" />
      </Seal>
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
