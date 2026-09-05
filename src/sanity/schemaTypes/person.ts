import { defineField, defineType } from "sanity";
import { DEFAULT_AUTHOR, PATIENT_INFORMATION_WARNING } from "@/lib/insights";

export const person = defineType({
  name: "person",
  title: "Author / medical reviewer",
  type: "document",
  fields: [
    defineField({
      name: "name",
      type: "string",
      initialValue: DEFAULT_AUTHOR.name,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "role",
      type: "string",
      initialValue: DEFAULT_AUTHOR.role,
      description: "Public role, for example Psychiatrist. Do not invent credentials.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "credentials",
      type: "string",
      description: "Optional additional role already supported by the clinic, not promotional titles.",
    }),
    defineField({
      name: "photo",
      type: "image",
      options: { hotspot: true },
      description: PATIENT_INFORMATION_WARNING,
    }),
    defineField({
      name: "bio",
      type: "text",
      rows: 4,
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "photo" },
  },
});
