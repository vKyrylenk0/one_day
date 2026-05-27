import type { CSSProperties } from "react";
import { trackerPresets } from "../domain/trackerPresets";
import { calculateStats, primaryMetric, secondaryMetric } from "../domain/stats";
import { todayIso } from "../domain/date";
import { uk } from "../i18n/uk";
import type { EntryStatus, Tracker, TrackerEntry } from "../types";

type TrackerCardProps = {
  tracker: Tracker;
  entries: TrackerEntry[];
  onMark: (trackerId: string, status: EntryStatus) => void;
  onDetails: () => void;
};

export function TrackerCard({ tracker, entries, onMark, onDetails }: TrackerCardProps) {
  const stats = calculateStats(tracker, entries);
  const todayEntry = entries.find((entry) => entry.trackerId === tracker.id && entry.date === todayIso());
  const todayLabel = getTodayLabel(tracker, todayEntry?.status);
  const preset = trackerPresets[tracker.category];

  return (
    <article className="tracker-card" style={{ "--accent": tracker.color } as CSSProperties}>
      <div className="card-head">
        <span className="tracker-icon" aria-hidden="true">
          {preset.icon}
        </span>
        <div>
          <h2>{tracker.title}</h2>
          <p>{preset.label}</p>
        </div>
      </div>
      <div className="metric">{primaryMetric(tracker, stats)}</div>
      <p className="subtle">{secondaryMetric(tracker, stats)}</p>
      <div className={`status-pill status-${todayEntry?.status ?? "pending"}`}>{todayLabel}</div>
      <div className="quick-actions">
        <button onClick={() => onMark(tracker.id, "success")}>
          {tracker.category === "event" ? uk.eventHappened : uk.success}
        </button>
        {tracker.category !== "event" && <button onClick={() => onMark(tracker.id, "fail")}>{uk.fail}</button>}
        <button className="ghost-button" onClick={onDetails}>
          {uk.details}
        </button>
      </div>
    </article>
  );
}

function getTodayLabel(tracker: Tracker, status?: EntryStatus) {
  if (status === "success") return tracker.category === "event" ? uk.eventMarked : uk.todaySuccess;
  if (status === "fail") return uk.todayFail;
  if (status === "neutral") return uk.neutralDay;
  return uk.pending;
}
