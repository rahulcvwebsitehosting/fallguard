import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { createTimeoutSignal } from "@/lib/api-utils";
import { GEMINI_TIMEOUT_MS, GEMINI_TEMPERATURE } from "@/config/fallguard";
import { warn, error as logError } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const logs = body.logs || [];
    const language = body.language === "ta" ? "ta" : "en";

    if (!logs.length) {
      const empty =
        language === "ta"
          ? "இந்த வாரம் எந்த நிகழ்வுகளும் பதிவு செய்யப்படவில்லை."
          : "No events recorded this week.";
      return NextResponse.json({ insights: [empty] });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        insights: [language === "ta" ? "Gemini API கட்டமைக்கப்படவில்லை." : "Gemini API not configured."],
      });
    }

    const { signal, clear } = createTimeoutSignal(GEMINI_TIMEOUT_MS);

    try {
      const prompt =
        language === "ta"
          ? `இந்த வீழ்ச்சி பதிவு தரவை பகுப்பாய்வு செய்க: ${typeof logs === "string" ? logs : JSON.stringify(logs)}. குடும்பத்திற்கான 3 செயல்படுத்தக்கூடிய நுண்ணறிவுகளை உருவாக்கவும்: 1. தவறான எச்சரிக்கைகளின் வடிவங்கள் மற்றும் அவற்றைக் குறைப்பது எப்படி. 2. செயல்பாட்டு நிலை போக்குகள். 3. ஒரு பாதுகாப்பு பரிந்துரை. தமிழில் பதிலளிக்கவும்.`
          : `Analyze this fall log data: ${typeof logs === "string" ? logs : JSON.stringify(logs)}. Generate 3 bullet points of actionable insights for the family: 1. Patterns in false alarms and how to reduce them. 2. Activity level trends. 3. One safety recommendation. Respond in English.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: GEMINI_TEMPERATURE,
              maxOutputTokens: 300,
            },
          }),
          signal,
        }
      );

      if (!res.ok) {
        warn("Gemini insights generation failed", { status: res.status });
        return NextResponse.json({
          insights: [
            language === "ta"
              ? "இந்த நேரத்தில் நுண்ணறிவுகளை உருவாக்க முடியவில்லை."
              : "Unable to generate insights at this time.",
          ],
        });
      }

      const data = await res.json();
      const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const lines = text
        .split("\n")
        .map((l) => l.replace(/^[•\-*]\s*/, "").trim())
        .filter((l) => l.length > 0);

      return NextResponse.json({ insights: lines.length ? lines.slice(0, 3) : [text.trim()] });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        warn("Gemini insights request timed out");
      }
      return NextResponse.json({
        insights: [
          language === "ta"
            ? "நுண்ணறிவுகளை உருவாக்க முடியவில்லை. பின்னர் மீண்டும் முயற்சிக்கவும்."
            : "Unable to generate insights. Check back later.",
        ],
      });
    } finally {
      clear();
    }
  } catch (err) {
    logError("Insights endpoint error", { error: String(err) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}