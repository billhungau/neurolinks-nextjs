import type { NativeQuestionnaireSchema } from "./native-builder";

function option(id: string, label: string) {
  return { id, label, score: 0 };
}

export const PATIENT_INTAKE_CODE = "intake";
export const PATIENT_INTAKE_NAME = "Patient Intake Form";

export function patientIntakeNativeSchema(): NativeQuestionnaireSchema {
  return {
    source: "native",
    title: PATIENT_INTAKE_NAME,
    patientFacingName: "Patient intake form",
    description:
      "Please complete this form before your appointment. The secure link already identifies your NeuroLinks record, so your name is not requested here.",
    fields: [
      {
        kind: "paragraph",
        id: "intake_privacy_notice",
        text:
          "Please provide the requested health and contact information. Your name is intentionally not requested because this secure link is already associated with your NeuroLinks record.",
      },
      {
        kind: "text",
        id: "date_of_birth",
        label: "Date of Birth",
        required: true,
        placeholder: "YYYY-MM-DD",
      },
      {
        kind: "text",
        id: "phn",
        label: "Healthcard Number (PHN)",
        required: true,
        placeholder: "10-digit BC Personal Health Number",
      },
      { kind: "pagebreak", id: "intake_page_health" },
      {
        kind: "textarea",
        id: "presenting_problems",
        label: "What problem(s) are you seeking help for?",
        required: true,
      },
      {
        kind: "textarea",
        id: "medical_conditions",
        label: "Do you have any of the following or other medical conditions? Please describe.",
        required: false,
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
      },
      { kind: "pagebreak", id: "intake_page_contacts" },
      {
        kind: "text",
        id: "email",
        label: "E-mail",
        required: false,
        placeholder: "Email address",
      },
      {
        kind: "text",
        id: "contact_number",
        label: "Contact number",
        required: false,
        placeholder: "Phone number",
      },
      {
        kind: "textarea",
        id: "address",
        label: "Address",
        required: false,
      },
      {
        kind: "text",
        id: "province",
        label: "Province",
        required: false,
        placeholder: "Province",
      },
      {
        kind: "text",
        id: "next_of_kin_name",
        label: "Next of kin / emergency contact name",
        required: false,
        placeholder: "Full name",
      },
      {
        kind: "text",
        id: "emergency_relationship",
        label: "Relationship to next of kin / emergency contact",
        required: false,
        placeholder: "Relationship",
      },
      {
        kind: "text",
        id: "emergency_phone",
        label: "Next of kin / emergency contact phone number",
        required: false,
        placeholder: "Phone number",
      },
      {
        kind: "text",
        id: "family_doctor",
        label: "Family doctor",
        required: false,
        placeholder: "Doctor or clinic name",
      },
      {
        kind: "text",
        id: "family_doctor_phone",
        label: "Family doctor contact number",
        required: false,
        placeholder: "Phone number",
      },
      {
        kind: "text",
        id: "referred_by",
        label: "Referred by",
        required: false,
        placeholder: "Referral source",
      },
      { kind: "pagebreak", id: "intake_page_policy" },
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
