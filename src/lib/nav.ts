export type NavItem = {
  href: string;
  label: string;
};

/** Shared primary routes. Desktop renders Contact as the yellow button. */
export const PRIMARY_NAV = [
  { href: "/", label: "Home" },
  { href: "/about-tms-treatment-on-psychiatric-illness/", label: "About TMS" },
  {
    href: "/ketamine-treatment-resistant-depression-nanaimo/",
    label: "About Ketamine",
  },
  {
    href: "/services-psychiatric-tms-ketamine-treatment/",
    label: "Assessment & Treatment",
  },
  { href: "/psychiatrist-tms-nanaimo/", label: "About Us" },
  { href: "/physician-referral/", label: "Physician Referral" },
] as const satisfies readonly NavItem[];

export const CONTACT_NAV = {
  href: "/contact/",
  label: "Contact",
} as const satisfies NavItem;

/** Desktop text links (Contact is the yellow button, not this list). */
export const DESKTOP_NAV = PRIMARY_NAV;

export const FOOTER_TREATMENTS = [
  { href: "/about-tms-treatment-on-psychiatric-illness/", label: "About TMS" },
  {
    href: "/ketamine-treatment-resistant-depression-nanaimo/",
    label: "About Ketamine",
  },
  { href: "/services-psychiatric-tms-ketamine-treatment/", label: "Assessment & Treatment" },
] as const satisfies readonly NavItem[];

export const FOOTER_QUICK_LINKS = [
  { href: "/psychiatrist-tms-nanaimo/", label: "About Us" },
  { href: "/contact/", label: "Contact" },
  { href: "/physician-referral/", label: "Physician Referral" },
] as const satisfies readonly NavItem[];

export const LANDING_NAV = [
  { href: "/neurolinks-psychiatry-nanaimo-bc/#treatment", label: "Treatments" },
  { href: "/psychiatrist-tms-nanaimo/", label: "About NeuroLinks" },
  { href: "/neurolinks-psychiatry-nanaimo-bc/#faq", label: "FAQ" },
] as const;

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
