import { ActionForm } from "@/components/action-form";
import { Card, EmptyState, Field, inputClass } from "@/components/ui";
import { sendMessage } from "@/lib/actions/exodus";
import { CLANS } from "@/lib/exodus/clans";
import { getNotifications, getPlayer } from "@/lib/exodus/queries";
import { ClanPicker } from "../clan-picker";
import { MarkNotificationsRead } from "./mark-read";
import { NotificationList } from "./notification-list";

export default async function NotificationsPage() {
  const player = await getPlayer();
  const items = await getNotifications(player);
  const unread = items.filter((n) => !n.read);

  const inbox =
    !player.isTeacher && !player.clan ? (
      <Card>
        <EmptyState>Notifications appear here once you lead a clan.</EmptyState>
      </Card>
    ) : (
      <div>
        <p className="mb-3 text-sm text-slate-400">
          {unread.length > 0
            ? `${unread.length} new.`
            : player.isTeacher
              ? "Clan answers to scenarios show up here."
              : "News, scenarios, and changes to your supplies show up here."}
        </p>
        <MarkNotificationsRead upTo={unread[0]?.id ?? null} />
        <NotificationList items={items} />
      </div>
    );

  if (!player.isTeacher) return <div className="max-w-3xl">{inbox}</div>;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {inbox}
      <Card title="Send a notification" className="h-fit">
        <ActionForm action={sendMessage} submitLabel="Send" pendingLabel="Sending…" resetOnSuccess>
          <ClanPicker clans={CLANS} />
          <Field label="Message" htmlFor="title">
            <input
              id="title"
              name="title"
              required
              placeholder="e.g. The pillar of cloud has moved"
              className={inputClass}
            />
          </Field>
          <Field label="Details (optional)" htmlFor="body">
            <textarea id="body" name="body" rows={4} className={`${inputClass} leading-6`} />
          </Field>
        </ActionForm>
      </Card>
    </div>
  );
}
