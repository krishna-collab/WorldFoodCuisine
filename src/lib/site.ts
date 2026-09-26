export const SITE_NAME = "WorldFoodCuisine";

/** Canonical origin. Change this when a custom domain is connected. */
export const SITE_URL = "https://world-food-cuisine.vercel.app";

export const SITE_DESCRIPTION =
  "Fifty dishes from India, Nepal, Thailand, Mexico and Italy, with every ingredient listed. Cooked with olive oil, butter and whole spices. No preservatives.";

/** The kitchen's promise, in the owner's words. Shown on the home and ingredients pages. */
export const KITCHEN_PROMISE = [
  {
    title: "Olive oil, butter and ghee",
    body: "The fats we cook with. Every dish says which one it uses.",
  },
  {
    title: "Masalas from whole spices",
    body: "Spice blends and pastes start from whole spices, and every spice is listed on the dish.",
  },
  {
    title: "Whole, minimally processed ingredients",
    body: "No preservatives and no chemical additives.",
  },
] as const;

/** The share card (public/og.jpg) is typographic: no food photos, real or generated. */
export const SHARE_IMAGE_ALT =
  "WorldFoodCuisine: World food with nothing to hide. 50 dishes from five cuisines, every ingredient listed.";

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

type PageHeadInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  /** Keep the page out of search results (checkout, order pages). */
  noindex?: boolean;
};

/** Title, description, canonical URL and share-preview tags for one page. */
export function pageHead({ title, description, path, image = "/og.jpg", noindex }: PageHeadInput) {
  const fullTitle = title === SITE_NAME ? title : `${title} · ${SITE_NAME}`;
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);
  if (noindex) {
    return {
      meta: [
        { title: fullTitle },
        { name: "description", content: description },
        { name: "robots", content: "noindex" },
      ],
      links: [],
    };
  }
  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: imageUrl },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: SHARE_IMAGE_ALT },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: imageUrl },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
