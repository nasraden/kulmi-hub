import Navbar from "@/components/Navbar";
import { postJob } from "@/app/actions";

export default function NewJobPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-14">
        <h1 className="font-display text-2xl font-semibold text-ink">Post a job</h1>
        <p className="mt-2 text-muted">
          Be precise with required skills — that's what the match score is built from.
        </p>
        {searchParams.error && (
          <div className="mt-4 rounded-sm bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {searchParams.error}
          </div>
        )}

        <form action={postJob} className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="title">
              Job title
            </label>
            <input id="title" name="title" required className="field-input" placeholder="Frontend Developer" />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="description">
              Description
            </label>
            <textarea id="description" name="description" rows={6} required className="field-input" />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="skills">
              Required skills (comma-separated)
            </label>
            <input
              id="skills"
              name="skills"
              required
              className="field-input"
              placeholder="React, TypeScript, Tailwind CSS"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="engagementType">
              Engagement type
            </label>
            <select id="engagementType" name="engagementType" className="field-input">
              <option value="freelance">Freelance</option>
              <option value="contract">Contract</option>
              <option value="part-time">Part-time</option>
              <option value="full-time">Full-time</option>
              <option value="remote">Remote</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="experienceLevel">
              Experience level
            </label>
            <select id="experienceLevel" name="experienceLevel" className="field-input">
              <option value="junior">Junior</option>
              <option value="mid">Mid-level</option>
              <option value="senior">Senior</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="budget">
              Budget (USD)
            </label>
            <input id="budget" name="budget" type="number" min={0} className="field-input" placeholder="20" />
          </div>
          <div>
            <label className="field-label" htmlFor="location">
              Location
            </label>
            <input id="location" name="location" defaultValue="Hargeisa, Somaliland" className="field-input" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary">
              Publish job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
