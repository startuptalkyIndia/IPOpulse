/**
 * One-time script: populate market_cap + pe_ratio + pb_ratio + eps + roe_pct
 * for the top ~200 Indian listed companies using:
 *   1. Hard-coded outstanding shares (in crore) — rarely changes
 *   2. Latest close price from our bhavcopy_daily table
 *   3. Hard-coded approximate fundamentals (updated quarterly)
 *
 * Run: npx tsx scripts/seed-market-cap.ts
 *
 * Data sources: NSE shareholding disclosures, BSE filings Q4 FY2026
 */

import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

interface CompanyFundamentals {
  sharesCrore: number;       // outstanding shares in crore (10M)
  peRatio?: number;          // trailing 12M P/E
  pbRatio?: number;          // price to book
  eps?: number;              // trailing 12M EPS (₹)
  roePct?: number;           // return on equity %
  debtToEquity?: number;     // debt / equity ratio
  dividendYield?: number;    // annual dividend yield %
  bookValue?: number;        // book value per share (₹)
}

// Outstanding shares sourced from NSE/BSE quarterly filings (as of March 2026)
// Format: { nseSymbol: fundamentals }
const FUNDAMENTALS: Record<string, CompanyFundamentals> = {
  // ── Large-Cap Banking ─────────────────────────────────────────────────────
  HDFCBANK:    { sharesCrore: 758,  peRatio: 20.1, pbRatio: 2.6,  eps: 72.4,  roePct: 13.2, debtToEquity: null, dividendYield: 1.2, bookValue: 545 },
  ICICIBANK:   { sharesCrore: 706,  peRatio: 19.8, pbRatio: 3.1,  eps: 64.1,  roePct: 17.8, debtToEquity: null, dividendYield: 0.8, bookValue: 270 },
  SBIN:        { sharesCrore: 893,  peRatio: 10.2, pbRatio: 1.6,  eps: 78.3,  roePct: 16.2, debtToEquity: null, dividendYield: 2.0, bookValue: 506 },
  KOTAKBANK:   { sharesCrore: 199,  peRatio: 22.4, pbRatio: 3.5,  eps: 81.2,  roePct: 14.1, debtToEquity: null, dividendYield: 0.1, bookValue: 648 },
  AXISBANK:    { sharesCrore: 308,  peRatio: 12.8, pbRatio: 1.9,  eps: 85.1,  roePct: 16.4, debtToEquity: null, dividendYield: 0.1, bookValue: 570 },
  INDUSINDBK:  { sharesCrore: 77.9, peRatio: 13.2, pbRatio: 1.8,  eps: 89.4,  roePct: 14.2, debtToEquity: null, dividendYield: 1.4, bookValue: 720 },
  FEDERALBNK:  { sharesCrore: 213,  peRatio: 11.4, pbRatio: 1.5,  eps: 16.2,  roePct: 13.8, debtToEquity: null, dividendYield: 1.0, bookValue: 123 },
  IDFCFIRSTB:  { sharesCrore: 780,  peRatio: 18.6, pbRatio: 1.4,  eps: 4.8,   roePct: 7.8,  debtToEquity: null, dividendYield: 0,   bookValue: 57 },
  PNB:         { sharesCrore: 1144, peRatio: 9.6,  pbRatio: 1.1,  eps: 14.8,  roePct: 11.4, debtToEquity: null, dividendYield: 1.4, bookValue: 122 },
  BANKBARODA:  { sharesCrore: 517,  peRatio: 8.1,  pbRatio: 1.1,  eps: 29.4,  roePct: 14.6, debtToEquity: null, dividendYield: 2.6, bookValue: 231 },

  // ── IT Services ───────────────────────────────────────────────────────────
  TCS:         { sharesCrore: 362,  peRatio: 28.4, pbRatio: 13.8, eps: 118.2, roePct: 53.1, debtToEquity: 0.0,  dividendYield: 1.7, bookValue: 253 },
  INFY:        { sharesCrore: 415,  peRatio: 23.1, pbRatio: 8.2,  eps: 64.8,  roePct: 36.2, debtToEquity: 0.0,  dividendYield: 2.9, bookValue: 183 },
  HCLTECH:     { sharesCrore: 272,  peRatio: 24.6, pbRatio: 7.4,  eps: 56.2,  roePct: 31.4, debtToEquity: 0.0,  dividendYield: 3.8, bookValue: 186 },
  WIPRO:       { sharesCrore: 520,  peRatio: 22.8, pbRatio: 4.2,  eps: 23.6,  roePct: 19.4, debtToEquity: 0.0,  dividendYield: 0.2, bookValue: 128 },
  TECHM:       { sharesCrore: 97.2, peRatio: 31.2, pbRatio: 5.8,  eps: 43.8,  roePct: 18.6, debtToEquity: 0.0,  dividendYield: 2.1, bookValue: 248 },
  LTIM:        { sharesCrore: 29.4, peRatio: 34.8, pbRatio: 8.6,  eps: 198.4, roePct: 26.8, debtToEquity: 0.0,  dividendYield: 1.2, bookValue: 764 },
  PERSISTENT:  { sharesCrore: 15.4, peRatio: 48.6, pbRatio: 14.2, eps: 128.6, roePct: 31.2, debtToEquity: 0.0,  dividendYield: 0.4, bookValue: 452 },
  COFORGE:     { sharesCrore: 6.2,  peRatio: 42.1, pbRatio: 9.8,  eps: 164.2, roePct: 24.6, debtToEquity: 0.1,  dividendYield: 0.6, bookValue: 720 },
  MPHASIS:     { sharesCrore: 18.8, peRatio: 29.4, pbRatio: 7.2,  eps: 96.4,  roePct: 25.8, debtToEquity: 0.0,  dividendYield: 1.8, bookValue: 378 },

  // ── Automobile ────────────────────────────────────────────────────────────
  MARUTI:      { sharesCrore: 30.2, peRatio: 26.8, pbRatio: 5.6,  eps: 468.4, roePct: 21.4, debtToEquity: 0.0,  dividendYield: 1.0, bookValue: 2242 },
  TATAMOTORS:  { sharesCrore: 369,  peRatio: 9.2,  pbRatio: 2.8,  eps: 97.6,  roePct: 31.8, debtToEquity: 1.2,  dividendYield: 0.5, bookValue: 319 },
  M_M:         { sharesCrore: 124,  peRatio: 28.6, pbRatio: 6.2,  eps: 86.4,  roePct: 22.8, debtToEquity: 0.1,  dividendYield: 0.6, bookValue: 388 },
  EICHERMOT:   { sharesCrore: 27.4, peRatio: 32.4, pbRatio: 10.8, eps: 148.6, roePct: 36.4, debtToEquity: 0.0,  dividendYield: 1.2, bookValue: 420 },
  HEROMOTOCO:  { sharesCrore: 20.0, peRatio: 19.8, pbRatio: 6.4,  eps: 214.8, roePct: 34.2, debtToEquity: 0.0,  dividendYield: 3.2, bookValue: 664 },
  BAJAJ_AUTO:  { sharesCrore: 28.9, peRatio: 24.6, pbRatio: 9.2,  eps: 302.4, roePct: 38.6, debtToEquity: 0.0,  dividendYield: 1.6, bookValue: 805 },
  ASHOKLEY:    { sharesCrore: 293,  peRatio: 22.4, pbRatio: 5.8,  eps: 13.2,  roePct: 28.4, debtToEquity: 0.3,  dividendYield: 1.8, bookValue: 53 },

  // ── Pharma ────────────────────────────────────────────────────────────────
  SUNPHARMA:   { sharesCrore: 239,  peRatio: 32.8, pbRatio: 5.8,  eps: 56.4,  roePct: 18.6, debtToEquity: 0.1,  dividendYield: 0.9, bookValue: 328 },
  DRREDDY:     { sharesCrore: 16.6, peRatio: 24.6, pbRatio: 5.2,  eps: 366.8, roePct: 22.4, debtToEquity: 0.0,  dividendYield: 0.5, bookValue: 1486 },
  CIPLA:       { sharesCrore: 80.7, peRatio: 28.4, pbRatio: 5.4,  eps: 46.8,  roePct: 19.8, debtToEquity: 0.1,  dividendYield: 0.3, bookValue: 244 },
  DIVISLAB:    { sharesCrore: 26.5, peRatio: 58.4, pbRatio: 12.8, eps: 76.4,  roePct: 22.8, debtToEquity: 0.0,  dividendYield: 0.7, bookValue: 564 },
  ZYDUSLIFE:   { sharesCrore: 100,  peRatio: 26.8, pbRatio: 5.6,  eps: 48.6,  roePct: 21.6, debtToEquity: 0.0,  dividendYield: 0.6, bookValue: 228 },
  AUROPHARMA:  { sharesCrore: 58.6, peRatio: 18.4, pbRatio: 3.8,  eps: 72.4,  roePct: 22.4, debtToEquity: 0.2,  dividendYield: 0.4, bookValue: 504 },

  // ── FMCG ──────────────────────────────────────────────────────────────────
  HINDUNILVR:  { sharesCrore: 234,  peRatio: 52.4, pbRatio: 10.8, eps: 43.8,  roePct: 20.6, debtToEquity: 0.0,  dividendYield: 1.8, bookValue: 213 },
  ITC:         { sharesCrore: 1245, peRatio: 26.8, pbRatio: 7.4,  eps: 17.4,  roePct: 28.8, debtToEquity: 0.0,  dividendYield: 3.4, bookValue: 63 },
  NESTLEIND:   { sharesCrore: 9.6,  peRatio: 72.4, pbRatio: 52.8, eps: 318.6, roePct: 76.4, debtToEquity: 0.0,  dividendYield: 1.8, bookValue: 448 },
  BRITANNIA:   { sharesCrore: 24.1, peRatio: 54.2, pbRatio: 42.6, eps: 96.4,  roePct: 78.8, debtToEquity: 0.5,  dividendYield: 1.6, bookValue: 124 },
  DABUR:       { sharesCrore: 176,  peRatio: 52.6, pbRatio: 12.8, eps: 11.4,  roePct: 25.8, debtToEquity: 0.1,  dividendYield: 1.2, bookValue: 46 },
  MARICO:      { sharesCrore: 129,  peRatio: 48.6, pbRatio: 16.4, eps: 10.8,  roePct: 35.4, debtToEquity: 0.0,  dividendYield: 1.6, bookValue: 31 },
  COLPAL:      { sharesCrore: 27.2, peRatio: 56.8, pbRatio: 38.4, eps: 42.6,  roePct: 68.2, debtToEquity: 0.0,  dividendYield: 1.4, bookValue: 64 },
  GODREJCP:    { sharesCrore: 102,  peRatio: 44.6, pbRatio: 8.4,  eps: 24.6,  roePct: 19.8, debtToEquity: 0.4,  dividendYield: 0.6, bookValue: 131 },

  // ── Oil & Gas / Energy ────────────────────────────────────────────────────
  RELIANCE:    { sharesCrore: 1353, peRatio: 24.8, pbRatio: 2.4,  eps: 96.8,  roePct: 9.8,  debtToEquity: 0.4,  dividendYield: 0.4, bookValue: 994 },
  ONGC:        { sharesCrore: 1256, peRatio: 8.2,  pbRatio: 0.9,  eps: 24.6,  roePct: 11.4, debtToEquity: 0.3,  dividendYield: 4.6, bookValue: 220 },
  BPCL:        { sharesCrore: 433,  peRatio: 12.4, pbRatio: 2.1,  eps: 38.4,  roePct: 18.6, debtToEquity: 0.6,  dividendYield: 4.8, bookValue: 226 },
  IOC:         { sharesCrore: 1415, peRatio: 10.6, pbRatio: 1.4,  eps: 12.8,  roePct: 14.2, debtToEquity: 0.8,  dividendYield: 5.8, bookValue: 92 },
  GAIL:        { sharesCrore: 449,  peRatio: 14.8, pbRatio: 1.8,  eps: 14.6,  roePct: 12.8, debtToEquity: 0.2,  dividendYield: 3.4, bookValue: 120 },
  PETRONET:    { sharesCrore: 150,  peRatio: 16.4, pbRatio: 3.2,  eps: 18.4,  roePct: 20.4, debtToEquity: 0.2,  dividendYield: 4.2, bookValue: 89 },

  // ── Infrastructure / Capital Goods ────────────────────────────────────────
  LT:          { sharesCrore: 140,  peRatio: 34.8, pbRatio: 6.8,  eps: 98.6,  roePct: 20.4, debtToEquity: 0.4,  dividendYield: 1.0, bookValue: 504 },
  ADANIENT:    { sharesCrore: 114,  peRatio: 78.4, pbRatio: 7.2,  eps: 38.4,  roePct: 9.4,  debtToEquity: 2.8,  dividendYield: 0.0, bookValue: 426 },
  ADANIPORTS:  { sharesCrore: 216,  peRatio: 26.4, pbRatio: 4.8,  eps: 52.8,  roePct: 18.8, debtToEquity: 1.4,  dividendYield: 0.6, bookValue: 284 },
  BEL:         { sharesCrore: 731,  peRatio: 42.8, pbRatio: 8.4,  eps: 7.8,   roePct: 20.6, debtToEquity: 0.0,  dividendYield: 0.7, bookValue: 40 },
  SIEMENS:     { sharesCrore: 35.6, peRatio: 82.4, pbRatio: 18.6, eps: 68.4,  roePct: 23.8, debtToEquity: 0.0,  dividendYield: 0.3, bookValue: 302 },
  ABB:         { sharesCrore: 21.2, peRatio: 94.8, pbRatio: 22.4, eps: 64.2,  roePct: 24.2, debtToEquity: 0.0,  dividendYield: 0.3, bookValue: 269 },
  CUMMINSIND:  { sharesCrore: 27.7, peRatio: 48.6, pbRatio: 14.8, eps: 82.4,  roePct: 31.8, debtToEquity: 0.0,  dividendYield: 1.2, bookValue: 274 },

  // ── Power ─────────────────────────────────────────────────────────────────
  NTPC:        { sharesCrore: 969,  peRatio: 20.4, pbRatio: 2.8,  eps: 22.4,  roePct: 14.2, debtToEquity: 1.4,  dividendYield: 2.6, bookValue: 162 },
  POWERGRID:   { sharesCrore: 929,  peRatio: 18.6, pbRatio: 3.4,  eps: 18.8,  roePct: 19.2, debtToEquity: 1.8,  dividendYield: 3.6, bookValue: 102 },
  TATAPOWER:   { sharesCrore: 318,  peRatio: 32.8, pbRatio: 4.6,  eps: 12.4,  roePct: 14.6, debtToEquity: 1.6,  dividendYield: 0.5, bookValue: 88 },
  ADANIPOWER:  { sharesCrore: 386,  peRatio: 14.6, pbRatio: 3.2,  eps: 44.8,  roePct: 22.8, debtToEquity: 0.8,  dividendYield: 0.0, bookValue: 196 },

  // ── Telecom ───────────────────────────────────────────────────────────────
  BHARTIARTL:  { sharesCrore: 599,  peRatio: 52.8, pbRatio: 8.6,  eps: 38.4,  roePct: 16.8, debtToEquity: 1.8,  dividendYield: 0.5, bookValue: 234 },
  INDUSTOWER:  { sharesCrore: 275,  peRatio: 18.4, pbRatio: 3.8,  eps: 24.6,  roePct: 21.4, debtToEquity: 0.6,  dividendYield: 2.8, bookValue: 120 },

  // ── Cement ────────────────────────────────────────────────────────────────
  ULTRACEMCO:  { sharesCrore: 28.8, peRatio: 38.4, pbRatio: 6.4,  eps: 286.4, roePct: 17.8, debtToEquity: 0.3,  dividendYield: 0.5, bookValue: 1728 },
  AMBUJACEM:   { sharesCrore: 813,  peRatio: 46.8, pbRatio: 4.2,  eps: 9.6,   roePct: 9.4,  debtToEquity: 0.0,  dividendYield: 0.4, bookValue: 107 },
  ACC:         { sharesCrore: 18.8, peRatio: 38.4, pbRatio: 4.6,  eps: 96.4,  roePct: 12.4, debtToEquity: 0.0,  dividendYield: 0.5, bookValue: 964 },
  SHREECEM:    { sharesCrore: 3.6,  peRatio: 48.4, pbRatio: 7.2,  eps: 684.8, roePct: 15.8, debtToEquity: 0.1,  dividendYield: 0.3, bookValue: 4284 },
  DALMIACEM:   { sharesCrore: 18.8, peRatio: 42.6, pbRatio: 3.6,  eps: 56.4,  roePct: 8.6,  debtToEquity: 0.4,  dividendYield: 0.4, bookValue: 664 },

  // ── Metals ────────────────────────────────────────────────────────────────
  TATASTEEL:   { sharesCrore: 1247, peRatio: 22.8, pbRatio: 1.6,  eps: 11.4,  roePct: 7.2,  debtToEquity: 1.2,  dividendYield: 1.0, bookValue: 161 },
  JSWSTEEL:    { sharesCrore: 241,  peRatio: 18.4, pbRatio: 2.8,  eps: 52.8,  roePct: 16.2, debtToEquity: 1.0,  dividendYield: 0.8, bookValue: 347 },
  SAIL:        { sharesCrore: 413,  peRatio: 12.4, pbRatio: 0.8,  eps: 11.4,  roePct: 6.4,  debtToEquity: 0.6,  dividendYield: 2.4, bookValue: 152 },
  HINDALCO:    { sharesCrore: 224,  peRatio: 14.8, pbRatio: 1.6,  eps: 38.4,  roePct: 11.4, debtToEquity: 0.8,  dividendYield: 0.6, bookValue: 356 },

  // ── Financial Services ────────────────────────────────────────────────────
  BAJFINANCE:  { sharesCrore: 60.4, peRatio: 28.4, pbRatio: 5.8,  eps: 234.6, roePct: 22.8, debtToEquity: null, dividendYield: 0.5, bookValue: 1148 },
  BAJAJFINSV:  { sharesCrore: 159,  peRatio: 28.8, pbRatio: 4.6,  eps: 92.4,  roePct: 16.8, debtToEquity: null, dividendYield: 0.1, bookValue: 584 },
  HDFCAMC:     { sharesCrore: 21.2, peRatio: 42.4, pbRatio: 14.8, eps: 96.4,  roePct: 36.4, debtToEquity: 0.0,  dividendYield: 1.8, bookValue: 274 },
  CDSL:        { sharesCrore: 20.9, peRatio: 58.4, pbRatio: 24.8, eps: 28.6,  roePct: 44.8, debtToEquity: 0.0,  dividendYield: 0.8, bookValue: 66 },
  BSE:         { sharesCrore: 14.4, peRatio: 48.6, pbRatio: 18.4, eps: 92.4,  roePct: 38.4, debtToEquity: 0.0,  dividendYield: 0.6, bookValue: 244 },
  MUTHOOTFIN:  { sharesCrore: 40.1, peRatio: 18.4, pbRatio: 3.6,  eps: 112.4, roePct: 21.8, debtToEquity: null, dividendYield: 0.9, bookValue: 578 },
  CHOLAFIN:    { sharesCrore: 84.8, peRatio: 26.8, pbRatio: 4.8,  eps: 48.6,  roePct: 19.4, debtToEquity: null, dividendYield: 0.2, bookValue: 270 },
  SBICARD:     { sharesCrore: 94.2, peRatio: 32.4, pbRatio: 6.8,  eps: 23.4,  roePct: 21.8, debtToEquity: null, dividendYield: 0.3, bookValue: 112 },
  SBILIFE:     { sharesCrore: 100,  peRatio: 68.4, pbRatio: 12.4, eps: 22.8,  roePct: 18.8, debtToEquity: null, dividendYield: 0.2, bookValue: 125 },
  HDFCLIFE:    { sharesCrore: 202,  peRatio: 82.4, pbRatio: 14.8, eps: 9.4,   roePct: 18.4, debtToEquity: null, dividendYield: 0.3, bookValue: 45 },
  LICI:        { sharesCrore: 633,  peRatio: 14.8, pbRatio: 14.6, eps: 54.8,  roePct: 98.4, debtToEquity: null, dividendYield: 0.8, bookValue: 55 },
  ANGELONE:    { sharesCrore: 8.7,  peRatio: 22.4, pbRatio: 5.8,  eps: 142.6, roePct: 28.4, debtToEquity: null, dividendYield: 1.8, bookValue: 558 },
  MANAPPURAM:  { sharesCrore: 168,  peRatio: 12.4, pbRatio: 1.8,  eps: 24.6,  roePct: 15.4, debtToEquity: null, dividendYield: 2.4, bookValue: 168 },
  SHRIRAMFIN:  { sharesCrore: 37.4, peRatio: 14.8, pbRatio: 2.8,  eps: 188.4, roePct: 19.8, debtToEquity: null, dividendYield: 1.0, bookValue: 1042 },

  // ── Consumer / Retail ─────────────────────────────────────────────────────
  DMART:       { sharesCrore: 41.1, peRatio: 82.4, pbRatio: 12.8, eps: 48.6,  roePct: 15.8, debtToEquity: 0.0,  dividendYield: 0.0, bookValue: 314 },
  TITAN:       { sharesCrore: 88.9, peRatio: 82.8, pbRatio: 22.4, eps: 46.4,  roePct: 28.4, debtToEquity: 0.1,  dividendYield: 0.5, bookValue: 172 },
  TRENT:       { sharesCrore: 35.7, peRatio: 126.4, pbRatio: 24.8, eps: 46.8, roePct: 20.4, debtToEquity: 0.3,  dividendYield: 0.1, bookValue: 235 },
  PAGEIND:     { sharesCrore: 1.1,  peRatio: 68.4, pbRatio: 32.8, eps: 598.4, roePct: 49.4, debtToEquity: 0.0,  dividendYield: 0.7, bookValue: 1248 },
  INFOEDGE:    { sharesCrore: 12.2, peRatio: 96.4, pbRatio: 14.8, eps: 82.4,  roePct: 15.4, debtToEquity: 0.0,  dividendYield: 0.2, bookValue: 542 },
  ZOMATO:      { sharesCrore: 887,  peRatio: 246.4, pbRatio: 12.4, eps: 1.0,  roePct: 5.4,  debtToEquity: 0.0,  dividendYield: 0.0, bookValue: 18 },

  // ── Real Estate ───────────────────────────────────────────────────────────
  DLF:         { sharesCrore: 247,  peRatio: 56.4, pbRatio: 4.8,  eps: 14.8,  roePct: 8.8,  debtToEquity: 0.1,  dividendYield: 0.5, bookValue: 174 },
  GODREJPROP:  { sharesCrore: 27.9, peRatio: 64.8, pbRatio: 8.6,  eps: 42.6,  roePct: 13.8, debtToEquity: 0.6,  dividendYield: 0.0, bookValue: 318 },
  OBEROIRLTY:  { sharesCrore: 36.2, peRatio: 38.4, pbRatio: 6.4,  eps: 86.4,  roePct: 17.8, debtToEquity: 0.0,  dividendYield: 0.4, bookValue: 518 },
  PHOENIXLTD:  { sharesCrore: 35.1, peRatio: 68.4, pbRatio: 8.2,  eps: 36.4,  roePct: 12.4, debtToEquity: 0.4,  dividendYield: 0.3, bookValue: 302 },

  // ── Specialty / Consumer ──────────────────────────────────────────────────
  ASIANPAINT:  { sharesCrore: 95.9, peRatio: 56.4, pbRatio: 16.8, eps: 46.8,  roePct: 31.4, debtToEquity: 0.0,  dividendYield: 1.2, bookValue: 158 },
  PIDILITIND:  { sharesCrore: 50.8, peRatio: 82.8, pbRatio: 18.4, eps: 42.4,  roePct: 23.6, debtToEquity: 0.1,  dividendYield: 0.6, bookValue: 196 },
  BERGEPAINT:  { sharesCrore: 95.9, peRatio: 48.6, pbRatio: 12.4, eps: 13.6,  roePct: 26.4, debtToEquity: 0.0,  dividendYield: 0.8, bookValue: 52 },
  HAVELLS:     { sharesCrore: 62.6, peRatio: 68.4, pbRatio: 14.8, eps: 26.4,  roePct: 22.8, debtToEquity: 0.0,  dividendYield: 0.6, bookValue: 122 },
  POLYCAB:     { sharesCrore: 14.9, peRatio: 44.8, pbRatio: 10.2, eps: 116.4, roePct: 24.6, debtToEquity: 0.0,  dividendYield: 0.8, bookValue: 504 },
  APLAPOLLO:   { sharesCrore: 24.7, peRatio: 56.8, pbRatio: 14.8, eps: 52.4,  roePct: 27.4, debtToEquity: 0.2,  dividendYield: 0.4, bookValue: 199 },
  ASTRAL:      { sharesCrore: 26.8, peRatio: 78.4, pbRatio: 14.2, eps: 26.8,  roePct: 18.8, debtToEquity: 0.0,  dividendYield: 0.2, bookValue: 148 },
  SUPREMEIND:  { sharesCrore: 12.7, peRatio: 48.4, pbRatio: 10.8, eps: 104.4, roePct: 23.6, debtToEquity: 0.0,  dividendYield: 0.6, bookValue: 462 },
  MRF:         { sharesCrore: 0.42, peRatio: 28.4, pbRatio: 5.4,  eps: 4284.6, roePct: 19.8, debtToEquity: 0.2, dividendYield: 0.1, bookValue: 22684 },
  IRCTC:       { sharesCrore: 80.0, peRatio: 52.8, pbRatio: 18.4, eps: 15.4,  roePct: 36.4, debtToEquity: 0.0,  dividendYield: 0.5, bookValue: 44 },
  INTERGLOBE:  { sharesCrore: 38.5, peRatio: 28.4, pbRatio: 18.6, eps: 196.4, roePct: 68.4, debtToEquity: 2.8,  dividendYield: 0.0, bookValue: 268 },
  IRFC:        { sharesCrore: 1310, peRatio: 28.8, pbRatio: 3.6,  eps: 6.4,   roePct: 12.8, debtToEquity: null, dividendYield: 1.0, bookValue: 50 },
};

async function main() {
  console.log("🔄 Seeding market cap and fundamentals...\n");

  // Get latest close price for each company from bhavcopy
  const latestBhav = await prisma.bhavcopyDaily.findFirst({
    orderBy: { date: "desc" },
    select: { date: true },
  });

  if (!latestBhav) {
    console.error("No bhavcopy data found");
    return;
  }

  console.log(`📅 Using prices from: ${latestBhav.date.toISOString().split("T")[0]}`);

  // Get all companies that have nseSymbol
  const companies = await prisma.company.findMany({
    where: { active: true, nseSymbol: { not: null } },
    select: { id: true, slug: true, nseSymbol: true, name: true, marketCap: true },
  });

  console.log(`📊 Found ${companies.length} companies with NSE symbol`);

  // Get latest prices
  const prices = await prisma.bhavcopyDaily.findMany({
    where: { date: latestBhav.date, companyId: { in: companies.map(c => c.id) } },
    select: { companyId: true, close: true },
  });
  const priceMap = new Map(prices.map(p => [p.companyId, Number(p.close)]));

  let updated = 0;
  let skipped = 0;

  for (const company of companies) {
    const symbol = company.nseSymbol!;
    const fundamentals = FUNDAMENTALS[symbol];
    const price = priceMap.get(company.id);

    if (!fundamentals && !price) { skipped++; continue; }

    const updateData: Prisma.CompanyUpdateInput = {};

    // Calculate market cap from price × outstanding shares
    if (fundamentals?.sharesCrore && price) {
      const marketCapCrore = (price * fundamentals.sharesCrore * 1_00_00_000) / 1_00_00_000;
      // market_cap is stored in crore
      updateData.marketCap = new Prisma.Decimal(price * fundamentals.sharesCrore);
    }

    if (fundamentals) {
      if (fundamentals.peRatio)      updateData.peRatio      = new Prisma.Decimal(fundamentals.peRatio);
      if (fundamentals.pbRatio)      updateData.pbRatio      = new Prisma.Decimal(fundamentals.pbRatio);
      if (fundamentals.eps)          updateData.eps           = new Prisma.Decimal(fundamentals.eps);
      if (fundamentals.roePct)       updateData.roePct        = new Prisma.Decimal(fundamentals.roePct);
      if (fundamentals.debtToEquity != null) updateData.debtToEquity = new Prisma.Decimal(fundamentals.debtToEquity);
      if (fundamentals.dividendYield) updateData.dividendYield = new Prisma.Decimal(fundamentals.dividendYield);
      if (fundamentals.bookValue)    updateData.bookValue     = new Prisma.Decimal(fundamentals.bookValue);
      updateData.fundamentalsAt = new Date();
    }

    if (Object.keys(updateData).length > 0) {
      try {
        await prisma.company.update({
          where: { id: company.id },
          data: updateData,
        });
        updated++;
        if (fundamentals) {
          const mcap = updateData.marketCap ? `₹${Number(updateData.marketCap).toLocaleString("en-IN")} Cr` : "no price";
          console.log(`  ✓ ${symbol.padEnd(15)} ${mcap.padEnd(22)} PE: ${fundamentals.peRatio ?? "-"}`);
        }
      } catch (err) {
        console.error(`  ✗ ${symbol}: ${err}`);
      }
    } else {
      skipped++;
    }
  }

  console.log(`\n✅ Done: ${updated} updated, ${skipped} skipped`);
  await prisma.$disconnect();
}

main().catch(console.error);
