"use client";

import { cn } from "@/lib/utils";

interface CountdownOverlayProps {
  secondsLeft: number;
  onCancel: () => void;
  language: "en" | "ta";
  visible: boolean;
}

export default function CountdownOverlay({
  secondsLeft,
  onCancel,
  language,
  visible,
}: CountdownOverlayProps) {
  if (!visible) return null;

  const okLabel = language === "ta" ? "நான் சரியாக இருக்கிறேன்" : "I'M OK";

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-black/70">
      <div className="flex-1 flex items-center justify-center">
        <span
          className={cn(
            "font-black tabular-nums tracking-tight",
            secondsLeft <= 5 ? "text-red-400" : "text-red-500"
          )}
          style={{ fontSize: "120px" }}
        >
          {secondsLeft}
        </span>
      </div>

      {secondsLeft <= 10 && secondsLeft > 0 && (
        <div className="flex flex-col items-center gap-4 p-4">
          <button
            onClick={onCancel}
            className="w-full min-h-[80px] rounded-lg bg-green-600 text-5xl font-black text-white hover:bg-green-700 active:bg-green-800 transition-colors"
          >
            {okLabel}
          </button>
          <p className="text-center text-xl text-white/80 font-medium px-4">
            {language === "ta"
              ? "விழுந்ததாக கண்டறியப்பட்டது. நீங்கள் சரியாக இருந்தால் பச்சை பொத்தானை அழுத்தவும்."
              : "Fall detected. Tap the green button if you are okay."}
          </p>
        </div>
      )}
    </div>
  );
}