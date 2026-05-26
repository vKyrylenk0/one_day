import { uk } from "../i18n/uk";

type EmptyStateProps = {
  onAddTracker: () => void;
};

export function EmptyState({ onAddTracker }: EmptyStateProps) {
  return (
    <section className="empty-state">
      <h2>{uk.emptyTitle}</h2>
      <p>{uk.emptyText}</p>
      <button className="primary-button" onClick={onAddTracker}>
        + {uk.addTracker}
      </button>
    </section>
  );
}
