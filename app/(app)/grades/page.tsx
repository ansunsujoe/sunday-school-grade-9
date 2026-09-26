import { eq } from "drizzle-orm";
import { Badge, Card, EmptyState, PageHeader, TextLink, scoreTone } from "@/components/ui";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { attendance, lessons } from "@/lib/db/schema";
import { formatDate, percent } from "@/lib/format";
import { getGradebook } from "@/lib/queries";

type Gradebook = Awaited<ReturnType<typeof getGradebook>>;

export default async function GradesPage() {
  const user = await requireUser();
  const gradebook = await getGradebook();

  if (user.role === "teacher") return <TeacherGradebook gradebook={gradebook} />;

  const me = gradebook.rows.find((r) => r.student.id === user.id);
  return <StudentGrades studentId={user.id} gradebook={gradebook} me={me} />;
}

function Score({ score }: { score?: { score: number; total: number } }) {
  if (!score) return <span className="text-stone-400">—</span>;
  const pct = percent(score.score, score.total);
  return (
    <Badge tone={scoreTone(pct)}>
      {score.score}/{score.total}
    </Badge>
  );
}

function Pct({ value }: { value: number | null }) {
  return <span className="font-medium">{value == null ? "—" : `${value}%`}</span>;
}

function TeacherGradebook({ gradebook }: { gradebook: Gradebook }) {
  const { quizzes, rows } = gradebook;
  return (
    <>
      <PageHeader
        title="Gradebook"
        description="Published quizzes and attendance. Excused absences don't count against attendance."
      />
      <Card>
        {rows.length === 0 ? (
          <EmptyState>No students yet.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-stone-200 text-stone-600">
                <tr>
                  <th className="py-2 pr-4 font-medium">Student</th>
                  {quizzes.map((q) => (
                    <th key={q.id} className="max-w-32 px-2 py-2 font-medium">
                      <TextLink href={`/quizzes/${q.id}`}>{q.title}</TextLink>
                    </th>
                  ))}
                  <th className="px-2 py-2 font-medium">Quiz avg</th>
                  <th className="px-2 py-2 font-medium">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {rows.map((row) => (
                  <tr key={row.student.id}>
                    <td className="py-2 pr-4 font-medium whitespace-nowrap">{row.student.name}</td>
                    {quizzes.map((q) => (
                      <td key={q.id} className="px-2 py-2">
                        <Score score={row.scores.get(q.id)} />
                      </td>
                    ))}
                    <td className="px-2 py-2">
                      <Pct value={row.quizAverage} />
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <Pct value={row.attendance.rate} />{" "}
                      <span className="text-xs text-stone-500">
                        ({row.attendance.present}P · {row.attendance.absent}A · {row.attendance.excused}E)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

async function StudentGrades({
  studentId,
  gradebook,
  me,
}: {
  studentId: number;
  gradebook: Gradebook;
  me: Gradebook["rows"][number] | undefined;
}) {
  const myAttendance = await db
    .select({ lesson: lessons, status: attendance.status })
    .from(attendance)
    .innerJoin(lessons, eq(attendance.lessonId, lessons.id))
    .where(eq(attendance.studentId, studentId))
    .orderBy(lessons.date);

  const statusTone = { present: "green", absent: "red", excused: "amber" } as const;

  return (
    <>
      <PageHeader title="My grades" />
      <div className="grid gap-6 md:grid-cols-2">
        <Card title={<>Quizzes · <Pct value={me?.quizAverage ?? null} /> average</>}>
          {gradebook.quizzes.length === 0 ? (
            <EmptyState>No quizzes yet.</EmptyState>
          ) : (
            <ul className="divide-y divide-stone-100">
              {gradebook.quizzes.map((q) => (
                <li key={q.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <TextLink href={`/quizzes/${q.id}`}>{q.title}</TextLink>
                  {me?.scores.has(q.id) ? (
                    <Score score={me.scores.get(q.id)} />
                  ) : (
                    <Badge tone="indigo">Not taken</Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title={<>Attendance · <Pct value={me?.attendance.rate ?? null} /></>}>
          {myAttendance.length === 0 ? (
            <EmptyState>No attendance recorded yet.</EmptyState>
          ) : (
            <ul className="divide-y divide-stone-100">
              {myAttendance.map(({ lesson, status }) => (
                <li key={lesson.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <span>
                    <span className="text-stone-500">{formatDate(lesson.date)}</span> · {lesson.title}
                  </span>
                  <Badge tone={statusTone[status]}>
                    <span className="capitalize">{status}</span>
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
