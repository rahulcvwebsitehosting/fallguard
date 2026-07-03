import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import dbConnect from "@/lib/db";
import Device from "@/models/Device";
import { PIN_RATE_LIMIT_MAX, PIN_RATE_LIMIT_WINDOW_MS } from "@/config/fallguard";
import { warn } from "@/lib/logger";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimits = new Map<string, RateLimitEntry>();

function getRateLimitKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  return ip;
}

function checkPinRateLimit(key: string): boolean {
  const entry = rateLimits.get(key);
  const now = Date.now();
  if (!entry || now > entry.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + PIN_RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= PIN_RATE_LIMIT_MAX) {
    return false;
  }
  entry.count++;
  return true;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "PIN",
      credentials: {
        pin: { label: "4-Digit PIN", type: "text" },
        deviceId: { label: "Device ID", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials?.pin || !credentials?.deviceId) {
          return null;
        }

        const ip = getRateLimitKey(req as unknown as Request);
        if (!checkPinRateLimit(ip)) {
          warn("PIN rate limit exceeded", { ip, deviceId: credentials.deviceId });
          throw new Error("RATE_LIMITED");
        }

        try {
          await dbConnect();
          const device = await Device.findOne({ deviceId: credentials.deviceId });
          if (!device || !device.pin) {
            return null;
          }

          const valid = await bcryptjs.compare(credentials.pin, device.pin);
          if (!valid) {
            return null;
          }

          return {
            id: device.deviceId,
            name: device.nickname,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/dashboard",
    error: "/dashboard",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.deviceId = user.id;
        token.nickname = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.name = (token.nickname as string) || (token.name as string) || undefined;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};