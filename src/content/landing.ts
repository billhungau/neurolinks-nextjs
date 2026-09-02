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
    title: "Psychiatrist-Led Expertise",
    body: "At NeuroLinks, we recognize that seeking care after multiple treatments haven't helped can feel discouraging. Our approach begins with careful listening and a thorough understanding of your history, concerns, and goals.",
  },
  {
    index: "02",
    title: "Personalized Treatment Plans",
    body: "TMS and ketamine therapy are considered thoughtfully, within a psychiatrist-led plan tailored to your needs, with close monitoring and follow-up throughout treatment.",
  },
  {
    index: "03",
    title: "Respect for Clinical Complexity",
    body: "A thoughtful approach to advanced psychiatric care, focused on assessment, safety, and individualized treatment.",
  },
] as const;

export const LANDING_TREATMENTS = [
  {
    href: "/about-tms-treatment-on-psychiatric-illness/",
    title: "Transcranial Magnetic Stimulation (TMS)",
    body: "TMS Therapy — Non-invasive brain stimulation",
    linkLabel: "Learn more about TMS",
    image: "tmsMachine",
    alt: "TMS treatment",
  },
  {
    href: "/ketamine-treatment-resistant-depression-nanaimo/",
    title: "Ketamine Therapy",
    body: "Rapid-acting, medically supervised",
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
