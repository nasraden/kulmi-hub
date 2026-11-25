-- Kulmi Hub security hardening - Phase 1
-- Enables RLS on existing application tables and tightens high-risk write policies.
-- This migration does not drop or rewrite user data.

begin;

-- 1) Enforce RLS on every table reported by Supabase Security Advisor.
alter table public.applications enable row level security;
alter table public.certify_requests enable row level security;
alter table public.company_profiles enable row level security;
alter table public.company_talent_pools enable row level security;
alter table public.job_skills enable row level security;
alter table public.jobs enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.profiles enable row level security;
alter table public.talent_experience enable row level security;
alter table public.talent_profiles enable row level security;
alter table public.talent_skills enable row level security;

-- 2) Messages: validate both participants against the application/job.
-- SECURITY DEFINER avoids accidental failures when related rows are hidden by
-- their own RLS policies (for example, a closed job with an active conversation).
create or replace function public.can_send_application_message(
  p_application_id uuid,
  p_job_id uuid,
  p_sender_id uuid,
  p_receiver_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $
  select exists (
    select 1
    from public.profiles sender_profile
    join public.applications a on a.id = p_application_id
    join public.jobs j on j.id = a.job_id
    join public.company_profiles cp on cp.id = j.company_id
    join public.talent_profiles tp on tp.id = a.talent_id
    where sender_profile.id = p_sender_id
      and sender_profile.user_id = auth.uid()
      and a.job_id = p_job_id
      and (
        (p_sender_id = cp.profile_id and p_receiver_id = tp.profile_id)
        or
        (p_sender_id = tp.profile_id and p_receiver_id = cp.profile_id)
      )
  );
$;

revoke all on function public.can_send_application_message(uuid, uuid, uuid, uuid) from public;
grant execute on function public.can_send_application_message(uuid, uuid, uuid, uuid) to authenticated;

drop policy if exists messages_insert_participant on public.messages;
create policy messages_insert_participant
on public.messages
for insert
to authenticated
with check (
  public.can_send_application_message(
    application_id,
    job_id,
    sender_id,
    receiver_id
  )
);

-- The legacy broad insert policy would otherwise let any signed-in user
-- create arbitrary profile rows (including privileged roles).
drop policy if exists "Allow authenticated insert" on public.profiles;

-- Applications may only be created by the owning talent for an open job.
drop policy if exists applications_insert_talent on public.applications;
create policy applications_insert_talent
on public.applications
for insert
to authenticated
with check (
  talent_id in (
    select tp.id
    from public.talent_profiles tp
    join public.profiles p on p.id = tp.profile_id
    where p.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.jobs j
    where j.id = applications.job_id
      and j.status = 'open'
  )
);

-- 3) Notifications: ordinary users may read/update only their own notifications.
-- Client-side notification creation is restricted to admins; trusted server-side
-- service-role operations continue to bypass RLS.
drop policy if exists notifications_insert_any_authenticated on public.notifications;
drop policy if exists notifications_insert_admin_only on public.notifications;
create policy notifications_insert_admin_only
on public.notifications
for insert
to authenticated
with check (public.is_admin());

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own
on public.notifications
for update
to authenticated
using (
  user_id in (select p.id from public.profiles p where p.user_id = auth.uid())
)
with check (
  user_id in (select p.id from public.profiles p where p.user_id = auth.uid())
);

-- 4) Applications: prevent either party from changing application identity,
-- match score, or submission timestamp. Only the owning company/admin can
-- change status; only the applicant/admin can change the cover note.
create or replace function public.guard_application_updates()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_profile_id uuid;
  actor_is_admin boolean;
  actor_is_applicant boolean;
  actor_is_company boolean;
begin
  select p.id into actor_profile_id
  from public.profiles p
  where p.user_id = auth.uid();

  actor_is_admin := public.is_admin();

  if new.id is distinct from old.id
     or new.job_id is distinct from old.job_id
     or new.talent_id is distinct from old.talent_id
     or new.match_score is distinct from old.match_score
     or new.applied_at is distinct from old.applied_at then
    raise exception 'Application identity and matching fields cannot be changed.';
  end if;

  select exists (
    select 1
    from public.talent_profiles tp
    where tp.id = old.talent_id and tp.profile_id = actor_profile_id
  ) into actor_is_applicant;

  select exists (
    select 1
    from public.jobs j
    join public.company_profiles cp on cp.id = j.company_id
    where j.id = old.job_id and cp.profile_id = actor_profile_id
  ) into actor_is_company;

  if new.status is distinct from old.status
     and not actor_is_company
     and not actor_is_admin then
    raise exception 'Only the hiring company or an admin can change application status.';
  end if;

  if new.cover_note is distinct from old.cover_note
     and not actor_is_applicant
     and not actor_is_admin then
    raise exception 'Only the applicant or an admin can change the cover note.';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_application_updates on public.applications;
create trigger guard_application_updates
before update on public.applications
for each row
execute function public.guard_application_updates();

-- 5) Protect profile roles from self-escalation. The verified bootstrap
-- Super Admin email remains eligible for the existing admin bootstrap flow.
create or replace function public.guard_profile_role_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and not public.is_admin()
     and not exists (
       select 1
       from auth.users u
       where u.id = new.user_id
         and lower(u.email) = 'adann364@gmail.com'
         and u.email_confirmed_at is not null
     ) then
    raise exception 'Only Kulmi Hub administrators can change account roles.';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_profile_role_changes on public.profiles;
create trigger guard_profile_role_changes
before update of role on public.profiles
for each row
execute function public.guard_profile_role_changes();

commit;
