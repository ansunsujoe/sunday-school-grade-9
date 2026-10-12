import { ActionForm } from "@/components/action-form";
import { Field, inputClass, secondaryButtonClass } from "@/components/ui";
import { addMember, setClanLeader } from "@/lib/actions/exodus";
import { clanInfo } from "@/lib/exodus/clans";
import { getClan, getClanMembers, getClans, getPlayer, getStudentsForLeaders } from "@/lib/exodus/queries";
import { mannaStatus } from "@/lib/exodus/manna";
import { DEFAULT_ROLE, MAX_ROLE_LENGTH } from "@/lib/exodus/roles";
import { ClanHero, ResourcePanel } from "../../game-ui";
import { MannaSupply } from "../../manna";
import { Roster } from "./roster";
import { Panel } from "../../ornaments";

export default async function ClanPage({ params }: { params: Promise<{ slug: string }> }) {
  const player = await getPlayer();
  const row = await getClan(player, (await params).slug);
  const clan = clanInfo(row.slug);
  const members = await getClanMembers(row.slug);

  return (
    <div className="space-y-6">
      <ClanHero clan={clan} leader={row.leaderName} people={row.people} />

      <Panel title="The scribe's tally" id="supplies">
        <MannaSupply
          slug={row.slug}
          status={mannaStatus(row.fedThrough, row.people)}
          people={row.people}
          as={player.isTeacher ? "teacher" : "leader"}
        />
        <ResourcePanel resources={row.resources} people={row.people} />
      </Panel>

      <div className={player.isTeacher ? "grid gap-6 xl:grid-cols-[1fr_400px]" : ""}>
        <Panel title="The people">
          <p className="-mt-2 mb-4 text-sm text-slate-400">
            {player.isTeacher
              ? "Everyone starts as a Villager. Click a role to change it: type anything, then press Enter."
              : "Everyone starts as a Villager. The elders give each person their role."}
          </p>
          <Roster members={members} canEdit={player.isTeacher} canRemove={player.isTeacher} />
        </Panel>
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
      <Panel title="Leader">
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
      </Panel>

      <Panel title="Add a person">
        <ActionForm action={addMember} submitLabel="Add" resetOnSuccess>
          <input type="hidden" name="slug" value={row.slug} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name" htmlFor="name">
              <input id="name" name="name" required className={inputClass} />
            </Field>
            <Field label="Role" htmlFor="role">
              <input
                id="role"
                name="role"
                list="clan-roles"
                placeholder={DEFAULT_ROLE}
                maxLength={MAX_ROLE_LENGTH}
                className={inputClass}
              />
            </Field>
          </div>
        </ActionForm>
      </Panel>

    </>
  );
}
