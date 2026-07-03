import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import dbConnect from "@/lib/db";
import FallEvent from "@/models/FallEvent";
import Contact from "@/models/Contact";
import Device from "@/models/Device";
import { verifyDeviceSecret, extractDeviceAuth } from "@/lib/device-auth";
import { createTimeoutSignal } from "@/lib/api-utils";
import { ALERT_RATE_LIMIT_MS, SMS_TIMEOUT_MS, WHATSAPP_TIMEOUT_MS } from "@/config/fallguard";
import { info, warn, error as logError } from "@/lib/logger";

async function sendSMS(phoneNumbers: string[], message: string): Promise<{ success: boolean; messageId?: string }> {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) {
    warn("FAST2SMS_API_KEY not configured");
    return { success: false };
  }
  const { signal, clear } = createTimeoutSignal(SMS_TIMEOUT_MS);
  try {
    const numbers = phoneNumbers.join(",");
    const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: "q",
        message,
        language: "english",
        numbers,
      }),
      signal,
    });
    const data = await res.json();
    if (!res.ok) {
      warn("Fast2SMS request failed", { status: res.status, data });
      return { success: false };
    }
    info("SMS sent successfully", { messageId: data.request_id });
    return { success: true, messageId: data.request_id };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      warn("Fast2SMS request timed out");
    } else {
      logError("Fast2SMS request error", { error: String(err) });
    }
    return { success: false };
  } finally {
    clear();
  }
}

async function sendWhatsApp(phoneNumber: string, message: string): Promise<{ success: boolean }> {
  const apiKey = process.env.CALLMEBOT_API_KEY;
  if (!apiKey) {
    warn("CALLMEBOT_API_KEY not configured");
    return { success: false };
  }
  const { signal, clear } = createTimeoutSignal(WHATSAPP_TIMEOUT_MS);
  try {
    const encoded = encodeURIComponent(message);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phoneNumber}&text=${encoded}&apikey=${apiKey}`;
    const res = await fetch(url, { signal });
    if (!res.ok) {
      warn("CallMeBot request failed", { status: res.status });
      return { success: false };
    }
    info("WhatsApp sent successfully", { phoneNumber });
    return { success: true };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      warn("CallMeBot request timed out");
    } else {
      logError("CallMeBot request error", { error: String(err) });
    }
    return { success: false };
  } finally {
    clear();
  }
}

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
    if (!body.message) {
      return NextResponse.json({ error: "Alert message is required" }, { status: 400 });
    }

    await dbConnect();

    const recent = await FallEvent.findOne({
      deviceId: auth.deviceId,
      alertSent: true,
      timestamp: { $gt: new Date(Date.now() - ALERT_RATE_LIMIT_MS) },
    });
    if (recent) {
      return NextResponse.json(
        { error: "Rate limited. Alert already sent recently." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(ALERT_RATE_LIMIT_MS / 1000)) } }
      );
    }

    const contacts = await Contact.find({ deviceId: auth.deviceId });
    const device = await Device.findOne({ deviceId: auth.deviceId });

    const phoneNumbers = contacts.map((c) => c.phone);
    const smsResult = await sendSMS(phoneNumbers, body.message);

    let whatsappResult = { success: false };
    for (const contact of contacts) {
      if (contact.isHospital || contact.priority === 1) {
        whatsappResult = await sendWhatsApp(contact.phone, body.message);
        break;
      }
    }

    const event = await FallEvent.create({
      eventId: uuidv4(),
      deviceId: auth.deviceId,
      timestamp: new Date(),
      snapshotUrl: body.snapshotUrl || "",
      heuristicTriggered: true,
      geminiClassification: "FALLEN",
      cancelled: false,
      alertSent: (smsResult.success || whatsappResult.success),
      smsStatus: smsResult.success ? "sent" : "failed",
      whatsappStatus: whatsappResult.success ? "sent" : "failed",
      gpsLocation: {
        lat: body.gps?.lat ?? device?.location?.lat ?? 0,
        lng: body.gps?.lng ?? device?.location?.lng ?? 0,
      },
      retryCount: 0,
    });

    info("Alert dispatch completed", {
      eventId: event.eventId,
      sms: smsResult.success ? "sent" : "failed",
      whatsapp: whatsappResult.success ? "sent" : "failed",
    });

    return NextResponse.json({
      eventId: event.eventId,
      smsStatus: smsResult.success ? "sent" : "failed",
      whatsappStatus: whatsappResult.success ? "sent" : "failed",
      alertSent: event.alertSent,
    });
  } catch (err) {
    logError("Alert dispatch failed", { error: String(err) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}