"use client";

import { useEffect, useRef } from "react";
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
            <div className="mb-2 text-2xl">🪔</div>
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