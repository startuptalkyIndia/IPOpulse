/**
 * Canonical list of IPO registrars with their allotment-check URLs.
 * Used to power /ipo/allotment and the per-IPO detail page CTA.
 */

export interface Registrar {
  slug: string;
  name: string;
  shortName: string;
  allotmentUrl: string;
  description: string;
  coverage: string; // which IPOs they typically handle
  companyUrl?: string;
}

export const registrars: Registrar[] = [
  {
    slug: "kfintech",
    name: "KFin Technologies Limited",
    shortName: "KFintech",
    allotmentUrl: "https://ris.kfintech.com/ipostatus/",
    description:
      "KFintech (formerly Karvy) is India's largest registrar. Handles roughly 40% of all mainboard IPOs and a large share of SME issues.",
    coverage: "Most large mainboard IPOs — LIC, Tata Tech, Bajaj Housing, Swiggy, Waaree Energies.",
    companyUrl: "https://www.kfintech.com",
  },
  {
    slug: "linkintime",
    name: "Link Intime India (MUFG Intime)",
    shortName: "Link Intime",
    allotmentUrl: "https://linkintime.co.in/initial_offer/public-issues.html",
    description:
      "Link Intime (now MUFG Intime India) is the second-largest registrar. Handles many mainboard IPOs and high-profile SME issues.",
    coverage: "Many mainboard + large SME issues — Ola Electric, FirstCry, Mamata Machinery.",
    companyUrl: "https://linkintime.co.in",
  },
  {
    slug: "bigshare",
    name: "Bigshare Services",
    shortName: "Bigshare",
    allotmentUrl: "https://www.bigshareonline.com/IPO_Status.aspx",
    description:
      "Bigshare handles predominantly SME IPOs and some mainboard issues. Lower-volume specialist.",
    coverage: "Mostly SME IPOs on BSE SME and NSE Emerge.",
    companyUrl: "https://www.bigshareonline.com",
  },
  {
    slug: "cameo",
    name: "Cameo Corporate Services",
    shortName: "Cameo",
    allotmentUrl: "https://ipostatus1.cameoindia.com/",
    description:
      "Chennai-based registrar handling select mainboard and SME IPOs, especially South Indian issuers.",
    coverage: "Selective mainboard + SME, often South Indian companies.",
    companyUrl: "https://www.cameoindia.com",
  },
  {
    slug: "integrated",
    name: "Integrated Registry Management Services",
    shortName: "Integrated",
    allotmentUrl: "https://kosmic.kfintech.com/ipostatus/",
    description:
      "Registrar often used for mid-sized mainboard and SME issues.",
    coverage: "Select mainboard & SME IPOs.",
    companyUrl: "https://www.integratedindia.in",
  },
  {
    slug: "maashitla",
    name: "Maashitla Securities",
    shortName: "Maashitla",
    allotmentUrl: "https://maashitla.com/allotment-status/public-issues",
    description: "Growing SME IPO registrar.",
    coverage: "SME IPOs on BSE SME and NSE Emerge.",
  },
  {
    slug: "skyline",
    name: "Skyline Financial Services",
    shortName: "Skyline",
    allotmentUrl: "https://www.skylinerta.com/ipo.php",
    description: "Registrar for a selection of SME IPOs.",
    coverage: "SME IPOs.",
  },
];

export function matchRegistrar(input: string | null | undefined): Registrar | undefined {
  if (!input) return undefined;
  const lower = input.toLowerCase();
  return registrars.find(
    (r) =>
      lower.includes(r.slug) ||
      lower.includes(r.shortName.toLowerCase()) ||
      lower.includes(r.name.toLowerCase().split(" ")[0]),
  );
}
