import type { CalcMeta } from "./types";

const commonFaq = {
  compoundInterest: {
    q: "What is compound interest?",
    a: "Compound interest is interest earned on both the principal and on the interest accumulated from previous periods. Over long horizons this creates exponential growth, which is why early investing matters so much.",
  },
  cagr: {
    q: "What does CAGR mean?",
    a: "Compound Annual Growth Rate — the constant yearly rate at which an investment would have grown to reach its final value from its starting value. It smooths out volatile year-to-year returns.",
  },
};

export const calculators: CalcMeta[] = [
  {
    slug: "sip",
    title: "SIP Calculator",
    shortTitle: "SIP",
    heading: "SIP Calculator — plan your monthly mutual fund investment",
    description:
      "Find out how much wealth your Systematic Investment Plan will build. Enter monthly amount, expected return, and duration. Free, instant, India-ready.",
    category: "investment",
    iconName: "LineChart",
    inputs: [
      { key: "monthly", label: "Monthly investment", min: 500, max: 200000, step: 500, default: 10000, prefix: "₹", format: "currency" },
      { key: "rate", label: "Expected return (p.a.)", min: 1, max: 30, step: 0.5, default: 12, suffix: "%", format: "percent" },
      { key: "years", label: "Investment period", min: 1, max: 40, step: 1, default: 10, suffix: "yrs", format: "years" },
    ],
    faq: [
      {
        q: "What is a SIP?",
        a: "A Systematic Investment Plan lets you invest a fixed amount in a mutual fund at regular intervals (usually monthly). You get rupee-cost averaging — you buy more units when prices are low and fewer when they're high — smoothing out market volatility.",
      },
      {
        q: "What return should I assume?",
        a: "Indian equity mutual funds have historically delivered 11–13% CAGR over 10+ year horizons. Debt funds sit around 6–8%. Use 12% as a reasonable mid-point for equity SIPs; go lower (8–10%) if you want a conservative projection.",
      },
      commonFaq.compoundInterest,
      {
        q: "Is SIP better than a lumpsum?",
        a: "SIPs win when markets are volatile or declining — you average your cost. Lumpsums win when markets are rising steadily. Most retail investors don't have a lump sum lying around, so SIPs are practically more useful for wealth-building from salary.",
      },
      {
        q: "Can I increase my SIP amount over time?",
        a: "Yes — it's called a step-up SIP. Most AMCs let you auto-increase your SIP by a fixed amount or percentage every year, ideally matching your salary hike. Our Step-up SIP Calculator shows the difference.",
      },
    ],
    related: ["step-up-sip", "lumpsum", "swp", "retirement"],
    overview: [
      "A SIP (Systematic Investment Plan) is the single most popular way for Indian retail investors to build wealth — ₹27,000+ crore flows into Indian equity mutual funds every month through SIPs alone.",
      "This calculator uses the standard SIP future-value formula: FV = P × [(1+r)^n − 1] / r × (1+r), where P is your monthly amount, r is the monthly rate, and n is the number of months. It assumes you invest at the start of each month.",
      "Use it to set realistic goals: ₹10,000/month at 12% for 20 years becomes ₹99.9 lakh. Double it to ₹20,000/month and you cross ₹2 crore — a comfortable retirement corpus for most Indian middle-class households.",
    ],
    tags: ["mutual fund", "monthly investment", "equity"],
  },
  {
    slug: "step-up-sip",
    title: "Step-up SIP Calculator",
    shortTitle: "Step-up SIP",
    heading: "Step-up SIP Calculator — SIP with annual increment",
    description:
      "See how much more wealth you build when your SIP grows every year. Perfect for matching salary hikes. Compare with flat SIP instantly.",
    category: "investment",
    iconName: "TrendingUp",
    inputs: [
      { key: "monthly", label: "Starting monthly SIP", min: 500, max: 200000, step: 500, default: 10000, prefix: "₹", format: "currency" },
      { key: "stepUp", label: "Annual step-up", min: 0, max: 25, step: 1, default: 10, suffix: "%", format: "percent" },
      { key: "rate", label: "Expected return (p.a.)", min: 1, max: 30, step: 0.5, default: 12, suffix: "%", format: "percent" },
      { key: "years", label: "Investment period", min: 1, max: 40, step: 1, default: 15, suffix: "yrs", format: "years" },
    ],
    faq: [
      {
        q: "What is a step-up SIP?",
        a: "A step-up SIP automatically increases your monthly investment by a fixed percentage or amount every year. Most Indian AMCs (HDFC, SBI, Axis, Mirae, Nippon, Parag Parikh) support it natively.",
      },
      {
        q: "What step-up rate should I use?",
        a: "10% is the standard — matching average Indian salary hikes. If you expect faster income growth (tech, finance), try 15%. If your salary grows slower, stick to 5–7%.",
      },
      {
        q: "How big is the difference vs a flat SIP?",
        a: "At 10% annual step-up, your final corpus is roughly 50–70% higher than a flat SIP over 20+ years. That's the power of compounding on a growing base.",
      },
      commonFaq.compoundInterest,
    ],
    related: ["sip", "lumpsum", "retirement"],
    overview: [
      "A step-up SIP is a SIP that grows with your income. If your starting SIP is ₹10,000 and you step up 10% annually, year 2 becomes ₹11,000, year 3 ₹12,100, and so on.",
      "The math: each year's monthly investment compounds for the remaining months at your expected return rate. This calculator sums the future value of every monthly contribution separately.",
      "The earlier you start stepping up, the larger your final corpus — which is why step-up SIPs are especially powerful for investors in their 20s and 30s with strong salary growth trajectories.",
    ],
  },
  {
    slug: "lumpsum",
    title: "Lumpsum Calculator",
    shortTitle: "Lumpsum",
    heading: "Lumpsum Calculator — one-time mutual fund investment",
    description:
      "Calculate the future value of a one-time lumpsum investment. Enter principal, expected return, and duration. Instant wealth projection.",
    category: "investment",
    iconName: "PiggyBank",
    inputs: [
      { key: "principal", label: "Lumpsum amount", min: 1000, max: 100000000, step: 1000, default: 100000, prefix: "₹", format: "currency" },
      { key: "rate", label: "Expected return (p.a.)", min: 1, max: 30, step: 0.5, default: 12, suffix: "%", format: "percent" },
      { key: "years", label: "Investment period", min: 1, max: 40, step: 1, default: 10, suffix: "yrs", format: "years" },
    ],
    faq: [
      {
        q: "SIP or lumpsum — which is better?",
        a: "If you have the money right now and markets aren't at a peak, lumpsum usually wins over long horizons because your capital works for longer. SIP wins in volatile or declining markets by averaging your cost. Most investors should do a mix.",
      },
      commonFaq.compoundInterest,
      commonFaq.cagr,
      {
        q: "What happens if markets crash right after I invest?",
        a: "Short-term drawdowns are painful but historically recover. Over 15+ year horizons, Indian equity indices have never delivered negative real returns. The risk is only real if your horizon is short (< 5 years).",
      },
    ],
    related: ["sip", "swp", "fd", "ppf"],
    overview: [
      "A lumpsum investment is a one-time deposit into a mutual fund, stock, or any instrument that grows at a compound rate. It's the simplest form of long-term investing.",
      "Formula: FV = P × (1+r)^n. ₹1 lakh invested at 12% for 20 years grows to ₹9.65 lakh — nearly 10x without adding a single rupee.",
      "Lumpsum investing works best when you have surplus capital (bonus, inheritance, windfall) and a long horizon. For regular income investment, combine with a SIP.",
    ],
  },
  {
    slug: "swp",
    title: "SWP Calculator",
    shortTitle: "SWP",
    heading: "SWP Calculator — Systematic Withdrawal Plan",
    description:
      "Plan regular monthly withdrawals from your invested corpus while it continues to earn. See how long your retirement money will last.",
    category: "retirement",
    iconName: "ArrowDownFromLine",
    inputs: [
      { key: "principal", label: "Starting corpus", min: 100000, max: 500000000, step: 10000, default: 5000000, prefix: "₹", format: "currency" },
      { key: "monthlyWithdraw", label: "Monthly withdrawal", min: 1000, max: 1000000, step: 1000, default: 30000, prefix: "₹", format: "currency" },
      { key: "rate", label: "Expected return on balance (p.a.)", min: 1, max: 20, step: 0.5, default: 9, suffix: "%", format: "percent" },
      { key: "years", label: "Duration", min: 1, max: 40, step: 1, default: 20, suffix: "yrs", format: "years" },
    ],
    faq: [
      {
        q: "What is a SWP?",
        a: "A Systematic Withdrawal Plan is the opposite of a SIP — you withdraw a fixed amount monthly from a mutual fund while the remaining corpus continues to earn returns. Popular for post-retirement income.",
      },
      {
        q: "How is SWP taxed?",
        a: "Each withdrawal is treated as a redemption. Gains above ₹1.25 lakh per year on equity funds are taxed at 12.5% (LTCG). Debt fund gains are taxed at your slab rate if held < 2 years.",
      },
      {
        q: "What's a safe withdrawal rate?",
        a: "The classic rule is 4% per year. For an Indian equity+debt portfolio earning ~9%, 5% annual (0.42%/month) gives strong longevity. Above 7% annual risks running out in a bear market.",
      },
    ],
    related: ["sip", "lumpsum", "retirement"],
    overview: [
      "An SWP (Systematic Withdrawal Plan) lets you convert an accumulated corpus into a predictable monthly paycheck. Essential for retirees, financially-independent individuals, and anyone living off investments.",
      "This calculator simulates each month: balance grows at your expected return, then you subtract the withdrawal. The final balance shows how much corpus remains after the period.",
      "Tip: your withdrawal shouldn't exceed ~60–70% of expected returns if you want your corpus to last 30+ years in real terms.",
    ],
  },
  {
    slug: "emi",
    title: "EMI Calculator",
    shortTitle: "EMI",
    heading: "EMI Calculator — home, car, personal loan monthly payment",
    description:
      "Calculate your equated monthly installment instantly. Works for home loan, car loan, and personal loan. Full amortisation breakdown included.",
    category: "loan",
    iconName: "Home",
    inputs: [
      { key: "principal", label: "Loan amount", min: 10000, max: 200000000, step: 10000, default: 3000000, prefix: "₹", format: "currency" },
      { key: "rate", label: "Interest rate (p.a.)", min: 1, max: 30, step: 0.1, default: 8.5, suffix: "%", format: "percent" },
      { key: "years", label: "Loan tenure", min: 1, max: 30, step: 1, default: 20, suffix: "yrs", format: "years" },
    ],
    faq: [
      {
        q: "How is EMI calculated?",
        a: "EMI = [P × r × (1+r)^n] / [(1+r)^n − 1], where P is loan amount, r is monthly interest rate, and n is number of months. Each EMI covers partly interest (more at first) and partly principal (more later).",
      },
      {
        q: "Can I prepay my home loan?",
        a: "Yes. Floating-rate home loans in India have no prepayment penalty for individual borrowers (RBI rule). Every rupee prepaid directly reduces principal, saving compound interest. Prepaying in the first 5–7 years has the biggest impact.",
      },
      {
        q: "Is EMI higher for a shorter tenure?",
        a: "Yes — shorter tenure means larger EMI but much lower total interest. Example: ₹30L at 8.5% for 20 years = ₹26k EMI, ₹33L total interest. Same loan for 10 years = ₹37k EMI, ₹14.6L total interest. You save ₹18 lakh.",
      },
      {
        q: "What's a good EMI-to-income ratio?",
        a: "Keep total EMIs below 40% of take-home pay. For home loans specifically, 30–35% is the sweet spot. Above 50% is dangerous — any income disruption leads to default.",
      },
    ],
    related: ["fd", "tax", "ppf"],
    overview: [
      "EMI (Equated Monthly Installment) is what you pay every month on a loan. It's a fixed amount combining interest and principal repayment, calculated upfront for the loan's full tenure.",
      "This calculator works for any fixed-rate loan: home loan, car loan, personal loan, education loan, business loan. For floating-rate loans, assume the current rate stays constant for the projection.",
      "The amortisation schedule below shows year-wise how much of each EMI goes to interest vs principal, and how your outstanding balance reduces over time.",
    ],
    tags: ["home loan", "car loan", "personal loan"],
  },
  {
    slug: "fd",
    title: "FD Calculator",
    shortTitle: "FD",
    heading: "FD Calculator — fixed deposit maturity value",
    description:
      "Calculate the maturity amount of your bank fixed deposit. Supports quarterly, half-yearly, and annual compounding.",
    category: "investment",
    iconName: "Landmark",
    inputs: [
      { key: "principal", label: "Deposit amount", min: 1000, max: 100000000, step: 1000, default: 500000, prefix: "₹", format: "currency" },
      { key: "rate", label: "Interest rate (p.a.)", min: 1, max: 15, step: 0.05, default: 7.25, suffix: "%", format: "percent" },
      { key: "years", label: "Tenure", min: 1, max: 20, step: 1, default: 5, suffix: "yrs", format: "years" },
      { key: "compoundingsPerYear", label: "Compounded (times/year)", min: 1, max: 12, step: 1, default: 4, format: "plain" },
    ],
    faq: [
      {
        q: "How is FD interest calculated?",
        a: "Most Indian banks compound FD interest quarterly. Formula: A = P(1 + r/n)^(nt), where P is principal, r is annual rate, n is compoundings per year (4 for quarterly), t is tenure in years.",
      },
      {
        q: "What's the FD tax rule?",
        a: "FD interest is fully taxable at your income tax slab. Banks deduct TDS at 10% if interest crosses ₹40,000/year (₹50,000 for seniors). Form 15G/15H lets you avoid TDS if your income is below the taxable limit.",
      },
      {
        q: "Who offers the best FD rates in India?",
        a: "Small finance banks (Ujjivan, AU, Equitas, Suryoday) typically offer 1–1.5% higher than big banks. Post Office TD also competitive for ≤5 year tenures. Always check DICGC cover (₹5 lakh per bank).",
      },
      {
        q: "FD vs debt mutual fund — which is better?",
        a: "FDs are safer (DICGC-insured) but less tax-efficient. Debt mutual funds can be more tax-efficient and potentially higher-return for holdings > 3 years, but carry interest rate risk. For most retail savers, FDs are simpler.",
      },
    ],
    related: ["lumpsum", "ppf", "swp"],
    overview: [
      "A fixed deposit is the simplest investment in India: deposit a lumpsum with a bank for a fixed tenure at a pre-agreed interest rate. No market risk, DICGC-insured up to ₹5 lakh.",
      "This calculator uses the standard compound interest formula. For Indian bank FDs, the compounding frequency is almost always quarterly (4x per year) — keep that as the default unless your bank specifies otherwise.",
      "Rates vary: 6.5–7.5% at PSU banks, 7–8% at private banks, 8–9% at small finance banks. Senior citizens get an extra 0.25–0.50%.",
    ],
  },
  {
    slug: "ppf",
    title: "PPF Calculator",
    shortTitle: "PPF",
    heading: "PPF Calculator — Public Provident Fund maturity value",
    description:
      "Calculate your PPF maturity amount. 15-year tenure, tax-free returns, current rate 7.1%. See year-wise balance growth.",
    category: "investment",
    iconName: "Shield",
    inputs: [
      { key: "yearly", label: "Annual contribution", min: 500, max: 150000, step: 500, default: 150000, prefix: "₹", format: "currency" },
      { key: "rate", label: "Interest rate (p.a.)", min: 1, max: 15, step: 0.05, default: 7.1, suffix: "%", format: "percent" },
      { key: "years", label: "Tenure", min: 15, max: 30, step: 5, default: 15, suffix: "yrs", format: "years" },
    ],
    faq: [
      {
        q: "What is PPF?",
        a: "Public Provident Fund — a government-backed 15-year savings scheme. EEE tax status: contributions qualify under 80C (up to ₹1.5L/year), interest is tax-free, maturity is tax-free. Rate reset quarterly by the Ministry of Finance.",
      },
      {
        q: "Can I extend my PPF after 15 years?",
        a: "Yes. You can extend in 5-year blocks indefinitely. You have 3 choices at maturity: withdraw everything, keep account without further deposits (continues earning interest), or extend with fresh deposits.",
      },
      {
        q: "What's the current PPF interest rate?",
        a: "7.1% p.a. (as of 2026). The Government of India reviews and notifies the rate every quarter. PPF rates have ranged from 7.1% to 12% historically.",
      },
      {
        q: "Can I withdraw partially before 15 years?",
        a: "Partial withdrawal is allowed from year 7 onwards — up to 50% of the balance at the end of year 4. Loan against PPF is allowed between years 3 and 6.",
      },
    ],
    related: ["fd", "lumpsum", "tax"],
    overview: [
      "PPF (Public Provident Fund) is India's most popular tax-free long-term savings scheme. Minimum deposit ₹500/year, maximum ₹1.5 lakh/year, tenure 15 years (extendable in 5-year blocks).",
      "Interest is calculated on the minimum balance between the 5th and end of each month, then credited at year-end. To maximize returns, deposit your full yearly contribution before April 5th.",
      "Tax-free compounding at 7.1% means ₹1.5L/year for 15 years grows to ~₹40.68 lakh, of which ₹18.18 lakh is pure interest — and you pay zero tax on it.",
    ],
  },
  {
    slug: "retirement",
    title: "Retirement Calculator",
    shortTitle: "Retirement",
    heading: "Retirement Calculator — how much corpus do you need?",
    description:
      "Plan your retirement corpus and monthly SIP needed to get there. Accounts for inflation, pre- and post-retirement returns.",
    category: "retirement",
    iconName: "Sunset",
    inputs: [
      { key: "currentAge", label: "Current age", min: 18, max: 65, step: 1, default: 30, suffix: "yrs", format: "years" },
      { key: "retireAge", label: "Retirement age", min: 40, max: 75, step: 1, default: 60, suffix: "yrs", format: "years" },
      { key: "lifeExpectancy", label: "Life expectancy", min: 60, max: 100, step: 1, default: 85, suffix: "yrs", format: "years" },
      { key: "currentMonthlyExp", label: "Current monthly expense", min: 5000, max: 1000000, step: 1000, default: 50000, prefix: "₹", format: "currency" },
      { key: "inflation", label: "Inflation (p.a.)", min: 1, max: 15, step: 0.5, default: 6, suffix: "%", format: "percent" },
      { key: "preReturn", label: "Return pre-retirement (p.a.)", min: 1, max: 30, step: 0.5, default: 12, suffix: "%", format: "percent" },
      { key: "postReturn", label: "Return post-retirement (p.a.)", min: 1, max: 20, step: 0.5, default: 8, suffix: "%", format: "percent" },
    ],
    faq: [
      {
        q: "How does this calculator work?",
        a: "It projects your future monthly expense using inflation, computes the corpus needed to sustain that expense for your retirement duration using real return (post-retirement return minus inflation), then calculates the monthly SIP needed to build that corpus.",
      },
      {
        q: "What's a realistic retirement corpus for Indians?",
        a: "For a ₹50k/month expense today, retiring at 60 with life expectancy 85, assuming 6% inflation and 8% post-retirement return, you'd need roughly ₹7–8 crore. Higher than most expect — which is why starting early matters.",
      },
      {
        q: "Can I retire before 60?",
        a: "The FIRE (Financial Independence, Retire Early) movement targets 40–50. Use a higher inflation cushion, lower post-retirement return (conservative), and plan for 30+ years in retirement. Rule of thumb: 25–30× annual expenses.",
      },
    ],
    related: ["sip", "step-up-sip", "swp"],
    overview: [
      "Retirement planning in India is a three-variable problem: how long you'll live after retiring, how inflation erodes your money's value, and what return your corpus generates in retirement.",
      "This calculator uses a two-phase model. Pre-retirement: you invest at a higher-return portfolio (typically equity-heavy). Post-retirement: you shift to lower-risk (debt-heavy) and withdraw gradually, assuming annual inflation in expenses.",
      "The monthly SIP shown is what you'd need to invest from today to hit your retirement corpus. Rising inflation (from 6% to 7%) can increase required SIP by 30–40% — it's the single biggest lever.",
    ],
  },
  {
    slug: "tax",
    title: "Income Tax Calculator",
    shortTitle: "Tax",
    heading: "Income Tax Calculator — Old vs New Regime (FY 2025-26)",
    description:
      "Compare old vs new tax regime for FY 2025-26. Instantly see which saves more. Updated with Budget 2024 slabs & standard deduction.",
    category: "tax",
    iconName: "Receipt",
    inputs: [
      { key: "grossIncome", label: "Gross annual income", min: 100000, max: 50000000, step: 10000, default: 1500000, prefix: "₹", format: "currency" },
      { key: "deductions80c", label: "Section 80C deductions (EPF, PPF, ELSS, LIC)", min: 0, max: 150000, step: 1000, default: 150000, prefix: "₹", format: "currency" },
      { key: "npsExtra", label: "Extra NPS (80CCD-1B)", min: 0, max: 50000, step: 1000, default: 50000, prefix: "₹", format: "currency" },
      { key: "hraExempt", label: "HRA exemption", min: 0, max: 2000000, step: 1000, default: 0, prefix: "₹", format: "currency" },
      { key: "otherDeductions", label: "Other deductions (80D, 80E, home loan interest)", min: 0, max: 500000, step: 1000, default: 0, prefix: "₹", format: "currency" },
    ],
    faq: [
      {
        q: "Old regime vs new regime — which should I pick?",
        a: "New regime wins if you have fewer deductions. Break-even: if your total deductions (80C + HRA + NPS + home loan interest + medical insurance) exceed about ₹4 lakh, old regime usually saves more. Below that, new regime is simpler and cheaper.",
      },
      {
        q: "What are the FY 2025-26 new regime slabs?",
        a: "0–3L nil · 3–7L @ 5% · 7–10L @ 10% · 10–12L @ 15% · 12–15L @ 20% · >15L @ 30%. Standard deduction ₹75,000. Section 87A rebate makes tax zero if taxable income ≤ ₹7 lakh.",
      },
      {
        q: "Can I switch between regimes every year?",
        a: "Salaried individuals — yes, can switch every year when filing ITR. Business/professional income — you can switch once to new regime, then back once. After that, locked.",
      },
      {
        q: "Is this calculator officially accurate?",
        a: "It uses official Budget 2024 slabs and rebate rules. For simplicity it assumes standard deduction applies (salaried) and doesn't cover edge cases like surcharge on very high incomes, marginal relief, or specific state taxes. For exact filing, use the Income Tax portal.",
      },
    ],
    related: ["ppf", "retirement", "sip"],
    overview: [
      "India now has two income tax regimes. The new regime (introduced 2020, enhanced in Budget 2024) has lower rates but strips away most deductions. The old regime has higher rates but lets you claim 80C, HRA, home loan interest, NPS, medical insurance, etc.",
      "For FY 2025-26, income up to ₹7 lakh effectively pays zero tax under the new regime (via Section 87A rebate + standard deduction). This has pushed most salaried taxpayers toward the new regime.",
      "This calculator compares both regimes side-by-side using your gross income and deductions. Tip: ignore HRA in the comparison if you're choosing new regime — you can't claim it there anyway.",
    ],
    tags: ["income tax", "old regime", "new regime", "tax saving"],
  },
  {
    slug: "brokerage",
    title: "Brokerage Calculator",
    shortTitle: "Brokerage",
    heading: "Brokerage Calculator — compare Zerodha, Groww, Upstox, Angel One",
    description:
      "Compute total stock trading cost across 6 major Indian brokers. Shows brokerage, STT, exchange charges, GST, stamp duty, and net P&L.",
    category: "trading",
    iconName: "Scale",
    inputs: [
      { key: "buyPrice", label: "Buy price per share", min: 1, max: 100000, step: 0.05, default: 500, prefix: "₹", format: "currency" },
      { key: "sellPrice", label: "Sell price per share", min: 1, max: 100000, step: 0.05, default: 520, prefix: "₹", format: "currency" },
      { key: "quantity", label: "Quantity", min: 1, max: 100000, step: 1, default: 100, format: "plain" },
      { key: "intraday", label: "Intraday? (0 = No / Delivery, 1 = Yes)", min: 0, max: 1, step: 1, default: 0, format: "plain" },
    ],
    faq: [
      {
        q: "What charges are included in brokerage?",
        a: "Brokerage fee (broker's cut), STT (Securities Transaction Tax — govt), Exchange Transaction Charges (NSE/BSE), SEBI turnover fee, Stamp Duty (state), and GST at 18% on brokerage + exchange + SEBI charges.",
      },
      {
        q: "Why is Zerodha delivery brokerage zero?",
        a: "Zerodha pioneered zero-brokerage equity delivery in India. They make money from intraday/F&O trades and ancillary services. Angel One and several others have followed.",
      },
      {
        q: "What's the difference between delivery and intraday?",
        a: "Delivery = you buy shares and hold them in your demat for days/months/years. Intraday = buy and sell the same stock the same day, you never take delivery. Intraday has lower STT but higher risk.",
      },
      {
        q: "Are these broker rates current?",
        a: "Rates shown reflect 2026 market tariffs. Brokers change rates occasionally — always check the broker's official pricing page before trading large volumes.",
      },
    ],
    related: ["sip", "lumpsum"],
    overview: [
      "Brokerage isn't just the broker's fee — it's a stack of charges that can eat into your profit, especially on small trades. This calculator shows the full breakdown for every major Indian broker so you can see who's cheapest for your trade size.",
      "Discount brokers (Zerodha, Groww, Upstox, Angel One, Dhan) charge ₹0 for equity delivery or a flat ₹20 per intraday order, regardless of trade size.",
      "Traditional brokers (ICICI Direct, HDFC Securities, Kotak) charge a percentage of turnover — often 0.3–0.55% for delivery — which makes them 10–50× more expensive on large trades.",
    ],
    tags: ["zerodha", "groww", "upstox", "angel one"],
  },
];

calculators.push(
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
      "NPS (National Pension System) is one of India's most tax-efficient retirement vehicles — the only scheme that offers an extra ₹50,000 deduction beyond the ₹1.5L 80C limit.",
      "Contributions grow through a mix of equity, corporate bonds, and government securities. You can choose your asset allocation (Active) or let age-based auto-allocation happen (Auto).",
      "At age 60, 60% of corpus comes out tax-free. The remaining 40% must buy an annuity — this calculator estimates your monthly pension assuming a typical 6% annuity rate.",
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
      "Recurring Deposits are a disciplined savings tool — you commit to a fixed monthly deposit for a fixed tenure at a fixed rate.",
      "Interest compounds quarterly in most Indian banks. Miss a monthly deposit and most banks charge a small penalty (~₹1.50–₹2 per ₹100 missed).",
      "Rates vary: 6.5–7.5% at PSU banks, up to 8.5% at small finance banks. Senior citizens get an extra 0.25–0.50%.",
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
      "HRA (House Rent Allowance) is the single biggest tax-saving component for renting salaried employees in India.",
      "The exemption formula is a 'minimum of three' rule — actual HRA, 50/40% of basic+DA, or rent minus 10% of salary. Whichever is lowest becomes your tax-free amount.",
      "Requirements: rent receipts for claims above ₹3,000/month, PAN of landlord if annual rent exceeds ₹1 lakh, and you cannot own residential property in the same city.",
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
      "Inflation is the silent tax that erodes your money's purchasing power every year. A product that costs ₹100 today costs ₹321 in 20 years at 6% inflation.",
      "This calculator projects how much an expense will grow in nominal rupees. The reverse — today's purchasing power of a future amount — is also shown.",
      "Rule of thumb: at 6% inflation, your money's purchasing power halves every ~12 years. That's the reason idle cash in a savings account is slowly bleeding value.",
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
      "CAGR (Compound Annual Growth Rate) is the industry standard for reporting mutual fund returns. It's the annualized rate that would have produced your gain if growth were steady.",
      "Formula: CAGR = (Final Value / Initial Value)^(1/years) − 1. Works for any investment held for a continuous period, not just mutual funds.",
      "Quick check: if your CAGR beats inflation by 3–6%, you're doing well. Beating Nifty 50's long-term CAGR (~12%) consistently is the real benchmark for active funds.",
    ],
  },
);

export function getCalcBySlug(slug: string): CalcMeta | undefined {
  return calculators.find((c) => c.slug === slug);
}
