import { Sparkles } from "lucide-react";

interface HeadlineRef {
  title: string;
  link: string;
  source: string;
}

interface Props {
  brief: string;
  headlines: HeadlineRef[];
  generatedAt: Date;
}

function timeAgo(d: Date): string {
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function MarketBriefCard({ brief, headlines, generatedAt }: Props) {
  return (
    <div className="card bg-gradient-to-br from-indigo-50 to-white border-indigo-100 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-indigo-600" />
        <h2 className="text-sm font-semibold text-indigo-900">Market Brief</h2>
        <span className="text-[11px] text-gray-400 ml-auto">{timeAgo(generatedAt)}</span>
      </div>
      <p className="text-sm text-gray-800 leading-relaxed mb-3">{brief}</p>
      {headlines.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 border-t border-indigo-100/70">
          {headlines.slice(0, 5).map((h) => (
            <a
              key={h.link}
              href={h.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-indigo-600 hover:text-indigo-800 hover:underline truncate max-w-[220px]"
              title={h.title}
            >
              {h.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
