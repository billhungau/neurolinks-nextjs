#!/usr/bin/env node
/**
 * HTTP checks for SEO/migration behaviour against a running Next server.
 * Usage: SEO_BASE_URL=http://127.0.0.1:3010 node scripts/verify-seo.mjs
 */
const base = (process.env.SEO_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const htmlIndexable = process.env.SEO_HTML_INDEXABLE === "true";
const productionHost = process.env.SEO_PRODUCTION_HOST || "neurolinks.ca";

const MAIN_ROUTES = [
  "/",
  "/about-tms-treatment-on-psychiatric-illness/",
  "/ketamine-treatment-resistant-depression-nanaimo/",
  "/services-psychiatric-tms-ketamine-treatment/",
  "/psychiatrist-tms-nanaimo/",
  "/physician-referral/",
  "/contact/",
];

const ADS = "/neurolinks-psychiatry-nanaimo-bc/";

const TITLES = {
  "/": "TMS &amp; Ketamine Therapy in Nanaimo, BC | NeuroLinks",
  "/about-tms-treatment-on-psychiatric-illness/":
    "TMS Therapy in Nanaimo, Vancouver Island | NeuroLinks",
  "/ketamine-treatment-resistant-depression-nanaimo/":
    "Ketamine Therapy in Nanaimo, BC | NeuroLinks",
  "/services-psychiatric-tms-ketamine-treatment/":
    "Psychiatric Assessment &amp; Treatment in Nanaimo | NeuroLinks",
  "/psychiatrist-tms-nanaimo/": "Dr. Chi Hung Au &amp; Our Team | NeuroLinks Nanaimo",
  "/physician-referral/": "Refer a Patient for TMS or Ketamine | NeuroLinks",
  "/contact/": "Contact NeuroLinks | Nanaimo TMS &amp; Ketamine Clinic",
};

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`PASS ${message}`);
}

async function request(path, init = {}) {
  const url = path.startsWith("http") ? path : `${base}${path}`;
  const response = await fetch(url, { redirect: "manual", ...init });
  const buffer = Buffer.from(await response.arrayBuffer());
  return { response, buffer, text: buffer.toString("utf8") };
}

function header(response, name) {
  return response.headers.get(name);
}

function meta(html, name) {
  const robots = html.match(
    new RegExp(`<meta[^>]+name="${name}"[^>]+content="([^"]*)"`, "i"),
  );
  const robotsRev = html.match(
    new RegExp(`<meta[^>]+content="([^"]*)"[^>]+name="${name}"`, "i"),
  );
  return robots?.[1] ?? robotsRev?.[1] ?? "";
}

function title(html) {
  return html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? "";
}

function canonical(html) {
  return html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1] ?? "";
}

function og(html, property) {
  return (
    html.match(new RegExp(`<meta property="${property}" content="([^"]*)"`, "i"))?.[1] ?? ""
  );
}

async function main() {
  console.log(`Checking ${base} (htmlIndexable=${htmlIndexable})`);

  for (const route of MAIN_ROUTES) {
    const { response, text } = await request(route);
    if (response.status !== 200) fail(`${route} status ${response.status}`);
    else pass(`${route} HTTP ${response.status}`);

    const robots = meta(text, "robots");
    const xrobots = header(response, "x-robots-tag") || "";
    if (htmlIndexable) {
      if (/\bnoindex\b/i.test(robots)) fail(`${route} HTML robots is noindex: ${robots}`);
      else pass(`${route} HTML robots ${robots || "(empty)"}`);
    } else if (!/\bnoindex\b/i.test(robots) && !/\bnoindex\b/i.test(xrobots)) {
      fail(`${route} missing noindex in HTML (${robots}) and header (${xrobots})`);
    } else pass(`${route} preview noindex html=${robots} header=${xrobots}`);

    const canon = canonical(text);
    if (canon !== `https://neurolinks.ca${route}`) {
      fail(`${route} canonical ${canon}`);
    } else pass(`${route} canonical ${canon}`);

    if (canon.includes("vercel.app")) fail(`${route} canonical uses vercel.app`);
    if (og(text, "og:url") !== `https://neurolinks.ca${route}`) {
      fail(`${route} og:url ${og(text, "og:url")}`);
    }
    if (!og(text, "og:image").startsWith("https://neurolinks.ca/media/og/")) {
      fail(`${route} og:image ${og(text, "og:image")}`);
    } else pass(`${route} og:image ${og(text, "og:image")}`);

    const expectedTitle = TITLES[route];
    if (title(text) !== expectedTitle) fail(`${route} title ${title(text)}`);
    else pass(`${route} title`);
    if (title(text).includes("| NeuroLinks | NeuroLinks")) fail(`${route} duplicated title suffix`);

    if (text.includes("hreflang")) fail(`${route} contains hreflang`);
  }

  const ads = await request(ADS);
  if (ads.response.status !== 200) fail(`ads landing status ${ads.response.status}`);
  else pass("ads landing HTTP 200");
  const adsRobots = meta(ads.text, "robots");
  if (!/\bnoindex\b/i.test(adsRobots)) fail(`ads HTML robots missing noindex: ${adsRobots}`);
  else pass(`ads HTML robots ${adsRobots}`);
  if (canonical(ads.text) !== `https://neurolinks.ca${ADS}`) {
    fail(`ads canonical ${canonical(ads.text)}`);
  }
  if (canonical(ads.text).includes("utm_")) fail("ads canonical includes tracking params");
  if (!og(ads.text, "og:image")) fail("ads missing og:image");

  const robots = await request("/robots.txt");
  if (robots.response.status !== 200) fail("robots.txt missing");
  if (htmlIndexable) {
    if (/disallow: \//i.test(robots.text) && !/allow: \//i.test(robots.text)) {
      fail("production robots.txt disallows /");
    }
    if (!robots.text.includes("https://neurolinks.ca/sitemap.xml")) {
      fail("production robots.txt missing sitemap");
    }
    if (/neurolinks-psychiatry-nanaimo-bc/i.test(robots.text) && /disallow/i.test(robots.text)) {
      fail("robots.txt appears to block the ads landing page");
    }
    pass("production robots.txt allows crawling");
  } else if (!/disallow: \//i.test(robots.text)) {
    fail(`preview robots.txt should disallow /\n${robots.text}`);
  } else pass("preview robots.txt disallows /");

  const sitemap = await request("/sitemap.xml");
  if (htmlIndexable) {
    for (const route of MAIN_ROUTES) {
      if (!sitemap.text.includes(`https://neurolinks.ca${route}`)) {
        fail(`sitemap missing ${route}`);
      }
    }
    if (sitemap.text.includes("neurolinks-psychiatry-nanaimo-bc")) {
      fail("sitemap includes ads landing");
    }
    if (sitemap.text.includes("quest-ce-que-le-tms") || sitemap.text.includes("关于")) {
      fail("sitemap includes multilingual URLs");
    }
    if (sitemap.text.includes("vercel.app")) fail("sitemap includes vercel.app");
    pass("sitemap contains canonical English pages only");
  } else if (/<loc>/i.test(sitemap.text)) {
    fail("preview sitemap should be empty");
  } else pass("preview sitemap is empty");

  const pdf = await request("/documents/physician-referral-form.pdf");
  const pdfType = header(pdf.response, "content-type") || "";
  if (pdf.response.status !== 200 || !pdfType.includes("pdf") || pdf.buffer.subarray(0, 5).toString() !== "%PDF-") {
    fail(`PDF content-type=${pdfType} status=${pdf.response.status} magic=${pdf.buffer.subarray(0, 8).toString()}`);
  } else pass(`PDF ${pdfType} ${pdf.buffer.length} bytes`);

  const pdfRedirect = await request("/wp-content/uploads/2024/04/physician_referral_form-2.pdf");
  const location = header(pdfRedirect.response, "location") || "";
  if (![301, 308].includes(pdfRedirect.response.status) || !location.includes("/documents/physician-referral-form.pdf")) {
    fail(`PDF redirect ${pdfRedirect.response.status} ${location}`);
  } else pass(`PDF legacy redirect ${pdfRedirect.response.status} → ${location}`);

  const french = await request("/quest-ce-que-le-tms/");
  const frenchLoc = header(french.response, "location") || "";
  if (french.response.status !== 301 || !frenchLoc.includes("/about-tms-treatment-on-psychiatric-illness/")) {
    fail(`French TMS redirect ${french.response.status} ${frenchLoc}`);
  } else pass(`French TMS 301 → ${frenchLoc}`);

  const chinese = await request("/%E5%85%B3%E4%BA%8Etms/");
  const chineseLoc = header(chinese.response, "location") || "";
  if (chinese.response.status !== 301 || !chineseLoc.includes("/about-tms-treatment-on-psychiatric-illness/")) {
    fail(`Chinese TMS redirect ${chinese.response.status} ${chineseLoc}`);
  } else pass(`encoded Chinese TMS 301 → ${chineseLoc}`);

  const utm = await request("/neurolinks-psychiatry-nanaimo-bc?utm_source=google&gclid=test123");
  const utmLoc = header(utm.response, "location") || "";
  if (utm.response.status !== 308) fail(`ads trailing-slash status ${utm.response.status}`);
  else if (!utmLoc.includes("utm_source=google") || !utmLoc.includes("gclid=test123")) {
    fail(`ads trailing-slash dropped tracking ${utmLoc}`);
  } else pass(`ads trailing-slash kept tracking ${utmLoc}`);

  const unknown = await request("/this-page-does-not-exist/");
  if (unknown.response.status !== 404) fail(`unknown URL status ${unknown.response.status}`);
  else pass("unknown URL 404");

  const shop = await request("/shop-2/");
  if (shop.response.status !== 404) fail(`shop-2 should 404, got ${shop.response.status}`);
  else pass("shop-2 genuine 404");

  const jsonLd = (await request("/")).text.match(/application\/ld\+json[^>]*>([^<]+)/);
  if (!jsonLd) fail("missing JSON-LD");
  else {
    const data = JSON.parse(jsonLd[1]);
    if (data["@type"] !== "MedicalClinic") fail(`JSON-LD type ${data["@type"]}`);
    if (data.url !== "https://neurolinks.ca/") fail(`JSON-LD url ${data.url}`);
    if (String(data.url).includes("vercel.app")) fail("JSON-LD uses vercel.app");
    pass("MedicalClinic JSON-LD uses production origin");
  }

  if (htmlIndexable) {
    const prodHeaders = { headers: { host: productionHost } };
    const prodHome = await request("/", prodHeaders);
    const prodAds = await request(ADS, prodHeaders);
    const xHome = header(prodHome.response, "x-robots-tag") || "";
    const xAds = header(prodAds.response, "x-robots-tag") || "";
    if (/\bnoindex\b/i.test(xHome)) fail(`production host home X-Robots-Tag ${xHome}`);
    else pass("production host home has no noindex header");
    if (!/\bnoindex\b/i.test(xAds)) fail(`production host ads X-Robots-Tag ${xAds}`);
    else pass(`production host ads X-Robots-Tag ${xAds}`);
  }

  if (process.exitCode) {
    console.error("SEO verification failed");
    process.exit(process.exitCode);
  }
  console.log("SEO verification passed");
}

await main();
