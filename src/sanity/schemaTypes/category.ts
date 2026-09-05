import { defineField, defineType } from "sanity";

export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 64 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "tone",
      title: "Editorial colour",
      type: "string",
      options: {
        list: [
          { title: "Navy", value: "navy" },
          { title: "Blue (TMS)", value: "blue" },
          { title: "Gold (ketamine)", value: "gold" },
          { title: "Sage (Veterans)", value: "sage" },
          { title: "Teal (pathways)", value: "teal" },
        ],
        layout: "radio",
      },
      initialValue: "navy",
    }),
  ],
});
