import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Contact from "@/models/Contact";
import { verifyDeviceSecret, extractDeviceAuth } from "@/lib/device-auth";
import { error as logError } from "@/lib/logger";
import { v4 as uuidv4 } from "uuid";

async function requireAuth(req: NextRequest): Promise<{ deviceId: string } | NextResponse> {
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

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    await dbConnect();
    const contacts = await Contact.find({ deviceId: auth.deviceId }).sort({ priority: 1 });
    return NextResponse.json(contacts);
  } catch (err) {
    logError("Failed to get contacts", { error: String(err) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    await dbConnect();
    const body = await req.json().catch(() => ({}));
    if (!body.name || !body.phone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
    }

    const contact = await Contact.create({
      contactId: uuidv4(),
      deviceId: auth.deviceId,
      name: body.name,
      phone: body.phone,
      relationship: body.relationship || "",
      isHospital: body.isHospital || false,
      priority: body.priority || 1,
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (err) {
    logError("Failed to create contact", { error: String(err) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    await dbConnect();
    const body = await req.json().catch(() => ({}));
    if (!body.contactId) {
      return NextResponse.json({ error: "contactId is required" }, { status: 400 });
    }

    const update: Record<string, unknown> = {};
    if (body.name) update.name = body.name;
    if (body.phone) update.phone = body.phone;
    if (body.relationship !== undefined) update.relationship = body.relationship;
    if (body.isHospital !== undefined) update.isHospital = body.isHospital;
    if (body.priority !== undefined) update.priority = body.priority;

    await Contact.updateOne({ contactId: body.contactId, deviceId: auth.deviceId }, { $set: update });
    return NextResponse.json({ success: true });
  } catch (err) {
    logError("Failed to update contact", { error: String(err) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const contactId = searchParams.get("contactId");
    if (!contactId) {
      return NextResponse.json({ error: "contactId query parameter is required" }, { status: 400 });
    }

    await Contact.deleteOne({ contactId, deviceId: auth.deviceId });
    return NextResponse.json({ success: true });
  } catch (err) {
    logError("Failed to delete contact", { error: String(err) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}