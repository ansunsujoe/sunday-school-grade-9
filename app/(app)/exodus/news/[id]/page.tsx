import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { Markdown } from "@/components/markdown";
import { Card, secondaryButtonClass } from "@/components/ui";
import { getNews, getPlayer } from "@/lib/exodus/queries";
import { timeAgo } from "@/lib/format";
import { BackLink } from "../../game-ui";
import { Byline, readingMinutes } from "../news-ui";

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const player = await getPlayer();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const all = await getNews();
  const article = all.find((a) => a.id === id);
  if (!article) notFound();
  const more = all.filter((a) => a.id !== id).slice(0, 5);

  return (
    <div>
      <BackLink href="/exodus/news">Camp News</BackLink>
      <header className="mb-6 border-b border-line pb-6">
        <p className="text-xs font-bold tracking-[0.22em] text-amber-300 uppercase">Camp News</p>
        <h1 className="mt-2 max-w-5xl font-display text-4xl leading-tight font-semibold tracking-tight text-balance text-slate-50 sm:text-5xl">
          {article.title}
        </h1>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <Byline date={article.createdAt} minutes={readingMinutes(article.content)} />
          {player.isTeacher && (
            <Link href={`/exodus/news/${id}/edit`} className={secondaryButtonClass}>
              <Icon name="pencil" className="size-4" /> Edit
            </Link>
          )}
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <article className="h-fit rounded-2xl border border-line bg-night-900/70 p-5 shadow-xl shadow-black/20 sm:p-8">
          <Markdown>{article.content}</Markdown>
          {article.updatedAt && <p className="mt-6 text-xs text-slate-500">Updated {timeAgo(article.updatedAt)}</p>}
        </article>

        {more.length > 0 && (
          <Card title="More news" className="h-fit xl:sticky xl:top-24">
            <ul className="-mt-1 divide-y divide-white/5">
              {more.map((a) => (
                <li key={a.id}>
                  <Link href={`/exodus/news/${a.id}`} className="group block py-3">
                    <span className="block font-display text-base leading-snug font-semibold text-slate-100 group-hover:text-amber-100">
                      {a.title}
                    </span>
                    <span className="text-xs text-slate-500">{timeAgo(a.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
