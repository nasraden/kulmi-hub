-- Company verification workflow for Kulmi Hub.
-- Existing companies remain unverified until an admin approves them.

alter table public.company_profiles
  add column verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'pending', 'verified', 'rejected')),
  add column verified_at timestamptz,
  add column verified_by uuid references public.profiles(id) on delete set null,
  add column verification_notes text;

create index company_profiles_verification_status_idx
  on public.company_profiles (verification_status);

create policy "company_profiles_admin_update"
  on public.company_profiles
  for update
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.guard_company_verification_updates()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.verification_status is distinct from old.verification_status then
    if not (
      old.verification_status in ('unverified', 'rejected')
      and new.verification_status = 'pending'
    ) then
      raise exception 'Only Kulmi Hub admins can change company verification status.';
    end if;
  end if;

  if new.verified_at is distinct from old.verified_at
     or new.verified_by is distinct from old.verified_by
     or new.verification_notes is distinct from old.verification_notes then
    raise exception 'Only Kulmi Hub admins can change verification review details.';
  end if;

  return new;
end;
$$;

create trigger guard_company_verification_updates
before update on public.company_profiles
for each row
execute function public.guard_company_verification_updates();
