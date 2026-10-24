/**
 * IPOpulse standard seed — creates the 3 standard TalkyTools accounts.
 *
 * IPOpulse splits accounts across two tables:
 *   - admin_users  : superadmin, admin (used by /sup-min)
 *   - users        : public/demo users (used by /signin)
 *
 * Seed passwords come from env so secrets are never committed to git
 * (_shared/ENGINEERING_CONSTITUTION.md §1.2 Secrets). Set the 4 vars below
 * in the server .env before seeding — this script refuses to run with a
 * hardcoded password.
 *
 *   SEED_UNIVERSAL_OWNER_PASSWORD  -> shubham@startuptalky.com (admin_users, role: superadmin)
 *   SEED_SUPER_ADMIN_PASSWORD      -> superadmin@ipopulse.com  (admin_users, role: superadmin)
 *   SEED_ADMIN_PASSWORD            -> admin@ipopulse.com       (admin_users, role: admin)
 *   SEED_DEMO_USER_PASSWORD        -> user@ipopulse.com        (users)
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PROJECT_DOMAIN = "ipopulse.com";

const UNIVERSAL_OWNER_PASSWORD = process.env.SEED_UNIVERSAL_OWNER_PASSWORD;
const SUPER_ADMIN_PASSWORD = process.env.SEED_SUPER_ADMIN_PASSWORD;
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;
const DEMO_USER_PASSWORD = process.env.SEED_DEMO_USER_PASSWORD;

if (!UNIVERSAL_OWNER_PASSWORD || !SUPER_ADMIN_PASSWORD || !ADMIN_PASSWORD || !DEMO_USER_PASSWORD) {
  throw new Error(
    "SEED_UNIVERSAL_OWNER_PASSWORD, SEED_SUPER_ADMIN_PASSWORD, SEED_ADMIN_PASSWORD and SEED_DEMO_USER_PASSWORD " +
      "must all be set in the environment before seeding. Refusing to seed with a hardcoded password " +
      "(_shared/ENGINEERING_CONSTITUTION.md §1.2 Secrets)."
  );
}

const SUPER_ADMIN = {
  email: process.env.SUPERADMIN_EMAIL ?? `superadmin@${PROJECT_DOMAIN}`,
  password: SUPER_ADMIN_PASSWORD,
  name: "Super Admin",
  role: "superadmin",
};

const ADMIN = {
  email: process.env.ADMIN_EMAIL ?? `admin@${PROJECT_DOMAIN}`,
  password: ADMIN_PASSWORD,
  name: "Admin",
  role: "admin",
};

const DEMO_USER = {
  email: process.env.DEMO_USER_EMAIL ?? `user@${PROJECT_DOMAIN}`,
  password: DEMO_USER_PASSWORD,
  name: "Demo User",
};

// Universal owner login — exists across ALL TalkyTools projects
const UNIVERSAL_OWNER = {
  email: "shubham@startuptalky.com",
  password: UNIVERSAL_OWNER_PASSWORD,
  name: "Shubham Kumar",
  role: "superadmin",
};

async function seedAdmin(u: typeof SUPER_ADMIN) {
  const passwordHash = await bcrypt.hash(u.password, 10);
  const row = await prisma.adminUser.upsert({
    where: { email: u.email.toLowerCase() },
    update: { passwordHash, role: u.role, name: u.name },
    create: { email: u.email.toLowerCase(), passwordHash, role: u.role, name: u.name },
  });
  console.log(`✓ admin_users   ${row.role.padEnd(11)} ${row.email}`);
}

async function seedPublicUser(u: typeof DEMO_USER) {
  const passwordHash = await bcrypt.hash(u.password, 10);
  const row = await prisma.user.upsert({
    where: { email: u.email.toLowerCase() },
    update: { passwordHash, name: u.name },
    create: { email: u.email.toLowerCase(), passwordHash, name: u.name },
  });
  console.log(`✓ users         user        ${row.email}`);
}

async function main() {
  console.log(`\n🌱 Seeding IPOpulse (${PROJECT_DOMAIN})...\n`);
  await seedAdmin(SUPER_ADMIN);
  await seedAdmin(ADMIN);
  await seedAdmin(UNIVERSAL_OWNER);
  await seedPublicUser(DEMO_USER);
  console.log("\n✅ Seed complete. Login URLs:");
  console.log("   /sup-min  — superadmin@ / admin@ / shubham@startuptalky.com");
  console.log("   /signin   — user@\n");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
