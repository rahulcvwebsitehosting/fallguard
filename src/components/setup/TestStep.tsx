"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { translations } from "@/lib/i18n";
import { storeDeviceConfig } from "@/lib/idb";
import { info, warn } from "@/lib/logger";
import toast from "react-hot-toast";

interface TestStepProps {
  setupData: {
    nickname: string;
    contacts: { name: string; phone: string; relationship: string; isHospital: boolean }[];
    hospitalPhone: string;
    language: "en" | "ta";
  };
  language: "en" | "ta";
  existingDeviceId?: string | null;
  existingSecret?: string | null;
  existingPin?: string | null;
  onComplete: (deviceId: string, secret: string, pin: string) => void;
}

export default function TestStep({ setupData, language, existingDeviceId, existingSecret, existingPin, onComplete }: TestStepProps) {
  const t = translations[language].setup;
  const [status, setStatus] = useState<"idle" | "registering" | "testing" | "done" | "error">("idle");
  const [deviceId, setDeviceId] = useState<string | null>(existingDeviceId || null);
  const [secret, setSecret] = useState<string | null>(existingSecret || null);
  const [pin, setPin] = useState<string | null>(existingPin || null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPin, setShowPin] = useState(false);

  useEffect(() => {
    if (existingDeviceId && existingSecret && existingPin) {
      setDeviceId(existingDeviceId);
      setSecret(existingSecret);
      setPin(existingPin);
    }
  }, [existingDeviceId, existingSecret, existingPin]);

  const registerDevice = async () => {
    try {
      setErrorMsg("");
      const res = await fetch("/api/v1/device-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Registration failed (HTTP ${res.status})`);
      }
      const data = await res.json();
      setDeviceId(data.deviceId);
      setSecret(data.secret);
      info("Device registered successfully", { deviceId: data.deviceId });

      const generatedPin = String(Math.floor(1000 + Math.random() * 9000));
      setPin(generatedPin);

      await storeDeviceConfig("deviceId", data.deviceId);
      await storeDeviceConfig("secret", data.secret);
      await storeDeviceConfig("pin", generatedPin);
      await storeDeviceConfig("nickname", setupData.nickname);
      await storeDeviceConfig("language", setupData.language);

      const configRes = await fetch("/api/v1/device", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          deviceId: data.deviceId,
          "x-device-secret": data.secret,
        },
        body: JSON.stringify({
          nickname: setupData.nickname,
          language: setupData.language,
          pin: generatedPin,
        }),
      });
      if (!configRes.ok) throw new Error("Failed to save device config");

      for (const contact of setupData.contacts) {
        const cRes = await fetch("/api/v1/contacts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            deviceId: data.deviceId,
            "x-device-secret": data.secret,
          },
          body: JSON.stringify({ ...contact }),
        });
        if (!cRes.ok) throw new Error(`Failed to add contact: ${contact.name}`);
      }

      if (setupData.hospitalPhone) {
        const hRes = await fetch("/api/v1/contacts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            deviceId: data.deviceId,
            "x-device-secret": data.secret,
          },
          body: JSON.stringify({
            name: "Hospital",
            phone: setupData.hospitalPhone,
            relationship: "Hospital",
            isHospital: true,
            priority: 1,
          }),
        });
        if (!hRes.ok) throw new Error("Failed to add hospital contact");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setErrorMsg(msg);
      setStatus("error");
      warn("Device registration failed", { error: msg });
    }
  };

  useEffect(() => {
    if (status !== "registering") return;
    registerDevice();
  }, [status]);

  const sendTestAlert = async () => {
    if (!deviceId || !secret) return;
    setStatus("testing");
    try {
      const res = await fetch("/api/v1/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          deviceId,
          "x-device-secret": secret,
        },
        body: JSON.stringify({
          message: `[FallGuard TEST] This is a test alert from ${setupData.nickname}. No emergency — just confirming the alert system works.`,
          gps: { lat: 0, lng: 0 },
          deviceId,
        }),
      });
      if (res.ok) {
        toast.success(t.testSuccess);
        const p = pin;
        if (p) onComplete(deviceId, secret, p);
        setStatus("done");
      } else {
        if (res.status === 429) {
          toast.error("Rate limited. Try again later.");
        } else {
          toast.error(t.testFailed);
        }
        setStatus("idle");
      }
    } catch {
      toast.error(t.testFailed);
      setStatus("idle");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.step5}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "idle" && !deviceId && (
          <Button
            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"
            onClick={() => setStatus("registering")}
          >
            {t.complete}
          </Button>
        )}
        {status === "registering" && (
          <div className="text-center py-4">
            <p className="text-gray-500">Registering device...</p>
          </div>
        )}
        {status === "error" && (
          <>
            <Alert variant="destructive">
              <AlertDescription>{errorMsg || "Failed to register device"}</AlertDescription>
            </Alert>
            <Button variant="outline" onClick={() => setStatus("registering")} className="w-full">
              Retry
            </Button>
          </>
        )}
        {deviceId && secret && (
          <>
            <Alert className="bg-orange-50 border-orange-200">
              <AlertDescription>
                <strong>{t.secretWarning}</strong>
                <div className="mt-2 font-mono text-sm break-all bg-orange-100 p-2 rounded">
                  {secret}
                </div>
              </AlertDescription>
            </Alert>

            <Alert className="bg-teal-50 border-teal-200">
              <AlertDescription>
                <strong>{t.pinLabel}</strong>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    value={showPin ? (pin || "") : "••••"}
                    readOnly
                    className="w-24 text-center text-lg font-bold"
                  />
                  <Button variant="outline" size="sm" onClick={() => setShowPin(!showPin)}>
                    {showPin ? "Hide" : "Show"}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>

            {status !== "done" && (
              <Button
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"
                onClick={sendTestAlert}
                disabled={status === "testing"}
              >
                {status === "testing" ? t.testSending : t.testAlert}
              </Button>
            )}
          </>
        )}

        {status === "done" && (
          <>
            <Alert className="bg-teal-50 border-teal-200">
              <AlertDescription>{t.testSuccess}</AlertDescription>
            </Alert>
            <Alert className="bg-orange-50 border-orange-200">
              <AlertDescription className="text-sm">{t.wakeLockInstructions}</AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  );
}
