"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { translations } from "@/lib/i18n";

interface LanguageStepProps {
  value: "en" | "ta";
  onChange: (value: "en" | "ta") => void;
  language: "en" | "ta";
}

export default function LanguageStep({ value, onChange, language }: LanguageStepProps) {
  const t = translations[language].setup;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.step4}</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={value} onValueChange={(v) => onChange(v as "en" | "ta")} className="space-y-4">
          <div className="flex items-center gap-4 rounded-lg border p-4 hover:border-green-500 transition-colors cursor-pointer" onClick={() => onChange("en")}>
            <RadioGroupItem value="en" id="lang-en" />
            <Label htmlFor="lang-en" className="text-lg font-medium cursor-pointer">{t.languageEn}</Label>
          </div>
          <div className="flex items-center gap-4 rounded-lg border p-4 hover:border-green-500 transition-colors cursor-pointer" onClick={() => onChange("ta")}>
            <RadioGroupItem value="ta" id="lang-ta" />
            <Label htmlFor="lang-ta" className="text-lg font-medium cursor-pointer">{t.languageTa}</Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}