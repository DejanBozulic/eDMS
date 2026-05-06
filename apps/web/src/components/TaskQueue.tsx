import { CheckCircle2, Clock3, FileSignature, MessageSquareText } from "lucide-react";

const tasks = [
  { icon: MessageSquareText, label: "Preglej dokument", title: "POL-0001 Politika dolgorocne hrambe", due: "Danes" },
  { icon: FileSignature, label: "E-podpis", title: "VAL-0003 Validacijski paket za eDMS", due: "Jutri" },
  { icon: CheckCircle2, label: "Read & understood", title: "SOP-0001 Postopek obvladovanja dokumentov", due: "06.05.2026" }
];

export function TaskQueue() {
  return (
    <section className="task-queue" id="tasks">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Home / Tasks</p>
          <h2>Moje naloge</h2>
        </div>
        <Clock3 aria-hidden="true" />
      </div>
      <div className="task-list">
        {tasks.map((task) => {
          const Icon = task.icon;
          return (
            <article className="task-item" key={task.title}>
              <Icon aria-hidden="true" />
              <div>
                <span>{task.label}</span>
                <strong>{task.title}</strong>
              </div>
              <time>{task.due}</time>
            </article>
          );
        })}
      </div>
    </section>
  );
}
