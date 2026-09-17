import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobCard from "@/components/JobCard";
import MatchBadge from "@/components/MatchBadge";
import CertifyBadge from "@/components/CertifyBadge";
import { createClient } from "@/lib/supabase/server";
import { calculateMatchScore } from "@/lib/matching";





import { timeAgo } from "@/lib/utils";
import type { Application, CertifyRequest, Job, TalentProfile } from "@/lib/types";

export default async function TalentDashboardPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) redirect("/onboarding/role");
  if (profile.role !== "talent") redirect(`/dashboard/${profile.role}`);

  const { data: talentData } = await supabase
    .from("talent_profiles")
    .select("*, profiles(*), talent_skills(*), talent_experience(*)")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!talentData) redirect("/onboarding/talent");
  const talent = talentData as unknown as TalentProfile;

  const { data: applicationsData } = await supabase
    .from("applications")
    .select("*, jobs(*, company_profiles(*))")
    .eq("talent_id", talent.id)
    .order("applied_at", { ascending: false });
  const applications = (applicationsData ?? []) as unknown as Application[];

  const appliedJobIds = new Set(applications.map((a) => a.job_id));

  const { data: openJobsData } = await supabase
    .from("jobs")
    .select("*, company_profiles(*), job_skills(*)")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(20);

  const recommended = ((openJobsData ?? []) as unknown as Job[])
    .filter((j) => !appliedJobIds.has(j.id))
    .map((job) => ({ job, score: calculateMatchScore(job, talent).score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const { data: certifyRequestsData } = await supabase
    .from("certify_requests")
    .select("*")
    .eq("talent_id", talent.id)
    .order("requested_at", { ascending: false });
  const certifyRequests = (certifyRequestsData ?? []) as unknown as CertifyRequest[];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Welcome back</p>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-semibold text-ink">
                {profile.full_name}
              </h1>
              {talent.is_verified && <CertifyBadge />}
            </div>
          </div>
          <Link href="/onboarding/talent" className="btn-secondary text-sm">
            Edit profile
          </Link>
        </div>

        {searchParams.error && (
          <div className="mt-6 rounded-sm bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {searchParams.error}
          </div>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="card p-5">
            <p className="text-sm text-muted">Applications sent</p>
            <p className="mt-1 font-display text-2xl font-semibold text-ink">
              {applications.length}
            </p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-muted">Shortlisted</p>
            <p className="mt-1 font-display text-2xl font-semibold text-ink">
              {applications.filter((a) => a.status === "shortlisted").length}
            </p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-muted">Hired</p>
            <p className="mt-1 font-display text-2xl font-semibold text-ink">
              {applications.filter((a) => a.status === "hired").length}
            </p>
          </div>
        </div>


        <section className="mt-12">
          <h2 className="font-display text-lg font-semibold text-ink">Your applications</h2>
          <div className="mt-4 space-y-3">
            {applications.length === 0 && (
              <p className="card p-6 text-center text-muted">
                You haven't applied to anything yet — browse open jobs below.
              </p>
            )}
            {applications.map((app) => (
              <Link
                key={app.id}
                href={`/jobs/${app.job_id}`}
                className="card flex flex-wrap items-center justify-between gap-3 p-4 hover:border-teal"
              >
                <div>
                  <p className="font-medium text-ink">{app.jobs?.title}</p>
                  <p className="text-sm text-muted">
                    {app.jobs?.company_profiles?.company_name} · applied {timeAgo(app.applied_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs font-medium capitalize text-ink">
                    {app.status}
                  </span>
                  <MatchBadge score={app.match_score} size="sm" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-lg font-semibold text-ink">Recommended for you</h2>
          <div className="mt-4 space-y-4">
            {recommended.length === 0 && (
              <p className="card p-6 text-center text-muted">
                No open roles match your skills right now.
              </p>
            )}
            {recommended.map(({ job, score }) => (
              <JobCard key={job.id} job={job} matchScore={score} />
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
