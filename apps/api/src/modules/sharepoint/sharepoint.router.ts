import { Router } from "express";

export const sharePointRouter = Router();

sharePointRouter.get("/config", (_req, res) => {
  res.json({
    data: {
      hostname: process.env.GRAPH_SHAREPOINT_HOSTNAME ?? "ctrling.sharepoint.com",
      sitePath: process.env.GRAPH_SITE_PATH ?? "/sites/INZENIRING",
      siteUrl: `https://${process.env.GRAPH_SHAREPOINT_HOSTNAME ?? "ctrling.sharepoint.com"}${process.env.GRAPH_SITE_PATH ?? "/sites/INZENIRING"}`,
      documentLibraryPath: process.env.GRAPH_DOCUMENT_LIBRARY_PATH ?? "CTRL-ING d.o.o\\INZENIRING - Dokumenti\\#eDMS",
      hasSiteId: Boolean(process.env.GRAPH_SITE_ID),
      hasDriveId: Boolean(process.env.GRAPH_DRIVE_ID)
    }
  });
});
