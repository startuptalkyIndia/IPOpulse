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
      "A SIP (Systematic Investment Plan) is the single most popular way for Indian retail investors to build wealth — ₹27,000+ crore flows into Indian equity mutual funds every month through SIPs alone, and that figure has roughly doubled in the last four years. The reason is simple: SIPs convert investing from a one-time decision into a recurring habit, removing the two biggest enemies of returns — market timing and procrastination.",
      "This calculator uses the standard SIP future-value formula: FV = P × [(1+r)^n − 1] / r × (1+r), where P is your monthly amount, r is the monthly rate, and n is the number of months. It assumes you invest at the start of each month, which is how most Indian AMCs process auto-debit SIPs (the 1st, 5th, 7th, 10th, 15th, 20th, or 25th are typical SIP debit dates).",
      "The most counterintuitive insight from running this calculator is how heavily long-tenure SIPs are loaded toward the back end. In a 20-year SIP at 12%, more than 60% of your final corpus comes from gains in the last 7 years alone — even though the contributions are spread evenly. This is why financial advisors hammer the message of 'time in the market beats timing the market.' Stopping a SIP after 5 years to wait for a correction is mathematically one of the worst decisions a retail investor can make.",
      "Use it to set realistic goals: ₹10,000/month at 12% for 20 years becomes ₹99.9 lakh. Double it to ₹20,000/month and you cross ₹2 crore — a comfortable retirement corpus for most Indian middle-class households. ₹5,000/month for 30 years at 12% delivers ₹1.76 crore, so even a modest SIP started in your mid-twenties produces a serious retirement number by age 55. Pair this with a step-up SIP (annual hike of 10%) and the same starting amount can produce a 50–70% larger corpus.",
      "What this calculator does not model: short-term volatility, tax (12.5% LTCG above ₹1.25L/year on equity MFs), exit loads (typically 1% if redeemed under 1 year), expense ratios (active funds: 0.5–2%; index funds: 0.05–0.30%), or sequence-of-return risk. Treat the projected number as a long-run average, not a guarantee. The Sensex has delivered ~14% CAGR since 1979, but individual 5-year windows have ranged from −5% to +35%. SIPs work because of, not despite, that volatility.",
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
      "A step-up SIP is a SIP that grows with your income. If your starting SIP is ₹10,000 and you step up 10% annually, year 2 becomes ₹11,000, year 3 ₹12,100, year 5 ₹14,641, and year 10 ₹23,579. Most Indian AMCs (HDFC, SBI, Axis, Mirae, Nippon, Parag Parikh, ICICI Prudential, Kotak, Aditya Birla) support it natively — you set the percentage hike and the date once, and the auto-debit grows automatically every year.",
      "The math: each year's monthly investment compounds for the remaining months at your expected return rate. This calculator sums the future value of every monthly contribution separately, so the effective return on later contributions is lower (less time to compound) but the dollar contribution is much larger. The result is that the back half of a step-up SIP is doing most of the heavy lifting in absolute rupees.",
      "Why step-up SIPs are mathematically superior to flat SIPs for salaried Indians: salary inflation in India runs 7–10% for most professionals, but flat SIPs stay frozen, meaning your savings rate as a percentage of income drops every year. A 10% step-up just keeps you investing the same fraction of income — it is not aggressive saving, it is staying still in real terms.",
      "Concrete comparison over 25 years at 12% return: a flat ₹10,000/month SIP yields ₹1.9 crore. A 10% annual step-up starting at the same ₹10,000 yields ₹3.4 crore (roughly 80% more). At 5% step-up, ₹2.5 crore. At 15% step-up, ₹4.8 crore. Total contributions are higher in the step-up case, but the gain per rupee invested is also slightly better because money compounds longer in absolute terms.",
      "The earlier you start stepping up, the larger your final corpus — which is why step-up SIPs are especially powerful for investors in their 20s and 30s with strong salary growth trajectories. Practical tip: align the step-up date with your appraisal cycle (April or July for most Indian companies). That way, the SIP increase comes out of fresh raise, not from existing budget — much easier to sustain psychologically.",
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
      "A lumpsum investment is a one-time deposit into a mutual fund, stock, or any instrument that grows at a compound rate. It's the simplest form of long-term investing — pick your asset, deploy capital once, let compound interest do its work over 10–30 years. Common triggers for lumpsum investing in India: annual bonus, inheritance, property sale, retirement gratuity, ESOP exercise, or a windfall like Diwali bonus or freelance project payment.",
      "Formula: FV = P × (1+r)^n. ₹1 lakh invested at 12% for 20 years grows to ₹9.65 lakh — nearly 10x without adding a single rupee. ₹10 lakh at 12% for 20 years becomes ₹96.5 lakh. ₹25 lakh at 12% for 25 years compounds to ₹4.25 crore. The exponential nature of compounding is invisible in early years and dramatic in later ones — most of the gain in any 30-year compound interest scenario happens in the last 10 years.",
      "Lumpsum vs SIP — what the data actually says: when markets are trending up (which they are about 75% of the time over multi-year windows), lumpsum beats SIP because your money compounds for longer. When markets are choppy or declining at first, SIPs win by averaging your cost. For Indian markets specifically, studies on Nifty 50 from 2003–2024 show lumpsum outperformed SIP by ~1.5–2% CAGR on average over 10-year windows. But SIPs are psychologically easier — and the best return is the one you actually stay invested through.",
      "Lumpsum investing works best when you have surplus capital (bonus, inheritance, windfall) and a long horizon of 10+ years. For regular income investment, combine with a SIP. The classic strategy: deploy 60–80% of any windfall as a lumpsum into diversified equity, keep 20–40% as cash buffer, then continue the regular SIP.",
      "Risk warning: a lumpsum at the wrong time (just before a 30%+ correction) can take 2–4 years to recover. If you are deploying a large amount at an apparent market peak, consider an STP (Systematic Transfer Plan) — park the lumpsum in a liquid fund and transfer ₹1–2 lakh into your equity fund every week for 3–6 months. This blends lumpsum and SIP advantages, and most Indian AMCs support STP between their own schemes for free.",
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
      "An SWP (Systematic Withdrawal Plan) lets you convert an accumulated corpus into a predictable monthly paycheck. Essential for retirees, financially-independent individuals, and anyone living off investments. Unlike an FD or annuity that gives a fixed payout, SWP keeps your money in market-linked funds — so the residual corpus continues to grow even as you withdraw, often producing a better total outcome than locking in at a fixed rate.",
      "This calculator simulates each month: balance grows at your expected return divided by 12, then you subtract the withdrawal. The final balance shows how much corpus remains after the period — or how many years it lasted before depletion. The math is unforgiving: if your withdrawal rate exceeds your portfolio's return rate, the corpus enters terminal decline and the date of zero balance is mathematically locked in from day one.",
      "The classic safe withdrawal rate research (the 'Trinity Study' from US data) found that a 4% initial withdrawal rate, inflation-adjusted, has a 95%+ chance of lasting 30 years. Indian context is different: higher long-term returns (8–10% balanced portfolio) but also higher inflation (6%). For Indian retirees, a 5–6% initial withdrawal with annual inflation step-up is generally considered safe over 30-year horizons, while 7%+ creates meaningful risk of running out.",
      "Tax efficiency is where SWP genuinely beats interest-bearing alternatives like FDs. Each SWP withdrawal is treated as a partial redemption — only the gain portion is taxable, not the full amount. For an equity fund, gains above ₹1.25 lakh per year are taxed at just 12.5% LTCG. Compare to FD interest, which is fully taxable at slab rate (potentially 30%+ for higher earners). On a ₹1 crore corpus generating ₹6 lakh/year, the post-tax difference can be ₹1–1.5 lakh annually.",
      "Tip: your withdrawal shouldn't exceed ~60–70% of expected returns if you want your corpus to last 30+ years in real terms. Build in a 'guardrails' approach: in years where the market drops 20%+, freeze your inflation step-up for that year. Small flexibility in down years adds 5–10 years of corpus longevity. Use this calculator to stress-test multiple scenarios — return at 7%, 9%, 11% — before committing to a withdrawal rate.",
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
      "EMI (Equated Monthly Installment) is what you pay every month on a loan. It's a fixed amount combining interest and principal repayment, calculated upfront for the loan's full tenure. The EMI itself stays constant (assuming fixed rate or unchanged floating rate), but the split between interest and principal shifts dramatically — early EMIs are mostly interest, later EMIs are mostly principal.",
      "This calculator works for any fixed-rate loan: home loan, car loan, personal loan, education loan, business loan. For floating-rate loans (most home loans in India are RLLR-linked floating), assume the current rate stays constant for the projection — actual EMI will rise or fall with each repo rate revision. RBI changes the repo rate roughly 4–6 times per year; banks pass through within 3 months.",
      "The amortisation schedule below shows year-wise how much of each EMI goes to interest vs principal, and how your outstanding balance reduces over time. For a ₹50 lakh, 20-year, 8.5% home loan: in year 1, 80% of every EMI is interest. By year 10, that drops to 55%. By year 18, just 12%. This back-loaded principal repayment is why prepaying in the early years saves disproportionately more interest — every ₹1 lakh prepaid in year 1 of a 20-year ₹50L loan saves ~₹3.4 lakh in total interest, but the same ₹1L prepaid in year 15 saves only ~₹50,000.",
      "Critical EMI rules of thumb for Indian borrowers: keep total EMI obligations under 40% of take-home pay, with home loan EMI ideally under 30%. Banks will sanction up to 50–55% FOIR (Fixed Obligation to Income Ratio), but doing so leaves no buffer for emergencies, school fees, or unexpected expenses. Add medical insurance, term insurance, and emergency fund (6 months of expenses) to your monthly outflow plan before signing any large loan.",
      "Floating-rate home loan optimization: floating rates have zero prepayment penalty for individual borrowers (RBI rule). Use this advantage. Set your EMI to a manageable level for tax-deduction purposes (Section 24 caps interest deduction at ₹2 lakh for self-occupied), then aggressively prepay any surplus — bonus, gift, ESOP exercise — toward principal. Most banks let you prepay online with a single click. Prepayment in years 1–7 is the single most powerful wealth lever for middle-class Indian families paying down a home loan.",
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
      "A fixed deposit is the simplest investment in India: deposit a lumpsum with a bank for a fixed tenure at a pre-agreed interest rate. No market risk, DICGC-insured up to ₹5 lakh per depositor per bank. FDs remain the single largest savings instrument in Indian households — over ₹100 lakh crore is parked in bank FDs across the country, dwarfing mutual funds, insurance, and stocks combined.",
      "This calculator uses the standard compound interest formula: A = P(1 + r/n)^(nt). For Indian bank FDs, the compounding frequency is almost always quarterly (n = 4) — keep that as the default unless your bank specifies otherwise. Some small finance banks compound monthly (n = 12), which gives a tiny extra return. The effective annual yield on a 7.5% quarterly-compounded FD is 7.71%; monthly compounding bumps it to 7.76%.",
      "Rates vary significantly across the Indian banking landscape: 6.5–7.5% at PSU banks (SBI, PNB, BoB, Canara), 7–8% at private banks (HDFC, ICICI, Axis, Kotak), 8–9% at small finance banks (Ujjivan, AU, Equitas, Suryoday, Jana, Capital, ESAF, Utkarsh). Senior citizens (60+) get an extra 0.25–0.50% on every category. Specific tenure buckets (e.g., 444 days, 555 days, 888 days) often have promotional rates 0.10–0.30% above the standard slab.",
      "The biggest FD mistake retail investors make is breaking it before maturity. Premature withdrawal triggers a penalty of 0.5–1% on the contracted rate, and you receive interest only at the lower applicable rate for the actual deposit period. To avoid this, ladder your FDs: split a ₹10 lakh deposit into 5 FDs of ₹2 lakh each with maturities at 6, 12, 18, 24, and 36 months. As each matures, you have liquidity without breaking any.",
      "FD vs alternatives in 2026: for short-term (< 3 years), FDs typically beat liquid funds on post-tax basis for taxpayers below 20% slab. For medium-term (3–7 years), debt mutual funds may edge out only marginally and bring interest rate risk. For long-term (10+ years), FDs lose decisively to equity mutual funds — but FDs remain valuable as the 'sleep-well-at-night' allocation in any balanced portfolio. Senior citizens who depend on FD interest for monthly income should also evaluate SCSS (Senior Citizens' Savings Scheme — 8.2% guaranteed) and RBI Floating Rate Bonds.",
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
      "PPF (Public Provident Fund) is India's most popular tax-free long-term savings scheme, backed by a sovereign guarantee — meaning the principal and interest are guaranteed by the Government of India, not just a bank. Minimum deposit ₹500/year, maximum ₹1.5 lakh/year, tenure 15 years (extendable in 5-year blocks indefinitely). Open at any post office, SBI, PNB, ICICI, HDFC, Axis, BoB, Canara, or any nationalized bank.",
      "Interest is calculated on the minimum balance between the 5th and end of each month, then credited at year-end. To maximize returns, deposit your full ₹1.5 lakh contribution before April 5th of every financial year — this small timing trick adds roughly ₹50,000 to your final corpus over a 15-year tenure compared to depositing at year-end. If you can't lump it in, deposit by the 5th of every month.",
      "Tax-free compounding at 7.1% means ₹1.5L/year for 15 years grows to ~₹40.68 lakh, of which ₹18.18 lakh is pure interest — and you pay zero tax on it. PPF is one of the only EEE (Exempt-Exempt-Exempt) instruments left in India: contributions deductible under 80C, interest tax-free, maturity tax-free. Compare to FDs where 30%-bracket taxpayers lose roughly 30% of interest to tax — making post-tax FD return ~5% versus PPF's full 7.1%.",
      "Strategic uses of PPF that most retail investors miss: (1) Open accounts in your spouse's and children's names — each account gets its own ₹1.5L limit, multiplying tax-free corpus building, though clubbing rules apply for minor children's interest. (2) Use PPF as the 'debt' allocation in your portfolio, freeing you to be more equity-aggressive elsewhere. (3) Take a loan against PPF (years 3–6, up to 25% of balance from the 2nd-preceding year) at just 1% above PPF rate, instead of breaking other investments.",
      "What changes after 15 years: at maturity, you have three choices. (a) Withdraw the entire corpus tax-free. (b) Extend the account in 5-year blocks without contributions — the existing balance keeps earning the prevailing PPF rate. (c) Extend with fresh contributions for another 5 years. Option (c) is powerful: extending three times takes you to 30 years, and a ₹1.5L/year contribution for 30 years at 7.1% builds ₹1.55 crore tax-free. PPF rates have ranged from 7.1% to 12% historically; the government reviews quarterly. Even at the current floor of 7.1%, PPF beats most post-tax fixed-income alternatives for retail savers.",
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
      "Retirement planning in India is a three-variable problem: how long you'll live after retiring, how inflation erodes your money's value, and what return your corpus generates in retirement. Indian life expectancy at age 60 is now ~21 years and rising — meaning anyone retiring at 60 must plan for 25–30 years of post-retirement income, not the 10–15 years their parents' generation needed. Healthcare costs, lifestyle inflation, and the absence of robust government pensions for the private sector make this one of the most important calculations any working Indian can run.",
      "This calculator uses a two-phase model. Pre-retirement: you invest at a higher-return portfolio (typically equity-heavy, 70–80% in equity mutual funds, balance in PPF/EPF/NPS). Post-retirement: you shift to lower-risk allocations (debt-heavy, 40–60% debt, rest in conservative equity) and withdraw gradually, assuming annual inflation in expenses. The math compounds the corpus through both phases — first growing it, then drawing it down.",
      "The monthly SIP shown is what you'd need to invest from today to hit your retirement corpus. Rising inflation (from 6% to 7%) can increase required SIP by 30–40% — it's the single biggest lever in the model after starting age. Try this experiment: enter your current age, push retirement age from 55 to 65, and watch the required monthly SIP halve. Then push it to 70 and it nearly halves again. Working an extra 5 years at the back end has dramatically more financial impact than saving harder in your 30s.",
      "What this calculator deliberately understates: medical inflation (India's medical CPI has averaged 12–14% over the last decade — meaning healthcare costs roughly double every 5–6 years), lifestyle creep, lump-sum needs (children's wedding, gifts to grandchildren, helping aged parents), and the cost of round-the-clock care if life expectancy stretches past 85. A practical correction: take the 'corpus needed' number from this calculator and multiply by 1.3–1.5x to build a buffer for health and lifestyle inflation.",
      "Indian retirement reality check: most Indian salaried professionals dramatically under-save. Average EPF balance at retirement is just ₹6–8 lakh, which generates barely ₹4,000/month in safe income. The corpus this calculator typically suggests (₹4–8 crore for a middle-income lifestyle) feels enormous, but is mathematically correct given inflation and longevity. Start early: ₹10,000/month from age 25 at 12% builds ₹3.4 crore by 60. The same ₹10,000/month started at 35 builds only ₹1 crore. The decade between 25 and 35 is where the entire retirement picture is decided.",
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
      "India now has two income tax regimes. The new regime (introduced 2020, enhanced in Budget 2024) has lower rates but strips away most deductions. The old regime has higher rates but lets you claim 80C (₹1.5L), HRA, home loan interest (Sec 24, up to ₹2L), NPS contribution (Sec 80CCD-1B, ₹50K), medical insurance (Sec 80D), education loan interest (Sec 80E), and a list of smaller items. Picking the right regime can swing your tax outgo by ₹50,000–₹2,00,000 per year for a typical mid-to-upper income earner.",
      "For FY 2025-26, income up to ₹7 lakh effectively pays zero tax under the new regime (via Section 87A rebate + standard deduction of ₹75,000). This has pushed most salaried taxpayers below ₹15L gross toward the new regime, which is also the simpler choice — no need to track receipts, fund proofs, rent agreements, or LIC premiums for tax purposes. Simplicity has real value when you're filing a return.",
      "This calculator compares both regimes side-by-side using your gross income and deductions. Tip: ignore HRA in the comparison if you're choosing new regime — you can't claim it there anyway. Run multiple scenarios: full deductions in old regime, partial deductions, and new regime, then pick the one with the lowest tax. Sometimes adding ₹50,000 of NPS (80CCD-1B) flips the comparison from new regime to old regime; sometimes a home loan interest of ₹2L is enough to do that flip.",
      "Break-even analysis for FY 2025-26: at ₹10 lakh gross, new regime always wins (it has lower rates and the rebate makes effective tax zero up to ₹7L). At ₹15 lakh gross, old regime wins only if you have ~₹4L+ of deductions stacked. At ₹25 lakh gross, old regime wins if you have ₹4.5L+ deductions. At ₹50 lakh gross, the math leans toward old regime if you have ₹4.75L+ deductions. The bigger your salary, the more likely old regime makes sense — because more deductions are practically usable.",
      "Critical filing notes: salaried individuals can switch regime every year while filing ITR — your in-year TDS regime choice (declared to employer in April) is just an estimation tool, you can override at filing. Business/professional income earners get only one switch from new to old, then are locked. The new regime is the default from FY 2024-25 onward — if you do nothing, you're treated as new regime. For exact tax with surcharges (10% above ₹50L, 15% above ₹1Cr, 25% above ₹2Cr, 37% above ₹5Cr in old regime — capped at 25% in new regime), use the official Income Tax e-filing portal calculator before filing.",
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
      "Brokerage isn't just the broker's fee — it's a stack of charges that can eat into your profit, especially on small trades. This calculator shows the full breakdown for every major Indian broker so you can see who's cheapest for your trade size. The total cost of a trade includes: brokerage (broker's cut), STT (Securities Transaction Tax to the government), Exchange Transaction Charges (NSE/BSE), SEBI turnover fee, Stamp Duty (state-level), and 18% GST on brokerage and exchange charges.",
      "Discount brokers (Zerodha, Groww, Upstox, Angel One, Dhan, 5paisa, Fyers) charge ₹0 for equity delivery or a flat ₹20 per intraday order, regardless of trade size. This is the dominant model in India today — Zerodha alone has 1.6 crore active clients and pioneered the zero-brokerage delivery model in 2015. Groww overtook Zerodha by client count in 2024 with a similar pricing structure but stronger mobile UX.",
      "Traditional brokers (ICICI Direct, HDFC Securities, Kotak Securities, Sharekhan, Motilal Oswal) charge a percentage of turnover — often 0.3–0.55% for delivery — which makes them 10–50× more expensive on large trades. On a ₹10 lakh delivery trade, ICICI Direct may charge ₹3,500+ in brokerage alone, while Zerodha charges zero. Most retail investors should consolidate on a discount broker unless they specifically need full-service research/advisory access.",
      "Hidden costs to watch beyond brokerage: AMC (Annual Maintenance Charge) on demat — ₹0 for Zerodha after first year, ₹300–600/year at most others. Call & Trade fees: ₹50/order if you place by phone instead of app. DP (Depository) charges on every sell: ₹13–15 per scrip per day, regardless of quantity. For frequent traders, these 'small' charges can add up to ₹3,000–5,000/year.",
      "Real cost difference at scale: a trader doing 20 intraday round-trips per month at 100 shares × ₹500 each pays roughly ₹600/month in brokerage at Zerodha (₹40 round-trip × 20 = ₹800 minus margin discounts) versus ₹4,500/month at a 0.05% percentage broker. Over 10 years, that's ₹4.7 lakh in saved brokerage — money that compounds back into your portfolio. Always benchmark your real-world trade pattern against this calculator before locking in a broker.",
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
);

calculators.push(
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
);

export function getCalcBySlug(slug: string): CalcMeta | undefined {
  return calculators.find((c) => c.slug === slug);
}
