import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const read = (relative: string) => readFileSync(join(here, relative), "utf8");

const assistant = read("../payload/components/AIArticleAssistant.tsx");
const sourceRoute = read("../app/(payload)/payload-api/ai-source-documents/route.ts");
const sourceDeleteRoute = read("../app/(payload)/payload-api/ai-source-documents/[id]/route.ts");

test("AI source assistant still targets the dedicated Payload-mounted source route", () => {
  assert.match(assistant, /\/payload-api\/ai-source-documents/);
});

test("dedicated source handler authenticates before privileged Local API writes", () => {
  assert.match(sourceRoute, /payload\.auth\(\{ headers: request\.headers \}\)/);
  assert.match(sourceRoute, /if \(!user\)/);
  assert.match(sourceRoute, /payload\.create/);
  assert.match(sourceRoute, /overrideAccess: true/);
  assert.match(sourceRoute, /form\.get\("_payload"\)/);
});

test("source listing and deletion stay behind the same explicit authentication gate", () => {
  assert.match(sourceRoute, /export async function GET/);
  assert.match(sourceRoute, /overrideAccess: true/);
  assert.match(sourceDeleteRoute, /payload\.auth\(\{ headers: request\.headers \}\)/);
  assert.match(sourceDeleteRoute, /if \(!user\)/);
  assert.match(sourceDeleteRoute, /payload\.delete/);
  assert.match(sourceDeleteRoute, /overrideAccess: true/);
});
