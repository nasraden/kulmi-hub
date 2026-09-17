"use server";

import { createClient } from "@/lib/supabase/server"; // 👈 Waxaan si toos ah uga soo xiganay faylkeeda rasmiga ah
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// 1. LOG OUT ACTION
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// 2. ONBOARDING TALENT ACTION
export async function saveTalentOnboarding(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") ?? "");
  const hourlyRate = Number(formData.get("hourlyRate") ?? 0);
  const availability = String(formData.get("availability") ?? "available");
  const bio = String(formData.get("bio") ?? "");
  const skillsText = String(formData.get("skills") ?? "");
  const portfolioText = String(formData.get("portfolio") ?? "");

  await supabase
    .from("profiles")
    .update({ role: "talent" })
    .eq("user_id", user.id);

  const { data: talent, error: talentError } = await supabase
    .from("talent_profiles")
    .upsert({
      user_id: user.id,
      title,
      hourly_rate: hourlyRate,
      availability,
      bio,
      portfolio_links: portfolioText.split(",").map((s) => s.trim()).filter(Boolean),
    })
    .select()
    .single();

  if (talentError) {
    redirect(`/onboarding/talent?error=${encodeURIComponent(talentError.message)}`);
  }

  if (skillsText) {
    const skills = skillsText.split(",").map((s) => s.trim()).filter(Boolean);
    const skillInserts = skills.map((skill) => ({
      talent_id: talent.id,
      skill_name: skill,
    }));
    await supabase.from("talent_skills").insert(skillInserts);
  }

  redirect("/dashboard/talent");
}

// 3. ADMIN: REVIEW CERTIFY REQUESTS
export async function reviewCertifyRequest(requestId: string, status: "approved" | "rejected"): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error } = await supabase
    .from("certify_requests")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin");
}

// 4. COMPANY: REMOVE FROM TALENT POOL
export async function removeFromTalentPool(talentPoolId: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error } = await supabase
    .from("company_talent_pools")
    .delete()
    .eq("id", talentPoolId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/company/talent-pool");
}

// 5. TALENT: REQUEST CERTIFY BADGE
export async function requestCertifyBadge(formData: FormData): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const skillId = String(formData.get("skillId") ?? "");
  if (!skillId) throw new Error("Skill ID is required");

  const { error } = await supabase
    .from("certify_requests")
    .insert({
      talent_id: user.id,
      skill_id: skillId,
      status: "pending",
      requested_at: new Date().toISOString()
    });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/talent");
}

// 6. APPLICATIONS & JOB MANAGEMENT
export async function applyToJob(jobId: string, formData: FormData): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("id, location").eq("user_id", user.id).single();
  const { data: talent = null } = await supabase.from("talent_profiles").select("id, hourly_rate, title").eq("profile_id", profile!.id).maybeSingle();

  if (!talent) redirect(`/jobs/${jobId}?error=Complete+your+talent+profile+first`);

  const { data: job } = await supabase.from("jobs").select("description, title").eq("id", jobId).single();
  const { data: talentSkills } = await supabase.from("talent_skills").select("skill_name").eq("talent_id", talent.id);
  const skills = talentSkills?.map(s => s.skill_name) || [];
  
  let score = 75; 
  if (job && job.description) {
    const matchedCount = skills.filter(skill => 
      job.description.toLowerCase().includes(skill.toLowerCase()) || 
      job.title.toLowerCase().includes(skill.toLowerCase())
    ).length;
    if (matchedCount > 0) score = Math.min(75 + (matchedCount * 5), 100);
  }

  const { error } = await supabase.from("applications").insert({
    job_id: jobId,
    talent_id: talent.id,
    match_score: score,
    status: "pending"
  });

  if (error) redirect(`/jobs/${jobId}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/jobs/${jobId}`);
  redirect("/dashboard/talent");
}

export async function closeJob(jobId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("jobs").update({ status: "closed" }).eq("id", jobId);
  if (error) throw new Error(error.message);
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/dashboard/company");
}

export async function reopenJob(jobId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("jobs").update({ status: "open" }).eq("id", jobId);
  if (error) throw new Error(error.message);
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/dashboard/company");
}

export async function updateApplicationStatus(applicationId: string, status: "shortlisted" | "rejected" | "hired"): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("applications").update({ status }).eq("id", applicationId);
  if (error) throw new Error(error.message);
  
  const { data: app } = await supabase.from("applications").select("job_id").eq("id", applicationId).single();
  if (app) revalidatePath(`/jobs/${app.job_id}`);
}

export async function saveToTalentPool(talentId: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user.id).single();
  const { data: company } = await supabase.from("company_profiles").select("id").eq("profile_id", profile!.id).single();

  const { error } = await supabase.from("company_talent_pools").upsert({
    company_id: company!.id,
    talent_id: talentId,
    pool_name: "General"
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/company/talent-pool");
}
