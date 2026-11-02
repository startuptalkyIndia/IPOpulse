import type { CalcResult } from "../types";
import { round } from "./shared";

/* Brokerage — simplified per-broker delivery + intraday -------------- */
export interface BrokerSchedule {
  name: string;
  deliveryPct: number; // % of turnover
  deliveryFlat: number; // min flat per order
  deliveryCap: number; // per-order cap
  intradayPct: number;
  intradayFlat: number;
  intradayCap: number;
}

export const brokerSchedules: BrokerSchedule[] = [
  { name: "Zerodha", deliveryPct: 0, deliveryFlat: 0, deliveryCap: 0, intradayPct: 0.0003, intradayFlat: 20, intradayCap: 20 },
  { name: "Groww", deliveryPct: 0.001, deliveryFlat: 20, deliveryCap: 20, intradayPct: 0.0005, intradayFlat: 20, intradayCap: 20 },
  { name: "Upstox", deliveryPct: 0.00025, deliveryFlat: 20, deliveryCap: 20, intradayPct: 0.0005, intradayFlat: 20, intradayCap: 20 },
  { name: "Angel One", deliveryPct: 0, deliveryFlat: 0, deliveryCap: 0, intradayPct: 0.0003, intradayFlat: 20, intradayCap: 20 },
  { name: "ICICI Direct", deliveryPct: 0.0055, deliveryFlat: 35, deliveryCap: Infinity, intradayPct: 0.00275, intradayFlat: 35, intradayCap: Infinity },
  { name: "HDFC Securities", deliveryPct: 0.005, deliveryFlat: 25, deliveryCap: Infinity, intradayPct: 0.0005, intradayFlat: 25, intradayCap: Infinity },
];

/* F&O Margin — simplified SPAN+Exposure estimate */
export function fnoMarginCalc(i: Record<string, number>): CalcResult {
  const contractValue = i.lotSize * i.price;
  // Typical SPAN margin is 10–15% of contract value for index futures, 20% for stock futures
  const spanPct = i.instrumentType === 0 ? 0.12 : 0.20; // 0=index, 1=stock
  const exposurePct = i.instrumentType === 0 ? 0.03 : 0.05;
  const spanMargin = contractValue * spanPct;
  const exposureMargin = contractValue * exposurePct;
  const total = spanMargin + exposureMargin;
  const leverage = contractValue / total;

  return {
    primary: [
      { label: "Total margin required", value: round(total), format: "currency" },
      { label: "Contract value", value: round(contractValue), format: "currency" },
      { label: "Leverage", value: Number(leverage.toFixed(1)), format: "plain" },
    ],
    secondary: [
      { label: "SPAN margin", value: round(spanMargin), format: "currency" },
      { label: "Exposure margin", value: round(exposureMargin), format: "currency" },
    ],
  };
}

export function brokerageCalc(i: Record<string, number>): CalcResult {
  const buyPrice = i.buyPrice;
  const sellPrice = i.sellPrice;
  const qty = i.quantity;
  const isIntraday = !!i.intraday;

  const buyTurnover = buyPrice * qty;
  const sellTurnover = sellPrice * qty;
  const totalTurnover = buyTurnover + sellTurnover;

  const sttRate = isIntraday ? 0.00025 : 0.001; // intraday on sell only; delivery on both
  const stt = isIntraday ? sellTurnover * sttRate : totalTurnover * sttRate;

  const exchangeTxn = totalTurnover * 0.0000297; // NSE
  const sebi = totalTurnover * 0.000001;
  const stampDuty = buyTurnover * (isIntraday ? 0.00003 : 0.00015);

  const perBroker = brokerSchedules.map((b) => {
    const bPct = isIntraday ? b.intradayPct : b.deliveryPct;
    const bFlat = isIntraday ? b.intradayFlat : b.deliveryFlat;
    const bCap = isIntraday ? b.intradayCap : b.deliveryCap;
    const buyBrokerage = Math.min(Math.max(buyTurnover * bPct, bFlat > 0 ? bFlat : 0), bCap);
    const sellBrokerage = Math.min(Math.max(sellTurnover * bPct, bFlat > 0 ? bFlat : 0), bCap);
    const brokerage = (bFlat === 0 && bPct === 0 ? 0 : buyBrokerage + sellBrokerage);
    const gst = (brokerage + exchangeTxn + sebi) * 0.18;
    const totalCost = brokerage + stt + exchangeTxn + sebi + stampDuty + gst;
    const gross = (sellPrice - buyPrice) * qty;
    const net = gross - totalCost;
    return { broker: b.name, brokerage: round(brokerage), totalCost: round(totalCost), netPnl: round(net) };
  });

  const best = perBroker.reduce((a, b) => (b.netPnl > a.netPnl ? b : a));

  return {
    primary: [
      { label: `Best: ${best.broker} net P&L`, value: best.netPnl, format: "currency" },
      { label: `Total charges (${best.broker})`, value: best.totalCost, format: "currency" },
      { label: "Gross P&L", value: round((sellPrice - buyPrice) * qty), format: "currency" },
    ],
    secondary: perBroker.map((p) => ({ label: p.broker, value: p.totalCost, format: "currency" as const })),
  };
}
