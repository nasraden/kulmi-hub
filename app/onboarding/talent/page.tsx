

import Navbar from "@/components/Navbar";
import TalentOnboardingForm from "./talent-form";

export default function TalentOnboardingPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-display text-2xl font-semibold text-ink">Build your profile</h1>
        <p className="mt-2 text-muted">
          This is what companies see. Be specific about skills — that's what drives your match score.
        </p>
        {searchParams?.error && (
          <div className="mt-4 rounded-sm bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {searchParams.error}
          </div>
        )}
        <TalentOnboardingForm />
      </div>
    </div>
  );
}

