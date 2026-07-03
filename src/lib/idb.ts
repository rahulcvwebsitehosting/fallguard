import { openDB, type IDBPDatabase } from "idb";
import { error as logError } from "@/lib/logger";

const DB_NAME = "fallguard";
const DB_VERSION = 1;

let dbInstance: IDBPDatabase | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("alerts")) {
        db.createObjectStore("alerts", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("events")) {
        db.createObjectStore("events", { keyPath: "eventId" });
      }
      if (!db.objectStoreNames.contains("device")) {
        db.createObjectStore("device", { keyPath: "key" });
      }
    },
  });
  return dbInstance;
}

export async function storeAlert(payload: Record<string, unknown>): Promise<boolean> {
  try {
    const db = await getDB();
    await db.put("alerts", payload);
    return true;
  } catch (err) {
    logError("Failed to store alert in IndexedDB", { error: String(err) });
    return false;
  }
}

export async function getPendingAlerts(): Promise<Record<string, unknown>[]> {
  try {
    const db = await getDB();
    return await db.getAll("alerts");
  } catch (err) {
    logError("Failed to read alerts from IndexedDB", { error: String(err) });
    return [];
  }
}

export async function removeAlert(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete("alerts", id);
  } catch (err) {
    logError("Failed to remove alert from IndexedDB", { error: String(err) });
  }
}

export async function storeEvent(event: Record<string, unknown>): Promise<boolean> {
  try {
    const db = await getDB();
    await db.put("events", event);
    return true;
  } catch (err) {
    logError("Failed to store event in IndexedDB", { error: String(err) });
    return false;
  }
}

export async function getPendingEvents(): Promise<Record<string, unknown>[]> {
  try {
    const db = await getDB();
    return await db.getAll("events");
  } catch (err) {
    logError("Failed to read events from IndexedDB", { error: String(err) });
    return [];
  }
}

export async function removeEvent(eventId: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete("events", eventId);
  } catch (err) {
    logError("Failed to remove event from IndexedDB", { error: String(err) });
  }
}

export async function storeDeviceConfig(key: string, value: unknown): Promise<boolean> {
  try {
    const db = await getDB();
    await db.put("device", { key, value });
    return true;
  } catch (err) {
    logError("Failed to store device config in IndexedDB", { error: String(err) });
    return false;
  }
}

export async function getDeviceConfig(key: string): Promise<unknown | null> {
  try {
    const db = await getDB();
    const record = await db.get("device", key);
    return record?.value ?? null;
  } catch (err) {
    logError("Failed to read device config from IndexedDB", { error: String(err) });
    return null;
  }
}

export async function clearDeviceConfigs(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear("device");
  } catch (err) {
    logError("Failed to clear device configs", { error: String(err) });
  }
}