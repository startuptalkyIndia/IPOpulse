/**
 * One-off correction: 27 IPOs confirmed (via external verification against
 * Chittorgarh/Kotak/IPO Watch and similar sources — not a DB heuristic) to be
 * NSE-SME/NSE-Emerge listings that are stored with `type='mainboard'`.
 *
 * Same underlying bug as the 2026-09-24 incident (nse-ipos.ts trusted which
 * API category a row came from instead of each row's own `series` field) —
 * these are older rows that dropped off NSE's live feed before the fix
 * shipped, so the running cron can never self-heal them. This is the
 * "broader historical audit" TASKS.md flagged after that fix.
 *
 * Safety, learned from the ORIGINAL incident: changing `type` changes the
 * slug (slugifyIpoName appends "-sme"), and upserting by the NEW slug misses
 * the existing row entirely, creating a duplicate. This script looks up each
 * row by name, computes the new slug, and SKIPS (never force-creates) if a
 * different row already holds that slug — logged for manual review instead.
 *
 * Idempotent — safe to re-run; already-corrected or already-skipped rows are
 * no-ops the second time.
 * Run: docker exec ipopulse-ipopulse-1 npx tsx scripts/fix-sme-misclassification-20260926.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugifyIpoName(name: string, opts?: { suffix?: string }): string {
  const base = name
    .toLowerCase()
    .replace(/\blimited\b|\bltd\.?\b/g, "")
    .replace(/\bpvt\.?\b|\bprivate\b/g, "")
    .replace(/\bipo\b/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
  const slug = opts?.suffix ? `${base}-${opts.suffix}` : base;
  return `${slug}-ipo`;
}

// Confirmed SME (high confidence) via external verification, 2026-09-26.
const CONFIRMED_SME_NAMES = [
  "IC Electricals",
  "Shanti Inorganics",
  "Utkal Speciality Industries",
  "Madhur Knit Crafts",
  "Shreedhar Spinners",
  "Sri Priyanka Geo Commex",
  "Avience Biomedicals",
  "Clay Craft India",
  "Happy Steels",
  "Qualiance International",
  "Propshop Events",
  "Fascinate Textiles",
  "Pramodini Medicare",
  "Sumax Engineering",
  "Metalic Technoforge",
  "ABH Healthcare",
  "Anawil Wire",
  "Ashutosh Fibre",
  "Credent Connect",
  "Skytech Infinite Platform",
  "Optimystix Entertainment",
  "Vinit Mobile",
  "Kheria Autocomp",
  "SpectraA Technology Solutions",
  "Axiom Gas Engineering",
  "Teja Engineering Industries",
  "Vinod Texworld",
];

async function main() {
  let fixed = 0;
  let skippedNotFound = 0;
  let skippedNotMainboard = 0;
  let skippedSlugCollision = 0;
  const collisions: string[] = [];
  const notFound: string[] = [];

  for (const namePart of CONFIRMED_SME_NAMES) {
    const candidates = await prisma.ipo.findMany({
      where: { name: { contains: namePart, mode: "insensitive" } },
      select: { id: true, name: true, slug: true, type: true },
    });

    if (candidates.length === 0) {
      skippedNotFound++;
      notFound.push(namePart);
      continue;
    }
    if (candidates.length > 1) {
      console.log(`AMBIGUOUS (${candidates.length} matches) for "${namePart}": ${candidates.map((c) => c.name).join(" | ")} — skipping, needs manual pick`);
      continue;
    }

    const ipo = candidates[0];
    if (ipo.type === "sme") {
      continue; // already correct (idempotent re-run)
    }
    if (ipo.type !== "mainboard") {
      skippedNotMainboard++;
      console.log(`SKIP "${ipo.name}" — type is "${ipo.type}", not "mainboard" as expected`);
      continue;
    }

    const newSlug = slugifyIpoName(ipo.name, { suffix: "sme" });
    const slugOwner = await prisma.ipo.findUnique({ where: { slug: newSlug }, select: { id: true, name: true } });
    if (slugOwner && slugOwner.id !== ipo.id) {
      skippedSlugCollision++;
      collisions.push(`"${ipo.name}" (id ${ipo.id}) -> slug "${newSlug}" already used by "${slugOwner.name}" (id ${slugOwner.id})`);
      continue;
    }

    await prisma.ipo.update({ where: { id: ipo.id }, data: { type: "sme", slug: newSlug } });
    fixed++;
    console.log(`FIXED "${ipo.name}" (id ${ipo.id}): mainboard -> sme, slug -> "${newSlug}"`);
  }

  console.log("\n--- Summary ---");
  console.log(`Fixed: ${fixed}`);
  console.log(`Not found in DB: ${skippedNotFound}${notFound.length ? ` (${notFound.join(", ")})` : ""}`);
  console.log(`Already non-mainboard (skipped): ${skippedNotMainboard}`);
  console.log(`Slug collision (needs manual review): ${skippedSlugCollision}`);
  if (collisions.length) console.log(collisions.map((c) => `  - ${c}`).join("\n"));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
