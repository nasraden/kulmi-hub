import Link from "next/link";
import type { Job } from "@/lib/types";
import { formatBudget, timeAgo } from "@/lib/utils";
import MatchBadge from "./MatchBadge";

function BriefcaseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7M3 12h18M10 12v2h4v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export default function JobCard({ job, matchScore }: { job: Job; matchScore?: number }) {
  const companyName = job.company_profiles?.company_name ?? "Kulmi Hub company";
  const companyInitial = companyName.trim().charAt(0).toUpperCase() || "K";

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#a8d5d8] hover:shadow-lg sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#edf3ff] font-display text-lg font-bold text-[#04277c]">{companyInitial}</div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-500">{companyName}</p>
            <h3 className="mt-1 font-display text-lg font-semibold leading-snug text-[#08245f] transition-colors group-hover:text-[#008291] sm:text-xl">
              <Link href={"/jobs/" + job.id} className="focus-visible:outline-none focus-visible:underline">{job.title}</Link>
            </h3>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5"><PinIcon />{job.location || "Location not specified"}</span>
              <span className="inline-flex items-center gap-1.5"><BriefcaseIcon />{job.engagement_type}</span>
              <span>{timeAgo(job.created_at)}</span>
            </div>
          </div>
        </div>
        {typeof matchScore === "number" && <div className="shrink-0 self-start"><MatchBadge score={matchScore} /></div>}
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Budget / compensation</p>
          <p className="mt-1 text-base font-bold text-[#08245f]">{formatBudget(job.budget, job.engagement_type)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(job.job_skills ?? []).slice(0, 5).map((skill) => (
              <span key={skill.id} className="rounded-full bg-[#f1f5f9] px-3 py-1.5 text-xs font-medium text-slate-600">{skill.skill_name}</span>
            ))}
            {(job.job_skills ?? []).length > 5 && <span className="rounded-full bg-[#f1f5f9] px-3 py-1.5 text-xs font-medium text-slate-500">+{(job.job_skills ?? []).length - 5} more</span>}
          </div>
        </div>
        <Link href={"/jobs/" + job.id} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#04277c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#008291]">
          View job <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
