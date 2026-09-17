import Link from "next/link";
import type { Job } from "@/lib/types";
import { formatBudget, timeAgo } from "@/lib/utils";
import MatchBadge from "./MatchBadge";

export default function JobCard({ job, matchScore }: { job: Job; matchScore?: number }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="card block p-6 transition-colors hover:border-teal"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted">
            {job.company_profiles?.company_name ?? "Kulmi Hub company"}
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold text-ink">{job.title}</h3>
        </div>
        {typeof matchScore === "number" && <MatchBadge score={matchScore} />}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {(job.job_skills ?? []).slice(0, 5).map((s) => (
          <span key={s.id} className="skill-chip">
            {s.skill_name}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
        <span className="font-medium text-ink">{formatBudget(job.budget, job.engagement_type)}</span>
        <span className="capitalize">{job.engagement_type}</span>
        <span>{job.location}</span>
        <span>{timeAgo(job.created_at)}</span>
      </div>
    </Link>
  );
}
