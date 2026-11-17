"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculateMatchScore } from "@/lib/matching";
import type { Job, TalentProfile } from "@/lib/types";

// ------------------------------------------------------------
// AUTH
// ------------------------------------------------------------

type AuthFormState = { error?: string; success?: string };

export async function signUp(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || !password) {
    return { error: "Please fill in every field." };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) return { error: error.message };

  if (data.session) {
    redirect("/onboarding/role");
  }

  return {
    success:
      "Check your inbox to confirm your email, then log in to finish setting up your account.",
  };
}

export async function signIn(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!profile) redirect("/onboarding/role");
  redirect(next || `/dashboard/${profile.role}`);
}

export async function requestPasswordReset(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Please enter your email address." };

  const supabase = createClient();
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kulmihub.com";
  const siteUrl = configuredSiteUrl.endsWith("/") ? configuredSiteUrl.slice(0, -1) : configuredSiteUrl;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });

  if (error) return { error: "We couldn't send the reset email. Please try again shortly." };

  // Keep the response generic so the form does not reveal whether an account exists.
  return {
    success: "If an account exists for that email, you'll receive a password reset link shortly. Please check your inbox and spam folder.",
  };
}

export async function updatePassword(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 6) {
    return { error: "Your password must be at least 6 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "The passwords do not match." };
  }

  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "Your reset link has expired. Please request a new password reset link." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  return { success: "Your password has been updated. You can now log in with your new password." };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/");
}

// ------------------------------------------------------------
// ONBOARDING
// ------------------------------------------------------------

export async function chooseRole(role: "talent" | "company"): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("profiles").insert({
    user_id: user!.id,
    role,
    full_name: (user!.user_metadata?.full_name as string) ?? user!.email!,
    email: user!.email!,
  });

  if (error && !error.message.includes("duplicate")) {
    redirect(`/onboarding/role?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/onboarding/${role}`);
}

function parseSkillList(raw: string) {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function saveTalentOnboarding(formData: FormData): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user!.id)
    .single();
  if (!profile) redirect("/onboarding/talent?error=Profile%20not%20found");

  const location = String(formData.get("location") ?? "Hargeisa, Somaliland");
  await supabase.from("profiles").update({ location }).eq("id", profile.id);

  const title = String(formData.get("title") ?? "");
  const bio = String(formData.get("bio") ?? "");
  const hourlyRate = Number(formData.get("hourlyRate") ?? 0) || null;
  const availability = String(formData.get("availability") ?? "available");
  const portfolio = String(formData.get("portfolio") ?? "");
  const portfolioLinks = portfolio ? parseSkillList(portfolio) : [];

  const { data: talent, error: talentError } = await supabase
    .from("talent_profiles")
    .upsert(
      {
        profile_id: profile.id,
        title,
        bio,
        hourly_rate: hourlyRate,
        availability,
        portfolio_links: portfolioLinks,
      },
      { onConflict: "profile_id" }
    )
    .select()
    .single();

  if (talentError)
    redirect(`/onboarding/talent?error=${encodeURIComponent(talentError.message)}`);

  const skillsRaw = String(formData.get("skills") ?? "");
  const skills = parseSkillList(skillsRaw);
  if (skills.length > 0) {
    await supabase.from("talent_skills").delete().eq("talent_id", talent.id);
    await supabase.from("talent_skills").insert(
      skills.map((skill_name) => ({
        talent_id: talent.id,
        skill_name,
        proficiency_level: "intermediate" as const,
      }))
    );
  }

  const companyNames = formData.getAll("exp_company") as string[];
  const jobTitles = formData.getAll("exp_title") as string[];
  const startDates = formData.getAll("exp_start") as string[];
  const endDates = formData.getAll("exp_end") as string[];
  const descriptions = formData.getAll("exp_description") as string[];

  const experienceRows = companyNames
    .map((company_name, i) => ({
      talent_id: talent.id,
      company_name,
      job_title: jobTitles[i] || "",
      start_date: startDates[i] || null,
      end_date: endDates[i] || null,
      description: descriptions[i] || null,
    }))
    .filter((row) => row.company_name.trim().length > 0);

  if (experienceRows.length > 0) {
    await supabase.from("talent_experience").delete().eq("talent_id", talent.id);
    await supabase.from("talent_experience").insert(experienceRows);
  }

  redirect("/dashboard/talent");
}

export async function saveCompanyOnboarding(formData: FormData): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user!.id)
    .single();
  if (!profile) redirect("/onboarding/company?error=Profile%20not%20found");

  const location = String(formData.get("location") ?? "Hargeisa, Somaliland");
  await supabase.from("profiles").update({ location }).eq("id", profile.id);

  const payload = {
    profile_id: profile.id,
    company_name: String(formData.get("companyName") ?? ""),
    logo_url: String(formData.get("logoUrl") ?? "") || null,
    industry: String(formData.get("industry") ?? ""),
    company_size: String(formData.get("companySize") ?? ""),
    website: String(formData.get("website") ?? "") || null,
    location,
    description: String(formData.get("description") ?? ""),
  };

  const { error } = await supabase
    .from("company_profiles")
    .upsert(payload, { onConflict: "profile_id" });

  if (error) redirect(`/onboarding/company?error=${encodeURIComponent(error.message)}`);
  redirect("/dashboard/company");
}

// ------------------------------------------------------------
// JOBS
// ------------------------------------------------------------

export async function postJob(formData: FormData): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user!.id)
    .single();
  const { data: company } = await supabase
    .from("company_profiles")
    .select("id")
    .eq("profile_id", profile!.id)
    .single();

  if (!company)
    redirect("/jobs/new?error=Finish%20your%20company%20profile%20before%20posting%20a%20job");

  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      company_id: company.id,
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      budget: Number(formData.get("budget") ?? 0) || null,
      engagement_type: String(formData.get("engagementType") ?? "freelance"),
      experience_level: String(formData.get("experienceLevel") ?? "mid"),
      location: String(formData.get("location") ?? "Hargeisa, Somaliland"),
      status: "open",
    })
    .select()
    .single();

  if (error) redirect(`/jobs/new?error=${encodeURIComponent(error.message)}`);

  const skills = parseSkillList(String(formData.get("skills") ?? ""));
  if (skills.length > 0) {
    await supabase
      .from("job_skills")
      .insert(skills.map((skill_name) => ({ job_id: job.id, skill_name })));
  }

  redirect(`/jobs/${job.id}`);
}

export async function closeJob(jobId: string) {
  const supabase = createClient();
  await supabase.from("jobs").update({ status: "closed" }).eq("id", jobId);
  revalidatePath("/dashboard/company");
  revalidatePath(`/jobs/${jobId}`);
}

export async function reopenJob(jobId: string) {
  const supabase = createClient();
  await supabase.from("jobs").update({ status: "open" }).eq("id", jobId);
  revalidatePath("/dashboard/company");
  revalidatePath(`/jobs/${jobId}`);
}

export async function applyToJob(jobId: string, formData: FormData): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/jobs/${jobId}`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user!.id)
    .single();

  const { data: talent } = await supabase
    .from("talent_profiles")
    .select("*, profiles(*), talent_skills(*), talent_experience(*)")
    .eq("profile_id", profile!.id)
    .single();

  if (!talent)
    redirect(`/jobs/${jobId}?error=Finish%20your%20talent%20profile%20before%20applying`);

  const { data: job } = await supabase
    .from("jobs")
    .select("*, job_skills(*)")
    .eq("id", jobId)
    .single();

  if (!job) redirect(`/jobs/${jobId}?error=Job%20not%20found`);

  const breakdown = calculateMatchScore(job as unknown as Job, talent as unknown as TalentProfile);

  const { error } = await supabase.from("applications").insert({
    job_id: jobId,
    talent_id: talent.id,
    match_score: breakdown.score,
    cover_note: String(formData.get("coverNote") ?? ""),
  });

  if (error) {
    const message = error.message.includes("duplicate")
      ? "You already applied to this job"
      : error.message;
    redirect(`/jobs/${jobId}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath(`/jobs/${jobId}`);
  redirect(`/jobs/${jobId}?applied=1`);
}


// ------------------------------------------------------------
// APPLICATION REVIEW, TALENT POOL, CERTIFICATION & MESSAGING
// ------------------------------------------------------------

async function getAuthenticatedProfile() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) redirect("/onboarding/role");
  return { supabase, profile };
}

export async function updateApplicationStatus(
  applicationId: string,
  status: "shortlisted" | "hired" | "rejected",
  jobId: string
): Promise<void> {
  const { supabase, profile } = await getAuthenticatedProfile();
  if (profile.role !== "company") redirect("/");

  const { data: company } = await supabase
    .from("company_profiles")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();
  if (!company) redirect("/onboarding/company");

  const { data: job } = await supabase
    .from("jobs")
    .select("id")
    .eq("id", jobId)
    .eq("company_id", company.id)
    .maybeSingle();
  if (!job) redirect("/dashboard/company");

  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId)
    .eq("job_id", job.id);

  if (error) redirect(`/jobs/${jobId}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/dashboard/company");
}

export async function saveToTalentPool(talentId: string, jobId: string): Promise<void> {
  const { supabase, profile } = await getAuthenticatedProfile();
  if (profile.role !== "company") redirect("/");

  const { data: company } = await supabase
    .from("company_profiles")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();
  if (!company) redirect("/onboarding/company");

  const { data: job } = await supabase
    .from("jobs")
    .select("id")
    .eq("id", jobId)
    .eq("company_id", company.id)
    .maybeSingle();
  if (!job) redirect("/dashboard/company");

  const { data: talent } = await supabase
    .from("talent_profiles")
    .select("id")
    .eq("id", talentId)
    .maybeSingle();
  if (!talent) redirect(`/jobs/${jobId}?error=Talent%20profile%20not%20found`);

  const { error } = await supabase
    .from("company_talent_pools")
    .upsert(
      { company_id: company.id, talent_id: talent.id, pool_name: "General" },
      { onConflict: "company_id,talent_id,pool_name", ignoreDuplicates: true }
    );

  if (error) redirect(`/jobs/${jobId}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/dashboard/company/talent-pool");
}

export async function removeFromTalentPool(entryId: string): Promise<void> {
  const { supabase, profile } = await getAuthenticatedProfile();
  if (profile.role !== "company") redirect("/");

  const { data: company } = await supabase
    .from("company_profiles")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();
  if (!company) redirect("/onboarding/company");

  const { error } = await supabase
    .from("company_talent_pools")
    .delete()
    .eq("id", entryId)
    .eq("company_id", company.id);

  if (error) redirect(`/dashboard/company/talent-pool?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard/company/talent-pool");
}

export async function reviewCertifyRequest(
  requestId: string,
  status: "approved" | "rejected"
): Promise<void> {
  const { supabase, profile } = await getAuthenticatedProfile();
  if (profile.role !== "admin") redirect("/");

  const { data: request } = await supabase
    .from("certify_requests")
    .select("id, talent_id, skill_name, status")
    .eq("id", requestId)
    .eq("status", "pending")
    .maybeSingle();

  if (!request) redirect("/dashboard/admin?error=Request%20not%20found%20or%20already%20reviewed");

  const { error } = await supabase
    .from("certify_requests")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("status", "pending");

  if (error) redirect(`/dashboard/admin?error=${encodeURIComponent(error.message)}`);

  if (status === "approved") {
    await supabase
      .from("talent_skills")
      .update({ verified_badge: true })
      .eq("talent_id", request.talent_id)
      .ilike("skill_name", request.skill_name);

    const { data: skills } = await supabase
      .from("talent_skills")
      .select("verified_badge")
      .eq("talent_id", request.talent_id);

    if (skills?.length && skills.every((skill) => skill.verified_badge)) {
      await supabase
        .from("talent_profiles")
        .update({ is_verified: true })
        .eq("id", request.talent_id);
    }
  }

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/company");
}

export async function requestCompanyVerification(): Promise<void> {
  const { supabase, profile } = await getAuthenticatedProfile();
  if (profile.role !== "company") redirect("/");
  const { data: company } = await supabase
    .from("company_profiles")
    .select("id, verification_status")
    .eq("profile_id", profile.id)
    .maybeSingle();
  if (!company) redirect("/onboarding/company");
  if (company.verification_status === "verified") redirect("/dashboard/company");
  if (company.verification_status === "pending") redirect("/dashboard/company?notice=Verification%20request%20already%20pending");

  const { error } = await supabase
    .from("company_profiles")
    .update({ verification_status: "pending" })
    .eq("id", company.id);
  if (error) redirect("/dashboard/company?error=" + encodeURIComponent(error.message));
  revalidatePath("/dashboard/company");
  revalidatePath("/dashboard/admin");
}

export async function reviewCompanyVerification(
  companyId: string,
  status: "verified" | "rejected" | "unverified"
): Promise<void> {
  const { supabase, profile } = await getAuthenticatedProfile();
  if (profile.role !== "admin") redirect("/");
  const update = status === "verified"
    ? { verification_status: status, verified_at: new Date().toISOString(), verified_by: profile.id }
    : { verification_status: status, verified_at: null, verified_by: null };
  const { error } = await supabase
    .from("company_profiles")
    .update(update)
    .eq("id", companyId);
  if (error) redirect("/dashboard/admin?error=" + encodeURIComponent(error.message));
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/company");
  revalidatePath("/jobs");
}

export async function sendMessage(formData: FormData): Promise<void> {
  const { supabase, profile } = await getAuthenticatedProfile();
  const applicationId = String(formData.get("applicationId") ?? "");
  const receiverId = String(formData.get("receiverId") ?? "");
  const jobId = String(formData.get("jobId") ?? "");
  const content = String(formData.get("content") ?? "").trim();

  if (!applicationId || !receiverId || !jobId || !content) {
    redirect("/messages?error=Please%20complete%20the%20message");
  }

  const { data: application } = await supabase
    .from("applications")
    .select("id, job_id, talent_id, jobs(company_id, company_profiles(profile_id))")
    .eq("id", applicationId)
    .eq("job_id", jobId)
    .maybeSingle();

  if (!application) redirect("/messages");

  const companyProfileId = (application as any).jobs?.company_profiles?.profile_id as string | undefined;
  const { data: talent } = await supabase
    .from("talent_profiles")
    .select("profile_id")
    .eq("id", application.talent_id)
    .maybeSingle();
  const talentProfileId = talent?.profile_id;

  const isCompany = profile.id === companyProfileId;
  const isTalent = profile.id === talentProfileId;
  if ((!isCompany && !isTalent) || receiverId !== (isCompany ? talentProfileId : companyProfileId)) {
    redirect("/messages");
  }

  const { error } = await supabase.from("messages").insert({
    application_id: applicationId,
    sender_id: profile.id,
    receiver_id: receiverId,
    job_id: jobId,
    content,
  });

  if (error) redirect(`/messages/${applicationId}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/messages/${applicationId}`);
  redirect(`/messages/${applicationId}`);
}
