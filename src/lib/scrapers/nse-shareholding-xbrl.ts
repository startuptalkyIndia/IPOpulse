/**
 * Parser for NSE's shareholding-pattern XBRL filings (the "in-bse-shp"
 * taxonomy — used by both exchanges despite the BSE-branded namespace).
 *
 * Unlike the insider-trading filings (plain HTML), these are genuine
 * dimensional XBRL: each shareholder is a numbered "context" (e.g.
 * `OthersIndianShareholders_Context15`), and their name/PAN/shares/% live in
 * separate `<in-bse-shp:Tag contextRef="...">` fact elements scattered
 * through the document, linked only by that shared contextRef. There is no
 * single "row" element to parse — the facts must be collected by contextRef
 * and re-assembled here.
 *
 * Verified against a real live filing (Titan Company, filed 2026-07-16):
 *   <in-bse-shp:NameOfTheShareholder contextRef="D_XXX">NAME</...>
 *   <in-bse-shp:NumberOfShares contextRef="XXX" ...>N</...>
 *   <in-bse-shp:ShareholdingAsAPercentageOfTotalNumberOfShares contextRef="XXX" ...>P</...>
 * The name's contextRef carries a "D_" prefix the numeric facts don't — that
 * prefix is stripped to match them back together.
 *
 * Regex-based rather than a namespace-aware XML DOM, matching this
 * codebase's existing scraper style (see nse-insider-filing.ts) and avoiding
 * XML-namespace edge cases for a well-behaved, single-vendor-generated file.
 */

export interface ShareholderFact {
  name: string;
  shares: number | null;
  pct: number | null;
}

function stripDPrefix(contextRef: string): string {
  return contextRef.startsWith("D_") ? contextRef.slice(2) : contextRef;
}

function collectByContext(xml: string, tag: string): Map<string, string> {
  const map = new Map<string, string>();
  const re = new RegExp(`<in-bse-shp:${tag} contextRef="([^"]+)"[^>]*>([^<]*)</in-bse-shp:${tag}>`, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    map.set(stripDPrefix(m[1]), m[2].trim());
  }
  return map;
}

/** The filing's overall "as on" date, from the MainI instant context. */
export function parseAsOnDate(xml: string): Date | null {
  const m = xml.match(/<xbrli:context id="MainI">[\s\S]{0,300}?<xbrli:instant>(\d{4}-\d{2}-\d{2})<\/xbrli:instant>/);
  if (!m) return null;
  return new Date(m[1]);
}

export function parseShareholdingXbrl(xml: string): ShareholderFact[] {
  const names = collectByContext(xml, "NameOfTheShareholder");
  const shares = collectByContext(xml, "NumberOfShares");
  const sharesAlt = collectByContext(xml, "NumberOfFullyPaidUpEquityShares");
  const pcts = collectByContext(xml, "ShareholdingAsAPercentageOfTotalNumberOfShares");

  const facts: ShareholderFact[] = [];
  for (const [context, rawName] of names) {
    const name = rawName.trim();
    if (!name) continue;
    const shareStr = shares.get(context) ?? sharesAlt.get(context);
    const pctStr = pcts.get(context);
    facts.push({
      name,
      shares: shareStr ? Number(shareStr) : null,
      pct: pctStr ? Number(pctStr) : null,
    });
  }
  return facts;
}
