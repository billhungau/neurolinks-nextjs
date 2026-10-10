import type { NativeQuestionnaireSchema } from "./native-builder";

function option(id: string, label: string) {
  return { id, label, score: 0 };
}

export const PATIENT_INTAKE_CODE = "intake";
export const PATIENT_INTAKE_NAME = "Patient Intake Form";
export const PATIENT_INTAKE_SCHEMA_REVISION = 5;

export function patientIntakeNativeSchema(): NativeQuestionnaireSchema {
  return {
    source: "native",
    title: PATIENT_INTAKE_NAME,
    patientFacingName: "Patient intake form",
    description: "Please complete this form before your appointment.",
    fields: [
      {
        kind: "text",
        id: "date_of_birth",
        label: "Date of birth",
        required: true,
        placeholder: "",
      },
      {
        kind: "text",
        id: "phn",
        label: "Personal Health Number (PHN)",
        required: true,
        placeholder: "",
      },
      { kind: "pagebreak", id: "intake_page_health" },
      {
        kind: "textarea",
        id: "presenting_problems",
        label: "What problem(s) are you seeking help for?",
        required: true,
        placeholder: "",
      },
      {
        kind: "textarea",
        id: "medical_conditions",
        label: "Do you have any of the following or other medical conditions? Please describe.",
        required: false,
        placeholder: "",
      },
      {
        kind: "single",
        id: "allergies_yes_no",
        label: "Do you have any allergies?",
        required: true,
        options: [option("allergies_no", "No"), option("allergies_yes", "Yes")],
      },
      {
        kind: "textarea",
        id: "allergies_details",
        label: "If yes, please provide details of allergies.",
        required: false,
        placeholder: "",
      },
      {
        kind: "single",
        id: "prior_tms_ect",
        label: "Have you ever had TMS or ECT before?",
        required: true,
        options: [option("tms_ect_no", "No"), option("tms_ect_yes", "Yes")],
      },
      {
        kind: "textarea",
        id: "substance_use",
        label: "Please advise us about alcohol, cannabis, nicotine, or other substance use that may be relevant to your care.",
        required: false,
        placeholder: "",
      },
      { kind: "pagebreak", id: "intake_page_contacts" },
      { kind: "text", id: "email", label: "Email", required: false, placeholder: "" },
      { kind: "text", id: "contact_number", label: "Phone number", required: false, placeholder: "" },
      { kind: "text", id: "address_line1", label: "Address line 1", required: false, placeholder: "" },
      { kind: "text", id: "address_line2", label: "Address line 2", required: false, placeholder: "" },
      { kind: "text", id: "city", label: "City", required: false, placeholder: "" },
      { kind: "text", id: "province", label: "Province", required: false, placeholder: "" },
      { kind: "text", id: "postal_code", label: "Postal code", required: false, placeholder: "" },
      {
        kind: "text",
        id: "next_of_kin_name",
        label: "Name of next of kin (relationship)",
        required: false,
        placeholder: "",
      },
      { kind: "text", id: "emergency_phone", label: "Next of kin contact number", required: false, placeholder: "" },
      { kind: "text", id: "family_doctor", label: "Family doctor", required: false, placeholder: "" },
      { kind: "text", id: "family_doctor_phone", label: "Family doctor contact number", required: false, placeholder: "" },
      { kind: "text", id: "referred_by", label: "Referred by", required: false, placeholder: "" },
      { kind: "pagebreak", id: "intake_page_policy" },
      {
        kind: "paragraph",
        id: "clinical_documentation_assistant_policy",
        text:
          "Clinical Documentation Assistant\n\nNeuroLinks may use a secure digital clinical documentation assistant during your appointment to support accurate and efficient clinical record keeping. The documentation assistant uses automated language-processing technology, including artificial intelligence, to process the conversation between you and your physician and help prepare a draft clinical note.\n\nThe conversation is converted into a temporary written transcription for this purpose. No audio recording of your appointment is created or retained. The temporary transcription is used for the documentation process and is deleted after the draft clinical note has been prepared.\n\nThe purpose of the documentation assistant is to reduce the amount of time your physician spends typing or taking notes during the appointment, allowing greater attention to the clinical conversation.\n\nThe documentation assistant does not make diagnoses, treatment decisions, or other clinical decisions and does not replace your physician's professional judgment. As with any automated documentation technology, the draft may occasionally misunderstand, omit, or inaccurately summarize information discussed during an appointment. Your physician reviews the draft, makes any necessary corrections or changes, and is responsible for the final clinical note entered into your medical record.\n\nInformation processed for documentation may include personal health information discussed during your appointment, such as your symptoms, medical and psychiatric history, medications, treatment response, and other information relevant to your care. NeuroLinks uses this technology with safeguards intended to protect the privacy and confidentiality of personal health information and in accordance with applicable privacy requirements.\n\nUse of the clinical documentation assistant is voluntary. If you do not want it used during your appointment, please tell your physician or clinic staff. Declining its use will not affect your access to care.\n\nBy providing your consent below, you confirm that you understand the purpose of the clinical documentation assistant, how information from your appointment is processed, its potential benefits and limitations, and that you consent to its use during your appointments.",
      },
      {
        kind: "multiple",
        id: "clinical_documentation_assistant_consent",
        label: "Clinical Documentation Assistant consent",
        required: true,
        options: [
          option(
            "consented",
            "I have read and understood the Clinical Documentation Assistant Policy and consent to the use of the clinical documentation assistant during my appointments.",
          ),
        ],
      },
      {
        kind: "paragraph",
        id: "cancellation_policy",
        text:
          "Cancellation Policy\n\nBy scheduling an appointment, time is reserved specifically for you. NeuroLinks requests a minimum of 24 hours' notice for cancellations or rescheduling. If proper notice is not given, a cancellation fee of $50 may be applied. Failure to receive a reminder does not waive the cancellation fee.",
      },
      {
        kind: "single",
        id: "cancellation_acknowledgement",
        label: "Cancellation policy acknowledgement",
        required: true,
        options: [option("acknowledged", "I have read and acknowledge the cancellation policy.")],
      },
    ],
    scoring: {
      method: "sum",
      severityBands: [],
    },
  };
}
