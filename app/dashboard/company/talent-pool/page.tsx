import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CertifyBadge from "@/components/CertifyBadge";
import { createClient } from "@/lib/supabase/server";
import { removeFromTalentPool } from "@/app/actions";
import { timeAgo, initials } from "@/lib/utils";
import type { CompanyTalentPool } from "@/lib/types";

export default async function TalentPoolPage() {
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
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();
  if (!company) redirect("/onboarding/company");

  const { data: poolData } = await supabase
    .from("company_talent_pools")
    .select("*, talent_profiles(*, profiles(*), talent_skills(*))")
    .eq("company_id", company.id)
    .order("added_at", { ascending: false });
  const pool = (poolData ?? []) as unknown as CompanyTalentPool[];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="font-display text-2xl font-semibold text-ink">Company talent pool</h1>
        <p className="mt-2 text-muted">
          Candidates you've saved for later — from any job, not just the one you found them on.
        </p>

        <div className="mt-8 space-y-4">
          {pool.length === 0 && (
            <p className="card p-8 text-center text-muted">
              No saved talent yet. Save applicants from a job's applicant list to build your pool.
            </p>
          )}
          {pool.map((entry) => {
            const talent = entry.talent_profiles;
            if (!talent) return null;
            return (
              <div key={entry.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/5 text-sm font-semibold text-ink">
                      {initials(talent.profiles?.full_name ?? "?")}
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 font-medium text-ink">
                        {talent.profiles?.full_name}
                        {talent.is_verified && <CertifyBadge size="sm" />}
                      </p>
                      <p className="text-sm text-muted">{talent.title}</p>
                    </div>
                  </div>
                  <form action={removeFromTalentPool.bind(null, entry.id)}>
                    <button className="text-sm font-medium text-muted hover:text-ink">
                      Remove
                    </button>
                  </form>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(talent.talent_skills ?? []).map((s) => (
                    <span key={s.id} className="skill-chip">
                      {s.skill_name}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted">Saved {timeAgo(entry.added_at)}</p>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}
