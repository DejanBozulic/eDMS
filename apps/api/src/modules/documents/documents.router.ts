import { Router } from "express";
import { z } from "zod";
import { recordAuditEvent } from "../audit/audit.service.js";
import { uploadDocumentPlaceholder } from "../sharepoint/sharepoint.service.js";

export const documentsRouter = Router();

type DemoDocument = {
  id: string;
  documentNumber: string;
  title: string;
  type: string;
  owner: string;
  department: string;
  confidentiality?: string;
  retentionYears: number;
  status: "Draft" | "InReview" | "Approved" | "Signed" | "Effective" | "Superseded" | "Archived";
  version: number;
  lifecycle: string;
  trainingStatus: "NotRequired" | "Assigned" | "Completed";
  signatureStatus: "NotRequired" | "Pending" | "Signed";
  reviewDueAt: string | null;
  sharePointTarget?: {
    mode: "placeholder" | "graph";
    path: string;
  };
  createdAt?: string;
};

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

const demoDocuments: DemoDocument[] = [
  {
    id: "demo-sop-001",
    documentNumber: "SOP-0001",
    title: "Postopek obvladovanja dokumentov",
    type: "SOP",
    owner: "Quality",
    department: "QA",
    status: "Effective",
    version: 1,
    lifecycle: "Effective",
    trainingStatus: "Completed",
    signatureStatus: "Signed",
    reviewDueAt: "2027-05-06",
    retentionYears: 10
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
    lifecycle: "Review",
    trainingStatus: "NotRequired",
    signatureStatus: "Pending",
    reviewDueAt: "2026-11-30",
    retentionYears: 30
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

    const document: DemoDocument = {
      id: crypto.randomUUID(),
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
      reviewDueAt: null,
      sharePointTarget,
      createdAt: new Date().toISOString()
    };

    demoDocuments.unshift(document);

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
