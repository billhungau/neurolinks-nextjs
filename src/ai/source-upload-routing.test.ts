import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const read = (relative: string) => readFileSync(join(here, relative), "utf8");

const proxy = read("../proxy.ts");
const assistant = read("../payload/components/AIArticleAssistant.tsx");
const sourceRoute = read("../app/(frontend)/api/admin/ai-source-documents/route.ts");
const sourceDeleteRoute = read("../app/(frontend)/api/admin/ai-source-documents/[id]/route.ts");

test("AI source collection URLs are rewritten to the authenticated source handler", () => {
  assert.match(assistant, /\/payload-api\/ai-source-documents/);
  assert.match(proxy, /CMS_API_PATH}\/ai-source-documents/);
  assert.match(proxy, /destination\.pathname = `\/api\/admin\/ai-source-documents\$\{suffix\}`/);
});

test("dedicated source handler authenticates before Payload Local API writes", () => {
  assert.match(sourceRoute, /payload\.auth\(\{ headers: request\.headers \}\)/);
  assert.match(sourceRoute, /payload\.create/);
  assert.match(sourceRoute, /overrideAccess: false/);
  assert.match(sourceRoute, /user: auth\.user/);
  assert.match(sourceRoute, /form\.get\("_payload"\)/);
});

test("source listing and deletion remain authenticated through the same handler family", () => {
  assert.match(sourceRoute, /export async function GET/);
  assert.match(sourceDeleteRoute, /payload\.auth\(\{ headers: request\.headers \}\)/);
  assert.match(sourceDeleteRoute, /payload\.delete/);
  assert.match(sourceDeleteRoute, /overrideAccess: false/);
});
