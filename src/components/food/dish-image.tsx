import { Camera } from "lucide-react";
import { cuisineById, localNameLang } from "@/lib/food/data";
import { IMAGE_LABELS, imageSrcSet, imageUrl } from "@/lib/food/images";
import type { Dish } from "@/lib/food/types";
import { cn } from "@/lib/utils";

type DishImageProps = {
  dish: Dish;
  /** The `sizes` attribute for the responsive image. */
  sizes: string;
  /** Classes for the frame; set the aspect ratio or size here. */
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  /** "compact" = small corner label, "none" = no label (only for tiny thumbnails next to the dish name). */
  label?: "compact" | "none";
};

/**
 * The one image component for a dish, used on cards, detail pages and the cart
 * so every surface shows the same thing. Stock photos are always labeled as
 * representative and AI images as AI-generated; our own photos need no label;
 * dishes without an accurate image get a labeled placeholder.
 */
export function DishImage({
  dish,
  sizes,
  className,
  imgClassName,
  priority = false,
  label = "compact",
}: DishImageProps) {
  const image = dish.image;

  if (image.kind === "placeholder") {
    const cuisine = cuisineById[dish.cuisine];
    return (
      <div
        role="img"
        aria-label={`No photo yet for ${dish.name}`}
        className={cn("@container relative overflow-hidden bg-surface", className)}
        style={{
          backgroundImage: `radial-gradient(120% 90% at 15% 0%, ${cuisine.accent}3d 0%, transparent 60%), radial-gradient(80% 70% at 100% 100%, ${cuisine.accent}24 0%, transparent 60%)`,
        }}
      >
        <div className="flex size-full flex-col justify-between p-[6cqi]">
          <p className="text-[clamp(0.625rem,3.2cqi,0.8125rem)] font-medium tracking-[0.14em] text-muted uppercase">
            {cuisine.name}
            {dish.tradition ? ` · ${dish.tradition}` : ""}
          </p>
          <p
            lang={localNameLang(dish)}
            dir="auto"
            className="font-display text-[clamp(1rem,9.5cqi,3.25rem)] leading-[1.1] font-semibold break-words text-fg/90"
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
    <div className={cn("relative overflow-hidden bg-surface", className)}>
      <img
        src={imageUrl(image.src, 828)}
        srcSet={imageSrcSet(image.src)}
        sizes={sizes}
        alt={alt}
        width={1200}
        height={900}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={cn("food-frame size-full object-cover", imgClassName)}
        style={{ objectPosition: image.focal }}
      />
      {label === "compact" && badge ? (
        <span
          className="absolute bottom-2 left-2 rounded-full bg-bg/80 px-2 py-0.5 text-[11px] font-medium text-fg/90 backdrop-blur-sm"
          title={badge.title}
          // The alt text already announces AI images; don't say it twice.
          aria-hidden={image.kind === "generated" ? true : undefined}
        >
          {badge.text}
        </span>
      ) : null}
    </div>
  );
}
