# Kulmi Hub

Somali-first AI talent marketplace — matches SMEs, startups, and NGOs with
verified professionals through a transparent, explainable AI match score.
Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and
**Supabase** (Postgres + Auth + Row Level Security).

**Tagline:** Hire Smarter, Work Faster, Grow Better.

## What's included

- Email/password auth, role selection (talent / company), and onboarding wizards
- Job posting with required skills, budget, engagement type (including remote), experience level
- **AI match score engine** (`lib/matching.ts`): a transparent 0–100 score blending
  skill overlap (50%, with Kulmi Certify-verified skills counted at full strength),
  experience-level fit (15%), location fit (15%), and rate compatibility (20%) —
  shown identically to both the talent and the hiring company
- **Kulmi Certify**: talent request a verification badge on any skill; admins
  review and approve/reject from the admin dashboard; an approved badge marks
  that skill (and the talent's overall profile) as verified everywhere it appears
- **Company Talent Pools**: companies save any applicant to a persistent pool,
  independent of the job they applied to, for future openings
- Applications: apply → shortlist → hire/reject, ranked by match score
- In-app messaging, opened once a candidate is shortlisted
- Talent, company, and admin dashboards
- Full Supabase schema with Row Level Security policies (`supabase/schema.sql`)

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** and run the contents of `supabase/schema.sql` once.
   This creates all tables, enums, indexes, and RLS policies — including
   `certify_requests` and `company_talent_pools`.
3. In **Authentication → Providers**, email/password is enabled by default.
   For local development, you can turn **Confirm email** off under
   **Authentication → Settings** so sign-up logs the user in immediately
   (the app handles both cases either way).
4. Copy your **Project URL** and **anon public key** from
   **Project Settings → API**.

## 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Install and run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## 4. Creating the first admin

The onboarding flow only offers "talent" or "company" — admin accounts are
created manually. After a user signs up, promote them from the Supabase
SQL Editor:

```sql
update profiles set role = 'admin' where email = 'you@example.com';
```

The admin dashboard (`/dashboard/admin`) is where Kulmi Certify requests get
reviewed — every talent-submitted verification request lands there.

## Deploying

This is a standard Next.js App Router project — it deploys as-is to
[Vercel](https://vercel.com) (recommended) or any Node host that supports
Next.js. Set the same two environment variables in your hosting provider's
dashboard.

```bash
npm run build
npm run start
```

## Project structure

```
app/
  (auth)/login, (auth)/signup      Auth pages
  onboarding/role|talent|company   Role selection + profile wizards
  jobs/                            Browse, post, and view job details
  dashboard/talent                 Applications, recommended jobs, Kulmi Certify requests
  dashboard/company                Job posts, applicant stats, link to talent pool
  dashboard/company/talent-pool    Saved candidates across all jobs
  dashboard/admin                  Platform stats + Kulmi Certify review queue
  messages/                        Inbox + per-application threads
  actions.ts                       All server actions (auth, jobs, applications, messaging, certify, pools)
components/                        Navbar, Footer, JobCard, MatchBadge, CertifyBadge
lib/
  matching.ts                      The AI match-score algorithm
  supabase/                        Browser, server, and middleware Supabase clients
  types.ts                         Shared TypeScript types
supabase/schema.sql                Full database schema + RLS policies
```

## Extending the matching algorithm

`lib/matching.ts` is intentionally a single pure function
(`calculateMatchScore`) with no framework dependencies, so it's easy to:

- Adjust the 50/15/15/20 weighting (skill / experience / location / rate)
- Change how much a Kulmi Certify badge boosts a skill's weight
- Add new signals (e.g. portfolio quality, response time)
- Move it into a Supabase Edge Function if you want match scores computed
  outside the Next.js server (the function has no Next.js-specific imports)

## Known simplifications (v1)

- Talent skills use a flat "intermediate" proficiency on entry — the
  onboarding form doesn't yet expose the beginner/advanced/expert picker,
  though the schema and matching engine support it. Kulmi Certify approval is
  the main way a skill gets full weight in the meantime.
- No file upload for resumes/logos yet — `resume_url` and `logo_url` accept
  a pasted URL. Wiring up Supabase Storage is a natural next step.
- No real-time updates on the messaging thread (polls on navigation, not a
  live subscription). Supabase Realtime can be added to `messages/[applicationId]`
  with a few lines using `supabase.channel(...)`.
- Notifications table exists in the schema but isn't yet surfaced in the UI —
  a natural place to announce Kulmi Certify approvals and pool saves.
- Talent pools currently use a single "General" pool per company; the schema
  already supports named pools (`pool_name`) if you want multiple lists.

# kulmi-hub
