import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import { sendMessage } from "@/app/actions";
import { timeAgo } from "@/lib/utils";

export default async function ThreadPage({ params }: { params: { applicationId: string } }) {
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

  const { data: application } = await supabase
    .from("applications")
    .select(
      "*, jobs(id, title, company_profiles(profile_id, company_name)), talent_profiles(profile_id, profiles(id, full_name))"
    )
    .eq("id", params.applicationId)
    .maybeSingle();

  if (!application) notFound();

  const companyProfileId = (application as any).jobs?.company_profiles?.profile_id;
  const talentProfileId = (application as any).talent_profiles?.profile_id;
  const isParticipant = profile.id === companyProfileId || profile.id === talentProfileId;
  if (!isParticipant) notFound();

  const receiverId = profile.id === companyProfileId ? talentProfileId : companyProfileId;
  const counterpartName =
    profile.id === companyProfileId
      ? (application as any).talent_profiles?.profiles?.full_name
      : (application as any).jobs?.company_profiles?.company_name;

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("application_id", application.id)
    .order("created_at", { ascending: true });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10">
        <div className="border-b border-line pb-4">
          <p className="text-sm text-muted">{(application as any).jobs?.title}</p>
          <h1 className="font-display text-xl font-semibold text-ink">{counterpartName}</h1>
        </div>

        <div className="flex-1 space-y-3 py-6">
          {(messages ?? []).length === 0 && (
            <p className="text-center text-sm text-muted">
              Say hello — this is the start of your conversation.
            </p>
          )}
          {(messages ?? []).map((m) => {
            const fromMe = m.sender_id === profile.id;
            return (
              <div key={m.id} className={`flex ${fromMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-md px-4 py-2.5 text-sm ${
                    fromMe ? "bg-ink text-paper" : "bg-white border border-line text-ink"
                  }`}
                >
                  <p>{m.content}</p>
                  <p className={`mt-1 text-[11px] ${fromMe ? "text-paper/60" : "text-muted"}`}>
                    {timeAgo(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <form action={sendMessage} className="flex gap-3 border-t border-line pt-4">
          <input type="hidden" name="applicationId" value={application.id} />
          <input type="hidden" name="receiverId" value={receiverId} />
          <input type="hidden" name="jobId" value={(application as any).jobs?.id} />
          <input
            name="content"
            required
            placeholder="Write a message…"
            className="field-input flex-1"
          />
          <button type="submit" className="btn-primary">
            Send
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
