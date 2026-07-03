"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LanguageProvider, useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/i18n";
import NicknameStep from "@/components/setup/NicknameStep";
import ContactsStep from "@/components/setup/ContactsStep";
import HospitalStep from "@/components/setup/HospitalStep";
import LanguageStep from "@/components/setup/LanguageStep";
import TestStep from "@/components/setup/TestStep";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface SetupData {
  nickname: string;
  contacts: { name: string; phone: string; relationship: string; isHospital: boolean }[];
  hospitalPhone: string;
  language: "en" | "ta";
}

const TOTAL_STEPS = 5;

function SetupContent() {
  const { language, setLanguage } = useLanguage();
  const t = translations[language].setup;
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [data, setData] = useState<SetupData>({
    nickname: "",
    contacts: [],
    hospitalPhone: "",
    language: "en",
  });
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [pin, setPin] = useState<string | null>(null);

  const updateData = (partial: Partial<SetupData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const canNext = () => {
    switch (step) {
      case 1: return data.nickname.trim().length > 0;
      case 2: return data.contacts.length > 0 && data.contacts.every((c) => c.name && c.phone);
      case 3: return data.hospitalPhone.trim().length > 0;
      case 4: return true;
      case 5: return deviceId !== null;
      default: return false;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="sticky top-0 bg-white z-10 border-b px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">{t.title}</h1>
        <p className="text-sm text-gray-500">{t.subtitle}</p>
        <Progress value={(step / TOTAL_STEPS) * 100} className="mt-3 h-2" />
        <div className="mt-2 flex gap-2 text-xs text-gray-500">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span
              key={i}
              className={`flex-1 text-center rounded py-1 ${
                i + 1 === step ? "bg-green-600 text-white font-bold" : i + 1 < step ? "bg-green-100 text-green-800" : "bg-gray-100"
              }`}
            >
              {translations[language].setup[`step${i + 1}` as keyof typeof t]}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        {step === 1 && (
          <NicknameStep
            value={data.nickname}
            onChange={(v) => updateData({ nickname: v })}
            language={language}
          />
        )}
        {step === 2 && (
          <ContactsStep
            contacts={data.contacts}
            onChange={(contacts) => updateData({ contacts })}
            language={language}
          />
        )}
        {step === 3 && (
          <HospitalStep
            value={data.hospitalPhone}
            onChange={(v) => updateData({ hospitalPhone: v })}
            language={language}
          />
        )}
        {step === 4 && (
          <LanguageStep
            value={data.language}
            onChange={(lang) => {
              updateData({ language: lang });
              setLanguage(lang);
            }}
            language={language}
          />
        )}
        {step === 5 && (
          <TestStep
            setupData={data}
            language={language}
            onComplete={(did, sec, p) => {
              setDeviceId(did);
              setSecret(sec);
              setPin(p);
              updateData({ language: data.language });
            }}
          />
        )}
      </div>

      <div className="sticky bottom-0 border-t bg-white px-4 py-3 flex gap-3">
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        )}
        <div className="flex-1" />
        {step < TOTAL_STEPS && (
          <Button
            className="bg-green-600 hover:bg-green-700"
            disabled={!canNext()}
            onClick={() => setStep(step + 1)}
          >
            Next
          </Button>
        )}
        {step === TOTAL_STEPS && deviceId && secret && (
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => {
              router.push(`/sentinel?deviceId=${deviceId}&secret=${secret}&name=${encodeURIComponent(data.nickname)}&lang=${data.language}`);
            }}
          >
            {t.startMonitoring}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function SetupPage() {
  return (
    <LanguageProvider>
      <SetupContent />
    </LanguageProvider>
  );
}