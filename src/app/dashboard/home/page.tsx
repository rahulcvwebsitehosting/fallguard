"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import StatusCard from "@/components/dashboard/StatusCard";
import Timeline from "@/components/dashboard/Timeline";
import InsightsPanel from "@/components/dashboard/InsightsPanel";
import SettingsDrawer from "@/components/dashboard/SettingsDrawer";
import EmergencyCall from "@/components/dashboard/EmergencyCall";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { translations } from "@/lib/i18n";
import { useLanguage } from "@/hooks/useLanguage";

const MapPanel = dynamic(() => import("@/components/dashboard/MapPanel"), { ssr: false });

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language].dashboard;
  const [deviceId, setDeviceId] = useState<string>("");
  const [deviceLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  useEffect(() => {
    const stored = localStorage.getItem("fallguard-deviceId");
    if (stored) setDeviceId(stored);
  }, []);

  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }
  if (status === "unauthenticated") return null;

  const tabDescriptions: Record<string, { en: string; ta: string }> = {
    status: {
      en: "Live monitoring status, fall history, and emergency call button",
      ta: "நேரடி கண்காணிப்பு நிலை, வீழ்ச்சி வரலாறு மற்றும் அவசர அழைப்பு பொத்தான்",
    },
    map: {
      en: "View the sentinel device home location on an interactive map",
      ta: "ஊடாடும் வரைபடத்தில் சென்டினல் சாதன இருப்பிடத்தைப் பார்க்கவும்",
    },
    timeline: {
      en: "Chronological log of all fall events and alerts",
      ta: "அனைத்து வீழ்ச்சி நிகழ்வுகள் மற்றும் எச்சரிக்கைகளின் காலவரிசை பதிவு",
    },
    insights: {
      en: "AI-powered weekly patterns and recommendations",
      ta: "AI-இயக்க வாராந்திர போக்குகள் மற்றும் பரிந்துரைகள்",
    },
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-700 via-orange-600 to-teal-800 px-5 py-5 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_1px,_transparent_1px)] bg-[length:20px_20px]" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{t.title}</h1>
            <p className="mt-1 text-xs text-orange-100">
              {language === "ta"
                ? `சென்டினல் ${deviceId ? `#${deviceId.slice(0, 8)}` : ""} — நிகழ்நேர கண்காணிப்பு செயலில் உள்ளது`
                : `Sentinel ${deviceId ? `#${deviceId.slice(0, 8)}` : ""} — real-time monitoring active`}
            </p>
          </div>
          <SettingsDrawer
            deviceId={deviceId}
            onDeviceIdChange={setDeviceId}
            language={language}
          />
        </div>
      </div>

      <div className="px-4 py-4">
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="w-full justify-start mb-1">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          <p className="mb-4 text-xs text-gray-400">{tabDescriptions[language === "ta" ? "ta" : "en"]?.[language === "ta" ? "ta" : "en"] || "Live monitoring status and controls"}</p>

          <TabsContent value="status">
            <StatusCard deviceId={deviceId} language={language} />
            <div className="mt-4">
              <EmergencyCall language={language} />
            </div>
          </TabsContent>

          <TabsContent value="map">
            <MapPanel location={deviceLocation} label={t.mapLabel} />
          </TabsContent>

          <TabsContent value="timeline">
            <Timeline deviceId={deviceId} language={language} />
          </TabsContent>

          <TabsContent value="insights">
            <InsightsPanel deviceId={deviceId} language={language} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function DashboardHomePage() {
  return <DashboardContent />;
}