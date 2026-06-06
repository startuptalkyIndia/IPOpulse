"use client";
import dynamic from "next/dynamic";

export const MonthlyIpoChart = dynamic(
  () => import("./MonthlyChart").then((m) => m.MonthlyIpoChart),
  { ssr: false, loading: () => <div className="animate-pulse bg-gray-100 rounded h-64" /> }
);
