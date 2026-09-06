/**
 * A redirect that keeps the visitor on the host they arrived on.
 *
 * `NextResponse.redirect` needs an absolute URL, and inside a route handler
 * `request.nextUrl.origin` reports the server's own origin rather than the
 * requested host. Sending the browser to a different host drops the cookies
 * the handler just set, which silently breaks draft-mode preview behind a
 * proxy, on a custom domain, or on a Vercel preview URL. A relative `Location`
 * is valid HTTP and leaves host resolution to the browser.
 */
export function sameHostRedirect(path: string, status = 307): Response {
  return new Response(null, { status, headers: { Location: path } });
}
