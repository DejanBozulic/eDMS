const documents = [
  {
    number: "SOP-0001",
    title: "Postopek obvladovanja dokumentov",
    type: "SOP",
    owner: "Quality",
    status: "Veljavno",
    version: "1.0",
    review: "06.05.2027"
  },
  {
    number: "POL-0001",
    title: "Politika dolgorocne hrambe",
    type: "Policy",
    owner: "Compliance",
    status: "V pregledu",
    version: "2.0",
    review: "30.11.2026"
  },
  {
    number: "WI-0007",
    title: "Navodilo za podpisovanje dokumentov",
    type: "Work instruction",
    owner: "Operations",
    status: "Osnutek",
    version: "0.3",
    review: "15.08.2026"
  }
];

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
              <th>Status</th>
              <th>Verzija</th>
              <th>Pregled</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr key={document.number}>
                <td>{document.number}</td>
                <td>{document.title}</td>
                <td>{document.type}</td>
                <td>{document.owner}</td>
                <td><span className="status-pill">{document.status}</span></td>
                <td>{document.version}</td>
                <td>{document.review}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
