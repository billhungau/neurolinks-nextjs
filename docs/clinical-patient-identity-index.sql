create table if not exists public.patient_identity_index (
  subject_key text primary key,
  vcita_client_id text not null unique,
  updated_at timestamptz not null default now()
);

alter table public.patient_identity_index enable row level security;

revoke all on table public.patient_identity_index from anon;
revoke all on table public.patient_identity_index from authenticated;
grant all on table public.patient_identity_index to service_role;

create index if not exists patient_identity_index_updated_at_idx
  on public.patient_identity_index (updated_at desc);

comment on table public.patient_identity_index is
  'Server-only mapping between pseudonymous clinical subject keys and vcita client IDs. No names, email, phone, DOB, PHN, or questionnaire content.';
