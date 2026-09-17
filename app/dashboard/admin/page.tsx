import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import { reviewCertifyRequest } from "@/app/actions";
import { timeAgo, initials } from "@/lib/utils";
import type { CertifyRequest } from "@/lib/types";

export default async function AdminDashboardPage() {
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
  if (profile.role !== "admin") redirect(`/dashboard/${profile.role}`);

  const [
    { count: talentCount },
    { count: companyCount },
    { count: jobCount },
    { count: appCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "talent"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "company"),
    supabase.from("jobs").select("*", { count: "exact", head: true }),
    supabase.from("applications").select("*", { count: "exact", head: true }),
  ]);

  const { data: pendingCertifyData } = await supabase
    .from("certify_requests")
    .select("*, talent_profiles(*, profiles(*))")
    .eq("status", "pending")
    .order("requested_at", { ascending: true });
  const pendingCertify = (pendingCertifyData ?? []) as unknown as CertifyRequest[];

  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: recentJobs } = await supabase
    .from("jobs")
    .select("*, company_profiles(company_name)")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="font-display text-2xl font-semibold text-ink">Admin overview</h1>
        <p className="mt-1 text-sm text-muted">
          Target: 5,000 freelancers and 300 companies across the network.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-4">
          {[
            ["Talent", talentCount],
            ["Companies", companyCount],
            ["Jobs posted", jobCount],
            ["Applications", appCount],
          ].map(([label, value]) => (
            <div key={label as string} className="card p-5">
              <p className="text-sm text-muted">{label}</p>
              <p className="mt-1 font-display text-2xl font-semibold text-ink">{value ?? 0}</p>
            </div>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="font-display text-lg font-semibold text-ink">
            Kulmi Certify — pending reviews ({pendingCertify.length})
          </h2>
          <p className="mt-1 text-sm text-muted">
            Approving a request marks that skill (and the talent's overall profile) verified.
          </p>
          <div className="mt-4 space-y-3">
            {pendingCertify.length === 0 && (
              <p className="card p-6 text-center text-muted">No pending requests.</p>
            )}
            {pendingCertify.map((req) => (
              <div key={req.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-ink">
                    {req.talent_profiles?.profiles?.full_name}
                    <span className="ml-2 font-normal text-muted">— {req.skill_name}</span>
                  </p>
                  {req.notes && <p className="mt-1 text-sm text-muted">"{req.notes}"</p>}
                  <p className="mt-1 text-xs text-muted">requested {timeAgo(req.requested_at)}</p>
                </div>
                <div className="flex gap-3">
                  <form action={reviewCertifyRequest.bind(null, req.id, "approved")}>
                    <button className="text-sm font-medium text-match hover:underline">
                      Approve
                    </button>
                  </form>
                  <form action={reviewCertifyRequest.bind(null, req.id, "rejected")}>
                    <button className="text-sm font-medium text-muted hover:text-ink">
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-lg font-semibold text-ink">Newest users</h2>
          <div className="card mt-4 divide-y divide-line">
            {(recentUsers ?? []).map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/5 text-xs font-semibold text-ink">
                    {initials(u.full_name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{u.full_name}</p>
                    <p className="text-xs text-muted">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted">
                  <span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs font-medium capitalize text-ink">
                    {u.role}
                  </span>
                  <span>{timeAgo(u.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-lg font-semibold text-ink">Newest jobs</h2>
          <div className="card mt-4 divide-y divide-line">
            {(recentJobs ?? []).map((j) => (
              <div key={j.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium text-ink">{j.title}</p>
                  <p className="text-xs text-muted">{j.company_profiles?.company_name}</p>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted">
                  <span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs font-medium capitalize text-ink">
                    {j.status}
                  </span>
                  <span>{timeAgo(j.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
