import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { IpoPoll } from "./IpoPoll";

export async function IpoPollWrapper({ ipoId }: { ipoId: number }) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const [tally, mine] = await Promise.all([
    prisma.ipoPoll.groupBy({ by: ["vote"], where: { ipoId }, _count: true }),
    userId ? prisma.ipoPoll.findUnique({ where: { userId_ipoId: { userId, ipoId } } }) : Promise.resolve(null),
  ]);

  const counts = { subscribe: 0, avoid: 0, watching: 0 } as Record<string, number>;
  for (const t of tally) counts[t.vote] = t._count;

  return (
    <IpoPoll
      ipoId={ipoId}
      authed={!!userId}
      initialMyVote={(mine?.vote as "subscribe" | "avoid" | "watching" | undefined) ?? null}
      initialTally={{ subscribe: counts.subscribe, avoid: counts.avoid, watching: counts.watching }}
    />
  );
}
