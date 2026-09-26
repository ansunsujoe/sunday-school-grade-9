import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { SESSION_COOKIE, decrypt } from "@/lib/session";

// Looks the user up in the database on every request (deduped per render), so
// deleted accounts lose access immediately even with a valid cookie.
export const getCurrentUser = cache(async () => {
  const session = await decrypt((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return null;

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, session.userId));
  return user ?? null;
});

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireTeacher() {
  const user = await requireUser();
  if (user.role !== "teacher") redirect("/");
  return user;
}

export async function requireStudent() {
  const user = await requireUser();
  if (user.role !== "student") redirect("/");
  return user;
}
