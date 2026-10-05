alter table public.questionnaire_invitations
  add column if not exists token_ciphertext text null;

comment on column public.questionnaire_invitations.token_ciphertext is
  'AES-256-GCM encrypted raw invitation token, retained only while invitation is active so authenticated clinicians can redisplay the link.';
