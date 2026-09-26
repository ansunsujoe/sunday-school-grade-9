// Creates the first teacher account, e.g.:
//   npm run create-teacher -- mrsmith "Mr. Smith" "a-strong-password"
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "../lib/db/schema";

config({ path: ".env.local" });

async function main() {
  const [username, name, password] = process.argv.slice(2);
  if (!username || !name || !password) {
    console.error('Usage: npm run create-teacher -- <username> "<Full Name>" <password>');
    process.exit(1);
  }
  if (password.length < 6) {
    console.error("Password must be at least 6 characters.");
    process.exit(1);
  }

  const db = drizzle(neon(process.env.DATABASE_URL!));
  await db
    .insert(users)
    .values({
      username: username.toLowerCase(),
      name,
      role: "teacher",
      passwordHash: await bcrypt.hash(password, 10),
    })
    .onConflictDoUpdate({
      target: users.username,
      set: { name, role: "teacher", passwordHash: await bcrypt.hash(password, 10) },
    });
  console.log(`Teacher account "${username.toLowerCase()}" is ready.`);
}

main();
