interface PlaceholderPanelProps {
  title: string;
  description: string;
}

export function PlaceholderPanel({
  title,
  description,
}: PlaceholderPanelProps) {
  return (
    <section className="placeholder-panel" aria-labelledby={`${title}-heading`}>
      <p className="panel-kicker">Phase 1 foundation</p>
      <h2 id={`${title}-heading`}>{title}</h2>
      <p>{description}</p>
    </section>
  );
}
