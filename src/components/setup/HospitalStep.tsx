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
          reject(new Error("Geolocation not supported by this browser"));
          return;
        }
        const opts: PositionOptions = {
          enableHighAccuracy: false,
          timeout: GEOCODE_TIMEOUT_MS,
          maximumAge: 120000,
        };
        navigator.geolocation.getCurrentPosition(resolve, reject, opts);
      });

      const { latitude, longitude } = pos.coords;

      // Use Nominatim search for hospitals near coordinates
      // Nominatim supports CORS and structured amenity searches
      const params = new URLSearchParams({
        q: `hospital`,
        format: "jsonv2",
        addressdetails: "1",
        limit: "10",
        viewbox: `${longitude - 0.15},${latitude - 0.15},${longitude + 0.15},${latitude + 0.15}`,
        bounded: "1",
      });

      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "FallGuard/0.1 (elderly fall detection app; local setup)",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) throw new Error(`Search failed (HTTP ${res.status})`);

      const data = await res.json();
      const hospitals: HospitalResult[] = (data || [])
        .filter((el: any) => el.display_name)
        .map((el: any) => {
          const d = haversine(latitude, longitude, parseFloat(el.lat), parseFloat(el.lon));
          const addr = el.address || {};
          const road = addr.road || addr.street || "";
          const city = addr.city || addr.town || addr.village || addr.county || "";
          const addressParts = [el.display_name?.split(",").slice(0, 3).join(","), road, city].filter(Boolean);
          return {
            name: el.name || addr.hospital || addr.amenity || (addr.road ? `Hospital on ${addr.road}` : "Hospital"),
            phone: el.extratags?.phone || el.extratags?.["contact:phone"] || "",
            address: addressParts[0] || el.display_name || "",
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
      let msg = "";
      const raw = String(err);

      if (raw.includes("User denied") || raw.includes("PERMISSION_DENIED")) {
        msg = language === "ta"
          ? "இருப்பிட அனுமதி மறுக்கப்பட்டது. உலாவி அமைப்புகளில் இருப்பிடத்தை அனுமதிக்கவும்."
          : "Location permission denied. Allow location access in browser settings.";
      } else if (raw.includes("POSITION_UNAVAILABLE") || raw.includes("Timeout")) {
        msg = language === "ta"
          ? "இருப்பிடம் கிடைக்கவில்லை. GPS சமிக்ஞையைச் சரிபார்க்கவும்."
          : "Location unavailable. Check GPS signal and try again.";
      } else if (raw.includes("not supported")) {
        msg = language === "ta"
          ? "உங்கள் உலாவி இருப்பிடத்தை ஆதரிக்கவில்லை."
          : "Your browser does not support geolocation.";
      } else {
        msg = language === "ta" ? "தேடல் தோல்வி. கைமுறையாக உள்ளிடவும்." : "Search failed. Enter manually below.";
      }

      setError(msg);
      warn("Hospital search failed", { error: String(err) });
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

        {error && (
          <p className="text-xs text-red-500 text-center leading-relaxed">{error}</p>
        )}

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
                    {h.phone ? (
                      <p className="text-xs text-teal-600 font-medium mt-0.5">{h.phone}</p>
                    ) : (
                      <p className="text-xs text-gray-400 italic mt-0.5">
                        {language === "ta" ? "தொலைபேசி எண் இல்லை — கைமுறையாக உள்ளிடவும்" : "No phone listed — enter manually"}
                      </p>
                    )}
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