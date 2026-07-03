"use client";

import { type MonitoringState as MonitoringStateType, MonitoringState } from "@/types";

interface AlertBannerProps {
  state: MonitoringStateType;
  language: "en" | "ta";
}

const LABELS: Record<MonitoringStateType, { en: string; ta: string }> = {
  [MonitoringState.IDLE]: { en: "Ready to start...", ta: "தொடங்க தயாராக..." },
  [MonitoringState.CAMERA_STARTING]: { en: "Starting camera...", ta: "கேமரா தொடங்குகிறது..." },
  [MonitoringState.WARMING_UP]: { en: "Loading AI...", ta: "AI ஏற்றுகிறது..." },
  [MonitoringState.MONITORING]: { en: "All clear", ta: "அனைத்தும் சரி" },
  [MonitoringState.POSSIBLE_FALL]: { en: "Checking...", ta: "சரிபார்க்கிறது..." },
  [MonitoringState.VERIFYING]: { en: "Verifying...", ta: "உறுதிப்படுத்துகிறது..." },
  [MonitoringState.COUNTDOWN]: { en: "Fall detected!", ta: "விழுந்தது கண்டறியப்பட்டது!" },
  [MonitoringState.DISPATCHING]: { en: "Alert sending...", ta: "எச்சரிக்கை அனுப்புகிறது..." },
  [MonitoringState.SUCCESS]: { en: "Alert sent", ta: "எச்சரிக்கை அனுப்பப்பட்டது" },
  [MonitoringState.COOLDOWN]: { en: "Cooling down...", ta: "காத்திருக்கிறது..." },
  [MonitoringState.ERROR]: { en: "Monitoring error", ta: "கண்காணிப்பு பிழை" },
};

export default function AlertBanner({ state, language }: AlertBannerProps) {
  const label = LABELS[state] || LABELS[MonitoringState.MONITORING];
  const display = label[language];

  const isAlert = state === MonitoringState.COUNTDOWN || state === MonitoringState.DISPATCHING;

  return (
    <div
      className={`absolute top-4 left-1/2 z-20 -translate-x-1/2 rounded-full px-5 py-1.5 text-lg font-semibold shadow-lg ${
        isAlert ? "bg-red-600 text-white animate-pulse" : "bg-black/40 text-white"
      }`}
    >
      {display}
    </div>
  );
}