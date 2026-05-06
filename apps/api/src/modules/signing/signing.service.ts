type SignatureRequest = {
  documentId: string;
  signer: string;
  version: number;
};

export async function requestSignature(request: SignatureRequest): Promise<{ provider: string; reference: string }> {
  // Internal approval signature placeholder. Replace with qualified signing provider where required.
  return {
    provider: process.env.SIGNING_PROVIDER ?? "internal",
    reference: `${request.documentId}:${request.signer}:${request.version}`
  };
}
