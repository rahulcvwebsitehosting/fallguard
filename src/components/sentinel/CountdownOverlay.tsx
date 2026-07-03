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
    <div className="absolute inset-0 z-30 flex flex-col bg-gradient-to-b from-black/80 via-red-950/60 to-black/80">
      {/* Decorative rangoli dots */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.04)_1px,_transparent_1px)] bg-[length:20px_20px]" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-maroon-500" />

      <div className="relative flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <span
            className={cn(
              "font-black tabular-nums tracking-tight drop-shadow-lg",
              secondsLeft <= 5 ? "text-orange-400" : "text-red-400"
            )}
            style={{ fontSize: "120px" }}
          >
            {secondsLeft}
          </span>
        </div>
      </div>

      {secondsLeft <= 10 && secondsLeft > 0 && (
        <div className="relative flex flex-col items-center gap-4 p-4 pb-8">
          <button
            onClick={onCancel}
            className="w-full min-h-[80px] rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-4xl font-black text-white shadow-lg shadow-teal-900/40 hover:from-teal-700 hover:to-teal-600 active:from-teal-800 active:to-teal-700 transition-all"
          >
            {okLabel}
          </button>
          <p className="text-center text-lg text-white/80 font-medium px-4">
            {language === "ta"
              ? "விழுந்ததாக கண்டறியப்பட்டது. நீங்கள் சரியாக இருந்தால் பச்சை பொத்தானை அழுத்தவும்."
              : "Fall detected. Tap the green button if you are okay."}
          </p>
        </div>
      )}
    </div>
  );
}