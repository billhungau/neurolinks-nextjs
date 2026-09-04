import type { FaqItem } from "@/content/faqs";

/** Official Veterans Affairs Canada mental health benefits page. */
export const VAC_MENTAL_HEALTH_BENEFITS_URL =
  "https://www.veterans.gc.ca/en/mental-and-physical-health/mental-health-and-wellness/medical-costs/mental-health-benefits";

export const VETERAN_TRUST = [
  "Psychiatrist-led care",
  "Experience treating Veterans",
  "TMS and ketamine options",
  "VAC authorization support",
] as const;

export const VETERAN_IMPACT = {
  heading: "The impact of service can continue long after service ends",
  opening:
    "Depression, anxiety and trauma-related symptoms can remain present for years. Sleep, relationships, motivation and everyday functioning may all be affected—even after medication or therapy.",
  emphasis:
    "Continuing to struggle does not mean that you have failed treatment. It may mean that a different assessment or treatment approach is worth considering.",
  closing:
    "We begin by understanding what you have experienced, what you have already tried and what you most want to regain.",
} as const;

export type VeteranCondition = {
  /** Drives the panel accent colour, drawn from the existing pathway palette. */
  tone: "teal" | "sage" | "gold";
  label: string;
  title: string;
  body: string;
};

export const VETERAN_CONDITIONS = [
  {
    tone: "teal",
    label: "01 · Depression",
    title: "Depression",
    body: "Depression can drain energy, motivation, interest and hope, making even ordinary responsibilities feel difficult. We assess what has already been tried and whether another treatment approach may be appropriate.",
  },
  {
    tone: "sage",
    label: "02 · PTSD",
    title: "PTSD and trauma-related symptoms",
    body: "Hypervigilance, disrupted sleep, irritability, avoidance and emotional detachment can continue long after the immediate danger has passed. Assessment considers these symptoms alongside depression, anxiety, pain and sleep.",
  },
  {
    tone: "gold",
    label: "03 · Anxiety",
    title: "Anxiety",
    body: "Persistent anxiety can leave the mind and body in a constant state of readiness. We consider the underlying diagnosis, symptom pattern and previous treatment response before recommending care.",
  },
] as const satisfies readonly VeteranCondition[];

export const VETERAN_CONDITIONS_INTRO =
  "Depression, anxiety and trauma-related symptoms frequently overlap. Assessment should reflect the complete clinical picture rather than treating each symptom in isolation.";

export const VETERAN_CONDITIONS_NOTE =
  "A condition listed here does not mean that TMS or ketamine will automatically be recommended. Suitability is determined through psychiatric assessment.";

export type VeteranTreatment = {
  key: "tms" | "ketamine";
  eyebrow: string;
  title: string;
  body: string;
  points: readonly string[];
  linkLabel: string;
  href: string;
};

export const VETERAN_TREATMENTS = [
  {
    key: "tms",
    eyebrow: "TMS",
    title: "Non-invasive treatment that works differently from medication",
    body: "TMS uses focused magnetic pulses to influence brain networks involved in mood regulation. Patients remain awake, and sedation or anaesthesia is not required.",
    points: [
      "Strongest established role in depression",
      "Non-invasive, without sedation",
      "Delivered through repeated clinic visits",
      "Protocol selected following assessment",
    ],
    linkLabel: "Learn more about TMS",
    href: "/about-tms-treatment-on-psychiatric-illness/",
  },
  {
    key: "ketamine",
    eyebrow: "Ketamine",
    title: "A medically supervised treatment pathway",
    body: "Ketamine may be considered for selected patients with treatment-resistant depression following medical and psychiatric screening. Treatment is provided in a controlled clinical setting with appropriate monitoring.",
    points: [
      "Primarily considered for treatment-resistant depression",
      "Medical screening before treatment",
      "Supervised administration and monitoring",
      "Response and tolerability reviewed throughout care",
    ],
    linkLabel: "Learn more about ketamine",
    href: "/ketamine-treatment-resistant-depression-nanaimo/",
  },
] as const satisfies readonly VeteranTreatment[];

export const VETERAN_TREATMENT_INTRO =
  "TMS and ketamine work differently from conventional antidepressant medications. They may offer another path forward for selected patients, but neither treatment is appropriate for everyone.";

export const VETERAN_PATHWAY_EYEBROW = "A clear way forward";
export const VETERAN_PATHWAY_HEADING = "From first contact to treatment";

export const VETERAN_PATHWAY_INTRO =
  "You should not have to navigate every clinical and administrative step alone. NeuroLinks can explain the process, develop the treatment plan and help prepare the information required for authorization.";

export const VETERAN_PATHWAY_CTA = {
  href: "#veterans-contact",
  label: "Talk with our team",
} as const;

export const VETERAN_PATHWAY = [
  {
    index: "01",
    title: "Start with a conversation",
    body: "Contact NeuroLinks directly, or ask your physician, therapist or case manager to reach out. You do not need to choose a treatment before contacting us.",
    icon: "talk",
  },
  {
    index: "02",
    title: "Understand the full picture",
    body: "A psychiatrist reviews your symptoms, previous treatment, medications, medical considerations and what you hope to regain.",
    icon: "assess",
  },
  {
    index: "03",
    title: "Request preauthorization",
    body: "If treatment is recommended, NeuroLinks prepares the proposed protocol, clinical rationale, schedule and estimated cost required for review.",
    icon: "authorize",
  },
  {
    index: "04",
    title: "Begin treatment and monitor progress",
    body: "Once written authorization and scheduling are confirmed, treatment can begin. Symptoms, tolerability and progress are monitored throughout the course.",
    icon: "follow",
  },
] as const;

export const VETERAN_EXPERIENCE = {
  eyebrow: "Experience that reduces uncertainty",
  heading: "Veterans should not have to explain the treatment process to their clinic",
  opening:
    "NeuroLinks has experience assessing and treating Veterans, including patients whose treatment has been authorized through Veterans Affairs Canada.",
  closing:
    "Our team understands that care may involve treatment planning, clinical rationale, preauthorization, progress monitoring and communication with existing healthcare providers or case managers.",
  quote: "We approach each Veteran as an individual—not as a diagnosis or a funding file.",
} as const;

export const VETERAN_EXPERIENCE_POINTS = [
  "Psychiatrist-led assessment and treatment planning",
  "Experience providing VAC-authorized treatment",
  "Familiarity with preauthorization documentation",
  "Communication with clinicians and case managers, with consent",
] as const;

export const VETERAN_COVERAGE = {
  heading: "Clear information before treatment begins",
  body: [
    "Veterans Affairs Canada may authorize treatment in eligible cases. NeuroLinks can prepare the proposed treatment plan, clinical rationale, schedule and estimated cost required for review.",
    "Coverage is not automatic. Eligibility and authorization depend on the individual Veteran’s benefits, clinical circumstances and proposed treatment. Treatment begins only after written authorization has been confirmed through VAC and Medavie Blue Cross.",
  ],
  coordinationHeading: "Already working with a clinician or case manager?",
  coordination:
    "With the Veteran’s consent, physicians, therapists and VAC case managers can contact NeuroLinks to discuss the referral and documentation process.",
} as const;

/** Corrected coverage wording shared with the Services page. */
export const VETERAN_COVERAGE_STATEMENT =
  "Veterans Affairs Canada may authorize TMS or ketamine treatment in eligible cases. NeuroLinks can prepare the proposed treatment plan and supporting clinical information required for review. Coverage is not automatic, and treatment begins only after written authorization has been confirmed through VAC and Medavie Blue Cross.";

export const VETERAN_CONTACT = {
  heading: "You do not have to determine the next step alone",
  body: "You do not need to decide whether TMS or ketamine is right for you before contacting us. Tell us what you would like help understanding, and our team can explain the assessment and authorization process.",
  reassurance:
    "You do not need to describe your trauma or medical history here. A brief question is enough.",
  submitLabel: "Ask our team to contact me",
} as const;

export const VETERAN_FAQS: FaqItem[] = [
  {
    q: "Does VAC cover TMS or ketamine treatment?",
    a: "Veterans Affairs Canada may authorize TMS or ketamine treatment in eligible cases. Coverage is not automatic. It depends on your benefits, your clinical circumstances and the treatment being proposed. Treatment begins only after written authorization has been confirmed through VAC and Medavie Blue Cross. We can explain what documentation is typically required, but the decision rests with VAC and Medavie Blue Cross.",
  },
  {
    q: "Will NeuroLinks help obtain preauthorization?",
    a: "Yes. After the psychiatric assessment, we can prepare the proposed treatment plan, clinical rationale, treatment schedule and estimated cost required for review. We can also respond if further information is requested. The authorization decision rests with VAC and Medavie Blue Cross rather than the clinic.",
  },
  {
    q: "Do I need a physician referral?",
    a: "A physician or nurse practitioner referral is required for an MSP-covered psychiatric assessment. You are welcome to contact the clinic first. We can explain what is needed and, with your consent, correspond with your care provider or case manager. Clinicians can refer through our physician referral page or by fax.",
  },
  {
    q: "How long does authorization usually take?",
    a: "Timelines are set by VAC and Medavie Blue Cross rather than by the clinic, so we cannot promise a date. Incomplete documentation is a common cause of delay, so we aim to submit the required clinical information in full. We will tell you what has been submitted and what remains outstanding.",
  },
  {
    q: "How frequently will I need to travel to Nanaimo?",
    a: "It depends on the treatment. A standard TMS course is generally delivered five days a week over several weeks, and an accelerated course given over five days may be considered for selected patients. Ketamine is typically given twice a week during the initial phase. We confirm the schedule before treatment begins so travel can be planned.",
  },
  {
    q: "Can my VAC case manager, therapist or physician contact NeuroLinks?",
    a: "Yes. With your consent, a VAC case manager, therapist or physician can contact the clinic to discuss the referral, the treatment being proposed and the documentation required for review. With your written consent, we can also share assessment findings and progress updates. You decide who we communicate with.",
  },
];
