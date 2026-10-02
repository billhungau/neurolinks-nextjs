import { listAllVcitaClients, type VcitaClientSummary } from "../vcita";

const BDI2_JOTFORM_ID = "221126900055242";

type JotformAnswer = {
  name?: string;
  text?: string;
  type?: string;
  answer?: unknown;
  prettyFormat?: string;
};

type JotformSubmission = {
  id?: string;
  created_at?: string;
  answers?: Record<string, JotformAnswer>;
};

type JotformEnvelope = {
  responseCode?: number;
  content?: JotformSubmission[];
};

export type HistoricalBdiPreviewRow = {
  submissionId: string;
  submittedAt: string | null;
  jotformName: string;
  normalizedName: string;
  totalScore: number | null;
  status: "unique_exact" | "ambiguous" | "no_match";
  matches: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
  }>;
};

function jotformApiKey() {
  const key = process.env.JOTFORM_API_KEY?.trim();
  if (!key) throw new Error("[historical-bdii] JOTFORM_API_KEY is not configured.");
  return key;
}

function answerText(answer: JotformAnswer | undefined): string {
  if (!answer) return "";
  const raw = answer.answer;
  if (typeof raw === "string") return raw.trim();
  if (typeof raw === "number") return String(raw);
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const first = String(obj.first ?? "").trim();
    const last = String(obj.last ?? "").trim();
    const full = [first, last].filter(Boolean).join(" ").trim();
    if (full) return full;
  }
  return String(answer.prettyFormat ?? "").trim();
}

function findAnswer(
  answers: Record<string, JotformAnswer>,
  labels: string[],
): JotformAnswer | undefined {
  const targets = labels.map((label) => label.trim().toLowerCase());
  return Object.values(answers).find((answer) => {
    const text = String(answer.text ?? "").trim().toLowerCase();
    const name = String(answer.name ?? "").trim().toLowerCase();
    return targets.includes(text) || targets.includes(name);
  });
}

export function normalizePatientName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function vcitaFullName(client: VcitaClientSummary) {
  return [client.firstName, client.lastName].filter(Boolean).join(" ").trim();
}

async function fetchAllBdiSubmissions(): Promise<JotformSubmission[]> {
  const limit = 100;
  const all: JotformSubmission[] = [];

  for (let offset = 0; offset < 5000; offset += limit) {
    const url = new URL(`https://api.jotform.com/form/${BDI2_JOTFORM_ID}/submissions`);
    url.searchParams.set("apiKey", jotformApiKey());
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));
    url.searchParams.set("orderby", "created_at");

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`[historical-bdii] Jotform HTTP ${response.status}`);
    }

    const payload = (await response.json()) as JotformEnvelope;
    if (payload.responseCode !== 200 || !Array.isArray(payload.content)) {
      throw new Error("[historical-bdii] Invalid Jotform submissions response.");
    }

    all.push(...payload.content);
    if (payload.content.length < limit) break;
  }

  return all;
}

export async function buildHistoricalBdiPreview() {
  const [submissions, clients] = await Promise.all([
    fetchAllBdiSubmissions(),
    listAllVcitaClients({ maxPages: 50 }),
  ]);

  const byName = new Map<string, VcitaClientSummary[]>();
  for (const client of clients) {
    const normalized = normalizePatientName(vcitaFullName(client));
    if (!normalized) continue;
    const existing = byName.get(normalized) ?? [];
    existing.push(client);
    byName.set(normalized, existing);
  }

  const rows: HistoricalBdiPreviewRow[] = submissions.map((submission) => {
    const answers = submission.answers ?? {};
    const name = answerText(findAnswer(answers, ["Full Name", "Name"]));
    const normalizedName = normalizePatientName(name);
    const matches = normalizedName ? byName.get(normalizedName) ?? [] : [];

    const totalRaw = answerText(findAnswer(answers, ["Total Score"]));
    const parsedTotal = Number(totalRaw);
    const totalScore = Number.isFinite(parsedTotal) ? parsedTotal : null;

    return {
      submissionId: String(submission.id ?? ""),
      submittedAt: submission.created_at ? String(submission.created_at) : null,
      jotformName: name,
      normalizedName,
      totalScore,
      status:
        matches.length === 1
          ? "unique_exact"
          : matches.length > 1
            ? "ambiguous"
            : "no_match",
      matches: matches.map((client) => ({
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone,
      })),
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    submissionCount: submissions.length,
    vcitaClientCount: clients.length,
    summary: {
      uniqueExact: rows.filter((row) => row.status === "unique_exact").length,
      ambiguous: rows.filter((row) => row.status === "ambiguous").length,
      noMatch: rows.filter((row) => row.status === "no_match").length,
    },
    rows,
  };
}
