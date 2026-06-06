"use client";
import dynamic from "next/dynamic";

export const FiiDiiChart = dynamic(
  () => import("./FiiDiiChart").then((m) => m.FiiDiiChart),
  { ssr: false, loading: () => <div className="animate-pulse bg-gray-100 rounded h-64" /> }
);
