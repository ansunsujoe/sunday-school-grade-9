import Link from "next/link";
import { Icon } from "@/components/icons";
import { EmptyState, buttonClass } from "@/components/ui";
import { getNews, getPlayer } from "@/lib/exodus/queries";
import { plainText } from "@/lib/format";
import { Byline, readingMinutes } from "./news-ui";
import { Dunes, ExHeading, Glyph, Panel } from "../ornaments";

export default async function NewsPage() {
  const player = await getPlayer();
  const [featured, ...rest] = await getNews();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">Camp News</h1>
          <p className="mt-1 text-sm text-slate-400">Word from across the camp of Israel, as Joshua tells it.</p>
        </div>
        {player.isTeacher && (
          <Link href="/exodus/news/new" className={buttonClass}>
            <Icon name="plus" className="size-4" /> Post news
          </Link>
        )}
      </div>

      {!featured ? (
        <Panel>
          <EmptyState>No news yet.</EmptyState>
        </Panel>
      ) : (
        <>
          <Link
            href={`/exodus/news/${featured.id}`}
            className="ex-panel group block overflow-hidden transition hover:border-[var(--ex-gold-soft)]"
          >
            <div className="pointer-events-none absolute -top-32 -right-24 size-96 rounded-full bg-amber-400/10 blur-3xl" />
            <Glyph
              name="shofar"
              className="pointer-events-none absolute -right-8 -bottom-10 hidden size-72 text-[var(--ex-gold)] opacity-[0.07] md:block"
            />
            <Dunes />
            <div className="relative max-w-4xl p-6 sm:p-10">
              <p className="font-display text-xs font-semibold tracking-[0.25em] text-[var(--ex-gold)] uppercase">
                Hear, O Israel · The latest
              </p>
              <h2 className="mt-3 font-display text-3xl leading-tight font-semibold text-balance text-slate-50 transition group-hover:text-[var(--ex-gold)] sm:text-5xl">
                {featured.title}
              </h2>
              <p className="mt-4 line-clamp-3 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
                {plainText(featured.content)}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <Byline date={featured.createdAt} minutes={readingMinutes(featured.content)} />
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--ex-gold)]">
                  Read the story <Icon name="chevronRight" className="size-4 transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </Link>

          {rest.length > 0 && (
            <section>
              <ExHeading>Earlier</ExHeading>
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {rest.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/exodus/news/${a.id}`}
                      className="ex-panel group flex h-full flex-col p-5 transition hover:border-[var(--ex-gold-soft)]"
                    >
                      <h3 className="font-display text-xl leading-snug font-semibold text-balance text-slate-50 group-hover:text-[var(--ex-gold)]">
                        {a.title}
                      </h3>
                      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-slate-400">{plainText(a.content)}</p>
                      <div className="mt-5 border-t border-line-subtle pt-4">
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
