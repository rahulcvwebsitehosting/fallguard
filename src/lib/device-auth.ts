import bcryptjs from "bcryptjs";
import dbConnect, { MongoNotConfiguredError } from "@/lib/db";
import Device from "@/models/Device";
import { warn, error as logError } from "@/lib/logger";

export async function verifyDeviceSecret(
  deviceId: string,
  secret: string
): Promise<{ valid: boolean; device?: typeof Device.prototype }> {
  try {
    await dbConnect();
    const device = await Device.findOne({ deviceId });
    if (!device) {
      warn("Device not found", { deviceId });
      return { valid: false };
    }
    const match = await bcryptjs.compare(secret, device.secretHash);
    if (!match) {
      warn("Device secret mismatch", { deviceId });
      return { valid: false };
    }
    return { valid: true, device };
  } catch (err) {
    if (err instanceof MongoNotConfiguredError) {
      throw err;
    }
    logError("Device auth verification failed", { deviceId, error: String(err) });
    return { valid: false };
  }
}

export function extractDeviceAuth(headers: Headers): { deviceId: string; secret: string } | null {
  const deviceId = headers.get("deviceId") || headers.get("deviceid");
  const secret = headers.get("x-device-secret") || headers.get("x-device-secret");
  if (!deviceId || !secret) {
    return null;
  }
  return { deviceId, secret };
}