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
    slug: "lesson-6",
    title: "Lesson 6: Mount Hor to Moab",
    kind: "lesson",
    summary: "Journey of the Israelites, Numbers 20–22.",
    url: "https://lesson6-pi-gold.vercel.app/#join",
    page: false,
    added: "2026-09-26",
  },
  {
    slug: "lesson-5",
    title: "Lesson 5: Rebellion in the Wilderness",
    kind: "lesson",
    summary: "Journey of the Israelites, Numbers 10–20.",
    page: true,
    added: "2026-09-26",
  },
  {
    slug: "lesson-4",
    title: "Lesson 4: Rephidim to Sinai",
    kind: "lesson",
    summary: "Journey of the Israelites, Exodus 17–19.",
    url: "https://docs.google.com/presentation/d/1IcXPFOQkbAIaDr3g0TGsDdI1Bym_KGZ9/edit?usp=sharing&ouid=109692003489601915443&rtpof=true&sd=true",
    page: false,
    added: "2026-09-26",
  },
  {
    slug: "lesson-3",
    title: "Lesson 3: Shur to Alush",
    kind: "lesson",
    summary: "Journey of the Israelites, Exodus 15–17.",
    url: "https://lesson3-gray.vercel.app/Grade_9___Lesson_3.pdf",
    page: false,
    added: "2026-09-26",
  },
  {
    slug: "lesson-2",
    title: "Lesson 2: The Red Sea",
    kind: "lesson",
    summary: "Journey of the Israelites, Exodus 14–15.",
    url: "https://docs.google.com/presentation/d/1myG1EtF9ucOfklV7zGa6yJvoP2CP9Nv4/edit?usp=sharing&ouid=109692003489601915443&rtpof=true&sd=true",
    page: false,
    added: "2026-09-26",
  },
  {
    slug: "lesson-1",
    title: "Lesson 1: Introduction",
    kind: "lesson",
    summary: "Journey of the Israelites, Exodus 1–14.",
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
