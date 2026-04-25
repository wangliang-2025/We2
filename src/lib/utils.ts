import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pad(n: number, len = 2) {
  return String(n).padStart(len, "0");
}

export type Duration = {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
};

export function getDuration(from: Date, to: Date = new Date()): Duration {
  const diffMs = Math.max(0, to.getTime() - from.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();

  if (days < 0) {
    months -= 1;
    const prev = new Date(to.getFullYear(), to.getMonth(), 0);
    days += prev.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
    hours: totalHours % 24,
    minutes: totalMinutes % 60,
    seconds: totalSeconds % 60,
    totalDays,
    totalHours,
    totalMinutes,
    totalSeconds,
  };
}

export function formatDate(d: Date | string, withTime = false) {
  const date = typeof d === "string" ? new Date(d) : d;
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  if (!withTime) return `${y}-${m}-${day}`;
  return `${y}-${m}-${day} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function daysUntil(targetMonth: number, targetDay: number): number {
  const now = new Date();
  let target = new Date(now.getFullYear(), targetMonth - 1, targetDay);
  if (target.getTime() < now.setHours(0, 0, 0, 0)) {
    target = new Date(now.getFullYear() + 1, targetMonth - 1, targetDay);
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
