import {
  getPendingAlerts,
  getPendingEvents,
  removeAlert,
  removeEvent,
} from "@/lib/idb";
import { info, error as logError } from "@/lib/logger";

export async function syncPendingData(deviceId: string, secret: string): Promise<void> {
  const alerts = await getPendingAlerts();
  for (const alert of alerts) {
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
        info("Synced queued alert from IndexedDB", { alertId: alert.id });
      }
    } catch (err) {
      logError("Sync-bridge alert sync failed", { error: String(err) });
    }
  }

  const events = await getPendingEvents();
  for (const event of events) {
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
        info("Synced pending event from IndexedDB", { eventId: event.eventId });
      }
    } catch (err) {
      logError("Sync-bridge event sync failed", { error: String(err) });
    }
  }
}