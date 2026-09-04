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
    "For some Veterans, depression, anxiety and trauma-related symptoms remain present for years. Sleep may be disrupted. Motivation and relationships may suffer. Medications may cause side effects without providing enough relief. Therapy may help, but important symptoms can persist.",
  emphasis:
    "Continuing to struggle does not mean that you have failed treatment. It may mean that the treatments tried so far have not fully met your needs.",
  closing:
    "At NeuroLinks, we begin by understanding your history, what you have already tried and what you most want to regain. Only then do we consider whether a treatment such as TMS or ketamine may be appropriate.",
} as const;

export type VeteranCondition = {
  /** Drives the panel accent colour, drawn from the existing pathway palette. */
  tone: "teal" | "sage" | "gold";
  label: string;
  title: string;
  body: readonly string[];
  linkLabel: string;
  href: string;
};

export const VETERAN_CONDITIONS = [
  {
    tone: "teal",
    label: "01 · Depression",
    title: "Depression",
    body: [
      "Depression can gradually take away energy, motivation, interest and hope. Even ordinary responsibilities can begin to feel overwhelming.",
      "TMS is an established, non-invasive treatment option for depression that has not improved sufficiently with conventional treatment. Ketamine may be considered for selected patients with treatment-resistant depression and may produce improvement more rapidly.",
    ],
    linkLabel: "Learn about treatment-resistant depression",
    href: "/ketamine-treatment-resistant-depression-nanaimo/",
  },
  {
    tone: "sage",
    label: "02 · PTSD",
    title: "PTSD and trauma-related symptoms",
    body: [
      "PTSD may affect far more than memories of trauma. It can involve hypervigilance, irritability, avoidance, emotional detachment, disrupted sleep and a persistent sense of being unsafe.",
      "TMS or ketamine may be considered in selected cases, particularly when significant depressive symptoms are also present. Evidence, regulatory status and appropriate protocols differ from those for depression. These treatments may complement—but do not necessarily replace—trauma-focused psychotherapy.",
    ],
    linkLabel: "Understand how treatment may fit",
    href: "/about-tms-treatment-on-psychiatric-illness/",
  },
  {
    tone: "gold",
    label: "03 · Anxiety",
    title: "Anxiety",
    body: [
      "Persistent anxiety can keep the mind and body in a state of constant readiness. It may appear as worry, tension, panic, restlessness, irritability or difficulty sleeping.",
      "Anxiety may occur independently or alongside depression and PTSD. Whether TMS or ketamine is appropriate depends on the underlying diagnosis, symptom pattern and previous treatment response.",
    ],
    linkLabel: "Ask about an individual assessment",
    href: "/contact/",
  },
] as const satisfies readonly VeteranCondition[];

export type VeteranTreatment = {
  key: "tms" | "ketamine";
  eyebrow: string;
  title: string;
  body: readonly string[];
  points: readonly string[];
  buttonLabel: string;
  href: string;
};

export const VETERAN_TREATMENTS = [
  {
    key: "tms",
    eyebrow: "TMS",
    title: "Non-invasive treatment that works differently from medication",
    body: [
      "TMS uses focused magnetic pulses to influence brain networks involved in mood and emotional regulation. It does not require sedation or anaesthesia, and patients remain awake throughout treatment.",
      "Its strongest established role is in treating depression, including depression that has not responded adequately to medication. The treatment protocol, frequency and brain target are selected according to the individual clinical presentation.",
    ],
    points: [
      "Non-invasive treatment",
      "No sedation or anaesthesia",
      "Established evidence for depression",
      "Generally delivered repeatedly over several weeks",
      "Individualized protocol and brain mapping",
      "Progress and tolerability monitored throughout treatment",
    ],
    buttonLabel: "Learn more about TMS",
    href: "/about-tms-treatment-on-psychiatric-illness/",
  },
  {
    key: "ketamine",
    eyebrow: "Ketamine",
    title: "A different treatment pathway, with the potential for earlier change",
    body: [
      "Ketamine affects glutamate-related brain pathways and may reduce depressive symptoms more rapidly than conventional antidepressants in some patients. Improvement may begin within hours or days, although several treatments may be required and not everyone responds.",
      "At NeuroLinks, ketamine is administered in a controlled clinical setting with medical supervision and appropriate monitoring before, during and after treatment.",
    ],
    points: [
      "Primarily considered for treatment-resistant depression",
      "Potential for a more rapid response",
      "Medical screening before treatment",
      "Supervised administration and monitoring",
      "Response and side effects reviewed throughout the course",
      "Maintenance considered individually",
    ],
    buttonLabel: "Learn more about ketamine",
    href: "/ketamine-treatment-resistant-depression-nanaimo/",
  },
] as const satisfies readonly VeteranTreatment[];

export const VETERAN_PATHWAY_HEADING = "A clear path from first contact to treatment";

export const VETERAN_PATHWAY_INTRO =
  "Seeking care should not require you to navigate every clinical and administrative step alone. NeuroLinks can explain the process, develop the treatment plan and help provide the information required for authorization.";

export const VETERAN_PATHWAY_CTA = {
  href: "/contact/",
  label: "Talk to our team",
} as const;

export const VETERAN_PATHWAY = [
  {
    index: "01",
    title: "Start with a conversation",
    body: "Contact NeuroLinks directly, or ask your physician, therapist or case manager to reach out. You do not need to decide whether TMS or ketamine is right for you before contacting us.",
    icon: "talk",
  },
  {
    index: "02",
    title: "Understand the full picture",
    body: "A psychiatrist reviews your symptoms, diagnoses, treatment history, medications, medical considerations and goals. If TMS or ketamine appears appropriate, we develop an individualized treatment recommendation.",
    icon: "assess",
  },
  {
    index: "03",
    title: "Obtain preauthorization",
    body: "NeuroLinks prepares the proposed protocol, clinical rationale, treatment schedule and estimated cost required for review. Coverage must be confirmed through Veterans Affairs Canada and Medavie Blue Cross before treatment begins.",
    icon: "authorize",
  },
  {
    index: "04",
    title: "Begin treatment and monitor progress",
    body: "Once written authorization and scheduling are confirmed, treatment can begin. We monitor symptoms, comfort, side effects and progress throughout the course and provide follow-up information when required.",
    icon: "follow",
  },
] as const;

export const VETERAN_EXPERIENCE_POINTS = [
  "Psychiatrist-led assessment and treatment planning",
  "Experience providing VAC-authorized treatment",
  "Familiarity with Medavie Blue Cross preauthorization requirements",
  "Standardized symptom monitoring",
  "Clinical review throughout treatment",
  "Communication with clinicians and case managers, with consent",
  "Follow-up and maintenance planning when appropriate",
] as const;

export const VETERAN_COVERAGE = {
  heading: "Clear information before treatment begins",
  body: [
    "No Veteran should begin treatment uncertain about whether it has been authorized.",
    "Veterans Affairs Canada may authorize TMS or ketamine treatment in eligible cases. NeuroLinks can prepare the proposed treatment plan, clinical rationale, treatment schedule and estimated cost required for review.",
    "Coverage is not automatic. Eligibility and authorization depend on the individual Veteran’s benefits, clinical circumstances and the proposed treatment. Treatment begins only after written authorization has been confirmed through VAC and Medavie Blue Cross.",
  ],
  note: "Already working with a VAC case manager, therapist or physician? With your consent, they can contact NeuroLinks directly to discuss the referral and documentation process.",
} as const;

/** Corrected coverage wording shared with the Services page. */
export const VETERAN_COVERAGE_STATEMENT =
  "Veterans Affairs Canada may authorize TMS or ketamine treatment in eligible cases. NeuroLinks can prepare the proposed treatment plan and supporting clinical information required for review. Coverage is not automatic, and treatment begins only after written authorization has been confirmed through VAC and Medavie Blue Cross.";

export const VETERAN_FAQS: FaqItem[] = [
  {
    q: "Does VAC cover TMS or ketamine treatment?",
    a: "Veterans Affairs Canada may authorize TMS or ketamine treatment in eligible cases. Coverage is not automatic. It depends on your benefits, your clinical circumstances and the treatment being proposed, and treatment begins only after written authorization has been confirmed through VAC and Medavie Blue Cross.",
  },
  {
    q: "Will NeuroLinks help obtain preauthorization?",
    a: "Yes. Following the psychiatric assessment, we can prepare the proposed treatment plan, clinical rationale, treatment schedule and estimated cost required for review, and we can respond to requests for further information. The authorization decision rests with VAC and Medavie Blue Cross rather than the clinic.",
  },
  {
    q: "Do I need a physician referral?",
    a: "A physician or nurse practitioner referral is required for an MSP-covered psychiatric assessment. You are welcome to contact the clinic first: we can explain what is needed and, with your consent, correspond with your care provider or case manager. Clinicians can refer through our physician referral page or by fax.",
  },
  {
    q: "Is the psychiatric assessment covered by MSP?",
    a: "For eligible British Columbia residents with an appropriate referral, the comprehensive psychiatric assessment is covered by the Medical Services Plan. TMS and ketamine treatment are not covered by MSP and are considered separately, which is why authorization through VAC and Medavie Blue Cross is required before treatment begins.",
  },
  {
    q: "Can my VAC case manager contact NeuroLinks?",
    a: "Yes. With your consent, a VAC case manager can contact the clinic directly to discuss the referral, the treatment being proposed and the documentation required for review. We confirm your consent before sharing any clinical information.",
  },
  {
    q: "Can NeuroLinks communicate with my therapist or physician?",
    a: "With your written consent, we can share assessment findings, the treatment plan and progress updates with your therapist, family physician, nurse practitioner or psychiatrist. You decide who we communicate with, and you can change that at any time.",
  },
  {
    q: "How long does authorization usually take?",
    a: "Timelines are set by VAC and Medavie Blue Cross rather than by the clinic, so we cannot promise a date. Incomplete documentation is a common cause of delay, so we aim to submit the required clinical information in full. We will tell you what has been submitted and what remains outstanding.",
  },
  {
    q: "How frequently will I need to travel to Nanaimo?",
    a: "It depends on the treatment. A standard TMS course is generally delivered five days a week over several weeks, and an accelerated course given over five days may be considered for selected patients. Ketamine is typically given twice a week during the initial phase. We confirm the schedule before treatment begins so that travel and accommodation can be planned.",
  },
  {
    q: "Can TMS or ketamine be combined with psychotherapy?",
    a: "In most cases yes, and continuing trauma-focused or other psychotherapy is often appropriate. Neither treatment is intended to replace psychotherapy. Your psychiatrist will review how treatments fit together, alongside your current medications.",
  },
  {
    q: "What happens if treatment does not help enough?",
    a: "Not everyone responds, and a partial response is common. If improvement is insufficient, we review the factors that may be affecting your response, including diagnosis, protocol, medications, sleep and pain, then discuss the options with you. These may include adjusting treatment, considering the other treatment or referral for another evidence-based approach.",
  },
  {
    q: "Is maintenance treatment available?",
    a: "Maintenance is considered individually after an initial course, when it is clinically appropriate and when response supports continuing. Maintenance requires its own clinical review, and separate authorization may be required before it can begin.",
  },
  {
    q: "Does NeuroLinks treat serving CAF or RCMP members?",
    a: "We assess and treat serving Canadian Armed Forces and RCMP members as well as Veterans. The funding route differs between serving members and Veterans, so what applies depends on your situation. Contact the clinic and we can explain the process for your circumstances.",
  },
];
