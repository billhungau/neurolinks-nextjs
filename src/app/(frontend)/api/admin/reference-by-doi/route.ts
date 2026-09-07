import { NextResponse, type NextRequest } from "next/server";
import { normalizeDoi, isValidDoi } from "@/lib/doi";
import { getPayloadClient, isCmsConfigured } from "@/lib/payload/client";

export const runtime = "nodejs";
export const maxDuration = 30;

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
  if (!doi || !isValidDoi(doi)) return NextResponse.json({ error: "Enter a valid DOI or doi.org link." }, { status: 400 });

  // Older manually entered references may not have normalized DOI casing. The
  // reference collection is intentionally small, so compare normalized values
  // rather than creating a second record for the same DOI.
  const possibleExisting = await payload.find({
    collection: "references",
    where: { doi: { exists: true } },
    limit: 500,
    depth: 0,
    overrideAccess: true,
    pagination: false,
  });
  const existing = possibleExisting.docs.find((reference) => normalizeDoi(reference.doi) === doi);
  if (existing) {
    return NextResponse.json({ ok: true, created: false, reference: existing });
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

  const canonicalDoi = normalizeDoi(message.DOI) || doi;
  const data = {
    title,
    authors: authorsFrom(message) || undefined,
    publisher: message["container-title"]?.[0] || message.publisher || undefined,
    year: yearFrom(message),
    volume: message.volume || undefined,
    issue: message.issue || undefined,
    pages: message.page || undefined,
    doi: canonicalDoi,
    url: message.URL || `https://doi.org/${canonicalDoi}`,
  };

  const reference = await payload.create({
    collection: "references",
    data,
    overrideAccess: true,
  });
  return NextResponse.json({ ok: true, created: true, reference });
}
