import { Router } from "express";

export const sharePointRouter = Router();

const defaultHostname = "ctrling.sharepoint.com";
const defaultSitePath = "/sites/INZENIRING";
const defaultDriveId = "b!B9cHdCTy_0uTpR0732vk-vWFoF56n5hIuARlJF6ra7eEd5OzI2LkSLI-BoBvD3X6";
const defaultFolderPath = "%23eDMS";

sharePointRouter.get("/config", (_req, res) => {
  const hostname = process.env.GRAPH_SHAREPOINT_HOSTNAME ?? defaultHostname;
  const sitePath = process.env.GRAPH_SITE_PATH ?? defaultSitePath;
  const driveId = process.env.GRAPH_DRIVE_ID ?? defaultDriveId;

  res.json({
    data: {
      hostname,
      sitePath,
      siteUrl: `https://${hostname}${sitePath}`,
      driveId,
      folderPath: process.env.GRAPH_EDMS_FOLDER_PATH ?? defaultFolderPath,
      documentLibraryPath: process.env.GRAPH_DOCUMENT_LIBRARY_PATH ?? "CTRL-ING d.o.o\\INZENIRING - Dokumenti\\#eDMS",
      hasSiteId: Boolean(process.env.GRAPH_SITE_ID),
      hasDriveId: Boolean(driveId)
    }
  });
});
