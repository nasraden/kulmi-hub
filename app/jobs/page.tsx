import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobCard from "@/components/JobCard";
import { createClient } from "@/lib/supabase/server";
import { calculateMatchScore } from "@/lib/matching";
import type { Job, TalentProfile } from "@/lib/types";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: { skill?: string; location?: string };
}) {
  const supabase = createClient();

  let query = supabase
    .from("jobs")
    .select("*, company_profiles(*), job_skills(*)")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (searchParams.location) {
    query = query.ilike("location", `%${searchParams.location}%`);
  }

  const { data: jobsData } = await query;
  let jobs = (jobsData ?? []) as unknown as Job[];

  if (searchParams.skill) {
    const needle = searchParams.skill.toLowerCase();
    jobs = jobs.filter((j) =>
      (j.job_skills ?? []).some((s) => s.skill_name.toLowerCase().includes(needle))
    );
  }

  // If a logged-in talent is browsing, compute a personal match score per job.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let matchScores: Record<string, number> = {};
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile?.role === "talent") {
      const { data: talent } = await supabase
        .from("talent_profiles")
        .select("*, profiles(*), talent_skills(*), talent_experience(*)")
        .eq("profile_id", profile.id)
        .maybeSingle();

      if (talent) {
        matchScores = Object.fromEntries(
          jobs.map((job) => [
            job.id,
            calculateMatchScore(job, talent as unknown as TalentProfile).score,
          ])
        );
      }
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-14">
        <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">
          Open roles in the Kulmi Hub network
        </h1>
        <p className="mt-2 text-muted">
          {jobs.length} open {jobs.length === 1 ? "role" : "roles"}
          {searchParams.location ? ` in ${searchParams.location}` : ""}.
        </p>

        <form className="mt-6 flex flex-wrap gap-3" action="/jobs">
          <input
            name="skill"
            defaultValue={searchParams.skill}
            placeholder="Filter by skill, e.g. React"
            className="field-input max-w-xs"
          />
          <input
            name="location"
            defaultValue={searchParams.location}
            placeholder="Filter by location"
            className="field-input max-w-xs"
          />
          <button type="submit" className="btn-secondary">
            Filter
          </button>
        </form>

        <div className="mt-8 space-y-4">
          {jobs.length === 0 && (
            <p className="card p-8 text-center text-muted">
              No open roles match those filters yet. Check back soon.
            </p>
          )}
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} matchScore={matchScores[job.id]} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
