create table if not exists public.patient_identity_index (
  subject_key text primary key,
  vcita_client_id text not null unique,
  last_submission_at timestamptz null,
  updated_at timestamptz not null default now()
);

alter table public.patient_identity_index
  add column if not exists last_submission_at timestamptz null;

alter table public.patient_identity_index enable row level security;

revoke all on table public.patient_identity_index from anon;
revoke all on table public.patient_identity_index from authenticated;
grant all on table public.patient_identity_index to service_role;

update public.patient_identity_index as pii
set last_submission_at = latest.submitted_at,
    updated_at = now()
from (
  select subject_key, max(submitted_at) as submitted_at
  from public.assessment_results
  group by subject_key
) as latest
where pii.subject_key = latest.subject_key
  and (pii.last_submission_at is null or pii.last_submission_at < latest.submitted_at);

create index if not exists patient_identity_index_updated_at_idx
  on public.patient_identity_index (updated_at desc);

create index if not exists patient_identity_index_last_submission_at_idx
  on public.patient_identity_index (last_submission_at desc)
  where last_submission_at is not null;

comment on table public.patient_identity_index is
  'Server-only mapping between pseudonymous clinical subject keys and vcita client IDs, plus latest submission timestamp for pagination. No names, email, phone, DOB, PHN, or questionnaire content.';
