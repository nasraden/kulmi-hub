import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

export default async function MessagesInboxPage() {
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

  let threads: {
    id: string;
    jobTitle: string;
    counterpartName: string;
    status: string;
  }[] = [];

  if (profile.role === "talent") {
    const { data: talent } = await supabase
      .from("talent_profiles")
      .select("id")
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (talent) {
      const { data } = await supabase
        .from("applications")
        .select("id, status, jobs(title, company_profiles(company_name))")
        .eq("talent_id", talent.id)
        .in("status", ["shortlisted", "hired"]);

      threads = (data ?? []).map((a: any) => ({
        id: a.id,
        jobTitle: a.jobs?.title ?? "Job",
        counterpartName: a.jobs?.company_profiles?.company_name ?? "Company",
        status: a.status,
      }));
    }
  } else if (profile.role === "company") {
    const { data: company } = await supabase
      .from("company_profiles")
      .select("id")
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (company) {
      const { data } = await supabase
        .from("applications")
        .select("id, status, jobs!inner(title, company_id), talent_profiles(profiles(full_name))")
        .eq("jobs.company_id", company.id)
        .in("status", ["shortlisted", "hired"]);

      threads = (data ?? []).map((a: any) => ({
        id: a.id,
        jobTitle: a.jobs?.title ?? "Job",
        counterpartName: a.talent_profiles?.profiles?.full_name ?? "Candidate",
        status: a.status,
      }));
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-14">
        <h1 className="font-display text-2xl font-semibold text-ink">Messages</h1>
        <p className="mt-2 text-muted">
          Conversations open once a candidate is shortlisted for a job.
        </p>

        <div className="mt-8 space-y-3">
          {threads.length === 0 && (
            <p className="card p-8 text-center text-muted">No conversations yet.</p>
          )}
          {threads.map((t) => (
            <Link
              key={t.id}
              href={`/messages/${t.id}`}
              className="card flex items-center justify-between gap-3 p-4 hover:border-teal"
            >
              <div>
                <p className="font-medium text-ink">{t.counterpartName}</p>
                <p className="text-sm text-muted">{t.jobTitle}</p>
              </div>
              <span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs font-medium capitalize text-ink">
                {t.status}
              </span>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
