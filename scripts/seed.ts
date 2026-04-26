/**
 * IPOpulse standard seed — creates the 3 standard TalkyTools accounts.
 *
 * IPOpulse splits accounts across two tables:
 *   - admin_users  : superadmin, admin (used by /sup-min)
 *   - users        : public/demo users (used by /signin)
 *
 * Passwords are FIXED at the values below so master dashboard login works
 * across all 49 projects. Override only via env vars in special cases.
 *
 *   superadmin@ipopulse.com / Shu_bham12!   (table: admin_users, role: superadmin)
 *   admin@ipopulse.com      / Admin@2026!   (table: admin_users, role: admin)
 *   user@ipopulse.com       / User@2026!    (table: users)
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PROJECT_DOMAIN = "ipopulse.com";

const SUPER_ADMIN = {
  email: process.env.SUPERADMIN_EMAIL ?? `superadmin@${PROJECT_DOMAIN}`,
  password: process.env.SUPERADMIN_PASSWORD ?? "Shu_bham12!",
  name: "Super Admin",
  role: "superadmin",
};

const ADMIN = {
  email: process.env.ADMIN_EMAIL ?? `admin@${PROJECT_DOMAIN}`,
  password: process.env.ADMIN_PASSWORD ?? "Admin@2026!",
  name: "Admin",
  role: "admin",
};

const DEMO_USER = {
  email: process.env.DEMO_USER_EMAIL ?? `user@${PROJECT_DOMAIN}`,
  password: process.env.DEMO_USER_PASSWORD ?? "User@2026!",
  name: "Demo User",
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
  await seedPublicUser(DEMO_USER);
  console.log("\n✅ Seed complete. Login URLs:");
  console.log("   /sup-min  — superadmin@ / admin@");
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
