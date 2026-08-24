import { storage } from "@/src/utils/storage";

// The scalar storage helper only stores string|number|boolean|null and
// JSON-serializes internally. To persist objects/arrays we stringify to a
// string ourselves and let the helper store it, then parse on read.

export const KEYS = {
  subjects: "studyflow:subjects",
  tasks: "studyflow:tasks",
  sessions: "studyflow:sessions",
  profile: "studyflow:profile",
} as const;

export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await storage.getItem(key, null);
  if (raw === null || typeof raw !== "string") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveJSON<T>(key: string, value: T): Promise<void> {
  await storage.setItem(key, JSON.stringify(value));
}
