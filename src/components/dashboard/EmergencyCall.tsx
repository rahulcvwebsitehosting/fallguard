"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { translations } from "@/lib/i18n";

interface EmergencyCallProps {
  language: "en" | "ta";
}

export default function EmergencyCall({ language }: EmergencyCallProps) {
  const t = translations[language].dashboard;
  const EMERGENCY_NUMBER = "108";

  return (
    <Card className="border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
      <CardContent className="py-4">
        <a href={`tel:${EMERGENCY_NUMBER}`} className="block">
          <Button className="w-full bg-gradient-to-r from-red-600 to-maroon-600 hover:from-red-700 hover:to-maroon-700 text-lg font-bold py-6 shadow-md shadow-red-200">
            🚑 {t.emergencyCall} ({EMERGENCY_NUMBER})
          </Button>
        </a>
        <p className="text-xs text-red-600 text-center mt-2">
          {language === "ta"
            ? "இந்தியாவின் தேசிய அவசர ஆம்புலன்ஸ் சேவை"
            : "India's National Emergency Ambulance Service"}
        </p>
      </CardContent>
    </Card>
  );
}