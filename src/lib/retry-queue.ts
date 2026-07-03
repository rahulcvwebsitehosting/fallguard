import {
  storeAlert,
  getPendingAlerts,
  removeAlert,
} from "@/lib/idb";
import { RETRY_INTERVAL_MS, MAX_RETRIES } from "@/config/fallguard";
import { info, warn, error as logError } from "@/lib/logger";

let retryIntervalId: number | null = null;

export function startRetryQueue(deviceId: string, secret: string): void {
  if (retryIntervalId) return;

  retryIntervalId = window.setInterval(async () => {
    const alerts = await getPendingAlerts();
    if (!alerts.length) return;

    for (const alert of alerts) {
      const retryCount = (alert.retryCount as number) || 0;
      if (retryCount >= MAX_RETRIES) {
        await removeAlert(alert.id as string);
        warn("Alert retry exhausted", { alertId: alert.id, retryCount });
        continue;
      }

      try {
        const res = await fetch("/api/v1/alerts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            deviceId,
            "x-device-secret": secret,
          },
          body: JSON.stringify({
            ...alert,
            retryCount: retryCount + 1,
          }),
        });
        if (res.ok) {
          await removeAlert(alert.id as string);
          info("Retried alert sent successfully", { alertId: alert.id });
        } else {
          await storeAlert({ ...alert, retryCount: retryCount + 1 });
        }
      } catch (err) {
        logError("Retry attempt failed", { alertId: alert.id, error: String(err) });
        await storeAlert({ ...alert, retryCount: retryCount + 1 });
      }
    }
  }, RETRY_INTERVAL_MS);
}

export function stopRetryQueue(): void {
  if (retryIntervalId) {
    clearInterval(retryIntervalId);
    retryIntervalId = null;
  }
}