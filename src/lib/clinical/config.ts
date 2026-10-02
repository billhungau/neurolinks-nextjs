const REQUIRED_CLINICAL_ENV = [
  "CLINICAL_SUPABASE_URL",
  "CLINICAL_SUPABASE_SERVICE_ROLE_KEY",
  "PSEUDONYMIZATION_KEY_V1",
] as const;

type ClinicalEnvName = (typeof REQUIRED_CLINICAL_ENV)[number];

function requireClinicalEnv(name: ClinicalEnvName): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`[clinical-config] Missing required environment variable: ${name}`);
  }
  return value;
}

export type ClinicalConfig = {
  supabaseUrl: string;
  supabaseServiceKey: string;
  pseudonymizationKeyV1: string;
};

export function clinicalConfig(): ClinicalConfig {
  return {
    supabaseUrl: requireClinicalEnv("CLINICAL_SUPABASE_URL").replace(/\/+$/, ""),
    supabaseServiceKey: requireClinicalEnv("CLINICAL_SUPABASE_SERVICE_ROLE_KEY"),
    pseudonymizationKeyV1: requireClinicalEnv("PSEUDONYMIZATION_KEY_V1"),
  };
}
