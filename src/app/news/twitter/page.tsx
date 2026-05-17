import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Top Finance Twitter Accounts India — Investors, Analysts & Market Experts",
  description:
    "Curated list of the best Indian finance Twitter/X accounts to follow — super investors, market analysts, SEBI-registered advisors, and financial educators.",
  alternates: { canonical: "/news/twitter" },
};

interface TwitterAccount {
  handle: string;
  name: string;
  category: string;
  description: string;
  knownFor: string;
  followers?: string;
}

const accounts: TwitterAccount[] = [
  // Super Investors
  { handle: "Nithin0dha", name: "Nithin Kamath", category: "Broker / Investor", description: "Co-founder of Zerodha, India's largest broker. Tweets on markets, regulation, investing philosophy, and Zerodha updates.", knownFor: "Zerodha founder, SEBI regulation takes, retail investor advocacy", followers: "900K+" },
  { handle: "BMTheEquityDesk", name: "Basant Maheshwari", category: "Super Investor", description: "Author of 'The Thoughtful Investor'. Quality-growth investor. Vocal on market levels, stock ideas, and investing mindset.", knownFor: "Page Industries, ICICI Lombard, long-term quality investing", followers: "600K+" },
  { handle: "VijayKedia1", name: "Vijay Kedia", category: "Super Investor", description: "SMILE philosophy investor. Tweets on small/mid-cap opportunities, budget expectations, and occasional market commentary.", knownFor: "Atul Auto, Repro India, contra bets on ignored small-caps", followers: "400K+" },
  { handle: "saurabh_25", name: "Saurabh Mukherjea", category: "Fund Manager", description: "Founder of Marcellus Investment Managers. Pioneer of the 'Coffee Can Portfolio' concept — quality companies held for a decade.", knownFor: "Coffee Can Portfolio, clean accounting companies, Consistent Compounders", followers: "300K+" },
  { handle: "deepakshenoy", name: "Deepak Shenoy", category: "Fund Manager", description: "Founder of Capitalmind. Data-driven macro investor. Excellent long threads on economic policy, RBI moves, and market structure.", knownFor: "Capitalmind PMS, macro analysis, P&L transparency threads", followers: "500K+" },
  { handle: "shyamsek", name: "Shyam Sekhar", category: "Super Investor", description: "iThought Wealth founder. Contrarian value investor. Tamil Nadu-based. Known for unpopular but reasoned market views.", knownFor: "Contrarian calls, pharma/chemical picks, long-term wealth building", followers: "200K+" },
  { handle: "Sanjay__Bakshi", name: "Prof Sanjay Bakshi", category: "Academic / Investor", description: "Visiting faculty at MDI Gurgaon. Pioneer of behavioural finance and value investing in India. Deep research tweets.", knownFor: "Behavioural finance, value investing principles, Berkshire-style analysis", followers: "200K+" },
  { handle: "prashanth_krish", name: "Prashanth Krishnamurthy", category: "Market Analyst", description: "Investment manager and prolific financial educator. Detailed threads on sectors, business models, and stock analysis.", knownFor: "Detailed sector analysis threads, capital allocation concepts", followers: "250K+" },
  { handle: "TheIIPM", name: "Mohnish Pabrai", category: "Super Investor", description: "Pabrai Investment Funds. Buffett disciple. Focused India exposure via Rain Industries, Edelweiss. Long-form thinking.", knownFor: "Cloning great investors, concentrated value bets, Rain Industries India", followers: "150K+" },

  // Market Analysts & Educators
  { handle: "iamrajdeepr", name: "Rajdeep Rajpurohit", category: "Market Educator", description: "Options trader and educator. Popular for simplifying derivatives concepts and real-time market commentary during sessions.", knownFor: "Options strategies, real-time market takes, F&O education", followers: "300K+" },
  { handle: "tradingQnA", name: "TradingQnA (Zerodha)", category: "Platform", description: "Zerodha's official trading knowledge account. Policy updates, platform feature announcements, market structure changes.", knownFor: "SEBI rule changes, platform updates, Zerodha product launches", followers: "200K+" },
  { handle: "FinancialExpress", name: "Financial Express", category: "News", description: "India's leading financial newspaper. Breaking market news, IPO coverage, corporate results, and economic data.", knownFor: "IPO news, corporate announcements, policy coverage", followers: "2M+" },
  { handle: "EconomicTimes", name: "Economic Times", category: "News", description: "India's largest business newspaper. Comprehensive market, corporate, and policy news coverage.", knownFor: "Business news, stock market updates, company news", followers: "8M+" },
  { handle: "MintIndia", name: "Mint", category: "News", description: "HT Media's financial newspaper. Known for quality long-form market stories, IPO coverage, and investment research.", knownFor: "Deep-dive financial journalism, IPO analysis, economy", followers: "3M+" },
  { handle: "BloombergQuint", name: "Bloomberg | Quint", category: "News", description: "Bloomberg's India joint venture. Real-time markets, interviews with fund managers and company management.", knownFor: "Live market coverage, management interviews, global market context", followers: "1.5M+" },

  // Regulatory / Official
  { handle: "NSEIndia", name: "NSE India", category: "Official / Exchange", description: "National Stock Exchange official account. Circuit filters, market holidays, trading halts, listing announcements.", knownFor: "Official NSE announcements, ASM/GSM updates, trading alerts", followers: "1M+" },
  { handle: "BSEIndia", name: "BSE India", category: "Official / Exchange", description: "Bombay Stock Exchange official. IPO listing updates, Sensex announcements, corporate action disclosures.", knownFor: "IPO listing day announcements, BSE official circulars", followers: "800K+" },
  { handle: "SEBI_India", name: "SEBI", category: "Official / Regulator", description: "Securities and Exchange Board of India. Regulatory circulars, investor alerts, enforcement actions, and consultations.", knownFor: "Regulatory changes, F&O reforms, IPO rule updates, investor protection", followers: "500K+" },
  { handle: "RBI", name: "Reserve Bank of India", category: "Official / Regulator", description: "RBI official. Monetary policy decisions, interest rate announcements, banking regulations, and economic publications.", knownFor: "Repo rate decisions, inflation data, NBFC regulations", followers: "1.5M+" },

  // Global Context
  { handle: "bespokeinvest", name: "Bespoke Investment Group", category: "Global Analyst", description: "US market analytics. Indian F&O traders track closely for global market context, especially Fed policy impact on India.", knownFor: "Global market breadth, US data analysis, Fed policy impact", followers: "300K+" },
];

const categories = [...new Set(accounts.map((a) => a.category))];
const categoryColors: Record<string, string> = {
  "Super Investor": "bg-indigo-100 text-indigo-700",
  "Fund Manager": "bg-violet-100 text-violet-700",
  "Market Analyst": "bg-blue-100 text-blue-700",
  "Market Educator": "bg-emerald-100 text-emerald-700",
  "Broker / Investor": "bg-amber-100 text-amber-700",
  "Academic / Investor": "bg-rose-100 text-rose-700",
  "News": "bg-gray-100 text-gray-700",
  "Official / Exchange": "bg-green-100 text-green-700",
  "Official / Regulator": "bg-red-100 text-red-700",
  "Platform": "bg-teal-100 text-teal-700",
  "Global Analyst": "bg-orange-100 text-orange-700",
};

export default function FinancialTwitterPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/news" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to News
      </Link>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3">
          𝕏 Financial Twitter India — {accounts.length} accounts curated
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Financial Twitter India — Who to Follow
        </h1>
        <p className="text-sm text-gray-600 max-w-2xl">
          Curated list of India&apos;s best finance voices on Twitter/X — super investors, fund managers, market analysts, educators, and official accounts. Sorted by category.
        </p>
      </div>

      {/* Category overview */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <span key={cat} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[cat] ?? "bg-gray-100 text-gray-600"}`}>
            {cat} ({accounts.filter((a) => a.category === cat).length})
          </span>
        ))}
      </div>

      {/* Account grid by category */}
      {categories.map((cat) => {
        const catAccounts = accounts.filter((a) => a.category === cat);
        return (
          <section key={cat} className="mb-8">
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${categoryColors[cat] ?? "bg-gray-100 text-gray-600"}`}>
                {cat}
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {catAccounts.map((acc) => (
                <a
                  key={acc.handle}
                  href={`https://twitter.com/${acc.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card hover:border-indigo-300 transition group flex flex-col"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition">
                        {acc.name}
                      </div>
                      <div className="text-xs text-indigo-600 font-mono">@{acc.handle}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-500 transition" />
                      {acc.followers && (
                        <div className="text-[10px] text-gray-400 mt-1">{acc.followers}</div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed flex-1">{acc.description}</p>
                  <div className="mt-2 pt-2 border-t border-gray-50">
                    <span className="text-[10px] text-gray-400">Known for: </span>
                    <span className="text-[10px] text-gray-600">{acc.knownFor}</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        );
      })}

      {/* Disclaimer */}
      <div className="rounded-xl bg-gray-50 border border-gray-200 px-5 py-4 mt-6">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong>Note:</strong> This is a curated educational directory — not endorsement or investment advice. Follower counts are approximate. Always do your own research before acting on any opinion shared on social media. SEBI-registered investment advisors and research analysts are legally required to disclose conflicts of interest.
        </p>
      </div>
    </div>
  );
}
