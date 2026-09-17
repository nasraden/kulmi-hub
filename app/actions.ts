"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// ------------------------------------------------------------
// AUTH
// ------------------------------------------------------------

type AuthFormState = { error?: string; success?: string } | null;

export async function signUp(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "talent").trim(); // Captures selected role dynamics

  if (!fullName || !email || !password) {
    return { error: "Please fill in every field." };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { 
      data: { 
        full_name: fullName,
        role: role
      } 
    },
  });

  if (error) return { error: error.message };

  if (data.session) {
    redirect(`/onboarding/${role}`);
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

  if (!profile) {
    const userRole = data.user.user_metadata?.role || "talent";
    redirect(`/onboarding/${userRole}`);
  }
  
  redirect(next || `/dashboard/${profile.role}`);
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
  const { data: { user } } = await supabase.auth.getUser();
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
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login");

  // Enforce parent profiles setup baseline to satisfy schema checks
  const { data: newProfile, error: profileFetchError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  let activeProfileId = newProfile?.id;

  if (!activeProfileId) {
    const { data: newProfile, error: profileCreateError } = await supabase
      .from("profiles")
      .upsert({
        user_id: user.id,
        full_name: user.user_metadata?.full_name || "New Professional",
        email: user.email,
        role: "talent",
        location: String(formData.get("location") ?? "Hargeisa, Somaliland")
      }, { onConflict: "user_id" })
      .select()
      .single();

    if (profileCreateError) {
      redirect(`/onboarding/talent?error=${encodeURIComponent(profileCreateError.message)}`);
    }
    activeProfileId = newProfile.id;
  } else {
    const location = String(formData.get("location") ?? "Hargeisa, Somaliland");
    await supabase.from("profiles").update({ location }).eq("id", activeProfileId);
  }

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
        profile_id: activeProfileId,
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

  if (talentError) {
    redirect(`/onboarding/talent?error=${encodeURIComponent(talentError.message)}`);
  }

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
    .map((company_name, i) => {
      // Robust ISO conversion fallback logic for start dates
      let sDate = new Date().toISOString().split('T')[0];
      if (startDates[i] && startDates[i].trim() !== "" && !startDates[i].includes("0200")) {
        const parsedStart = new Date(startDates[i]);
        if (!isNaN(parsedStart.getTime())) {
          sDate = parsedStart.toISOString().split('T')[0];
        }
      }

      // Robust ISO conversion fallback logic for end dates
      let eDate: string | null = null;
      if (endDates[i] && endDates[i].trim() !== "" && !endDates[i].includes("0222")) {
        const parsedEnd = new Date(endDates[i]);
        if (!isNaN(parsedEnd.getTime())) {
          eDate = parsedEnd.toISOString().split('T')[0];
        }
      }

      return {
        talent_id: talent.id,
        company_name,
        job_title: jobTitles[i] || "Staff Member",
        start_date: sDate,
        end_date: eDate,
        description: descriptions[i] || "",
      };
    })
    .filter((row) => row.company_name.trim().length > 0);

  if (experienceRows.length > 0) {
    await supabase.from("talent_experience").delete().eq("talent_id", talent.id);
    await supabase.from("talent_experience").insert(experienceRows);
  }

  redirect("/dashboard/talent");
}

export async function saveCompanyOnboarding(formData: FormData): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
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



// ========================================================
// 8. COMPANY FUNCTIONS: REMOVE FROM TALENT POOL          
// ========================================================
export async function removeFromTalentPool(talentPoolId: string): Promise<void> {
  const supabase = createClient();

  // Hubi marka hore in shirkaddu ay furan tahay session-ka
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error } = await supabase
    .from("company_talent_pools")
    .delete()
    .eq("id", talentPoolId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/company/talent-pool");
}








// ========================================================
// 7. ADMIN FUNCTIONS: REVIEW CERTIFY REQUESTS            
// ========================================================
export async function reviewCertifyRequest(requestId: string, status: "approved" | "rejected"): Promise<void> {
  const supabase = createClient();
  
  // Hubi marka hore user-ka furan inuu yahay admin rasmiga ah
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error } = await supabase
    .from("certify_requests")
    .update({ 
      status,
      reviewed_at: new Date().toISOString()
    })
    .eq("id", requestId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/admin");
}









export async function requestProfileVerification(): Promise<{ success?: string; error?: string }> {
  const supabase = createClient();
  
  // 1. Soo qaad user furan
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: "User session not found. Please log in again." };

  // 2. U beddel xaaladda profaylka 'pending' (Codsigu wuxuu u tagayaa Admin-ka)
  const { error } = await supabase
    .from("profiles")
    .update({ verification_status: "pending" })
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  // 3. Dib u cusboonaysii bogga si isbeddelku u muuqdo
  revalidatePath("/dashboard/talent");
  return { success: "Codsiga xaqiijinta si guul leh ayaa loo diray!" };
}






// ------------------------------------------------------------
// JOBS
// ------------------------------------------------------------

export async function postJob(formData: FormData): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
    
  const { data: company } = await supabase
    .from("company_profiles")
    .select("id")
    .eq("profile_id", profile!.id)
    .single();

  if (!company) {
    redirect("/jobs/new?error=Finish%20your%20company%20profile%20before%20posting%20a%20job");
  }

  const { error } = await supabase
    .from("jobs")
    .insert({
      company_id: company.id,
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      budget: Number(formData.get("budget") ?? 0) || null,
      engagement_type: String(formData.get("engagementType") ?? "freelance"),
      experience_level: String(formData.get("experienceLevel") ?? "mid"),
      location: String(formData.get("location") ?? "Hargeisa, Somaliland"),
    });

  if (error) {
    redirect(`/jobs/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/company");
  redirect("/dashboard/company");
}
