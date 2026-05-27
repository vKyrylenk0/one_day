import { FormEvent, useState } from "react";
import { TRACKER_COLORS } from "../constants";
import { todayIso } from "../domain/date";
import { trackerCategories, trackerPresets } from "../domain/trackerPresets";
import { uk } from "../i18n/uk";
import type { EmptyDayBehavior, Tracker, TrackerCategory } from "../types";

type CreateTrackerDialogProps = {
  notificationPermission: string;
  onPermission: () => Promise<string>;
  onCancel: () => void;
  onCreate: (tracker: Tracker) => void;
};

export function CreateTrackerDialog({
  notificationPermission,
  onPermission,
  onCancel,
  onCreate,
}: CreateTrackerDialogProps) {
  const [category, setCategory] = useState<TrackerCategory>("avoid");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(todayIso());
  const [emptyDayBehavior, setEmptyDayBehavior] = useState<EmptyDayBehavior>(trackerPresets.avoid.emptyDayBehavior);
  const [resetOnFail, setResetOnFail] = useState(trackerPresets.avoid.resetOnFail);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("20:00");
  const [color, setColor] = useState(TRACKER_COLORS[0]);

  function selectCategory(next: TrackerCategory) {
    setCategory(next);
    setEmptyDayBehavior(trackerPresets[next].emptyDayBehavior);
    setResetOnFail(trackerPresets[next].resetOnFail);
    setColor(TRACKER_COLORS[trackerCategories.indexOf(next)]);
  }

  async function handleReminderToggle(checked: boolean) {
    if (!checked) {
      setRemindersEnabled(false);
      return;
    }
    const permission = await onPermission();
    setRemindersEnabled(permission === "granted");
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const now = new Date().toISOString();
    onCreate({
      id: crypto.randomUUID(),
      title: title.trim(),
      category,
      startDate,
      createdAt: now,
      updatedAt: now,
      emptyDayBehavior,
      resetOnFail,
      remindersEnabled,
      reminderTime: remindersEnabled ? reminderTime : undefined,
      color,
      icon: trackerPresets[category].icon,
      archived: false,
    });
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal-panel" onSubmit={submit} aria-label={uk.createTitle}>
        <div className="modal-head">
          <h2>{uk.createTitle}</h2>
          <button type="button" className="icon-button" onClick={onCancel} aria-label={uk.cancel}>
            ×
          </button>
        </div>

        <fieldset>
          <legend>{uk.choosePreset}</legend>
          <div className="preset-grid">
            {trackerCategories.map((key) => (
              <button
                type="button"
                key={key}
                className={category === key ? "preset active" : "preset"}
                onClick={() => selectCategory(key)}
              >
                <span>{trackerPresets[key].icon}</span>
                <strong>{trackerPresets[key].label}</strong>
                <small>{trackerPresets[key].hint}</small>
              </button>
            ))}
          </div>
        </fieldset>

        <label>
          {uk.titleLabel}
          <input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder={uk.titlePlaceholder} />
        </label>

        <label>
          {uk.startDate}
          <input type="date" required value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        </label>

        <section className="form-section">
          <h3>{uk.rules}</h3>
          <label>
            {uk.emptyDay}
            <select value={emptyDayBehavior} onChange={(event) => setEmptyDayBehavior(event.target.value as EmptyDayBehavior)}>
              <option value="fail">{uk.emptyFail}</option>
              <option value="neutral">{uk.emptyNeutral}</option>
            </select>
          </label>
          <label className="check-row">
            <input type="checkbox" checked={resetOnFail} onChange={(event) => setResetOnFail(event.target.checked)} />
            <span>{uk.resetOnFail}</span>
          </label>
        </section>

        <section className="form-section">
          <h3>{uk.reminders}</h3>
          <label className="check-row">
            <input type="checkbox" checked={remindersEnabled} onChange={(event) => void handleReminderToggle(event.target.checked)} />
            <span>{uk.reminders}</span>
          </label>
          {remindersEnabled && (
            <label>
              {uk.reminderTime}
              <input type="time" value={reminderTime} onChange={(event) => setReminderTime(event.target.value)} />
            </label>
          )}
          {notificationPermission === "denied" && <p className="warning">{uk.notificationDenied}</p>}
          {notificationPermission === "unsupported" && <p className="warning">{uk.notificationUnsupported}</p>}
          <p className="subtle">{uk.notificationLimited}</p>
          <p className="subtle">{uk.notificationInstallHint}</p>
        </section>

        <div className="color-row" aria-label={uk.color}>
          {TRACKER_COLORS.map((option) => (
            <button
              type="button"
              key={option}
              className={option === color ? "swatch active" : "swatch"}
              style={{ background: option }}
              onClick={() => setColor(option)}
              aria-label={`${uk.color} ${option}`}
            />
          ))}
        </div>

        <div className="modal-actions">
          <button type="button" className="ghost-button" onClick={onCancel}>
            {uk.cancel}
          </button>
          <button type="submit" className="primary-button" disabled={title.trim().length === 0}>
            {uk.save}
          </button>
        </div>
      </form>
    </div>
  );
}
