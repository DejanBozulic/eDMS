type StatusItem = {
  label: string;
  value: number;
};

type StatusBoardProps = {
  items: StatusItem[];
};

export function StatusBoard({ items }: StatusBoardProps) {
  return (
    <section className="status-board" id="workflow" aria-label="Statusi dokumentov">
      {items.map((item) => (
        <article className="status-tile" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </article>
      ))}
    </section>
  );
}
