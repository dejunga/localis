import { put } from "@vercel/blob";

// Store je privatan - URL bez tokena ne radi. Download ide preko admin rute (Task 16).
export async function uploadPonudaPdf(nazivDatoteke: string, pdf: Buffer): Promise<string> {
  const blob = await put(`ponude/${nazivDatoteke}`, pdf, {
    access: "private",
    contentType: "application/pdf",
    addRandomSuffix: true,
  });
  return blob.url;
}

export async function downloadPonudaPdf(url: string): Promise<Buffer> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN nije postavljen.");
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Blob download failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}
