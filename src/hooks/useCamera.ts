"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { warn } from "@/lib/logger";

export interface UseCameraResult {
  stream: MediaStream | null;
  error: string | null;
  isActive: boolean;
  start: () => Promise<void>;
  stop: () => void;
}

export function useCamera(): UseCameraResult {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const releaseWakeLock = useCallback(async () => {
    try {
      await wakeLockRef.current?.release();
      wakeLockRef.current = null;
    } catch {
      // wake lock may already be released
    }
  }, []);

  const acquireWakeLock = useCallback(async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
        wakeLockRef.current.addEventListener("release", () => {
          wakeLockRef.current = null;
        });
      } else {
        warn("Wake Lock API not available on this browser");
      }
    } catch {
      warn("Failed to acquire Wake Lock");
    }
  }, []);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    setIsActive(false);
    releaseWakeLock();
  }, [releaseWakeLock]);

  const start = useCallback(async () => {
    try {
      stop();
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setIsActive(true);
      setError(null);
      await acquireWakeLock();

      mediaStream.getVideoTracks()[0].addEventListener("ended", () => {
        warn("Camera stream ended unexpectedly");
        setIsActive(false);
      });
    } catch (err) {
      const msg = err instanceof DOMException
        ? err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access in browser settings."
          : err.name === "NotFoundError"
            ? "No camera found on this device."
            : `Camera error: ${err.message}`
        : "Failed to start camera.";
      setError(msg);
      setIsActive(false);
    }
  }, [stop, acquireWakeLock]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && streamRef.current) {
        acquireWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      stop();
    };
  }, [stop, acquireWakeLock]);

  return { stream, error, isActive, start, stop };
}