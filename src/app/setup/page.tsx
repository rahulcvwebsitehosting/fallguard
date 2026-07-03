"use client";

import { useState, useEffect, useCallback } from "react";
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

const SETUP_STORAGE_KEY = "fallguard-setup";

interface SetupData {
  nickname: string;
  contacts: { name: string; phone: string; relationship: string; isHospital: boolean }[];
  hospitalPhone: string;
  language: "en" | "ta";
}

interface SavedState {
  step: number;
  data: SetupData;
  deviceId: string | null;
  secret: string | null;
  pin: string | null;
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
  const [restored, setRestored] = useState(false);

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETUP_STORAGE_KEY);
      if (saved) {
        const parsed: SavedState = JSON.parse(saved);
        setStep(parsed.step);
        setData(parsed.data);
        if (parsed.deviceId) setDeviceId(parsed.deviceId);
        if (parsed.secret) setSecret(parsed.secret);
        if (parsed.pin) setPin(parsed.pin);
        if (parsed.data.language) setLanguage(parsed.data.language as "en" | "ta");
      }
    } catch { /* ignore */ }
    setRestored(true);
  }, [setLanguage]);

  // Persist to localStorage on every change
  const persist = useCallback((s: number, d: SetupData, did: string | null, sec: string | null, p: string | null) => {
    try {
      localStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify({ step: s, data: d, deviceId: did, secret: sec, pin: p }));
    } catch { /* ignore */ }
  }, []);

  const setStepAndPersist = (s: number) => {
    setStep(s);
    persist(s, data, deviceId, secret, pin);
  };

  const updateData = (partial: Partial<SetupData>) => {
    setData((prev) => {
      const next = { ...prev, ...partial };
      persist(step, next, deviceId, secret, pin);
      return next;
    });
  };

  const setDeviceIdAndPersist = (did: string | null, sec: string | null, p: string | null) => {
    setDeviceId(did);
    setSecret(sec);
    setPin(p);
    persist(step, data, did, sec, p);
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
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-700 via-orange-600 to-teal-800 px-4 py-5 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_1px,_transparent_1px)] bg-[length:20px_20px]" />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="mt-1 text-sm text-orange-100">
            {language === "ta"
              ? "உங்கள் FallGuard சாதனத்தை 5 எளிய படிகளில் அமைக்கவும். ஒரு பழைய Android தொலைபேசியை பாதுகாப்பு கண்காணிப்பாளராக மாற்றுகிறது."
              : "Configure your FallGuard sentinel in 5 simple steps. Transform an old Android phone into a life-saving safety monitor."}
          </p>
          <Progress value={(step / TOTAL_STEPS) * 100} className="mt-4 h-2 bg-white/20 [&>div]:bg-yellow-300" />
          <div className="mt-3 flex gap-2 text-xs">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <span
                key={i}
                className={`flex-1 text-center rounded py-1 ${
                  i + 1 === step ? "bg-white text-orange-800 font-bold" : i + 1 < step ? "bg-orange-500/40 text-white" : "bg-white/20 text-orange-100"
                }`}
              >
                {i + 1}. {translations[language].setup[`step${i + 1}` as keyof typeof t]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Step Hint */}
      {!restored && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">Restoring progress...</p>
        </div>
      )}

      {restored && (<>
        <div className="border-b border-orange-100 bg-gradient-to-r from-orange-50 to-teal-50 px-4 py-2 text-xs text-orange-700">
          {step === 1 && (language === "ta" ? "உங்கள் சாதனத்திற்கு ஒரு பெயர் கொடுங்கள். இது குடும்ப டாஷ்போர்டில் காண்பிக்கப்படும்." : "Give your device a name. This will show on the family dashboard so you can identify which room this monitor covers.")}
          {step === 2 && (language === "ta" ? "அவசர தொடர்புகளைச் சேர்க்கவும். வீழ்ச்சி கண்டறியப்பட்டால் இவர்களுக்கு SMS மற்றும் WhatsApp மூலம் எச்சரிக்கை அனுப்பப்படும்." : "Add emergency contacts. These people will receive SMS and WhatsApp alerts when a fall is detected.")}
          {step === 3 && (language === "ta" ? "அருகிலுள்ள மருத்துவமனையின் தொலைபேசி எண்ணைச் சேர்க்கவும். இது அவசர அழைப்பு பொத்தானுக்கு பயன்படும்." : "Add a hospital phone number. This will power the one-tap emergency call button on the dashboard.")}
          {step === 4 && (language === "ta" ? "உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும். எச்சரிக்கைகள் மற்றும் குரல் அறிவிப்புகள் இந்த மொழியில் இருக்கும்." : "Choose your preferred language. Alerts and voice announcements will use this language.")}
          {step === 5 && (language === "ta" ? "எல்லாம் சரியாக வேலை செய்கிறதா என்று சோதிக்க ஒரு சோதனை எச்சரிக்கையை அனுப்பவும். பின்னர் கண்காணிப்பைத் தொடங்கவும்." : "Send a test alert to confirm everything works. Then start monitoring.")}
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
              existingDeviceId={deviceId}
              existingSecret={secret}
              existingPin={pin}
              onComplete={(did, sec, p) => {
                setDeviceIdAndPersist(did, sec, p);
                persist(step, data, did, sec, p);
              }}
            />
          )}
        </div>

        <div className="sticky bottom-0 border-t border-orange-100 bg-white px-4 py-3 flex gap-3">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStepAndPersist(step - 1)}>
              {language === "ta" ? "பின்" : "Back"}
            </Button>
          )}
          <div className="flex-1" />
          {step < TOTAL_STEPS && (
            <Button
              className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"
              disabled={!canNext()}
              onClick={() => setStepAndPersist(step + 1)}
            >
              {language === "ta" ? "அடுத்து" : "Next"}
            </Button>
          )}
          {step === TOTAL_STEPS && deviceId && secret && (
            <Button
              className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600"
              onClick={() => {
                localStorage.removeItem(SETUP_STORAGE_KEY);
                router.push(`/sentinel?deviceId=${deviceId}&secret=${secret}&name=${encodeURIComponent(data.nickname)}&lang=${data.language}`);
              }}
            >
              {t.startMonitoring}
            </Button>
          )}
        </div>
      </>)}
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