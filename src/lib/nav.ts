import { isInsightsPublicEnabled } from "./insights.ts";

export type NavItem = {
  href: string;
  label: string;
};

/** Shared primary routes. Desktop renders Contact as the yellow button. */
export const PRIMARY_NAV = [
  { href: "/", label: "Home" },
  { href: "/about-tms-treatment-on-psychiatric-illness/", label: "TMS" },
  { href: "/ketamine-treatment-resistant-depression-nanaimo/", label: "Ketamine" },
  { href: "/services-psychiatric-tms-ketamine-treatment/", label: "Services" },
  { href: "/veterans/", label: "Veterans" },
  { href: "/psychiatrist-tms-nanaimo/", label: "About" },
  { href: "/physician-referral/", label: "Referral" },
] as const satisfies readonly NavItem[];

export const CONTACT_NAV = {
  href: "/contact/",
  label: "Contact",
} as const satisfies NavItem;

/** Desktop text links (Contact is the yellow button, not this list). */
export const DESKTOP_NAV = PRIMARY_NAV;

/**
 * Footer links deliberately use descriptive anchor text. The primary header
 * stays compact for navigation, while these labels give users and search
 * engines clearer context about the destination pages.
 */
export const FOOTER_TREATMENTS = [
  { href: "/about-tms-treatment-on-psychiatric-illness/", label: "TMS Treatment" },
  {
    href: "/ketamine-treatment-resistant-depression-nanaimo/",
    label: "Ketamine Treatment",
  },
  {
    href: "/services-psychiatric-tms-ketamine-treatment/",
    label: "Assessment & Treatment",
  },
] as const satisfies readonly NavItem[];

export const FOOTER_QUICK_LINKS = [
  { href: "/veterans/", label: "Veterans" },
  { href: "/psychiatrist-tms-nanaimo/", label: "About NeuroLinks" },
  { href: "/contact/", label: "Contact" },
  { href: "/physician-referral/", label: "Physician Referral" },
] as const satisfies readonly NavItem[];

export const INSIGHTS_NAV = {
  href: "/insights/",
  label: "Insights",
} as const satisfies NavItem;

/** Quick links, with Insights inserted after Veterans while the public section is enabled. */
export function footerQuickLinks(): NavItem[] {
  const links: NavItem[] = [...FOOTER_QUICK_LINKS];
  if (isInsightsPublicEnabled()) {
    links.splice(1, 0, INSIGHTS_NAV);
  }
  return links;
}

export function normalizePath(path: string) {
  if (!path || path === "/") return "/";
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

export function isActivePath(pathname: string, href: string) {
  const path = normalizePath(pathname);
  const target = normalizePath(href);
  if (target === "/") return path === "/";
  return path === target;
}
