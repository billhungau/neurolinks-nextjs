#!/usr/bin/env node
/**
 * HTTP checks for SEO/migration behaviour against a running Next server.
 * Usage: SEO_BASE_URL=http://127.0.0.1:3010 node scripts/verify-seo.mjs
 *
 * SEO_HTML_INDEXABLE=true — server was built with ALLOW_SEARCH_INDEXING=true.
 * Production-host checks use a raw Host header (Node fetch cannot set Host).
 */
const base = (process.env.SEO_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const htmlIndexable = process.env.SEO_HTML_INDEXABLE === "true";
const productionHost = process.env.SEO_PRODUCTION_HOST || "neurolinks.ca";
const requireVideos = process.env.SEO_REQUIRE_VIDEOS === "true";

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

function warn(message) {
  console.warn(`WARN ${message}`);
}

function headerValue(headers, name) {
  if (headers && typeof headers.get === "function") return headers.get(name) || "";
  const key = Object.keys(headers || {}).find((k) => k.toLowerCase() === name.toLowerCase());
  const value = key ? headers[key] : "";
  return Array.isArray(value) ? value.join(", ") : value || "";
}

async function rawRequest(path, extraHeaders = {}) {
  const url = new URL(path.startsWith("http") ? path : `${base}${path}`);
  const { request: httpRequest } = await import("node:http");
  const { request: httpsRequest } = await import("node:https");
  const transport = url.protocol === "https:" ? httpsRequest : httpRequest;
  return new Promise((resolve, reject) => {
    const req = transport(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: "GET",
        headers: extraHeaders,
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const buffer = Buffer.concat(chunks);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            buffer,
            text: buffer.toString("utf8"),
          });
        });
      },
    );
    req.on("error", reject);
    req.end();
  });
}

async function request(path, init = {}) {
  const url = path.startsWith("http") ? path : `${base}${path}`;
  const response = await fetch(url, { redirect: "manual", ...init });
  const buffer = Buffer.from(await response.arrayBuffer());
  return { response, buffer, text: buffer.toString("utf8") };
}

function header(response, name) {
  return headerValue(response.headers, name);
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

async function checkVideo(path) {
  const { response, buffer } = await request(path, {
    headers: { Range: "bytes=0-1023" },
  });
  const type = header(response, "content-type") || "";
  const accept = header(response, "accept-ranges") || "";
  if (response.status === 404) {
    if (requireVideos) fail(`${path} missing (404)`);
    else warn(`${path} not present locally (gitignored; host on Blob/CDN before WordPress retirement)`);
    return;
  }
  const isPartial = response.status === 206;
  const isFull = response.status === 200;
  const head = buffer.subarray(0, 32).toString("latin1");
  if (!isPartial && !isFull) fail(`${path} status ${response.status}`);
  else if (!type.includes("mp4") && !type.includes("video")) fail(`${path} content-type ${type}`);
  else if (!head.includes("ftyp")) fail(`${path} not an MP4 (magic=${buffer.subarray(0, 12).toString("hex")})`);
  else pass(`${path} ${response.status} ${type} range=${accept || "(none)"}`);
  if (!isPartial && accept.toLowerCase() !== "bytes") {
    warn(`${path} did not return 206 for Range; Accept-Ranges=${accept || "(none)"}`);
  }
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
      if (!/\bnoindex\b/i.test(xrobots)) {
        fail(`${route} localhost should still send noindex header, got ${xrobots || "(empty)"}`);
      } else pass(`${route} localhost X-Robots-Tag ${xrobots}`);
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
    if (!og(text, "og:image:width") || !og(text, "og:image:height")) {
      fail(`${route} missing og:image dimensions`);
    }

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
  if (og(ads.text, "og:url") !== `https://neurolinks.ca${ADS}`) {
    fail(`ads og:url ${og(ads.text, "og:url")}`);
  }

  const home = await request("/");
  if (home.text.includes("/neurolinks-psychiatry-nanaimo-bc/")) {
    fail("homepage links to advertising landing page");
  } else pass("homepage does not link to advertising landing");
  if (!home.text.includes("Psychiatrist-led TMS and ketamine therapy in Nanaimo, serving Vancouver Island.")) {
    fail("homepage supporting text missing requested wording");
  } else pass("homepage supporting text");

  const robots = await request("/robots.txt");
  if (robots.response.status !== 200) fail("robots.txt missing");
  if (!/disallow: \//i.test(robots.text)) {
    fail(`non-production host robots.txt should disallow /\n${robots.text}`);
  } else pass("non-production host robots.txt disallows /");

  if (htmlIndexable) {
    const prodRobots = await rawRequest("/robots.txt", { host: productionHost });
    if (/disallow: \//i.test(prodRobots.text) && !/allow: \//i.test(prodRobots.text)) {
      fail(`production-host robots.txt disallows /\n${prodRobots.text}`);
    } else if (!prodRobots.text.includes("https://neurolinks.ca/sitemap.xml")) {
      fail("production-host robots.txt missing sitemap");
    } else if (
      /neurolinks-psychiatry-nanaimo-bc/i.test(prodRobots.text) &&
      /disallow/i.test(prodRobots.text)
    ) {
      fail("production robots.txt appears to block the ads landing page");
    } else pass("production-host robots.txt allows crawling and lists sitemap");
  }

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
    if (/lastmod/i.test(sitemap.text)) fail("sitemap invents lastmod dates");
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

  const frenchUtm = await request("/quest-ce-que-le-tms/?utm_source=google&gclid=abc123");
  const frenchUtmLoc = header(frenchUtm.response, "location") || "";
  if (
    frenchUtm.response.status !== 301 ||
    !frenchUtmLoc.includes("utm_source=google") ||
    !frenchUtmLoc.includes("gclid=abc123")
  ) {
    fail(`French TMS dropped tracking ${frenchUtm.response.status} ${frenchUtmLoc}`);
  } else pass(`French TMS kept tracking ${frenchUtmLoc}`);

  const chinese = await request("/%E5%85%B3%E4%BA%8Etms/");
  const chineseLoc = header(chinese.response, "location") || "";
  if (chinese.response.status !== 301 || !chineseLoc.includes("/about-tms-treatment-on-psychiatric-illness/")) {
    fail(`Chinese TMS redirect ${chinese.response.status} ${chineseLoc}`);
  } else if (/%25/i.test(chineseLoc)) {
    fail(`Chinese TMS location is double-encoded ${chineseLoc}`);
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

  await checkVideo("/media/videos/tms-introduction.mp4");
  await checkVideo("/media/videos/ketamine-introduction.mp4");

  const tmsVideoRedirect = await request("/wp-content/uploads/2025/05/TMS-FINAL-COPYYYY-JULIE-USE.mp4");
  const tmsVideoLoc = header(tmsVideoRedirect.response, "location") || "";
  if (
    ![301, 308].includes(tmsVideoRedirect.response.status) ||
    !tmsVideoLoc.includes("/media/videos/tms-introduction.mp4")
  ) {
    fail(`TMS video redirect ${tmsVideoRedirect.response.status} ${tmsVideoLoc}`);
  } else pass(`TMS video legacy redirect ${tmsVideoRedirect.response.status} → ${tmsVideoLoc}`);

  const wwwHome = await rawRequest("/contact/?utm_source=google&gclid=wwwtest", {
    host: "www.neurolinks.ca",
  });
  const wwwLoc = headerValue(wwwHome.headers, "location");
  if (wwwHome.status !== 301) fail(`www redirect status ${wwwHome.status}`);
  else if (wwwLoc !== "https://neurolinks.ca/contact/?utm_source=google&gclid=wwwtest") {
    fail(`www redirect location ${wwwLoc}`);
  } else pass(`www → apex kept slash and tracking ${wwwLoc}`);

  const wwwPdf = await rawRequest("/documents/physician-referral-form.pdf", {
    host: "www.neurolinks.ca",
  });
  const wwwPdfLoc = headerValue(wwwPdf.headers, "location");
  if (wwwPdf.status !== 301 || wwwPdfLoc !== "https://neurolinks.ca/documents/physician-referral-form.pdf") {
    fail(`www PDF redirect ${wwwPdf.status} ${wwwPdfLoc}`);
  } else pass(`www PDF → apex ${wwwPdfLoc}`);

  if (htmlIndexable) {
    const prodHome = await rawRequest("/", { host: productionHost });
    const prodAds = await rawRequest(ADS, { host: productionHost });
    const xHome = headerValue(prodHome.headers, "x-robots-tag");
    const xAds = headerValue(prodAds.headers, "x-robots-tag");
    if (/\bnoindex\b/i.test(xHome)) fail(`production host home X-Robots-Tag ${xHome}`);
    else pass("production host home has no noindex header");
    if (!/\bnoindex\b/i.test(xAds)) fail(`production host ads X-Robots-Tag ${xAds || "(empty)"}`);
    else pass(`production host ads X-Robots-Tag ${xAds}`);
    if (prodHome.status !== 200) fail(`production host home status ${prodHome.status}`);
    if (prodAds.status !== 200) fail(`production host ads status ${prodAds.status}`);
  }

  if (process.exitCode) {
    console.error("SEO verification failed");
    process.exit(process.exitCode);
  }
  console.log("SEO verification passed");
}

await main();
