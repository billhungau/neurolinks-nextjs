import { NextResponse, type NextRequest } from "next/server";
import { getPayloadClient, isCmsConfigured } from "@/lib/payload/client";

export const runtime = "nodejs";
export const maxDuration = 30;

function normalizeDoi(value: unknown) {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "")
    .replace(/^doi:\s*/i, "")
    .trim();
}

type CrossrefAuthor = { given?: string; family?: string; name?: string };
type CrossrefMessage = {
  title?: string[];
  author?: CrossrefAuthor[];
  "container-title"?: string[];
  publisher?: string;
  volume?: string;
  issue?: string;
  page?: string;
  DOI?: string;
  URL?: string;
  published?: { "date-parts"?: number[][] };
  "published-print"?: { "date-parts"?: number[][] };
  "published-online"?: { "date-parts"?: number[][] };
};

function yearFrom(message: CrossrefMessage) {
  const sources = [message["published-print"], message["published-online"], message.published];
  for (const source of sources) {
    const year = source?.["date-parts"]?.[0]?.[0];
    if (typeof year === "number") return year;
  }
  return undefined;
}

function authorsFrom(message: CrossrefMessage) {
  return (message.author || [])
    .map((author) => author.name || [author.given, author.family].filter(Boolean).join(" "))
    .filter(Boolean)
    .join(", ");
}

export async function POST(request: NextRequest) {
  if (!isCmsConfigured()) return NextResponse.json({ error: "CMS is not configured." }, { status: 503 });
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) return NextResponse.json({ error: "Sign in to Payload to add references." }, { status: 401 });

  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const doi = normalizeDoi((raw as { doi?: unknown })?.doi);
  if (!doi || !/^10\.\d{4,9}\/.+/i.test(doi)) return NextResponse.json({ error: "Enter a valid DOI or doi.org link." }, { status: 400 });

  const existing = await payload.find({
    collection: "references",
    where: { doi: { equals: doi } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  if (existing.docs[0]) {
    const ref = existing.docs[0] as Record<string, unknown>;
    return NextResponse.json({ ok: true, created: false, reference: ref });
  }

  const crossrefResponse = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
    headers: { "User-Agent": "NeuroLinks-Insights/1.0 (mailto:info@neurolinks.ca)" },
    signal: AbortSignal.timeout(12_000),
  }).catch(() => null);
  if (!crossrefResponse?.ok) return NextResponse.json({ error: "No Crossref record was found for that DOI." }, { status: 404 });

  const crossref = await crossrefResponse.json() as { message?: CrossrefMessage };
  const message = crossref.message;
  const title = message?.title?.[0]?.trim();
  if (!message || !title) return NextResponse.json({ error: "The DOI record did not contain enough citation information." }, { status: 422 });

  const data = {
    title,
    authors: authorsFrom(message) || undefined,
    publisher: message["container-title"]?.[0] || message.publisher || undefined,
    year: yearFrom(message),
    volume: message.volume || undefined,
    issue: message.issue || undefined,
    pages: message.page || undefined,
    doi,
    url: message.URL || `https://doi.org/${doi}`,
  };

  const reference = await payload.create({
    collection: "references",
    data,
    overrideAccess: true,
  });
  return NextResponse.json({ ok: true, created: true, reference });
}
