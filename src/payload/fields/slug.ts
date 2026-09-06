import type { TextField } from "payload";

/**
 * Turns a title into a clean, URL-safe slug, using the same rules the public
 * Insights routes already rely on: lowercase, ASCII, hyphen separated.
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96)
    .replace(/-+$/g, "");
}

type SlugFieldOptions = {
  /** Field the slug is derived from when the editor leaves it blank. */
  sourceField?: string;
  /** Sidebar placement keeps the main editing column focused on writing. */
  position?: "sidebar";
};

/**
 * A unique, indexed slug that fills itself in from the title but stays
 * editable. Once a slug exists it is never re-derived, so retitling a live
 * article cannot silently change its public URL.
 */
export function slugField({
  sourceField = "title",
  position = "sidebar",
}: SlugFieldOptions = {}): [TextField] {
  return [
    {
      name: "slug",
      type: "text",
      unique: true,
      index: true,
      admin: {
        position,
        description:
          "The last part of the public URL. Left blank, it is generated from the title. Clear it to regenerate.",
      },
      hooks: {
        beforeValidate: [
          ({ data, originalDoc, value }) => {
            if (typeof value === "string" && value.trim().length > 0) {
              return slugify(value);
            }
            const source = data?.[sourceField] ?? originalDoc?.[sourceField];
            if (typeof source === "string" && source.trim().length > 0) {
              return slugify(source);
            }
            return value;
          },
        ],
      },
      validate: (value: string | null | undefined) => {
        if (typeof value !== "string" || value.length === 0) {
          return "Add a title so a URL can be generated, or type a slug.";
        }
        if (value !== slugify(value)) {
          return "Use lowercase letters, numbers and hyphens only.";
        }
        return true;
      },
    },
  ];
}
