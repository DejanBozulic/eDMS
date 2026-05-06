import { FilePlus2, UploadCloud } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { CreateDocumentPayload } from "../lib/documentsApi";

type CreateDocumentPanelProps = {
  onCreate: (payload: CreateDocumentPayload) => Promise<void>;
};

const initialForm = {
  title: "",
  type: "SOP",
  owner: "",
  department: "",
  confidentiality: "Internal",
  retentionYears: "10",
  requiresTraining: false,
  requiresSignature: true
};

export function CreateDocumentPanel({ onCreate }: CreateDocumentPanelProps) {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.title.trim() || !form.owner.trim() || !form.department.trim()) {
      setError("Vnesi naziv, lastnika in oddelek.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreate({
        title: form.title.trim(),
        type: form.type,
        owner: form.owner.trim(),
        department: form.department.trim(),
        confidentiality: form.confidentiality,
        retentionYears: Number(form.retentionYears),
        requiresTraining: form.requiresTraining,
        requiresSignature: form.requiresSignature
      });
      setForm(initialForm);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Napaka pri ustvarjanju dokumenta.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="create-panel" id="create">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Create & Upload</p>
          <h2>Nov dokument</h2>
        </div>
        <button type="button"><UploadCloud aria-hidden="true" /> Nalozi datoteko</button>
      </div>

      <form className="document-form" onSubmit={handleSubmit}>
        <label>
          Naziv dokumenta
          <input
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="npr. Postopek pregleda dobaviteljev"
            value={form.title}
          />
        </label>
        <label>
          Tip
          <select onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} value={form.type}>
            <option>SOP</option>
            <option>Policy</option>
            <option>Work instruction</option>
            <option>Validation package</option>
            <option>Record</option>
          </select>
        </label>
        <label>
          Lastnik
          <input
            onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))}
            placeholder="Odgovorna oseba ali skupina"
            value={form.owner}
          />
        </label>
        <label>
          Oddelek
          <input
            onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))}
            placeholder="QA, IT, Operations ..."
            value={form.department}
          />
        </label>
        <label>
          Zaupnost
          <select
            onChange={(event) => setForm((current) => ({ ...current, confidentiality: event.target.value }))}
            value={form.confidentiality}
          >
            <option>Internal</option>
            <option>Confidential</option>
            <option>Restricted</option>
          </select>
        </label>
        <label>
          Hramba
          <select
            onChange={(event) => setForm((current) => ({ ...current, retentionYears: event.target.value }))}
            value={form.retentionYears}
          >
            <option value="5">5 let</option>
            <option value="10">10 let</option>
            <option value="30">30 let</option>
            <option value="100">Trajno</option>
          </select>
        </label>
        <label className="toggle-row">
          <input
            checked={form.requiresTraining}
            onChange={(event) => setForm((current) => ({ ...current, requiresTraining: event.target.checked }))}
            type="checkbox"
          />
          Read & understood
        </label>
        <label className="toggle-row">
          <input
            checked={form.requiresSignature}
            onChange={(event) => setForm((current) => ({ ...current, requiresSignature: event.target.checked }))}
            type="checkbox"
          />
          Zahteva e-podpis
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="primary-action" disabled={isSubmitting} type="submit">
          <FilePlus2 aria-hidden="true" />
          {isSubmitting ? "Ustvarjam ..." : "Ustvari zapis"}
        </button>
      </form>
    </section>
  );
}
