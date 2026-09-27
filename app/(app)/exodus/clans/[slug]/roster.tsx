"use client";

import { useMemo, useState, useTransition } from "react";
import { ConfirmButton } from "@/components/confirm-button";
import { inputClass } from "@/components/ui";
import { removeMember, setMemberRole } from "@/lib/actions/exodus";
import { CLAN_ROLES } from "@/lib/exodus/roles";

type Member = { id: number; name: string; role: string };

/**
 * A clan's people: counts by role, a search box, and (for the leader and
 * teachers) a role picker on every row. Teachers can also remove people.
 */
export function Roster({
  members,
  canEdit,
  canRemove,
}: {
  members: Member[];
  canEdit: boolean;
  canRemove: boolean;
}) {
  // Local copy so a role change shows at once, before the server confirms it.
  const [roles, setRoles] = useState<Record<number, string>>({});
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const roleOf = (m: Member) => roles[m.id] ?? m.role;

  const counts = useMemo(() => {
    const byRole = new Map<string, number>();
    for (const m of members) {
      const role = roles[m.id] ?? m.role;
      byRole.set(role, (byRole.get(role) ?? 0) + 1);
    }
    return CLAN_ROLES.map((r) => ({ role: r.name, n: byRole.get(r.name) ?? 0 })).filter((r) => r.n > 0);
  }, [members, roles]);

  const q = query.trim().toLowerCase();
  const shown = members.filter(
    (m) => (!q || m.name.toLowerCase().includes(q)) && (!roleFilter || roleOf(m) === roleFilter),
  );

  const changeRole = (id: number, role: string) => {
    setRoles((prev) => ({ ...prev, [id]: role }));
    startTransition(() => setMemberRole(id, role));
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setRoleFilter(null)}
          className={chip(roleFilter === null)}
        >
          Everyone <span className="text-slate-500">{members.length}</span>
        </button>
        {counts.map(({ role, n }) => (
          <button
            key={role}
            type="button"
            onClick={() => setRoleFilter(roleFilter === role ? null : role)}
            className={chip(roleFilter === role)}
          >
            {role} <span className="text-slate-500">{n}</span>
          </button>
        ))}
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search ${members.length.toLocaleString()} people…`}
        aria-label="Search people"
        className={`${inputClass} mb-3`}
      />

      {shown.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">No one matches.</p>
      ) : (
        <ul className="grid gap-x-6 sm:grid-cols-2 2xl:grid-cols-3">
          {shown.map((m) => (
            <li key={m.id} className="flex min-h-12 items-center gap-2 border-b border-line-faint py-1.5">
              <span className="min-w-0 flex-1 truncate text-sm text-slate-100" title={m.name}>
                {m.name}
              </span>
              {canEdit ? (
                <select
                  value={roleOf(m)}
                  onChange={(e) => changeRole(m.id, e.target.value)}
                  aria-label={`Role for ${m.name}`}
                  className="min-h-9 w-36 shrink-0 rounded-lg border border-line bg-night-800/80 px-2 text-sm text-slate-200 focus:border-amber-400/60 focus:outline-none"
                >
                  {CLAN_ROLES.map((r) => (
                    <option key={r.name} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="shrink-0 text-sm text-slate-400">{roleOf(m)}</span>
              )}
              {canRemove && (
                <form action={removeMember}>
                  <input type="hidden" name="id" value={m.id} />
                  <ConfirmButton
                    label="✕"
                    confirmLabel="Remove?"
                    className="grid min-h-9 min-w-9 place-items-center rounded-lg px-2 text-xs text-slate-500 transition hover:bg-rose-400/10 hover:text-rose-300"
                  />
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function chip(active: boolean) {
  return `rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${
    active
      ? "bg-amber-400/15 text-amber-200 ring-amber-400/30"
      : "bg-wash text-slate-300 ring-line hover:bg-wash-hover"
  }`;
}
