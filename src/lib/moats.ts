/**
 * Economic Moats — curated list of Indian monopoly / duopoly companies.
 * These businesses have structural pricing power that competition can't easily
 * touch, so they earn above-average returns for years.
 *
 * Ported from the Stock Analysis quant system (moats.py). India names only —
 * IPOpulse is India-focused. Factual descriptions, not investment advice.
 *
 * Keyed by NSE symbol (uppercase, no .NS suffix).
 */

export const MOATS: Record<string, string> = {
  IRCTC: "Rail ticketing + catering monopoly (government-backed)",
  IEX: "Power exchange — ~95% market share monopoly",
  CDSL: "Securities depository duopoly (with NSDL)",
  NSDL: "Securities depository duopoly (with CDSL)",
  MCX: "Commodity exchange monopoly",
  BSE: "Stock exchange duopoly (with NSE)",
  CAMS: "Mutual-fund registrar duopoly (~70% share)",
  KFINTECH: "Mutual-fund registrar duopoly (with CAMS)",
  HAL: "Military aircraft monopoly (India)",
  BEL: "Defence electronics near-monopoly",
  COALINDIA: "Coal mining monopoly (~80% of India output)",
  CONCOR: "Container rail logistics — dominant operator",
  IRFC: "Indian Railways financing monopoly",
  PIDILITIND: "Adhesives (Fevicol) near-monopoly",
  ASIANPAINT: "Paints leader (duopoly with Berger)",
  BERGEPAINT: "Paints duopoly (with Asian Paints)",
  NESTLEIND: "Infant nutrition / Maggi — dominant",
  ITC: "Cigarettes near-monopoly (India)",
  PAGEIND: "Jockey / Speedo licensee monopoly (India)",
  PVRINOX: "Multiplex near-monopoly (post-merger)",
  APLAPOLLO: "Structural steel tubes — market leader",
  DMART: "Value retail moat (cost leadership)",
  TITAN: "Branded jewellery / watches leader",
  MARICO: "Hair & edible-oil brands (Parachute) moat",
  BRITANNIA: "Biscuits duopoly (with Parle)",
  UNITDSPR: "Spirits leader (United Spirits)",
  HONAUT: "Industrial automation niche moat",
  CRISIL: "Credit rating leader (India)",
  INDIGO: "Airline cost-leader (~60% domestic share)",
  "BAJAJ-AUTO": "2 & 3-wheeler export leader",
  TRENT: "Retail (Zudio / Westside) fast-mover moat",
};

/** Return the moat description for an NSE symbol, or null if not a flagged moat. */
export function getMoat(nseSymbol: string | null | undefined): string | null {
  if (!nseSymbol) return null;
  return MOATS[nseSymbol.replace(/\.NS$/i, "").toUpperCase()] ?? null;
}
