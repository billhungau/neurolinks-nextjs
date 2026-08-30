import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const dir = "docs/wp-extract";

function strip(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");
}

function headings(html) {
  const out = [];
  const re = /<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(html))) {
    const text = m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (text) out.push({ tag: m[1].toLowerCase(), text });
  }
  return out;
}

function attrs(html, tag, attr) {
  const out = [];
  const re = new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["'][^>]*>`, "gi");
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return [...new Set(out)];
}

function links(html) {
  const out = [];
  const re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = m[1];
    const text = m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    out.push({ href, text });
  }
  return out;
}

function faqs(html) {
  const items = [];
  const re =
    /elementor-accordion-title[^>]*>([\s\S]*?)<\/[^>]+>[\s\S]*?elementor-tab-content[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
  let m;
  while ((m = re.exec(html))) {
    items.push({
      q: m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      a: m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    });
  }
  return items;
}

const files = readdirSync(dir).filter((f) => f.endsWith(".html"));
const summary = {};
for (const f of files) {
  const raw = readFileSync(join(dir, f), "utf8");
  const html = strip(raw);
  const title = (raw.match(/<title>([^<]+)<\/title>/i) || [])[1];
  const desc = (raw.match(/name="description" content="([^"]*)"/i) || [])[1];
  const robots = (raw.match(/name="robots" content="([^"]*)"/i) || [])[1];
  const canonical = (raw.match(/rel="canonical" href="([^"]+)"/i) || [])[1];
  summary[f] = {
    title,
    desc,
    robots,
    canonical,
    headings: headings(html),
    faqs: faqs(html),
    images: attrs(html, "img", "src").filter((s) => !s.startsWith("data:")),
    posters: attrs(html, "video", "src"),
    posterAttr: [...html.matchAll(/data-poster-image="([^"]+)"/g)].map((x) => x[1]),
    srcMp4: [...html.matchAll(/src="([^"]+\.mp4)"/gi)].map((x) => x[1]),
    pdfs: [...html.matchAll(/href="([^"]+\.pdf)"/gi)].map((x) => x[1]),
    links: links(html).filter(
      (l) =>
        l.href.includes("neurolinks.ca") ||
        l.href.startsWith("/") ||
        l.href.startsWith("#") ||
        l.href.startsWith("tel:") ||
        l.href.startsWith("mailto:"),
    ),
  };
}

writeFileSync("docs/wp-extract/summary.json", JSON.stringify(summary, null, 2));
console.log(
  Object.entries(summary).map(([k, v]) => ({
    k,
    h: v.headings.length,
    faq: v.faqs.length,
    img: v.images.length,
    title: v.title,
  })),
);
