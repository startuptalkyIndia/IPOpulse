/**
 * Sparkline — tiny inline SVG price-trend chart.
 * Server-renderable, zero JS, ~700 bytes per instance.
 *
 * Use in tables to give an instant visual cue of price trend without
 * navigating to the detail page.
 *
 * Usage:
 *   <Sparkline values={[100, 102, 99, 105, 110]} />
 *   <Sparkline values={prices} width={80} height={24} positive={prices.at(-1) > prices[0]} />
 */

interface Props {
  values: number[];        // chronological prices, oldest first
  width?: number;          // default 80
  height?: number;         // default 24
  positive?: boolean;      // override color; otherwise inferred from first vs last
  strokeWidth?: number;    // default 1.5
  showFill?: boolean;      // gradient fill under the line, default true
}

export function Sparkline({
  values,
  width = 80,
  height = 24,
  positive,
  strokeWidth = 1.5,
  showFill = true,
}: Props) {
  if (!values || values.length < 2) {
    return (
      <svg width={width} height={height} className="inline-block opacity-30">
        <line x1={0} y1={height / 2} x2={width} y2={height / 2}
          stroke="currentColor" strokeWidth={1} strokeDasharray="2,2" />
      </svg>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);

  // Convert values to SVG coordinates (Y is inverted: SVG y=0 is top)
  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * height;
    return { x, y };
  });

  // Determine color: positive = green, negative = red
  const isPositive = positive ?? (values[values.length - 1] >= values[0]);
  const stroke = isPositive ? "#10b981" : "#ef4444";
  const fillId = `spark-fill-${isPositive ? "g" : "r"}`;

  // Build path strings
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg width={width} height={height} className="inline-block" preserveAspectRatio="none">
      {showFill && (
        <>
          <defs>
            <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${fillId})`} />
        </>
      )}
      <path d={linePath} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
