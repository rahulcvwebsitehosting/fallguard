"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white px-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        <h1 className="text-5xl font-black text-green-700 tracking-tight">FallGuard</h1>
        <p className="text-lg text-gray-600">
          Elderly fall detection &amp; auto emergency response.
          Uses any old Android phone as a passive safety monitor.
        </p>
        <div className="flex flex-col gap-3 w-full mt-4">
          <Link
            href="/setup"
            className="w-full rounded-lg bg-green-600 py-4 text-center text-lg font-bold text-white hover:bg-green-700 transition-colors"
          >
            Setup New Device
          </Link>
          <Link
            href="/sentinel?deviceId=demo&secret=demo&name=Home&lang=en"
            className="w-full rounded-lg border-2 border-green-600 py-4 text-center text-lg font-bold text-green-700 hover:bg-green-50 transition-colors"
          >
            Sentinel Mode (Demo)
          </Link>
          <Link
            href="/dashboard"
            className="w-full rounded-lg border-2 border-gray-300 py-3 text-center text-base font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Family Dashboard
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-8">
          Camera feed stays on-device. No video is stored or streamed.
        </p>
      </div>
    </div>
  );
}