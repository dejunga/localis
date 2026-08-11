import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { dataset, projectId } from "../env";

let cached: ReturnType<typeof createImageUrlBuilder> | null = null;

export function urlFor(source: SanityImageSource) {
  if (!cached) {
    cached = createImageUrlBuilder({ projectId, dataset });
  }
  return cached.image(source);
}
