import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import bcryptjs from "bcryptjs";
import dbConnect, { MongoNotConfiguredError } from "@/lib/db";
import Device from "@/models/Device";
import { BCRYPT_ROUNDS } from "@/config/fallguard";
import { info, error as logError } from "@/lib/logger";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json().catch(() => ({}));
    const deviceId = body.deviceId || uuidv4();
    const secret = randomBytes(32).toString("hex");
    const secretHash = await bcryptjs.hash(secret, BCRYPT_ROUNDS);

    const existing = await Device.findOne({ deviceId });
    if (existing) {
      return NextResponse.json({ error: "Device already registered. Use PUT to rotate secret." }, { status: 409 });
    }

    await Device.create({
      deviceId,
      nickname: "New Device",
      location: { lat: 0, lng: 0, address: "" },
      language: "en",
      pin: "",
      secretHash,
    });

    info("Device registered", { deviceId });

    return NextResponse.json({ deviceId, secret });
  } catch (err) {
    if (err instanceof MongoNotConfiguredError) {
      return NextResponse.json({ error: "Database not configured. Set MONGODB_URI in .env.local or Vercel environment variables." }, { status: 503 });
    }
    logError("Device registration failed", { error: String(err) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const deviceId = req.headers.get("deviceId") || req.headers.get("deviceid");
    const secret = req.headers.get("x-device-secret");

    if (!deviceId || !secret) {
      return NextResponse.json({ error: "Missing deviceId or x-device-secret header" }, { status: 401 });
    }

    await dbConnect();
    const device = await Device.findOne({ deviceId });
    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    const match = await bcryptjs.compare(secret, device.secretHash);
    if (!match) {
      return NextResponse.json({ error: "Invalid device secret" }, { status: 401 });
    }

    const newSecret = randomBytes(32).toString("hex");
    const newSecretHash = await bcryptjs.hash(newSecret, BCRYPT_ROUNDS);
    device.secretHash = newSecretHash;
    await device.save();

    info("Device secret rotated", { deviceId });

    return NextResponse.json({ deviceId, secret: newSecret });
  } catch (err) {
    if (err instanceof MongoNotConfiguredError) {
      return NextResponse.json({ error: "Database not configured. Set MONGODB_URI in .env.local or Vercel environment variables." }, { status: 503 });
    }
    logError("Device secret rotation failed", { error: String(err) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}