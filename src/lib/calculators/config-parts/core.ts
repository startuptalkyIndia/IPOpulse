import type { CalcMeta } from "../types";

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

export const corePart: CalcMeta[] = [
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
