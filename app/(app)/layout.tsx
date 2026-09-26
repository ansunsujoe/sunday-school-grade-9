import Link from "next/link";
import { Icon, LogoMark } from "@/components/icons";
import { NavLinks, TabBar } from "@/components/nav-links";
import { logout } from "@/lib/actions/auth";
import { requireUser } from "@/lib/dal";
import { getUnreadAnnouncementCount } from "@/lib/queries";

const TEACHER_LINKS = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/content", label: "Content", icon: "book" },
  { href: "/calendar", label: "Calendar", icon: "calendar" },
  { href: "/quizzes", label: "Quizzes", icon: "quiz" },
  { href: "/grades", label: "Gradebook", icon: "grades" },
  { href: "/people", label: "People", icon: "people" },
] as const;

const STUDENT_LINKS = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/content", label: "Content", icon: "book" },
  { href: "/calendar", label: "Calendar", icon: "calendar" },
  { href: "/quizzes", label: "Quizzes", icon: "quiz" },
  { href: "/grades", label: "My grades", icon: "grades" },
] as const;

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const links = [...(user.role === "teacher" ? TEACHER_LINKS : STUDENT_LINKS)];
  const unread = await getUnreadAnnouncementCount(user);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-night-950/75 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:px-6">
          <div className="flex min-w-0 items-center gap-6">
            <Link href="/" className="flex min-w-0 items-center gap-2.5">
              <LogoMark />
              <span className="leading-tight">
                <span className="block font-display text-[15px] font-semibold text-slate-50">
                  Grade 9
                </span>
                <span className="block text-[11px] tracking-[0.18em] text-amber-300/80 uppercase">
                  Sunday School
                </span>
              </span>
            </Link>
            <NavLinks links={links} />
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/announcements"
              className="relative grid size-10 place-items-center rounded-full text-slate-400 transition hover:bg-white/5 hover:text-slate-100"
              title="Announcements"
              aria-label={unread ? `Announcements, ${unread} unread` : "Announcements"}
            >
              <Icon name="bell" className={unread ? "size-5 text-amber-200" : "size-5"} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-amber-400 px-1 text-[10px] leading-none font-bold text-night-950 shadow-[0_0_10px] shadow-amber-400/60 ring-2 ring-night-950">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
            <Link
              href="/account"
              className="flex items-center gap-2 rounded-full py-1 pr-1 pl-1 text-sm text-slate-300 transition hover:bg-white/5 sm:pr-3"
              title="My account"
            >
              <span className="grid size-8 place-items-center rounded-full bg-night-700 text-xs font-semibold text-amber-200 ring-1 ring-amber-400/30">
                {initials(user.name)}
              </span>
              <span className="hidden sm:inline">{user.name}</span>
            </Link>
            <form action={logout}>
              <button
                className="grid size-10 place-items-center rounded-full text-slate-400 transition hover:bg-white/5 hover:text-slate-100"
                title="Log out"
                aria-label="Log out"
              >
                <Icon name="logout" />
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="w-full flex-1 px-4 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-5 sm:pt-8 md:pb-10 lg:px-6">
        {children}
      </main>
      <TabBar links={links} />
    </div>
  );
}
