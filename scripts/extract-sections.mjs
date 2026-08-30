import { readFileSync, writeFileSync } from "fs";

function afterHeading(html, heading, n = 2500) {
  const i = html.indexOf(heading);
  if (i < 0) return null;
  return html.slice(i, i + n).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

const tms = readFileSync("docs/wp-extract/page-2.html", "utf8");
const ket = readFileSync("docs/wp-extract/page-3.html", "utf8");
const svc = readFileSync("docs/wp-extract/page-4.html", "utf8");
const land = readFileSync("docs/wp-extract/page-8.html", "utf8");

writeFileSync(
  "docs/wp-extract/sections.txt",
  [
    "=== TMS Conditions ===",
    afterHeading(tms, "Conditions We Treat", 4000),
    "=== TMS Age ===",
    afterHeading(tms, "Age group", 2500),
    "=== TMS Coverage ===",
    afterHeading(tms, "Coverage", 2500),
    "=== KET Conditions ===",
    afterHeading(ket, "Conditions We Treat", 4000),
    "=== SVC Fee ===",
    afterHeading(svc, ">Fee<", 5000),
    "=== SVC ketamine story ===",
    afterHeading(svc, "twae-label-big\">Ketamine", 4000),
    "=== LANDING hero ===",
    afterHeading(land, "Psychiatry Clinic", 3000),
  ].join("\n\n"),
);
console.log("wrote sections.txt", (readFileSync("docs/wp-extract/sections.txt").length));
