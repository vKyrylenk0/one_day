import { uk } from "../i18n/uk";
import type { EmptyDayBehavior, TrackerCategory } from "../types";

export type TrackerPreset = {
  label: string;
  hint: string;
  emptyDayBehavior: EmptyDayBehavior;
  resetOnFail: boolean;
  icon: string;
};

export const trackerPresets: Record<TrackerCategory, TrackerPreset> = {
  avoid: { label: uk.presetAvoid, hint: uk.avoidHint, emptyDayBehavior: "fail", resetOnFail: true, icon: "–" },
  habit: { label: uk.presetHabit, hint: uk.habitHint, emptyDayBehavior: "fail", resetOnFail: true, icon: "+" },
  event: { label: uk.presetEvent, hint: uk.eventHint, emptyDayBehavior: "neutral", resetOnFail: false, icon: "•" },
};

export const trackerCategories = Object.keys(trackerPresets) as TrackerCategory[];
