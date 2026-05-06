import { Archive, CheckCircle2, FileSignature, Files, Search, ShieldCheck, UploadCloud } from "lucide-react";
import { DocumentTable } from "./components/DocumentTable";
import { StatusBoard } from "./components/StatusBoard";

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
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <ShieldCheck aria-hidden="true" />
          <div>
            <strong>eDMS</strong>
            <span>SharePoint</span>
          </div>
        </div>
        <nav className="nav-list" aria-label="Glavna navigacija">
          <a className="active" href="#register"><Files aria-hidden="true" /> Register</a>
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
            <input placeholder="Iskanje po stevilki, nazivu ali lastniku" />
          </label>
        </header>

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
        <DocumentTable />
      </section>
    </main>
  );
}
