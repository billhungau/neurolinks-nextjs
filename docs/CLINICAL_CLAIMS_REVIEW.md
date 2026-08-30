# Clinical claims review (report only)

Do **not** change these statements without Dr. Au’s approval. This inventory is for verification, not a rewrite brief. Draft replacements are omitted unless clearly labelled as drafts.

## Homepage (`/`) — treatment cards, benefits, services

| Exact quotation | Section | Verify |
| --- | --- | --- |
| “Transcranial magnetic stimulation is an FDA-approved non-invasive neuromodulation therapy for treatment-resistant depression, obsessive-compulsive disorder, and post-traumatic stress disorder.” | Treatment options · TMS card | FDA vs Health Canada language; which indications are cleared vs off-label; PTSD wording. |
| “TMS is more effective than conventional medication treatments with minimal side effects.” | Benefits 02 | Comparative efficacy and “minimal side effects” vs labelled risks (headache, rare seizure). |
| “TMS is covered by Veterans Affair Canada and certain worker compensation programs.” | TMS card; Benefits 03 | Spelling (Veterans Affairs Canada); current VAC/RCMP/Medavie vs WCB eligibility. |
| “Ketamine is administered in controlled clinical settings through intramuscular and subcutaneous injections.” | Ketamine card; Benefits 05 | Confirm current routes of administration. |
| “Its rapid onset of action distinguishes it from traditional antidepressants, often alleviating symptoms within hours or days.” | Ketamine card; Benefits 04 | Onset range; “often” vs individual response. |
| “This evaluation is completely covered by MSP.” / “A comprehensive psychiatric evaluation is completely covered by MSP.” | Services eval; Benefits 06; pathway 02 | MSP coverage of the psychiatric assessment vs TMS/ketamine procedures. |
| “Not every condition listed on this site is an automatic indication for TMS or ketamine; treatment is recommended only when clinically appropriate.” | Services intro | Qualification to retain; confirm it matches clinical practice. |

## About TMS (`/about-tms-treatment-on-psychiatric-illness/`)

| Exact quotation | Section | Verify |
| --- | --- | --- |
| “TMS has been proven **safe** and **effective**.” | What is TMS? | Scope (which indications, populations). |
| Conditions list including bipolar depression, anxiety disorders, “Pain conditions, such as migraine and fibromyalgia” under “Conditions We Treat” | Conditions We Treat | Approved vs off-label / investigational uses. |
| “FDA has approved TMS for patients aged 15 and older.” | Age group | Device, indication, and age; Canadian status. |
| “Veterans Affair Canada (veterans and RCMP)” | Coverage | Program names and eligibility. |
| FAQ: “up to 30% of patients with depression are medication resistant”; “up to 60%” OCD; comparative TMS vs no-TMS remission 30% vs 6%; “more than 5 times as likely”; OCD “near half”; durability “half of patients… up to 1 year”; accelerated TMS “remission rate was near 80%” | FAQs (`src/content/faqs.ts`, TMS_FAQS) | Study selection, dates, applicability to this clinic’s protocol. |
| “TMS is considered safe for mothers and the fetus.” / “None of the mothers or children experienced any detrimental effects from TMS.” | Pregnancy FAQ | Whether this belongs on a public clinic page without specialist review. |
| “Rarely, there is a <0.1% risk that seizure could occur.” | Side effects FAQ | Current device literature. |

## About Ketamine (`/ketamine-treatment-resistant-depression-nanaimo/`)

| Exact quotation | Section | Verify |
| --- | --- | --- |
| “a single dose of ketamine provides an antidepressant effect within a few hours and it can be sustained up to a week” | What is Ketamine Treatment? | Route (study vs IM/SC used here). |
| Efficacy for MDD, bipolar depression, OCD, anxiety, PTSD | Same | On-label vs off-label ketamine vs esketamine. |
| “Ketamine exerts a rapid therapeutic effect”; “acts quickly often within days” | Mechanism | Patient-facing certainty. |
| “Conditions We Treat” including “Pain conditions” | Conditions | Same indication issue as TMS page. |
| FAQ: “About two-thirds of patients… would respond”; FDA esketamine vs racemic ketamine “off-label”; “efficacy is similar” TMS vs ketamine; “2/3 of patients would significantly improve” | KETAMINE_FAQS | Comparative claims and FDA wording. |

## Services (`/services-psychiatric-tms-ketamine-treatment/`)

| Exact quotation | Section | Verify |
| --- | --- | --- |
| “*The assessment is completely covered by the Medical Service Plan (MSP).” | #assessment | Same as homepage MSP. |
| “The antidepressant effects of ketamine can appear within weeks, hours or days after a single infusion.” | #ketamine | Clinic uses IM/SC, not infusion — wording mismatch. |
| “TMS and Ketamine are unfortunately not covered by the Medical Service Plan (MSP).” | Fee | Contrast with assessment coverage. |
| “The TMS treatment is covered by the Medavie Blue Cross insurance, which provides coverage for members of the Canadian Armed Forces and Royal Canadian Mounted Police.” | Fee | Align with VAC wording on homepage. |
| “If you are a work injury case with the WorkSafeBC, you may also be covered.” | Fee | Align with “certain worker compensation programs”. |

## Advertising landing (`/neurolinks-psychiatry-nanaimo-bc/`)

Landing FAQs are more cautious (“may”, “vary”). Still confirm any remaining efficacy/timeline language in page body and FAQs against Dr. Au’s preferred public wording.

## Metadata (titles/descriptions)

SEO titles/descriptions still use phrases such as “Safe, effective, and evidence-based care” and “Effective for depression…”. Review for advertising-standard compliance separately from the homepage design pass.

## Draft (requires Dr. Au’s approval) — not applied

If FDA/Health Canada wording needs softening on the homepage TMS card, a possible draft is: “TMS is a non-invasive neuromodulation therapy used at NeuroLinks for selected patients after psychiatric assessment.” **Do not publish this draft without approval.**
