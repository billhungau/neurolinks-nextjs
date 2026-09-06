import { PREVIEW_DISABLE_PATH } from "@/payload/preview";
import { productionUrl } from "@/lib/site";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function PreviewBanner({ slug }: { slug?: string }) {
  const href = slug
    ? `${PREVIEW_DISABLE_PATH}?slug=${encodeURIComponent(slug)}`
    : PREVIEW_DISABLE_PATH;
  return (
    <p className="insights-preview" role="status">
      Previewing unpublished Insights content.{" "}
      <a href={href}>Exit preview</a>
      <span className="sr-only"> Canonical production origin {productionUrl("/insights/")}</span>
    </p>
  );
}
