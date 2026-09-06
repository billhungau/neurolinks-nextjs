/**
 * Access control for the NeuroLinks CMS.
 *
 * These helpers are deliberately free of Payload imports so they can be unit
 * tested directly with `node --test`. Payload calls them with the real
 * request; the structural types below describe only what is read.
 *
 * Rules:
 * - Anonymous callers may read published Insights and the supporting
 *   taxonomy (categories, authors, references, media).
 * - Everything else — drafts, versions, editors, editorial notes and every
 *   write — requires an authenticated CMS user.
 */

export type CmsUser = {
  id?: number | string;
  email?: string;
};

export type AccessArgs = {
  req: { user?: CmsUser | null };
};

/** Published-only constraint applied to anonymous Insights reads. */
export const PUBLISHED_CONSTRAINT = {
  _status: {
    equals: "published",
  },
} as const;

export function isCmsUser(args: AccessArgs): boolean {
  return Boolean(args.req?.user);
}

/** Any authenticated CMS user. Used for create/update/delete and versions. */
export function authenticated(args: AccessArgs): boolean {
  return isCmsUser(args);
}

/** Public read of always-public support data. */
export function anyone(): boolean {
  return true;
}

/**
 * Insights read access. Editors see everything; anonymous callers are
 * narrowed to published documents by a query constraint rather than by
 * filtering after the fact.
 */
export function publishedOrAuthenticated(args: AccessArgs) {
  if (isCmsUser(args)) return true;
  return PUBLISHED_CONSTRAINT;
}

/** Field-level guard for editorial notes that must never reach the public. */
export function authenticatedFieldAccess(args: AccessArgs): boolean {
  return isCmsUser(args);
}
