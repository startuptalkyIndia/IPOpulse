import type { ScreenerCompany, SavedScreen } from "./types";
import { MCAP_BANDS, METRICS, OPERATORS } from "./constants";

export function filterAndSort(
  seed: ScreenerCompany[],
  filters: SavedScreen["filters"],
): ScreenerCompany[] {
  const { search, sector, mcapBand, type, peMax, roeMin, debtMax, divMin, requireFundamentals, moatOnly, uptrendOnly, compounderOnly, sortBy, customFilters } = filters;
  const band = MCAP_BANDS.find((b) => b.key === mcapBand) ?? MCAP_BANDS[0];
  const q = search.trim().toLowerCase();
  const peMaxN = peMax === "" ? null : Number(peMax);
  const roeMinN = roeMin === "" ? null : Number(roeMin);
  const debtMaxN = debtMax === "" ? null : Number(debtMax);
  const divMinN = divMin === "" ? null : Number(divMin);

  const result = seed
    .filter((c) => {
      if (sector !== "any" && c.sector !== sector) return false;
      if (type === "mainboard" && c.isSme) return false;
      if (type === "sme" && !c.isSme) return false;
      if (q) {
        const matchesText =
          c.name.toLowerCase().includes(q) ||
          (c.symbol?.toLowerCase().includes(q) ?? false) ||
          (c.sector?.toLowerCase().includes(q) ?? false);
        if (!matchesText) return false;
      }
      if (band.min != null && (c.marketCapCr ?? 0) < band.min) return false;
      if (band.max != null && (c.marketCapCr ?? 0) > band.max) return false;

      // Fundamentals
      if (requireFundamentals && c.peRatio == null && c.roePercent == null) return false;
      if (peMaxN != null) {
        if (c.peRatio == null || c.peRatio > peMaxN || c.peRatio <= 0) return false;
      }
      if (roeMinN != null) {
        if (c.roePercent == null || c.roePercent < roeMinN) return false;
      }
      if (debtMaxN != null) {
        if (c.debtToEquity == null || c.debtToEquity > debtMaxN) return false;
      }
      if (divMinN != null) {
        if (c.dividendYield == null || c.dividendYield < divMinN) return false;
      }
      // Signal filters
      if (moatOnly && !c.isMoat) return false;
      if (uptrendOnly && c.weinsteinStage !== 2) return false;
      if (compounderOnly && (c.roeConsistentYrs ?? 0) < 4) return false;
      // Custom filters — AND'd together; an incomplete row (no value entered
      // yet) is ignored rather than excluding every company.
      for (const cf of customFilters) {
        if (cf.value.trim() === "") continue;
        const metric = METRICS.find((m) => m.key === cf.metric);
        const operator = OPERATORS.find((o) => o.key === cf.op);
        if (!metric || !operator) continue;
        const actual = metric.get(c);
        const target = Number(cf.value);
        if (actual == null || Number.isNaN(target)) return false;
        if (!operator.test(actual, target)) return false;
      }
      return true;
    });

  // Sort
  const compare = (a: ScreenerCompany, b: ScreenerCompany) => {
    const get = (c: ScreenerCompany) => {
      if (sortBy === "marketCap") return c.marketCapCr ?? -1;
      if (sortBy === "pe") return c.peRatio ?? 99999;
      if (sortBy === "roe") return c.roePercent ?? -1;
      if (sortBy === "divYield") return c.dividendYield ?? -1;
      if (sortBy === "chg1d") return c.chg1d ?? -999;
      if (sortBy === "chg1d_asc") return c.chg1d ?? 999;
      if (sortBy === "vol") return c.volume ?? -1;
      if (sortBy === "quality") return c.qualityOverall ?? -1;
      // 52W proximity: (ltp - low52w) / (high52w - low52w), 0=at low, 1=at high
      if (sortBy === "near52wLow" || sortBy === "near52wHigh") {
        if (!c.ltp || !c.high52w || !c.low52w || c.high52w === c.low52w) return 0.5;
        return (c.ltp - c.low52w) / (c.high52w - c.low52w);
      }
      return 0;
    };
    const av = get(a);
    const bv = get(b);
    return (sortBy === "pe" || sortBy === "chg1d_asc" || sortBy === "near52wLow") ? av - bv : bv - av;
  };
  return result.sort(compare);
}
