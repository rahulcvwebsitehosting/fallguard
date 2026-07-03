import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import dbConnect from "@/lib/db";
import FallEvent from "@/models/FallEvent";
import { verifyDeviceSecret, extractDeviceAuth } from "@/lib/device-auth";
import { error as logError } from "@/lib/logger";
import { v4 as uuidv4 } from "uuid";

async function requireDeviceAuth(req: NextRequest): Promise<{ deviceId: string } | NextResponse> {
  const auth = extractDeviceAuth(req.headers);
  if (!auth) {
    return NextResponse.json({ error: "Missing device auth headers" }, { status: 401 });
  }
  const { valid } = await verifyDeviceSecret(auth.deviceId, auth.secret);
  if (!valid) {
    return NextResponse.json({ error: "Invalid device credentials" }, { status: 401 });
  }
  return { deviceId: auth.deviceId };
}

async function requireDashboardAuth(req: NextRequest): Promise<NextResponse | null> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const authErr = await requireDashboardAuth(req);
    if (authErr) return authErr;

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get("deviceId");
    const latest = searchParams.get("latest");
    const since = searchParams.get("since");

    if (!deviceId) {
      return NextResponse.json({ error: "deviceId query parameter is required" }, { status: 400 });
    }

    if (latest === "true") {
      const event = await FallEvent.findOne({ deviceId }).sort({ timestamp: -1 });
      return NextResponse.json(event);
    }

    const query: Record<string, unknown> = { deviceId };
    if (since) {
      query.timestamp = { $gt: new Date(since) };
    }

    const events = await FallEvent.find(query).sort({ timestamp: -1 }).limit(50);
    return NextResponse.json(events);
  } catch (err) {
    logError("Failed to get events", { error: String(err) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireDeviceAuth(req);
    if (auth instanceof NextResponse) return auth;

    await dbConnect();
    const body = await req.json().catch(() => ({}));

    const event = await FallEvent.create({
      eventId: uuidv4(),
      deviceId: auth.deviceId,
      timestamp: new Date(),
      snapshotUrl: body.snapshotUrl || "",
      heuristicTriggered: body.heuristicTriggered ?? false,
      geminiClassification: body.geminiClassification || "UNKNOWN",
      cancelled: body.cancelled ?? false,
      alertSent: body.alertSent ?? false,
      smsStatus: body.smsStatus || "pending",
      whatsappStatus: body.whatsappStatus || "pending",
      gpsLocation: {
        lat: body.gpsLocation?.lat ?? 0,
        lng: body.gpsLocation?.lng ?? 0,
      },
      retryCount: body.retryCount ?? 0,
    });

    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    logError("Failed to log event", { error: String(err) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}