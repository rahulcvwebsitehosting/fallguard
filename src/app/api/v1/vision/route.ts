import { NextRequest, NextResponse } from "next/server";
import { verifyDeviceSecret, extractDeviceAuth } from "@/lib/device-auth";
import { createTimeoutSignal } from "@/lib/api-utils";
import { GEMINI_TIMEOUT_MS, GEMINI_TEMPERATURE, GEMINI_MAX_TOKENS } from "@/config/fallguard";
import { warn, error as logError } from "@/lib/logger";

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
    if (!body.snapshotBase64) {
      return NextResponse.json({ error: "snapshotBase64 is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const { signal, clear } = createTimeoutSignal(GEMINI_TIMEOUT_MS);

    let classification = "UNKNOWN";
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    inlineData: {
                      mimeType: "image/jpeg",
                      data: body.snapshotBase64,
                    },
                  },
                  {
                    text: "You are a safety monitoring system. Analyze this image and determine the person's posture. Respond with EXACTLY ONE word from: FALLEN, SITTING, BENDING, STANDING, UNKNOWN. FALLEN means the person is collapsed on the ground and may need help. Be conservative — if unsure, say FALLEN.",
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: GEMINI_TEMPERATURE,
              maxOutputTokens: GEMINI_MAX_TOKENS,
            },
          }),
          signal,
        }
      );

      if (!res.ok) {
        warn("Gemini vision API request failed", { status: res.status });
        return NextResponse.json({ classification: "UNKNOWN" });
      }

      const data = await res.json();
      const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const firstWord = text.trim().split(/\s+/)[0]?.toUpperCase();
      const validLabels = ["FALLEN", "SITTING", "BENDING", "STANDING", "UNKNOWN"];
      classification = validLabels.includes(firstWord) ? firstWord : "UNKNOWN";

      return NextResponse.json({ classification });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        warn("Gemini vision request timed out");
      } else {
        logError("Gemini vision error", { error: String(err) });
      }
      return NextResponse.json({ classification: "UNKNOWN" });
    } finally {
      clear();
    }
  } catch (err) {
    logError("Vision endpoint error", { error: String(err) });
    return NextResponse.json({ classification: "UNKNOWN" }, { status: 500 });
  }
}