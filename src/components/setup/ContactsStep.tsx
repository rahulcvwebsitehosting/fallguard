"use client";


import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { translations } from "@/lib/i18n";

interface Contact {
  name: string;
  phone: string;
  relationship: string;
  isHospital: boolean;
}

interface ContactsStepProps {
  contacts: Contact[];
  onChange: (contacts: Contact[]) => void;
  language: "en" | "ta";
}

const RELATIONSHIPS = ["Son", "Daughter", "Spouse", "Neighbor", "Relative", "Other"];
const MAX_CONTACTS = 3;

export default function ContactsStep({ contacts, onChange, language }: ContactsStepProps) {
  const t = translations[language].setup;

  const addContact = () => {
    if (contacts.length >= MAX_CONTACTS) return;
    onChange([...contacts, { name: "", phone: "", relationship: "", isHospital: false }]);
  };

  const removeContact = (idx: number) => {
    onChange(contacts.filter((_, i) => i !== idx));
  };

  const updateContact = (idx: number, field: keyof Contact, value: string | boolean | null) => {
    const updated = contacts.map((c, i) => (i === idx ? { ...c, [field]: value } : c));
    onChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.step2}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {contacts.map((contact, idx) => (
          <Card key={idx} className="border-dashed">
            <CardContent className="pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm text-gray-500">Contact {idx + 1}</span>
                <Button variant="ghost" size="sm" onClick={() => removeContact(idx)} className="text-red-500 h-auto py-1">
                  {t.removeContact}
                </Button>
              </div>
              <div>
                <Label>{t.contactNameLabel}</Label>
                <Input
                  value={contact.name}
                  onChange={(e) => updateContact(idx, "name", e.target.value)}
                  placeholder="e.g. John"
                />
              </div>
              <div>
                <Label>{t.contactPhoneLabel}</Label>
                <Input
                  value={contact.phone}
                  onChange={(e) => updateContact(idx, "phone", e.target.value)}
                  placeholder="+91XXXXXXXXXX"
                />
              </div>
              <div>
                <Label>{t.contactRelationLabel}</Label>
                <Select value={contact.relationship} onValueChange={(v) => updateContact(idx, "relationship", v || "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIPS.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {contact.phone && (
                <div className="rounded-lg bg-orange-50 border border-orange-100 p-3">
                  <p className="text-sm font-medium text-orange-800">{t.optInTitle}</p>
                  <p className="text-xs text-orange-600 mt-1">{t.optInDesc}</p>
                  <a
                    href={`https://wa.me/${contact.phone.replace(/^\+/, "")}?text=FallGuard+Opt-In`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block"
                  >
                    <Button variant="outline" size="sm" className="text-teal-700 border-teal-300" type="button">
                      {t.optInButton}
                    </Button>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {contacts.length < MAX_CONTACTS && (
          <Button variant="outline" onClick={addContact} className="w-full">
            + {t.addContact}
          </Button>
        )}
        {contacts.length === 0 && (
          <p className="text-sm text-gray-400 text-center">Add up to {MAX_CONTACTS} emergency contacts</p>
        )}
      </CardContent>
    </Card>
  );
}