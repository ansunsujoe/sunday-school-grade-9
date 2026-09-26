# Grade 9 Sunday School

A small class app for lessons, attendance, quizzes, and grades.

- **Teachers** manage student accounts, schedule lessons, take attendance, write multiple-choice quizzes, and see the full gradebook.
- **Students** log in to see upcoming lessons, take published quizzes (graded automatically, one attempt), and view their own grades and attendance.

Built with Next.js, Neon Postgres, and Drizzle ORM.

## One-time setup on Vercel

1. **Add a database.** In the Vercel dashboard, open this project → **Storage** → **Create Database** → **Neon** (the free plan is plenty). Connect it to the project for all environments. Vercel adds `DATABASE_URL` to the project's environment variables automatically.
2. **Add a session secret.** Project → **Settings** → **Environment Variables** → add `SESSION_SECRET` with a random value (generate one with `openssl rand -base64 32`).
3. **Pull the variables locally:**
   ```bash
   npm i -g vercel
   vercel link
   vercel env pull .env.local
   ```
4. **Create the tables:**
   ```bash
   npm run db:push
   ```
5. **Create your teacher account:**
   ```bash
   npm run create-teacher -- mrsmith "Mr. Smith" "a-good-password"
   ```
6. **Redeploy** (push to `main`, or click Redeploy in Vercel) so the new environment variables take effect.

Then sign in, go to **People**, and create an account for each student.

## Running locally

```bash
npm install
npm run dev
```

This uses whatever `DATABASE_URL` is in `.env.local`. By default that's the same database as the live site, so anything you change locally shows up for students too.

## Changing the database schema

Edit `lib/db/schema.ts`, then run `npm run db:push` to apply the change. `npm run db:studio` opens a browser view of the data.

## Settings

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon connection string (set by Vercel) |
| `SESSION_SECRET` | Signs login cookies. Changing it logs everyone out. |
| `APP_TIME_ZONE` | Optional. Decides which lessons count as "upcoming". Defaults to `America/Chicago`. |
