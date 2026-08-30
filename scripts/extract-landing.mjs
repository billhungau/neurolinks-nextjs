import { readFileSync, writeFileSync } from "fs";

const html = readFileSync("docs/wp-extract/page-8.html", "utf8");
const texts = [];
const re =
  /elementor-widget-text-editor[\s\S]*?elementor-widget-container">([\s\S]*?)<\/div>\s*<\/div>/g;
let m;
while ((m = re.exec(html))) {
  const t = m[1]
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (t.length > 40 && t.length < 2500) texts.push(t);
}
writeFileSync("docs/wp-extract/landing-paragraphs.json", JSON.stringify(texts, null, 2));
console.log(texts.length, texts.slice(0, 20));
