-- ============================================================
-- KULMI HUB — Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------
create type user_role as enum ('talent', 'company', 'admin');
create type engagement_type as enum ('full-time', 'part-time', 'freelance', 'contract', 'remote');
create type job_status as enum ('draft', 'open', 'closed');
create type application_status as enum ('applied', 'shortlisted', 'rejected', 'hired');
create type proficiency_level as enum ('beginner', 'intermediate', 'advanced', 'expert');
create type certify_status as enum ('pending', 'approved', 'rejected');

-- ------------------------------------------------------------
-- PROFILES  (1:1 with auth.users)
-- ------------------------------------------------------------
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  role user_role not null,
  full_name text not null,
  email text not null,
  avatar_url text,
  location text default 'Hargeisa, Somaliland',
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- TALENT
-- ------------------------------------------------------------
create table talent_profiles (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references profiles(id) on delete cascade unique,
  title text,                          -- e.g. "Frontend Developer"
  bio text,
  hourly_rate numeric(10,2),
  availability text default 'available', -- available | busy | not-looking
  portfolio_links text[],
  resume_url text,
  is_verified boolean not null default false, -- true once at least one Kulmi Certify badge is approved
  created_at timestamptz not null default now()
);

create table talent_skills (
  id uuid primary key default uuid_generate_v4(),
  talent_id uuid not null references talent_profiles(id) on delete cascade,
  skill_name text not null,
  proficiency_level proficiency_level not null default 'intermediate',
  verified_badge boolean not null default false, -- set true when a Kulmi Certify request for this skill is approved
  unique (talent_id, skill_name)
);

create table talent_experience (
  id uuid primary key default uuid_generate_v4(),
  talent_id uuid not null references talent_profiles(id) on delete cascade,
  company_name text not null,
  job_title text not null,
  start_date date,
  end_date date,
  description text
);

-- ------------------------------------------------------------
-- KULMI CERTIFY — skill verification requests, reviewed by admins
-- ------------------------------------------------------------
create table certify_requests (
  id uuid primary key default uuid_generate_v4(),
  talent_id uuid not null references talent_profiles(id) on delete cascade,
  skill_name text not null,
  status certify_status not null default 'pending',
  notes text,                     -- optional context from the talent
  reviewer_notes text,            -- optional admin feedback
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- ------------------------------------------------------------
-- COMPANY
-- ------------------------------------------------------------
create table company_profiles (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references profiles(id) on delete cascade unique,
  company_name text not null,
  logo_url text,
  industry text,
  company_size text,
  website text,
  location text default 'Hargeisa, Somaliland',
  description text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- COMPANY TALENT POOLS — companies save pre-vetted candidates
-- ------------------------------------------------------------
create table company_talent_pools (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references company_profiles(id) on delete cascade,
  talent_id uuid not null references talent_profiles(id) on delete cascade,
  pool_name text not null default 'General',
  added_at timestamptz not null default now(),
  unique (company_id, talent_id, pool_name)
);

-- ------------------------------------------------------------
-- JOBS
-- ------------------------------------------------------------
create table jobs (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references company_profiles(id) on delete cascade,
  title text not null,
  description text not null,
  budget numeric(10,2),
  engagement_type engagement_type not null default 'freelance',
  experience_level text default 'mid', -- junior | mid | senior
  location text default 'Hargeisa, Somaliland',
  status job_status not null default 'open',
  created_at timestamptz not null default now()
);

create table job_skills (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references jobs(id) on delete cascade,
  skill_name text not null,
  unique (job_id, skill_name)
);

-- ------------------------------------------------------------
-- APPLICATIONS
-- ------------------------------------------------------------
create table applications (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references jobs(id) on delete cascade,
  talent_id uuid not null references talent_profiles(id) on delete cascade,
  status application_status not null default 'applied',
  match_score integer not null default 0, -- 0-100, snapshotted at apply time
  cover_note text,
  applied_at timestamptz not null default now(),
  unique (job_id, talent_id)
);

-- ------------------------------------------------------------
-- MESSAGES  (threaded by application)
-- ------------------------------------------------------------
create table messages (
  id uuid primary key default uuid_generate_v4(),
  application_id uuid not null references applications(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  receiver_id uuid not null references profiles(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- NOTIFICATIONS
-- ------------------------------------------------------------
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  message text not null,
  read_status boolean not null default false,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- INDEXES
-- ------------------------------------------------------------
create index idx_talent_skills_talent on talent_skills(talent_id);
create index idx_job_skills_job on job_skills(job_id);
create index idx_applications_job on applications(job_id);
create index idx_applications_talent on applications(talent_id);
create index idx_messages_application on messages(application_id);
create index idx_jobs_status on jobs(status);
create index idx_certify_requests_talent on certify_requests(talent_id);
create index idx_certify_requests_status on certify_requests(status);
create index idx_talent_pools_company on company_talent_pools(company_id);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------------------
alter table profiles enable row level security;
alter table talent_profiles enable row level security;
alter table talent_skills enable row level security;
alter table talent_experience enable row level security;
alter table certify_requests enable row level security;
alter table company_talent_pools enable row level security;
alter table company_profiles enable row level security;
alter table jobs enable row level security;
alter table job_skills enable row level security;
alter table applications enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;

-- Helper: is the requesting user an admin?
create or replace function is_admin() returns boolean as $$
  select exists (
    select 1 from profiles where user_id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- PROFILES: a user can read/update their own profile; anyone signed in can read basic profile info; admins read all.
create policy "profiles_select_own_or_admin" on profiles
  for select using (auth.uid() = user_id or is_admin());
create policy "profiles_select_public" on profiles
  for select using (true); -- names/avatars are needed for messaging & applicant lists
create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = user_id);

-- TALENT PROFILES: owner full access; companies/public can read (needed to show applicants & browse talent)
create policy "talent_profiles_select_all" on talent_profiles for select using (true);
create policy "talent_profiles_owner_write" on talent_profiles
  for all using (profile_id in (select id from profiles where user_id = auth.uid()))
  with check (profile_id in (select id from profiles where user_id = auth.uid()));

create policy "talent_skills_select_all" on talent_skills for select using (true);
create policy "talent_skills_owner_write" on talent_skills
  for all using (talent_id in (
    select tp.id from talent_profiles tp join profiles p on tp.profile_id = p.id where p.user_id = auth.uid()
  ));

create policy "talent_experience_select_all" on talent_experience for select using (true);
create policy "talent_experience_owner_write" on talent_experience
  for all using (talent_id in (
    select tp.id from talent_profiles tp join profiles p on tp.profile_id = p.id where p.user_id = auth.uid()
  ));

-- CERTIFY REQUESTS: talent sees/creates their own; admins see and review all
create policy "certify_requests_select_own_or_admin" on certify_requests
  for select using (
    talent_id in (select tp.id from talent_profiles tp join profiles p on tp.profile_id = p.id where p.user_id = auth.uid())
    or is_admin()
  );
create policy "certify_requests_insert_own" on certify_requests
  for insert with check (
    talent_id in (select tp.id from talent_profiles tp join profiles p on tp.profile_id = p.id where p.user_id = auth.uid())
  );
create policy "certify_requests_update_admin" on certify_requests
  for update using (is_admin());

-- COMPANY PROFILES: public read, owner write
create policy "company_profiles_select_all" on company_profiles for select using (true);
create policy "company_profiles_owner_write" on company_profiles
  for all using (profile_id in (select id from profiles where user_id = auth.uid()))
  with check (profile_id in (select id from profiles where user_id = auth.uid()));

-- COMPANY TALENT POOLS: only the owning company can see/manage its pools
create policy "talent_pools_owner_all" on company_talent_pools
  for all using (company_id in (
    select cp.id from company_profiles cp join profiles p on cp.profile_id = p.id where p.user_id = auth.uid()
  ))
  with check (company_id in (
    select cp.id from company_profiles cp join profiles p on cp.profile_id = p.id where p.user_id = auth.uid()
  ));

-- JOBS: open jobs are public; company sees/edits its own (any status); admin sees all
create policy "jobs_select_open_or_owner" on jobs
  for select using (
    status = 'open'
    or company_id in (select cp.id from company_profiles cp join profiles p on cp.profile_id = p.id where p.user_id = auth.uid())
    or is_admin()
  );
create policy "jobs_owner_write" on jobs
  for all using (company_id in (
    select cp.id from company_profiles cp join profiles p on cp.profile_id = p.id where p.user_id = auth.uid()
  ))
  with check (company_id in (
    select cp.id from company_profiles cp join profiles p on cp.profile_id = p.id where p.user_id = auth.uid()
  ));

create policy "job_skills_select_all" on job_skills for select using (true);
create policy "job_skills_owner_write" on job_skills
  for all using (job_id in (
    select j.id from jobs j join company_profiles cp on j.company_id = cp.id join profiles p on cp.profile_id = p.id
    where p.user_id = auth.uid()
  ));

-- APPLICATIONS: talent sees own; company sees applications to its own jobs; admin sees all
create policy "applications_select" on applications
  for select using (
    talent_id in (select tp.id from talent_profiles tp join profiles p on tp.profile_id = p.id where p.user_id = auth.uid())
    or job_id in (
      select j.id from jobs j join company_profiles cp on j.company_id = cp.id join profiles p on cp.profile_id = p.id
      where p.user_id = auth.uid()
    )
    or is_admin()
  );
create policy "applications_insert_talent" on applications
  for insert with check (
    talent_id in (select tp.id from talent_profiles tp join profiles p on tp.profile_id = p.id where p.user_id = auth.uid())
  );
create policy "applications_update_company_or_talent" on applications
  for update using (
    talent_id in (select tp.id from talent_profiles tp join profiles p on tp.profile_id = p.id where p.user_id = auth.uid())
    or job_id in (
      select j.id from jobs j join company_profiles cp on j.company_id = cp.id join profiles p on cp.profile_id = p.id
      where p.user_id = auth.uid()
    )
  );

-- MESSAGES: only sender or receiver can read/write
create policy "messages_select_participant" on messages
  for select using (
    sender_id in (select id from profiles where user_id = auth.uid())
    or receiver_id in (select id from profiles where user_id = auth.uid())
  );
create policy "messages_insert_participant" on messages
  for insert with check (
    sender_id in (select id from profiles where user_id = auth.uid())
  );

-- NOTIFICATIONS: only owner
create policy "notifications_select_own" on notifications
  for select using (user_id in (select id from profiles where user_id = auth.uid()));
create policy "notifications_update_own" on notifications
  for update using (user_id in (select id from profiles where user_id = auth.uid()));
create policy "notifications_insert_any_authenticated" on notifications
  for insert with check (auth.role() = 'authenticated');
