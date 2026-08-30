export const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/about-tms-treatment-on-psychiatric-illness/", label: "About TMS" },
  {
    href: "/ketamine-treatment-resistant-depression-nanaimo/",
    label: "About Ketamine",
  },
  {
    href: "/services-psychiatric-tms-ketamine-treatment/",
    label: "Services",
  },
  { href: "/psychiatrist-tms-nanaimo/", label: "About Us" },
  {
    href: "/#location",
    label: "Location",
    note: "WordPress Main Menu custom link destination: https://neurolinks.ca#location (Elementor menu-anchor id=location on the front page).",
  },
  { href: "/physician-referral/", label: "Physician Referral" },
  { href: "/contact/", label: "Contact" },
] as const;

export const LANDING_NAV = [
  { href: "/neurolinks-psychiatry-nanaimo-bc/#treatment", label: "Treatments" },
  { href: "/psychiatrist-tms-nanaimo/", label: "About NeuroLinks" },
  { href: "/neurolinks-psychiatry-nanaimo-bc/#faq", label: "FAQ" },
] as const;
