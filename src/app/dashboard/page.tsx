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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-700">FallGuard</CardTitle>
          <p className="text-sm text-gray-500 mt-1">{t.loginTitle}</p>
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
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading || pin.length !== 4 || !deviceId}
            >
              {loading ? "..." : t.loginButton}
            </Button>
          </form>
        </CardContent>
      </Card>
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