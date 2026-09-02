/** Resolve the visual heading inside a hash target, if one exists. */
export function anchorScrollTarget(el: HTMLElement | null): HTMLElement | null {
  if (!el) return null;
  if (el.id === "main-content") return el;
  if (el.matches("h1, h2, h3, .about-au-name")) return el;
  return el.querySelector<HTMLElement>("h2, .about-au-name") ?? el;
}

function withTrailingSlash(path: string) {
  if (!path || path === "/") return "/";
  return path.endsWith("/") ? path : `${path}/`;
}

export function samePageHashId(href: string, pathname: string, search: string): string | null {
  const currentPath = withTrailingSlash(pathname);
  const base = `https://neurolinks.local${currentPath}${search}`;
  let url: URL;
  try {
    url = new URL(href, base);
  } catch {
    return null;
  }
  if (url.origin !== "https://neurolinks.local") return null;
  if (!url.hash || url.hash === "#") return null;
  if (withTrailingSlash(url.pathname) !== currentPath) return null;
  if ((url.search || "") !== (search || "")) return null;
  try {
    return decodeURIComponent(url.hash.slice(1));
  } catch {
    return null;
  }
}
