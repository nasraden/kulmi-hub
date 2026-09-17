import type { Job, TalentProfile, ProficiencyLevel } from "./types";

/**
 * KULMI HUB AI MATCH SCORE
 * ------------------------
 * A 0-100 score expressing how well a talent profile fits a job post.
 * Weighted blend of four signals, each normalized to 0-1 before weighting:
 *
 *   50%  Skill overlap   — how many of the job's required skills the talent has.
 *                          A skill with an approved Kulmi Certify badge counts at
 *                          full strength regardless of self-reported proficiency;
 *                          this is the "verified weight" the business spec calls for.
 *   15%  Experience fit  — talent's seniority (derived from years of experience)
 *                          vs. the job's stated experience level.
 *   15%  Location fit    — exact city match > same country > different.
 *   20%  Rate fit         — talent's hourly rate against the job's budget.
 *
 * The weights and curve are intentionally simple and transparent so results
 * are explainable to both talent and companies — this is a marketplace
 * primitive, not a black box.
 */

const PROFICIENCY_WEIGHT: Record<ProficiencyLevel, number> = {
  beginner: 0.7,
  intermediate: 0.85,
  advanced: 1,
  expert: 1,
};

const SENIORITY_ORDER = ["junior", "mid", "senior"] as const;
type Seniority = (typeof SENIORITY_ORDER)[number];

function normalizeSkill(name: string) {
  return name.trim().toLowerCase();
}

function skillOverlapScore(
  requiredSkills: string[],
  talentSkills: { skill_name: string; proficiency_level: ProficiencyLevel; verified_badge?: boolean }[]
): number {
  if (requiredSkills.length === 0) return 1; // job has no explicit skill requirements
  const talentMap = new Map(
    talentSkills.map((s) => [normalizeSkill(s.skill_name), s])
  );

  let scoreSum = 0;
  for (const skill of requiredSkills) {
    const match = talentMap.get(normalizeSkill(skill));
    if (!match) continue;
    // A Kulmi Certify-verified skill counts at full strength — that's the point of the badge.
    scoreSum += match.verified_badge ? 1 : PROFICIENCY_WEIGHT[match.proficiency_level];
  }
  return scoreSum / requiredSkills.length;
}

/** Rough years-of-experience -> seniority mapping used for the experience-fit signal. */
export function inferSeniority(totalYears: number): Seniority {
  if (totalYears >= 6) return "senior";
  if (totalYears >= 2) return "mid";
  return "junior";
}

function experienceFitScore(jobLevel: string, talentYears: number): number {
  const normalizedJobLevel = (SENIORITY_ORDER as readonly string[]).includes(jobLevel)
    ? (jobLevel as Seniority)
    : "mid";
  const talentLevel = inferSeniority(talentYears);
  const distance = Math.abs(
    SENIORITY_ORDER.indexOf(talentLevel) - SENIORITY_ORDER.indexOf(normalizedJobLevel)
  );
  // 0 steps away = 1.0, 1 step = 0.6, 2 steps = 0.3
  return [1, 0.6, 0.3][distance] ?? 0.3;
}

function locationFitScore(jobLocation: string, talentLocation: string): number {
  const j = jobLocation.toLowerCase();
  const t = talentLocation.toLowerCase();
  if (!j || !t) return 0.6;
  if (j.includes("remote")) return 1; // remote roles are location-agnostic by definition
  if (j === t) return 1;
  const jCountry = j.split(",").pop()?.trim();
  const tCountry = t.split(",").pop()?.trim();
  if (jCountry && tCountry && jCountry === tCountry) return 0.75;
  return 0.4;
}

/**
 * Compares the talent's hourly rate against the job's budget. A talent priced
 * at or below budget is a perfect fit; a modest overage still scores
 * reasonably (companies often have some flexibility), and a large overage
 * scores low without disqualifying the candidate outright.
 */
function rateFitScore(jobBudget: number | null, talentRate: number | null): number {
  if (jobBudget == null || talentRate == null || jobBudget <= 0) return 0.6; // unknown — stay neutral
  if (talentRate <= jobBudget) return 1;
  const overage = (talentRate - jobBudget) / jobBudget;
  if (overage <= 0.15) return 0.75;
  if (overage <= 0.35) return 0.5;
  return 0.25;
}

export function calculateTalentYears(
  experience: { start_date: string | null; end_date: string | null }[] | undefined
): number {
  if (!experience || experience.length === 0) return 0;
  const msPerYear = 1000 * 60 * 60 * 24 * 365.25;
  const total = experience.reduce((sum, exp) => {
    if (!exp.start_date) return sum;
    const start = new Date(exp.start_date).getTime();
    const end = exp.end_date ? new Date(exp.end_date).getTime() : Date.now();
    return sum + Math.max(0, end - start) / msPerYear;
  }, 0);
  return Math.round(total * 10) / 10;
}

export interface MatchBreakdown {
  score: number; // 0-100
  skillScore: number; // 0-100
  experienceScore: number; // 0-100
  locationScore: number; // 0-100
  rateScore: number; // 0-100
  matchedSkills: string[];
  missingSkills: string[];
  verifiedMatchedSkills: string[];
}

export function calculateMatchScore(job: Job, talent: TalentProfile): MatchBreakdown {
  const requiredSkills = (job.job_skills ?? []).map((s) => s.skill_name);
  const talentSkills = talent.talent_skills ?? [];

  const skill = skillOverlapScore(requiredSkills, talentSkills);
  const years = calculateTalentYears(talent.talent_experience);
  const experience = experienceFitScore(job.experience_level, years);
  const location = locationFitScore(job.location, talent.profiles?.location ?? "");
  const rate = rateFitScore(job.budget, talent.hourly_rate);

  const weighted = skill * 0.5 + experience * 0.15 + location * 0.15 + rate * 0.2;

  const talentSkillMap = new Map(talentSkills.map((s) => [normalizeSkill(s.skill_name), s]));
  const matchedSkills = requiredSkills.filter((s) => talentSkillMap.has(normalizeSkill(s)));
  const missingSkills = requiredSkills.filter((s) => !talentSkillMap.has(normalizeSkill(s)));
  const verifiedMatchedSkills = matchedSkills.filter(
    (s) => talentSkillMap.get(normalizeSkill(s))?.verified_badge
  );

  return {
    score: Math.round(weighted * 100),
    skillScore: Math.round(skill * 100),
    experienceScore: Math.round(experience * 100),
    locationScore: Math.round(location * 100),
    rateScore: Math.round(rate * 100),
    matchedSkills,
    missingSkills,
    verifiedMatchedSkills,
  };
}

