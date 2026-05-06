import { Download, FileText, History } from "lucide-react";
import type { DocumentDetail } from "../lib/documentsApi";

type DocumentDetailPanelProps = {
  document: DocumentDetail | null;
  isLoading: boolean;
};

export function DocumentDetailPanel({ document, isLoading }: DocumentDetailPanelProps) {
  if (isLoading) {
    return (
      <section className="document-detail">
        <div className="system-message">Nalaganje podrobnosti dokumenta ...</div>
      </section>
    );
  }

  if (!document) {
    return null;
  }

  return (
    <section className="document-detail" id="signing">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Document detail</p>
          <h2>{document.number}</h2>
        </div>
        <span className={`status-pill ${document.status.toLowerCase()}`}>{document.lifecycle}</span>
      </div>

      <dl>
        <div><dt>Naziv</dt><dd>{document.title}</dd></div>
        <div><dt>Tip</dt><dd>{document.type}</dd></div>
        <div><dt>Lastnik</dt><dd>{document.owner}</dd></div>
        <div><dt>Oddelek</dt><dd>{document.department}</dd></div>
        <div><dt>Podpis</dt><dd>{document.signature}</dd></div>
        <div><dt>Training</dt><dd>{document.training}</dd></div>
        <div><dt>Velikost</dt><dd>{document.fileSize ? formatBytes(document.fileSize) : "Ni datoteke"}</dd></div>
        <div><dt>Hramba</dt><dd>{document.retention}</dd></div>
      </dl>

      <div className="detail-grid">
        <article className="file-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Source document</p>
              <h2>Datoteka</h2>
            </div>
            <FileText aria-hidden="true" />
          </div>
          <p>{document.fileName ?? "Datoteka se ni nalozena."}</p>
          <span>{document.repository}</span>
          {document.fileName ? (
            <a className="download-link" href={document.downloadUrl}>
              <Download aria-hidden="true" />
              Prenesi dokument
            </a>
          ) : null}
        </article>

        <article className="audit-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Audit trail</p>
              <h2>Revizijska sled</h2>
            </div>
            <History aria-hidden="true" />
          </div>
          <div className="audit-list">
            {document.auditEvents.length > 0 ? document.auditEvents.map((event) => (
              <div className="audit-item" key={event.id}>
                <strong>{event.action}</strong>
                <span>{event.actor} - {formatDateTime(event.createdAt)}</span>
              </div>
            )) : <p>Za ta dokument se ni revizijskih dogodkov.</p>}
          </div>
        </article>
      </div>
    </section>
  );
}

function formatBytes(value: number): string {
  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("sl-SI", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}
