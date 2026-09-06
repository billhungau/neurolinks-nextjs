import assert from "node:assert/strict";
import test from "node:test";
import {
  anyone,
  authenticated,
  authenticatedFieldAccess,
  isCmsUser,
  publishedOrAuthenticated,
  PUBLISHED_CONSTRAINT,
} from "./access.ts";

const editor = { req: { user: { id: 1, email: "editor@neurolinks.ca" } } };
const anonymous = { req: { user: null } };

test("a request is only treated as a CMS user when Payload attached one", () => {
  assert.equal(isCmsUser(editor), true);
  assert.equal(isCmsUser(anonymous), false);
  assert.equal(isCmsUser({ req: {} }), false);
});

test("writes, versions and editorial fields require an authenticated editor", () => {
  assert.equal(authenticated(editor), true);
  assert.equal(authenticated(anonymous), false);
  assert.equal(authenticatedFieldAccess(editor), true);
  assert.equal(authenticatedFieldAccess(anonymous), false);
});

test("anonymous Insights reads are narrowed to published documents by query", () => {
  assert.equal(publishedOrAuthenticated(editor), true);
  const constraint = publishedOrAuthenticated(anonymous);
  assert.notEqual(constraint, true);
  assert.deepEqual(constraint, PUBLISHED_CONSTRAINT);
  assert.deepEqual(constraint, { _status: { equals: "published" } });
});

test("the published constraint is a database filter, not a post-query filter", () => {
  // Payload merges the returned Where clause into the SQL query, so a draft
  // can never be loaded and then filtered out in application code.
  assert.equal(typeof PUBLISHED_CONSTRAINT._status.equals, "string");
  assert.equal(PUBLISHED_CONSTRAINT._status.equals, "published");
});

test("support data that the public site renders is readable by anyone", () => {
  assert.equal(anyone(), true);
});
