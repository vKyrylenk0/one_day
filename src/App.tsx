import { useEffect, useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { CreateTrackerDialog } from "./components/CreateTrackerDialog";
import { EmptyState } from "./components/EmptyState";
import { TrackerCard } from "./components/TrackerCard";
import { TrackerDetails } from "./components/TrackerDetails";
import { archiveTracker, clearEntry, loadState, saveState, upsertEntry } from "./domain/appState";
import { todayIso } from "./domain/date";
import { getNotificationPermission, requestNotificationPermission, sendDueReminder } from "./domain/reminders";
import { uk } from "./i18n/uk";
import type { AppState, EntryStatus, Tracker } from "./types";

export function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      sendDueReminder(state.trackers);
    }, 30_000);

    return () => window.clearInterval(timer);
  }, [state.trackers]);

  const activeTrackers = state.trackers.filter((tracker) => !tracker.archived);
  const selectedTracker = state.trackers.find((tracker) => tracker.id === selectedId) ?? null;

  function addTracker(tracker: Tracker) {
    setState((current) => ({ ...current, trackers: [tracker, ...current.trackers] }));
    setShowCreate(false);
  }

  function markEntry(trackerId: string, status: EntryStatus, date = todayIso()) {
    setState((current) => upsertEntry(current, trackerId, date, status));
  }

  function clearTrackerEntry(trackerId: string, date: string) {
    setState((current) => clearEntry(current, trackerId, date));
  }

  function archiveSelectedTracker(trackerId: string) {
    setState((current) => archiveTracker(current, trackerId));
    setSelectedId(null);
  }

  async function ensureNotificationPermission() {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    return permission;
  }

  return (
    <div className="app-shell">
      <AppHeader onAddTracker={() => setShowCreate(true)} />

      <main>
        {activeTrackers.length === 0 ? (
          <EmptyState onAddTracker={() => setShowCreate(true)} />
        ) : (
          <section className="tracker-grid" aria-label={uk.activeTrackers}>
            {activeTrackers.map((tracker) => (
              <TrackerCard
                key={tracker.id}
                tracker={tracker}
                entries={state.entries}
                onMark={markEntry}
                onDetails={() => setSelectedId(tracker.id)}
              />
            ))}
          </section>
        )}
      </main>

      {showCreate && (
        <CreateTrackerDialog
          notificationPermission={notificationPermission}
          onPermission={ensureNotificationPermission}
          onCancel={() => setShowCreate(false)}
          onCreate={addTracker}
        />
      )}

      {selectedTracker && (
        <TrackerDetails
          tracker={selectedTracker}
          entries={state.entries}
          notificationPermission={notificationPermission}
          onClose={() => setSelectedId(null)}
          onMark={markEntry}
          onClear={clearTrackerEntry}
          onArchive={archiveSelectedTracker}
        />
      )}
    </div>
  );
}
