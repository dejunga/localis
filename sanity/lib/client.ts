import { createClient, type SanityClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

let cached: SanityClient | null = null;

// Lijeno – createClient baca grešku ako projectId nije postavljen, a build ne
// smije pasti samo zato što Sanity još nije konfiguriran.
export function getClient(): SanityClient {
  if (!cached) {
    cached = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      perspective: "published",
    });
  }
  return cached;
}
