"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { translations } from "@/lib/i18n";
import { LanguageProvider, useLanguage } from "@/hooks/useLanguage";

function LoginContent() {
  const { language } = useLanguage();
  const t = translations[language].dashboard;
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      pin,
      deviceId,
      redirect: false,
    });

    if (result?.error) {
      if (result.error === "RATE_LIMITED") {
        setError(t.rateLimitError);
      } else {
        setError(t.loginError);
      }
      setLoading(false);
    } else if (result?.ok) {
      router.push("/dashboard/home");
    } else {
      setError(t.loginError);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-700 via-orange-600 to-teal-800 px-6 py-8 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_1px,_transparent_1px)] bg-[length:20px_20px]" />
        <div className="relative z-10 mx-auto max-w-md">
          <h1 className="text-3xl font-bold">FallGuard</h1>
          <p className="mt-2 text-sm text-orange-100">
            {language === "ta"
              ? "குடும்ப டாஷ்போர்டு — உங்கள் அன்புக்குரியவரின் பாதுகாப்பை எங்கிருந்தும் கண்காணிக்கவும்."
              : "Family Dashboard — Monitor your loved one's safety from anywhere."}
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="mx-auto mt-6 w-full max-w-md px-4">
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div className="rounded-xl border border-orange-100 bg-gradient-to-b from-white to-orange-50/30 p-3">
            <div className="text-lg font-bold text-orange-600">Live</div>
            <div className="text-gray-500">Status Updates</div>
          </div>
          <div className="rounded-xl border border-teal-100 bg-gradient-to-b from-white to-teal-50/30 p-3">
            <div className="text-lg font-bold text-teal-600">Map</div>
            <div className="text-gray-500">Home Location</div>
          </div>
          <div className="rounded-xl border border-orange-100 bg-gradient-to-b from-white to-orange-50/30 p-3">
            <div className="text-lg font-bold text-orange-600">Alerts</div>
            <div className="text-gray-500">SMS + WhatsApp</div>
          </div>
        </div>
      </div>

      {/* Login Card */}
      <div className="mx-auto mt-6 w-full max-w-sm px-4">
        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg text-gray-900">{t.loginTitle}</CardTitle>
            <p className="text-xs text-gray-400 mt-1">
              {language === "ta"
                ? "சாதன அமைப்பின் போது உங்களுக்குக் காட்டப்பட்ட 4 இலக்க PIN மற்றும் சாதன ID ஐ உள்ளிடவும்."
                : "Enter the 4-digit PIN and Device ID shown during setup."}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="deviceId">Device ID</Label>
                <Input
                  id="deviceId"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  placeholder="Enter your device ID"
                  className="mt-1"
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="pin">{t.loginTitle}</Label>
                <Input
                  id="pin"
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder={t.pinPlaceholder}
                  className="mt-1 text-center text-2xl tracking-[0.5em]"
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"
              disabled={loading || pin.length !== 4 || !deviceId}
            >
              {loading ? "..." : t.loginButton}
            </Button>
            </form>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-xs text-gray-400">
          {language === "ta"
            ? "PIN அல்லது சாதன ID மறந்துவிட்டதா? மீண்டும் அமைக்க புதிய சாதன அமைப்பை இயக்கவும்."
            : "Forgot your PIN or Device ID? Run a fresh device setup to generate a new one."}
        </p>
      </div>
    </div>
  );
}

export default function DashboardLoginPage() {
  return (
    <LanguageProvider>
      <LoginContent />
    </LanguageProvider>
  );
}