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
    <Card className="border-red-300 bg-red-50">
      <CardContent className="py-4">
        <a href={`tel:${EMERGENCY_NUMBER}`} className="block">
          <Button className="w-full bg-red-600 hover:bg-red-700 text-lg font-bold py-6">
            {t.emergencyCall} ({EMERGENCY_NUMBER})
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