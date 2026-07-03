"use client";

import dynamic from "next/dynamic";
import SentinelErrorBoundary from "@/components/sentinel/SentinelErrorBoundary";

const SentinelContent = dynamic(
  () => import("@/components/sentinel/SentinelContent"),
  { ssr: false, loading: () => <SentinelLoading /> }
);

function SentinelLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <p className="text-lg text-white">Loading sentinel...</p>
    </div>
  );
}

export default function SentinelPage() {
  return (
    <SentinelErrorBoundary>
      <SentinelContent />
    </SentinelErrorBoundary>
  );
}