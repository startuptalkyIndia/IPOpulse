"use client";
import dynamic from "next/dynamic";

export const SubscriptionVelocity = dynamic(
  () => import("./SubscriptionVelocity").then((m) => m.SubscriptionVelocity),
  { ssr: false, loading: () => <div className="animate-pulse bg-gray-100 rounded h-64" /> }
);
