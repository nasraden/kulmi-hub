"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { saveTalentOnboarding } from "@/app/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
      {pending ? "Saving…" : "Save profile & continue"}
    </button>
  );
}

export default function TalentOnboardingForm() {
  const [experienceRows, setExperienceRows] = useState([0]);

  return (
    <form action={saveTalentOnboarding} className="mt-8 space-y-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="title">
            Professional title
          </label>
          <input
            id="title"
            name="title"
            required
            className="field-input"
            placeholder="e.g. Frontend Developer"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="hourlyRate">
            Hourly rate (USD)
          </label>
          <input
            id="hourlyRate"
            name="hourlyRate"
            type="number"
            min={0}
            className="field-input"
            placeholder="15"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="availability">
            Availability
          </label>
          <select id="availability" name="availability" className="field-input">
            <option value="available">Available now</option>
            <option value="busy">Limited availability</option>
            <option value="not-looking">Not looking</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="location">
            Location
          </label>
          <input
            id="location"
            name="location"
            defaultValue="Hargeisa, Somaliland"
            className="field-input"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="bio">
            Short bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            className="field-input"
            placeholder="What you build, and what kind of work you want more of."
          />
        </div>
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="skills">
            Skills (comma-separated)
          </label>
          <input
            id="skills"
            name="skills"
            required
            className="field-input"
            placeholder="React, TypeScript, Tailwind CSS, Figma"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="portfolio">
            Portfolio links (comma-separated, optional)
          </label>
          <input id="portfolio" name="portfolio" className="field-input" placeholder="https://…" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Experience</h2>
          <button
            type="button"
            onClick={() => setExperienceRows((rows) => [...rows, rows.length])}
            className="text-sm font-medium text-teal-dark hover:underline"
          >
            + Add another role
          </button>
        </div>
        <div className="mt-4 space-y-6">
          {experienceRows.map((row, i) => (
            <div key={row} className="card space-y-4 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
               <div>
                  <label className="field-label">Company</label>
                  <input name="exp_company" className="field-input" placeholder="Company name" />
                </div>
                <div>
                  <label className="field-label">Role title</label>
                  <input name="exp_title" className="field-input" placeholder="Job title" />
                </div>
                
                {/* Updated Start Date input setup */}
                <div>
                  <label htmlFor="startDate" className="field-label">Start date</label>
                  <input 
                    id="startDate" 
                    name="exp_start" 
                    type="text" //  Allows free text entry so zeros never get blocked
                    placeholder="YYYY-MM-DD (e.g., 2024-05-15)"
                    className="field-input" 
                  />
                </div>
                   <div>
                  <label htmlFor="endDate" className="field-label">End date (blank if current)</label>
                  <input 
                    id="endDate" 
                    name="exp_end" 
                    type="text" //  Allows free text entry so zeros never get blocked
                    placeholder="YYYY-MM-DD (e.g., 2026-02-20)"
                    className="field-input" 
                  />
                </div>
              </div>
              <div>
                <label className="field-label">What you did</label>
                <textarea name="exp_description" rows={2} className="field-input" />
              </div>
              {experienceRows.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setExperienceRows((rows) => rows.filter((r) => r !== row))
                  }
                  className="text-xs font-medium text-muted hover:text-ink"
                >
                  Remove this role
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
