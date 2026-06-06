"use client";
import dynamic from "next/dynamic";

export const GmpChart = dynamic(
  () => import("./GmpChart").then((m) => m.GmpChart),
  { ssr: false, loading: () => <div className="animate-pulse bg-gray-100 rounded h-64" /> }
);
