import { APP_TIME_ZONE } from "../constants";
import { uk } from "../i18n/uk";

export function todayIso() {
  return toIsoDate(new Date());
}

export function toIsoDate(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "01";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function parseIso(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: string, days: number) {
  const parsed = parseIso(date);
  parsed.setDate(parsed.getDate() + days);
  return toIsoDate(parsed);
}

export function diffDays(start: string, end: string) {
  return Math.round((parseIso(end).getTime() - parseIso(start).getTime()) / 86_400_000);
}

export function formatDate(date?: string) {
  if (!date) return uk.noDate;
  return new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "short", timeZone: APP_TIME_ZONE }).format(parseIso(date));
}

export function formatTodayHeader() {
  return new Intl.DateTimeFormat("uk-UA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: APP_TIME_ZONE,
  }).format(new Date());
}
