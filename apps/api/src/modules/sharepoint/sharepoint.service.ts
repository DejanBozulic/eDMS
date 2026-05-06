type SharePointTarget = {
  mode: "placeholder" | "graph";
  path: string;
};

export async function uploadDocumentPlaceholder(documentNumber: string, title: string): Promise<SharePointTarget> {
  const libraryPath = process.env.GRAPH_DOCUMENT_LIBRARY_PATH ?? "CTRL-ING d.o.o\\INZENIRING - Dokumenti\\#eDMS";
  const fileName = `${documentNumber}-${sanitizeFileName(title)}.pdf`;

  // TODO: Replace with Microsoft Graph upload once Entra ID and SharePoint IDs are configured.
  return {
    mode: "placeholder",
    path: `${libraryPath}\\Drafts\\${fileName}`
  };
}

function sanitizeFileName(value: string): string {
  return value
    .trim()
    .replace(/[<>:"/\\|?*#%{}~&]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/-+/g, "-")
    .slice(0, 120);
}
