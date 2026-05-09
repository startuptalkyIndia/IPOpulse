// Current gold price per gram as of May 2026 (approx)
export const CURRENT_GOLD_PRICE_PER_GRAM = 7200;

// Annual coupon rate for all SGBs
export const SGB_COUPON_RATE = 2.5;

export interface SGB {
  series: string;
  issueDate: string;
  maturityDate: string;
  issuePrice: number; // ₹ per gram at issue
  coupon: number; // 2.5% per annum (fixed for all)
  currentGoldPrice: number; // ₹ per gram (as of May 2026)
  nseSymbol: string;
  daysToMaturity: number; // calculated from 2026-05-09
  matured: boolean;
}

// Today's date for calculations: 2026-05-09
function daysFromToday(maturityDateStr: string): number {
  const today = new Date("2026-05-09");
  const maturity = new Date(maturityDateStr);
  const diffMs = maturity.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function buildSGB(
  series: string,
  issueDate: string,
  maturityDate: string,
  issuePrice: number,
  nseSymbol: string
): SGB {
  const days = daysFromToday(maturityDate);
  return {
    series,
    issueDate,
    maturityDate,
    issuePrice,
    coupon: 2.5,
    currentGoldPrice: CURRENT_GOLD_PRICE_PER_GRAM,
    nseSymbol,
    daysToMaturity: days,
    matured: days <= 0,
  };
}

export const sgbSeries: SGB[] = [
  buildSGB("SGB 2017-18 Series I",   "2017-11-24", "2025-11-24", 2961, "SGBAUG29IV"),
  buildSGB("SGB 2017-18 Series III",  "2018-01-01", "2026-01-01", 2890, "SGBJAN26III"),
  buildSGB("SGB 2018-19 Series I",   "2018-10-31", "2026-10-31", 3183, "SGBOCT26I"),
  buildSGB("SGB 2018-19 Series II",  "2019-01-22", "2027-01-22", 3214, "SGBJAN27II"),
  buildSGB("SGB 2019-20 Series I",   "2019-06-19", "2027-06-19", 3196, "SGBJUN27I"),
  buildSGB("SGB 2019-20 Series VI",  "2019-10-25", "2027-10-25", 3835, "SGBOCT27VI"),
  buildSGB("SGB 2020-21 Series I",   "2020-04-28", "2028-04-28", 4639, "SGBAPR28I"),
  buildSGB("SGB 2020-21 Series V",   "2020-09-04", "2028-09-04", 5117, "SGBSEP28V"),
  buildSGB("SGB 2020-21 Series X",   "2021-01-19", "2029-01-19", 5104, "SGBJAN29X"),
  buildSGB("SGB 2021-22 Series I",   "2021-06-01", "2029-06-01", 4777, "SGBJUN29I"),
  buildSGB("SGB 2021-22 Series V",   "2021-09-20", "2029-09-20", 4765, "SGBSEP29V"),
  buildSGB("SGB 2022-23 Series I",   "2022-06-24", "2030-06-24", 5091, "SGBJUN30I"),
  buildSGB("SGB 2022-23 Series IV",  "2022-12-27", "2030-12-27", 5409, "SGBDEC30IV"),
  buildSGB("SGB 2023-24 Series I",   "2023-06-19", "2031-06-19", 5926, "SGBJUN31I"),
  buildSGB("SGB 2023-24 Series IV",  "2023-12-28", "2031-12-28", 6199, "SGBDEC31IV"),
];

export function totalReturnPercent(sg: SGB): number {
  // Capital gain: (currentPrice - issuePrice) / issuePrice
  const capitalGainPct = ((sg.currentGoldPrice - sg.issuePrice) / sg.issuePrice) * 100;
  // Coupon income: 2.5% per year for years elapsed
  const today = new Date("2026-05-09");
  const issueDate = new Date(sg.issueDate);
  const yearsElapsed = (today.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  const couponTotalPct = sg.coupon * yearsElapsed;
  return capitalGainPct + couponTotalPct;
}

export function currentGoldValue(sg: SGB): number {
  // 1 unit = 1 gram of gold
  return sg.currentGoldPrice;
}
