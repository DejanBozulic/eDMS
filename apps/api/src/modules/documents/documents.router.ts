import { Router } from "express";
import { z } from "zod";
import { countDocumentsByType, createAuditEvent, createDocument, listDocuments } from "../../db.js";
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

documentsRouter.get("/", async (_req, res, next) => {
  try {
    res.json({ data: listDocuments() });
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

async function nextDocumentNumber(type: string): Promise<string> {
  const prefix = type
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 12);

  const count = countDocumentsByType(type);

  return `${prefix || "DOC"}-${String(count + 1).padStart(4, "0")}`;
}
