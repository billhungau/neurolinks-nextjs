import type { NativeQuestionnaireSchema } from "./native-builder";

function option(id: string, label: string) {
  return { id, label, score: 0 };
}

export const PATIENT_INTAKE_CODE = "intake";
export const PATIENT_INTAKE_NAME = "Patient Intake Form";
export const PATIENT_INTAKE_SCHEMA_REVISION = 4;

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
