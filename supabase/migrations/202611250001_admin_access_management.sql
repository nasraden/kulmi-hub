-- Secure multi-admin management. The bootstrap identity is the verified email configured below.
create table if not exists public.admin_members (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  role text not null check (role in ('super_admin','admin')),
  previous_role public.user_role,
  created_at timestamptz not null default now()
);
alter table public.admin_members enable row level security;
drop policy if exists admin_members_read_admins on public.admin_members;
create policy admin_members_read_admins on public.admin_members for select using (public.is_admin());

-- Prevent users from assigning themselves the admin role through profile insert/update.
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert
with check (auth.uid() = user_id and role in ('talent','company'));

create or replace function public.guard_profile_role_changes()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.role is distinct from old.role
     and not public.is_admin()
     and lower(new.email) <> 'adann364@gmail.com' then
    raise exception 'Only Kulmi Hub administrators can change account roles.';
  end if;
  return new;
end;
$$;
drop trigger if exists guard_profile_role_changes on public.profiles;
create trigger guard_profile_role_changes before update of role on public.profiles
for each row execute function public.guard_profile_role_changes();

create or replace function public.bootstrap_kulmi_super_admin()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if lower(new.email) = 'adann364@gmail.com' then
    insert into public.admin_members(profile_id,role,previous_role)
    values(new.id,'super_admin',null)
    on conflict(profile_id) do update set role='super_admin',previous_role=null;
    update public.profiles set role='admin' where id=new.id;
  end if;
  return new;
end;
$$;
drop trigger if exists bootstrap_kulmi_super_admin_on_profile on public.profiles;
create trigger bootstrap_kulmi_super_admin_on_profile after insert on public.profiles
for each row execute function public.bootstrap_kulmi_super_admin();

insert into public.admin_members(profile_id,role,previous_role)
select id,'super_admin',null from public.profiles where lower(email)='adann364@gmail.com'
on conflict(profile_id) do update set role='super_admin',previous_role=null;
update public.profiles set role='admin' where lower(email)='adann364@gmail.com';

create or replace function public.manage_admin_access(target_email text, grant_access boolean)
returns void language plpgsql security definer set search_path=public as $$
declare
  actor_id uuid;
  actor_email text;
  target public.profiles%rowtype;
begin
  select id into actor_id from public.profiles where user_id=auth.uid() and role='admin';
  select lower(email) into actor_email from auth.users where id=auth.uid();
  if not exists(select 1 from public.admin_members where profile_id=actor_id and role='super_admin')
     and coalesce(actor_email,'') <> 'adann364@gmail.com' then
    raise exception 'Only the Super Admin can manage admin access.';
  end if;
  select * into target from public.profiles where lower(email)=lower(trim(target_email)) limit 1;
  if target.id is null then raise exception 'No registered account found for that email.'; end if;
  if lower(target.email)='adann364@gmail.com' then raise exception 'The Super Admin cannot be changed here.'; end if;
  if grant_access then
    insert into public.admin_members(profile_id,role,previous_role)
    values(target.id,'admin',target.role) on conflict(profile_id) do nothing;
    update public.profiles set role='admin' where id=target.id;
  else
    if exists(select 1 from public.admin_members where profile_id=target.id and role='super_admin') then
      raise exception 'The Super Admin cannot be removed.';
    end if;
    update public.profiles p set role=coalesce(am.previous_role,'talent'::public.user_role)
    from public.admin_members am where am.profile_id=target.id and p.id=target.id and am.role='admin';
    delete from public.admin_members where profile_id=target.id and role='admin';
  end if;
end;
$$;
revoke all on function public.manage_admin_access(text,boolean) from public;
grant execute on function public.manage_admin_access(text,boolean) to authenticated;
