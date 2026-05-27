import type { CSSProperties } from "react";
import { useMemo } from "react";
import { makeMonthDays } from "../domain/calendar";
import { formatDate, parseIso, todayIso } from "../domain/date";
import { trackerPresets } from "../domain/trackerPresets";
import { calculateStats, effectiveStatus, primaryMetric, secondaryMetric } from "../domain/stats";
import { uk } from "../i18n/uk";
import type { EntryStatus, Tracker, TrackerEntry, TrackerStats } from "../types";
import { Stat } from "./Stat";

type TrackerDetailsProps = {
  tracker: Tracker;
  entries: TrackerEntry[];
  notificationPermission: string;
  onClose: () => void;
  onMark: (trackerId: string, status: EntryStatus, date?: string) => void;
  onClear: (trackerId: string, date: string) => void;
  onArchive: (trackerId: string) => void;
};

const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

export function TrackerDetails({
  tracker,
  entries,
  notificationPermission,
  onClose,
  onMark,
  onClear,
  onArchive,
}: TrackerDetailsProps) {
  const stats = calculateStats(tracker, entries);
  const preset = trackerPresets[tracker.category];

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="details-panel" aria-label={`${uk.details}: ${tracker.title}`}>
        <div className="modal-head">
          <button type="button" className="ghost-button" onClick={onClose}>
            {uk.back}
          </button>
          <button type="button" className="icon-button" onClick={onClose} aria-label={uk.cancel}>
            ×
          </button>
        </div>

        <div className="details-hero" style={{ "--accent": tracker.color } as CSSProperties}>
          <span className="tracker-icon large" aria-hidden="true">
            {preset.icon}
          </span>
          <div>
            <p className="eyebrow">{preset.label}</p>
            <h2>{tracker.title}</h2>
            <div className="metric">{primaryMetric(tracker, stats)}</div>
            <p>{secondaryMetric(tracker, stats)}</p>
          </div>
        </div>

        <StatsGrid tracker={tracker} stats={stats} />
        <HistoryCalendar tracker={tracker} entries={entries} onMark={onMark} onClear={onClear} />
        <SettingsBlock tracker={tracker} notificationPermission={notificationPermission} onArchive={onArchive} />
      </section>
    </div>
  );
}

function StatsGrid({ tracker, stats }: { tracker: Tracker; stats: TrackerStats }) {
  return (
    <div className="stats-grid">
      <Stat label={uk.currentStreak} value={`${stats.currentStreak} ${uk.days}`} />
      <Stat label={uk.bestStreak} value={`${stats.bestStreak} ${uk.days}`} />
      <Stat label={uk.successCount} value={String(stats.successCount)} />
      <Stat label={uk.failCount} value={String(stats.failCount)} />
      <Stat label={uk.successRate} value={`${stats.successRate}%`} />
      {tracker.category === "event" && <Stat label={uk.eventsThisMonth} value={String(stats.eventsThisMonth)} />}
      {tracker.category === "event" && <Stat label={uk.lastEvent} value={formatDate(stats.lastEventDate)} />}
      {tracker.category === "event" && (
        <Stat label={uk.averageInterval} value={stats.averageInterval ? `${stats.averageInterval} ${uk.days}` : uk.noDate} />
      )}
    </div>
  );
}

function HistoryCalendar({
  tracker,
  entries,
  onMark,
  onClear,
}: {
  tracker: Tracker;
  entries: TrackerEntry[];
  onMark: (trackerId: string, status: EntryStatus, date?: string) => void;
  onClear: (trackerId: string, date: string) => void;
}) {
  const days = useMemo(() => makeMonthDays(), []);

  return (
    <section>
      <h3>{uk.history}</h3>
      <div className="weekday-row" aria-hidden="true">
        {weekdays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="calendar-grid">
        {days.map(({ date, inMonth }) => {
          const explicit = entries.find((entry) => entry.trackerId === tracker.id && entry.date === date);
          const status = explicit?.status ?? (date < todayIso() && date >= tracker.startDate ? effectiveStatus(tracker, entries, date) : undefined);

          return (
            <div key={date} className={inMonth ? "day-cell" : "day-cell muted"}>
              <span>{parseIso(date).getDate()}</span>
              <div className={`dot ${status ?? "none"}`} aria-label={status ?? uk.pending} />
              {date >= tracker.startDate && date <= todayIso() && (
                <div className="day-actions">
                  <button onClick={() => onMark(tracker.id, "success", date)}>
                    {tracker.category === "event" ? uk.eventHappened : uk.success}
                  </button>
                  <button onClick={() => onMark(tracker.id, "fail", date)}>{uk.fail}</button>
                  <button onClick={() => onMark(tracker.id, "neutral", date)}>{uk.neutral}</button>
                  <button onClick={() => onClear(tracker.id, date)}>{uk.clear}</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SettingsBlock({
  tracker,
  notificationPermission,
  onArchive,
}: {
  tracker: Tracker;
  notificationPermission: string;
  onArchive: (trackerId: string) => void;
}) {
  return (
    <section className="settings-block">
      <h3>{uk.settings}</h3>
      <dl>
        <div>
          <dt>{uk.emptyDay}</dt>
          <dd>{tracker.emptyDayBehavior === "fail" ? uk.emptyFail : uk.emptyNeutral}</dd>
        </div>
        <div>
          <dt>{uk.resetOnFail}</dt>
          <dd>{tracker.resetOnFail ? uk.yes : uk.no}</dd>
        </div>
        <div>
          <dt>{uk.reminders}</dt>
          <dd>{tracker.remindersEnabled ? `${tracker.reminderTime} · ${notificationPermission}` : uk.off}</dd>
        </div>
      </dl>
      {notificationPermission === "denied" && <p className="warning">{uk.notificationDenied}</p>}
      {notificationPermission === "unsupported" && <p className="warning">{uk.notificationUnsupported}</p>}
      <button className="danger-button" onClick={() => onArchive(tracker.id)}>
        {uk.archive}
      </button>
    </section>
  );
}
