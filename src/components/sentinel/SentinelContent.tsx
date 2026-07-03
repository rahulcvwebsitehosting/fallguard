"use client";

import { useEffect } from "react";
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

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {monitor.camera.stream && (
        <video
          autoPlay
          playsInline
          muted
          ref={(el) => {
            if (el && monitor.camera.stream) {
              el.srcObject = monitor.camera.stream;
            }
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />
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
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="rounded-lg bg-black/60 px-6 py-4 text-center">
            <p className="text-lg text-white font-semibold">Starting camera...</p>
          </div>
        </div>
      )}

      {monitor.state === MonitoringState.ERROR && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80">
          <div className="flex flex-col items-center gap-3 p-6 text-center text-white">
            <p className="text-xl font-bold text-red-400">Monitoring Error</p>
            <p className="text-sm text-gray-300">{monitor.error || "An error occurred"}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 rounded-lg bg-green-600 px-4 py-2 font-bold text-white"
            >
              Restart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}