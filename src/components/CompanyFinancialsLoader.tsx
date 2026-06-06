"use client";
import dynamic from "next/dynamic";

export const CompanyFinancials = dynamic(
  () => import("./CompanyFinancials").then((m) => m.CompanyFinancials),
  { ssr: false, loading: () => <div className="animate-pulse bg-gray-100 rounded h-64" /> }
);
