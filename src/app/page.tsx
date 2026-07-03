"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ─── Hero Section ─── */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-orange-700 via-orange-600 to-teal-800 px-6 py-20 text-center text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.07)_1px,_transparent_1px)] bg-[length:24px_24px]" />
        <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-yellow-300 via-orange-400 to-transparent" />
        <div className="absolute right-0 top-0 h-full w-1.5 bg-gradient-to-b from-teal-300 via-teal-400 to-transparent" />

        {/* Hero illustration — phone on shelf watching over a person */}
        <div className="relative z-10 mb-8 flex items-end gap-4">
          {/* Person silhouette */}
          <div className="flex flex-col items-center">
            <svg width="80" height="100" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
              <circle cx="30" cy="18" r="12" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
              <path d="M10 72c0-12 8-22 20-22s20 10 20 22" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
              <line x1="30" y1="40" x2="30" y2="55" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
              <line x1="25" y1="48" x2="35" y2="48" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            </svg>
            <span className="mt-1 text-[10px] text-orange-200">Elderly at home</span>
          </div>

          {/* Connecting arc (wifi/signal) */}
          <div className="flex flex-col items-center pb-10">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5">
              <path d="M5 12.5a8 8 0 0 1 14 0" strokeLinecap="round" />
              <path d="M8 15.5a5 5 0 0 1 8 0" strokeLinecap="round" />
              <path d="M11 18.5a2 2 0 0 1 2 0" strokeLinecap="round" />
            </svg>
          </div>

          {/* Phone on stand */}
          <div className="flex flex-col items-center">
            <svg width="50" height="80" viewBox="0 0 40 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
              <rect x="5" y="2" width="30" height="60" rx="4" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
              <circle cx="20" cy="18" r="10" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
              <circle cx="20" cy="18" r="5" fill="rgba(255,255,255,0.3)" />
              <circle cx="20" cy="42" r="3" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
              <rect x="12" y="32" width="16" height="2" rx="1" fill="rgba(255,255,255,0.15)" />
              <rect x="14" y="36" width="12" height="2" rx="1" fill="rgba(255,255,255,0.15)" />
              <line x1="20" y1="2" x2="20" y2="0" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
              <path d="M12 65h16l-3 4H15z" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
            </svg>
            <span className="mt-1 text-[10px] text-orange-200">Old phone → Sentinel</span>
          </div>
        </div>

        <div className="relative z-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 ring-2 ring-teal-300/50 backdrop-blur-sm">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <h1 className="font-heading text-5xl font-black tracking-tight drop-shadow-lg sm:text-6xl">
            FallGuard
          </h1>
          <p className="mt-3 max-w-xl text-base text-orange-100 sm:text-lg">
            <span className="font-heading font-semibold">AI-powered fall detection</span> for elderly loved ones living alone. Turns any old Android phone into a lifesaving monitor.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-orange-200">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-300" />
              No wearable needed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-300" />
              Zero setup after install
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-300" />
              Video stays on-device
            </span>
          </div>
        </div>
      </section>

      {/* ─── CTA Buttons (front) ─── */}
      <section className="bg-[oklch(0.985_0.005_85)] px-6 py-12">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-4 flex items-center justify-center gap-2">
            <span className="block h-0.5 w-6 bg-orange-300" />
            <h2 className="font-heading text-2xl font-bold text-gray-900">Get Started</h2>
            <span className="block h-0.5 w-6 bg-teal-300" />
          </div>
          <p className="text-sm text-gray-500">
            Takes 5 minutes. You just need an old Android phone and a quiet corner of the house.
          </p>

          {/* Stacked buttons with small illustrations inline */}
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/setup"
              className="group relative flex items-center gap-4 overflow-hidden rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 py-4 pl-5 pr-4 text-left text-lg font-bold text-white shadow-md shadow-orange-200 transition-all hover:from-orange-700 hover:to-orange-600 hover:shadow-lg"
            >
              {/* Phone icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0">
                <rect x="5" y="2" width="14" height="20" rx="3" />
                <line x1="12" y1="18" x2="12" y2="18" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <span className="flex-1">Setup a New Device</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-1">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/sentinel?deviceId=demo&secret=demo&name=Home&lang=en"
              className="group relative flex items-center gap-4 overflow-hidden rounded-xl border-2 border-teal-600 bg-white py-4 pl-5 pr-4 text-left text-lg font-bold text-teal-700 shadow-sm transition-all hover:bg-teal-50 hover:shadow-md"
            >
              {/* Camera icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
              <span className="flex-1">Try Sentinel Mode</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-1">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/dashboard"
              className="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-orange-200 py-3.5 pl-5 pr-4 text-left text-base font-medium text-orange-600 transition-all hover:bg-orange-50 hover:border-orange-300"
            >
              {/* Dashboard icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0">
                <rect x="3" y="3" width="7" height="9" rx="1" />
                <rect x="14" y="3" width="7" height="5" rx="1" />
                <rect x="14" y="12" width="7" height="9" rx="1" />
                <rect x="3" y="16" width="7" height="5" rx="1" />
              </svg>
              <span className="flex-1">Family Dashboard (PIN Required)</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-1">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── How it Works (moved below CTA) ─── */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 flex items-center justify-center gap-2">
              <span className="block h-0.5 w-8 bg-orange-300" />
              <h2 className="font-heading text-2xl font-bold text-gray-900">How It Works</h2>
              <span className="block h-0.5 w-8 bg-teal-300" />
            </div>
            <p className="text-sm text-gray-500">
              Three simple steps to protect your loved one
            </p>
          </div>

          {/* Step illustration — phone journey */}
          <div className="mb-8 flex items-center justify-center gap-2 text-xs text-gray-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="3"/></svg>
            <span>Old Android phone</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8751A" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            <span className="text-orange-700 font-semibold">FallGuard Sentinel</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            <span className="text-teal-700 font-semibold">Peace of mind</span>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="group relative overflow-hidden rounded-xl border border-orange-100 bg-white p-5 text-center transition hover:border-orange-200 hover:shadow-md hover:shadow-orange-100/50">
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-orange-50 transition group-hover:bg-orange-100" />
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-lg font-bold text-white shadow-sm">
                <span>१</span>
              </div>
              <h3 className="font-heading mt-4 font-semibold text-gray-900">Setup</h3>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                Place an old Android phone on a shelf. Complete our 5-step setup wizard &mdash; add emergency contacts and set a language.
              </p>
            </div>
            <div className="group relative overflow-hidden rounded-xl border border-teal-100 bg-white p-5 text-center transition hover:border-teal-200 hover:shadow-md hover:shadow-teal-100/50">
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-teal-50 transition group-hover:bg-teal-100" />
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-lg font-bold text-white shadow-sm">
                <span>२</span>
              </div>
              <h3 className="font-heading mt-4 font-semibold text-gray-900">Monitor</h3>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                The phone watches the room using AI pose detection. If it suspects a fall, it confirms via Gemini before alerting.
              </p>
            </div>
            <div className="group relative overflow-hidden rounded-xl border border-orange-100 bg-white p-5 text-center transition hover:border-orange-200 hover:shadow-md hover:shadow-orange-100/50">
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-orange-50 transition group-hover:bg-orange-100" />
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-lg font-bold text-white shadow-sm">
                <span>३</span>
              </div>
              <h3 className="font-heading mt-4 font-semibold text-gray-900">Alert</h3>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                A 30-second countdown appears. If okay, tap &ldquo;I&rsquo;M OK&rdquo;. Otherwise, SMS and WhatsApp alerts fire to family and hospital.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Why Section ─── */}
      <section className="bg-[oklch(0.985_0.005_85)] px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-0.5 flex-1 bg-gradient-to-r from-orange-400 to-teal-400" />
            <h2 className="font-heading text-2xl font-bold text-gray-900">Why FallGuard?</h2>
            <div className="h-0.5 flex-1 bg-gradient-to-r from-teal-400 to-orange-400" />
          </div>

          {/* Side-by-side illustration + text */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex shrink-0 justify-center sm:w-40">
              <svg width="120" height="140" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Elderly person sitting */}
                <circle cx="40" cy="20" r="14" fill="rgba(232,117,26,0.15)" stroke="rgba(232,117,26,0.4)" strokeWidth="1.5" />
                <path d="M15 80c0-14 12-25 25-25s25 11 25 25" fill="rgba(232,117,26,0.1)" stroke="rgba(232,117,26,0.35)" strokeWidth="1.5" />
                {/* Walking stick */}
                <line x1="50" y1="55" x2="58" y2="80" stroke="rgba(232,117,26,0.5)" strokeWidth="2" strokeLinecap="round" />
                {/* Heart above */}
                <path d="M45 8c0-2 2-4 4-4s4 2 4 4-4 6-4 6-4-4-4-6z" fill="rgba(13,148,136,0.5)" />
                {/* Fall alert arrow */}
                <path d="M30 40 L22 48 L18 42" stroke="rgba(185,28,28,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <div className="space-y-4 rounded-xl border border-orange-100 bg-white p-6 text-base text-gray-600 sm:flex-1">
              <p>
                In India, <strong className="text-orange-700">~3 million elderly</strong> fall at home every year. ~40% cannot get up without help. The &ldquo;golden hour&rdquo; after a fall is critical, but medical alert devices cost <strong className="text-teal-700">₹15,000–₹50,000</strong>.
              </p>
              <p>
                FallGuard uses an old Android phone you already own, requires <strong className="text-orange-700">zero interaction</strong> from the elderly person, and <strong className="text-teal-700">costs nothing</strong> to run.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Privacy Note ─── */}
      <section className="bg-white px-6 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <div className="rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50 to-orange-50/50 p-6">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 className="font-heading text-lg font-bold text-teal-900">Privacy First</h3>
            <p className="mt-2 text-sm text-teal-700">
              All video processing happens on the device. No video is streamed, recorded, or stored in the cloud. Only a single low-resolution snapshot is sent to Gemini during a suspected fall, and it is never saved.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-orange-100 bg-gradient-to-r from-orange-50 to-teal-50 px-6 py-6 text-center text-xs text-gray-500">
        <div className="mx-auto flex max-w-2xl items-center justify-center gap-4">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
          <span className="font-heading font-semibold text-orange-700">FallGuard</span>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-teal-300 to-transparent" />
        </div>
        <p className="mt-2">Built for the India Smart Living Hackathon 2026</p>
      </footer>
    </div>
  );
}