import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MatchBadge from "@/components/MatchBadge";
import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/utils";
import type { Job } from "@/lib/types";

export default async function CompanyDashboardPage() {
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
  if (profile.role !== "company") redirect(`/dashboard/${profile.role}`);

  const { data: company } = await supabase
    .from("company_profiles")
    .select("*")
    .eq("profile_id", profile.id)
    .maybeSingle();
  if (!company) redirect("/onboarding/company");

  const { data: jobsData } = await supabase
    .from("jobs")
    .select("*, job_skills(*), applications(id, status, match_score)")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });
  const jobs = (jobsData ?? []) as unknown as (Job & {
    applications: { id: string; status: string; match_score: number }[];
  })[];

  const totalApplicants = jobs.reduce((sum, j) => sum + j.applications.length, 0);
  const openJobs = jobs.filter((j) => j.status === "open");

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted">{company.company_name}</p>
            <h1 className="font-display text-2xl font-semibold text-ink">Company dashboard</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/company/talent-pool" className="btn-secondary text-sm">
              Talent pool
            </Link>
            <Link href="/onboarding/company" className="btn-secondary text-sm">
              Edit company
            </Link>
            <Link href="/jobs/new" className="btn-primary text-sm">
              Post a job
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="card p-5">
            <p className="text-sm text-muted">Open jobs</p>
            <p className="mt-1 font-display text-2xl font-semibold text-ink">{openJobs.length}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-muted">Total applicants</p>
            <p className="mt-1 font-display text-2xl font-semibold text-ink">{totalApplicants}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-muted">Hired via Kulmi Hub</p>
            <p className="mt-1 font-display text-2xl font-semibold text-ink">
              {jobs.reduce(
                (sum, j) => sum + j.applications.filter((a) => a.status === "hired").length,
                0
              )}
            </p>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="font-display text-lg font-semibold text-ink">Your job posts</h2>
          <div className="mt-4 space-y-3">
            {jobs.length === 0 && (
              <p className="card p-8 text-center text-muted">
                You haven't posted a job yet.{" "}
                <Link href="/jobs/new" className="font-medium text-teal-dark hover:underline">
                  Post your first one
                </Link>
                .
              </p>
            )}
            {jobs.map((job) => {
              const best = job.applications.reduce(
                (max, a) => Math.max(max, a.match_score),
                0
              );
              return (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="card flex flex-wrap items-center justify-between gap-3 p-4 hover:border-teal"
                >
                  <div>
                    <p className="font-medium text-ink">{job.title}</p>
                    <p className="text-sm text-muted">
                      {job.applications.length} applicants · posted {timeAgo(job.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                        job.status === "open" ? "bg-match-light text-match" : "bg-ink/5 text-muted"
                      }`}
                    >
                      {job.status}
                    </span>
                    {job.applications.length > 0 && <MatchBadge score={best} size="sm" />}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
