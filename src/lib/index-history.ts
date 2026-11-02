// Sparkline history for /indices: at most SPARK_POINTS closes per index, read in ONE query
// (ROW_NUMBER per index) instead of every row since the cutoff (lists standard, LS-08).
export const SPARK_POINTS = 30;
export const SPARK_WINDOW_DAYS = 35;

export interface HistRow { index_name: string; close: number | string }
export interface HistDb {
  $queryRaw<T = unknown>(query: TemplateStringsArray, ...values: unknown[]): Promise<T>;
}

/** YYYY-MM-DD of (latest - 35 days), UTC math so a DST/local zone cannot shift it. */
export function sparkCutoffDate(latest: Date): string {
  return new Date(latest.getTime() - SPARK_WINDOW_DAYS * 86_400_000).toISOString().slice(0, 10);
}

export async function fetchIndexHistory(db: HistDb, latest: Date): Promise<HistRow[]> {
  const cutoff = sparkCutoffDate(latest);
  return db.$queryRaw<HistRow[]>`
    SELECT index_name, close::float8 AS close FROM (
      SELECT index_name, close, date,
             ROW_NUMBER() OVER (PARTITION BY index_name ORDER BY date DESC) AS rn
      FROM nifty_indices
      WHERE date >= ${cutoff}::date
    ) t
    WHERE rn <= ${SPARK_POINTS}
    ORDER BY index_name ASC, date ASC`;
}

/** Same maths the page always used: closes in date order, 30D return = first to last of the window. */
export function buildHistory(rows: HistRow[]) {
  const histMap = new Map<string, number[]>();
  for (const r of rows) {
    const arr = histMap.get(r.index_name) ?? [];
    arr.push(Number(r.close));
    histMap.set(r.index_name, arr);
  }
  const ret30dMap = new Map<string, number>();
  for (const [name, prices] of histMap.entries()) {
    if (prices.length < 2) continue;
    ret30dMap.set(name, ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100);
  }
  return { histMap, ret30dMap };
}
