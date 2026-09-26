/**
 * Writes public/sitemap.xml from the menu data. Run it after adding or
 * renaming dishes or cuisines, or after changing SITE_URL:
 *
 *   npm run sitemap
 *
 * src/lib/food/data.test.ts fails when the committed file is out of date.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { sitemapPaths, sitemapXml } from "../src/lib/sitemap.ts";

const out = fileURLToPath(new URL("../public/sitemap.xml", import.meta.url));
writeFileSync(out, sitemapXml());
console.log(`Wrote ${sitemapPaths().length} URLs to public/sitemap.xml`);
