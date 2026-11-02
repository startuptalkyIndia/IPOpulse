import type { CalcMeta } from "../types";

export const retirementAndTaxPart: CalcMeta[] = [
  {
    slug: "nps",
    title: "NPS Calculator",
    shortTitle: "NPS",
    heading: "NPS Calculator — National Pension System retirement corpus",
    description:
      "Calculate your NPS retirement corpus and monthly pension. Government-backed, tax-efficient (80CCD) retirement scheme.",
    category: "retirement",
    iconName: "ShieldCheck",
    inputs: [
      { key: "monthly", label: "Monthly contribution", min: 500, max: 100000, step: 500, default: 5000, prefix: "₹", format: "currency" },
      { key: "rate", label: "Expected return (p.a.)", min: 5, max: 15, step: 0.5, default: 10, suffix: "%", format: "percent" },
      { key: "years", label: "Years until retirement", min: 1, max: 45, step: 1, default: 25, suffix: "yrs", format: "years" },
      { key: "annuityPct", label: "Annuity purchase % at retirement", min: 40, max: 100, step: 5, default: 40, suffix: "%", format: "percent" },
      { key: "annuityRate", label: "Annuity interest rate (p.a.)", min: 4, max: 10, step: 0.5, default: 6, suffix: "%", format: "percent" },
    ],
    faq: [
      {
        q: "What is NPS?",
        a: "National Pension System — a government-backed voluntary retirement scheme managed by PFRDA. Two accounts: Tier-I (mandatory, locked till 60) and Tier-II (flexible). Returns come from equity (up to 75%), corporate bonds, and G-Secs.",
      },
      {
        q: "What tax benefits does NPS offer?",
        a: "Section 80CCD(1): up to ₹1.5L (within 80C limit). Section 80CCD(1B): extra ₹50,000 exclusive to NPS — unique advantage over other instruments. Section 80CCD(2): employer contribution up to 10% of salary also deductible.",
      },
      {
        q: "Can I withdraw everything at 60?",
        a: "No. At retirement, 60% can be withdrawn tax-free as lumpsum. The remaining 40% must be used to purchase an annuity from an IRDAI-approved insurer, which pays you a monthly pension for life. Annuity income is taxable.",
      },
    ],
    related: ["retirement", "ppf", "sip", "tax"],
    overview: [
      "NPS (National Pension System) is one of India's most tax-efficient retirement vehicles — the only scheme that offers an extra ₹50,000 deduction beyond the ₹1.5L 80C limit (Section 80CCD-1B). For salaried employees with employer contributions, an additional 10% of basic+DA is deductible under 80CCD-2, on top of the 80C and 80CCD-1B limits. Stacked correctly, NPS can reduce taxable income by ₹2,00,000+ per year for a senior salaried professional.",
      "Contributions grow through a mix of equity, corporate bonds, and government securities. You can choose your asset allocation (Active Choice — you set equity %, capped at 75% till age 50, gradually reducing thereafter) or let age-based auto-allocation happen (Auto Choice with Aggressive, Moderate, or Conservative life-cycle funds). Equity portion has historically delivered 11–13% CAGR; corporate bonds 8–9%; G-Secs 7–8%. NPS expense ratio is the lowest in India at 0.03–0.09% — vastly cheaper than even index funds.",
      "At age 60, 60% of corpus comes out tax-free as lumpsum. The remaining 40% must buy an annuity — this calculator estimates your monthly pension assuming a typical 6% annuity rate. The mandatory annuity is the most criticized feature of NPS: annuity rates in India are low (5.5–7%) and the annuity income is fully taxable at slab rate, eroding the tax benefit you got during accumulation. Choose carefully between annuity providers (LIC, HDFC, ICICI Pru, SBI Life, Max, Tata AIA, Bajaj Allianz) and annuity types (life, life with return of purchase price, joint life).",
      "How NPS compares to alternatives: vs EPF, NPS has lower expenses, market-linked equity exposure, and the unique 80CCD-1B benefit, but enforces annuitization. Vs PPF, NPS gives higher long-term return potential through equity but is more illiquid. Vs ELSS mutual funds, NPS has lower expenses and an extra ₹50K deduction, but ELSS has just a 3-year lock-in versus NPS until 60. The most efficient retirement stack for an Indian salaried professional: max out EPF (mandatory), max out 80C with PPF + ELSS (₹1.5L), max out 80CCD-1B with NPS (₹50K), and then add equity SIPs from post-tax savings.",
      "NPS Tier-II is a separate, flexible account with no lock-in and no tax benefits — basically a low-cost mutual-fund-like account run by PFRDA fund managers. Useful for parking medium-term money you don't want to commit to mandatory equity SIPs but want to grow at slightly above debt rates. Withdrawal anytime without penalty. Underused but a good option for moderate-risk savers in their 40s+.",
    ],
  },
  {
    slug: "rd",
    title: "RD Calculator",
    shortTitle: "RD",
    heading: "RD Calculator — Recurring Deposit maturity value",
    description:
      "Calculate your bank recurring deposit maturity amount. Monthly deposit with quarterly compounding interest.",
    category: "investment",
    iconName: "Repeat",
    inputs: [
      { key: "monthly", label: "Monthly deposit", min: 100, max: 200000, step: 100, default: 5000, prefix: "₹", format: "currency" },
      { key: "rate", label: "Interest rate (p.a.)", min: 1, max: 12, step: 0.05, default: 7.1, suffix: "%", format: "percent" },
      { key: "months", label: "Tenure (months)", min: 6, max: 120, step: 1, default: 60, suffix: "mo", format: "months" },
    ],
    faq: [
      {
        q: "What is a Recurring Deposit?",
        a: "An RD lets you deposit a fixed amount every month for a chosen tenure (usually 6 months to 10 years). Interest compounds quarterly. Good for disciplined savings without market risk.",
      },
      {
        q: "RD vs SIP — which is better?",
        a: "RDs are safer (guaranteed return, DICGC-insured to ₹5L) but give 6–8% vs SIPs in equity funds which have historically done 11–13% over long periods. For short-term goals (1–3 years) RDs are better; for 5+ years, SIPs usually win.",
      },
      {
        q: "Is RD interest taxable?",
        a: "Yes — fully taxable at your slab rate. Banks deduct TDS at 10% if total RD + FD interest exceeds ₹40,000/year (₹50,000 for seniors). No Section 80C benefit.",
      },
    ],
    related: ["fd", "sip", "ppf"],
    overview: [
      "Recurring Deposits are a disciplined savings tool — you commit to a fixed monthly deposit for a fixed tenure at a fixed rate. Unlike a SIP into mutual funds, the rate is locked at account-opening and the maturity amount is contractually guaranteed. RDs are ideal for short-to-medium goals (1–5 years): wedding fund, emergency buffer top-up, vacation savings, down payment build-up, or a child's school fees fund.",
      "Interest compounds quarterly in most Indian banks. Miss a monthly deposit and most banks charge a small penalty (~₹1.50–₹2 per ₹100 missed) — and after 3–4 missed deposits some banks may close the RD prematurely. Set up auto-debit from your savings account to avoid this. The RD is just as DICGC-insured as an FD (₹5 lakh per depositor per bank) — deposits across multiple banks for amounts above this.",
      "Rates vary: 6.5–7.5% at PSU banks (SBI, PNB, BoB, Canara), 7–8% at private banks, up to 8.5% at small finance banks (Ujjivan, AU, Equitas, Suryoday). Senior citizens get an extra 0.25–0.50%. Post Office RD currently offers 6.7% — competitive for risk-averse savers who prefer government backing over even DICGC-insured banks.",
      "RD vs SIP comparison for a 5-year horizon at typical rates: ₹5,000/month for 60 months at 7% RD compounding quarterly grows to roughly ₹3.6 lakh. The same ₹5,000/month into an equity SIP at expected 12% grows to roughly ₹4.1 lakh (with volatility — can be much higher or lower in any specific 5-year window). RDs win on certainty, SIPs win on expected return. For goals where missing the target is unacceptable (next year's school admission), choose RD. For goals where you have flexibility on timing (5+ years out), choose SIP.",
      "Tax inefficiency is the biggest drawback of RDs. Interest is taxable at slab rate (10%, 20%, 30%+) every year on accrual basis — meaning you pay tax even before maturity. A 30%-bracket taxpayer earning 7% on RD effectively earns just 4.9% post-tax, which barely beats inflation. For taxpayers above 20% slab, debt mutual funds (post-3-year holding for indexation, though indexation is no longer available since April 2023 reforms — now slab-rate) or even tax-free PPF make better long-term sense than RDs.",
    ],
  },
  {
    slug: "hra",
    title: "HRA Exemption Calculator",
    shortTitle: "HRA",
    heading: "HRA Calculator — House Rent Allowance tax exemption",
    description:
      "Calculate your HRA tax exemption under Section 10(13A). Inputs: basic salary, HRA received, rent paid, and city type.",
    category: "tax",
    iconName: "Building",
    inputs: [
      { key: "basic", label: "Basic salary (monthly)", min: 5000, max: 1000000, step: 1000, default: 50000, prefix: "₹", format: "currency" },
      { key: "da", label: "DA forming part of retirement (monthly)", min: 0, max: 1000000, step: 500, default: 0, prefix: "₹", format: "currency" },
      { key: "hraReceived", label: "HRA received (monthly)", min: 0, max: 500000, step: 500, default: 20000, prefix: "₹", format: "currency" },
      { key: "rent", label: "Rent paid (monthly)", min: 0, max: 500000, step: 500, default: 25000, prefix: "₹", format: "currency" },
      { key: "metro", label: "Metro city? (0=No, 1=Yes)", min: 0, max: 1, step: 1, default: 1, format: "plain" },
    ],
    faq: [
      {
        q: "What is HRA exemption?",
        a: "Under Section 10(13A), salaried employees living in rented housing can claim tax exemption on part of their HRA. The exempt portion equals the LOWEST of: (a) actual HRA received, (b) 50% of basic+DA for metros / 40% for non-metros, (c) rent paid minus 10% of basic+DA.",
      },
      {
        q: "Which cities are considered metros?",
        a: "For HRA: Delhi, Mumbai, Kolkata, Chennai. Bengaluru, Hyderabad, Pune, Ahmedabad are NOT metros for HRA purposes despite being large cities. Surprising but that's the IT rule.",
      },
      {
        q: "Can I claim HRA in the new tax regime?",
        a: "No. New regime (default from FY 2024-25) strips away HRA and most other deductions. You can only claim HRA under the old regime. This is one of the main reasons some taxpayers still prefer the old regime.",
      },
    ],
    related: ["tax", "ppf"],
    overview: [
      "HRA (House Rent Allowance) is the single biggest tax-saving component for renting salaried employees in India. For someone earning ₹15 lakh/year and paying ₹25,000/month rent in a metro, HRA exemption alone can shelter ₹2.4–3 lakh of income, saving ₹50,000–₹90,000 in tax depending on slab. This makes HRA optimization more impactful than most other 80C-style deductions for renters.",
      "The exemption formula is a 'minimum of three' rule — actual HRA received, 50% of basic+DA for metros (40% for non-metros), or rent paid minus 10% of basic+DA. Whichever is lowest becomes your tax-free amount. The remaining HRA gets taxed as regular salary. Most salaried employees don't realize that under-quoting rent or paying too little rent caps the exemption — there's a sweet spot where actual rent paid is high enough to maximize claim.",
      "Requirements for claiming HRA: rent receipts for claims above ₹3,000/month, PAN of landlord if annual rent exceeds ₹1 lakh (₹8,333/month), valid rent agreement (preferred but not strictly mandatory by law for HRA — yet your employer or assessing officer may ask), and the rule that you cannot own residential property in the same city where you claim HRA. You can own property in another city while claiming HRA in your work-city — this is fully legal.",
      "What counts as a 'metro' for HRA — and what doesn't — surprises people. Income Tax law lists only Delhi, Mumbai, Kolkata, and Chennai as metros. Bengaluru, Hyderabad, Pune, Ahmedabad, Gurgaon, Noida — all major cities with metro-level rents — are technically non-metro for HRA purposes, capped at 40% instead of 50%. Pushback against this rule has been raised in Parliament for years; no change so far. Plan accordingly.",
      "HRA is unavailable in the new tax regime. If your HRA claim is significant (₹1.5L+), you may save more under the old regime even after losing the simpler new-regime rates. Run both regimes through this calculator and the income tax calculator before locking your declaration. Special case for those paying rent to parents: legal and common, but rent receipts must be issued, parents must declare the rental income on their ITR, and the arrangement must be at fair market rates. Done correctly, this is a perfectly legitimate way to convert taxable salary into family wealth-building.",
    ],
  },
  {
    slug: "inflation",
    title: "Inflation Calculator",
    shortTitle: "Inflation",
    heading: "Inflation Calculator — future cost of today's expenses",
    description:
      "See how much your expenses will cost in the future due to inflation. Essential for retirement and goal planning.",
    category: "other",
    iconName: "TrendingUp",
    inputs: [
      { key: "amount", label: "Today's amount", min: 1000, max: 100000000, step: 1000, default: 100000, prefix: "₹", format: "currency" },
      { key: "rate", label: "Inflation rate (p.a.)", min: 1, max: 15, step: 0.5, default: 6, suffix: "%", format: "percent" },
      { key: "years", label: "Years in future", min: 1, max: 50, step: 1, default: 20, suffix: "yrs", format: "years" },
    ],
    faq: [
      {
        q: "What inflation rate should I assume for India?",
        a: "India's long-term average CPI inflation is ~6–7%. RBI targets 4% ±2%. For personal finance planning, use 6% as the baseline. Education and healthcare inflation run higher (8–10%) — factor this in for goal-based planning.",
      },
      {
        q: "How does inflation affect my investments?",
        a: "Your 'real return' is nominal return minus inflation. An FD giving 7% with 6% inflation gives just 1% real return. Equity's 12% at 6% inflation gives 6% real — which is why stocks beat FDs long term.",
      },
      {
        q: "Why does inflation matter for retirement?",
        a: "If you need ₹50k/month today, in 30 years at 6% inflation you'll need ₹2.87 lakh/month. This is why retirement calculators that ignore inflation dangerously underestimate the corpus needed.",
      },
    ],
    related: ["retirement", "sip", "fd"],
    overview: [
      "Inflation is the silent tax that erodes your money's purchasing power every year. A product that costs ₹100 today costs ₹321 in 20 years at 6% inflation. India's long-run CPI inflation has averaged ~6.5% over the last 20 years, with notable spikes (2009–2013 averaged 9.5%) and quieter periods (2018–2019 around 4%). RBI's mandate is to keep CPI in a 2–6% band, but supply shocks (oil, food, currency) regularly push it past 6% for months at a time.",
      "This calculator projects how much an expense will grow in nominal rupees. The reverse — today's purchasing power of a future amount — is also shown. Use it before any major financial decision: how much will your child's college cost in 15 years? How much will your retirement lifestyle cost in 25 years? How much will a family car cost in 5 years? The numbers are usually 30–80% larger than people instinctively assume.",
      "Rule of thumb: at 6% inflation, your money's purchasing power halves every ~12 years. That's the reason idle cash in a savings account paying 3% is slowly bleeding value at ~3% per year in real terms. Even an FD at 7% is barely keeping pace post-tax for a 30%-bracket taxpayer (post-tax ~4.9%, vs 6% inflation = −1.1% real return). The mathematical reason equity is essential for long-term wealth: it's the only mainstream Indian asset class that has consistently delivered 5%+ real returns over 15+ year windows.",
      "Different inflation rates apply to different categories — and using a blended 6% can mislead you on specific goals. Education inflation in India has averaged 9–11% (private school fees, IIT/IIM/medical college costs). Healthcare inflation 12–14% (private hospital procedures, medicines). Real estate 5–7% nationally, but 8–12% in tier-1 cities pre-2014, near-flat 2014–2021, and rising again 2022 onwards. Lifestyle goods (electronics, cars) 3–5%. Use category-specific rates when planning category-specific goals.",
      "Behavioral implication: most retail investors fail at long-term wealth-building not because they make bad investment choices, but because they underestimate the corpus they actually need. A retirement plan built on 'I'll need ₹50,000/month' falls short if you don't ask 'in what year's rupees?' The same ₹50K monthly expense becomes ₹2.87 lakh/month in 30 years at 6% inflation. Build all goal-based planning, retirement corpus calculations, and emergency fund targets in inflation-adjusted future-value terms — not today's rupees.",
    ],
  },
  {
    slug: "mf-returns",
    title: "Mutual Fund Returns Calculator",
    shortTitle: "MF Returns",
    heading: "Mutual Fund Returns Calculator — CAGR & absolute return",
    description:
      "Compute CAGR (annualized) and absolute returns on your mutual fund investment. Simple lump-sum return analysis.",
    category: "investment",
    iconName: "LineChart",
    inputs: [
      { key: "initial", label: "Amount invested", min: 1000, max: 100000000, step: 1000, default: 100000, prefix: "₹", format: "currency" },
      { key: "final", label: "Current value", min: 1000, max: 500000000, step: 1000, default: 200000, prefix: "₹", format: "currency" },
      { key: "years", label: "Holding period", min: 0.5, max: 40, step: 0.5, default: 5, suffix: "yrs", format: "years" },
    ],
    faq: [
      {
        q: "What's the difference between CAGR and absolute return?",
        a: "Absolute return is total gain %: ((Final−Initial)/Initial)×100. CAGR smooths this over time: (Final/Initial)^(1/years)−1. For multi-year investments, CAGR is the fair comparison since it's annualized.",
      },
      {
        q: "What's a good CAGR for Indian equity funds?",
        a: "Long-term (10+ yr) large-cap funds: 11–13%. Flexi/multi-cap: 12–15%. Mid/small-cap: 14–18% (higher volatility). Debt funds: 6–8%. Anything consistently above 18% is either very lucky, very recent, or hiding risk.",
      },
      {
        q: "Should I use CAGR for SIP returns?",
        a: "No — use XIRR for SIPs. CAGR assumes a single lumpsum. XIRR handles multiple dated cashflows correctly. We'll add an XIRR calculator in a future update.",
      },
    ],
    related: ["sip", "lumpsum", "inflation"],
    overview: [
      "CAGR (Compound Annual Growth Rate) is the industry standard for reporting mutual fund returns. It's the annualized rate that would have produced your gain if growth were steady year after year — even though actual returns are jagged. Reporting CAGR (instead of absolute return) is mandatory for mutual fund factsheets in India when reporting returns over periods longer than 1 year, per SEBI advertising regulations.",
      "Formula: CAGR = (Final Value / Initial Value)^(1/years) − 1. Works for any investment held for a continuous period, not just mutual funds — direct stocks, real estate, gold, or even a business valuation. Important caveat: CAGR is appropriate only when there are no in-between cashflows. If you added or withdrew money during the holding period, you need XIRR (Extended Internal Rate of Return) instead, which handles dated cashflows. SIPs, SWPs, and partial withdrawals all need XIRR.",
      "Quick check: if your CAGR beats inflation by 3–6%, you're doing well. Beating Nifty 50's long-term CAGR (~12% over 20 years) consistently is the real benchmark for active funds — yet roughly 70–80% of active large-cap funds underperform the Nifty 50 TRI over 10-year windows, which is why low-cost index funds (Nifty 50, Nifty Next 50, Nifty 500) have become so popular among Indian retail investors.",
      "What 'good CAGR' looks like by asset class for Indian investors over 10+ year windows: large-cap equity MFs 11–13%, flexi-cap 12–15%, mid-cap 14–17%, small-cap 15–19% (with much higher volatility), debt MFs 6–8%, gold 8–10%, real estate 6–9%, FDs 6.5–8%. Anything claiming 25%+ CAGR over multiple years should be examined skeptically — it's either short-term lucky, includes survivorship bias, or hides leverage/risk.",
      "Use this calculator for honest portfolio review. Pull your invested amount and current value across all funds, plug in the years held, and compare resulting CAGR to the relevant benchmark (Nifty 50 TRI for large-cap, Nifty Midcap 150 TRI for mid-cap, etc.). Funds that have under-performed their benchmark by 2%+ for 5+ years are almost always worth switching. Past performance is not a guarantee, but persistent under-performance versus an index is the clearest signal that an active fund isn't earning its expense ratio.",
    ],
  },
];
