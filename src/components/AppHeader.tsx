import { formatTodayHeader } from "../domain/date";
import { uk } from "../i18n/uk";

type AppHeaderProps = {
  onAddTracker: () => void;
};

export function AppHeader({ onAddTracker }: AppHeaderProps) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{formatTodayHeader()}</p>
        <h1>{uk.appTitle}</h1>
        <p className="subtle">{uk.todayQuestion}</p>
      </div>
      <button className="primary-button" onClick={onAddTracker} aria-label={uk.addTracker}>
        + {uk.addTracker}
      </button>
    </header>
  );
}
