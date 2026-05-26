import { uk } from "../i18n/uk";
import type { Tracker } from "../types";
import { todayIso } from "./date";

export type NotificationPermissionState = NotificationPermission | "unsupported";

export function getNotificationPermission(): NotificationPermissionState {
  return "Notification" in window ? Notification.permission : "unsupported";
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "default") return Notification.requestPermission();
  return Notification.permission;
}

export function sendDueReminder(trackers: Tracker[]) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const key = `den-bez-reminded-${todayIso()}-${hhmm}`;
  const dueTrackers = trackers.filter(
    (tracker) => !tracker.archived && tracker.remindersEnabled && tracker.reminderTime === hhmm,
  );

  if (dueTrackers.length === 0 || sessionStorage.getItem(key)) return;

  sessionStorage.setItem(key, "1");
  new Notification(uk.appTitle, {
    body: dueTrackers.length === 1 ? uk.reminderSingle(dueTrackers[0].title) : uk.reminderMany(dueTrackers.length),
  });
}
