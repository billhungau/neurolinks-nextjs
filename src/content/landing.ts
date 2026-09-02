/**
 * Advertising landing copy drawn from existing approved page text.
 * Do not invent clinical claims or shorten testimonial quotations.
 */

export const LANDING_HEADLINE =
  "When Medications Fall Short, Thoughtful Psychiatric Care Can Offer New Options.";

export const LANDING_SUPPORTING_TEXT =
  "Psychiatrist-led TMS and ketamine care in Nanaimo, serving Vancouver Island.";

export const LANDING_INQUIRY_HEADING = "Ask about treatment options";

export const LANDING_INQUIRY_SUPPORTING_TEXT =
  "Contact our team with questions about the assessment process or treatment options. This is an initial inquiry, not a commitment to treatment.";

export const LANDING_OUTCOME_NOTE =
  "Information provided is educational and does not replace a psychiatric assessment. Treatment outcomes vary by individual. Please consult with a qualified healthcare provider for personalized medical guidance.";

export const LANDING_WHY = [
  {
    index: "01",
    title: "Psychiatrist-led expertise and assessment",
    body: "Our approach begins with careful listening and a thorough understanding of your history, concerns, and goals. A psychiatrist reviews your diagnosis, treatment history, and relevant medical factors.",
  },
  {
    index: "02",
    title: "Individualized options and informed choices",
    body: "With both TMS and ketamine available, NeuroLinks offers options beyond medication alone. We take time to explain your options so you can make decisions you understand and feel comfortable with.",
  },
  {
    index: "03",
    title: "Monitoring and support throughout treatment",
    body: "We follow up after treatment to understand how you are doing, recognizing that symptoms can fluctuate and improvement is not always straightforward. If treatment has not helped enough, we review factors that may affect your response and explore appropriate next steps with you.",
  },
] as const;

/**
 * Card points reuse approved TMS, ketamine, and homepage copy.
 * Injection route is omitted: the homepage says intramuscular and
 * subcutaneous, the ketamine page says intramuscularly or subcutaneously,
 * and the landing FAQ says intramuscular only.
 */
export const LANDING_TREATMENTS = [
  {
    href: "/about-tms-treatment-on-psychiatric-illness/",
    title: "Transcranial Magnetic Stimulation (TMS)",
    body: "TMS Therapy — Non-invasive brain stimulation",
    points: [
      "Treatment is non-invasive, does not require anesthesia and is generally well tolerated.",
      "Most patients can return to their usual activities after each session.",
      "Suitability depends on the diagnosis, treatment history and protocol being considered.",
    ],
    linkLabel: "Learn more about TMS",
    image: "tmsMachine",
    alt: "TMS treatment",
  },
  {
    href: "/ketamine-treatment-resistant-depression-nanaimo/",
    title: "Ketamine Therapy",
    body: "Rapid-acting, medically supervised",
    points: [
      "Before every session, your nurse explains what to expect and discusses any concerns.",
      "Your nurse monitors your vital signs and how you are feeling as the experience unfolds.",
      "After the session, your nurse helps you reflect on the experience.",
    ],
    linkLabel: "Learn more about ketamine",
    image: "ketamineHero",
    alt: "Ketamine treatment room with a recliner, window and side table at NeuroLinks",
    objectPosition: "object-[58%_center]",
  },
] as const;

/** Exact quotations and attributions from the previous landing page. */
export const LANDING_REVIEWS = [
  {
    who: "T. H.",
    text: "Dr Au and his staff are top notch. If you suffer from PTSD, depression or anxiety give TMS a try. Dr. Au is very knowledgeable and it’s all about patient care and not the money. I had a really good outcome treating my PTSD, depression and anxiety symptoms.",
  },
  {
    who: "E. H.",
    text: "I felt hopeless and stuck in life. I spent years trying everything I could to make a change, then one day my doctor talked to me about TMS and I thought why not try. TMS has been a life changing treatment for me. I would highly recommend this to anyone suffering with depression. Doctor Au and his team have been so knowledgeable and supportive throughout this process.",
  },
  {
    who: "J. A.",
    text: "The Transcranial Magnetic Stimulation took longer than usual to work for me, but I have had depression for 45 years. The treatment and the guidance in adjusting my medication has really made a positive change. I feel much more myself and can feel hopeful again. Thanks to Dr. Au and the incredible staff, you all have been wonderful.",
  },
] as const;

export const LANDING_NEXT_STEPS = [
  {
    index: "01",
    title: "Contact the clinic",
    body: "Phone, email, or the contact form on this site to ask about a psychiatric assessment.",
  },
  {
    index: "02",
    title: "Physician referral",
    body: "An appropriate physician referral is required for an MSP-covered assessment. The clinic can explain referral requirements when you enquire.",
  },
  {
    index: "03",
    title: "Psychiatric assessment",
    body: "A psychiatrist reviews your diagnosis, treatment history, and relevant medical factors. Questionnaires may be used to understand symptom severity.",
  },
  {
    index: "04",
    title: "After the assessment",
    body: "TMS, ketamine, or another option may be recommended when clinically appropriate. Treatment coverage is separate from the assessment.",
  },
] as const;
