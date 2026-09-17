import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MatchBadge from "@/components/MatchBadge";
import CertifyBadge from "@/components/CertifyBadge";
import { createClient } from "@/lib/supabase/server";
import { calculateMatchScore } from "@/lib/matching";
import { applyToJob, closeJob, reopenJob, updateApplicationStatus, saveToTalentPool } from "@/app/actions";
import { formatBudget, timeAgo, initials } from "@/lib/utils";
import type { Application, Job, TalentProfile } from "@/lib/types";

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { applied?: string; error?: string };
}) {
  const supabase = createClient();

  const { data: jobData } = await supabase
    .from("jobs")
    .select("*, company_profiles(*), job_skills(*)")
    .eq("id", params.id)
    .maybeSingle();

  if (!jobData) notFound();
  const job = jobData as unknown as Job;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let viewerRole: "talent" | "company" | "admin" | "guest" = "guest";
  let profileId: string | null = null;
  let isOwner = false;
  let talentProfile: TalentProfile | null = null;
  let existingApplication: Application | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile) {
      profileId = profile.id;
      viewerRole = profile.role;

      if (profile.role === "company") {
        const { data: company } = await supabase
          .from("company_profiles")
          .select("id")
          .eq("profile_id", profile.id)
          .maybeSingle();
        isOwner = company?.id === job.company_id;
      }

      if (profile.role === "talent") {
        const { data: talent } = await supabase
          .from("talent_profiles")
          .select("*, profiles(*), talent_skills(*), talent_experience(*)")
          .eq("profile_id", profile.id)
          .maybeSingle();
        talentProfile = talent as unknown as TalentProfile;

        if (talentProfile) {
          const { data: application } = await supabase
            .from("applications")
            .select("*")
            .eq("job_id", job.id)
            .eq("talent_id", talentProfile.id)
            .maybeSingle();
          existingApplication = application as unknown as Application;
        }
      }
    }
  }

  let applicants: (Application & { talent_profiles: TalentProfile })[] = [];
  let poolTalentIds = new Set<string>();
  if (isOwner) {
    const { data } = await supabase
      .from("applications")
      .select("*, talent_profiles(*, profiles(*), talent_skills(*), talent_experience(*))")
      .eq("job_id", job.id)
      .order("match_score", { ascending: false });
    applicants = (data ?? []) as unknown as (Application & { talent_profiles: TalentProfile })[];

    const { data: company } = await supabase
      .from("company_profiles")
      .select("id")
      .eq("id", job.company_id)
      .maybeSingle();
    if (company) {
      const { data: poolData } = await supabase
        .from("company_talent_pools")
        .select("talent_id")
        .eq("company_id", company.id);
      poolTalentIds = new Set((poolData ?? []).map((p: any) => p.talent_id));
    }
  }

  const previewScore =
    viewerRole === "talent" && talentProfile ? calculateMatchScore(job, talentProfile) : null;

  const applyAction = applyToJob.bind(null, job.id);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-14">
        {searchParams.applied === "1" && (
          <div className="mb-6 rounded-sm bg-match-light px-4 py-3 text-sm font-medium text-match">
            Application sent. The company will see your match score and can message you if shortlisted.
          </div>
        )}
        {searchParams.error && (
          <div className="mb-6 rounded-sm bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {searchParams.error}
          </div>
        )}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted">
              {job.company_profiles?.company_name}
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-ink md:text-3xl">
              {job.title}
            </h1>
          </div>
          {previewScore && <MatchBadge score={previewScore.score} size="lg" />}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
          <span className="font-medium text-ink">{formatBudget(job.budget, job.engagement_type)}</span>
          <span className="capitalize">{job.engagement_type}</span>
          <span>{job.location}</span>
          <span className="capitalize">{job.experience_level} level</span>
          <span>Posted {timeAgo(job.created_at)}</span>
          {job.status !== "open" && (
            <span className="font-medium uppercase text-gold">{job.status}</span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(job.job_skills ?? []).map((s) => (
            <span key={s.id} className="skill-chip">
              {s.skill_name}
            </span>
          ))}
        </div>

        <p className="mt-8 max-w-prose whitespace-pre-line leading-relaxed text-ink/90">
          {job.description}
        </p>

        {/* TALENT: match breakdown + apply */}
        {viewerRole === "talent" && talentProfile && previewScore && (
          <div className="mt-10 card p-6">
            <h2 className="font-display text-lg font-semibold text-ink">Your match breakdown</h2>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted">Skills</p>
                <p className="mt-1 text-lg font-semibold text-ink">{previewScore.skillScore}%</p>
              </div>
              <div>
                <p className="text-muted">Experience</p>
                <p className="mt-1 text-lg font-semibold text-ink">{previewScore.experienceScore}%</p>
              </div>
              <div>
                <p className="text-muted">Location</p>
                <p className="mt-1 text-lg font-semibold text-ink">{previewScore.locationScore}%</p>
              </div>
            </div>
            {previewScore.missingSkills.length > 0 && (
              <p className="mt-4 text-sm text-muted">
                Skills this role wants that aren't on your profile yet:{" "}
                <span className="text-ink">{previewScore.missingSkills.join(", ")}</span>
              </p>
            )}

            {existingApplication ? (
              <p className="mt-6 rounded-sm bg-teal-light px-4 py-3 text-sm text-teal-dark">
                You applied {timeAgo(existingApplication.applied_at)} — status:{" "}
                <span className="font-semibold capitalize">{existingApplication.status}</span>
              </p>
            ) : job.status === "open" ? (
              <form action={applyAction} className="mt-6 space-y-3">
                <label className="field-label" htmlFor="coverNote">
                  Note to the company (optional)
                </label>
                <textarea
                  id="coverNote"
                  name="coverNote"
                  rows={3}
                  className="field-input"
                  placeholder="Anything you want them to know before they review your profile."
                />
                <button type="submit" className="btn-primary">
                  Apply to this job
                </button>
              </form>
            ) : (
              <p className="mt-6 text-sm text-muted">This role is no longer accepting applications.</p>
            )}
          </div>
        )}

        {viewerRole === "guest" && (
          <div className="mt-10 card p-6 text-center">
            <p className="text-muted">Log in as talent to see your match score and apply.</p>
            <Link href={`/login?next=/jobs/${job.id}`} className="btn-primary mt-4 inline-flex">
              Log in to apply
            </Link>
          </div>
        )}

        {/* COMPANY OWNER: manage job + ranked applicants */}
        {isOwner && (
          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">
                Applicants ({applicants.length})
              </h2>
              <form action={job.status === "open" ? closeJob.bind(null, job.id) : reopenJob.bind(null, job.id)}>
                <button type="submit" className="btn-secondary text-sm">
                  {job.status === "open" ? "Close job" : "Reopen job"}
                </button>
              </form>
            </div>

            <div className="mt-4 space-y-4">
              {applicants.length === 0 && (
                <p className="card p-6 text-center text-muted">No applications yet.</p>
              )}
              {applicants.map((app) => (
                <div key={app.id} className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/5 text-sm font-semibold text-ink">
                        {initials(app.talent_profiles.profiles?.full_name ?? "?")}
                      </div>
                      <div>
                        <p className="flex items-center gap-1.5 font-medium text-ink">
                          {app.talent_profiles.profiles?.full_name}
                          {app.talent_profiles.is_verified && <CertifyBadge size="sm" />}
                        </p>
                        <p className="text-sm text-muted">{app.talent_profiles.title}</p>
                      </div>
                    </div>
                    <MatchBadge score={app.match_score} />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(app.talent_profiles.talent_skills ?? []).map((s) => (
                      <span
                        key={s.id}
                        className={
                          s.verified_badge
                            ? "inline-flex items-center gap-1 rounded-sm bg-ink px-2.5 py-1 text-xs font-medium text-paper"
                            : "skill-chip"
                        }
                      >
                        {s.verified_badge && (
                          <svg viewBox="0 0 20 20" fill="none" className="h-2.5 w-2.5">
                            <path
                              d="M5.5 10.2l2.8 2.8 6.2-6.2"
                              stroke="#0EA5B7"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                        {s.skill_name}
                      </span>
                    ))}
                  </div>

                  {app.cover_note && (
                    <p className="mt-3 text-sm italic text-muted">"{app.cover_note}"</p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs font-medium capitalize text-ink">
                      {app.status}
                    </span>
                    {poolTalentIds.has(app.talent_profiles.id) ? (
                      <span className="text-sm font-medium text-muted">Saved to pool</span>
                    ) : (
                      <form action={saveToTalentPool.bind(null, app.talent_profiles.id, job.id)}>
                        <button className="text-sm font-medium text-teal-dark hover:underline">
                          Save to talent pool
                        </button>
                      </form>
                    )}
                    {app.status !== "hired" && app.status !== "rejected" && (
                      <>
                        {app.status !== "shortlisted" && (
                          <form action={updateApplicationStatus.bind(null, app.id, "shortlisted", job.id)}>
                            <button className="text-sm font-medium text-teal-dark hover:underline">
                              Shortlist
                            </button>
                          </form>
                        )}
                        <form action={updateApplicationStatus.bind(null, app.id, "hired", job.id)}>
                          <button className="text-sm font-medium text-match hover:underline">Hire</button>
                        </form>
                        <form action={updateApplicationStatus.bind(null, app.id, "rejected", job.id)}>
                          <button className="text-sm font-medium text-muted hover:text-ink">
                            Reject
                          </button>
                        </form>
                      </>
                    )}
                    {app.status === "shortlisted" && (
                      <Link
                        href={`/messages/${app.id}`}
                        className="text-sm font-medium text-teal-dark hover:underline"
                      >
                        Message
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
