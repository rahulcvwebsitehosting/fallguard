"use client";

import { useState, useEffect } from "react";
import { getPendingAlerts, getPendingEvents, removeAlert, removeEvent } from "@/lib/idb";
import { info, error as logError } from "@/lib/logger";

export function useNetworkStatus(deviceId: string, secret: string) {
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isOnline || !deviceId || !secret) return;

    const syncAlerts = async () => {
      const pending = await getPendingAlerts();
      for (const alert of pending) {
        try {
          const res = await fetch("/api/v1/alerts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              deviceId,
              "x-device-secret": secret,
            },
            body: JSON.stringify(alert),
          });
          if (res.ok) {
            await removeAlert(alert.id as string);
            info("Synced queued alert", { alertId: alert.id });
          }
        } catch (err) {
          logError("Failed to sync alert", { error: String(err) });
        }
      }
    };

    const syncEvents = async () => {
      const pending = await getPendingEvents();
      for (const event of pending) {
        try {
          const res = await fetch("/api/v1/events", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              deviceId,
              "x-device-secret": secret,
            },
            body: JSON.stringify(event),
          });
          if (res.ok) {
            await removeEvent(event.eventId as string);
            info("Synced pending event", { eventId: event.eventId });
          }
        } catch (err) {
          logError("Failed to sync event", { error: String(err) });
        }
      }
    };

    syncAlerts();
    syncEvents();
  }, [isOnline, deviceId, secret]);

  return { isOnline };
}