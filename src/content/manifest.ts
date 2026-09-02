export type PageRecord = {
  wpId: number;
  route: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  layout?: "landing";
  inSitemap: boolean;
};

export const PAGE_MANIFEST = [
  {
    wpId: 1318,
    route: "/",
    title: "Transcranial Magnetic Stimulation (TMS) and Ketamine Therapy in Nanaimo, BC – NeuroLinks",
    seoTitle: "TMS & Ketamine Therapy in Nanaimo, BC | NeuroLinks",
    seoDescription:
      "NeuroLinks Clinic in Nanaimo, BC offers Transcranial Magnetic Stimulation (TMS) and Ketamine therapy for treatment-resistant depression, OCD, and PTSD.",
    inSitemap: true,
  },
  {
    wpId: 1827,
    route: "/about-tms-treatment-on-psychiatric-illness/",
    title: "About TMS",
    seoTitle: "TMS Therapy in Nanaimo, Vancouver Island | NeuroLinks",
    seoDescription:
      "NeuroLinks psychiatry in Nanaimo provides TMS therapy for depression, OCD, and PTSD. A safe, effective, and non-invasive treatment. Book a consultation today.",
    inSitemap: true,
  },
  {
    wpId: 4760,
    route: "/ketamine-treatment-resistant-depression-nanaimo/",
    title: "Ketamine's Path to Healing Treatment-Resistant Mental Illness",
    seoTitle: "Ketamine Therapy in Nanaimo, BC | NeuroLinks",
    seoDescription:
      "Discover ketamine treatment at NeuroLinks, Nanaimo. Effective for depression, OCD, PTSD and anxiety when other treatments haven’t worked.",
    inSitemap: true,
  },
  {
    wpId: 1320,
    route: "/services-psychiatric-tms-ketamine-treatment/",
    title: "Services",
    seoTitle: "Psychiatric Assessment & Treatment in Nanaimo | NeuroLinks",
    seoDescription:
      "NeuroLinks Clinic in Nanaimo, BC specializes in TMS and ketamine therapy for depression, OCD and PTSD. Safe, effective, and evidence-based care.",
    inSitemap: true,
  },
  {
    wpId: 2197,
    route: "/psychiatrist-tms-nanaimo/",
    title: "About Us",
    seoTitle: "Dr. Chi Hung Au & Our Team | NeuroLinks Nanaimo",
    seoDescription:
      "NeuroLinks in Nanaimo offers expert psychiatric care, TMS therapy, and ketamine treatment for depression and OCD. Book a consultation today.",
    inSitemap: true,
  },
  {
    wpId: 1428,
    route: "/physician-referral/",
    title: "Physician Referral",
    seoTitle: "Refer a Patient for TMS or Ketamine | NeuroLinks",
    seoDescription:
      "Refer a patient to NeuroLinks for TMS or ketamine treatment in Nanaimo, BC. Complete the online form or fax the PDF referral.",
    inSitemap: true,
  },
  {
    wpId: 1457,
    route: "/contact/",
    title: "Contact",
    seoTitle: "Contact NeuroLinks | Nanaimo TMS & Ketamine Clinic",
    seoDescription:
      "Contact NeuroLinks at 202-6010 Brickyard Road, Nanaimo. Phone 250-739-5530 or email contact@neurolinks.ca.",
    inSitemap: true,
  },
  {
    wpId: 5932,
    route: "/neurolinks-psychiatry-nanaimo-bc/",
    title: "NeuroLinks Psychiatry TMS and Ketamine Therapy in Nanaimo",
    seoTitle: "Psychiatry Clinic in Nanaimo, BC | TMS & Ketamine | NeuroLinks",
    seoDescription:
      "NeuroLinks is a psychiatrist-led psychiatry clinic in Nanaimo offering evidence-based care, including TMS and ketamine therapy, for treatment-resistant depression and related conditions.",
    layout: "landing",
    inSitemap: false,
  },
] as const satisfies readonly PageRecord[];

export const SITEMAP_ROUTES = PAGE_MANIFEST.filter((page) => page.inSitemap).map(
  (page) => page.route,
);
