/**
 * Advertising landing copy drawn from existing approved page text.
 * Do not invent clinical claims or shorten testimonial quotations.
 */

export const LANDING_HEADLINE =
  "When medication hasn’t helped enough, there may be another way forward.";

export const LANDING_SUPPORTING_TEXT =
  "Explore psychiatrist-led TMS and ketamine treatment in Nanaimo, with care tailored to your needs.";

export const LANDING_TRUST = [
  "Psychiatrist-led care",
  "Personalized treatment options",
  "MSP-covered assessment",
] as const;

export const LANDING_TREATMENT_HEADING = "Explore your treatment options";

export const LANDING_WHY_HEADING = "Care that goes beyond delivering treatment.";

export const LANDING_WHY_TEXT =
  "We review your progress, consider factors affecting your response and work with you on appropriate next steps—even when improvement is not straightforward.";

export const LANDING_INQUIRY_HEADING = "Let’s explore what may be right for you.";

export const LANDING_INQUIRY_SUPPORTING_TEXT =
  "You do not need to choose a treatment before contacting us.";

export const LANDING_INQUIRY_NOTE =
  "For general inquiries or questions about arranging an assessment. Please do not include personal health information, referral documents or urgent medical concerns.";

export const LANDING_REVIEWS_CTA_LABEL = "Talk to our team";

export const LANDING_CLOSE_TEXT =
  "If you would like to discuss what may be appropriate, our team is here to help.";

export const LANDING_OUTCOME_NOTE =
  "Information provided is educational and does not replace a psychiatric assessment. Treatment outcomes vary by individual. Please consult with a qualified healthcare provider for personalized medical guidance.";

/**
 * Card copy reuses approved homepage, TMS, and ketamine wording.
 * Injection route is omitted: the homepage says intramuscular and
 * subcutaneous, the ketamine page says intramuscularly or subcutaneously,
 * and the landing FAQ says intramuscular only.
 */
export const LANDING_TREATMENTS = [
  {
    href: "/about-tms-treatment-on-psychiatric-illness/",
    title: "Transcranial Magnetic Stimulation (TMS)",
    benefit:
      "Can be more effective than another conventional medication when antidepressants have not helped enough.",
    body: "TMS is a non-invasive neuromodulation treatment with established evidence for depression and certain other psychiatric conditions. It is generally well tolerated. Suitability depends on the diagnosis, treatment history and protocol being considered.",
    ctaLabel: "Ask about TMS",
    linkLabel: "Learn more about TMS",
    video: "tms",
    playLabel: "Play TMS explainer video",
  },
  {
    href: "/ketamine-treatment-resistant-depression-nanaimo/",
    title: "Ketamine Therapy",
    benefit:
      "For some people, improvement may begin within hours or days—considerably faster than with conventional antidepressants.",
    body: "Ketamine is administered in a controlled clinical setting with medical supervision. An experienced registered nurse provides preparation, support and post-session reflection, with vital-sign monitoring and psychiatrist oversight.",
    ctaLabel: "Ask about ketamine",
    linkLabel: "Learn more about ketamine",
    video: "ketamine",
    playLabel: "Play ketamine explainer video",
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
