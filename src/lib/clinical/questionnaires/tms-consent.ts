import type { NativeQuestionnaireSchema } from "./native-builder";

export const TMS_CONSENT_CODE = "tms-consent";
export const TMS_CONSENT_NAME = "TMS Consent Form";
export const TMS_CONSENT_SCHEMA_REVISION = 1;

export function tmsConsentNativeSchema(): NativeQuestionnaireSchema {
  return {
    source: "native",
    title: TMS_CONSENT_NAME,
    patientFacingName: "TMS consent form",
    description: "Repetitive Transcranial Magnetic Stimulation (rTMS)",
    fields: [
      {
        kind: "paragraph",
        id: "tms_what_is_rtms",
        text:
          "What is rTMS?\n\nrTMS stands for “repetitive transcranial magnetic stimulation.” rTMS is a non-invasive FDA- and Health Canada-approved medical procedure.\n\nrTMS is a brain stimulation technique that relies on the generation of brief magnetic fields using an insulated coil that is placed over the scalp. These magnetic fields are the same type and strength as those used in magnetic resonance imaging (MRI) machines. The magnetic pulses generate a weak electrical current in the brain that briefly activates neural circuits at the stimulation site. rTMS is a safe and well-tolerated procedure that can be an effective treatment for adult patients with mental illness who have not benefitted from medication treatment. The potential benefit of rTMS is that it may lead to improvements in the symptoms of my psychiatric/neurological condition.\n\nI understand that not all patients respond equally well to rTMS. Like all forms of medical treatment, some patients recover quickly, others recover briefly and later relapse, while others may fail to have any response to rTMS therapy.",
      },
      {
        kind: "paragraph",
        id: "tms_alternatives",
        text:
          "Alternatives to rTMS\n\nI understand that there are alternative treatment options for my condition, including medications, psychotherapy, and electroconvulsive therapy (ECT). My doctor has explained to me the risks and benefits of these other options. My doctor has also explained why rTMS has been recommended for my specific case.",
      },
      {
        kind: "paragraph",
        id: "tms_procedure",
        text:
          "Procedure\n\nrTMS therapy involves a series of treatments. For each rTMS session, I will be brought into a specially equipped room in the clinic and seated in the treatment chair. Before beginning the rTMS procedure, I will be asked to remove any metal or magnetic-sensitive objects (e.g., jewelry, keys, credit cards).\n\nBecause rTMS produces a loud clicking sound with each pulse, I will be provided with the choice of using earplugs for my comfort and safety. rTMS does not require any anaesthesia or sedation, so I will be awake and alert during the entire procedure.\n\nThe insulated magnetic coil will be gently placed over the side or on top of my head. The TMS qualified technician will then adjust the TMS device by delivering a series of pulses until it gives just enough energy so that my hand twitches. The amount of energy required to make my hand twitch is called the “motor threshold.” Everyone has a different motor threshold and the treatments are given at an energy level that is just above my motor threshold.\n\nDuring the procedure, I will hear a clicking sound and feel a tapping sensation on my scalp. Once my motor threshold is determined, the magnetic coil will be moved to the front side of my head, over a region of the brain that scientists think may be responsible for causing depression. I will receive the treatment as a series of “pulses,” with a “rest” period between each pulse series. Treatment sessions typically last thirty to forty minutes but can last for 3-5 minutes with theta burst protocol. Trained staff will be monitoring me during the entire treatment.",
      },
      {
        kind: "paragraph",
        id: "tms_number_of_treatments",
        text:
          "Number of Treatments\n\nThe exact number of treatments I receive cannot be predicted ahead of time. The number of treatments I receive will depend on my psychiatric condition, my response to treatment, and the medical judgment of my psychiatrist.\n\nrTMS treatments are usually administered five times per week, but the frequency of my treatments may vary depending on my needs. Typically, patients who respond to rTMS experience results by the fourth to sixth week of treatment. However, some patients may experience results in less time while others may take longer. I may choose to end the treatments at any time.",
      },
      {
        kind: "paragraph",
        id: "tms_risks",
        text:
          "Risk/Potential side-effects\n\nAs with any medical treatment, rTMS carries a risk of side effects. However, rTMS is generally well-tolerated and only a small percentage of patients discontinue treatment because of side effects.\n\nDuring the treatment, I may experience tapping, facial twitching, or painful sensations at the treatment site while the magnetic coil is turned on. These types of sensations are reported by about one-third of patients. I understand that I should inform staff if this occurs. The technician may then adjust the stimulation settings or make changes to where the coil is placed to help make the procedure more comfortable for me.\n\nIn addition, about half of patients treated with rTMS experience headaches. I understand that both discomfort and headaches tend to get better over time and that the headaches generally responded very well to over-the-counter pain medications. Because the TMS device produces a loud click with each pulse, I understand that I will be provided with earplugs during treatment to minimize the risk of hearing loss. There have been no reported cases of permanent hearing loss with properly functioning hearing protection. If I notice that my earplugs become loose or have fallen out, I will notify the treatment staff immediately.\n\nAs with all antidepressant treatments, there is a small risk for the emergence of mania with rTMS therapy. My doctor has informed me of these symptoms and will monitor me for the development of these symptoms. If I notice these symptoms, I will alert my doctor immediately.\n\nThe most serious known risk of rTMS is the production of a seizure (0.1%). Although there have been a few case reports of seizures with the use of TMS devices, this risk is extremely small. Nonetheless, I will let my doctor know if I have a history of a seizure disorder, as it may influence my risk of developing a seizure with this procedure. The qualified TMS technician follows up-to-date safety guidelines for the use of TMS that are designed to minimize the risk of seizures with this technique.\n\nrTMS therapy is not effective for all patients with depression, and there is a risk that my depression will get worse. Any signs or symptoms of worsening depression should be reported immediately to your doctor. You may want to ask a family member or caregiver to monitor your symptoms to help you spot any signs of worsening depression.\n\nThere are no known adverse cognitive (thinking and memory) effects associated with rTMS therapy.",
      },
      {
        kind: "paragraph",
        id: "tms_long_term",
        text:
          "Long-Term Adverse Effects\n\nThere are no known long-term adverse effects reported with the use of rTMS. However, as this is a relatively new treatment, there may be unforeseen risks in the long-term that are currently unknown.",
      },
      {
        kind: "paragraph",
        id: "tms_metal_implants",
        text:
          "Metal Implants\n\nTMS should not be used by anyone who has non-removable magnetic-sensitive metal in their head or within twelve inches of the magnetic coil. Failure to follow this restriction could result in serious injury or death. Objects that may have this kind of metal include:\n\n1) Aneurysm clips or coils;\n2) Stents in your neck or brain\n3) Implanted stimulators\n4) Cardiac pacemakers or implantable cardioverter-defibrillator (ICD)\n5) Cardiac stents\n6) Electrodes to monitor your brain activity\n7) Metallic implants in your ears or eyes\n8) Shrapnel or bullet fragments\n9) Facial tattoos with metallic or magnetic sensitive ink\n10) Other metal devices or objects implanted in or near your head.\n\nAlthough the physician will enquire about metal implants, it is the patient responsibility to report any of them.",
      },
      {
        kind: "paragraph",
        id: "tms_payment_refund",
        text:
          "Payment and Refund Policy\n\nPayment Options for rTMS Treatment\n\nWeekly payment: $900 for 5 sessions\n\nFull course payment: $5,400 for 30 sessions\n\nPlease note that any treatment sessions already received are non-refundable.\n\nWe strongly recommend that you discuss with your psychiatrist before discontinuing treatment, as rTMS typically requires more than 10–15 sessions before noticeable effects occur.\n\nAccelerated TMS Treatment\n\nA non-refundable $500 deposit is required to secure an accelerated treatment week, as the full week will be reserved for you.",
      },
      {
        kind: "paragraph",
        id: "tms_further_questions",
        text:
          "Further Questions\n\nI understand that I should feel free to ask questions of my doctor or member of the TMS team about rTMS at this time or any time during or after the course of my treatment. I understand that my decision to agree to rTMS is being made on a voluntary basis and that I may withdraw my consent and have the treatments stopped at any time.",
      },
      { kind: "text", id: "consent_date", label: "Date", required: true },
      {
        kind: "paragraph",
        id: "tms_signature_intro",
        text: "By signing below, I hereby acknowledge that I have read, understand, and agree to the policies and procedures of NeuroLinks TMS service.",
      },
      { kind: "text", id: "patient_first_name", label: "First Name", required: true },
      { kind: "text", id: "patient_last_name", label: "Last Name", required: true },
      {
        kind: "paragraph",
        id: "tms_physician_intro",
        text: "I acknowledge that the following physician has explained the purpose of the procedure, the potential risks and benefits of the procedure, and the alternatives to rTMS.",
      },
      { kind: "text", id: "physician_name", label: "Physician name", required: true },
      {
        kind: "paragraph",
        id: "tms_final_consent",
        text:
          "All my questions regarding the procedure have been answered to my satisfaction.\n\nI understand there are other treatment options for my condition available to me and this has also been discussed with me. If during the course of treatment other conditions arise which, in the best judgment of the medical staff, require emergency treatment, I authorize and request the said treatment be performed.\n\nI further understand that no guarantee of any results has been made. I, therefore, authorize and request the staff of NeuroLinks to administer a course of rTMS treatments to me.\n\nI have read carefully, and I understand, the foregoing.",
      },
      {
        kind: "textarea",
        id: "patient_signature",
        label: "Your Signature",
        required: true,
        placeholder: "Sign in the box below",
      },
    ],
    scoring: { method: "sum", severityBands: [] },
  };
}
