import type { CalendarDay } from "../types";
import { addDays, toIsoDate } from "./date";

export function makeMonthDays(anchor = new Date()): CalendarDay[] {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  const offset = (first.getDay() + 6) % 7;
  const days: CalendarDay[] = [];

  for (let index = 0; index < offset; index += 1) {
    const date = new Date(first);
    date.setDate(first.getDate() - offset + index);
    days.push({ date: toIsoDate(date), inMonth: false });
  }

  for (let day = 1; day <= last.getDate(); day += 1) {
    days.push({ date: toIsoDate(new Date(anchor.getFullYear(), anchor.getMonth(), day)), inMonth: true });
  }

  while (days.length % 7 !== 0) {
    days.push({ date: addDays(days[days.length - 1].date, 1), inMonth: false });
  }

  return days;
}
