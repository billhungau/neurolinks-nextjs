import { readFileSync, writeFileSync } from "fs";

function decode(s) {
  return s
    .replace(/\\u003c/g, "<")
    .replace(/\\u003e/g, ">")
    .replace(/\\u0026/g, "&")
    .replace(/\\\//g, "/")
    .replace(/\\"/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");
}

function stripTags(html) {
  return decode(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function faqFromSchema(html) {
  const m = html.match(/"@type":"FAQPage","mainEntity":(\[[\s\S]*?\])\}\s*<\/script>/);
  if (!m) {
    const m2 = html.match(/"@type":"FAQPage","mainEntity":(\[[\s\S]*?\])\}/);
    if (!m2) return [];
    try {
      const arr = JSON.parse(m2[1].replace(/\\'/g, "'"));
      return arr.map((q) => ({
        q: stripTags(q.name),
        a: stripTags(q.acceptedAnswer?.text || ""),
      }));
    } catch {
      return [{ error: "parse", snippet: m2[1].slice(0, 200) }];
    }
  }
  try {
    const arr = JSON.parse(m[1]);
    return arr.map((q) => ({
      q: stripTags(q.name),
      a: stripTags(q.acceptedAnswer?.text || ""),
    }));
  } catch (e) {
    return [{ error: String(e) }];
  }
}

function ekitFaqs(html) {
  const out = [];
  const re =
    /ekit-accordion-title">([\s\S]*?)<\/span>[\s\S]*?ekit-accordion--content">([\s\S]*?)<\/div>\s*<\/div>/g;
  let m;
  while ((m = re.exec(html))) {
    out.push({ q: stripTags(m[1]), a: stripTags(m[2]) });
  }
  return out;
}

function headings(html) {
  const out = [];
  const re = /<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(html))) {
    const text = stripTags(m[2]);
    if (text && text.length < 400) out.push({ tag: m[1].toLowerCase(), text });
  }
  return out;
}

const pages = {
  home: "docs/wp-extract/page-1.html",
  tms: "docs/wp-extract/page-2.html",
  ket: "docs/wp-extract/page-3.html",
  services: "docs/wp-extract/page-4.html",
  about: "docs/wp-extract/page-5.html",
  referral: "docs/wp-extract/page-6.html",
  contact: "docs/wp-extract/page-7.html",
  landing: "docs/wp-extract/page-8.html",
};

const result = {};
for (const [k, p] of Object.entries(pages)) {
  const html = readFileSync(p, "utf8");
  result[k] = {
    headings: headings(html).filter(
      (h) =>
        !h.text.includes("elementskit") &&
        !h.text.toLowerCase().includes("hamburger"),
    ),
    faqSchema: faqFromSchema(html),
    ekitFaqs: ekitFaqs(html),
  };
}

writeFileSync("docs/wp-extract/text-inventory.json", JSON.stringify(result, null, 2));
console.log(
  Object.fromEntries(
    Object.entries(result).map(([k, v]) => [
      k,
      {
        h: v.headings.length,
        faqS: v.faqSchema.length,
        ekit: v.ekitFaqs.length,
        h1: v.headings.filter((x) => x.tag === "h1").map((x) => x.text),
      },
    ]),
  ),
);
