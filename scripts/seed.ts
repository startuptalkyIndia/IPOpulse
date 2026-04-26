import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Seed both standard accounts per project_admin_access.md rule:
 *   - superadmin@<project>.com  (role: superadmin)
 *   - admin@<project>.com       (role: admin)
 *
 * Override via env: SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD,
 *                   ADMIN_EMAIL, ADMIN_PASSWORD.
 *
 * Defaults are safe placeholders; production passwords are passed via env
 * by the deploy script and stored in CREDENTIALS.md / password manager.
 */
async function main() {
  const seeds = [
    {
      email: (process.env.SUPERADMIN_EMAIL ?? "superadmin@ipopulse.com").toLowerCase(),
      password: process.env.SUPERADMIN_PASSWORD ?? "ChangeMe-SuperAdmin-1!",
      name: "Super Admin",
      role: "superadmin",
    },
    {
      email: (process.env.ADMIN_EMAIL ?? "admin@ipopulse.com").toLowerCase(),
      password: process.env.ADMIN_PASSWORD ?? "ChangeMe-Admin-1!",
      name: "Admin",
      role: "admin",
    },
  ];

  for (const s of seeds) {
    const passwordHash = await bcrypt.hash(s.password, 10);
    const row = await prisma.adminUser.upsert({
      where: { email: s.email },
      update: { passwordHash, role: s.role, name: s.name },
      create: {
        email: s.email,
        passwordHash,
        name: s.name,
        role: s.role,
      },
    });
    console.log(`✔ ${row.role.padEnd(11)} ready: ${row.email}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
