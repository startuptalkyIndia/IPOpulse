/**
 * Curated 2-line descriptions for top Indian listed companies.
 * Key: company slug (matches Company.slug in DB)
 * Used on /ticker/[slug] pages for the "What does this company do?" blurb.
 */
export const companyDescriptions: Record<string, string> = {
  // ── Banking ──────────────────────────────────────────────────────────────
  "hdfc-bank": "India's largest private sector bank by assets, serving over 93 million customers across 8,700+ branches. Known for consistent asset quality, low NPAs, and one of the highest ROEs in Indian banking.",
  "icici-bank": "India's second-largest private bank with a diversified portfolio spanning retail, SME, and corporate lending. Digital-first strategy under iMobile Pay has made it the benchmark for tech adoption in Indian banking.",
  "state-bank-of-india": "India's largest public sector bank by deposits and branches, with a government ownership of ~57%. Handles 1 in 4 loan transactions in India and is the primary banker to the central and state governments.",
  "kotak-mahindra-bank": "Founded by Uday Kotak in 1985 as an NBFC, converted to a bank in 2003. Highly regarded for conservative lending, pristine asset quality, and one of the best-managed private bank franchises in India.",
  "axis-bank": "India's third-largest private sector bank with a focus on retail lending, credit cards, and SME banking. Has undergone significant digital and operational transformation since the appointment of Amitabh Chaudhry as MD & CEO.",
  "punjab-national-bank": "India's second-largest public sector bank, merged with OBC and United Bank in 2020. A key player in agricultural and priority sector lending across northern and eastern India.",
  "bank-of-baroda": "One of India's oldest and largest public sector banks, with a significant international presence in 17+ countries. Strong retail deposit franchise with over 9,000 branches.",
  "indusind-bank": "A mid-sized private sector bank known for vehicle financing, microfinance, and affluent retail banking. Its Consumer Finance division is among the largest vehicle loan franchises in India.",
  "yes-bank": "A private sector bank that underwent significant restructuring after a crisis in 2020, with SBI and other banks acquiring stakes. Has stabilised and is rebuilding its retail and SME lending book.",
  "federal-bank": "Kerala-headquartered private bank with a loyal NRI remittance deposit base and growing pan-India retail franchise. Consistently among the better-performing mid-size private banks.",
  "idfc-first-bank": "Created from the merger of IDFC Bank and Capital First in 2018 under V. Vaidyanathan. Transforming into a high-quality retail bank, but carries legacy infrastructure loan book as it transitions.",

  // ── IT ───────────────────────────────────────────────────────────────────
  "tata-consultancy-services": "India's largest IT services company and the second most valuable Indian company by market cap. Serves 19 of the Fortune 500 and operates across 55+ countries with 600,000+ employees.",
  "infosys": "India's second-largest IT company, co-founded by N.R. Narayana Murthy in 1981. A pioneer of the India IT services model; now focused on digital transformation, cloud, and AI services for global enterprises.",
  "hcl-technologies": "India's third-largest IT services company, with particular strength in engineering R&D services and IT infrastructure management. HCLTech Products division generates recurring licensing revenue.",
  "wipro": "Diversified IT services and technology company headquartered in Bengaluru. Has been actively acquiring companies in Europe and North America to build digital capabilities faster.",
  "tech-mahindra": "Part of the Mahindra Group, specialising in telecom IT services, BPO, and digital transformation. A top-3 global player in telecom network solutions for carriers.",
  "ltimindtree": "Formed by the 2022 merger of L&T Infotech and Mindtree, now a top-7 Indian IT company. Strong in BFSI, manufacturing, and hi-tech verticals with over 80,000 employees.",
  "mphasis": "Blackstone-backed IT services company with a dominant focus on the BFSI (banking, financial services, insurance) vertical. Over 60% revenue from top-10 clients, mostly large US financial institutions.",
  "persistent-systems": "A Pune-based IT services company with exceptional revenue growth momentum since 2020. Focus on product engineering, cloud, and data for ISVs (independent software vendors) in North America.",
  "coforge": "Mid-size IT company with strong domain expertise in travel & hospitality, insurance, and banking. Consistently high growth rates driven by large deal wins and vertical focus.",

  // ── Auto ─────────────────────────────────────────────────────────────────
  "maruti-suzuki-india": "India's largest passenger vehicle manufacturer with ~40% market share. A joint venture between Suzuki Japan and the Government of India, selling through 4,000+ Nexa and Arena outlets.",
  "tata-motors": "India's largest commercial vehicle maker and the owner of Jaguar Land Rover (UK). The EV play Tata Nexon EV leads the domestic electric vehicle market with over 20% EV market share.",
  "mahindra-mahindra": "India's largest tractor manufacturer and a leading SUV maker (Scorpio, Thar, XUV series). Strong EV pipeline with BE 6e and XEV 9e; also controls tech companies through Mahindra Group.",
  "eicher-motors": "Manufacturer of Royal Enfield motorcycles, the world's largest premium motorcycle segment brand. Operating margins are among the highest in the Indian auto sector at 25%+.",
  "hero-motocorp": "World's largest two-wheeler manufacturer by volume, with 35%+ market share in Indian motorcycles. Dominant in rural and semi-urban markets through brands like Splendor and HF Deluxe.",
  "bajaj-auto": "India's second-largest two-wheeler maker and the largest three-wheeler exporter globally. Premia brands Pulsar and Dominar lead the sports motorcycle segment; Chetak is its electric scooter.",
  "ashok-leyland": "India's second-largest commercial vehicle manufacturer, part of the Hinduja Group. Dominant in the medium and heavy trucks segment in southern and eastern India.",
  "samvardhana-motherson": "India's largest auto-component manufacturer by revenue. A global supplier to OEMs across Europe, Americas, and Asia for wiring harnesses, mirrors, and polymer components.",

  // ── Pharma ───────────────────────────────────────────────────────────────
  "sun-pharmaceutical-industries": "India's largest pharma company and the fourth-largest generic pharma in the US by prescriptions. Strong branded generics business in India and specialty pharma pipeline for developed markets.",
  "dr-reddys-laboratories": "Hyderabad-based integrated pharmaceutical company with a large US generics business, branded India business, and growing biosimilars portfolio. One of the few Indian companies with USFDA-approved biologics.",
  "cipla": "Mumbai-based generics company known for humanitarian pricing — first to offer antiretroviral HIV drugs at 1% of Western cost. Strong in respiratory, anti-infectives, and oncology.",
  "divi-laboratories": "India's largest API (Active Pharmaceutical Ingredient) and CRAMS (custom research & manufacturing) player. Supplies to 9 of the top 10 global pharma companies. Zero debt, high ROCE.",
  "apollo-hospitals-enterprise": "India's largest hospital chain with 10,000+ beds across 70+ hospitals. Pioneered corporate healthcare in India; also runs Apollo Pharmacy (largest pharma retail chain) and digital health.",
  "max-healthcare": "Delhi NCR-focused super-specialty hospital chain growing aggressively through both greenfield and acquisitions. High occupancy rates and specialisation in oncology, orthopaedics, and cardiac care.",

  // ── FMCG ─────────────────────────────────────────────────────────────────
  "hindustan-unilever": "India's largest FMCG company, subsidiary of Unilever (UK). Portfolio of 50+ brands including Dove, Surf Excel, Lux, Lipton, and Kissan. Reaches 8 million+ retail outlets across India.",
  "itc": "A diversified conglomerate with businesses in cigarettes (market leader), FMCG (Sunfeast, Aashirvaad, Savlon), hotels, agribusiness, and paper. Generates massive cash from cigarettes to fund FMCG expansion.",
  "nestle-india": "Indian subsidiary of Nestlé SA, Switzerland. Best known for Maggi noodles (India's top instant noodle), KitKat, Munch, and Nescafé. High ROCE (70%+), minimal capex, and consistent dividend payer.",
  "britannia-industries": "India's largest biscuits company with brands like Good Day, Tiger, and Marie Gold reaching 5 million+ retail outlets. Over 100 years old; one of India's most efficient food companies.",
  "emami": "Kolkata-based FMCG company known for personal care and Ayurvedic products — Boroplus, Navratna Oil, Fair and Handsome, and Zandu. Strong in value-for-money and rural segments.",
  "dabur-india": "India's largest Ayurvedic healthcare and FMCG company with brands like Real juice, Hajmola, Dabur Honey, and Chyawanprash. 40% of revenue from rural India; expanding internationally.",
  "godrej-consumer-products": "Part of Godrej Group; India's largest household insecticide maker (Good Knight) and a major player in hair colour (Godrej Expert), with a growing Africa/Indonesia business.",
  "colgate-palmolive-india": "Subsidiary of Colgate-Palmolive USA, commanding 50%+ market share in toothpaste. A predictable, capital-light business that has paid uninterrupted dividends for decades.",
  "marico": "Mumbai-based FMCG company best known for Parachute coconut oil (market leader) and Saffola edible oils. International business contributes ~25% of revenue from Bangladesh, Middle East, and Africa.",

  // ── Oil & Gas / Energy ───────────────────────────────────────────────────
  "reliance-industries": "India's largest company by market cap, led by Mukesh Ambani. Operates across petrochemicals, oil refining (world's largest refinery complex at Jamnagar), Jio telecom, and JioMart retail.",
  "oil-and-natural-gas-corporation": "India's largest oil & gas producer, contributing ~70% of domestic oil production. A PSU with significant E&P assets across India, Russia (Sakhalin), and other geographies.",
  "bharat-petroleum-corporation": "India's second-largest PSU oil refiner with 15,000+ fuel stations (BPCL, HP). Also involved in gas distribution and exploration assets in Brazil and Mozambique.",
  "hindustan-petroleum-corporation": "PSU oil refiner and marketer, subsidiary of ONGC. Operates two refineries (Mumbai and Visakhapatnam) and over 20,000 retail outlets.",
  "petronet-lng": "India's largest LNG import and regasification company, jointly owned by GAIL, ONGC, IOCL, and BPCL. Operates Dahej and Kochi LNG terminals.",
  "indian-oil-corporation": "India's largest company by revenue; the biggest crude oil refiner and fuel retail marketer. Operates 11 refineries and the largest pipeline network in India.",
  "gail-india": "India's largest natural gas transmission and marketing company, also in petrochemicals and city gas distribution via equity stakes in IGL, MGL, and others.",
  "adani-total-gas": "City gas distribution JV between Adani Group and TotalEnergies. India's largest CGD company by geographic area, serving residential, commercial, and CNG customers.",

  // ── Infra / Capital Goods ─────────────────────────────────────────────────
  "larsen-toubro": "India's largest engineering & construction conglomerate with projects in defence, power, hydrocarbons, and infrastructure across 50+ countries. L&T Finance and L&T Technology add financial and IT arms.",
  "adani-enterprises": "Flagship of the Adani Group — incubating new Adani businesses including airports (AAHL), roads (ATGL), data centres, and green hydrogen. Also runs trading/resources arm.",
  "adani-ports-and-sez": "India's largest commercial port operator with 13 ports handling ~27% of India's total cargo. Also developing logistics parks and the Vizhinjam transhipment port.",
  "bharat-electronics": "India's premier defence electronics PSU, making radars, electronic warfare systems, avionics, and communication equipment for Indian armed forces. Order book of ₹60,000+ crore.",
  "siemens": "Indian subsidiary of Siemens AG Germany, operating in power, industrial automation, smart infrastructure, and mobility (railways). Largest foreign industrial conglomerate in India.",
  "abb-india": "ABB India is a subsidiary of ABB Switzerland, specialising in electrification products, industrial automation, motion, and power grids. Beneficiary of India's grid modernisation push.",
  "cummins-india": "Indian arm of Cummins Inc USA, making diesel and natural gas engines for trucks, construction, marine, and power generation. R&D centre in Pune exports engines globally.",

  // ── Power ────────────────────────────────────────────────────────────────
  "ntpc": "India's largest power generation company, a PSU with ~70 GW capacity across coal, gas, solar, and wind. Plans to add 60 GW renewable capacity by 2032.",
  "power-grid-corporation-of-india": "India's central transmission utility; owns and operates the national electricity transmission grid. A regulated utility with near-guaranteed returns on equity.",
  "tata-power-company": "Tata Group's integrated power utility with generation, transmission, distribution, and solar EPC businesses. One of India's oldest private power companies.",
  "adani-power": "Adani Group's thermal power generation company, the largest private power producer in India with ~17 GW capacity, primarily coal-based plants in Gujarat, Rajasthan, and Jharkhand.",
  "torrent-power": "Gujarat-based integrated power utility — generation (gas + solar), distribution (Ahmedabad, Surat, Gandhinagar), and power trading. One of India's most efficient private utilities.",

  // ── Telecom ──────────────────────────────────────────────────────────────
  "bharti-airtel": "India's largest telecom company by revenue and ARPU, and the second-largest by subscribers. Also operates in 14 African countries via Airtel Africa and has fast-growing enterprise connectivity business.",
  "vodafone-idea": "Merger of Vodafone India and Idea Cellular (2018). Struggling with high debt and subscriber loss; government has taken a 33% equity stake. India's third-largest telecom operator.",
  "indus-towers": "India's largest telecom tower infrastructure company, a merger of Indus Towers and Bharti Infratel. Owns 225,000+ towers used by Airtel, Vi, and Jio.",

  // ── Cement ───────────────────────────────────────────────────────────────
  "ultratech-cement": "India's and Asia's largest cement company, part of the Aditya Birla Group. 100+ million tonne per annum capacity across 23 integrated plants — 2x the size of its nearest competitor.",
  "ambuja-cements": "Part of the Adani Group after acquisition from Holcim in 2022. Second-largest cement maker in India with key presence in north and west. Strong on green energy and cost efficiency.",
  "acc": "Part of the Adani Group (acquired with Ambuja from Holcim). One of India's oldest cement brands with significant presence in east and south India.",
  "shree-cement": "Rajasthan-based cement company known for exceptional operational efficiency and the highest EBITDA per tonne margins in the sector. Built organically — no large acquisitions.",
  "dalmia-bharat": "Fourth-largest cement company in India, with a focus on the eastern and southern markets. Target to reach 110-130 MTPA by 2031 from current ~45 MTPA.",

  // ── Metals ───────────────────────────────────────────────────────────────
  "tata-steel": "India's second-largest steel company, with major integrated steel plants in Jamshedpur and via Tata Steel Netherlands/UK. Faces cyclical profitability but benefits from scale and vertical integration.",
  "jswsteel": "India's largest steel company by capacity. Promoter Sajjan Jindal has built JSW into a diversified conglomerate across steel, energy, cement, infrastructure, and paints.",
  "steel-authority-of-india": "India's largest PSU steel producer with five integrated steel plants. Typically valued at a discount to private peers due to lower efficiency, but benefits from scale and government contracts.",
  "hindalco-industries": "India's largest aluminium and copper producer, part of the Aditya Birla Group. Global aluminium downstream leader via Novelis USA — the world's largest aluminium rolling company.",
  "vedanta": "Diversified natural resources conglomerate with India's largest zinc operation (Hindustan Zinc), aluminium, copper, iron ore, and oil & gas. High dividend payer; high leverage.",

  // ── Financial Services ───────────────────────────────────────────────────
  "bajaj-finance": "India's most valuable NBFC — a consumer lending powerhouse financing EMI purchases, personal loans, gold loans, and SME credit. Exceptional tech platform and cross-sell engine across 88 million customers.",
  "bajaj-finserv": "The holding company of the Bajaj Group's financial services businesses: Bajaj Finance, Bajaj Allianz Life Insurance, and Bajaj Allianz General Insurance.",
  "hdfc-life-insurance": "India's second-largest private life insurer by premium and the most profitable. Strong protection and annuity product mix; distributed through HDFC Bank's network.",
  "sbi-life-insurance": "India's largest private life insurer by new business premium, backed by SBI's 22,000+ branch distribution network.",
  "icici-prudential-life-insurance": "Joint venture between ICICI Bank and Prudential plc (UK). Largest ULiP seller in India; rebuilding towards high-margin protection products.",
  "icici-lombard-general-insurance": "India's largest private general insurer. Covers motor, health, travel, property, and liability risks across 280 branches.",
  "hdfc-amc": "India's second-largest mutual fund house by AUM (~₹7.5 lakh crore). Highly profitable capital-light business that earns trail commission on every rupee under management.",
  "nippon-india-amc": "Nippon Life-backed AMC; one of India's top-5 mutual fund managers. Known for ETF product range — Nifty BeES is its flagship product.",
  "cdsl": "Central Depository Services Limited — one of India's two stock depositories (the other being NSDL). Holds securities for CDSL-registered demat account holders. A high-ROE, capital-light business that benefits from rising demat accounts.",
  "bse": "Bombay Stock Exchange — Asia's oldest exchange (1875) with 5,000+ listed companies. Also owns BSE SME platform and the equity exchange business of MCX through acquisition.",
  "angel-one": "India's second-largest discount broker by active clients. Offers stock broking, mutual funds, and investment advisory. SmartAPI is widely used by algo trading community.",
  "muthoot-finance": "India's largest gold loan NBFC, headquartered in Kerala. Lends against physical gold jewellery at LTV of 60-75%; over 5,500 branches nationally.",
  "manappuram-finance": "Thrissur-based gold loan NBFC, India's second-largest. Also operates microfinance (Asirvad MFI) and other loan verticals.",
  "shriram-finance": "India's largest retail NBFC focused on used commercial vehicle loans and personal loans for the underserved. Formed from the merger of Shriram Transport and Shriram City Union.",
  "cholamandalam-investment": "Part of Murugappa Group; a diversified NBFC with vehicle loans, home loans, and SME lending. Consistently one of the best-managed NBFCs in South India.",

  // ── Consumer / Retail ─────────────────────────────────────────────────────
  "avenue-supermarts": "Operator of D-Mart hypermarkets — India's most profitable retailer per square foot. EDLC/EDLP model (everyday low cost / everyday low price) built by Radhakishan Damani.",
  "trent": "Tata Group's fashion retail subsidiary operating Westside and Zudio brands. Zudio's value fashion proposition has driven exceptional growth in tier-2 and tier-3 cities.",
  "titan-company": "Tata Group's jewellery (Tanishq), watches (Titan, Fastrack), and eyewear (Titan Eye+) company. Tanishq is India's most trusted jewellery brand, driving 85%+ of revenue.",
  "page-industries": "Exclusive licensee of Jockey brand in India, Sri Lanka, Bangladesh, Nepal, and UAE. Asset-light franchise model with very high ROCE and consistent 20%+ ROE over 15 years.",
  "v-mart-retail": "Value fashion retailer focused exclusively on tier-2 to tier-4 cities. Category pioneer in the 'fashion for Bharat' segment with 450+ stores.",
  "info-edge-india": "India's internet conglomerate owning Naukri.com (70%+ job portal market share), 99acres.com, Jeevansaathi, and early stakes in Zomato and Policy Bazaar.",
  "zomato": "India's largest food delivery and quick commerce platform (Blinkit). Became profitable in FY2024 — a milestone for India's food-tech sector.",
  "one97-communications": "Parent company of Paytm — India's largest digital payments platform. Operates payment aggregator, merchant lending, and insurance distribution. Under regulatory scrutiny from RBI.",

  // ── Real Estate ──────────────────────────────────────────────────────────
  "dlf": "India's largest listed real estate developer, building luxury residential (The Camellias, 5S), commercial offices (Cyber City), and malls (DLF Malls) across Delhi NCR.",
  "godrej-properties": "Godrej Group's real estate arm operating in a capital-light asset-light model — develops projects on landowners' land via profit-sharing. Active in Mumbai, Pune, Delhi NCR, and Bengaluru.",
  "oberoi-realty": "Mumbai-focused luxury real estate developer known for the Oberoi Exquisite and Three Sixty West brands. One of the highest-margin residential developers in India.",
  "phoenix-mills": "India's largest mall operator with 10+ premium large-format malls (Phoenix Palladium, Phoenix Marketcity). Also developing residential and commercial assets.",

  // ── Specialty / Others ───────────────────────────────────────────────────
  "asian-paints": "India's largest paint company with a 40%+ market share. Distribution muscle across 75,000+ dealers; expanding into home décor (Beautiful Homes) and waterproofing.",
  "pidilite-industries": "India's adhesives and sealants leader — Fevicol is a cultural icon with near-monopoly status. Also makes Dr. Fixit waterproofing and construction chemicals.",
  "berger-paints-india": "India's second-largest paint company. Strong in decorative paints across eastern India; growing in industrial and auto coatings.",
  "havells-india": "India's largest electrical equipment company with brands in cables, switches, fans, lighting, and Lloyd (consumer durables). Backed by strong distribution.",
  "voltas": "Tata Group's HVAC (air conditioning) and engineering company. Largest room AC brand in India with 23%+ market share. JV with Beko for white goods.",
  "blue-star": "India's second-largest room AC maker and the largest commercial HVAC (central air conditioning) company. Strong in institutional/commercial projects.",
  "crompton-greaves-consumer-electricals": "India's largest fan maker and top-3 pump maker. Demerged from ABB-era Crompton Greaves; now a focused consumer electricals brand.",
  "whirlpool-of-india": "Indian subsidiary of Whirlpool Corporation USA. Makes refrigerators, washing machines, and ACs sold under Whirlpool brand with strong presence in tier-2+ markets.",
  "polycab-india": "India's largest cables & wires manufacturer with 25%+ market share. Rapidly expanding into FMEG (fans, switches, pumps) under the Polycab brand.",
  "supreme-industries": "India's largest plastic products company making pipes, fittings, packaging, and industrial products. Known for process innovation and consistent ROCE above 20%.",
  "astral": "Ahmedabad-based pipes & fittings company that pioneered CPVC plumbing in India. Expanded into adhesives (acquired Resinova + Rex Adhesives). High-growth compounding story.",
  "apl-apollo-tubes": "India's largest manufacturer of structural steel tubes, supplying to construction, infrastructure, and white goods. Low-competition product with pricing power.",
  "mrf": "India's largest tyre company by revenue, known for premium pricing, strong brand, and very high per-share price (₹1.2 lakh+). Serves OEM and replacement markets.",
  "apollo-tyres": "India's second-largest tyre company with significant European operations via Apollo Vredestein. Expanding capacity at Chennai and Andhra Pradesh plants.",
  "ceat": "RPG Group's tyre company — third-largest in India. Strong in two-wheeler and farm tyres; expanding into premium passenger vehicle segment.",
  "interglobe-aviation": "Operator of IndiGo, India's largest airline with 60%+ domestic market share. Fleet of 350+ aircraft; the only consistently profitable Indian airline over 10+ years.",
  "container-corporation-of-india": "India's largest multimodal logistics company, a PSU managing rail-based container freight. Handles EXIM containers across 60+ terminals.",
  "delhivery": "India's largest fully integrated logistics company — express parcel, freight, truckload, cross-border. Went public in 2022; reaching profitability on adjusted basis.",
  "irctc": "Indian Railway Catering and Tourism Corporation — monopoly on online railway ticket booking, catering, and Nido-brand packaged water. Government-owned but listed; exceptionally high ROE.",
  "indian-railway-finance-corporation": "NBFC that raises funds from capital markets to lend exclusively to Indian Railways for rolling stock and asset acquisitions. Quasi-sovereign bonds at near-government rates.",
  "lic": "Life Insurance Corporation of India — the world's largest life insurer by policy count and India's largest institutional equity holder. Government owns 96% post the IPO that divested 3.5%.",
  "sbi-cards-and-payment-services": "India's second-largest standalone credit card company (after HDFC Bank cards). Part of SBI group with access to SBI's 500 million+ customer base.",
  "manpasand-beverages": "Fruit-based beverage company known for Mango Sip and Fruits Up brands. Primarily focused on rural and semi-urban markets in north India.",
  "zydus-lifesciences": "Zydus Cadila Group's pharmaceutical arm — a large generics company in India and the US, with a biosimilars pipeline. Pioneer of India's first home-grown COVID vaccine (ZyCoV-D).",
  "biocon": "Bengaluru-based biotech company — India's largest generic biosimilar maker. Partners with Mylan/Viatris for commercialisation in the US and Europe.",
  "alkem-laboratories": "Mumbai-based pharma company with India's largest acute therapy business (antibiotics, anti-infectives). US generics growing with ANDA approvals.",
  "torrent-pharmaceuticals": "Ahmedabad-based pharma company with a strong branded generics business in India, Germany, Brazil, and the US. Consistent dividend payer and low-debt balance sheet.",
  "abbott-india": "Indian subsidiary of Abbott Laboratories USA. Markets branded formulations — Thyronorm (thyroid), Duphalac, Vertin. Asset-light; imports formulations from Abbott globally.",
  "pfizer-india": "Indian subsidiary of Pfizer Inc USA. Focused on branded specialty medicines in pain, cardiovascular, and hospital products. High dividend payer, very low debt.",
  "astrazeneca-pharma-india": "Indian subsidiary of AstraZeneca plc UK. Markets Atacand (BP), Faslodex (breast cancer), and Tagrisso (lung cancer) in India. Mainly a distribution arm.",
};

/**
 * Returns the curated description for a company slug, or generates a
 * generic fallback from available DB fields.
 */
export function getCompanyDescription(
  slug: string,
  fallback?: { sector?: string | null; industry?: string | null; name?: string }
): string | null {
  if (companyDescriptions[slug]) return companyDescriptions[slug];
  if (!fallback) return null;
  const { sector, industry, name } = fallback;
  if (!sector && !industry) return null;
  const segment = industry ?? sector;
  return `${name ?? "This company"} is a listed ${segment} company on NSE/BSE. Detailed profile data is being compiled — check BSE filings for the latest disclosures.`;
}
