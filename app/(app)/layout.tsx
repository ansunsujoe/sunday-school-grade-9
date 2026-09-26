import Link from "next/link";
import { NavLinks } from "@/components/nav-links";
import { logout } from "@/lib/actions/auth";
import { requireUser } from "@/lib/dal";

const TEACHER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/lessons", label: "Lessons" },
  { href: "/quizzes", label: "Quizzes" },
  { href: "/grades", label: "Gradebook" },
  { href: "/people", label: "People" },
];

const STUDENT_LINKS = [
  { href: "/", label: "Home" },
  { href: "/lessons", label: "Lessons" },
  { href: "/quizzes", label: "Quizzes" },
  { href: "/grades", label: "My grades" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const links = user.role === "teacher" ? TEACHER_LINKS : STUDENT_LINKS;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/" className="font-semibold text-stone-900">
              ✝ Grade 9 Sunday School
            </Link>
            <NavLinks links={links} />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/account" className="text-stone-600 hover:text-stone-900">
              {user.name}
            </Link>
            <form action={logout}>
              <button className="text-stone-500 hover:text-stone-900">Log out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
