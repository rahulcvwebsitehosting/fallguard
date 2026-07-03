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

interface HospitalResult {
  name: string;
  phone: string;
  address: string;
  distance: string;
}

export default function HospitalStep({ value, onChange, language }: HospitalStepProps) {
  const t = translations[language].setup;
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<HospitalResult[]>([]);
  const [error, setError] = useState("");

  const searchHospital = async () => {
    setSearching(true);
    setError("");
    setResults([]);
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

      const query = `
        [out:json];
        (
          node["amenity"="hospital"](around:5000,${latitude},${longitude});
          way["amenity"="hospital"](around:5000,${latitude},${longitude});
        );
        out center 10;
      `;

      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      const hospitals: HospitalResult[] = (data.elements || [])
        .filter((el: any) => el.tags && el.tags.name)
        .map((el: any) => {
          const lat = el.lat || el.center?.lat || 0;
          const lon = el.lon || el.center?.lon || 0;
          const d = haversine(latitude, longitude, lat, lon);
          return {
            name: el.tags.name,
            phone: el.tags.phone || el.tags["contact:phone"] || "",
            address: el.tags["addr:full"] || [el.tags["addr:street"], el.tags["addr:city"]].filter(Boolean).join(", ") || "",
            distance: d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`,
          };
        })
        .sort((a: HospitalResult, b: HospitalResult) => parseFloat(a.distance) - parseFloat(b.distance));

      if (hospitals.length === 0) {
        setError(language === "ta" ? "அருகில் மருத்துவமனைகள் எதுவும் கிடைக்கவில்லை." : "No hospitals found nearby. Enter manually below.");
      } else {
        setResults(hospitals);
      }
    } catch (err) {
      warn("Hospital search failed", { error: String(err) });
      setError(language === "ta" ? "தேடல் தோல்வி. கைமுறையாக உள்ளிடவும்." : "Search failed. Enter manually below.");
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
          {searching ? (language === "ta" ? "தேடுகிறது..." : "Searching...") : t.hospitalSearch}
        </Button>

        {error && <p className="text-xs text-red-500 text-center">{error}</p>}

        {results.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {results.map((h, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onChange(h.phone)}
                className={`w-full text-left rounded-lg border p-3 transition-colors ${
                  h.phone === value
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{h.name}</p>
                    {h.address && <p className="text-xs text-gray-500 truncate">{h.address}</p>}
                    {h.phone && <p className="text-xs text-teal-600 font-medium mt-0.5">{h.phone}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-gray-400">{h.distance}</span>
                </div>
              </button>
            ))}
            <p className="text-xs text-gray-400 text-center pt-1">
              {language === "ta" ? "தேர்ந்தெடுக்க தட்டவும்" : "Tap a hospital to select it"}
            </p>
          </div>
        )}

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

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
