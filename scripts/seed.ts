import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db";
import { UserRole } from "../src/generated/prisma/enums";

interface SeedUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

function readUser(prefix: "ADMIN" | "USER"): SeedUser | null {
  const email = process.env[`SEED_${prefix}_EMAIL`];
  const password = process.env[`SEED_${prefix}_PASSWORD`];
  const name = process.env[`SEED_${prefix}_NAME`];
  if (!email || !password || !name) return null;
  return {
    email,
    password,
    name,
    role: prefix === "ADMIN" ? UserRole.ADMIN : UserRole.USER,
  };
}

async function upsertUser(u: SeedUser) {
  const passwordHash = await bcrypt.hash(u.password, 12);
  const result = await prisma.user.upsert({
    where: { email: u.email },
    create: {
      email: u.email,
      name: u.name,
      passwordHash,
      role: u.role,
    },
    update: {
      name: u.name,
      passwordHash,
      role: u.role,
    },
  });
  return result;
}

async function main() {
  const admin = readUser("ADMIN");
  const user = readUser("USER");

  if (!admin && !user) {
    console.error(
      "No seed users defined. Set SEED_ADMIN_* and/or SEED_USER_* env vars (EMAIL, PASSWORD, NAME).",
    );
    process.exit(1);
  }

  if (admin) {
    const r = await upsertUser(admin);
    console.log(`Upserted ADMIN: ${r.email} (${r.id})`);
  }
  if (user) {
    const r = await upsertUser(user);
    console.log(`Upserted USER:  ${r.email} (${r.id})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
