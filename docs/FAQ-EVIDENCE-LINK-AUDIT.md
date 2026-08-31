# FAQ evidence-link audit

Restores the 28 WordPress FAQ citations that were omitted from the Next.js TMS and ketamine FAQs. Original WordPress URLs are retained even when a publisher redirects, paywalls, or bot-protects the destination.

Checked from this environment on 31 August 2026 with `GET`/`HEAD` follow-redirects. A `403` here usually means publisher bot-protection or a paywall, not a confirmed missing article. Citations were not removed or substituted.

## TMS FAQ (16 citations)

| FAQ question | Linked phrase | Destination URL | HTTP result | Access (apparent) |
| --- | --- | --- | --- | --- |
| I have been taking medications. Why do I need TMS? | `up to 30%` | https://www.psychiatrist.com/jcp/depression/prevalence-national-burden-treatment-resistant-depression-major-depressive-disorder-in-us/ | 200; redirect drops `/depression/` from the path | Freely reachable; same article |
| I have been taking medications. Why do I need TMS? | `up to 60%` | https://www.sciencedirect.com/science/article/abs/pii/S0278584605003520?via%3Dihub | 403 | Publisher-gated / paywalled abstract |
| I have been taking medications. Why do I need TMS? | `depression` (in “reducing symptoms in treatment-resistant depression”) | https://www.sciencedirect.com/science/article/abs/pii/S0165032720328573 | 403 | Publisher-gated / paywalled |
| I have been taking medications. Why do I need TMS? | `obsessive-compulsive disorder` (final sentence only) | https://www.nature.com/articles/s41398-021-01453-0 | 200; cookie interstitial | Open-access article |
| Are there any side effects from TMS? | `<0.1%` | https://www.sciencedirect.com/science/article/pii/S1935861X21001182 | 403 | Publisher-gated / paywalled |
| Are there any side effects from TMS? | `lifetime prevalence` | https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5272794/ | 200; redirect to `https://pmc.ncbi.nlm.nih.gov/articles/PMC5272794/` | Freely reachable PMC article |
| I am pregnant. Can I receive TMS? | `mothers` | https://link.springer.com/article/10.1007/s00737-013-0397-0 | 200; cookie interstitial | Publisher page; access may be limited |
| I am pregnant. Can I receive TMS? | `fetus` | https://journals.sagepub.com/doi/abs/10.1177/1039856221992636#abstract | 403 | Publisher-gated / paywalled abstract |
| I am pregnant. Can I receive TMS? | `long-term study` | https://pubmed.ncbi.nlm.nih.gov/33653123/ | 203 | Freely reachable PubMed record |
| What factors affect the treatment outcome? | `Predictors of Response to Repetitive Transcranial Magnetic Stimulation in Depression: A Review of Recent Updates` | https://pubmed.ncbi.nlm.nih.gov/30690937/ | 203 | Freely reachable PubMed record |
| How likely will depression improve with TMS? | `non treatment resistant depression` | https://bmcpsychiatry.biomedcentral.com/articles/10.1186/s12888-018-1989-z | 200; redirect to Springer | Open-access article |
| How likely will depression improve with TMS? | `treatment-resistant depression` | https://www.psychiatrist.com/jcp/depression/repetitive-transcranial-magnetic-stimulation-treatment-2/ | 200; redirect drops `/depression/` from the path | Freely reachable; same article |
| How good is the treatment effect in obsessive-compulsive disorder (OCD)? | `near half of patients` | https://pubmed.ncbi.nlm.nih.gov/31109199/ | 203 | Freely reachable PubMed record |
| How good is the treatment effect in obsessive-compulsive disorder (OCD)? | `improves depressive symptoms` | https://www.sciencedirect.com/science/article/pii/S0165032722000544 | 403 | Publisher-gated / paywalled |
| Is the effect of TMS durable? | `Read more about the study` | https://pubmed.ncbi.nlm.nih.gov/30344109/ | 203 | Freely reachable PubMed record |
| Is a shorter but more intensive course of TMS available? | `controlled study` | https://ajp.psychiatryonline.org/doi/10.1176/appi.ajp.2021.20101429 | 403 | Publisher-gated / paywalled |

## Ketamine FAQ (12 citations)

| FAQ question | Linked phrase | Destination URL | HTTP result | Access (apparent) |
| --- | --- | --- | --- | --- |
| How effective is ketamine treatment? | `treatment-resistant depression` | https://ajp.psychiatryonline.org/doi/full/10.1176/appi.ajp.2016.16010037 | 403 | Publisher-gated / paywalled |
| How effective is ketamine treatment? | `chronic PTSD` | https://ajp.psychiatryonline.org/doi/full/10.1176/appi.ajp.2020.20050596 | 403 | Publisher-gated / paywalled |
| How effective is ketamine treatment? | `multiple treatments are essential` | https://www.sciencedirect.com/science/article/abs/pii/S0165032720327026 | 403 | Publisher-gated / paywalled |
| How soon can I expect to see results with ketamine treatment? | `4-week treatment program` | https://ajp.psychiatryonline.org/doi/full/10.1176/appi.ajp.2016.16010037 | 403 | Same 2016 AJP paper as the first ketamine citation |
| What factors affect the treatment outcome? | `Positive predictors` | https://www.liebertpub.com/doi/abs/10.1089/cap.2023.0047 | 403; redirect to Sage | Publisher moved the journal; original Liebert URL kept |
| What factors affect the treatment outcome? | `Negative outcome predictors` | https://onlinelibrary.wiley.com/doi/abs/10.1002/hup.2836 | 403 | Publisher-gated / paywalled |
| How is ketamine administered? | `intramuscular` | https://link.springer.com/article/10.1186/s12888-022-04268-5 | 200; cookie interstitial | Open-access article |
| How is ketamine administered? | `subcutaneous injections` | https://www.frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2021.513068/full | 200 | Freely reachable |
| Is ketamine treatment safe? | `most studies` | https://www.sciencedirect.com/science/article/pii/S0022395621001369 | 403 | Publisher-gated / paywalled |
| Is ketamine treatment safe? | `side effects` | https://www.clinicalkey.com/#!/content/playContent/1-s2.0-S2215036617302729 | 200 | Login-restricted (ClinicalKey); original citation kept |
| Is ketamine treatment FDA-approved? | `esketamine might not work as well as the full mixture of ketamine` | https://www.sciencedirect.com/science/article/pii/S016503272032766X | 403 | Publisher-gated / paywalled |
| How should I choose among ketamine and TMS treatments? | `short-term side effects` | https://www.thelancet.com/journals/lanpsy/article/PIIS2215-0366(22)00317-0/abstract | 403 | Publisher-gated / paywalled |

## Restored citation phrases that Next.js had dropped

These phrases existed on WordPress and are required to restore the mapped links. Surrounding Next.js statistics and protocol wording were not rewritten.

| Page | FAQ | Restored phrase | Notes |
| --- | --- | --- | --- |
| TMS | What factors affect the treatment outcome? | `Read More: Predictors of Response to Repetitive Transcranial Magnetic Stimulation in Depression: A Review of Recent Updates` | Study title restored after the existing predictor lists. Title is not shortened. |
| TMS | Is the effect of TMS durable? | `Read more about the study` | Citation line restored after the existing durability wording. |
| Ketamine | How should I choose among ketamine and TMS treatments? | `Ketamine has more short-term side effects.` | WordPress placed this link on the comparison-table cell. Next.js no longer has that table. The linked phrase is restored in the condensed answer without restoring nausea / heart-rate statistics from the table. |

## Non-FAQ evidence links (read-only)

Compared WordPress treatment pages with the current Next.js pages. No additional missing non-FAQ destinations were found. Existing Next.js links were left unchanged.

| Page | Next.js section | Linked text (Next.js) | URL | Status |
| --- | --- | --- | --- | --- |
| TMS | How TMS works | A published study | https://pubmed.ncbi.nlm.nih.gov/28631869/ | Present; matches WordPress `A study` destination |
| TMS | How TMS works | brain-derived neurotrophic factor (BDNF) | https://pubmed.ncbi.nlm.nih.gov/21795553/ | Present; matches WordPress |
| Ketamine | What is ketamine treatment? | a single dose of ketamine | https://www.sciencedirect.com/science/article/pii/S0022395620311468 | Present; 403 in this environment |
| Ketamine | What is ketamine treatment? | several psychiatric conditions | https://www.cambridge.org/core/journals/bjpsych-open/article/ketamine-for-the-treatment-of-mental-health-and-substance-use-disorders-comprehensive-systematic-review/36E261BFA62CDA6459B88F7777415FDA | Present; WordPress anchor was `various psychiatric conditions` (wording only) |
| Ketamine | How ketamine may work | brain plasticity | https://www.nature.com/articles/s41398-023-02451-0 | Present; matches WordPress |

## Owner review

- ClinicalKey remains login-restricted. It was not replaced.
- ScienceDirect, AJP, Sage, Wiley, Lancet, and Liebert/Sage targets often return 403 or paywall pages. Original WordPress URLs were kept.
- psychiatrist.com and PubMed Central redirects point at the same articles. Code still uses the original WordPress URLs.
- No citation was retargeted to a different study.
