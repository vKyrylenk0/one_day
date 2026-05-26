import { uk } from "../i18n/uk";
import type { EntryStatus, Tracker, TrackerEntry, TrackerStats } from "../types";
import { addDays, diffDays, formatDate, todayIso } from "./date";

export function effectiveStatus(tracker: Tracker, entries: TrackerEntry[], date: string): EntryStatus {
  const explicit = entries.find((entry) => entry.trackerId === tracker.id && entry.date === date);
  if (explicit) return explicit.status;
  if (date < todayIso()) return tracker.emptyDayBehavior;
  return "neutral";
}

export function calculateStats(tracker: Tracker, allEntries: TrackerEntry[]): TrackerStats {
  const entries = allEntries.filter((entry) => entry.trackerId === tracker.id);
  const today = todayIso();
  const daysSinceStart = Math.max(0, diffDays(tracker.startDate, today));
  const days = Array.from({ length: daysSinceStart + 1 }, (_, index) => addDays(tracker.startDate, index));
  const statuses = days.map((date) => ({ date, status: effectiveStatus(tracker, entries, date) }));

  let currentStreak = 0;
  for (let index = statuses.length - 1; index >= 0; index -= 1) {
    const status = statuses[index].status;
    if (status === "success") currentStreak += 1;
    else if (status === "fail" && tracker.resetOnFail) break;
    else if (status === "neutral") continue;
    else break;
  }

  let bestStreak = 0;
  let rolling = 0;
  for (const item of statuses) {
    if (item.status === "success") {
      rolling += 1;
      bestStreak = Math.max(bestStreak, rolling);
    } else if (item.status === "fail" && tracker.resetOnFail) {
      rolling = 0;
    }
  }

  const successCount = statuses.filter((item) => item.status === "success").length;
  const failCount = statuses.filter((item) => item.status === "fail").length;
  const neutralCount = statuses.filter((item) => item.status === "neutral").length;
  const ratedDays = successCount + failCount;
  const successRate = ratedDays > 0 ? Math.round((successCount / ratedDays) * 100) : 0;

  const monthPrefix = today.slice(0, 7);
  const eventDates = entries
    .filter((entry) => entry.status === "success")
    .map((entry) => entry.date)
    .sort();
  const intervals = eventDates.slice(1).map((date, index) => diffDays(eventDates[index], date));
  const averageInterval =
    intervals.length > 0 ? Math.round(intervals.reduce((sum, value) => sum + value, 0) / intervals.length) : undefined;

  return {
    currentStreak,
    bestStreak,
    successCount,
    failCount,
    neutralCount,
    successRate,
    eventsThisMonth: eventDates.filter((date) => date.startsWith(monthPrefix)).length,
    lastEventDate: eventDates.length > 0 ? eventDates[eventDates.length - 1] : undefined,
    averageInterval,
  };
}

export function primaryMetric(tracker: Tracker, stats: TrackerStats) {
  if (tracker.category === "event") return `${stats.eventsThisMonth} ${uk.eventsThisMonth.toLowerCase()}`;
  if (tracker.category === "avoid") return `${stats.currentStreak} ${uk.days} без`;
  return `${stats.currentStreak} ${uk.days} streak`;
}

export function secondaryMetric(tracker: Tracker, stats: TrackerStats) {
  if (tracker.category === "event") return `${uk.lastEvent}: ${formatDate(stats.lastEventDate)}`;
  return `${uk.successRate}: ${stats.successRate}%`;
}
