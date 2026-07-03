"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MonitoringState, type MonitoringState as MonitoringStateType } from "@/types";
import { useCamera, type UseCameraResult } from "@/hooks/useCamera";
import { usePoseDetection, type UsePoseDetectionResult } from "@/hooks/usePoseDetection";
import { useFallDetection, type UseFallDetectionResult } from "@/hooks/useFallDetection";
import { useCountdown, type UseCountdownResult } from "@/hooks/useCountdown";
import { useAlertPipeline, type UseAlertPipelineResult } from "@/hooks/useAlertPipeline";
import { captureSnapshot } from "@/lib/snapshot";
import { checkBrightness, getFrameImageData } from "@/lib/brightness";
import { storeEvent } from "@/lib/idb";
import { COOLDOWN_SECONDS } from "@/config/fallguard";
import { info, warn, error as logError } from "@/lib/logger";
import { v4 as uuidv4 } from "uuid";

export interface SentinelMonitorResult {
  state: MonitoringStateType;
  camera: UseCameraResult;
  poseDetection: UsePoseDetectionResult;
  fallDetection: UseFallDetectionResult;
  countdown: UseCountdownResult;
  alertPipeline: UseAlertPipelineResult;
  error: string | null;
}

export function useSentinelMonitor(
  deviceId: string,
  secret: string,
  deviceName: string,
  language: "en" | "ta",
  fallbackLocation: { lat: number; lng: number; address: string }
): SentinelMonitorResult {
  const [state, setState] = useState<MonitoringStateType>(MonitoringState.IDLE);
  const [monitorError, setMonitorError] = useState<string | null>(null);
  const stateRef = useRef<MonitoringStateType>(MonitoringState.IDLE);
  const cooldownTimerRef = useRef<number | null>(null);
  const verifyingRetryRef = useRef(0);
  const brightnessWarnedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const camera = useCamera();
  const poseDetection = usePoseDetection(camera.stream);
  const fallDetection = useFallDetection(poseDetection.keypoints);
  const countdown = useCountdown(language);
  const alertPipeline = useAlertPipeline(deviceId, secret, fallbackLocation);

  const updateState = useCallback((newState: MonitoringStateType) => {
    stateRef.current = newState;
    setState(newState);
  }, []);

  const enterCooldown = useCallback(() => {
    updateState(MonitoringState.COOLDOWN);
    brightnessWarnedRef.current = false;
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    cooldownTimerRef.current = window.setTimeout(() => {
      updateState(MonitoringState.MONITORING);
      info("Cooldown expired, resuming monitoring");
    }, COOLDOWN_SECONDS * 1000);
  }, [updateState]);

  useEffect(() => {
    camera.start().then(() => {
      if (camera.error) {
        updateState(MonitoringState.ERROR);
        setMonitorError(camera.error);
        return;
      }
      updateState(MonitoringState.CAMERA_STARTING);
      info("Camera started, entering CAMERA_STARTING");
    });

    return () => {
      camera.stop();
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (camera.stream) {
      streamRef.current = camera.stream;
      const videoEl = document.querySelector("video");
      if (videoEl) videoRef.current = videoEl as HTMLVideoElement;
    }
  }, [camera.stream]);

  useEffect(() => {
    if (state === MonitoringState.CAMERA_STARTING && poseDetection.isReady) {
      updateState(MonitoringState.WARMING_UP);
    }
    if (state === MonitoringState.WARMING_UP && poseDetection.isReady) {
      setTimeout(() => {
        updateState(MonitoringState.MONITORING);
        info("Monitoring started");
      }, 500);
    }
  }, [state, poseDetection.isReady, updateState]);

  useEffect(() => {
    if (state !== MonitoringState.MONITORING) return;
    if (camera.error) {
      updateState(MonitoringState.ERROR);
      setMonitorError(camera.error);
      return;
    }

    const video = videoRef.current;
    if (video) {
      const imageData = getFrameImageData(video);
      if (imageData) {
        const brightness = checkBrightness(imageData);
        if (brightness.isDim && !brightnessWarnedRef.current) {
          brightnessWarnedRef.current = true;
          const msg = language === "ta"
            ? "கேமரா பகுதி மிகவும் இருட்டாக உள்ளது. சாதனத்தை பிரகாசமான இடத்திற்கு நகர்த்தவும்."
            : "Camera area is too dark. Please move the device to a brighter area.";
          if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(msg);
            utterance.lang = language === "ta" ? "ta-IN" : "en-IN";
            window.speechSynthesis.speak(utterance);
          }
        }
        if (!brightness.isDim) {
          brightnessWarnedRef.current = false;
        }
      }
    }
  }, [state, camera.error, updateState, language]);

  const logFallEvent = useCallback(
    async (eventData: { classification: string; alertSent: boolean; cancelled: boolean; smsStatus?: string; whatsappStatus?: string }) => {
      const event = {
        eventId: uuidv4(),
        deviceId,
        timestamp: new Date(),
        snapshotUrl: "",
        heuristicTriggered: true,
        geminiClassification: eventData.classification,
        cancelled: eventData.cancelled,
        alertSent: eventData.alertSent,
        smsStatus: eventData.smsStatus || "pending",
        whatsappStatus: eventData.whatsappStatus || "pending",
        gpsLocation: fallbackLocation,
        retryCount: 0,
      };

      await storeEvent(event);

      try {
        await fetch("/api/v1/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            deviceId,
            "x-device-secret": secret,
          },
          body: JSON.stringify(event),
        });
      } catch {
        // stored locally in IndexedDB already
      }
    },
    [deviceId, secret, fallbackLocation]
  );

  const verifyFall = useCallback(
    async (snapshotBase64: string, isRetry = false) => {
      try {
        const res = await fetch("/api/v1/vision", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            deviceId,
            "x-device-secret": secret,
          },
          body: JSON.stringify({ snapshotBase64, deviceId }),
        });

        const data = await res.json();
        const classification = data.classification || "UNKNOWN";

        if (classification === "FALLEN") {
          info("Gemini confirmed FALLEN, entering COUNTDOWN");
          updateState(MonitoringState.COUNTDOWN);
          countdown.start();
        } else {
          info("Gemini classification: not FALLEN", { classification });
          await logFallEvent({ classification, alertSent: false, cancelled: false });
          updateState(MonitoringState.MONITORING);
        }
      } catch (err) {
        warn("Vision API call failed", { error: String(err), isRetry });
        if (!isRetry && verifyingRetryRef.current < 1) {
          verifyingRetryRef.current++;
          await new Promise((r) => setTimeout(r, 2000));
          await verifyFall(snapshotBase64, true);
        } else {
          await logFallEvent({ classification: "UNKNOWN", alertSent: false, cancelled: false });
          updateState(MonitoringState.MONITORING);
        }
      }
    },
    [deviceId, secret, updateState, countdown, logFallEvent]
  );

  useEffect(() => {
    if (stateRef.current !== MonitoringState.MONITORING) return;
    if (!fallDetection.possibleFall) return;

    updateState(MonitoringState.POSSIBLE_FALL);
    info("Possible fall detected by heuristics", { confidence: fallDetection.confidence });

    const video = videoRef.current;
    if (!video) {
      warn("No video element found for snapshot");
      updateState(MonitoringState.MONITORING);
      return;
    }

    captureSnapshot(video)
      .then((snapshotBase64) => {
        updateState(MonitoringState.VERIFYING);
        verifyingRetryRef.current = 0;
        verifyFall(snapshotBase64);
      })
      .catch((err) => {
        logError("Snapshot capture failed", { error: String(err) });
        updateState(MonitoringState.MONITORING);
      });
  }, [fallDetection.possibleFall, updateState, verifyFall]);

  const logFallEventRef = useRef(logFallEvent);
  logFallEventRef.current = logFallEvent;

  useEffect(() => {
    if (state !== MonitoringState.COUNTDOWN) return;
    if (countdown.secondsLeft === 0 && !countdown.isCancelled) {
      updateState(MonitoringState.DISPATCHING);
      info("Countdown expired, starting alert dispatch");
      const locationStr = `${fallbackLocation.address || "Unknown"} (${fallbackLocation.lat}, ${fallbackLocation.lng})`;
      alertPipeline.dispatch(deviceName, locationStr, language).then(() => {
        logFallEventRef.current({
          classification: "FALLEN",
          alertSent: alertPipeline.status !== "failed",
          cancelled: false,
          smsStatus: alertPipeline.status === "sent" ? "sent" : "failed",
          whatsappStatus: alertPipeline.status === "sent" ? "sent" : "failed",
        });
        updateState(MonitoringState.SUCCESS);
        enterCooldown();
      });
    }
  }, [state, countdown.secondsLeft, countdown.isCancelled, updateState, alertPipeline, deviceName, language, fallbackLocation, enterCooldown]);

  useEffect(() => {
    if (state !== MonitoringState.COUNTDOWN) return;
    if (countdown.isCancelled) {
      info("Countdown cancelled by user");
      logFallEventRef.current({ classification: "FALLEN", alertSent: false, cancelled: true });
      enterCooldown();
    }
  }, [state, countdown.isCancelled, enterCooldown]);

  useEffect(() => {
    if (camera.error) {
      updateState(MonitoringState.ERROR);
      setMonitorError(camera.error);
    }
  }, [camera.error, updateState]);

  return {
    state,
    camera,
    poseDetection,
    fallDetection,
    countdown,
    alertPipeline,
    error: monitorError,
  };
}