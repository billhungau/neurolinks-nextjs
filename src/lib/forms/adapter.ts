export type FormResult = { ok: false; message: string };

export interface FormAdapter {
  submitContact(): Promise<FormResult>;
  submitReferral(): Promise<FormResult>;
}

const previewAdapter: FormAdapter = {
  async submitContact() {
    return {
      ok: false,
      message:
        "Development preview only — this form is not connected. No message was sent, stored, or logged.",
    };
  },
  async submitReferral() {
    return {
      ok: false,
      message:
        "Development preview only — this referral was not delivered, faxed, emailed, stored, or logged.",
    };
  },
};

export function getFormAdapter(): FormAdapter {
  return previewAdapter;
}
