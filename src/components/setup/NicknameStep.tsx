"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { translations } from "@/lib/i18n";

interface NicknameStepProps {
  value: string;
  onChange: (value: string) => void;
  language: "en" | "ta";
}

export default function NicknameStep({ value, onChange, language }: NicknameStepProps) {
  const t = translations[language].setup;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.step1}</CardTitle>
      </CardHeader>
      <CardContent>
        <Label htmlFor="nickname">{t.nicknameLabel}</Label>
        <Input
          id="nickname"
          placeholder={t.nicknamePlaceholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2"
          autoFocus
        />
      </CardContent>
    </Card>
  );
}