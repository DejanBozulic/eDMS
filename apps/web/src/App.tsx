import { Archive, CheckCircle2, ClipboardList, FileSignature, Files, Search, ShieldCheck, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CreateDocumentPanel } from "./components/CreateDocumentPanel";
import { DocumentDetailPanel } from "./components/DocumentDetailPanel";
import { DocumentTable } from "./components/DocumentTable";
import { LifecyclePanel } from "./components/LifecyclePanel";
import { StatusBoard } from "./components/StatusBoard";
import { TaskQueue } from "./components/TaskQueue";
import type { EdmsDocument } from "./data/documents";
import { createDocument, fetchDocumentDetail, fetchDocuments, runWorkflowAction, type CreateDocumentPayload, type DocumentDetail, type WorkflowAction } from "./lib/documentsApi";

const workflow = [
  { label: "Osnutek", value: 8 },
  { label: "V pregledu", value: 3 },
  { label: "Odobreno", value: 2 },
  { label: "Veljavno", value: 42 },
  { label: "Arhiv", value: 128 }
];

const actions = [
  { label: "Nov dokument", icon: UploadCloud },
  { label: "Pregled", icon: CheckCircle2 },
  { label: "Podpis", icon: FileSignature },
  { label: "Arhiv", icon: Archive }
];

export function App() {
  const [documents, setDocuments] = useState<EdmsDocument[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [message, setMessage] = useState("Pripravljeno za delo.");
  const [documentDetail, setDocumentDetail] = useState<DocumentDetail | null>(null);

  useEffect(() => {
    fetchDocuments()
      .then((items) => {
        setDocuments(items);
        setSelectedDocumentId(items[0]?.id ?? null);
        setMessage(`Nalozenih dokumentov: ${items.length}`);
      })
      .catch((error: Error) => setMessage(error.message))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedDocumentId) {
      setDocumentDetail(null);
      return;
    }

    setIsDetailLoading(true);
    fetchDocumentDetail(selectedDocumentId)
      .then(setDocumentDetail)
      .catch((error: Error) => setMessage(error.message))
      .finally(() => setIsDetailLoading(false));
  }, [selectedDocumentId]);

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return documents;
    }

    return documents.filter((document) =>
      [
        document.number,
        document.title,
        document.type,
        document.owner,
        document.department,
        document.status,
        document.repository
      ].some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [documents, query]);

  const selectedDocument = documents.find((document) => document.id === selectedDocumentId) ?? documents[0];

  async function handleCreateDocument(payload: CreateDocumentPayload) {
    setMessage("Ustvarjam dokumentni zapis ...");
    const document = await createDocument(payload);
    setDocuments((current) => [document, ...current]);
    setSelectedDocumentId(document.id);
    setMessage(`Ustvarjen dokument ${document.number}`);
  }

  async function handleWorkflowAction(action: WorkflowAction) {
    if (!documentDetail) {
      return;
    }

    setMessage("Izvajam workflow akcijo ...");
    const updated = await runWorkflowAction(documentDetail.id, action);
    setDocumentDetail(updated);
    setDocuments((current) => current.map((document) => document.id === updated.id ? updated : document));
    setMessage(`${updated.number}: status je ${updated.lifecycle}`);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <ShieldCheck aria-hidden="true" />
          <div>
            <strong>eDMS</strong>
            <span>Dokumenti</span>
          </div>
        </div>
        <nav className="nav-list" aria-label="Glavna navigacija">
          <a className="active" href="#register"><Files aria-hidden="true" /> Register</a>
          <a href="#create"><UploadCloud aria-hidden="true" /> Ustvari</a>
          <a href="#tasks"><ClipboardList aria-hidden="true" /> Naloge</a>
          <a href="#workflow"><CheckCircle2 aria-hidden="true" /> Workflow</a>
          <a href="#signing"><FileSignature aria-hidden="true" /> Podpisi</a>
          <a href="#archive"><Archive aria-hidden="true" /> Arhiv</a>
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Dokumentacijski sistem</p>
            <h1>Register dokumentov</h1>
          </div>
          <label className="search-box">
            <Search aria-hidden="true" />
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Iskanje po stevilki, nazivu, metapodatkih ali vsebini"
              value={query}
            />
          </label>
        </header>
        <div className="system-message" role="status">{isLoading ? "Nalaganje dokumentov ..." : message}</div>

        <section className="quick-actions" aria-label="Hitre akcije">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button key={action.label} type="button">
                <Icon aria-hidden="true" />
                <span>{action.label}</span>
              </button>
            );
          })}
        </section>

        <StatusBoard items={workflow} />
        <section className="dashboard-grid">
          <TaskQueue />
          <CreateDocumentPanel onCreate={handleCreateDocument} />
        </section>
        <DocumentTable
          documents={filteredDocuments}
          onSelectDocument={setSelectedDocumentId}
          selectedDocumentId={selectedDocument?.id}
        />
        <DocumentDetailPanel
          document={documentDetail}
          isLoading={isDetailLoading}
          onWorkflowAction={handleWorkflowAction}
        />
        <LifecyclePanel />
      </section>
    </main>
  );
}
