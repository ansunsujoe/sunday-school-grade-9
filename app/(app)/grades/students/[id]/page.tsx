import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { PageHeader } from "@/components/ui";
import { requireTeacher } from "@/lib/dal";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getWeeklyGrades } from "@/lib/queries";
import { SeasonView } from "../../season-view";

export default async function StudentSeasonPage({ params }: { params: Promise<{ id: string }> }) {
  await requireTeacher();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [student] = await db
    .select({ name: users.name, username: users.username })
    .from(users)
    .where(and(eq(users.id, id), eq(users.role, "student")));
  if (!student) notFound();

  return (
    <>
      <Link
        href="/grades"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-100"
      >
        <Icon name="arrowLeft" className="size-4" /> Gradebook
      </Link>
      <PageHeader eyebrow={`@${student.username}`} title={student.name} />
      <SeasonView grades={await getWeeklyGrades(id)} />
    </>
  );
}
