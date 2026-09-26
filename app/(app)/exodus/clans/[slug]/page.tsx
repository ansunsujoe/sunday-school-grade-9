import { ActionForm } from "@/components/action-form";
import { Card, Field, inputClass, secondaryButtonClass } from "@/components/ui";
import { addMember, setClanLeader } from "@/lib/actions/exodus";
import { clanInfo } from "@/lib/exodus/clans";
import { getClan, getClanMembers, getClans, getPlayer, getStudentsForLeaders } from "@/lib/exodus/queries";
import { CLAN_ROLES } from "@/lib/exodus/roles";
import { ClanHero, ResourcePanel } from "../../game-ui";
import { Roster } from "./roster";

export default async function ClanPage({ params }: { params: Promise<{ slug: string }> }) {
  const player = await getPlayer();
  const row = await getClan(player, (await params).slug);
  const clan = clanInfo(row.slug);
  const members = await getClanMembers(row.slug);

  return (
    <div className="space-y-6">
      <ClanHero clan={clan} leader={row.leaderName} people={row.people} />

      <Card title="Supplies">
        <ResourcePanel resources={row.resources} people={row.people} />
      </Card>

      <div className={player.isTeacher ? "grid gap-6 xl:grid-cols-[1fr_400px]" : ""}>
        <Card title="People">
          <p className="-mt-2 mb-4 text-sm text-slate-400">
            {player.isTeacher
              ? "Everyone starts as a Villager. The clan's leader can give out roles too."
              : "Everyone starts as a Villager. As leader, give each person a job the clan needs."}
          </p>
          <Roster members={members} canEdit canRemove={player.isTeacher} />
        </Card>
        {player.isTeacher && (
          <div className="space-y-6">
            <TeacherTools row={row} />
          </div>
        )}
      </div>
    </div>
  );
}

async function TeacherTools({ row }: { row: Awaited<ReturnType<typeof getClan>> }) {
  const [students, clans] = await Promise.all([getStudentsForLeaders(), getClans()]);
  const leading = new Map(clans.filter((c) => c.leaderId).map((c) => [c.leaderId, clanInfo(c.slug).name]));

  return (
    <>
      <Card title="Leader">
        <form action={setClanLeader} className="flex flex-wrap gap-2">
          <input type="hidden" name="slug" value={row.slug} />
          <select
            name="leaderId"
            defaultValue={row.leaderId ?? ""}
            aria-label="Clan leader"
            className={`${inputClass} min-w-0 flex-1`}
          >
            <option value="">No leader</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {leading.has(s.id) && s.id !== row.leaderId ? ` (leads ${leading.get(s.id)})` : ""}
              </option>
            ))}
          </select>
          <button className={secondaryButtonClass}>Save</button>
        </form>
        <p className="mt-2 text-xs text-slate-500">A student leads one clan at a time.</p>
      </Card>

      <Card title="Add a person">
        <ActionForm action={addMember} submitLabel="Add" resetOnSuccess>
          <input type="hidden" name="slug" value={row.slug} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name" htmlFor="name">
              <input id="name" name="name" required className={inputClass} />
            </Field>
            <Field label="Role" htmlFor="role">
              <select id="role" name="role" className={inputClass}>
                {CLAN_ROLES.map((r) => (
                  <option key={r.name}>{r.name}</option>
                ))}
              </select>
            </Field>
          </div>
        </ActionForm>
      </Card>

    </>
  );
}
