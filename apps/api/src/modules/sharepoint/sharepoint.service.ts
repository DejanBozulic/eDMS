type SharePointTarget = {
  mode: "placeholder" | "graph";
  path: string;
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

  // TODO: Replace with Microsoft Graph upload once Entra ID and SharePoint IDs are configured.
  return {
    mode: "placeholder",
    path: `${libraryPath}\\${folder}\\${fileName}`
  };
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
