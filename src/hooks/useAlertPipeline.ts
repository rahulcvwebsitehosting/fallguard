"use client";

import { useState, useCallback, useRef } from "react";
import { GEO_TIMEOUT_MS } from "@/config/fallguard";
import { storeAlert } from "@/lib/idb";
import { warn, error as logError } from "@/lib/logger";

export interface UseAlertPipelineResult {
  status: "idle" | "dispatching" | "sent" | "failed" | "queued";
  dispatch: (name: string, location: string, language: "en" | "ta", abortSignal?: AbortSignal) => Promise<void>;
}

export function useAlertPipeline(
  deviceId: string,
  secret: string,
  fallbackLocation: { lat: number; lng: number; address: string }
): UseAlertPipelineResult {
  const [status, setStatus] = useState<UseAlertPipelineResult["status"]>("idle");
  const dispatchingRef = useRef(false);

  const getCurrentGPS = useCallback(async (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve) => {
      if (!("geolocation" in navigator)) {
        resolve(fallbackLocation);
        return;
      }
      const timeoutId = setTimeout(() => {
        warn("Geolocation timed out, using fallback");
        resolve(fallbackLocation);
      }, GEO_TIMEOUT_MS);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timeoutId);
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          clearTimeout(timeoutId);
          warn("Geolocation failed, using fallback");
          resolve(fallbackLocation);
        },
        { enableHighAccuracy: true, timeout: GEO_TIMEOUT_MS, maximumAge: 30000 }
      );
    });
  }, [fallbackLocation]);

  const dispatch = useCallback(
    async (name: string, location: string, language: "en" | "ta", abortSignal?: AbortSignal) => {
      if (dispatchingRef.current) return;
      dispatchingRef.current = true;
      setStatus("dispatching");

      try {
        if (abortSignal?.aborted) {
          setStatus("idle");
          dispatchingRef.current = false;
          return;
        }

        const gps = await getCurrentGPS();
        const time = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

        if (abortSignal?.aborted) {
          setStatus("idle");
          dispatchingRef.current = false;
          return;
        }

        const msgRes = await fetch("/api/v1/generate-alert", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            deviceId,
            "x-device-secret": secret,
          },
          body: JSON.stringify({ name, location, time, language }),
          signal: abortSignal,
        });

        let message = "";
        if (msgRes.ok) {
          const msgData = await msgRes.json();
          message = msgData.message;
        } else {
          message = language === "ta"
            ? `${name} ${location}-ல் ${time} மணிக்கு விழுந்திருக்கலாம். உடனடியாக அவசர சேவைகளை அழைக்கவும்.`
            : `${name} may have fallen at ${location} at ${time}. Please call emergency services immediately.`;
        }

        if (abortSignal?.aborted) {
          setStatus("idle");
          dispatchingRef.current = false;
          return;
        }

        const alertRes = await fetch("/api/v1/alerts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            deviceId,
            "x-device-secret": secret,
          },
          body: JSON.stringify({ message, gps, snapshotUrl: "", deviceId }),
          signal: abortSignal,
        });

        if (!alertRes.ok) {
          const alertPayload = {
            id: `${deviceId}_${Date.now()}`,
            deviceId,
            message,
            gps,
            timestamp: new Date().toISOString(),
            retryCount: 0,
          };
          await storeAlert(alertPayload);
          setStatus("queued");
        } else {
          setStatus("sent");
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setStatus("idle");
        } else {
          logError("Alert dispatch failed", { error: String(err) });
          setStatus("failed");
        }
      } finally {
        dispatchingRef.current = false;
      }
    },
    [deviceId, secret, getCurrentGPS]
  );

  return { status, dispatch };
}