import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { Router } from "express";
import { z } from "zod";
import { countDocumentsByType, createAuditEvent, createDocument, getDocument, listAuditEvents, listDocuments, updateDocumentWorkflow } from "../../db.js";
import { uploadDocumentPlaceholder } from "../sharepoint/sharepoint.service.js";

export const documentsRouter = Router();

const createDocumentSchema = z.object({
  title: z.string().min(2),
  type: z.string().min(2),
  owner: z.string().min(2),
  department: z.string().min(2),
  confidentiality: z.string().default("Internal"),
  retentionYears: z.number().int().min(1).max(100).default(10),
  requiresTraining: z.boolean().default(false),
  requiresSignature: z.boolean().default(false)
});

const importLocalDocumentSchema = z.object({
  filePath: z.string().min(3),
  title: z.string().optional(),
  type: z.string().default("URS-FS"),
  owner: z.string().default("CSV"),
  department: z.string().default("Engineering"),
  confidentiality: z.string().default("Internal"),
  retentionYears: z.number().int().min(1).max(100).default(10),
  requiresTraining: z.boolean().default(false),
  requiresSignature: z.boolean().default(true)
});

const workflowActionSchema = z.object({
  action: z.enum(["submit-review", "approve", "sign", "publish", "archive"]),
  actor: z.string().min(1).default("System")
});

type WorkflowAction = z.infer<typeof workflowActionSchema>["action"];

type WorkflowTransition = {
  from: string[];
  status: string;
  lifecycle: string;
  signatureStatus?: string;
  auditAction: string;
  timestampField?: "effectiveAt" | "archivedAt";
};

const workflowTransitions: Record<WorkflowAction, WorkflowTransition> = {
  "submit-review": {
    from: ["Draft"],
    status: "InReview",
    lifecycle: "Review",
    auditAction: "SubmittedForReview"
  },
  approve: {
    from: ["InReview"],
    status: "Approved",
    lifecycle: "Approved",
    auditAction: "Approved"
  },
  sign: {
    from: ["Approved"],
    status: "Signed",
    lifecycle: "Signed",
    signatureStatus: "Signed",
    auditAction: "Signed"
  },
  publish: {
    from: ["Signed"],
    status: "Effective",
    lifecycle: "Effective",
    auditAction: "Published",
    timestampField: "effectiveAt"
  },
  archive: {
    from: ["Effective"],
    status: "Archived",
    lifecycle: "Archived",
    auditAction: "Archived",
    timestampField: "archivedAt"
  }
};

documentsRouter.get("/", async (_req, res, next) => {
  try {
    res.json({ data: listDocuments() });
  } catch (error) {
    next(error);
  }
});

documentsRouter.get("/:id", async (req, res, next) => {
  try {
    const document = getDocument(req.params.id);

    if (!document) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    res.json({
      data: {
        ...document,
        auditEvents: listAuditEvents(document.id)
      }
    });
  } catch (error) {
    next(error);
  }
});

documentsRouter.get("/:id/download", async (req, res, next) => {
  try {
    const document = getDocument(req.params.id);

    if (!document) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    if (!document.storedFilePath || !existsSync(document.storedFilePath)) {
      res.status(404).json({ error: "Stored file not found" });
      return;
    }

    res.download(document.storedFilePath, document.fileName ?? basename(document.storedFilePath));
  } catch (error) {
    next(error);
  }
});

documentsRouter.post("/:id/workflow", async (req, res, next) => {
  try {
    const payload = workflowActionSchema.parse(req.body);
    const document = getDocument(req.params.id);

    if (!document) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    const transition = workflowTransitions[payload.action];

    if (!transition.from.includes(document.status)) {
      res.status(409).json({
        error: "Workflow transition is not allowed",
        currentStatus: document.status,
        action: payload.action,
        allowedFrom: transition.from
      });
      return;
    }

    const now = new Date().toISOString();
    const updated = updateDocumentWorkflow(document.id, {
      status: transition.status,
      lifecycle: transition.lifecycle,
      signatureStatus: "signatureStatus" in transition ? transition.signatureStatus : undefined,
      effectiveAt: transition.timestampField === "effectiveAt" ? now : undefined,
      archivedAt: transition.timestampField === "archivedAt" ? now : undefined
    });

    createAuditEvent({
      documentId: document.id,
      action: transition.auditAction,
      actor: payload.actor,
      details: JSON.stringify({
        from: document.status,
        to: transition.status,
        action: payload.action
      })
    });

    res.json({
      data: {
        ...updated,
        auditEvents: listAuditEvents(document.id)
      }
    });
  } catch (error) {
    next(error);
  }
});

documentsRouter.post("/", async (req, res, next) => {
  try {
    const payload = createDocumentSchema.parse(req.body);
    const documentNumber = await nextDocumentNumber(payload.type);
    const sharePointTarget = await uploadDocumentPlaceholder(documentNumber, payload.title);

    const document = createDocument({
      documentNumber,
      title: payload.title,
      type: payload.type,
      owner: payload.owner,
      department: payload.department,
      confidentiality: payload.confidentiality,
      retentionYears: payload.retentionYears,
      status: "Draft",
      version: 1,
      lifecycle: "Draft",
      trainingStatus: payload.requiresTraining ? "Assigned" : "NotRequired",
      signatureStatus: payload.requiresSignature ? "Pending" : "NotRequired",
      sharePointDriveId: process.env.GRAPH_DRIVE_ID ?? null,
      sharePointItemId: null,
      sharePointPath: sharePointTarget.path,
      searchableContent: null,
      reviewDueAt: null,
      effectiveAt: null,
      archivedAt: null
    });

    createAuditEvent({
      documentId: document.id,
      action: "Created",
      actor: payload.owner,
      details: JSON.stringify({
        documentNumber,
        sharePointTarget
      })
    });

    res.status(201).json({ data: document });
  } catch (error) {
    next(error);
  }
});

documentsRouter.post("/import-local", async (req, res, next) => {
  try {
    const payload = importLocalDocumentSchema.parse(req.body);
    const sourceFilePath = resolve(payload.filePath);

    if (!existsSync(sourceFilePath)) {
      res.status(404).json({ error: "File not found", filePath: sourceFilePath });
      return;
    }

    const file = statSync(sourceFilePath);
    const originalFileName = basename(sourceFilePath);
    const title = payload.title ?? originalFileName.replace(extname(originalFileName), "");
    const documentNumber = extractDocumentNumber(originalFileName) ?? await nextDocumentNumber(payload.type);
    const sharePointTarget = await uploadDocumentPlaceholder(documentNumber, title, extname(originalFileName) || ".docx");
    const uploadRoot = resolve(process.cwd(), "uploads", "Drafts");
    const storedFileName = `${documentNumber}-${sanitizeFileName(title)}${extname(originalFileName) || ".docx"}`;
    const storedFilePath = join(uploadRoot, storedFileName);

    mkdirSync(uploadRoot, { recursive: true });
    copyFileSync(sourceFilePath, storedFilePath);

    const document = createDocument({
      documentNumber,
      title,
      type: payload.type,
      owner: payload.owner,
      department: payload.department,
      confidentiality: payload.confidentiality,
      retentionYears: payload.retentionYears,
      status: "Draft",
      version: 1,
      lifecycle: "Draft",
      trainingStatus: payload.requiresTraining ? "Assigned" : "NotRequired",
      signatureStatus: payload.requiresSignature ? "Pending" : "NotRequired",
      sharePointDriveId: process.env.GRAPH_DRIVE_ID ?? null,
      sharePointItemId: null,
      sharePointPath: sharePointTarget.path,
      searchableContent: null,
      reviewDueAt: null,
      effectiveAt: null,
      archivedAt: null,
      fileName: originalFileName,
      fileSize: file.size,
      mimeType: mimeTypeForExtension(extname(originalFileName)),
      sourceFilePath,
      storedFilePath
    });

    createAuditEvent({
      documentId: document.id,
      action: "FileUploaded",
      actor: payload.owner,
      details: JSON.stringify({
        sourceFilePath,
        storedFilePath,
        originalFileName,
        fileSize: file.size,
        sharePointTarget
      })
    });

    res.status(201).json({
      data: {
        ...document,
        fileName: originalFileName,
        fileSize: file.size,
        sourceFilePath,
        storedFilePath
      }
    });
  } catch (error) {
    next(error);
  }
});

async function nextDocumentNumber(type: string): Promise<string> {
  const prefix = type
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 12);

  const count = countDocumentsByType(type);

  return `${prefix || "DOC"}-${String(count + 1).padStart(4, "0")}`;
}

function extractDocumentNumber(fileName: string): string | null {
  const match = fileName.match(/(REQ-\d+)/i);
  return match?.[1].toUpperCase() ?? null;
}

function sanitizeFileName(value: string): string {
  return value
    .trim()
    .replace(/[<>:"/\\|?*#%{}~&]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

function mimeTypeForExtension(extension: string): string {
  switch (extension.toLowerCase()) {
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case ".pdf":
      return "application/pdf";
    case ".xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    default:
      return "application/octet-stream";
  }
}
