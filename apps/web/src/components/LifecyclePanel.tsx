import { Archive, CheckCircle2, FileSignature, GitBranch, LockKeyhole, MessageSquareText } from "lucide-react";

const stages = [
  { icon: GitBranch, label: "Osnutek", detail: "Ustvarjanje, metapodatki, upload" },
  { icon: MessageSquareText, label: "Pregled", detail: "Komentarji, pripombe, popravki" },
  { icon: CheckCircle2, label: "Odobritev", detail: "Kontrolirana odobritev verzije" },
  { icon: FileSignature, label: "E-podpis", detail: "Avtentikacija in podpisni zapis" },
  { icon: LockKeyhole, label: "Veljavnost", detail: "Zaklenjena uradna verzija" },
  { icon: Archive, label: "Arhiv", detail: "Retention, izvoz paketa, audit" }
];

export function LifecyclePanel() {
  return (
    <section className="lifecycle-panel" id="workflow">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Controlled lifecycle</p>
          <h2>Zivljenjski cikel</h2>
        </div>
      </div>
      <div className="lifecycle-grid">
        {stages.map((stage) => {
          const Icon = stage.icon;
          return (
            <article className="lifecycle-stage" key={stage.label}>
              <Icon aria-hidden="true" />
              <strong>{stage.label}</strong>
              <span>{stage.detail}</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}
