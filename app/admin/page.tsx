import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Server Action to approve the user inside the admin panel
async function approveVerification(formData: FormData) {
  "use server";
  const profileId = formData.get("profileId") as string;
  const supabase = createClient();

  await supabase
    .from("profiles")
    .update({ verification_status: "verified" })
    .eq("id", profileId);

  revalidatePath("/admin");
}

export default async function AdminDashboard() {
  const supabase = createClient();

  // 1. Hubi in qofka soo galay uu yahay Admin (Waxaad ku xiri kartaa iimeelkaaga)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== "admin@kulmihub.com") { // U beddel iimeelkaaga rasmiga ah
    redirect("/login");
  }

  // 2. Soo kaxee dhammaan profiles-ka leh xaaladda 'pending'
  const { data: pendingProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("verification_status", "pending");

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-[#404145]">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-2xl font-bold text-[#222325] mb-2">
          Kulmi Hub Admin Management
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Review and verify pending talent verification requests.
        </p>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-semibold text-[#222325]">Verification Requests ({pendingProfiles?.length || 0})</h2>
          </div>

          {!pendingProfiles || pendingProfiles.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">
              No pending verification requests at the moment.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {pendingProfiles.map((profile) => (
                <li key={profile.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <h3 className="text-sm font-bold text-[#222325]">{profile.full_name}</h3>
                    <p className="text-xs text-gray-400">{profile.email} • Account Type: <span className="capitalize">{profile.role}</span></p>
                  </div>
                  
                  <form action={approveVerification}>
                    <input type="hidden" name="profileId" value={profile.id} />
                    <button
                      type="submit"
                      className="text-xs font-bold bg-[#04277c] hover:bg-[#008291] text-white px-4 py-2 rounded-md transition-all shadow-sm"
                    >
                      Approve & Verify
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}