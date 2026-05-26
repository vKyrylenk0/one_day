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
  avoid: { label: uk.presetAvoid, hint: uk.avoidHint, emptyDayBehavior: "fail", resetOnFail: true, icon: "Б" },
  habit: { label: uk.presetHabit, hint: uk.habitHint, emptyDayBehavior: "fail", resetOnFail: true, icon: "З" },
  event: { label: uk.presetEvent, hint: uk.eventHint, emptyDayBehavior: "neutral", resetOnFail: false, icon: "П" },
};

export const trackerCategories = Object.keys(trackerPresets) as TrackerCategory[];
