import dayjs from "dayjs";

export function formatDuration(totalMinutes: number): string {
  const m = Math.max(0, Math.round(totalMinutes));
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem === 0 ? `${h}h` : `${h}h ${rem}m`;
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const mm = Math.floor(total / 60);
  const ss = total % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export function todayKey(): string {
  return dayjs().format("YYYY-MM-DD");
}

export function dayKey(d: dayjs.Dayjs): string {
  return d.format("YYYY-MM-DD");
}

export function formatDueDate(iso: string | null): string {
  if (!iso) return "";
  const d = dayjs(iso);
  const today = dayjs().startOf("day");
  const diff = d.startOf("day").diff(today, "day");
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff < 7) return d.format("ddd");
  return d.format("MMM D");
}

export function isOverdue(iso: string | null): boolean {
  if (!iso) return false;
  return dayjs(iso).startOf("day").isBefore(dayjs().startOf("day"));
}
