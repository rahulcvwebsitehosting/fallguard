"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import PoseOverlay from "@/components/sentinel/PoseOverlay";
import StatusDot from "@/components/sentinel/StatusDot";
import CountdownOverlay from "@/components/sentinel/CountdownOverlay";
import AlertBanner from "@/components/sentinel/AlertBanner";
import { useSentinelMonitor } from "@/hooks/useSentinelMonitor";
import { MonitoringState } from "@/types";
import { info } from "@/lib/logger";

export default function SentinelContent() {
  const searchParams = useSearchParams();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    info("Sentinel page loaded");
  }, []);

  const deviceId = searchParams.get("deviceId") || "demo-device";
  const secret = searchParams.get("secret") || "";
  const deviceName = searchParams.get("name") || "Home";
  const language = (searchParams.get("lang") === "ta" ? "ta" : "en") as "en" | "ta";
  const isDemo = deviceId === "demo-device" || secret === "" || secret === "demo";
  const [showDemoInfo, setShowDemoInfo] = useState(true);

  const monitor = useSentinelMonitor(
    deviceId,
    secret,
    deviceName,
    language,
    { lat: 0, lng: 0, address: "" }
  );

  useEffect(() => {
    if (videoRef.current && monitor.camera.stream) {
      videoRef.current.srcObject = monitor.camera.stream;
    }
  }, [monitor.camera.stream]);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Demo mode info overlay */}
      {isDemo && showDemoInfo && (monitor.state === MonitoringState.MONITORING || monitor.state === MonitoringState.IDLE) && (
        <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/90 via-black/70 to-transparent pb-6 pt-16 px-4 pointer-events-none">
          <div className="pointer-events-auto mx-auto max-w-sm rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-900/80 to-teal-900/80 p-4 text-center backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12" y2="16" strokeWidth="3" />
              </svg>
              <span className="text-sm font-bold text-yellow-300">Pose Preview</span>
            </div>
            <p className="text-xs text-orange-100 leading-relaxed">
              The <strong className="text-yellow-200">green skeleton</strong> is MoveNet AI tracking your body joints in real time. Everything runs on-device — no video leaves your phone.
            </p>
            <p className="mt-2 text-xs text-orange-200 leading-relaxed">
              <strong className="text-yellow-200">Full detection + SMS alerts</strong> require completing the setup wizard. This preview shows the tracking only.
            </p>
            <div className="mt-3 flex gap-2 justify-center">
              <a
                href="/setup"
                className="inline-block rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-1.5 text-xs font-bold text-white hover:from-orange-700 hover:to-orange-600 transition-all"
              >
                Full Setup
              </a>
              <button
                onClick={() => setShowDemoInfo(false)}
                className="inline-block rounded-lg border border-white/20 px-4 py-1.5 text-xs text-white/70 hover:bg-white/10 transition-all"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      <PoseOverlay
        keypoints={monitor.poseDetection.keypoints}
        visible={monitor.state === MonitoringState.MONITORING}
      />

      <StatusDot state={monitor.state} />

      <AlertBanner state={monitor.state} language={language} />

      <CountdownOverlay
        secondsLeft={monitor.countdown.secondsLeft}
        onCancel={monitor.countdown.cancel}
        language={language}
        visible={monitor.state === MonitoringState.COUNTDOWN}
      />

      {monitor.state === MonitoringState.IDLE && !monitor.camera.error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-t from-black/80 via-black/50 to-transparent">
          <div className="rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-900/80 to-teal-900/80 px-6 py-4 text-center backdrop-blur-sm">
            <div className="mb-2">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <p className="text-lg text-white font-semibold">Starting camera...</p>
            <p className="mt-1 text-xs text-orange-200">FallGuard is initializing</p>
          </div>
        </div>
      )}

      {monitor.state === MonitoringState.ERROR && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-br from-black/90 via-red-950/80 to-black/90">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-red-500/30 bg-gradient-to-br from-red-900/60 to-maroon-900/60 p-6 text-center text-white backdrop-blur-sm">
            <p className="text-xl font-bold text-red-400">Monitoring Error</p>
            <p className="text-sm text-gray-300">{monitor.error || "An error occurred"}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-5 py-2.5 font-bold text-white shadow-lg shadow-orange-900/30 hover:from-orange-700 hover:to-orange-600 transition-all"
            >
              Restart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}