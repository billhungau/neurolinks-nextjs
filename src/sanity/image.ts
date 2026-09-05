import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { client } from "./client";
import { isSanityConfigured } from "./env";

const builder = createImageUrlBuilder(client);

export function urlForImage(source: SanityImageSource | null | undefined) {
  if (!source || !isSanityConfigured()) return null;
  try {
    return builder.image(source);
  } catch {
    return null;
  }
}

export function insightsImageUrl(
  source: SanityImageSource | null | undefined,
  width: number,
  height?: number,
) {
  const image = urlForImage(source);
  if (!image) return null;
  const sized = height ? image.width(width).height(height) : image.width(width);
  return sized.fit("crop").auto("format").url();
}
