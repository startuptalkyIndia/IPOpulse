import type { CalcMeta } from "../types";

export const capitalGainsAndLoansPart: CalcMeta[] = [
  {
    slug: "ltcg-stcg",
    title: "LTCG STCG Calculator",
    shortTitle: "LTCG/STCG",
    heading: "LTCG / STCG Calculator — capital gains tax on stocks & mutual funds",
    description:
      "Calculate long and short term capital gains tax on equity and debt. Updated with FY 2024-25 rates (12.5% LTCG, 20% STCG, ₹1.25L exempt).",
    category: "tax",
    iconName: "Coins",
    inputs: [
      { key: "buyValue", label: "Buy value (total)", min: 1000, max: 100000000, step: 1000, default: 100000, prefix: "₹", format: "currency" },
      { key: "sellValue", label: "Sell value (total)", min: 1000, max: 100000000, step: 1000, default: 150000, prefix: "₹", format: "currency" },
      { key: "holdingMonths", label: "Holding period (months)", min: 1, max: 240, step: 1, default: 18, suffix: "mo", format: "months" },
      { key: "assetType", label: "Asset type (0=Equity/MF, 1=Debt)", min: 0, max: 1, step: 1, default: 0, format: "plain" },
    ],
    faq: [
      {
        q: "What's the difference between LTCG and STCG?",
        a: "Long-Term Capital Gain (LTCG) applies when you hold equity/MF for 12+ months or debt for 24+ months. Short-Term Capital Gain (STCG) is when held for less. LTCG on equity is taxed at 12.5% (first ₹1.25L exempt), STCG at 20%. Debt is always taxed at your slab.",
      },
      {
        q: "What changed in Budget 2024?",
        a: "Budget 2024 increased STCG on equity from 15% → 20%, LTCG on equity from 10% → 12.5%, and raised the LTCG exemption from ₹1L to ₹1.25L per year. Debt fund indexation was removed in April 2023 — all debt gains now taxed at slab.",
      },
      {
        q: "How do I claim the ₹1.25L LTCG exemption?",
        a: "It's automatically applied in ITR-2 when you report LTCG from equity/mutual funds. The first ₹1.25L of LTCG per financial year is exempt; anything above is taxed at 12.5%. You can't carry forward the unused exemption.",
      },
      {
        q: "What about gifts or inheritance?",
        a: "Cost basis transfers to the receiver. Holding period starts from the original purchase date (not gift date). Gifts themselves are not taxable for close relatives; property gifts have their own rules.",
      },
    ],
    related: ["tax", "mf-returns", "lumpsum"],
    overview: [
      "Capital gains tax in India is bifurcated: short-term vs long-term, and equity vs debt. Rates changed significantly in Budget 2024 (effective 23 July 2024) — any profit booked after that date uses the new rates. STCG on listed equity rose from 15% to 20%, LTCG on equity from 10% to 12.5%, and the LTCG annual exemption was raised from ₹1 lakh to ₹1.25 lakh. Debt fund indexation was already removed in April 2023, so all debt fund gains are now taxed at your slab rate regardless of holding period.",
      "Equity / equity MFs: 12+ months = LTCG (12.5% above ₹1.25L); under 12 = STCG (20%). Debt / debt MFs (post-April 2023): always taxed at your slab, regardless of holding period. Real estate and gold ETFs/funds: 24 months for LTCG, 12.5% LTCG without indexation (or 20% with indexation, taxpayer's choice for property purchased before 23 July 2024 — grandfathering provision). International equity funds and fund-of-funds are treated as debt — slab rate.",
      "Tip: offset gains with losses from the same category. Short-term capital losses can offset both STCG and LTCG; long-term capital losses only offset LTCG (not regular income). Unused losses carry forward 8 financial years, making strategic loss harvesting in down markets a legitimate way to bank tax-shield for future use. Tax loss harvesting is especially valuable around January–March when you can review the year's gains and deliberately book losses against them.",
      "The ₹1.25 lakh LTCG exemption is per-individual per-financial-year. Spousal planning: gift equity to a non-working spouse, sell, and the gain is in their name (with their separate ₹1.25L exemption). Children: same logic for adult children. For minor children, clubbing rules apply. Never use this aggressively without consulting a CA — Section 56 (gift tax) and Section 64 (clubbing) have nuances.",
      "Specific scenarios this calculator simplifies: it doesn't model surcharge (10% on LTCG above ₹50L taxable income, 15% above ₹1Cr), it assumes you've already used the ₹1.25L exemption elsewhere if you input an LTCG figure, and it doesn't capture grandfathering for pre-31 January 2018 equity acquisitions. For exact tax including surcharge, marginal relief, and grandfathering on legacy equity holdings, use a CA-grade tool or consult a tax advisor before booking gains larger than ₹10 lakh.",
    ],
  },
  {
    slug: "fno-margin",
    title: "F&O Margin Calculator",
    shortTitle: "F&O Margin",
    heading: "F&O Margin Calculator — SPAN + Exposure margin required",
    description:
      "Calculate margin required to trade index and stock futures & options. SPAN + Exposure margin breakdown with leverage.",
    category: "trading",
    iconName: "Gauge",
    inputs: [
      { key: "lotSize", label: "Lot size (shares/units)", min: 1, max: 10000, step: 1, default: 75, format: "plain" },
      { key: "price", label: "Current price", min: 1, max: 100000, step: 0.5, default: 25000, prefix: "₹", format: "currency" },
      { key: "instrumentType", label: "Instrument (0=Index, 1=Stock)", min: 0, max: 1, step: 1, default: 0, format: "plain" },
    ],
    faq: [
      {
        q: "What is SPAN margin?",
        a: "SPAN (Standard Portfolio Analysis of Risk) is the main margin calculated by the exchange using a worst-case scenario risk model across 16 different market scenarios. It's the minimum margin you must keep.",
      },
      {
        q: "What's exposure margin?",
        a: "An additional margin charged over SPAN to absorb 2-3% price moves. Index futures: ~3% of contract value. Stock futures: ~5%. Total margin = SPAN + Exposure.",
      },
      {
        q: "Why did F&O margins go up in 2020?",
        a: "SEBI's peak margin rules (phased 2020–21) require brokers to collect full margin upfront for both buy and sell sides. Earlier, delivery margin was collected in stages. This ended the 'intraday leverage' discount brokers used to offer.",
      },
      {
        q: "Is this calculator exact?",
        a: "It's a working estimate. Actual SPAN margins are computed 6 times a day by NSE using live volatility. For exact numbers, use your broker's margin calculator — Zerodha, Sensibull, and Upstox all have official ones.",
      },
    ],
    related: ["brokerage", "lumpsum"],
    overview: [
      "Trading index/stock futures and options requires margin to be blocked upfront. Margin = SPAN (risk-based, computed by NSE/BSE based on a 16-scenario worst-case price/volatility shock) + Exposure (additional buffer above SPAN to absorb 2–3% price moves). Exchange margins are recalculated six times daily during market hours; we use representative mid-day values for index and stock derivatives. The actual margin you'll need can fluctuate intraday as volatility shifts.",
      "Leverage = contract value ÷ margin. Index futures (Nifty, BankNifty, FinNifty, Sensex) typically give 6–8x leverage. Stock futures give 4–5x. Options buyers only pay premium (no margin requirement) — but premiums can decay rapidly. Options sellers pay full margin like futures, often with additional Volatility Margin and Mark-to-Market overnight if positions move against them. Selling naked options is the highest-margin activity in F&O.",
      "New SEBI peak margin rules enforced from December 2020 (phased through August 2021): brokers must collect full upfront margin for both buy and sell legs; no more intraday-only leverage boost where brokers used to fund 5–10x leverage on margin shortfall. Short-margin penalty = 0.5–5% per day depending on shortfall size. Practical effect: intraday F&O capital requirements roughly doubled overnight, eliminating many small retail traders from the F&O market.",
      "How to read the margin breakdown for a position: SPAN tells you what the exchange thinks your worst-case 1-day loss is, modeled across 7 price scenarios × 2 volatility scenarios. Exposure margin is broker/exchange's safety buffer. The two together are your initial margin requirement. As your position moves against you intraday, MTM (Mark-to-Market) is debited from your trading account in near-real-time — if it falls below maintenance margin (typically 60–80% of initial), you get a margin call and your broker can square off positions without notice.",
      "Risk warning: F&O is not a get-rich-quick instrument. SEBI's January 2023 study found that 89% of individual F&O traders lost money in FY 2021–22, with average net loss of ₹1.10 lakh per active trader. Aggregate retail F&O losses crossed ₹50,000 crore in FY 2022. If you're new to F&O, start with simple covered-call or cash-secured-put strategies on stocks you already hold, not naked options or aggressive futures positions. Always size positions so that a stop-loss hit costs you less than 1–2% of total capital.",
    ],
  },
  {
    slug: "goal",
    title: "Goal-based SIP Calculator",
    shortTitle: "Goal",
    heading: "Goal-based SIP Calculator — monthly investment for any target",
    description:
      "Calculate the monthly SIP needed to reach any financial goal — house, car, child education, wedding. Inflation-adjusted.",
    category: "investment",
    iconName: "Target",
    inputs: [
      { key: "target", label: "Goal amount (today's ₹)", min: 100000, max: 100000000, step: 10000, default: 5000000, prefix: "₹", format: "currency" },
      { key: "currentSavings", label: "Current savings toward goal", min: 0, max: 100000000, step: 10000, default: 100000, prefix: "₹", format: "currency" },
      { key: "years", label: "Years to goal", min: 1, max: 40, step: 1, default: 10, suffix: "yrs", format: "years" },
      { key: "rate", label: "Expected return (p.a.)", min: 1, max: 30, step: 0.5, default: 12, suffix: "%", format: "percent" },
      { key: "inflation", label: "Inflation rate (p.a.)", min: 0, max: 15, step: 0.5, default: 6, suffix: "%", format: "percent" },
    ],
    faq: [
      {
        q: "Why does this calculator use inflation?",
        a: "₹50 lakh today won't buy the same house in 10 years. We inflate your target to its future cost, then reverse-engineer the monthly SIP needed. Skipping inflation undershoots the required SIP by 30–50%.",
      },
      {
        q: "What inflation should I use for different goals?",
        a: "General: 6%. Education: 8–10% (India's education inflation is notoriously high). Healthcare: 8%. Lifestyle expenses: 6%. Real estate: 5–7% nationally. The calculator defaults to 6% — adjust up for education goals.",
      },
      {
        q: "What if I can't afford the suggested SIP?",
        a: "Three levers: (1) extend the horizon — going from 10 to 15 years roughly halves the required SIP. (2) Start with current savings — lumping in even ₹1L early dramatically cuts monthly needs. (3) Accept a lower target. Don't accept a higher return — that's wishful thinking.",
      },
    ],
    related: ["sip", "retirement", "step-up-sip"],
    overview: [
      "Goal-based planning is the right way to think about money. Instead of 'how much should I save?', ask: 'what do I want, when, and what will it cost then?' This shift in framing — from generic wealth accumulation to specific outcome-driven planning — is the single biggest behavioral upgrade Indian retail investors can make. It eliminates the 'how much is enough?' anxiety and replaces it with concrete monthly targets that you can actually achieve.",
      "This calculator answers: given a target (in today's rupees), a timeline, and expected return, what monthly SIP gets you there? It factors inflation so the number is realistic. The math first inflates your target to its future cost, then back-solves for the monthly contribution required at the given expected return. Default inflation is set to 6%; bump it to 8–10% for education goals, 8% for healthcare, 5–7% for real estate.",
      "Examples for a ₹50L goal in 10 years at 12% return, 6% inflation: starting from zero needs ₹44,000/month. With ₹5L already saved, drops to ₹37,700/month. Time is your biggest lever — extending the same goal to 15 years drops the SIP to ₹19,000/month, less than half. Doubling the horizon roughly halves the SIP needed, every single time. This is why starting young is dramatically more important than picking 'the best' fund.",
      "Three real-world Indian goals priced in today's money and projected forward: Engineering college (current cost ~₹16L for 4 years at IIT/NIT, ~₹40L at private engineering) at 9% education inflation: needs ₹38L–₹95L in 15 years. Mid-range Indian wedding (current ₹15–25L) at 7% inflation: needs ₹40–67L in 15 years. Down payment on ₹1Cr Tier-1 city apartment (currently 20% = ₹20L) at 6% real estate inflation: needs ₹48L in 15 years. Building toward all three simultaneously requires multi-bucket SIP allocation.",
      "Three levers when the suggested SIP feels unaffordable: (1) Extend the horizon — the most powerful lever. Going from 10 to 15 years roughly halves the required SIP. (2) Start with a lumpsum and lower the monthly. Putting in ₹1L upfront cuts the SIP need by 5–8% over 15 years. (3) Accept a lower target. Don't accept a higher return assumption — that's wishful thinking and often leads to over-aggressive equity allocation in goals that need protection. For goals less than 3 years away, use debt funds or RDs (not equity SIPs) — equity volatility can blow up short-horizon goals.",
    ],
  },
  {
    slug: "car-loan-emi",
    title: "Car Loan EMI Calculator",
    shortTitle: "Car EMI",
    heading: "Car Loan EMI Calculator — monthly installment & amortisation",
    description:
      "Calculate EMI for new or used car loan. Enter loan amount, interest rate, and tenure. Full amortisation breakdown included.",
    category: "loan",
    iconName: "Car",
    inputs: [
      { key: "principal", label: "Loan amount", min: 50000, max: 10000000, step: 10000, default: 800000, prefix: "₹", format: "currency" },
      { key: "rate", label: "Interest rate (p.a.)", min: 5, max: 25, step: 0.1, default: 9.5, suffix: "%", format: "percent" },
      { key: "years", label: "Loan tenure", min: 1, max: 8, step: 1, default: 5, suffix: "yrs", format: "years" },
    ],
    faq: [
      {
        q: "What's a typical car loan interest rate in India?",
        a: "PSU banks: 8.75–9.5% (new car). Private banks: 9–11%. NBFCs: 10–13%. Used car loans are 1–3% higher than new. Rates depend on credit score, income, and existing bank relationship.",
      },
      {
        q: "Is there prepayment penalty on car loans?",
        a: "Most banks charge 2–5% on outstanding principal for early closure of car loans (unlike home loans where RBI bans penalties on floating-rate loans for individuals). Always read the sanction letter before signing.",
      },
      {
        q: "Should I take a longer tenure to reduce EMI?",
        a: "Short answer: no. Cars depreciate fast (30% in year 1, 50% by year 4). A 7-year loan often means you're paying interest on an asset worth less than the outstanding principal. Keep car loans ≤5 years.",
      },
    ],
    related: ["emi", "personal-loan-emi", "tax"],
    overview: [
      "Car loans in India typically run 1–7 years at floating or fixed rates. EMI = [P × r × (1+r)^n] / [(1+r)^n − 1], where P is loan amount, r is monthly rate, n is months. New car loans are typically 8.75–11% (PSU banks at the lower end, NBFCs at the higher end). Used car loans run 11–14% — the higher rate compensates lenders for the faster depreciation and resale risk on a pre-owned vehicle.",
      "Tip: prefer 3–5 year tenures despite the higher EMI. Longer tenures mean significantly more interest paid, plus risk of the car being worth less than the outstanding loan (negative equity) if you want to sell mid-loan. A 7-year ₹10L loan at 9.5% costs ₹3.65L in total interest; the same loan at 4 years costs ₹2.05L. Stretching tenure to lower EMI is rarely worth the extra ₹1.6 lakh interest.",
      "Down payment matters more than tenure. Putting down 20–30% instead of financing 100% dramatically cuts total interest paid and keeps EMI manageable. The ideal split: down payment ≥ 20% of on-road price, loan tenure ≤ 5 years, EMI ≤ 10% of monthly take-home (combined with all other EMIs ≤ 40%). If you can't meet these thresholds, you're stretching beyond what the asset justifies — consider a cheaper car or wait until you can afford the right structure.",
      "Hidden costs of car ownership beyond the loan: insurance (3–4% of vehicle value annually for comprehensive), registration (8–12% of ex-showroom in most states), road tax, maintenance (₹15–30K/year for sedans, more for premium SUVs), fuel, parking, and depreciation (typically 20–30% in year 1, then 10–15% per year). Total annual cost of running a ₹10L car often exceeds ₹2 lakh excluding the loan — budget accordingly before signing.",
      "Loan vs cash purchase math: if you have the cash, paying upfront avoids the 9.5% interest cost. But if your alternative is keeping that cash invested in equity earning 12%+, the loan can be slightly net-positive. The catch: most people who 'choose' to take a loan to keep cash invested actually end up spending the cash. The disciplined version of this strategy works on paper; the lived version usually doesn't. Most middle-class Indian families do better paying the maximum down payment they can afford and keeping the loan tenure short.",
    ],
    tags: ["car loan", "vehicle loan", "auto loan"],
  },
  {
    slug: "personal-loan-emi",
    title: "Personal Loan EMI Calculator",
    shortTitle: "Personal EMI",
    heading: "Personal Loan EMI Calculator — unsecured loan monthly payment",
    description:
      "Calculate personal loan EMI. Unsecured loans typically have 11–18% interest. Full amortisation with total interest shown.",
    category: "loan",
    iconName: "Wallet",
    inputs: [
      { key: "principal", label: "Loan amount", min: 10000, max: 5000000, step: 5000, default: 300000, prefix: "₹", format: "currency" },
      { key: "rate", label: "Interest rate (p.a.)", min: 9, max: 30, step: 0.1, default: 13.5, suffix: "%", format: "percent" },
      { key: "years", label: "Loan tenure", min: 1, max: 7, step: 1, default: 3, suffix: "yrs", format: "years" },
    ],
    faq: [
      {
        q: "Why are personal loan rates so high?",
        a: "Unsecured — no collateral. Bank's only recovery route is legal action if you default. Lenders price this risk in. Typical rates: PSU 11–14%, private 12–18%, NBFC/fintech 15–24%.",
      },
      {
        q: "What affects my personal loan rate?",
        a: "CIBIL score (750+ gets best rates), income-to-EMI ratio (FOIR below 40%), employer category (PSU/MNC gets preferential rates), relationship with bank (salary account), and loan amount (larger loans get better rates).",
      },
      {
        q: "Can I prepay a personal loan?",
        a: "Most banks allow prepayment with 2–5% fee on outstanding principal after a lock-in of 6–12 months. Partial prepayments reduce tenure (not EMI) — so you save significant interest. Always prepay when you have surplus.",
      },
      {
        q: "Are personal loans tax-deductible?",
        a: "Generally no. Exception: if you use the loan for home purchase/construction, the interest is deductible under Section 24 (up to ₹2L for self-occupied). Save receipts and declare purpose clearly.",
      },
    ],
    related: ["emi", "car-loan-emi", "tax"],
    overview: [
      "Personal loans are unsecured instalment loans — no collateral, higher rate, quicker approval (often 24 hours, sometimes minutes for app-based fintech offerings). Used for emergencies, weddings, travel, education, home renovation, or debt consolidation. Indian retail personal loan book has crossed ₹13 lakh crore as of 2026, growing 22% YoY — the fastest segment of bank credit, driven heavily by small-ticket app-based lending.",
      "Tenures: 12–72 months typical. EMIs calculated identically to home/car loans but at higher rates (11–18% at banks, 18–28% at NBFCs and fintechs vs 8–10% for home loans). The rate gap reflects pure credit risk pricing — there's no collateral to recover if you default, so lenders price in expected default rates plus margin.",
      "What affects your rate: CIBIL score (750+ unlocks the best rates, below 650 typically gets rejected or 22%+ rates), employer category (Tier-1 IT companies, MNCs, PSUs, government — preferential rates 0.5–1.5% lower), income level (₹50k+/month in tier-1 cities qualifies for bank rates), existing relationship (your salary account bank usually beats outside lenders by 0.5–1%), and loan amount (₹3L+ tickets get better pricing than ₹50K).",
      "Watch-outs that catch first-time borrowers: (1) Processing fees of 1–3% on loan amount, deducted upfront — your account credit is less than the sanctioned amount. (2) Mandatory insurance pitched by bank (loan protection plan, credit life cover) — usually decline politely; this can add 1.5–4% to effective cost. (3) 'Flat' vs 'reducing balance' interest — always demand reducing balance; flat interest hides 70–80% higher effective rate. (4) Foreclosure penalty — most banks charge 2–5% on outstanding principal for early closure. (5) Prepayment lock-in of 6–12 months at some lenders.",
      "Smart use cases vs misuse: smart use — debt consolidation (replacing 36% credit card debt with 14% personal loan saves significant interest), one-time medical emergency, planned wedding/home renovation with clear repayment plan. Misuse — vacations, gadget purchases, gifts, or topping up daily expenses. Personal loan EMIs cap your future home/car loan eligibility (lenders look at total FOIR), so taking a ₹5L personal loan can effectively delay your home loan by 2–3 years. Always read the Key Facts Statement (KFS — mandatory under RBI's Digital Lending Guidelines from 2023) before signing.",
    ],
    tags: ["personal loan", "unsecured loan", "instant loan"],
  },
];
