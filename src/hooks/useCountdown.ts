"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { COUNTDOWN_SECONDS } from "@/config/fallguard";

export interface UseCountdownResult {
  secondsLeft: number;
  isCancelled: boolean;
  start: () => void;
  cancel: () => void;
}

export function useCountdown(language: "en" | "ta" = "en"): UseCountdownResult {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | null>(null);
  const beepTimerRef = useRef<number | null>(null);
  const cancellingRef = useRef(false);

  const playBeep = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 440;
      gain.gain.value = 0.3;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // audio context not available
    }
  }, []);

  const speakAlert = useCallback(
    (remaining: number) => {
      if (!("speechSynthesis" in window)) return;
      const msg =
        language === "ta"
          ? `வீழ்ச்சி கண்டறியப்பட்டது. நீங்கள் சரியாக இருந்தால் பச்சை பொத்தானை அழுத்தவும். ${remaining} வினாடிகளில் உங்கள் குடும்பத்திற்கு எச்சரிக்கை அனுப்பப்படும்.`
          : `A fall was detected. Tap the green button if you are okay. An alert will be sent to your family in ${remaining} seconds.`;
      const utterance = new SpeechSynthesisUtterance(msg);
      utterance.lang = language === "ta" ? "ta-IN" : "en-IN";
      window.speechSynthesis.speak(utterance);
    },
    [language]
  );

  const cancel = useCallback(() => {
    if (cancellingRef.current) return;
    cancellingRef.current = true;

    abortControllerRef.current?.abort();
    setIsCancelled(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (beepTimerRef.current) {
      clearInterval(beepTimerRef.current);
      beepTimerRef.current = null;
    }

    setIsActive(false);
    setSecondsLeft(COUNTDOWN_SECONDS);
    window.speechSynthesis.cancel();
  }, []);

  const start = useCallback(() => {
    setIsCancelled(false);
    cancellingRef.current = false;
    setIsActive(true);
    setSecondsLeft(COUNTDOWN_SECONDS);

    abortControllerRef.current = new AbortController();
    speakAlert(COUNTDOWN_SECONDS);
    playBeep();

    timerRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          cancelCleanup();
          return 0;
        }
        return next;
      });
    }, 1000);

    beepTimerRef.current = window.setInterval(() => {
      playBeep();
    }, 5000);
  }, [speakAlert, playBeep]);

  useEffect(() => {
    if (isActive && secondsLeft % 5 === 0 && secondsLeft > 0 && secondsLeft !== COUNTDOWN_SECONDS) {
      playBeep();
    }
    if (isActive && [15, 10, 5].includes(secondsLeft)) {
      speakAlert(secondsLeft);
    }
  }, [secondsLeft, isActive, playBeep, speakAlert]);

  const cancelCleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (beepTimerRef.current) {
      clearInterval(beepTimerRef.current);
      beepTimerRef.current = null;
    }
    setIsActive(false);
  }, []);

  useEffect(() => {
    return () => {
      cancelCleanup();
      window.speechSynthesis.cancel();
    };
  }, [cancelCleanup]);

  return { secondsLeft, isCancelled, start, cancel };
}