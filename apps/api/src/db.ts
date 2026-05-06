import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

export type DocumentRow = {
  id: string;
  documentNumber: string;
  title: string;
  type: string;
  owner: string;
  department: string;
  confidentiality: string;
  status: string;
  version: number;
  lifecycle: string;
  trainingStatus: string;
  signatureStatus: string;
  sharePointDriveId: string | null;
  sharePointItemId: string | null;
  sharePointPath: string | null;
  searchableContent: string | null;
  retentionYears: number;
  reviewDueAt: string | null;
  effectiveAt: string | null;
  archivedAt: string | null;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  sourceFilePath: string | null;
  storedFilePath: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuditEventRow = {
  id: string;
  documentId: string;
  action: string;
  actor: string;
  details: string | null;
  createdAt: string;
};

type CreateDocumentInput = Omit<
  DocumentRow,
  "id" | "createdAt" | "updatedAt" | "fileName" | "fileSize" | "mimeType" | "sourceFilePath" | "storedFilePath"
> & {
  id?: string;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  sourceFilePath?: string | null;
  storedFilePath?: string | null;
};

type AuditEventInput = {
  documentId: string;
  action: string;
  actor: string;
  details?: string;
};

type UpdateDocumentWorkflowInput = {
  status: string;
  lifecycle: string;
  signatureStatus?: string;
  effectiveAt?: string | null;
  archivedAt?: string | null;
  sharePointPath?: string | null;
  storedFilePath?: string | null;
};

const databasePath = resolve(process.cwd(), "data", "edms.sqlite");
const databaseDir = dirname(databasePath);

if (!existsSync(databaseDir)) {
  mkdirSync(databaseDir, { recursive: true });
}

const database = new DatabaseSync(databasePath);
database.exec("PRAGMA foreign_keys = ON");
database.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    documentNumber TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    owner TEXT NOT NULL,
    department TEXT NOT NULL,
    confidentiality TEXT NOT NULL DEFAULT 'Internal',
    status TEXT NOT NULL DEFAULT 'Draft',
    version INTEGER NOT NULL DEFAULT 1,
    lifecycle TEXT NOT NULL DEFAULT 'Draft',
    trainingStatus TEXT NOT NULL DEFAULT 'NotRequired',
    signatureStatus TEXT NOT NULL DEFAULT 'NotRequired',
    sharePointDriveId TEXT,
    sharePointItemId TEXT,
    sharePointPath TEXT,
    searchableContent TEXT,
    retentionYears INTEGER NOT NULL DEFAULT 10,
    reviewDueAt TEXT,
    effectiveAt TEXT,
    archivedAt TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS auditEvents (
    id TEXT PRIMARY KEY,
    documentId TEXT NOT NULL,
    action TEXT NOT NULL,
    actor TEXT NOT NULL,
    details TEXT,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS workflowTasks (
    id TEXT PRIMARY KEY,
    documentId TEXT NOT NULL,
    taskType TEXT NOT NULL,
    assignee TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open',
    dueAt TEXT,
    completedAt TEXT,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE
  );
`);

ensureDocumentColumn("fileName", "TEXT");
ensureDocumentColumn("fileSize", "INTEGER");
ensureDocumentColumn("mimeType", "TEXT");
ensureDocumentColumn("sourceFilePath", "TEXT");
ensureDocumentColumn("storedFilePath", "TEXT");

seedDocuments();

export function listDocuments(): DocumentRow[] {
  return database.prepare("SELECT * FROM documents ORDER BY createdAt DESC, documentNumber ASC").all() as DocumentRow[];
}

export function getDocument(id: string): DocumentRow | null {
  return database.prepare("SELECT * FROM documents WHERE id = ?").get(id) as DocumentRow | undefined ?? null;
}

export function listAuditEvents(documentId: string): AuditEventRow[] {
  return database.prepare("SELECT * FROM auditEvents WHERE documentId = ? ORDER BY createdAt DESC").all(documentId) as AuditEventRow[];
}

export function countDocumentsByType(type: string): number {
  const row = database.prepare("SELECT COUNT(*) as count FROM documents WHERE type = ?").get(type) as { count: number };
  return row.count;
}

export function createDocument(input: CreateDocumentInput): DocumentRow {
  const now = new Date().toISOString();
  const document: DocumentRow = {
    ...input,
    id: input.id ?? crypto.randomUUID(),
    fileName: input.fileName ?? null,
    fileSize: input.fileSize ?? null,
    mimeType: input.mimeType ?? null,
    sourceFilePath: input.sourceFilePath ?? null,
    storedFilePath: input.storedFilePath ?? null,
    createdAt: now,
    updatedAt: now
  };

  database.prepare(`
    INSERT INTO documents (
      id, documentNumber, title, type, owner, department, confidentiality, status, version,
      lifecycle, trainingStatus, signatureStatus, sharePointDriveId, sharePointItemId,
      sharePointPath, searchableContent, retentionYears, reviewDueAt, effectiveAt, archivedAt,
      fileName, fileSize, mimeType, sourceFilePath, storedFilePath,
      createdAt, updatedAt
    )
    VALUES (
      @id, @documentNumber, @title, @type, @owner, @department, @confidentiality, @status, @version,
      @lifecycle, @trainingStatus, @signatureStatus, @sharePointDriveId, @sharePointItemId,
      @sharePointPath, @searchableContent, @retentionYears, @reviewDueAt, @effectiveAt, @archivedAt,
      @fileName, @fileSize, @mimeType, @sourceFilePath, @storedFilePath,
      @createdAt, @updatedAt
    )
  `).run(document);

  return document;
}

export function createAuditEvent(input: AuditEventInput): void {
  database.prepare(`
    INSERT INTO auditEvents (id, documentId, action, actor, details, createdAt)
    VALUES (@id, @documentId, @action, @actor, @details, @createdAt)
  `).run({
    id: crypto.randomUUID(),
    documentId: input.documentId,
    action: input.action,
    actor: input.actor,
    details: input.details ?? null,
    createdAt: new Date().toISOString()
  });
}

export function updateDocumentWorkflow(id: string, input: UpdateDocumentWorkflowInput): DocumentRow | null {
  const current = getDocument(id);

  if (!current) {
    return null;
  }

  database.prepare(`
    UPDATE documents
    SET
      status = @status,
      lifecycle = @lifecycle,
      signatureStatus = @signatureStatus,
      sharePointPath = @sharePointPath,
      storedFilePath = @storedFilePath,
      effectiveAt = @effectiveAt,
      archivedAt = @archivedAt,
      updatedAt = @updatedAt
    WHERE id = @id
  `).run({
    id,
    status: input.status,
    lifecycle: input.lifecycle,
    signatureStatus: input.signatureStatus ?? current.signatureStatus,
    sharePointPath: input.sharePointPath ?? current.sharePointPath,
    storedFilePath: input.storedFilePath ?? current.storedFilePath,
    effectiveAt: input.effectiveAt ?? current.effectiveAt,
    archivedAt: input.archivedAt ?? current.archivedAt,
    updatedAt: new Date().toISOString()
  });

  return getDocument(id);
}

function ensureDocumentColumn(name: string, definition: string) {
  const columns = database.prepare("PRAGMA table_info(documents)").all() as Array<{ name: string }>;

  if (!columns.some((column) => column.name === name)) {
    database.exec(`ALTER TABLE documents ADD COLUMN ${name} ${definition}`);
  }
}

function seedDocuments() {
  const row = database.prepare("SELECT COUNT(*) as count FROM documents").get() as { count: number };

  if (row.count > 0) {
    return;
  }

  const now = new Date().toISOString();
  const seed = database.prepare(`
    INSERT INTO documents (
      id, documentNumber, title, type, owner, department, confidentiality, status, version,
      lifecycle, trainingStatus, signatureStatus, sharePointDriveId, sharePointItemId,
      sharePointPath, searchableContent, retentionYears, reviewDueAt, effectiveAt, archivedAt,
      createdAt, updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  seed.run(
    "demo-sop-001",
    "SOP-0001",
    "Postopek obvladovanja dokumentov",
    "SOP",
    "Quality",
    "QA",
    "Internal",
    "Effective",
    1,
    "Effective",
    "Completed",
    "Signed",
    null,
    null,
    "CTRL-ING d.o.o\\INZENIRING - Dokumenti\\#eDMS\\Effective\\SOP-0001.pdf",
    null,
    10,
    "2027-05-06",
    null,
    null,
    now,
    now
  );

  seed.run(
    "demo-pol-001",
    "POL-0001",
    "Politika dolgorocne hrambe",
    "Policy",
    "Compliance",
    "Management",
    "Internal",
    "InReview",
    2,
    "Review",
    "NotRequired",
    "Pending",
    null,
    null,
    "CTRL-ING d.o.o\\INZENIRING - Dokumenti\\#eDMS\\In Review\\POL-0001.pdf",
    null,
    30,
    "2026-11-30",
    null,
    null,
    now,
    now
  );
}
