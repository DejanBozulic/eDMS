import { createReadStream, statSync } from "node:fs";
import { basename } from "node:path";

type SharePointTarget = {
  mode: "placeholder" | "graph";
  path: string;
  driveId?: string;
  itemId?: string;
  webUrl?: string;
};

type GraphDriveItem = {
  id: string;
  webUrl: string;
  parentReference?: {
    driveId?: string;
    path?: string;
  };
};

type UploadSession = {
  uploadUrl: string;
};

export type EdmsStorageFolder = "Drafts" | "In Review" | "Effective" | "Archive" | "Validation";

export async function uploadDocumentPlaceholder(
  documentNumber: string,
  title: string,
  extension = ".pdf",
  folder: EdmsStorageFolder = "Drafts"
): Promise<SharePointTarget> {
  return buildSharePointPlaceholderPath(documentNumber, title, extension, folder);
}

export async function uploadLocalFileToSharePoint(
  filePath: string,
  documentNumber: string,
  title: string,
  extension = ".pdf",
  mimeType = "application/octet-stream",
  folder: EdmsStorageFolder = "Drafts"
): Promise<SharePointTarget> {
  const placeholder = buildSharePointPlaceholderPath(documentNumber, title, extension, folder);

  if (!isGraphUploadConfigured()) {
    return placeholder;
  }

  const driveId = requiredEnv("GRAPH_DRIVE_ID");
  const token = await getGraphAccessToken();
  const fileName = basename(placeholder.path);
  const graphPath = buildGraphItemPath(fileName, folder);
  const fileSize = statSync(filePath).size;
  const item = fileSize <= 4 * 1024 * 1024
    ? await uploadSmallFile(token, driveId, graphPath, filePath, mimeType)
    : await uploadLargeFile(token, driveId, graphPath, filePath, mimeType, fileSize);

  return {
    mode: "graph",
    path: placeholder.path,
    driveId: item.parentReference?.driveId ?? driveId,
    itemId: item.id,
    webUrl: item.webUrl
  };
}

export function buildSharePointPlaceholderPath(
  documentNumber: string,
  title: string,
  extension = ".pdf",
  folder: EdmsStorageFolder = "Drafts"
): SharePointTarget {
  const libraryPath = normalizeFolderPath(
    process.env.GRAPH_DOCUMENT_LIBRARY_PATH ?? "CTRL-ING d.o.o\\INZENIRING - Dokumenti\\#eDMS"
  );
  const fileName = `${documentNumber}-${sanitizeFileName(title)}${normalizeExtension(extension)}`;

  return {
    mode: "placeholder",
    path: `${libraryPath}\\${folder}\\${fileName}`
  };
}

function isGraphUploadConfigured(): boolean {
  return process.env.SHAREPOINT_UPLOAD_MODE === "graph"
    && Boolean(process.env.ENTRA_TENANT_ID)
    && Boolean(process.env.ENTRA_CLIENT_ID)
    && Boolean(process.env.ENTRA_CLIENT_SECRET)
    && Boolean(process.env.GRAPH_DRIVE_ID);
}

async function getGraphAccessToken(): Promise<string> {
  const tenantId = requiredEnv("ENTRA_TENANT_ID");
  const body = new URLSearchParams({
    client_id: requiredEnv("ENTRA_CLIENT_ID"),
    client_secret: requiredEnv("ENTRA_CLIENT_SECRET"),
    grant_type: "client_credentials",
    scope: "https://graph.microsoft.com/.default"
  });

  const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    throw new Error(`Graph token request failed: ${response.status} ${await response.text()}`);
  }

  const payload = await response.json() as { access_token: string };
  return payload.access_token;
}

async function uploadSmallFile(
  token: string,
  driveId: string,
  graphPath: string,
  filePath: string,
  mimeType: string
): Promise<GraphDriveItem> {
  const response = await fetch(`https://graph.microsoft.com/v1.0/drives/${driveId}/root:/${graphPath}:/content`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": mimeType
    },
    body: createReadStream(filePath) as unknown as BodyInit,
    duplex: "half"
  } as RequestInit & { duplex: "half" });

  if (!response.ok) {
    throw new Error(`SharePoint upload failed: ${response.status} ${await response.text()}`);
  }

  return response.json() as Promise<GraphDriveItem>;
}

async function uploadLargeFile(
  token: string,
  driveId: string,
  graphPath: string,
  filePath: string,
  mimeType: string,
  fileSize: number
): Promise<GraphDriveItem> {
  const sessionResponse = await fetch(`https://graph.microsoft.com/v1.0/drives/${driveId}/root:/${graphPath}:/createUploadSession`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      item: {
        "@microsoft.graph.conflictBehavior": "replace"
      }
    })
  });

  if (!sessionResponse.ok) {
    throw new Error(`SharePoint upload session failed: ${sessionResponse.status} ${await sessionResponse.text()}`);
  }

  const session = await sessionResponse.json() as UploadSession;
  const response = await fetch(session.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Length": String(fileSize),
      "Content-Range": `bytes 0-${fileSize - 1}/${fileSize}`,
      "Content-Type": mimeType
    },
    body: createReadStream(filePath) as unknown as BodyInit,
    duplex: "half"
  } as RequestInit & { duplex: "half" });

  if (!response.ok) {
    throw new Error(`SharePoint large upload failed: ${response.status} ${await response.text()}`);
  }

  return response.json() as Promise<GraphDriveItem>;
}

function buildGraphItemPath(fileName: string, folder: EdmsStorageFolder): string {
  const rootPath = process.env.GRAPH_EDMS_FOLDER_PATH ?? "%23eDMS";
  return `${rootPath}/${encodePathSegment(folder)}/${encodePathSegment(fileName)}`;
}

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function normalizeExtension(value: string): string {
  if (!value) {
    return ".pdf";
  }

  return value.startsWith(".") ? value : `.${value}`;
}

function sanitizeFileName(value: string): string {
  return value
    .trim()
    .replace(/[<>:"/\\|?*#%{}~&]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

function normalizeFolderPath(value: string): string {
  return value.replace(/[\\/]+$/g, "");
}

function encodePathSegment(value: string): string {
  return encodeURIComponent(value).replace(/%2F/gi, "/");
}
