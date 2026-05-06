export type DocumentStatus = "Draft" | "InReview" | "Approved" | "Signed" | "Effective" | "Superseded" | "Archived";

export type EdmsDocument = {
  id: string;
  number: string;
  title: string;
  type: string;
  owner: string;
  department: string;
  status: DocumentStatus;
  version: string;
  lifecycle: string;
  review: string;
  retention: string;
  training: "Ni potrebno" | "Dodeljeno" | "Zakljuceno";
  signature: "Ni zahtevano" | "Caka podpis" | "Podpisano";
  repository: string;
};

export const documents: EdmsDocument[] = [
  {
    id: "demo-sop-001",
    number: "SOP-0001",
    title: "Postopek obvladovanja dokumentov",
    type: "SOP",
    owner: "Quality",
    department: "QA",
    status: "Effective",
    version: "1.0",
    lifecycle: "Veljaven",
    review: "06.05.2027",
    retention: "10 let",
    training: "Zakljuceno",
    signature: "Podpisano",
    repository: "SharePoint / eDMS Documents"
  },
  {
    id: "demo-pol-001",
    number: "POL-0001",
    title: "Politika dolgorocne hrambe",
    type: "Policy",
    owner: "Compliance",
    department: "Management",
    status: "InReview",
    version: "2.0",
    lifecycle: "Pregled",
    review: "30.11.2026",
    retention: "30 let",
    training: "Ni potrebno",
    signature: "Caka podpis",
    repository: "SharePoint / eDMS Documents"
  },
  {
    id: "demo-wi-007",
    number: "WI-0007",
    title: "Navodilo za podpisovanje dokumentov",
    type: "Work instruction",
    owner: "Operations",
    department: "Operations",
    status: "Draft",
    version: "0.3",
    lifecycle: "Osnutek",
    review: "15.08.2026",
    retention: "5 let",
    training: "Dodeljeno",
    signature: "Ni zahtevano",
    repository: "SharePoint / eDMS Drafts"
  },
  {
    id: "demo-val-003",
    number: "VAL-0003",
    title: "Validacijski paket za eDMS",
    type: "Validation package",
    owner: "IT Quality",
    department: "IT",
    status: "Approved",
    version: "1.0",
    lifecycle: "Odobreno",
    review: "01.02.2027",
    retention: "Trajno",
    training: "Ni potrebno",
    signature: "Caka podpis",
    repository: "SharePoint / Validation"
  }
];

export const statusLabels: Record<DocumentStatus, string> = {
  Draft: "Osnutek",
  InReview: "V pregledu",
  Approved: "Odobreno",
  Signed: "Podpisano",
  Effective: "Veljavno",
  Superseded: "Nadomesceno",
  Archived: "Arhivirano"
};
