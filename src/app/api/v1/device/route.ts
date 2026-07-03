import { NextRequest, NextResponse } from "next/server";
import dbConnect, { MongoNotConfiguredError } from "@/lib/db";
import Device from "@/models/Device";
import { verifyDeviceSecret, extractDeviceAuth } from "@/lib/device-auth";
import { info, error as logError } from "@/lib/logger";

export async function PUT(req: NextRequest) {
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

    const update: Record<string, unknown> = {};
    if (body.nickname) update.nickname = body.nickname;
    if (body.language && ["en", "ta"].includes(body.language)) update.language = body.language;
    if (body.location) {
      update.location = {
        lat: body.location.lat ?? 0,
        lng: body.location.lng ?? 0,
        address: body.location.address ?? "",
      };
    }
    if (body.pin) {
      const bcryptjs = await import("bcryptjs");
      update.pin = await bcryptjs.default.hash(body.pin, 10);
    }

    await Device.updateOne({ deviceId: auth.deviceId }, { $set: update });
    info("Device config updated", { deviceId: auth.deviceId });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof MongoNotConfiguredError) {
      return NextResponse.json({ error: "Database not configured. Set MONGODB_URI in .env.local or Vercel environment variables." }, { status: 503 });
    }
    logError("Device update failed", { error: String(err) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}