# AI Article Assistant

The NeuroLinks Insights editor includes a Phase 1 AI Article Assistant for public editorial content.

## What it does

- Generate a proposed article draft from a topic, search query, audience, goal, location and article type.
- Improve an existing article while preserving factual caveats.
- Review SEO and content quality with a heuristic checklist.
- Flag claims that require a verified reference instead of fabricating citations.
- Suggest internal links only from approved NeuroLinks routes.

## Safety and editorial workflow

The assistant is available only to authenticated Payload users. It is for public editorial material only; never enter patient-identifying or confidential clinical information.

AI output is review-first. Phase 1 does not automatically overwrite the Lexical editor and never publishes an Insight. The editorial workflow remains: generate or review suggestions, edit and verify references, preview, then publish manually.

## Environment

Required server-only Vercel variable:

`OPENAI_API_KEY`

Optional server-only variable:

`OPENAI_CONTENT_MODEL`

Do not prefix either with `NEXT_PUBLIC_` and never commit secret values.

The existing Payload variables remain unchanged: `DATABASE_URL`, `PAYLOAD_SECRET`, `BLOB_READ_WRITE_TOKEN`, and `NEXT_PUBLIC_SITE_URL`.
