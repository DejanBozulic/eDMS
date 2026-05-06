type AuditEventInput = {
  documentId: string;
  action: string;
  actor: string;
  details?: Record<string, unknown>;
};

export async function recordAuditEvent(event: AuditEventInput): Promise<void> {
  // TODO: Persist with Prisma once the database is connected.
  console.info("audit", JSON.stringify(event));
}
