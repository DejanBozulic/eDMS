import { documents, statusLabels } from "../data/documents";

export function DocumentTable() {
  return (
    <section className="table-section" id="register">
      <div className="section-heading">
        <h2>Dokumenti</h2>
        <button type="button">Izvoz paketa</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Stevilka</th>
              <th>Naziv</th>
              <th>Tip</th>
              <th>Lastnik</th>
              <th>Oddelek</th>
              <th>Status</th>
              <th>Verzija</th>
              <th>Podpis</th>
              <th>Training</th>
              <th>Pregled</th>
              <th>Hramba</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr key={document.number}>
                <td>{document.number}</td>
                <td>{document.title}</td>
                <td>{document.type}</td>
                <td>{document.owner}</td>
                <td>{document.department}</td>
                <td><span className={`status-pill ${document.status.toLowerCase()}`}>{statusLabels[document.status]}</span></td>
                <td>{document.version}</td>
                <td>{document.signature}</td>
                <td>{document.training}</td>
                <td>{document.review}</td>
                <td>{document.retention}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
