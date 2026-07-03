"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-orange-700 via-orange-600 to-teal-800 px-6 py-24 text-center text-white">
        {/* Decorative rangoli dots */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.07)_1px,_transparent_1px)] bg-[length:24px_24px]" />
        {/* Decorative saffron accent lines */}
        <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-yellow-300 via-orange-400 to-transparent" />
        <div className="absolute right-0 top-0 h-full w-1.5 bg-gradient-to-b from-teal-300 via-teal-400 to-transparent" />
        {/* Top decorative diya/kalash motif */}
        <div className="absolute top-4 flex gap-6">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-yellow-300/40"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 ring-2 ring-teal-300/50 backdrop-blur-sm">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <h1 className="font-heading text-6xl font-black tracking-tight drop-shadow-lg">
            FallGuard
          </h1>
          <p className="mt-3 max-w-lg text-lg text-orange-100">
            <span className="font-heading font-semibold">AI-powered fall detection</span> for
            elderly loved ones living alone. Turns any old Android phone into a
            lifesaving monitor.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-orange-200">
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

      {/* Why Section */}
      <section className="section-indian bg-white px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-0.5 flex-1 bg-gradient-to-r from-orange-400 to-teal-400" />
            <h2 className="font-heading text-2xl font-bold text-gray-900">Why FallGuard?</h2>
            <div className="h-0.5 flex-1 bg-gradient-to-r from-teal-400 to-orange-400" />
          </div>
          <div className="mt-6 space-y-4 rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50/50 to-teal-50/30 p-6 text-base text-gray-600">
            <p>
              In India, <strong className="text-orange-700">~3 million elderly people</strong> fall at
              home every year. ~40% cannot get up without help. The &ldquo;golden
              hour&rdquo; after a fall is critical, but medical alert devices cost
              <strong className="text-teal-700"> ₹15,000–₹50,000</strong> and require charging,
              pairing, and tech literacy.
            </p>
            <p>
              FallGuard removes all three barriers. It uses an old Android phone
              you already own, requires <strong className="text-orange-700">zero interaction</strong> from
              the elderly person after setup, and <strong className="text-teal-700">costs nothing</strong> to
              run.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-[oklch(0.985_0.005_85)] px-6 py-16">
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
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="group relative overflow-hidden rounded-xl border border-orange-100 bg-white p-5 text-center transition hover:border-orange-200 hover:shadow-md hover:shadow-orange-100/50">
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-orange-50 transition group-hover:bg-orange-100" />
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-lg font-bold text-white shadow-sm">
                <span>१</span>
              </div>
              <h3 className="font-heading mt-4 font-semibold text-gray-900">Setup</h3>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                Place an old Android phone on a shelf. Complete our 5-step setup wizard &mdash; add
                emergency contacts and set a language.
              </p>
            </div>
            <div className="group relative overflow-hidden rounded-xl border border-teal-100 bg-white p-5 text-center transition hover:border-teal-200 hover:shadow-md hover:shadow-teal-100/50">
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-teal-50 transition group-hover:bg-teal-100" />
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-lg font-bold text-white shadow-sm">
                <span>२</span>
              </div>
              <h3 className="font-heading mt-4 font-semibold text-gray-900">Monitor</h3>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                The phone watches the room using AI pose detection. If it suspects a fall, it
                confirms via Gemini before alerting.
              </p>
            </div>
            <div className="group relative overflow-hidden rounded-xl border border-orange-100 bg-white p-5 text-center transition hover:border-orange-200 hover:shadow-md hover:shadow-orange-100/50">
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-orange-50 transition group-hover:bg-orange-100" />
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-lg font-bold text-white shadow-sm">
                <span>३</span>
              </div>
              <h3 className="font-heading mt-4 font-semibold text-gray-900">Alert</h3>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                A 30-second countdown appears. If okay, tap &ldquo;I&rsquo;M OK&rdquo;. Otherwise, SMS and
                WhatsApp alerts fire to family and hospital.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Note */}
      <section className="bg-white px-6 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <div className="rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50 to-orange-50/50 p-6">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
              <span className="text-teal-700 text-lg">🔒</span>
            </div>
            <h3 className="font-heading text-lg font-bold text-teal-900">Privacy First</h3>
            <p className="mt-2 text-sm text-teal-700">
              All video processing happens on the device. No video is streamed, recorded, or stored
              in the cloud. Only a single low-resolution snapshot is sent to Gemini during a
              suspected fall, and it is never saved.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[oklch(0.985_0.005_85)] px-6 py-16">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-4 flex items-center justify-center gap-2">
            <span className="block h-0.5 w-6 bg-orange-300" />
            <h2 className="font-heading text-2xl font-bold text-gray-900">Get Started</h2>
            <span className="block h-0.5 w-6 bg-teal-300" />
          </div>
          <p className="text-sm text-gray-500">
            Takes 5 minutes. You just need an old Android phone and a quiet corner of the house.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/setup"
              className="rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 py-4 text-center text-lg font-bold text-white shadow-md shadow-orange-200 transition-all hover:from-orange-700 hover:to-orange-600 hover:shadow-lg"
            >
              Setup a New Device
            </Link>
            <Link
              href="/sentinel?deviceId=demo&secret=demo&name=Home&lang=en"
              className="rounded-xl border-2 border-teal-600 bg-white py-4 text-center text-lg font-bold text-teal-700 shadow-sm transition-all hover:bg-teal-50 hover:shadow-md"
            >
              Try Sentinel Mode
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-orange-200 py-3 text-center text-base font-medium text-orange-600 transition-all hover:bg-orange-50 hover:border-orange-300"
            >
              Family Dashboard (PIN Required)
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
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