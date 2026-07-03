"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { translations } from "@/lib/i18n";
import type { FallEvent } from "@/types";

interface InsightsPanelProps {
  deviceId: string;
  language: "en" | "ta";
}

export default function InsightsPanel({ deviceId, language }: InsightsPanelProps) {
  const t = translations[language].dashboard;
  const [insights, setInsights] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!deviceId) return;

    const fetchInsights = async () => {
      setLoading(true);
      try {
        const evRes = await fetch(`/api/v1/events?deviceId=${deviceId}`, { cache: "no-store" });
        let logs: FallEvent[] = [];
        if (evRes.ok) {
          const data = await evRes.json();
          logs = Array.isArray(data) ? data : [];
        }

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentLogs = logs.filter((e) => new Date(e.timestamp) > sevenDaysAgo);

        const res = await fetch("/api/v1/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId, logs: recentLogs, language }),
        });
        if (res.ok) {
          const data = await res.json();
          setInsights(data.insights);
        } else {
          setInsights([]);
        }
      } catch {
        setInsights([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [deviceId, language]);

  return (
    <Card className="border-orange-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
          {t.insightsTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-sm text-gray-400">{t.insightsLoading}</p>}
        {!loading && insights === null && (
          <p className="text-sm text-gray-400">{t.insightsLoading}</p>
        )}
        {!loading && insights && insights.length === 0 && (
          <p className="text-sm text-gray-400">{t.insightsEmpty}</p>
        )}
        {!loading && insights && insights.length > 0 && (
          <ul className="space-y-2">
            {insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
                {insight}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}