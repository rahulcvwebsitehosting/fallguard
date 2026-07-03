"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { translations } from "@/lib/i18n";
import { useState } from "react";
import { GEOCODE_TIMEOUT_MS } from "@/config/fallguard";
import { warn } from "@/lib/logger";

interface HospitalStepProps {
  value: string;
  onChange: (value: string) => void;
  language: "en" | "ta";
}

export default function HospitalStep({ value, onChange, language }: HospitalStepProps) {
  const t = translations[language].setup;
  const [searching, setSearching] = useState(false);

  const searchHospital = async () => {
    setSearching(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!("geolocation" in navigator)) {
          reject(new Error("No geolocation"));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: GEOCODE_TIMEOUT_MS,
          maximumAge: 60000,
        });
      });

      const { latitude, longitude } = pos.coords;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        { signal: AbortSignal.timeout(GEOCODE_TIMEOUT_MS) }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.display_name || "Location found";
        warn("Nominatim result", { address: addr });
      }
    } catch {
      warn("Geolocation or reverse geocode failed");
    } finally {
      setSearching(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.step3}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button variant="outline" onClick={searchHospital} disabled={searching} className="w-full">
          {searching ? "Searching..." : t.hospitalSearch}
        </Button>
        <div className="text-center text-sm text-gray-400">— or —</div>
        <div>
          <Label>{t.hospitalManual}</Label>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="+91XXXXXXXXXX"
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}