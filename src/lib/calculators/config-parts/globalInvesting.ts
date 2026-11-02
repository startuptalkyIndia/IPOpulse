import type { CalcMeta } from "../types";

export const globalInvestingPart: CalcMeta[] = [
  // ── US Investing calculators (Round 30) ────────────────────────────────
  {
    slug: "lrs-tcs",
    title: "LRS / TCS Calculator",
    shortTitle: "LRS / TCS",
    heading: "LRS TCS Calculator — remittance tax when investing in US stocks",
    description:
      "Calculate TCS on your LRS remittance for US stock investing. How much is deducted, when can you claim it back, and what is your net post-tax return after forex?",
    category: "tax",
    iconName: "Globe",
    inputs: [
      { key: "remittanceInr", label: "Remittance amount (₹)", min: 10000, max: 25000000, step: 10000, default: 500000, prefix: "₹", format: "currency" },
      { key: "priorRemittanceInr", label: "Prior LRS remittance this year (₹)", min: 0, max: 25000000, step: 10000, default: 0, prefix: "₹", format: "currency" },
      { key: "usdInr", label: "USD/INR rate", min: 70, max: 120, step: 0.5, default: 84, suffix: "₹/USD", format: "plain" },
      { key: "expectedReturnPct", label: "Expected USD return (p.a.)", min: 0, max: 25, step: 0.5, default: 10, suffix: "%", format: "percent" },
      { key: "inrDepreciationPct", label: "INR depreciation (p.a.)", min: -5, max: 10, step: 0.5, default: 3, suffix: "%", format: "percent" },
      { key: "holdingYears", label: "Holding period", min: 1, max: 20, step: 1, default: 5, suffix: "yrs", format: "years" },
    ],
    faq: [
      { q: "What is LRS?", a: "Liberalised Remittance Scheme — RBI allows resident Indians to remit up to USD 250,000 per financial year for investments, travel, education, and more." },
      { q: "What is TCS on LRS?", a: "Tax Collected at Source. For LRS remittances above ₹7 lakh/year, 20% TCS is deducted by your bank at the time of remittance. You can claim it back as a tax credit when you file your ITR — it's not a final tax, just advance collection." },
      { q: "How is US stock gain taxed in India?", a: "Under the India-USA DTAA, US withholding tax (30% on dividends, 0% on capital gains) applies. Indian residents must also declare gains in Indian ITR: STCG at slab rate, LTCG (>24 months) at 12.5% without indexation post-Budget 2024." },
      { q: "Is there double taxation?", a: "No — the DTAA prevents it. US withholds tax on dividends; you get credit for that in India. Capital gains in the US have no US tax for non-residents, so only Indian tax applies." },
      { q: "Which platforms support US investing from India?", a: "Vested Finance, Stockal, INDmoney, Interactive Brokers India, ICICI Direct (US stocks), HDFC Securities (US ETFs). Each uses the LRS route. Compare platforms on fees: Vested charges 0% brokerage, others charge $1–5/trade." },
    ],
    related: ["ltcg-stcg", "tax", "inflation"],
    overview: [
      "Investing in US stocks from India has exploded since 2019 — Vested Finance alone has processed over $1 billion in LRS remittances. The attraction is real: dollar-denominated assets, geographic diversification, and access to companies (Apple, Nvidia, Meta) that have no Indian equivalent. But the compliance layer is what trips up most retail investors.",
      "TCS (Tax Collected at Source) at 20% kicks in above ₹7 lakh of cumulative LRS remittances per financial year. This means if you send ₹10 lakh, your bank deducts ₹60,000 as TCS (20% on the ₹3 lakh above the threshold). This is NOT a tax loss — it's advance tax collection. You claim it back in your ITR as a tax credit. But the cash flow impact is real: you're effectively lending the government ₹60,000 until you file your return.",
      "The rupee depreciation factor is the other piece most Indian investors underweight. If USD/INR moves from ₹84 to ₹90 (7% depreciation) over 5 years, a 10% USD return actually becomes approximately 17% in rupee terms — the currency tailwind compounds returns. Conversely, if INR strengthens (unlikely historically but possible), it mutes your returns.",
      "Tax on exits: capital gains from US stocks sold by Indian residents are taxable in India. Less than 24 months (post-Budget 2024) = slab rate. More than 24 months = 12.5% LTCG without indexation. Dividends from US stocks: 25% US withholding tax (reduced from 30% under DTAA for certain cases) + India slab tax, with credit for US tax paid. US estate tax (40% above $60,000 for non-US persons) is a risk often ignored — consider holding via LLP or trust structure if exposure grows large.",
      "This calculator models: (1) TCS deducted now vs claimed back in ITR, (2) net corpus in ₹ terms after expected USD returns and INR depreciation over your holding period, (3) Indian tax on exit at 12.5% LTCG assuming >24 month hold. Use it to compare the true cost of direct LRS investing vs the India-listed international ETF route (no LRS required, but taxed as debt funds at slab rate).",
    ],
    tags: ["lrs", "tcs", "us stocks", "dollar investing", "vested"],
  },
  {
    slug: "usd-returns",
    title: "US Investment Returns (INR) Calculator",
    shortTitle: "USD Returns",
    heading: "US Stock Returns Calculator — what ₹1 lakh becomes in US markets, in rupees",
    description:
      "Model your US stock / ETF investment in INR terms. Accounts for USD returns, INR depreciation, Indian capital gains tax, and TCS reclaim. Compare vs Nifty 50.",
    category: "investment",
    iconName: "Globe",
    inputs: [
      { key: "investmentInr", label: "Investment amount (₹)", min: 10000, max: 50000000, step: 10000, default: 1000000, prefix: "₹", format: "currency" },
      { key: "usdReturnPct", label: "Expected USD return (p.a.)", min: 0, max: 25, step: 0.5, default: 10, suffix: "%", format: "percent" },
      { key: "inrDepreciationPct", label: "INR depreciation (p.a.)", min: -3, max: 8, step: 0.5, default: 3, suffix: "%", format: "percent" },
      { key: "years", label: "Holding period", min: 1, max: 25, step: 1, default: 10, suffix: "yrs", format: "years" },
      { key: "niftyReturnPct", label: "Nifty 50 comparison return (p.a.)", min: 0, max: 25, step: 0.5, default: 12, suffix: "%", format: "percent" },
    ],
    faq: [
      { q: "How does INR depreciation boost US returns?", a: "If USD/INR moves from ₹84 to ₹90 (about 7% over 2 years), your USD corpus is worth proportionally more in rupees even if USD returns are flat. Historical INR depreciation vs USD: ~3% per year over the last 20 years, with periods of 5-6% and periods near zero." },
      { q: "What is the actual post-tax return from US stocks in India?", a: "For a 10% USD return + 3% INR depreciation over 10 years (LTCG rate 12.5%): effective annualised INR return is approximately 11.2% post-tax. Compare to Nifty 50 historical CAGR of ~12% — the advantage of US stocks for an Indian investor depends heavily on the INR depreciation assumption." },
      { q: "S&P 500 vs NASDAQ 100 — which is better for Indians?", a: "NASDAQ 100 has historically returned ~14-16% USD CAGR (dominated by tech). S&P 500 ~10-12% USD CAGR. Both outperform in INR terms vs their USD face value due to currency tail. However NASDAQ has higher volatility. For most retail investors, S&P 500 (VOO, SPY) is the right base." },
      { q: "India-listed vs direct US ETF — tax difference?", a: "India-listed international funds (Motilal NASDAQ 100, Mirae S&P 500) are classified as debt funds since April 2023 — all gains taxed at slab rate regardless of holding period. Direct US investing via LRS: 12.5% LTCG after 24 months. For 30%-bracket taxpayers, direct LRS is usually more tax-efficient on long holds." },
    ],
    related: ["lrs-tcs", "sip", "ltcg-stcg", "inflation"],
    overview: [
      "The question every Indian retail investor is now asking: 'Should I invest in the US market?' is really two questions — 'What return do I get in rupees?' and 'How does that compare to Nifty after taxes?' This calculator answers both.",
      "The INR return from a US investment has two components: (1) USD returns (S&P 500 has delivered ~10-11% USD CAGR since 1990, NASDAQ 100 ~14%) and (2) currency movement. The rupee has depreciated against the dollar at ~3% per year historically. These two stack multiplicatively: a 10% USD return + 3% INR depreciation gives approximately 13.3% INR return — meaningfully above Nifty 50's ~12%. The edge is modest on paper but compounds significantly over 10+ years.",
      "The honest counter-argument: Nifty's 12% is already in INR, is easier to access (SIP into a Nifty 50 index fund), has lower TCS/compliance friction, and doesn't require managing USD exposure. US investing makes the most sense for: (a) investors who already max out 80C/NPS and want additional alpha, (b) those with foreign income or education expenses denominated in USD, (c) investors who believe US tech will outperform Indian equities on a 10+ year view.",
      "Tax reality check: India taxes US capital gains at 12.5% LTCG after 24 months (same as Indian equity). Dividends from US stocks carry a US withholding tax of 25% (DTAA reduced from 30%) plus Indian slab tax on the net. High-dividend US stocks (REITs, utilities) are tax-inefficient for Indian investors — stick to growth ETFs and individual stocks that pay minimal dividends.",
      "Use this calculator to run 3 scenarios: pessimistic (7% USD, 2% INR dep), base (10% USD, 3% INR dep), optimistic (13% USD, 4% INR dep — as seen in 2021-2024). Compare each against your Nifty SIP projection. If the spread exceeds 2%, US investing earns its complexity. If not, the simple Nifty SIP wins on friction-adjusted returns.",
    ],
    tags: ["us stocks", "s&p 500", "nasdaq", "dollar returns", "international investing"],
  },
  {
    slug: "capital-gains",
    title: "Capital Gains Tax Calculator",
    shortTitle: "Capital Gains",
    heading: "Capital Gains Tax Calculator — STCG & LTCG on stocks and mutual funds",
    description:
      "Calculate capital gains tax on equity, mutual funds, debt, and gold investments. Covers post-July 2024 Budget rules: STCG 20%, LTCG 12.5% with ₹1.25L annual exemption. Debt funds at slab rate.",
    category: "tax",
    iconName: "TrendingUp",
    inputs: [],
    faq: [
      {
        q: "What changed in the July 2024 Budget for capital gains?",
        a: "Two key changes: (1) STCG on equity/equity MFs went from 15% to 20%, (2) LTCG on equity went from 10% to 12.5%, and the annual exemption limit was raised from ₹1 lakh to ₹1.25 lakh. These changes apply to transactions on or after 23 July 2024.",
      },
      {
        q: "How is LTCG on equity calculated?",
        a: "Long-term capital gains on listed equity (held ≥ 12 months) are taxed at 12.5% on the gains above ₹1.25 lakh per financial year. The first ₹1.25 lakh of LTCG is completely tax-free. Example: ₹3 lakh LTCG → taxable gain = ₹1.75 lakh → tax = ₹21,875 (before cess).",
      },
      {
        q: "Are debt mutual funds taxed differently?",
        a: "Yes. Since April 2023, gains from debt mutual funds are no longer classified as long-term capital gains. All gains are now treated as ordinary income and taxed at your applicable income tax slab rate (5%, 10%, 20%, or 30%). No indexation benefit is available.",
      },
      {
        q: "What about the 4% health and education cess?",
        a: "This calculator shows the base tax amount before cess. Add 4% of the tax amount to get the final tax payable. Example: ₹20,000 base tax → ₹800 cess → total ₹20,800.",
      },
      {
        q: "Is Sovereign Gold Bond (SGB) exempt from capital gains?",
        a: "Yes, if you hold SGB to maturity (8 years), the capital gains are fully exempt from tax. However, if you sell SGBs on the exchange before maturity, the gains are taxable as capital gains.",
      },
    ],
    related: ["tax-harvester", "ltcg-stcg", "tax"],
    overview: [
      "India's capital gains tax framework was significantly revised by the July 2024 Union Budget. The headline change: short-term capital gains (STCG) on equity and equity mutual funds jumped from 15% to 20%, while long-term capital gains (LTCG) moved from 10% to 12.5%. The silver lining was raising the annual LTCG exemption from ₹1 lakh to ₹1.25 lakh — a small but real benefit for smaller investors.",
      "For equity investors, the holding period rule is simple: hold for less than 12 months and you pay 20% STCG on any profit. Hold for 12 months or more, and only the gains above ₹1.25 lakh in a financial year attract 12.5% LTCG. This makes the ₹1.25 lakh annual exemption extremely valuable for medium-sized portfolios — a couple selling ₹2.5 lakh of equity gains each year (₹1.25L each) pays zero tax on that portion.",
      "Debt mutual funds underwent a more dramatic change earlier, in April 2023. Before that date, debt MFs held for 3+ years enjoyed indexation benefits and a 20% LTCG rate — making them highly tax-efficient compared to FDs for investors in the 30% tax bracket. Post-April 2023, all debt MF gains are added to income and taxed at the investor's slab rate, regardless of holding period. This effectively eliminated the tax advantage that made debt MFs the preferred fixed-income vehicle for high-income investors.",
      "Gold investment taxation: physical gold and gold ETFs are now taxed at slab rate (same as debt MFs, post 2023). Gold sovereign bonds (SGBs) held to maturity (8 years from issue) are still fully exempt — making SGBs the most tax-efficient way to own gold in India. Digital gold and gold fund of funds follow the debt MF taxation rules.",
      "A key practical point: 4% health and education cess applies on top of all capital gains tax. So a 20% STCG effectively becomes 20.8%, and 12.5% LTCG effectively becomes 13%. Surcharge may also apply for very high-income taxpayers (gains above ₹50 lakh/₹1 crore). Always consult a CA for high-value transactions.",
    ],
    tags: ["capital gains", "ltcg", "stcg", "equity", "mutual fund", "tax"],
  },
];
