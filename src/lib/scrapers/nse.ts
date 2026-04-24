/**
 * NSE scraper helper — handles Akamai bot-check by priming a cookie-jar with
 * a GET to a seed page first. Returns a configured axios client.
 */

import axios, { type AxiosInstance } from "axios";
import { CookieJar } from "tough-cookie";

const UA =
  process.env.SCRAPER_USER_AGENT ||
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

interface NseClientResult {
  client: AxiosInstance;
  jar: CookieJar;
}

/**
 * Build a session that has the Akamai cookies NSE requires. We prime the jar
 * with a GET to nseindia.com, then a GET to reports-indices (which seems to
 * set the cookies more reliably), and then the caller can make API requests.
 */
export async function buildNseSession(): Promise<NseClientResult> {
  const jar = new CookieJar();
  const client = axios.create({
    timeout: 20000,
    headers: {
      "User-Agent": UA,
      Accept: "*/*",
      "Accept-Language": "en-IN,en;q=0.9",
    },
  });

  // Inject cookie jar via manual request interceptors (axios-cookiejar-support
  // is optional; we manage the jar with a minimal shim).
  client.interceptors.request.use(async (config) => {
    const url = typeof config.url === "string" ? config.url : "";
    const cookies = await jar.getCookieString(url || "https://www.nseindia.com");
    if (cookies && config.headers) {
      config.headers.set("Cookie", cookies);
    }
    return config;
  });

  client.interceptors.response.use(async (response) => {
    const setCookies = response.headers["set-cookie"];
    const requestedUrl = response.config.url ?? "https://www.nseindia.com";
    if (Array.isArray(setCookies)) {
      for (const c of setCookies) {
        try {
          await jar.setCookie(c, requestedUrl);
        } catch {
          // ignore invalid cookies
        }
      }
    }
    return response;
  });

  // Prime session
  await client.get("https://www.nseindia.com/", {
    headers: { Referer: "https://www.google.com/" },
  });
  await client.get("https://www.nseindia.com/reports-indices", {
    headers: { Referer: "https://www.nseindia.com/" },
  });

  return { client, jar };
}

export interface NseFiiDiiRow {
  category: string;
  date: string;
  buyValue: string;
  sellValue: string;
  netValue: string;
}

/**
 * Fetch today's (or most recent) provisional FII/DII cash numbers from NSE.
 * Returns two rows: one for FII/FPI and one for DII.
 */
export async function fetchNseFiiDii(): Promise<NseFiiDiiRow[]> {
  const { client } = await buildNseSession();
  const { data } = await client.get<NseFiiDiiRow[]>("https://www.nseindia.com/api/fiidiiTradeReact", {
    headers: { Referer: "https://www.nseindia.com/" },
  });
  if (!Array.isArray(data)) return [];
  return data;
}
