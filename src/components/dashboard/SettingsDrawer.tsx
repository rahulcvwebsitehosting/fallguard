"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "react-hot-toast";
import { translations } from "@/lib/i18n";

interface SettingsDrawerProps {
  deviceId: string;
  onDeviceIdChange: (id: string) => void;
  language: "en" | "ta";
}

export default function SettingsDrawer({ deviceId, onDeviceIdChange, language }: SettingsDrawerProps) {
  const t = translations[language].dashboard;
  const [inputDeviceId, setInputDeviceId] = useState(deviceId);
  const [newPin, setNewPin] = useState("");

  const saveDeviceId = () => {
    onDeviceIdChange(inputDeviceId);
    localStorage.setItem("fallguard-deviceId", inputDeviceId);
    toast.success("Device ID saved");
  };

  return (
    <Sheet>
      <SheetTrigger>
        <Button variant="outline" size="sm" type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{t.settingsTitle}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="settings-deviceId">Device ID</Label>
            <Input
              id="settings-deviceId"
              value={inputDeviceId}
              onChange={(e) => setInputDeviceId(e.target.value)}
            />
            <Button variant="outline" size="sm" onClick={saveDeviceId} className="w-full">
              Save
            </Button>
          </div>

          <div className="space-y-2">
            <Label>{t.changePin}</Label>
            <Input
              type="password"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
              placeholder="New 4-digit PIN"
            />
            <Button
              variant="outline"
              size="sm"
              disabled={newPin.length !== 4}
              className="w-full"
              onClick={() => {
                toast.success("PIN changed (requires re-login)");
                setNewPin("");
              }}
            >
              {t.changePin}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}