"use client";
import dynamic from "next/dynamic";

export const PriceChart = dynamic(
  () => import("./PriceChart").then((m) => m.PriceChart),
  { ssr: false, loading: () => <div className="animate-pulse bg-gray-100 rounded h-64" /> }
);
