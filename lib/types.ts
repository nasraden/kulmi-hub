export type UserRole = "talent" | "company" | "admin";
export type EngagementType = "full-time" | "part-time" | "freelance" | "contract" | "remote";
export type JobStatus = "draft" | "open" | "closed";
export type ApplicationStatus = "applied" | "shortlisted" | "rejected" | "hired";
export type ProficiencyLevel = "beginner" | "intermediate" | "advanced" | "expert";
export type CertifyStatus = "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  user_id: string;
  role: UserRole;
  full_name: string;
  email: string;
  avatar_url: string | null;
  location: string | null;
  created_at: string;
}

export interface TalentSkill {
  id: string;
  talent_id: string;
  skill_name: string;
  proficiency_level: ProficiencyLevel;
  verified_badge: boolean;
}

export interface TalentExperience {
  id: string;
  talent_id: string;
  company_name: string;
  job_title: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}

export interface TalentProfile {
  id: string;
  profile_id: string;
  title: string | null;
  bio: string | null;
  hourly_rate: number | null;
  availability: string;
  portfolio_links: string[] | null;
  resume_url: string | null;
  is_verified: boolean;
  profiles?: Profile;
  talent_skills?: TalentSkill[];
  talent_experience?: TalentExperience[];
}

export interface CompanyProfile {
  id: string;
  profile_id: string;
  company_name: string;
  logo_url: string | null;
  industry: string | null;
  company_size: string | null;
  website: string | null;
  location: string | null;
  description: string | null;
  profiles?: Profile;
}

export interface JobSkill {
  id: string;
  job_id: string;
  skill_name: string;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  budget: number | null;
  engagement_type: EngagementType;
  experience_level: string;
  location: string;
  status: JobStatus;
  created_at: string;
  company_profiles?: CompanyProfile;
  job_skills?: JobSkill[];
}

export interface Application {
  id: string;
  job_id: string;
  talent_id: string;
  status: ApplicationStatus;
  match_score: number;
  cover_note: string | null;
  applied_at: string;
  jobs?: Job;
  talent_profiles?: TalentProfile;
}

export interface Message {
  id: string;
  application_id: string;
  sender_id: string;
  receiver_id: string;
  job_id: string;
  content: string;
  created_at: string;
}

export interface CertifyRequest {
  id: string;
  talent_id: string;
  skill_name: string;
  status: CertifyStatus;
  notes: string | null;
  reviewer_notes: string | null;
  requested_at: string;
  reviewed_at: string | null;
  talent_profiles?: TalentProfile;
}

export interface CompanyTalentPool {
  id: string;
  company_id: string;
  talent_id: string;
  pool_name: string;
  added_at: string;
  talent_profiles?: TalentProfile;
}
