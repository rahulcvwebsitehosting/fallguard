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

  return (
    <div className="mx-auto max-w-2xl px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{t.title}</h1>
        <SettingsDrawer
          deviceId={deviceId}
          onDeviceIdChange={setDeviceId}
          language={language}
        />
      </div>

      <Tabs defaultValue="status" className="w-full">
        <TabsList className="w-full justify-start mb-4">
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

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
  );
}

export default function DashboardHomePage() {
  return <DashboardContent />;
}