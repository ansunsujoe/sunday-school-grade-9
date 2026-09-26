import { Icon, type IconName } from "@/components/icons";
import { EmptyState } from "@/components/ui";
import type { NotificationKind } from "@/lib/db/schema";
import { formatDateTime, timeAgo } from "@/lib/format";
import { NotificationFrame } from "./notification-frame";

type Item = {
  id: number;
  kind: NotificationKind;
  title: string;
  body: string | null;
  href: string | null;
  read: boolean;
  createdAt: Date;
};

const KINDS: Record<NotificationKind, { icon: IconName; tone: string }> = {
  scenario: { icon: "scroll", tone: "bg-amber-400/10 text-amber-300 ring-amber-400/20" },
  news: { icon: "news", tone: "bg-sky-400/10 text-sky-300 ring-sky-400/20" },
  resources: { icon: "sparkle", tone: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20" },
  response: { icon: "pencil", tone: "bg-indigo-400/10 text-indigo-300 ring-indigo-400/20" },
  message: { icon: "megaphone", tone: "bg-rose-400/10 text-rose-300 ring-rose-400/20" },
};

/** Notifications newest first; unread ones are highlighted. */
export function NotificationList({
  items,
  compact = false,
}: {
  items: Item[];
  compact?: boolean;
}) {
  if (items.length === 0) return <EmptyState>Nothing yet.</EmptyState>;
  return (
    <ul className={compact ? "divide-y divide-white/5" : "space-y-2"}>
      {items.map((n) => {
        const kind = KINDS[n.kind] ?? KINDS.message;
        return (
          <li key={n.id}>
            <NotificationFrame unread={!n.read} compact={compact} href={n.href}>
              <span className={`grid size-9 shrink-0 place-items-center rounded-xl ring-1 ${kind.tone}`}>
                <Icon name={kind.icon} className="size-4.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-slate-50">{n.title}</span>
                {n.body && <span className="mt-0.5 block text-sm whitespace-pre-line text-slate-400">{n.body}</span>}
                <span className="mt-1 block text-xs text-slate-500" title={formatDateTime(n.createdAt)}>
                  {timeAgo(n.createdAt)}
                </span>
              </span>
            </NotificationFrame>
          </li>
        );
      })}
    </ul>
  );
}
