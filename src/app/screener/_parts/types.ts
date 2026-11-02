export interface ScreenerCompany {
  slug: string;
  name: string;
  symbol: string | null;
  sector: string | null;
  industry: string | null;
  marketCapCr: number | null;
  isSme: boolean;
  ltp: number | null;
  volume: number | null;
  chg1d?: number | null;
  high52w?: number | null;
  low52w?: number | null;
  peRatio?: number | null;
  pbRatio?: number | null;
  roePercent?: number | null;
  debtToEquity?: number | null;
  dividendYield?: number | null;
  eps?: number | null;
  revYoy?: number | null;
  profitYoy?: number | null;
  rsi?: number | null;
  weinsteinStage?: number | null;
  ret1m?: number | null;
  ret1y?: number | null;
  roeConsistentYrs?: number | null;
  isMoat?: boolean;
  moatNote?: string | null;
  cyclicalPeak?: boolean;
  qualityGrade?: string | null;
  qualityOverall?: number | null;
}

export interface CustomFilter {
  id: string;
  metric: string;
  op: string;
  value: string;
}

export type SortKey = "marketCap" | "pe" | "roe" | "divYield" | "chg1d" | "chg1d_asc" | "vol" | "near52wLow" | "near52wHigh" | "quality";

export interface SavedScreen {
  name: string;
  filters: {
    search: string;
    sector: string;
    mcapBand: string;
    type: string;
    peMax: string;
    roeMin: string;
    debtMax: string;
    divMin: string;
    requireFundamentals: boolean;
    moatOnly: boolean;
    uptrendOnly: boolean;
    compounderOnly: boolean;
    sortBy: SortKey;
    customFilters: CustomFilter[];
  };
}
