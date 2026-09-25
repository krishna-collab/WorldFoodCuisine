import type { DishImage } from "./types.ts";

/** Photos that came with the site template. Nobody on the team knows where they are from. */
const INHERITED_SOURCE = "Came with the site template; original photographer and site unknown";
const INHERITED_LICENSE = "Unknown. Confirm the license or replace the photo before relying on it";

/** A stock photo of a typical version of the dish. Always labeled on screen. */
export function representative(src: string, alt: string, focal = "50% 50%"): DishImage {
  return {
    kind: "representative",
    src,
    alt,
    focal,
    source: INHERITED_SOURCE,
    license: INHERITED_LICENSE,
    review: "needs-review",
  };
}

/**
 * A photo of our own plate of this dish. `source` says who took it and when,
 * e.g. "Photographed in our kitchen by A. Rai, October 2026". Set review to
 * "approved" once someone has checked the plate matches the recipe.
 */
export function ownPhoto(
  src: string,
  alt: string,
  {
    source,
    focal = "50% 50%",
    license = "Owned by WorldFoodCuisine",
    review = "needs-review",
  }: { source: string; focal?: string; license?: string; review?: "needs-review" | "approved" },
): DishImage {
  return { kind: "own", src, alt, focal, source, license, review };
}

/** No accurate photo yet: the UI shows a labeled "photo coming soon" card. */
export function placeholder(alt: string): DishImage {
  return { kind: "placeholder", alt, review: "awaiting-photo" };
}

/** Widths Vercel's image optimizer is allowed to produce (see vite.config.ts). */
export const IMAGE_WIDTHS = [256, 384, 640, 828, 1080, 1200, 1920] as const;

declare const __VERCEL_IMAGES__: boolean | undefined;

/** True when the build runs on Vercel, where /_vercel/image is available. */
function optimizerAvailable(): boolean {
  return typeof __VERCEL_IMAGES__ !== "undefined" && __VERCEL_IMAGES__ === true;
}

export function imageUrl(src: string, width: number, quality = 72): string {
  if (!optimizerAvailable()) return src;
  return `/_vercel/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}

/** srcset for a local image; empty when the optimizer isn't available. */
export function imageSrcSet(src: string, maxWidth = 1920): string | undefined {
  if (!optimizerAvailable()) return undefined;
  return IMAGE_WIDTHS.filter((w) => w <= maxWidth)
    .map((w) => `${imageUrl(src, w)} ${w}w`)
    .join(", ");
}
