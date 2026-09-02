export type AppRedirect = {
  source: string;
  destination: string;
  permanent: boolean;
};

const ENGLISH_LEGACY_PAGES: Array<[string, string]> = [
  ["/about-ketamine/", "/ketamine-treatment-resistant-depression-nanaimo/"],
  ["/about-ketamine-for-drug-resistant-mental-illness/", "/ketamine-treatment-resistant-depression-nanaimo/"],
  ["/ketamine-treatment-depression-nanaimo/", "/ketamine-treatment-resistant-depression-nanaimo/"],
  ["/about-psychiatrist-transcranial-magnetic-stimulation/", "/psychiatrist-tms-nanaimo/"],
  ["/psychiatrist-tms-treatment-nanaimo/", "/psychiatrist-tms-nanaimo/"],
  ["/services-psychiatric-consultation-tms-treatment/", "/services-psychiatric-tms-ketamine-treatment/"],
  ["/neurolinks-psychiatry/", "/neurolinks-psychiatry-nanaimo-bc/"],
];

/** Direct English equivalents of retired French/Chinese pages. */
const MULTILINGUAL_PAGES: Array<[string, string]> = [
  ["/quest-ce-que-le-tms/", "/about-tms-treatment-on-psychiatric-illness/"],
  ["/关于tms/", "/about-tms-treatment-on-psychiatric-illness/"],
  ["/關於-tms/", "/about-tms-treatment-on-psychiatric-illness/"],
  ["/經顱磁刺激/", "/about-tms-treatment-on-psychiatric-illness/"],
  ["/经颅磁刺激/", "/about-tms-treatment-on-psychiatric-illness/"],
  ["/sur-le-traitement-a-la-ketamine-des-maladies-psychiatriques/", "/ketamine-treatment-resistant-depression-nanaimo/"],
  ["/什麼是氯胺酮治療？/", "/ketamine-treatment-resistant-depression-nanaimo/"],
  ["/关于氯胺酮治疗精神疾病/", "/ketamine-treatment-resistant-depression-nanaimo/"],
  ["/聯絡我們/", "/contact/"],
  ["/联络我们/", "/contact/"],
  ["/關於我們/", "/psychiatrist-tms-nanaimo/"],
  ["/关于我们/", "/psychiatrist-tms-nanaimo/"],
  ["/服務/", "/services-psychiatric-tms-ketamine-treatment/"],
  ["/服务/", "/services-psychiatric-tms-ketamine-treatment/"],
  // French homepage equivalent (TMS and ketamine), not the TMS-only article.
  ["/stimulation-magnetique-transcranienne/", "/"],
];

const ASSET_REDIRECTS: Array<[string, string]> = [
  ["/wp-content/uploads/2024/04/physician_referral_form-2.pdf", "/documents/physician-referral-form.pdf"],
  ["/media/pdfs/physician_referral_form-2.pdf", "/documents/physician-referral-form.pdf"],
  [
    "/wp-content/uploads/2025/05/TMS-FINAL-COPYYYY-JULIE-USE.mp4",
    "/media/videos/tms-introduction.mp4",
  ],
  [
    "/wp-content/uploads/2025/05/KETAMINE-VIDEO-JULIE-USE.mp4",
    "/media/videos/ketamine-introduction.mp4",
  ],
];

function slashVariants(source: string): string[] {
  if (source.includes(".") || source === "/") return [source];
  const trimmed = source.endsWith("/") ? source.slice(0, -1) : source;
  return [trimmed, `${trimmed}/`];
}

function percentEncodePath(source: string): string | null {
  const encoded = source
    .split("/")
    .map((segment) => {
      if (!segment) return segment;
      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch {
        return encodeURIComponent(segment);
      }
    })
    .join("/");
  return encoded === source ? null : encoded;
}

export function expandRedirectSources(source: string): string[] {
  const variants = new Set<string>();
  for (const slash of slashVariants(source)) {
    variants.add(slash);
    const encoded = percentEncodePath(slash);
    if (encoded) variants.add(encoded);
  }
  return [...variants];
}

export function pageRedirects(): AppRedirect[] {
  const seen = new Set<string>();
  const out: AppRedirect[] = [];
  for (const [source, destination] of [...ENGLISH_LEGACY_PAGES, ...MULTILINGUAL_PAGES]) {
    for (const variant of expandRedirectSources(source)) {
      if (seen.has(variant)) continue;
      seen.add(variant);
      out.push({ source: variant, destination, permanent: true });
    }
  }
  return out;
}

export function assetRedirects(): AppRedirect[] {
  return ASSET_REDIRECTS.map(([source, destination]) => ({
    source,
    destination,
    permanent: true,
  }));
}

export function allAppRedirects(): AppRedirect[] {
  return [...pageRedirects(), ...assetRedirects()];
}

export function lookupRedirect(pathname: string): string | null {
  const raw = pathname || "/";
  for (const rule of allAppRedirects()) {
    if (rule.source === raw) return rule.destination;
  }
  let decoded = raw;
  try {
    decoded = decodeURI(raw);
  } catch {
    decoded = raw;
  }
  if (decoded !== raw) {
    for (const rule of allAppRedirects()) {
      if (rule.source === decoded) return rule.destination;
    }
  }
  return null;
}
