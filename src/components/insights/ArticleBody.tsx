import type {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedInlineBlockNode,
} from "@payloadcms/richtext-lexical";
import {
  RichText,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { TextLink } from "@/components/TextLink";
import {
  DEFAULT_ARTICLE_CTA,
  countWords,
  defaultCtaHref,
  insightsArticlePath,
  slugifyHeading,
} from "@/lib/insights";
import {
  lexicalHasBlock,
  lexicalHeadings,
  lexicalWordCount,
  type LexicalState,
} from "@/lib/insights-content";
import { mapImage, mapSources } from "@/lib/payload/map";
import type { InsightsArticle, InsightsImage } from "@/lib/payload/types";
import type {
  CitationInlineBlock,
  ClinicalNoteBlock,
  ComparisonTableBlock,
  ContextualCtaBlock,
  EditorialDiagramBlock,
  EvidenceSummaryBlock,
  ImageWithCaptionBlock,
  ImportantLimitationBlock,
  Insight,
  KeyPointsBox,
  Media,
  ProcessTimelineBlock,
  PullQuoteBlock,
  ReferencesSectionBlock,
  RelatedReadingBlock,
  VacCoverageNoteBlock,
} from "@/payload-types";
import { ComparisonTable } from "./ComparisonTable";
import { EditorialDiagram } from "./EditorialDiagram";
import { EvidenceSummary } from "./EvidenceSummary";
import { ProcessTimeline } from "./ProcessTimeline";
import { ReferencesList } from "./ReferencesList";
import { VacCoverageNote } from "./VacCoverageNote";

/**
 * The editorial blocks the Lexical editor can insert. Naming them here keeps
 * every converter below fully typed against the generated Payload schema.
 */
type InsightsBodyBlock =
  | ClinicalNoteBlock
  | ComparisonTableBlock
  | ContextualCtaBlock
  | EditorialDiagramBlock
  | EvidenceSummaryBlock
  | ImageWithCaptionBlock
  | ImportantLimitationBlock
  | KeyPointsBox
  | ProcessTimelineBlock
  | PullQuoteBlock
  | ReferencesSectionBlock
  | RelatedReadingBlock
  | VacCoverageNoteBlock;

type InsightsNode =
  | DefaultNodeTypes
  | SerializedBlockNode<InsightsBodyBlock>
  | SerializedInlineBlockNode<CitationInlineBlock>;

export { lexicalHeadings as extractHeadings };

/** Total readable words in the article, used for the reading-time estimate. */
export function articleWordCount(article: InsightsArticle) {
  const keyPoints = (article.keyPoints ?? []).join(" ");
  return (
    countWords(`${article.title} ${article.summary ?? ""} ${keyPoints}`) +
    lexicalWordCount(article.body)
  );
}

/** True when the editor already placed a contact invitation in the body. */
export function bodyContainsCta(body: LexicalState) {
  return lexicalHasBlock(body, "contextualCta");
}

/** The existing components take optional strings; Payload stores nulls. */
function text(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/** Flattens a Payload array field down to its non-empty string values. */
function arrayText<T, K extends keyof T>(rows: T[] | null | undefined, key: K): string[] {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => (typeof row[key] === "string" ? (row[key] as string).trim() : ""))
    .filter(Boolean);
}

type LinkFields = {
  linkType?: "custom" | "internal" | null;
  url?: string | null;
  newTab?: boolean | null;
  doc?: { relationTo?: string; value?: number | string | Insight } | null;
};

function linkHref(fields: LinkFields | undefined): string {
  if (fields?.linkType === "internal") {
    const doc = fields.doc?.value;
    const slug = doc && typeof doc === "object" ? doc.slug : undefined;
    return slug ? insightsArticlePath(slug) : "/insights/";
  }
  return fields?.url ?? "";
}

function ArticleFigure({ image }: { image: NonNullable<InsightsImage> }) {
  return (
    <figure className="insights-figure">
      <Image
        src={image.url}
        alt={image.alt}
        width={image.width || 1200}
        height={image.height || 800}
        sizes="(max-width: 800px) 100vw, 760px"
      />
      {image.caption ? <figcaption>{image.caption}</figcaption> : null}
    </figure>
  );
}

/**
 * Maps Payload's Lexical nodes onto the existing NeuroLinks article markup.
 * The CMS supplies content; every class name and component here belongs to
 * the website, so the published design is unchanged.
 */
function convertersFor(article: InsightsArticle): JSXConvertersFunction<InsightsNode> {
  const headingIds = new Map<string, string>();
  for (const heading of lexicalHeadings(article.body)) {
    headingIds.set(heading.text, heading.id);
  }

  const ctaFallbackHref =
    article.ctaHref || defaultCtaHref(article.topics, article.category?.slug);

  return ({ defaultConverters }) => ({
    ...defaultConverters,
    heading: ({ node, nodesToJSX }) => {
      const children = nodesToJSX({ nodes: node.children });
      if (node.tag === "h3") return <h3 className="insights-h3">{children}</h3>;
      const label = node.children
        .map((child) => ("text" in child ? String(child.text ?? "") : ""))
        .join("")
        .trim();
      const id = headingIds.get(label) || slugifyHeading(label);
      return (
        <h2 id={id} className="insights-h2">
          {children}
        </h2>
      );
    },
    quote: ({ node, nodesToJSX }) => (
      <blockquote className="insights-quote">{nodesToJSX({ nodes: node.children })}</blockquote>
    ),
    link: ({ node, nodesToJSX }) => {
      const children = nodesToJSX({ nodes: node.children });
      const fields = node.fields as LinkFields | undefined;
      const href = linkHref(fields);
      if (!href) return <>{children}</>;
      if (href.startsWith("http") || fields?.newTab) {
        return (
          <a href={href} rel="noopener noreferrer" target="_blank">
            {children}
          </a>
        );
      }
      return <Link href={href}>{children}</Link>;
    },
    upload: ({ node }) => {
      if (node.relationTo !== "media") return null;
      const image = mapImage(node.value as Media | number, {
        caption: (node.fields as { caption?: string | null } | undefined)?.caption,
      });
      return image ? <ArticleFigure image={image} /> : null;
    },
    inlineBlocks: {
      citation: ({ node }) => {
        const number = Number(node.fields.number);
        if (!number) return null;
        return (
          <a className="insights-cite" href={`#reference-${number}`}>
            <sup>{number}</sup>
            <span className="sr-only">{` Reference ${number}`}</span>
          </a>
        );
      },
    },
    blocks: {
      keyPointsBox: ({ node }) => {
        const points = arrayText(node.fields.points, "text");
        if (!points.length) return null;
        return (
          <aside className="insights-keypoints">
            <p className="insights-box-label">{node.fields.heading || "Key points"}</p>
            <ul>
              {points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </aside>
        );
      },
      evidenceSummary: ({ node }) => (
        <EvidenceSummary
          value={{
            studyType: text(node.fields.studyType),
            population: text(node.fields.population),
            mainFinding: text(node.fields.mainFinding),
            limitation: text(node.fields.limitation),
            doi: text(node.fields.doi),
            url: text(node.fields.url),
          }}
        />
      ),
      clinicalNote: ({ node }) => (
        <aside className="insights-note">
          <p className="insights-box-label">{node.fields.heading || "Clinical note"}</p>
          <p>{node.fields.body}</p>
        </aside>
      ),
      importantLimitation: ({ node }) => (
        <aside className="insights-limitation">
          <p className="insights-box-label">
            {node.fields.heading || "Important limitation"}
          </p>
          <p>{node.fields.body}</p>
        </aside>
      ),
      vacCoverageNote: ({ node }) => (
        <VacCoverageNote
          value={{
            heading: text(node.fields.heading),
            suitability: node.fields.suitability,
            funding: node.fields.funding,
            preauthorization: node.fields.preauthorization,
            availability: node.fields.availability,
          }}
        />
      ),
      processTimeline: ({ node }) => (
        <ProcessTimeline
          value={{
            heading: text(node.fields.heading),
            intro: text(node.fields.intro),
            steps: (node.fields.steps ?? []).map((step) => ({
              title: step.title,
              body: text(step.body),
            })),
          }}
        />
      ),
      comparisonTable: ({ node }) => (
        <ComparisonTable
          value={{
            caption: text(node.fields.caption),
            columns: arrayText(node.fields.columns, "label"),
            rows: (node.fields.rows ?? []).map((row) => ({
              heading: row.heading,
              cells: arrayText(row.cells, "text"),
            })),
            footnote: text(node.fields.footnote),
          }}
        />
      ),
      pullQuote: ({ node }) => (
        <blockquote className="insights-pull">
          <p>{node.fields.quote}</p>
          {node.fields.attribution ? <footer>{node.fields.attribution}</footer> : null}
        </blockquote>
      ),
      imageWithCaption: ({ node }) => {
        const image = mapImage(node.fields.image, { caption: node.fields.caption });
        return image ? <ArticleFigure image={image} /> : null;
      },
      relatedReading: ({ node }) => {
        const articles = (node.fields.articles ?? []).filter(
          (entry): entry is Insight & { slug: string } =>
            typeof entry === "object" && Boolean(entry.slug),
        );
        const links = node.fields.links ?? [];
        if (!articles.length && !links.length) return null;
        return (
          <aside className="insights-related-inline">
            <p className="insights-box-label">{node.fields.heading || "Related reading"}</p>
            <ul>
              {articles.map((entry) => (
                <li key={entry.slug}>
                  <TextLink href={insightsArticlePath(entry.slug)}>{entry.title}</TextLink>
                </li>
              ))}
              {links.map((link) => (
                <li key={link.href}>
                  <TextLink href={link.href}>{link.title}</TextLink>
                </li>
              ))}
            </ul>
          </aside>
        );
      },
      contextualCta: ({ node }) => (
        <ArticleCta
          heading={node.fields.heading}
          body={node.fields.body}
          label={node.fields.label || article.ctaLabel}
          href={node.fields.href || ctaFallbackHref}
        />
      ),
      referencesSection: ({ node }) => (
        <ReferencesList
          heading={node.fields.heading}
          sources={mapSources(node.fields.sources) || article.references}
        />
      ),
      editorialDiagram: ({ node }) => (
        <EditorialDiagram diagram={node.fields.diagram} caption={node.fields.caption} />
      ),
    },
  });
}

export function ArticleCta({
  heading = DEFAULT_ARTICLE_CTA.heading,
  body = DEFAULT_ARTICLE_CTA.body,
  label = DEFAULT_ARTICLE_CTA.label,
  href,
}: {
  heading?: string | null;
  body?: string | null;
  label?: string | null;
  href: string;
}) {
  return (
    <aside className="insights-cta">
      <p className="insights-cta-heading">{heading || DEFAULT_ARTICLE_CTA.heading}</p>
      <p>{body || DEFAULT_ARTICLE_CTA.body}</p>
      <ButtonLink href={href}>{label || DEFAULT_ARTICLE_CTA.label}</ButtonLink>
    </aside>
  );
}

export function ArticleBody({ article }: { article: InsightsArticle }) {
  if (!article.body) return null;
  return (
    <RichText
      data={article.body as never}
      converters={convertersFor(article)}
      disableContainer
      disableTextAlign
      disableIndent
    />
  );
}
