import {
  BlockquoteFeature,
  BlocksFeature,
  BoldFeature,
  HeadingFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnorderedListFeature,
  UploadFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import { insightsBodyBlocks, insightsInlineBlocks } from "./blocks";

/**
 * The Insights writing surface.
 *
 * Deliberately narrow: paragraphs, two heading levels, bold, italic, links,
 * both list types, block quotes, images and the clinical content blocks. No
 * H1 (the article title owns it), no colour or font pickers, no raw HTML.
 */
export const insightsBodyEditor = lexicalEditor({
  features: [
    ParagraphFeature(),
    HeadingFeature({ enabledHeadingSizes: ["h2", "h3"] }),
    BoldFeature(),
    ItalicFeature(),
    UnorderedListFeature(),
    OrderedListFeature(),
    BlockquoteFeature(),
    InlineToolbarFeature(),
    LinkFeature({
      // Internal links point at other NeuroLinks Insights; plain URLs and
      // relative paths cover the rest of the site.
      enabledCollections: ["insights"],
    }),
    UploadFeature({
      collections: {
        media: {
          fields: [
            {
              name: "caption",
              type: "text",
              admin: {
                description: "Leave blank to use the caption stored with the image.",
              },
            },
          ],
        },
      },
    }),
    BlocksFeature({
      blocks: insightsBodyBlocks,
      inlineBlocks: insightsInlineBlocks,
    }),
  ],
});

/**
 * A plain-prose editor for short editorial copy such as the Insights intro.
 * Paragraphs, emphasis and links only.
 */
export const shortProseEditor = lexicalEditor({
  features: [
    ParagraphFeature(),
    BoldFeature(),
    ItalicFeature(),
    InlineToolbarFeature(),
    LinkFeature({}),
  ],
});
