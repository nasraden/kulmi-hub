import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CompanyVerifiedBadge from "@/components/CompanyVerifiedBadge";
import { createClient } from "@/lib/supabase/server";

export default async function CompanyPublicProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: company } = await supabase
    .from("company_profiles")
    .select("id, company_name, logo_url, industry, company_size, website, location, description, verification_status")
    .eq("id", params.id)
    .maybeSingle();

  if (!company) notFound();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, location, engagement_type, created_at")
    .eq("company_id", company.id)
    .eq("status", "open")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link href="/jobs" className="text-sm font-medium text-teal-dark hover:underline">← Browse jobs</Link>
        <section className="card mt-6 p-6 md:p-8">
          <div className="flex flex-wrap items-start gap-5">
            {company.logo_url ? (
              <img src={company.logo_url} alt={`${company.company_name} logo`} className="h-20 w-20 rounded-xl border border-line object-contain p-2" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-ink/5 text-2xl font-semibold text-ink">
                {company.company_name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-semibold text-ink">{company.company_name}</h1>
                {company.verification_status === "verified" && <CompanyVerifiedBadge />}
              </div>
              <p className="mt-2 text-sm text-muted">{[company.industry, company.location, company.company_size].filter(Boolean).join(" · ")}</p>
              {company.website && (
                <a href={company.website} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm font-medium text-teal-dark hover:underline">
                  Visit website
                </a>
              )}
            </div>
          </div>
          {company.description && <p className="mt-6 whitespace-pre-line leading-relaxed text-ink/85">{company.description}</p>}
        </section>
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-ink">Open positions</h2>
          <div className="mt-4 space-y-3">
            {(jobs ?? []).length === 0 && <p className="card p-6 text-sm text-muted">This company has no open positions right now.</p>}
            {(jobs ?? []).map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="card flex flex-wrap items-center justify-between gap-3 p-4 hover:border-teal">
                <div>
                  <p className="font-medium text-ink">{job.title}</p>
                  <p className="mt-1 text-sm text-muted">{job.location} · {job.engagement_type}</p>
                </div>
                <span className="text-sm font-medium text-teal-dark">View job →</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
