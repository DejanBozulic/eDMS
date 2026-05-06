import { FilePlus2, UploadCloud } from "lucide-react";

export function CreateDocumentPanel() {
  return (
    <section className="create-panel" id="create">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Create & Upload</p>
          <h2>Nov dokument</h2>
        </div>
        <button type="button"><UploadCloud aria-hidden="true" /> Nalozi datoteko</button>
      </div>

      <form className="document-form">
        <label>
          Naziv dokumenta
          <input placeholder="npr. Postopek pregleda dobaviteljev" />
        </label>
        <label>
          Tip
          <select defaultValue="SOP">
            <option>SOP</option>
            <option>Policy</option>
            <option>Work instruction</option>
            <option>Validation package</option>
            <option>Record</option>
          </select>
        </label>
        <label>
          Lastnik
          <input placeholder="Odgovorna oseba ali skupina" />
        </label>
        <label>
          Oddelek
          <input placeholder="QA, IT, Operations ..." />
        </label>
        <label>
          Zaupnost
          <select defaultValue="Internal">
            <option>Internal</option>
            <option>Confidential</option>
            <option>Restricted</option>
          </select>
        </label>
        <label>
          Hramba
          <select defaultValue="10">
            <option value="5">5 let</option>
            <option value="10">10 let</option>
            <option value="30">30 let</option>
            <option value="permanent">Trajno</option>
          </select>
        </label>
        <button className="primary-action" type="button">
          <FilePlus2 aria-hidden="true" />
          Ustvari zapis
        </button>
      </form>
    </section>
  );
}
