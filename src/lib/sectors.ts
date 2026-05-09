export interface Sector {
  slug: string;
  name: string;
  niftyIndex?: string;
  description: string;
  longDescription: string;
  themes: string[];      // key investment themes / tailwinds
  risks: string[];       // sector-specific risks
  topCompanies: string[]; // slugs
  learnLink?: string;    // /learn article slug
}

export const sectors: Sector[] = [
  {
    slug: "banking",
    name: "Banking",
    niftyIndex: "Nifty Bank",
    description: "Public and private sector banks. Largest sector in Nifty 50 by weight (~32%).",
    longDescription:
      "Banking is the backbone of India's financial system and the single largest sector in the Nifty 50 by free-float market cap. Private sector banks — led by HDFC Bank, ICICI Bank, and Kotak — have consistently outperformed PSU banks on asset quality, ROE, and digital innovation. The sector's fortunes track India's credit growth cycle, RBI's interest rate policy, and the health of the broader economy. A rising rate cycle benefits net interest margins (NIMs) in the short run; a slowing economy risks elevated NPAs.",
    themes: [
      "India's credit-to-GDP ratio (~55%) is well below peers — structural underpenetration",
      "Private bank market share gain from PSU banks continues",
      "Digital lending and UPI driving financial inclusion at scale",
      "RBI's stricter NBFC norms driving borrowers toward banks",
      "Rising CASA ratios among private banks lowering cost of funds",
    ],
    risks: [
      "NPA cycles from economic slowdown or monsoon failure",
      "RBI rate cuts compressing NIMs in a falling rate environment",
      "Competition from fintechs in unsecured personal loans",
      "Regulatory tightening on credit cards and lending rates",
    ],
    topCompanies: ["hdfc-bank", "icici-bank", "state-bank-of-india", "kotak-mahindra-bank", "axis-bank"],
  },
  {
    slug: "it",
    name: "Information Technology",
    niftyIndex: "Nifty IT",
    description: "IT services + product companies. Large export earners; sensitive to US/Euro demand and USD/INR.",
    longDescription:
      "Indian IT services companies are the world's dominant outsourcing partners for global enterprises. The sector earns ~85% of revenue in USD/EUR, making it a natural hedge for investors against INR depreciation. Growth is driven by digital transformation, cloud migration, and enterprise AI adoption. After a period of exceptional growth (2020–22) and subsequent correction (2023–24) as US tech budgets tightened, the sector is recovering on the back of large deal momentum and AI service lines.",
    themes: [
      "Generative AI creating new service lines and efficiency gains",
      "Multi-year cloud migration cycles in BFSI, retail, and healthcare",
      "INR depreciation amplifies USD revenue in rupee terms",
      "Margin expansion as attrition normalises and headcount stabilises",
      "Large deal pipeline rebuilding across Tier-1 IT companies",
    ],
    risks: [
      "US/Europe recession reducing discretionary IT spending",
      "AI potentially automating services jobs, compressing revenue per employee",
      "H-1B visa restrictions raising onsite delivery costs",
      "Pricing pressure as clients demand more for less",
    ],
    topCompanies: ["tata-consultancy-services", "infosys", "hcl-technologies", "wipro", "tech-mahindra"],
    learnLink: "/learn/pe-ratio",
  },
  {
    slug: "auto",
    name: "Automobile",
    niftyIndex: "Nifty Auto",
    description: "Passenger vehicles, commercial vehicles, 2-wheelers, and auto ancillaries.",
    longDescription:
      "India's auto sector is in a structural upcycle driven by premiumisation in passenger vehicles, rural recovery supporting 2-wheelers, and infrastructure spending lifting commercial vehicle demand. The EV transition is underway — Tata Nexon EV leads the 4W EV market while Ola Electric, Ather, and TVS dominate 2W EVs. The sector is highly cyclical, tracking rural income, fuel prices, and financing availability.",
    themes: [
      "SUV premiumisation — entry hatches declining, mid-SUV volumes rising",
      "EV transition: Tata Motors, M&M leading 4-wheeler EVs",
      "2W EV transition — Bajaj Chetak, TVS iQube, Ola Electric",
      "Commercial vehicle super-cycle on infrastructure spending",
      "Auto ancillary beneficiaries of EV supply chain localisation",
    ],
    risks: [
      "Rising fuel prices reducing consumer buying capacity",
      "High interest rates making EMIs expensive",
      "EV adoption faster than expected disrupting ICE incumbents",
      "Supply chain disruptions (semiconductors, precious metals)",
      "Monsoon failure hurting rural 2W demand",
    ],
    topCompanies: ["maruti-suzuki-india", "tata-motors", "mahindra-mahindra", "eicher-motors", "hero-motocorp"],
  },
  {
    slug: "pharma",
    name: "Pharmaceuticals",
    niftyIndex: "Nifty Pharma",
    description: "Generic manufacturing, branded formulations, and API/CDMO plays. Rupee hedge.",
    longDescription:
      "India is the world's largest producer of generic medicines, supplying 20% of global generics by volume and 60% of global vaccines. The sector operates across three business models: US generics (highly competitive, price-eroding), Indian branded generics (high margins, brand loyalty), and API/CDMO (contract manufacturing for global pharma). The sector is a natural USD earner and benefits from INR depreciation.",
    themes: [
      "US generics stabilising after multi-year price erosion",
      "India branded generics growing 8–12% annually — recession-resistant",
      "Biosimilars opportunity: India competing in global biologic generics",
      "CDMO/API growth as China +1 supply chain diversification",
      "Healthcare premiumisation in India driving specialty drug demand",
    ],
    risks: [
      "USFDA import alerts on Indian manufacturing facilities",
      "Price erosion in US generics from increased competition",
      "API raw material dependence on China (60-70% of key APIs)",
      "Regulatory price controls on essential medicines in India",
    ],
    topCompanies: ["sun-pharmaceutical-industries", "dr-reddys-laboratories", "cipla", "divi-laboratories", "zydus-lifesciences"],
    learnLink: "/learn/pe-ratio",
  },
  {
    slug: "fmcg",
    name: "FMCG",
    niftyIndex: "Nifty FMCG",
    description: "Daily-use goods — packaged food, personal care, home care. Defensive, dividend-heavy.",
    longDescription:
      "FMCG is the most defensive sector in the Indian market — demand for staples like soap, biscuits, and edible oil holds up even during downturns. The sector's key drivers are rural income growth, urbanisation, and premiumisation. Multinational subsidiaries (HUL, Nestlé, Colgate) are known for exceptional ROCE (40–70%), consistent dividends, and brand moats. The sector typically commands premium P/E multiples (40–60×) justified by the durability of earnings.",
    themes: [
      "Rural recovery driving volume growth in mass-market FMCG",
      "Premiumisation — consumers upgrading from economy to premium",
      "Direct-to-consumer brands pressuring traditional players",
      "Modern trade (D-Mart, Reliance Retail) gaining share from kirana",
      "Raw material (palm oil, wheat, crude) price declines expanding margins",
    ],
    risks: [
      "Commodity cost inflation squeezing gross margins",
      "Competition from private labels in modern trade",
      "Rural demand slowdown from poor monsoon or higher inflation",
      "D2C brands disrupting categories like personal care and packaged food",
    ],
    topCompanies: ["hindustan-unilever", "itc", "nestle-india", "britannia-industries", "dabur-india"],
  },
  {
    slug: "financial-services",
    name: "Financial Services",
    niftyIndex: "Nifty Financial Services",
    description: "NBFCs, asset managers, insurers, holding companies, capital markets.",
    longDescription:
      "Beyond banking, India's financial services sector encompasses a vast ecosystem — consumer lending NBFCs (Bajaj Finance), life and general insurance, asset management (Nifty ETFs, mutual funds), and capital markets infra (BSE, CDSL). The sector has benefited enormously from rising household financial savings, the formalization of credit, and the SIP revolution that has channelled ₹20,000+ crore per month into equity mutual funds.",
    themes: [
      "SIP revolution — ₹20,000+ crore monthly MF inflows from retail investors",
      "Insurance penetration at 4% of GDP vs 8–10% for developed markets",
      "NBFC credit to MSMEs as banks remain underexposed",
      "Capital markets growth — new demat accounts, IPO boom, F&O volumes",
      "Wealth management boom for affluent India (PMS, AIF, GIFT City)",
    ],
    risks: [
      "RBI tightening NBFC regulations and risk weights on unsecured loans",
      "Market downturn reducing mutual fund AUM and AMC revenues",
      "Credit cycle risks at consumer NBFCs from overleveraged borrowers",
      "Insurance sector losses from natural disasters or pandemic claims",
    ],
    topCompanies: ["bajaj-finance", "bajaj-finserv", "hdfc-amc", "cdsl", "muthoot-finance"],
  },
  {
    slug: "oil-gas",
    name: "Oil & Gas",
    description: "Upstream, downstream, gas transmission, and city gas distribution.",
    longDescription:
      "India imports 85% of its crude oil — the oil & gas sector is strategically critical and politically sensitive. Upstream producers (ONGC) benefit from high crude prices; downstream refiners (BPCL, HPCL, IOCL) suffer when retail fuel prices are capped below cost during elections. City gas distribution (IGL, MGL, Adani Total Gas) is a regulated growth business benefiting from CNG adoption in vehicles and piped gas in homes.",
    themes: [
      "India's energy demand growing 5–7% annually — structural tailwind",
      "City gas distribution: CNG adoption and PNG penetration in cities",
      "LNG import infrastructure expansion (Petronet LNG, Shell)",
      "Upstream E&P investment to reduce import dependence",
      "Refinery capacity expansion to meet growing fuel demand",
    ],
    risks: [
      "Crude price volatility affecting upstream profits and downstream margins",
      "Government price caps on petrol/diesel squeezing OMC margins during elections",
      "EV transition reducing long-term demand for petrol/diesel",
      "Geopolitical risks disrupting crude supply (Middle East conflicts)",
    ],
    topCompanies: ["reliance-industries", "oil-and-natural-gas-corporation", "bharat-petroleum-corporation", "petronet-lng", "gail-india"],
  },
  {
    slug: "infrastructure",
    name: "Infrastructure",
    description: "Engineering, construction, EPC, and capital goods.",
    longDescription:
      "India's infrastructure sector is in the midst of a multi-decade government-driven investment cycle — the National Infrastructure Pipeline (NIP) targets ₹111 lakh crore in projects through 2025. Roads, railways, ports, airports, metro rail, and water are all seeing record government spending. Capital goods companies supply the equipment; EPC companies build the assets. The sector is cyclical but underpinned by sovereign spending rather than private capex.",
    themes: [
      "National Infrastructure Pipeline — ₹111 lakh crore investment target",
      "Record railway capex — Vande Bharat, RRTS, freight corridors",
      "Defence indigenisation under 'Atmanirbhar Bharat' — domestic procurement",
      "Data centre and renewable energy infrastructure buildout",
      "Smart city and urban infrastructure modernisation",
    ],
    risks: [
      "Government budget tightening reducing capex allocations",
      "Order execution delays from land acquisition, regulatory approvals",
      "High debt levels among infrastructure companies",
      "Raw material cost inflation (steel, cement) squeezing margins",
    ],
    topCompanies: ["larsen-toubro", "adani-enterprises", "bharat-electronics", "siemens", "adani-ports-and-sez"],
  },
  {
    slug: "power",
    name: "Power & Utilities",
    description: "Generation, transmission, distribution, and renewable energy.",
    longDescription:
      "India targets 500 GW renewable energy capacity by 2030 — from solar, wind, hydro, and storage. The power sector is both a structural growth story and a turnaround story: decades of under-investment in generation and distribution are being addressed by government reforms. Transmission is a regulated business with near-guaranteed returns. Power generators are benefiting from rising merchant power prices and long-term PPAs with government distribution companies.",
    themes: [
      "500 GW renewable energy target by 2030 — massive capex opportunity",
      "Green hydrogen — India as potential global hub",
      "Storage mandate driving battery storage projects",
      "Power distribution privatisation improving efficiency",
      "Nuclear energy expansion via SMRs and large plants",
    ],
    risks: [
      "Discom (distribution company) financial health and payment delays",
      "Intermittency of solar/wind requiring backup thermal capacity",
      "Land acquisition challenges for large renewable projects",
      "Regulatory risk in regulated transmission and distribution returns",
    ],
    topCompanies: ["ntpc", "power-grid-corporation-of-india", "tata-power-company", "adani-power", "torrent-power"],
  },
  {
    slug: "telecom",
    name: "Telecom",
    description: "Mobile operators, fibre, enterprise connectivity.",
    longDescription:
      "India's telecom sector went through consolidation from 12+ operators to 3 in 2016–2019 after Jio's entry. Today Jio (Reliance), Airtel, and Vi compete for 1.15 billion subscribers. Average revenue per user (ARPU) in India is one of the lowest globally at ₹180–200, but rising tariff hikes are improving sector profitability. 5G rollout is underway; Airtel and Jio have both launched 5G across 500+ cities.",
    themes: [
      "ARPU improvement through periodic tariff hikes — monetising the user base",
      "5G monetisation — enterprise connectivity, IoT, fixed wireless access",
      "Airtel enterprise business growing at 20%+ (connectivity, cloud, security)",
      "Jio Platforms — super-app ecosystem leveraging 500M subscribers",
      "Fibre home broadband penetration (JioFiber, Airtel Xstream)",
    ],
    risks: [
      "Vi (Vodafone Idea) viability risk — potential for 2-player market",
      "5G investment not yet monetised — high capex burden",
      "Spectrum auction prices remaining elevated",
      "Regulation on floor tariffs limiting pricing power",
    ],
    topCompanies: ["bharti-airtel", "indus-towers", "vodafone-idea"],
  },
  {
    slug: "cement",
    name: "Cement",
    description: "Cement manufacturers — proxy for infrastructure and real estate.",
    longDescription:
      "Cement demand in India tracks construction activity — infrastructure government spending, real estate, and industrial projects. India's per-capita cement consumption (~250 kg/year) is still well below China (~1,700 kg) and the global average (~550 kg), suggesting significant room for growth. The sector is consolidating: UltraTech, Adani (Ambuja + ACC), and Shree now control ~60% of capacity. Input costs — coal and petcoke for energy, limestone — determine margins.",
    themes: [
      "Government housing schemes (PM Awas Yojana) driving mass-market demand",
      "Infrastructure capex — roads, railways, airports — needs massive cement",
      "Sector consolidation improving pricing discipline",
      "Green cement (blended, low-carbon) — regulatory push for sustainability",
      "Capacity expansion to meet India's 400+ MTPA target by 2030",
    ],
    risks: [
      "Coal/petcoke price spikes compressing margins",
      "Regional overcapacity leading to price wars",
      "Real estate slowdown reducing demand",
      "High debt levels at some companies after capacity expansion",
    ],
    topCompanies: ["ultratech-cement", "ambuja-cements", "acc", "shree-cement", "dalmia-bharat"],
  },
  {
    slug: "retail",
    name: "Retail",
    description: "Organised retail, supermarkets, fashion, and consumer durables.",
    longDescription:
      "India's organised retail penetration (~12% of total retail) is among the lowest in the world, creating a massive long-term opportunity. D-Mart (Avenue Supermarts) pioneered the hypermarket model; Reliance Retail (unlisted) is now India's largest retailer. E-commerce through Flipkart and Meesho is disrupting traditional formats, while quick commerce (Blinkit, Swiggy Instamart, Zepto) is redefining grocery retail in top cities.",
    themes: [
      "Organised retail share gain from kirana (unorganised) sector",
      "Quick commerce disrupting grocery — 10-minute delivery in top 50 cities",
      "Premiumisation in fashion — Zudio, Westside growing in mid-premium",
      "Rural retail expansion — tier-3 and 4 cities underserved",
      "Private label margins boosting profitability for organised retailers",
    ],
    risks: [
      "E-commerce and quick commerce eroding footfall in physical stores",
      "Thin retail margins amplified by rising real estate rentals",
      "Inventory risk in fashion and apparel on demand mismatch",
      "Competition from Reliance Retail (unlisted, massive scale)",
    ],
    topCompanies: ["avenue-supermarts", "titan-company", "trent", "info-edge-india", "zomato"],
  },
  {
    slug: "metals",
    name: "Metals & Mining",
    description: "Steel, aluminium, copper, zinc, and iron ore producers.",
    longDescription:
      "India's metals sector is dominated by steel (Tata Steel, JSW Steel), aluminium (Hindalco, NALCO), and zinc (Hindustan Zinc, a Vedanta subsidiary). Metals are highly cyclical — profitability tracks global commodity prices, China's steel output, and domestic infrastructure demand. India's steel consumption is expected to nearly double to 200 MTPA by 2030, driven by construction, railways, and manufacturing capex.",
    themes: [
      "India's steel consumption doubling by 2030 on infra buildout",
      "China's green steel regulations reducing exports — benefiting Indian prices",
      "Aluminium demand boom from EVs and renewable energy infrastructure",
      "Copper demand surge from EV charging infra and power cables",
      "Scrap-based steel (EAF) growth as green steel mandate increases",
    ],
    risks: [
      "China dumping steel and aluminium at below-cost prices",
      "Global recession reducing industrial metals demand",
      "Coal and iron ore input cost spikes compressing margins",
      "Currency depreciation increasing imported raw material costs",
    ],
    topCompanies: ["tata-steel", "jswsteel", "hindalco-industries", "vedanta", "steel-authority-of-india"],
  },
  {
    slug: "consumer-services",
    name: "Consumer Services",
    description: "Hospitals, hotels, travel, dining, and consumer-facing service companies.",
    longDescription:
      "India's consumer services sector spans healthcare (Apollo Hospitals, Max Healthcare), hospitality (Indian Hotels, EIH), travel (InterGlobe/IndiGo, Thomas Cook), and food services. The sector benefits from India's rising middle class, discretionary spending growth, and the shift from unorganised to organised service providers. Healthcare is a particularly strong structural story — India's hospital beds per 1,000 people (~1.3) is far below the global average (2.7).",
    themes: [
      "Healthcare capacity expansion — hospital beds, diagnostics, insurance",
      "Medical tourism — India as global destination for affordable quality care",
      "Organised hospitality gaining share from unbranded hotels",
      "Air travel democratisation — India to be third-largest aviation market by 2030",
      "Quick service restaurants (QSR) penetration in tier-2/3 cities",
    ],
    risks: [
      "Regulatory price caps on healthcare procedures and medicines",
      "Aviation fuel cost volatility compressing airline margins",
      "Tourism affected by geopolitical events or global health crises",
      "Real estate costs for hospitality and retail properties",
    ],
    topCompanies: ["apollo-hospitals-enterprise", "max-healthcare", "interglobe-aviation", "info-edge-india"],
  },
];

export function getSectorBySlug(slug: string) {
  return sectors.find((s) => s.slug === slug);
}
