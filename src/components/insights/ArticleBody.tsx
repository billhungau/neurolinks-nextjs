import { PortableText, stegaClean, type PortableTextBlock, type PortableTextComponents } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { TextLink } from "@/components/TextLink";
import {
  DEFAULT_ARTICLE_CTA,
  countWords,
  defaultCtaHref,
  slugifyHeading,
  uniqueHeadingIds,
} from "@/lib/insights";
import { insightsImageUrl } from "@/sanity/image";
import type { InsightsArticle, InsightsSource } from "@/sanity/types";
import { VacCoverageNote } from "./VacCoverageNote";
import { ComparisonTable } from "./ComparisonTable";
import { EditorialDiagram } from "./EditorialDiagram";
import { EvidenceSummary } from "./EvidenceSummary";
import { ProcessTimeline } from "./ProcessTimeline";
import { ReferencesList } from "./ReferencesList";

type BlockValue = PortableTextBlock & {
  _key?: string;
  style?: string;
  children?: Array<{ text?: string; marks?: string[] }>;
};

function blockText(value: { children?: Array<{ text?: string }> } | null | undefined) {
  return (value?.children ?? []).map((child) => child.text || "").join("");
}

export function portableTextPlainText(blocks: PortableTextBlock[] | null | undefined) {
  if (!blocks?.length) return "";
  return blocks
    .map((block) => {
      if (block._type === "block") return blockText(block as BlockValue);
      return "";
    })
    .join(" ");
}

export function articleWordCount(article: InsightsArticle) {
  const keyPoints = (article.keyPoints ?? []).join(" ");
  return countWords(`${article.title} ${article.summary ?? ""} ${keyPoints} ${portableTextPlainText(article.body)}`);
}

export function extractHeadings(blocks: PortableTextBlock[] | null | undefined) {
  const headings = (blocks ?? [])
    .filter((block): block is BlockValue => block._type === "block" && (block as BlockValue).style === "h2")
    .map((block) => stegaClean(blockText(block)).trim())
    .filter(Boolean);
  const ids = uniqueHeadingIds(headings);
  return headings.map((text, index) => ({ text, id: ids[index] ?? slugifyHeading(text) }));
}

function headingIdMap(blocks: PortableTextBlock[] | null | undefined) {
  const headings = extractHeadings(blocks);
  const map = new Map<string, string>();
  let i = 0;
  for (const block of blocks ?? []) {
    if (block._type === "block" && (block as BlockValue).style === "h2") {
      const text = stegaClean(blockText(block as BlockValue)).trim();
      if (text && headings[i]) {
        map.set((block as BlockValue)._key || text, headings[i].id);
        i += 1;
      }
    }
  }
  return map;
}

export function bodyContainsCta(blocks: PortableTextBlock[] | null | undefined) {
  return Boolean(blocks?.some((block) => block._type === "contextualCta"));
}

function componentsFor(
  article: InsightsArticle,
  headingIds: Map<string, string>,
): PortableTextComponents {
  return {
    block: {
      h2: ({ children, value }) => {
        const id = headingIds.get((value as BlockValue)._key || "") || slugifyHeading(blockText(value as BlockValue));
        return (
          <h2 id={id} className="insights-h2">
            {children}
          </h2>
        );
      },
      h3: ({ children }) => <h3 className="insights-h3">{children}</h3>,
      blockquote: ({ children }) => <blockquote className="insights-quote">{children}</blockquote>,
      normal: ({ children }) => <p>{children}</p>,
    },
    marks: {
      link: ({ children, value }) => {
        const href = String(value?.href || "");
        const external = href.startsWith("http") || Boolean(value?.blank);
        if (!href) return <>{children}</>;
        if (external) {
          return (
            <a href={href} rel="noopener noreferrer" target="_blank">
              {children}
            </a>
          );
        }
        return <Link href={href}>{children}</Link>;
      },
      citation: ({ value }) => {
        const number = Number(value?.number);
        if (!number) return null;
        return (
          <a className="insights-cite" href={`#reference-${number}`}>
            <sup>{number}</sup>
            <span className="sr-only">{` Reference ${number}`}</span>
          </a>
        );
      },
    },
    types: {
      keyPointsBox: ({ value }) => (
        <aside className="insights-keypoints">
          <p className="insights-box-label">{value.heading || "Key points"}</p>
          <ul>
            {(value.points ?? []).map((point: string) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </aside>
      ),
      evidenceSummary: ({ value }) => <EvidenceSummary value={value} />,
      clinicalNote: ({ value }) => (
        <aside className="insights-note">
          <p className="insights-box-label">{value.heading || "Clinical note"}</p>
          {value.body ? <PortableText value={value.body} /> : null}
        </aside>
      ),
      importantLimitation: ({ value }) => (
        <aside className="insights-limitation">
          <p className="insights-box-label">{value.heading || "Important limitation"}</p>
          {value.body ? <PortableText value={value.body} /> : null}
        </aside>
      ),
      vacCoverageNote: ({ value }) => <VacCoverageNote value={value} />,
      processTimeline: ({ value }) => <ProcessTimeline value={value} />,
      comparisonTable: ({ value }) => <ComparisonTable value={value} />,
      pullQuote: ({ value }) => (
        <blockquote className="insights-pull">
          <p>{value.quote}</p>
          {value.attribution ? <footer>{value.attribution}</footer> : null}
        </blockquote>
      ),
      imageWithCaption: ({ value }) => {
        const src = insightsImageUrl(value.image, 1200);
        if (!src || !value.alt) return null;
        return (
          <figure className="insights-figure">
            <Image
              src={src}
              alt={value.alt}
              width={1200}
              height={800}
              sizes="(max-width: 800px) 100vw, 760px"
            />
            {value.caption ? <figcaption>{value.caption}</figcaption> : null}
          </figure>
        );
      },
      relatedReading: ({ value }) => (
        <aside className="insights-related-inline">
          <p className="insights-box-label">{value.heading || "Related reading"}</p>
          <ul>
            {(value.articles ?? []).map((item: { title?: string; slug?: { current?: string } }) => {
              const slug = typeof item.slug === "string" ? item.slug : item.slug?.current;
              if (!item.title || !slug) return null;
              return (
                <li key={slug}>
                  <TextLink href={`/insights/${slug}/`}>{item.title}</TextLink>
                </li>
              );
            })}
            {(value.links ?? []).map((link: { title: string; href: string }) => (
              <li key={link.href}>
                <TextLink href={link.href}>{link.title}</TextLink>
              </li>
            ))}
          </ul>
        </aside>
      ),
      contextualCta: ({ value }) => (
        <ArticleCta
          heading={value.heading}
          body={value.body}
          label={value.label}
          href={value.href || article.ctaHref || defaultCtaHref(article.topics)}
        />
      ),
      referencesSection: ({ value }) => (
        <ReferencesList heading={value.heading} sources={(value.sources as InsightsSource[]) || article.references} />
      ),
      editorialDiagram: ({ value }) => (
        <EditorialDiagram diagram={value.diagram} caption={value.caption} />
      ),
    },
  };
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
  const headingIds = headingIdMap(article.body);
  if (!article.body?.length) return null;
  return <PortableText value={article.body} components={componentsFor(article, headingIds)} />;
}
