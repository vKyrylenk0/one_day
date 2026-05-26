export type TrackerCategory = "avoid" | "habit" | "event";
export type EmptyDayBehavior = "fail" | "neutral";
export type EntryStatus = "success" | "fail" | "neutral";

export type Tracker = {
  id: string;
  title: string;
  category: TrackerCategory;
  startDate: string;
  createdAt: string;
  updatedAt: string;
  emptyDayBehavior: EmptyDayBehavior;
  resetOnFail: boolean;
  remindersEnabled: boolean;
  reminderTime?: string;
  color?: string;
  icon?: string;
  archived: boolean;
};

export type TrackerEntry = {
  id: string;
  trackerId: string;
  date: string;
  status: EntryStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type AppState = {
  version: 1;
  trackers: Tracker[];
  entries: TrackerEntry[];
};

export type TrackerStats = {
  currentStreak: number;
  bestStreak: number;
  successCount: number;
  failCount: number;
  neutralCount: number;
  successRate: number;
  eventsThisMonth: number;
  lastEventDate?: string;
  averageInterval?: number;
};

export type CalendarDay = {
  date: string;
  inMonth: boolean;
};
