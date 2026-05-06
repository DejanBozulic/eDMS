import { Router } from "express";
import { z } from "zod";
import { recordAuditEvent } from "../audit/audit.service.js";
import { uploadDocumentPlaceholder } from "../sharepoint/sharepoint.service.js";

export const documentsRouter = Router();

const createDocumentSchema = z.object({
  title: z.string().min(2),
  type: z.string().min(2),
  owner: z.string().min(2),
  department: z.string().min(2),
  confidentiality: z.string().default("Internal"),
  retentionYears: z.number().int().min(1).max(100).default(10)
});

const demoDocuments = [
  {
    id: "demo-sop-001",
    documentNumber: "SOP-0001",
    title: "Postopek obvladovanja dokumentov",
    type: "SOP",
    owner: "Quality",
    department: "QA",
    status: "Effective",
    version: 1,
    reviewDueAt: "2027-05-06"
  },
  {
    id: "demo-pol-001",
    documentNumber: "POL-0001",
    title: "Politika dolgorocne hrambe",
    type: "Policy",
    owner: "Compliance",
    department: "Management",
    status: "InReview",
    version: 2,
    reviewDueAt: "2026-11-30"
  }
];

documentsRouter.get("/", (_req, res) => {
  res.json({ data: demoDocuments });
});

documentsRouter.post("/", async (req, res, next) => {
  try {
    const payload = createDocumentSchema.parse(req.body);
    const documentNumber = `${payload.type.toUpperCase()}-${String(Date.now()).slice(-6)}`;
    const sharePointTarget = await uploadDocumentPlaceholder(documentNumber, payload.title);

    const document = {
      id: crypto.randomUUID(),
      documentNumber,
      ...payload,
      status: "Draft",
      version: 1,
      sharePointTarget,
      createdAt: new Date().toISOString()
    };

    await recordAuditEvent({
      documentId: document.id,
      action: "Created",
      actor: payload.owner,
      details: { documentNumber, sharePointTarget }
    });

    res.status(201).json({ data: document });
  } catch (error) {
    next(error);
  }
});
