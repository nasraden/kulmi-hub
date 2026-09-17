"use client";

import { useFormStatus } from "react-dom";
import { saveCompanyOnboarding } from "@/app/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
      {pending ? "Saving…" : "Save & continue"}
    </button>
  );
}

export default function CompanyOnboardingForm() {
  return (
    <form action={saveCompanyOnboarding} className="mt-8 grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="field-label" htmlFor="companyName">
          Company name
        </label>
        <input id="companyName" name="companyName" required className="field-input" />
      </div>
      <div>
        <label className="field-label" htmlFor="industry">
          Industry
        </label>
        <input id="industry" name="industry" className="field-input" placeholder="Fintech" />
      </div>
      <div>
        <label className="field-label" htmlFor="companySize">
          Company size
        </label>
        <select id="companySize" name="companySize" className="field-input">
          <option value="1-10">1–10</option>
          <option value="11-50">11–50</option>
          <option value="51-200">51–200</option>
          <option value="200+">200+</option>
        </select>
      </div>
      <div>
        <label className="field-label" htmlFor="website">
          Website (optional)
        </label>
        <input id="website" name="website" className="field-input" placeholder="https://…" />
      </div>
      <div>
        <label className="field-label" htmlFor="logoUrl">
          Logo URL (optional)
        </label>
        <input id="logoUrl" name="logoUrl" className="field-input" placeholder="https://…" />
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
        <label className="field-label" htmlFor="description">
          About the company
        </label>
        <textarea id="description" name="description" rows={4} className="field-input" />
      </div>
      <div className="sm:col-span-2">
        <SubmitButton />
      </div>
    </form>
  );
}
