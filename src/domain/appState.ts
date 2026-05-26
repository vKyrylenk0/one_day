import { STORAGE_KEY } from "../constants";
import type { AppState, EntryStatus } from "../types";

export const emptyState: AppState = { version: 1, trackers: [], entries: [] };

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState;
    const parsed = JSON.parse(raw) as AppState;
    if (parsed.version !== 1 || !Array.isArray(parsed.trackers) || !Array.isArray(parsed.entries)) return emptyState;
    return parsed;
  } catch {
    return emptyState;
  }
}

export function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function upsertEntry(state: AppState, trackerId: string, date: string, status: EntryStatus): AppState {
  const now = new Date().toISOString();
  const existing = state.entries.find((entry) => entry.trackerId === trackerId && entry.date === date);
  const entries = existing
    ? state.entries.map((entry) => (entry.id === existing.id ? { ...entry, status, updatedAt: now } : entry))
    : [...state.entries, { id: crypto.randomUUID(), trackerId, date, status, createdAt: now, updatedAt: now }];
  return { ...state, entries };
}

export function clearEntry(state: AppState, trackerId: string, date: string): AppState {
  return { ...state, entries: state.entries.filter((entry) => !(entry.trackerId === trackerId && entry.date === date)) };
}

export function archiveTracker(state: AppState, trackerId: string): AppState {
  const now = new Date().toISOString();
  return {
    ...state,
    trackers: state.trackers.map((tracker) =>
      tracker.id === trackerId ? { ...tracker, archived: true, updatedAt: now } : tracker,
    ),
  };
}
