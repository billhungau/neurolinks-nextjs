export type FaqSegment =
  | { type: "text"; value: string }
  | { type: "link"; value: string; href: string };

export type FaqRich = FaqSegment[];

export type FaqCompareRow = {
  feature: string;
  tms: string;
  ect: string;
};

export type FaqBlock =
  | { type: "p"; content: FaqRich }
  | { type: "label"; value: string }
  | { type: "ul"; items: FaqRich[] }
  | { type: "compare"; rows: FaqCompareRow[] };

export type FaqAnswer = string | FaqRich | FaqBlock[];

export type FaqItem = { q: string; a: FaqAnswer };

export type FaqEvidenceLink = { value: string; href: string };

function segmentsText(segments: FaqRich): string {
  return segments.map((segment) => segment.value).join("");
}

function segmentsLinks(segments: FaqRich): FaqEvidenceLink[] {
  return segments
    .filter((segment): segment is Extract<FaqSegment, { type: "link" }> => segment.type === "link")
    .map(({ value, href }) => ({ value, href }));
}

export function isStructuredFaqAnswer(answer: FaqAnswer): answer is FaqBlock[] {
  return Array.isArray(answer) && answer[0]?.type !== "text" && answer[0]?.type !== "link";
}

export function faqAnswerText(answer: FaqAnswer): string {
  if (typeof answer === "string") return answer;
  if (!isStructuredFaqAnswer(answer)) return segmentsText(answer);
  return answer
    .map((block) => {
      if (block.type === "p") return segmentsText(block.content);
      if (block.type === "label") return block.value;
      if (block.type === "ul") return block.items.map(segmentsText).join(" ");
      return block.rows
        .map((row) => `${row.feature} TMS ${row.tms} ECT ${row.ect}`.replace(/\s+/g, " ").trim())
        .join(" ");
    })
    .filter(Boolean)
    .join(" ");
}

export function faqEvidenceLinks(answer: FaqAnswer): FaqEvidenceLink[] {
  if (typeof answer === "string") return [];
  if (!isStructuredFaqAnswer(answer)) return segmentsLinks(answer);
  return answer.flatMap((block) => {
    if (block.type === "p") return segmentsLinks(block.content);
    if (block.type === "ul") return block.items.flatMap(segmentsLinks);
    return [];
  });
}

export function collectFaqEvidenceLinks(items: FaqItem[]): FaqEvidenceLink[] {
  return items.flatMap((item) => faqEvidenceLinks(item.a));
}

function answer(...parts: Array<string | [phrase: string, href: string]>): FaqRich {
  return parts.map((part) =>
    typeof part === "string" ? { type: "text", value: part } : { type: "link", value: part[0], href: part[1] },
  );
}

function para(...parts: Array<string | [phrase: string, href: string]>): FaqBlock {
  return { type: "p", content: answer(...parts) };
}

function label(value: string): FaqBlock {
  return { type: "label", value };
}

function bullets(...items: string[]): FaqBlock {
  return { type: "ul", items: items.map((item) => answer(item)) };
}

export const TMS_FAQS: FaqItem[] = [
  {
    q: "How likely will depression improve with TMS?",
    a: [
      label("Depression without treatment resistance"),
      para(
        "In ",
        [
          "non treatment resistant depression",
          "https://bmcpsychiatry.biomedcentral.com/articles/10.1186/s12888-018-1989-z",
        ],
        ", most patients show significant improvement and two thirds of them can see absence of depressive symptoms.",
      ),
      label("Treatment-resistant depression"),
      para(
        "In ",
        [
          "treatment-resistant depression",
          "https://www.psychiatrist.com/jcp/depression/repetitive-transcranial-magnetic-stimulation-treatment-2/",
        ],
        ", about one in three patients show significant improvement. Compared to patients without TMS, TMS is more than 5 times as likely to achieve a clearance of depressive symptoms: remission rate of treatment-resistant depression with TMS 30%, without TMS 6%.",
      ),
    ],
  },
  {
    q: "Are there any side effects from TMS?",
    a: [
      para("Most side effects are mild and self-limiting."),
      label("Common effects"),
      para("The most common one would be headache and discomfort at the site of stimulation."),
      label("Rare risks"),
      para(
        "Rarely, there is a ",
        ["<0.1%", "https://www.sciencedirect.com/science/article/pii/S1935861X21001182"],
        " risk that seizure could occur. Notably, this is NOT higher than the ",
        ["lifetime prevalence", "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5272794/"],
        " of seizure in the general population.",
      ),
    ],
  },
  {
    q: "Is the effect of TMS durable?",
    a: [
      para(
        "Yes, the effect of TMS is durable. After the successful initial treatment, half of patients see sustained responses up to 1 year.",
      ),
      para(["Read more about the study", "https://pubmed.ncbi.nlm.nih.gov/30344109/"]),
      para(
        "Receiving a maintenance course of TMS can sustain the therapeutic effect of TMS. We also recommend patients to continue their oral antidepressants to maximize the durability of the treatment effect of TMS.",
      ),
    ],
  },
  {
    q: "I have been taking medications. Why do I need TMS?",
    a: [
      para(
        "Most patients are only treated with medications. However, ",
        [
          "up to 30%",
          "https://www.psychiatrist.com/jcp/depression/prevalence-national-burden-treatment-resistant-depression-major-depressive-disorder-in-us/",
        ],
        " of patients with depression are medication resistant (i.e. do not adequately respond to at least 2 antidepressants). This is even worse in obsessive-compulsive disorder, for which ",
        ["up to 60%", "https://www.sciencedirect.com/science/article/abs/pii/S0278584605003520?via%3Dihub"],
        " are treatment resistant.",
      ),
      para(
        "We often see residual symptoms in depression and obsessive-compulsive disorder, which can result in poor mental wellbeing; impaired social functioning, both occupational and interpersonal; and poor physical health.",
      ),
      para(
        "Therefore, when you have significant symptoms even with medications, you should consider TMS. TMS is a neuromodulation therapy, which has different mechanisms from medications. TMS is effective in reducing symptoms in treatment-resistant ",
        ["depression", "https://www.sciencedirect.com/science/article/abs/pii/S0165032720328573"],
        " and ",
        ["obsessive-compulsive disorder", "https://www.nature.com/articles/s41398-021-01453-0"],
        ".",
      ),
    ],
  },
  {
    q: "Who cannot receive TMS?",
    a: [
      para(
        "Most patients can receive TMS, but there are some contraindications. Since TMS involves magnetic induction, any patients with non-removable metal in their head (except braces or dental fillings) should not receive TMS.",
      ),
      para("Metal implants that can prevent TMS include:"),
      bullets(
        "brain stent",
        "aneurysm clip/coils",
        "deep brain stimulator",
        "metallic implants in your ears and eyes",
        "facial tattoos with metallic or magnetic-sensitive ink",
        "other metal devices or objects implanted in or near the head",
      ),
      para(
        "There are also some relative contraindications, mostly related to an increased risk of seizure. For example, a recent (<30 days) hemorrhagic stroke or head injury. Please discuss with our psychiatrist to evaluate the benefits and risks before the TMS treatment.",
      ),
    ],
  },
  {
    q: "What is the difference between TMS and electroconvulsive therapy (ECT)?",
    a: [
      para(
        "While both are effective for the treatment of several mental illness, they work differently. In contrast to ECT, TMS is non-invasive and it does not need anesthesia.",
      ),
      {
        type: "compare",
        rows: [
          { feature: "Anesthesia", tms: "non-invasive; does not need anesthesia", ect: "" },
          {
            feature: "Recovery after treatment",
            tms: "can return to work straight after",
            ect: "requires recovery time (could be up to a few hours)",
          },
          {
            feature: "Memory effects",
            tms: "neutral/procognitive effect on memory",
            ect: "mild short-term memory loss and confusion",
          },
          {
            feature: "Seizure involvement",
            tms: "rarely induces seizure (<1/10000)",
            ect: "requires a seizure every time",
          },
          {
            feature: "Typical treatment course",
            tms: "usually 20-30 sessions (4-6 weeks)",
            ect: "6-12 sessions (3-6 weeks)",
          },
          {
            feature: "Coverage",
            tms: "not covered by MSP (enquire private insurance)",
            ect: "covered by MSP",
          },
        ],
      },
    ],
  },
  {
    q: "I am pregnant. Can I receive TMS?",
    a: [
      para(
        "TMS is considered safe for ",
        ["mothers", "https://link.springer.com/article/10.1007/s00737-013-0397-0"],
        " and the ",
        ["fetus", "https://journals.sagepub.com/doi/abs/10.1177/1039856221992636#abstract"],
        ". Treatment of depression during the pregnancy and post-partum period is important. With significant depressive symptoms in the mother, babies have more difficulties developing a secure attachment.",
      ),
      para(
        "A recently published ",
        ["long-term study", "https://pubmed.ncbi.nlm.nih.gov/33653123/"],
        " demonstrated the safety of TMS in both children and mothers. After the mothers had received TMS, they and their children were followed for more than 20 years. None of the mothers or children experienced any detrimental effects from TMS.",
      ),
    ],
  },
  {
    q: "What factors affect the treatment outcome?",
    a: [
      label("Positive predictors of TMS outcome include"),
      bullets(
        "shorter duration of depression",
        "recurrent depressive episode",
        "taking a concomitant antidepressant",
        "being less treatment resistant",
        "presence of sleep disturbance",
      ),
      label("Negative outcome predictors include"),
      bullets(
        "older age",
        "short duration of TMS therapy (<15 sessions)",
        "psychotic depression",
        "history of poor response to electroconvulsive therapy (ECT)",
      ),
      para(
        "Read More: ",
        [
          "Predictors of Response to Repetitive Transcranial Magnetic Stimulation in Depression: A Review of Recent Updates",
          "https://pubmed.ncbi.nlm.nih.gov/30690937/",
        ],
      ),
    ],
  },
  {
    q: "How good is the treatment effect in obsessive-compulsive disorder (OCD)?",
    a: [
      para(
        "The data with TMS has been encouraging. About 40-60% of patients with OCD are resistant to at least one medication. With TMS, ",
        ["near half of patients", "https://pubmed.ncbi.nlm.nih.gov/31109199/"],
        " with treatment resistant OCD can improve their symptoms significantly.",
      ),
      para(
        "TMS also ",
        ["improves depressive symptoms", "https://www.sciencedirect.com/science/article/pii/S0165032722000544"],
        " in addition to the obsessive-compulsive symptoms.",
      ),
    ],
  },
  {
    q: "Is a shorter but more intensive course of TMS available?",
    a: [
      para("Yes. The treatment course of TMS can be given several times a day over 5 days."),
      label("Published research"),
      para(
        "The remission rate was near 80% for patients with depression in a ",
        ["controlled study", "https://ajp.psychiatryonline.org/doi/10.1176/appi.ajp.2021.20101429"],
        " conducted by Stanford University.",
      ),
    ],
  },
];

export const KETAMINE_FAQS: FaqItem[] = [
  {
    q: "How effective is ketamine treatment?",
    a: answer(
      "About two-thirds of patients with ",
      [
        "treatment-resistant depression",
        "https://ajp.psychiatryonline.org/doi/full/10.1176/appi.ajp.2016.16010037",
      ],
      " and ",
      ["chronic PTSD", "https://ajp.psychiatryonline.org/doi/full/10.1176/appi.ajp.2020.20050596"],
      " would respond to ketamine treatment, which is a reduction in half of the symptoms. It's imperative to emphasize that while ketamine boasts a rapid effect, the influence of a single-dose treatment is fleeting. To unlock an amplified and prolonged impact, ",
      [
        "multiple treatments are essential",
        "https://www.sciencedirect.com/science/article/abs/pii/S0165032720327026",
      ],
      ".",
    ),
  },
  {
    q: "How soon can I expect to see results with ketamine treatment?",
    a: answer(
      "Using a twice-weekly dosing schedule, some patients would respond within a week. However, the effect tends to be short-lasting with fewer treatments. A ",
      [
        "4-week treatment program",
        "https://ajp.psychiatryonline.org/doi/full/10.1176/appi.ajp.2016.16010037",
      ],
      " is recommended.",
    ),
  },
  {
    q: "How is ketamine administered?",
    a: answer(
      "While ketamine can be administered in multiple routes, our centre uses ",
      ["intramuscular", "https://link.springer.com/article/10.1186/s12888-022-04268-5"],
      " and ",
      [
        "subcutaneous injections",
        "https://www.frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2021.513068/full",
      ],
      ", as they have demonstrated effectiveness. During the induction phase, ketamine is administered twice weekly over 4 weeks.",
    ),
  },
  {
    q: "Is ketamine treatment safe?",
    a: answer(
      "Ketamine is highly accepted by most patients. In ",
      ["most studies", "https://www.sciencedirect.com/science/article/pii/S0022395621001369"],
      ", 95-100% of patients can complete the whole treatment course. However, like all medical treatments, ketamine can be associated with some ",
      ["side effects", "https://www.clinicalkey.com/#!/content/playContent/1-s2.0-S2215036617302729"],
      ". Neurological: headaches and dizziness; less commonly sedation, faintness, poor coordination, or tremors; typically short-term. Psychotomimetic: dissociation, perceptual disturbances, and feelings of unreality; no long-term psychotomimetic effects have been reported in studies. Acute psychiatric: anxiety, agitation, or mood elevation; less frequently detachment, emotional blunting, or psychosis. Cognitive: memory loss, poor concentration, or confusion, typically short-lived. The clinic also remains vigilant regarding less common risks like long-term cognitive impairments, urinary tract symptoms and the development of tolerance.",
    ),
  },
  {
    q: "Is maintenance treatment necessary?",
    a: "A maintenance treatment plan spanning six months is recommended. Nevertheless, given that many patients undergoing ketamine treatment have shown resistance to medications, experiencing mild relapse upon discontinuation of treatment is not uncommon. In such instances, resuming ketamine treatment often proves effective in alleviating symptoms.",
  },
  {
    q: "What factors affect the treatment outcome?",
    a: answer(
      ["Positive predictors", "https://www.liebertpub.com/doi/abs/10.1089/cap.2023.0047"],
      " of ketamine treatment outcome include: a shorter duration of depression; taking a concomitant antidepressant; being less treatment-resistant. ",
      ["Negative outcome predictors", "https://onlinelibrary.wiley.com/doi/abs/10.1002/hup.2836"],
      " include: a higher number of treatment failures; more severe depressive illness.",
    ),
  },
  {
    q: "Who cannot receive ketamine treatment?",
    a: "Ketamine administration is contraindicated in patients with a heightened cardiovascular risk, including those with unstable angina and poorly controlled hypertension. Individuals with elevated intracranial and intraocular pressure should also refrain from ketamine treatment. Furthermore, patients with uncontrolled hyperthyroidism, severe liver disease, or a history of psychosis are advised to avoid ketamine therapy. Additionally, due to potential interactions with other substances, the use of substances and alcohol is discouraged during ketamine treatment. Pregnant patients are cautioned against undergoing ketamine therapy due to uncertainties regarding fetal risks.",
  },
  {
    q: "What is a ketamine bad trip?",
    a: "Within this transformative experience, encountering a “bad trip” entails confronting intense emotions, anxiety, and a perceived loss of control. While these experiences can be uncomfortable and challenging, they are temporary and often indicative of deep-seated emotional or psychological issues that are surfacing. Another aspect is the sense of time distortion. A bad trip is one in which the person experiences sensory overload, vivid hallucinations, and deep thoughts that are challenging to deal with in the moment. In our nurturing environment, your well-being is our top priority. We provide unwavering support and guidance throughout your journey.",
  },
  {
    q: "Is ketamine treatment FDA-approved?",
    a: answer(
      "At present, the FDA has approved only one type of ketamine called esketamine for treating major depressive disorder. It's a specific part of ketamine called the S-enantiomer. However, research indicates that ",
      [
        "esketamine might not work as well as the full mixture of ketamine",
        "https://www.sciencedirect.com/science/article/pii/S016503272032766X",
      ],
      ". That is why many ketamine clinics use ketamine “off-label” for treating psychiatric disorders, even though it's not officially approved for those uses.",
    ),
  },
  {
    q: "How should I choose among ketamine and TMS treatments?",
    a: answer(
      "Both treatments demonstrate efficacy in addressing several mental illnesses, albeit through distinct mechanisms. To summarize, their efficacy is similar. Ketamine offers a rapid onset of action, whereas TMS is associated with a lower incidence of side effects. Ketamine has more ",
      [
        "short-term side effects",
        "https://www.thelancet.com/journals/lanpsy/article/PIIS2215-0366(22)00317-0/abstract",
      ],
      ". TMS onset 4-6 weeks; ketamine within 2 weeks, sometimes hours or days. Effectiveness similar, about 2/3 of patients would significantly improve. TMS is more durable. After TMS patients can return to work; after ketamine recovery time may be up to a few hours and driving is not recommended on the treatment day. TMS sessions usually 20-30 (4-6 weeks); ketamine about 4-6 sessions (2-3 weeks). Individuals who do not respond to one treatment may find success with the other. The decision is made collaboratively with the patient and healthcare provider.",
    ),
  },
];

export const LANDING_FAQS: FaqItem[] = [
  {
    q: "Why consider TMS or ketamine when medications haven't worked?",
    a: "Some individuals do not experience sufficient benefit from antidepressant medications, or cannot tolerate their side effects. TMS and ketamine are evidence-based treatments that work through different mechanisms than traditional medications and may offer additional options when standard approaches have not provided adequate relief. These treatments are considered within a psychiatrist-led assessment to determine appropriateness and safety.",
  },
  {
    q: "How soon could I start noticing changes with treatment?",
    a: "Response timelines vary. With TMS, changes often emerge gradually over the course of treatment, though some individuals notice improvements earlier. Ketamine therapy may produce more rapid changes for some people, sometimes within days, though responses differ. Your psychiatrist will discuss realistic expectations based on your clinical profile.",
  },
  {
    q: "Will the results last, or will my symptoms come back?",
    a: "Both TMS and ketamine aim to produce meaningful symptom improvement, but long-term outcomes vary between individuals. Some people experience sustained benefit, while others may require maintenance strategies or additional treatments. Ongoing psychiatric monitoring helps guide next steps if symptoms return.",
  },
  {
    q: "How do I know if I'm the right candidate for TMS or ketamine therapy?",
    a: "Candidacy is determined through a comprehensive psychiatric assessment that reviews your diagnosis, treatment history, medical factors, and goals of care. Not everyone is suitable for these treatments, and careful evaluation ensures that recommendations are safe, appropriate, and individualized.",
  },
  {
    q: "Are there any side effects I should know about?",
    a: "TMS is generally well tolerated; common side effects may include scalp discomfort or headache, usually mild and temporary. Ketamine therapy can cause short-term effects such as dissociation, changes in blood pressure, or nausea, which are monitored closely during treatment. Your psychiatrist will review potential risks and benefits in detail before proceeding.",
  },
  {
    q: "How do TMS and ketamine actually work on the brain?",
    a: "Transcranial Magnetic Stimulation (TMS) uses focused magnetic fields to stimulate specific areas of the brain involved in mood regulation, particularly regions that may be underactive in depression. Repeated stimulation over time can help modify activity in neural circuits associated with depression and related conditions. TMS is non-invasive and does not require anesthesia. Ketamine therapy works through a different mechanism. Ketamine affects glutamate signaling in the brain and is thought to promote rapid changes in neural connectivity and plasticity. This mechanism is distinct from traditional antidepressants and may help explain why some individuals experience improvement even after multiple medication trials. Ketamine is administered in a medically supervised setting with careful monitoring. Both treatments are offered within a structured psychiatric assessment to determine appropriateness, safety, and expected benefit based on an individual's clinical history.",
  },
  {
    q: "What does a typical TMS treatment course look like?",
    a: "TMS is delivered in outpatient sessions typically lasting 3–20 minutes, depending on the protocol. Treatments are usually provided multiple times per week over several weeks. An accelerated TMS option may be available for selected individuals following psychiatric assessment.",
  },
  {
    q: "How is ketamine therapy administered and monitored?",
    a: "Ketamine is administered intramuscularly by a registered nurse under the supervision of a psychiatrist. Each session takes place in a medically monitored setting, with careful observation before, during, and after treatment to ensure safety and comfort.",
  },
  {
    q: "What happens if I don't respond to TMS or ketamine?",
    a: "Not all individuals respond to these treatments. If adequate benefit is not achieved, your psychiatrist will review alternative strategies, which may include adjustments to treatment, additional therapies, or referral for other evidence-based options.",
  },
  {
    q: "Can I continue my current medications during treatment?",
    a: "In many cases, existing psychiatric medications are continued, though this depends on individual circumstances. Medication decisions are reviewed and managed by your psychiatrist as part of the overall treatment plan.",
  },
];
