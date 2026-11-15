import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobCard from "@/components/JobCard";
import { createClient } from "@/lib/supabase/server";
import { calculateMatchScore } from "@/lib/matching";
import type { Job, TalentProfile } from "@/lib/types";

type JobsSearchParams = {
  q?: string;
  skill?: string;
  location?: string;
  type?: string;
  experience?: string;
};

const engagementTypes = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "freelance", label: "Freelance" },
  { value: "contract", label: "Contract" },
  { value: "remote", label: "Remote" },
];

export default async function JobsPage({ searchParams }: { searchParams: JobsSearchParams }) {
  const supabase = createClient();

  let query = supabase
    .from("jobs")
    .select("*, company_profiles(*), job_skills(*)")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (searchParams.q?.trim()) query = query.ilike("title", "%" + searchParams.q.trim() + "%");
  if (searchParams.location?.trim()) query = query.ilike("location", "%" + searchParams.location.trim() + "%");
  if (searchParams.type) query = query.eq("engagement_type", searchParams.type);
  if (searchParams.experience?.trim()) query = query.ilike("experience_level", "%" + searchParams.experience.trim() + "%");

  const { data: jobsData, error } = await query;
  let jobs = (jobsData ?? []) as unknown as Job[];

  if (searchParams.skill?.trim()) {
    const needle = searchParams.skill.trim().toLowerCase();
    jobs = jobs.filter((job) => (job.job_skills ?? []).some((skill) => skill.skill_name.toLowerCase().includes(needle)));
  }

  const { data: { user } } = await supabase.auth.getUser();
  let matchScores: Record<string, number> = {};

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("id, role").eq("user_id", user.id).maybeSingle();
    if (profile?.role === "talent") {
      const { data: talent } = await supabase
        .from("talent_profiles")
        .select("*, profiles(*), talent_skills(*), talent_experience(*)")
        .eq("profile_id", profile.id)
        .maybeSingle();

      if (talent) {
        matchScores = Object.fromEntries(jobs.map((job) => [
          job.id,
          calculateMatchScore(job, talent as unknown as TalentProfile).score,
        ]));
      }
    }
  }

  const hasFilters = Boolean(searchParams.q || searchParams.skill || searchParams.location || searchParams.type || searchParams.experience);

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#14213d]">
      <Navbar />
      <main>
        <section className="bg-[#08245f] text-white">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-16">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#83d3d4]">Kulmi Talent · Opportunities</p>
            <div className="mt-4 max-w-3xl">
              <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">Find work that moves you forward.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
                Explore opportunities from businesses in the Kulmi Hub network. Find a role that matches your skills, experience, and goals.
              </p>
            </div>

            <form action="/jobs" className="mt-8 grid gap-3 rounded-2xl bg-white p-3 shadow-xl shadow-blue-950/20 md:grid-cols-[1.3fr_1fr_auto]">
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                <span aria-hidden="true" className="text-lg text-slate-400">⌕</span>
                <span className="min-w-0 flex-1">
                  <span className="sr-only">Job title or keyword</span>
                  <input name="q" defaultValue={searchParams.q} placeholder="Job title or keyword" className="w-full border-0 bg-transparent text-sm text-[#14213d] outline-none placeholder:text-slate-400 focus:ring-0" />
                </span>
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                <span aria-hidden="true" className="text-lg text-slate-400">⌖</span>
                <span className="min-w-0 flex-1">
                  <span className="sr-only">Location</span>
                  <input name="location" defaultValue={searchParams.location} placeholder="City or remote" className="w-full border-0 bg-transparent text-sm text-[#14213d] outline-none placeholder:text-slate-400 focus:ring-0" />
                </span>
              </label>
              <button type="submit" className="inline-flex items-center justify-center rounded-xl bg-[#008291] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#006d78]">
                Search jobs <span className="ml-2" aria-hidden="true">→</span>
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-blue-100">
              <span className="mr-1 font-semibold text-white">Explore skills:</span>
              {["Web development", "UI/UX design", "Digital marketing", "IT support"].map((skill) => (
                <Link key={skill} href={"/jobs?skill=" + encodeURIComponent(skill)} className="rounded-full border border-white/20 px-3 py-1.5 transition hover:border-[#83d3d4] hover:bg-white/10">{skill}</Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 md:py-12">
          <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside>
              <form action="/jobs" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold text-[#08245f]">Filter jobs</h2>
                  {hasFilters && <Link href="/jobs" className="text-xs font-semibold text-[#008291] hover:underline">Clear all</Link>}
                </div>
                <div className="mt-6 space-y-5">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Skill</span>
                    <input name="skill" defaultValue={searchParams.skill} placeholder="e.g. React, design" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#008291] focus:ring-2 focus:ring-[#008291]/10" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Work type</span>
                    <select name="type" defaultValue={searchParams.type ?? ""} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#008291] focus:ring-2 focus:ring-[#008291]/10">
                      <option value="">All work types</option>
                      {engagementTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Experience level</span>
                    <input name="experience" defaultValue={searchParams.experience} placeholder="e.g. Entry, Mid, Senior" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#008291] focus:ring-2 focus:ring-[#008291]/10" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Location</span>
                    <input name="location" defaultValue={searchParams.location} placeholder="e.g. Hargeisa, Remote" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#008291] focus:ring-2 focus:ring-[#008291]/10" />
                  </label>
                </div>
                <button type="submit" className="mt-6 w-full rounded-lg bg-[#04277c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#008291]">Apply filters</button>
              </form>

              <div className="mt-4 rounded-2xl border border-[#d7e9eb] bg-[#eef8f8] p-5">
                <p className="text-sm font-semibold text-[#075b66]">New to Kulmi Talent?</p>
                <p className="mt-2 text-xs leading-6 text-slate-600">Create a talent profile to show businesses your skills and experience.</p>
                <Link href="/signup?role=talent" className="mt-4 inline-flex text-sm font-semibold text-[#007987] hover:underline">Create your profile →</Link>
              </div>
            </aside>

            <div className="min-w-0">
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#008291]">Opportunities</p>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-[#08245f] sm:text-3xl">{hasFilters ? "Your search results" : "Latest jobs"}</h2>
                  <p className="mt-2 text-sm text-slate-500">{jobs.length} open {jobs.length === 1 ? "opportunity" : "opportunities"} available{searchParams.location ? " in " + searchParams.location : ""}.</p>
                </div>
                <p className="text-xs text-slate-400">Recently posted first</p>
              </div>

              {error ? (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">We could not load jobs right now. Please refresh and try again.</div>
              ) : jobs.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef8f8] text-2xl text-[#008291]">⌕</span>
                  <h3 className="mt-5 font-display text-xl font-semibold text-[#08245f]">No matching jobs yet</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Try changing your keywords or filters. New opportunities will appear here as businesses publish them.</p>
                  <Link href="/jobs" className="mt-5 inline-flex rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-[#08245f] transition hover:border-[#008291] hover:text-[#008291]">View all jobs</Link>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {jobs.map((job) => <JobCard key={job.id} job={job} matchScore={matchScores[job.id]} />)}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
