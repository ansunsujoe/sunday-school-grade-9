// Lessons and supplementary material are part of the site's code, not the
// database. To add one:
//   1. Add an entry below. `slug` becomes the URL: /content/<slug>.
//   2. Create app/(app)/content/<slug>/page.tsx and wrap it in <ContentPage slug="…">.
// An entry with a `url` and `page: false` is a link to material elsewhere; it
// needs no page file.

export const CONTENT_KINDS = ["lesson", "supplementary"] as const;
export type ContentKind = (typeof CONTENT_KINDS)[number];

export type ContentItem = {
  slug: string;
  title: string;
  kind: ContentKind;
  /** One line shown under the title in lists. */
  summary?: string;
  /** Material that lives elsewhere, e.g. a Google Doc. */
  url?: string;
  /** Whether app/(app)/content/<slug>/page.tsx exists. */
  page: boolean;
  /** YYYY-MM-DD; newest shows first. */
  added: string;
};

const ITEMS: ContentItem[] = [
  {
    slug: "journey-of-the-israelites",
    title: "Journey of the Israelites",
    kind: "lesson",
    summary: "From slavery in Egypt to the Promised Land, Exodus to Joshua.",
    page: true,
    added: "2026-09-26",
  },
];

/** Every content item, newest first. */
export const CONTENT: ContentItem[] = [...ITEMS].sort((a, b) => b.added.localeCompare(a.added));

export function getContentItem(slug: string) {
  return CONTENT.find((item) => item.slug === slug);
}

/** Where an item opens: its page here, or its outside link when it has no page. */
export function contentHref(item: ContentItem) {
  return item.page ? `/content/${item.slug}` : item.url!;
}
