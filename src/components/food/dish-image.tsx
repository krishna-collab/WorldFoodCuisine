import { Camera, Sparkles } from "lucide-react";
import { cuisineById, localNameLang } from "@/lib/food/data";
import { IMAGE_LABELS, imageSrcSet, imageUrl } from "@/lib/food/images";
import type { Dish } from "@/lib/food/types";
import { cn } from "@/lib/utils";

type DishImageProps = {
  dish: Pick<Dish, "image" | "cuisine" | "name" | "localName" | "tradition">;
  /** The `sizes` attribute for the responsive image. */
  sizes: string;
  /** Classes for the frame; set the aspect ratio or size here. */
  className?: string;
  imgClassName?: string;
  /** Above-the-fold image: load eagerly with high priority (LCP). */
  priority?: boolean;
  /** "compact" = small corner label, "none" = no label (only for tiny thumbnails next to the dish name). */
  label?: "compact" | "none";
  /** Where the label sits, so it never collides with overlaid controls. */
  labelPosition?: "bottom-left" | "top-left";
};

/**
 * The one image component for a dish, used on cards, detail pages, the bag
 * and checkout, so every surface shows the same image and label. Stock photos
 * are labeled "Representative photo" and AI images "AI illustration"; our own
 * photos need no label; dishes without an accurate image get a placeholder.
 * The focal point stored with each image keeps the food in frame at any crop.
 */
export function DishImage({
  dish,
  sizes,
  className,
  imgClassName,
  priority = false,
  label = "compact",
  labelPosition = "bottom-left",
}: DishImageProps) {
  const image = dish.image;

  if (image.kind === "placeholder") {
    const cuisine = cuisineById[dish.cuisine];
    return (
      <div
        role="img"
        aria-label={`No photo yet for ${dish.name}`}
        className={cn("@container relative overflow-hidden bg-sunken", className)}
        style={{
          backgroundImage: `radial-gradient(120% 90% at 15% 0%, ${cuisine.accent}33 0%, transparent 60%)`,
        }}
      >
        <div className="flex size-full flex-col justify-between p-[6cqi]">
          <p className="text-[clamp(0.625rem,3.2cqi,0.8125rem)] font-semibold tracking-[0.14em] text-muted uppercase">
            {cuisine.name}
            {dish.tradition ? ` · ${dish.tradition}` : ""}
          </p>
          <p
            lang={localNameLang(dish)}
            dir="auto"
            className="font-display text-[clamp(1rem,9.5cqi,3.25rem)] leading-[1.1] break-words text-fg/90"
          >
            {dish.localName}
          </p>
          {label === "compact" ? (
            <p className="flex items-center gap-1.5 text-[clamp(0.625rem,3.2cqi,0.8125rem)] text-muted">
              <Camera className="size-[1.1em]" aria-hidden="true" />
              Photo coming soon
            </p>
          ) : (
            <span />
          )}
        </div>
      </div>
    );
  }

  const badge = image.kind === "own" ? null : IMAGE_LABELS[image.kind];
  // AI images say so in the alt text too, so screen readers hear it even
  // where the visible badge is left off (small thumbnails).
  const alt = image.kind === "generated" ? `AI-generated illustration. ${image.alt}` : image.alt;

  return (
    <div className={cn("relative overflow-hidden bg-sunken", className)}>
      <img
        src={imageUrl(image.src, 828)}
        srcSet={imageSrcSet(image.src)}
        sizes={sizes}
        alt={alt}
        width={1200}
        height={900}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
        className={cn("food-frame size-full object-cover", imgClassName)}
        style={{ objectPosition: image.focal }}
      />
      {label === "compact" && badge ? (
        <span
          className={cn(
            "absolute left-2 inline-flex items-center gap-1 rounded-full bg-surface/90 px-2 py-0.5 text-[0.6875rem] font-semibold text-fg shadow-[0_1px_2px_rgb(0_0_0/0.12)] backdrop-blur-sm",
            labelPosition === "top-left" ? "top-2" : "bottom-2",
          )}
          title={badge.title}
          // The alt text already announces AI images; don't say it twice.
          aria-hidden={image.kind === "generated" ? true : undefined}
        >
          {image.kind === "generated" ? (
            <Sparkles className="size-3" aria-hidden="true" />
          ) : (
            <Camera className="size-3" aria-hidden="true" />
          )}
          {badge.text}
        </span>
      ) : null}
    </div>
  );
}
