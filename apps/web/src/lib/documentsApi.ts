import type { EdmsDocument } from "../data/documents";

type ApiDocument = {
  id: string;
  documentNumber: string;
  title: string;
  type: string;
  owner: string;
  department: string;
  status: EdmsDocument["status"];
  version: number;
  lifecycle: string;
  trainingStatus: "NotRequired" | "Assigned" | "Completed";
  signatureStatus: "NotRequired" | "Pending" | "Signed";
  reviewDueAt?: string;
  retentionYears: number;
  sharePointPath?: string | null;
  sharePointWebUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  sourceFilePath?: string | null;
  storedFilePath?: string | null;
  auditEvents?: AuditEvent[];
  sharePointTarget?: {
    path: string;
  };
};

export type AuditEvent = {
  id: string;
  documentId: string;
  action: string;
  actor: string;
  details: string | null;
  createdAt: string;
};

export type WorkflowAction = "submit-review" | "approve" | "sign" | "publish" | "archive";

export type CreateDocumentPayload = {
  title: string;
  type: string;
  owner: string;
  department: string;
  confidentiality: string;
  retentionYears: number;
  requiresTraining: boolean;
  requiresSignature: boolean;
};

export type DocumentDetail = EdmsDocument & {
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  sourceFilePath?: string | null;
  storedFilePath?: string | null;
  sharePointWebUrl?: string | null;
  auditEvents: AuditEvent[];
  downloadUrl: string;
};

type ApiResponse<T> = {
  data: T;
};

const trainingLabels: Record<ApiDocument["trainingStatus"], EdmsDocument["training"]> = {
  NotRequired: "Ni potrebno",
  Assigned: "Dodeljeno",
  Completed: "Zakljuceno"
};

const signatureLabels: Record<ApiDocument["signatureStatus"], EdmsDocument["signature"]> = {
  NotRequired: "Ni zahtevano",
  Pending: "Caka podpis",
  Signed: "Podpisano"
};

export async function fetchDocuments(): Promise<EdmsDocument[]> {
  const response = await fetch("/api/documents");

  if (!response.ok) {
    throw new Error("Dokumentov ni bilo mogoce naloziti.");
  }

  const payload = await response.json() as ApiResponse<ApiDocument[]>;
  return payload.data.map(mapApiDocument);
}

export async function createDocument(payload: CreateDocumentPayload): Promise<EdmsDocument> {
  const response = await fetch("/api/documents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Dokumenta ni bilo mogoce ustvariti.");
  }

  const result = await response.json() as ApiResponse<ApiDocument>;
  return mapApiDocument(result.data);
}

export async function fetchDocumentDetail(documentId: string): Promise<DocumentDetail> {
  const response = await fetch(`/api/documents/${documentId}`);

  if (!response.ok) {
    throw new Error("Podrobnosti dokumenta ni bilo mogoce naloziti.");
  }

  const payload = await response.json() as ApiResponse<ApiDocument>;
  const document = mapApiDocument(payload.data);

  return {
    ...document,
    fileName: payload.data.fileName,
    fileSize: payload.data.fileSize,
    mimeType: payload.data.mimeType,
    sourceFilePath: payload.data.sourceFilePath,
    storedFilePath: payload.data.storedFilePath,
    sharePointWebUrl: payload.data.sharePointWebUrl,
    auditEvents: payload.data.auditEvents ?? [],
    downloadUrl: `/api/documents/${documentId}/download`
  };
}

export async function runWorkflowAction(documentId: string, action: WorkflowAction, actor = "Dejan"): Promise<DocumentDetail> {
  const response = await fetch(`/api/documents/${documentId}/workflow`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ action, actor })
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(result?.error ?? "Workflow akcije ni bilo mogoce izvesti.");
  }

  const payload = await response.json() as ApiResponse<ApiDocument>;
  const document = mapApiDocument(payload.data);

  return {
    ...document,
    fileName: payload.data.fileName,
    fileSize: payload.data.fileSize,
    mimeType: payload.data.mimeType,
    sourceFilePath: payload.data.sourceFilePath,
    storedFilePath: payload.data.storedFilePath,
    auditEvents: payload.data.auditEvents ?? [],
    downloadUrl: `/api/documents/${documentId}/download`
  };
}

function mapApiDocument(document: ApiDocument): EdmsDocument {
  return {
    id: document.id,
    number: document.documentNumber,
    title: document.title,
    type: document.type,
    owner: document.owner,
    department: document.department,
    status: document.status,
    version: `${document.version}.0`,
    lifecycle: document.lifecycle,
    review: document.reviewDueAt ? formatDate(document.reviewDueAt) : "Ni doloceno",
    retention: `${document.retentionYears} let`,
    training: trainingLabels[document.trainingStatus],
    signature: signatureLabels[document.signatureStatus],
    repository: document.sharePointWebUrl ?? document.sharePointPath ?? document.sharePointTarget?.path ?? "SharePoint / eDMS Documents"
  };
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("sl-SI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}
