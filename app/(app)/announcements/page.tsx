import Link from "next/link";
import { Icon } from "@/components/icons";
import { Markdown } from "@/components/markdown";
import { Card, EmptyState, PageHeader, buttonClass } from "@/components/ui";
import { requireUser } from "@/lib/dal";
import { formatDateTime, timeAgo } from "@/lib/format";
import { getAnnouncements } from "@/lib/queries";
import { AnnouncementFrame, MarkRead } from "./read-tracking";

export default async function AnnouncementsPage() {
  const user = await requireUser();
  const isTeacher = user.role === "teacher";
  const items = await getAnnouncements(user);
  const unreadIds = items.filter((a) => a.unread).map((a) => a.id);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Announcements"
        description={
          unreadIds.length > 0
            ? `${unreadIds.length} new since you last checked.`
            : "News and reminders from your teachers."
        }
        action={
          isTeacher && (
            <Link href="/announcements/new" className={buttonClass}>
              <Icon name="plus" className="size-4" /> New announcement
            </Link>
          )
        }
      />
      <MarkRead ids={unreadIds} />

      {items.length === 0 ? (
        <Card>
          <EmptyState>No announcements yet.</EmptyState>
        </Card>
      ) : (
        <ol className="space-y-4">
          {items.map((a) => (
            <li key={a.id}>
              <AnnouncementFrame id={a.id} unread={a.unread}>
                <header className="flex items-start gap-3 pr-14">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20">
                    <Icon name="megaphone" className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-display text-xl leading-snug font-semibold text-balance text-slate-50">
                      {a.title}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {a.author ?? "A teacher"} ·{" "}
                      <time dateTime={a.createdAt.toISOString()} title={formatDateTime(a.createdAt)}>
                        {formatDateTime(a.createdAt)}
                      </time>
                      {a.updatedAt && (
                        <span title={`Edited ${formatDateTime(a.updatedAt)}`}> · edited</span>
                      )}
                      <span className="text-slate-500"> · {timeAgo(a.createdAt)}</span>
                    </p>
                  </div>
                </header>
                <div className="mt-4 sm:pl-13">
                  <Markdown compact>{a.body}</Markdown>
                </div>
                {isTeacher && (
                  <div className="mt-4 flex justify-end">
                    <Link
                      href={`/announcements/${a.id}/edit`}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-amber-200"
                    >
                      <Icon name="pencil" className="size-3.5" /> Edit
                    </Link>
                  </div>
                )}
              </AnnouncementFrame>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
