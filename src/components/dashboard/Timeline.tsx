"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { translations } from "@/lib/i18n";
import { DASHBOARD_POLL_INTERVAL_MS } from "@/config/fallguard";
import type { FallEvent } from "@/types";

interface TimelineProps {
  deviceId: string;
  language: "en" | "ta";
}

const BORDER_COLORS: Record<string, string> = {
  cancelled: "border-l-green-500",
  sent: "border-l-red-500",
  pending: "border-l-gray-400",
};

const LABEL_EN: Record<string, string> = {
  cancelled: "False Alarm",
  sent: "Alert Sent",
  pending: "Pending",
};

const LABEL_TA: Record<string, string> = {
  cancelled: "தவறான எச்சரிக்கை",
  sent: "எச்சரிக்கை அனுப்பப்பட்டது",
  pending: "நிலுவையில்",
};

export default function Timeline({ deviceId, language }: TimelineProps) {
  const t = translations[language].dashboard;
  const [events, setEvents] = useState<FallEvent[]>([]);

  useEffect(() => {
    if (!deviceId) return;

    const fetchEvents = async () => {
      try {
        const res = await fetch(`/api/v1/events?deviceId=${deviceId}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setEvents(Array.isArray(data) ? data : data ? [data] : []);
        }
      } catch {
        // next poll
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, DASHBOARD_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [deviceId]);

  const getOutcome = (event: FallEvent): string => {
    if (event.cancelled) return "cancelled";
    if (event.alertSent) return "sent";
    return "pending";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.timelineTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">{t.noEvents}</p>
        )}
        {events.map((event) => {
          const outcome = getOutcome(event);
          const labels = language === "ta" ? LABEL_TA : LABEL_EN;
          return (
            <div
              key={event.eventId}
              className={`mb-3 border-l-4 ${BORDER_COLORS[outcome] || "border-l-gray-300"} pl-3 py-1`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {new Date(event.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                </span>
                <Badge variant={outcome === "sent" ? "destructive" : outcome === "cancelled" ? "secondary" : "outline"}>
                  {labels[outcome] || outcome}
                </Badge>
              </div>
              <p className="text-sm mt-0.5">
                Gemini: <span className="font-medium">{event.geminiClassification}</span>
              </p>
              {event.alertSent && (
                <p className="text-xs text-gray-400 mt-0.5">
                  SMS: {event.smsStatus} · WhatsApp: {event.whatsappStatus}
                </p>
              )}
            </div>
          );
        })}
        {events.length > 0 && <Separator className="mt-2" />}
      </CardContent>
    </Card>
  );
}