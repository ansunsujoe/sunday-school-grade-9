import Link from "next/link";
import { Icon } from "@/components/icons";
import { Markdown } from "@/components/markdown";
import { Card, EmptyState, buttonClass } from "@/components/ui";
import { getNews, getPlayer } from "@/lib/exodus/queries";
import { formatDateTime } from "@/lib/format";

export default async function NewsPage() {
  const player = await getPlayer();
  const articles = await getNews();

  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">What&apos;s happening across the camp.</p>
        {player.isTeacher && (
          <Link href="/exodus/news/new" className={buttonClass}>
            <Icon name="plus" className="size-4" /> Post news
          </Link>
        )}
      </div>

      {articles.length === 0 ? (
        <Card>
          <EmptyState>No news yet.</EmptyState>
        </Card>
      ) : (
        <ol className="space-y-4">
          {articles.map((a, i) => (
            <li key={a.id}>
              <article
                id={`n-${a.id}`}
                className="scroll-mt-24 rounded-2xl border border-white/[0.07] bg-night-900/70 p-5 shadow-xl shadow-black/20 sm:p-6"
              >
                {i === 0 && (
                  <p className="mb-2 text-[11px] font-bold tracking-[0.2em] text-amber-300 uppercase">Latest</p>
                )}
                <h2 className="font-display text-2xl leading-snug font-semibold text-balance text-slate-50">
                  {a.title}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDateTime(a.createdAt)}
                  {a.updatedAt && " · edited"}
                </p>
                <div className="mt-4 border-t border-white/[0.06] pt-4">
                  <Markdown compact>{a.content}</Markdown>
                </div>
                {player.isTeacher && (
                  <div className="mt-4 flex justify-end">
                    <Link
                      href={`/exodus/news/${a.id}/edit`}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-amber-200"
                    >
                      <Icon name="pencil" className="size-3.5" /> Edit
                    </Link>
                  </div>
                )}
              </article>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
