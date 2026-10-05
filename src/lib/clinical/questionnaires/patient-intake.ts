import type { NativeQuestionnaireSchema } from "./native-builder";

function option(id: string, label: string) {
  return { id, label, score: 0 };
}

export const PATIENT_INTAKE_CODE = "intake";
export const PATIENT_INTAKE_NAME = "Patient Intake Form";
export const PATIENT_INTAKE_SCHEMA_REVISION = 3;

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
      },
      {
        kind: "text",
        id: "phn",
        label: "Personal Health Number (PHN)",
        required: true,
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
        label: "Email",
        required: false,
      },
      {
        kind: "text",
        id: "contact_number",
        label: "Phone number",
        required: false,
      },
      {
        kind: "text",
        id: "address_line1",
        label: "Address line 1",
        required: false,
      },
      {
        kind: "text",
        id: "address_line2",
        label: "Address line 2",
        required: false,
      },
      {
        kind: "text",
        id: "city",
        label: "City",
        required: false,
      },
      {
        kind: "text",
        id: "province",
        label: "Province",
        required: false,
      },
      {
        kind: "text",
        id: "postal_code",
        label: "Postal code",
        required: false,
      },
      {
        kind: "text",
        id: "next_of_kin_name",
        label: "Name of next of kin (relationship)",
        required: false,
      },
      {
        kind: "text",
        id: "emergency_phone",
        label: "Next of kin contact number",
        required: false,
      },
      {
        kind: "text",
        id: "family_doctor",
        label: "Family doctor",
        required: false,
      },
      {
        kind: "text",
        id: "family_doctor_phone",
        label: "Family doctor contact number",
        required: false,
      },
      {
        kind: "text",
        id: "referred_by",
        label: "Referred by",
        required: false,
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
