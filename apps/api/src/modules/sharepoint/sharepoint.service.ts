type SharePointTarget = {
  mode: "placeholder" | "graph";
  path: string;
};

export async function uploadDocumentPlaceholder(documentNumber: string, title: string): Promise<SharePointTarget> {
  const libraryPath = process.env.GRAPH_DOCUMENT_LIBRARY_PATH ?? "/Shared Documents/eDMS";

  // TODO: Replace with Microsoft Graph upload once Entra ID and SharePoint IDs are configured.
  return {
    mode: "placeholder",
    path: `${libraryPath}/${documentNumber}-${title}.pdf`
  };
}
