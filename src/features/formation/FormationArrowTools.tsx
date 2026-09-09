interface FormationArrowToolsProps {
  isEditing: boolean;
  isDrawing: boolean;
  canDraw: boolean;
  arrowCount: number;
  onStartDrawing: () => void;
  onClearArrows: () => void;
}

export function FormationArrowTools({
  isEditing,
  isDrawing,
  canDraw,
  arrowCount,
  onStartDrawing,
  onClearArrows,
}: FormationArrowToolsProps) {
  return (
    <section className="formation-movement-arrows" aria-label="Movement arrows">
      <header className="formation-movement-arrows__header">
        <h3>Movement arrows</h3>
        <span>{arrowCount}</span>
      </header>
      <p>
        {isDrawing
          ? "Drag the selected player marker to draw an arrow."
          : "Show the selected player's movement direction."}
      </p>
      <div className="formation-movement-arrows__actions">
        <button
          type="button"
          onClick={onStartDrawing}
          disabled={!isEditing || !canDraw || isDrawing}
        >
          Add movement arrow
        </button>
        <button
          type="button"
          onClick={onClearArrows}
          disabled={!isEditing || arrowCount === 0}
        >
          Clear arrows
        </button>
      </div>
    </section>
  );
}
