"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { translations } from "@/lib/i18n";
import { DASHBOARD_POLL_INTERVAL_MS } from "@/config/fallguard";

import type { FallEvent } from "@/types";

interface StatusCardProps {
  deviceId: string;
  language: "en" | "ta";
}

export default function StatusCard({ deviceId, language }: StatusCardProps) {
  const t = translations[language].dashboard;
  const [latestEvent, setLatestEvent] = useState<FallEvent | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    if (!deviceId) return;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/v1/events?deviceId=${deviceId}&latest=true`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setLatestEvent(data);
          setLastCheck(new Date());
        }
      } catch {
        // polling will retry
      }
    };

    fetchStatus();
    const pollInterval = setInterval(fetchStatus, DASHBOARD_POLL_INTERVAL_MS);
    const nowInterval = setInterval(() => setNow(Date.now()), 60000);
    return () => {
      clearInterval(pollInterval);
      clearInterval(nowInterval);
    };
  }, [deviceId]);

  const isAllClear = !latestEvent || latestEvent.cancelled || (!latestEvent.alertSent && latestEvent.geminiClassification !== "FALLEN");
  const bgColor = isAllClear ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300";
  const textColor = isAllClear ? "text-green-800" : "text-red-800";

  return (
    <Card className={`${bgColor}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${isAllClear ? "bg-green-500 animate-pulse" : "bg-red-500 animate-pulse"}`} />
          <span className={textColor}>
            {isAllClear ? t.statusAllClear : t.statusFallDetected}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {latestEvent && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {new Date(latestEvent.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
            </p>
            <Badge variant={isAllClear ? "secondary" : "destructive"}>
              {latestEvent.geminiClassification}
            </Badge>
            {!isAllClear && (
              <p className="text-sm font-medium text-red-700">
                {t.statusFallDetected}{" "}
                {Math.round((now - new Date(latestEvent.timestamp).getTime()) / 60000)}{" "}
                {t.statusMinutesAgo}
              </p>
            )}
          </div>
        )}
        {!latestEvent && (
          <p className="text-sm text-gray-500">
            {t.statusAllClear} {lastCheck.toLocaleTimeString("en-IN")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}