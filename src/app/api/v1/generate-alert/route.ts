import { NextRequest, NextResponse } from "next/server";
import { verifyDeviceSecret, extractDeviceAuth } from "@/lib/device-auth";
import { createTimeoutSignal } from "@/lib/api-utils";
import { GEMINI_TIMEOUT_MS, GEMINI_TEMPERATURE } from "@/config/fallguard";
import { warn, error as logError } from "@/lib/logger";

const FALLBACK_TEMPLATE_EN =
  "{{name}} may have fallen at {{location}} at {{time}}. Please call emergency services immediately.";
const FALLBACK_TEMPLATE_TA =
  "{{name}} {{location}}-ல் {{time}} மணிக்கு விழுந்திருக்கலாம். உடனடியாக அவசர சேவைகளை அழைக்கவும்.";

export async function POST(req: NextRequest) {
  try {
    const auth = extractDeviceAuth(req.headers);
    if (!auth) {
      return NextResponse.json({ error: "Missing device auth headers" }, { status: 401 });
    }
    const { valid } = await verifyDeviceSecret(auth.deviceId, auth.secret);
    if (!valid) {
      return NextResponse.json({ error: "Invalid device credentials" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    if (!body.name || !body.location || !body.time) {
      return NextResponse.json({ error: "name, location, and time are required" }, { status: 400 });
    }

    const language = body.language === "ta" ? "ta" : "en";
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      const tmpl = language === "ta" ? FALLBACK_TEMPLATE_TA : FALLBACK_TEMPLATE_EN;
      const message = tmpl
        .replace("{{name}}", body.name)
        .replace("{{location}}", body.location)
        .replace("{{time}}", body.time);
      return NextResponse.json({ message });
    }

    const { signal, clear } = createTimeoutSignal(GEMINI_TIMEOUT_MS);

    try {
      const langStr = language === "ta" ? "Tamil" : "English";
      const prompt =
        language === "ta"
          ? `Context: ${body.name} என்ற முதியவர் ${body.location}-ல் ${body.time} மணிக்கு விழுந்திருக்கலாம். அவர் ரத்து செய்யும் பொத்தானை அழுத்தவில்லை. குடும்பத்தினருக்கு தமிழில் ஒரு அவசர SMS எச்சரிக்கையை உருவாக்கவும். பெயர், இடம், நேரம் மற்றும் "அவசர சேவைகளை அழைக்கவும்" என்ற வழிமுறையைச் சேர்க்கவும். அதிகபட்சம் 2 வாக்கியங்கள்.`
          : `Context: An elderly person named ${body.name} may have fallen at ${body.location} at ${body.time}. They did not respond to the cancel prompt. Generate a concise, urgent SMS alert in ${langStr} for the family. Include: name, location, time, and a "call emergency" instruction. Maximum 2 sentences.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: GEMINI_TEMPERATURE,
              maxOutputTokens: 100,
            },
          }),
          signal,
        }
      );

      if (!res.ok) {
        warn("Gemini alert generation failed", { status: res.status });
        const tmpl = language === "ta" ? FALLBACK_TEMPLATE_TA : FALLBACK_TEMPLATE_EN;
        const message = tmpl
          .replace("{{name}}", body.name)
          .replace("{{location}}", body.location)
          .replace("{{time}}", body.time);
        return NextResponse.json({ message });
      }

      const data = await res.json();
      const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return NextResponse.json({ message: text.trim() });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        warn("Gemini alert generation timed out");
      }
      const tmpl = language === "ta" ? FALLBACK_TEMPLATE_TA : FALLBACK_TEMPLATE_EN;
      const message = tmpl
        .replace("{{name}}", body.name)
        .replace("{{location}}", body.location)
        .replace("{{time}}", body.time);
      return NextResponse.json({ message });
    } finally {
      clear();
    }
  } catch (err) {
    logError("Alert generation endpoint error", { error: String(err) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}