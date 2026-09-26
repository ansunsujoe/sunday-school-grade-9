import Link from "next/link";
import { Icon } from "@/components/icons";
import { Card, EmptyState, buttonClass } from "@/components/ui";
import { getNews, getPlayer } from "@/lib/exodus/queries";
import { plainText } from "@/lib/format";
import { Byline, readingMinutes } from "./news-ui";

export default async function NewsPage() {
  const player = await getPlayer();
  const [featured, ...rest] = await getNews();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">Camp News</h1>
          <p className="mt-1 text-sm text-slate-400">What&apos;s happening across the camp of Israel.</p>
        </div>
        {player.isTeacher && (
          <Link href="/exodus/news/new" className={buttonClass}>
            <Icon name="plus" className="size-4" /> Post news
          </Link>
        )}
      </div>

      {!featured ? (
        <Card>
          <EmptyState>No news yet.</EmptyState>
        </Card>
      ) : (
        <>
          <Link
            href={`/exodus/news/${featured.id}`}
            className="group relative block overflow-hidden rounded-3xl border border-amber-300/15 bg-linear-to-br from-night-800 via-night-900 to-night-950 p-6 shadow-2xl shadow-black/30 transition hover:border-amber-300/30 sm:p-10"
          >
            <div className="pointer-events-none absolute -top-32 -right-24 size-96 rounded-full bg-amber-400/15 blur-3xl" />
            <Icon
              name="news"
              className="pointer-events-none absolute -right-10 -bottom-12 hidden size-72 text-amber-200/[0.04] md:block"
            />
            <div className="relative max-w-4xl">
              <p className="text-xs font-bold tracking-[0.22em] text-amber-300 uppercase">Latest</p>
              <h2 className="mt-3 font-display text-3xl leading-tight font-semibold text-balance text-slate-50 transition group-hover:text-amber-50 sm:text-5xl">
                {featured.title}
              </h2>
              <p className="mt-4 line-clamp-3 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
                {plainText(featured.content)}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <Byline date={featured.createdAt} minutes={readingMinutes(featured.content)} />
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-300 group-hover:text-amber-200">
                  Read the story <Icon name="chevronRight" className="size-4 transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </Link>

          {rest.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">Earlier</h2>
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {rest.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/exodus/news/${a.id}`}
                      className="group flex h-full flex-col rounded-2xl border border-white/[0.07] bg-night-900/70 p-5 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-night-800/70"
                    >
                      <h3 className="font-display text-xl leading-snug font-semibold text-balance text-slate-50 group-hover:text-amber-50">
                        {a.title}
                      </h3>
                      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-slate-400">{plainText(a.content)}</p>
                      <div className="mt-5 border-t border-white/[0.06] pt-4">
                        <Byline date={a.createdAt} minutes={readingMinutes(a.content)} size="sm" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
