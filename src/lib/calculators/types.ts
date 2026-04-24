export type CalcCategory = "investment" | "loan" | "tax" | "retirement" | "trading" | "other";

export interface CalcInput {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  prefix?: string; // "₹"
  suffix?: string; // "%", "yrs", "months"
  format?: "currency" | "percent" | "years" | "months" | "plain";
}

export interface CalcFaq {
  q: string;
  a: string;
}

export interface CalcBreakdownRow {
  year: number;
  invested: number;
  value: number;
  interest: number;
}

export interface CalcResult {
  primary: { label: string; value: number; format: "currency" | "percent" | "plain" }[];
  secondary?: { label: string; value: number; format: "currency" | "percent" | "plain" }[];
  breakdown?: CalcBreakdownRow[];
  donut?: { invested: number; returns: number };
}

export interface CalcMeta {
  slug: string;
  title: string; // "SIP Calculator"
  shortTitle: string; // "SIP"
  heading: string; // "SIP Calculator — plan your monthly mutual fund investment"
  description: string; // <= 160 chars for SEO
  category: CalcCategory;
  iconName: string; // lucide icon import name
  inputs: CalcInput[];
  faq: CalcFaq[];
  related: string[]; // slugs
  overview: string[]; // paragraphs for SEO body copy
  tags?: string[];
}
