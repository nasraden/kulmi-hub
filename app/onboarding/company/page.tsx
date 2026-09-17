import Navbar from "@/components/Navbar";
import CompanyOnboardingForm from "./company-form";

export default function CompanyOnboardingPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-display text-2xl font-semibold text-ink">Set up your company</h1>
        <p className="mt-2 text-muted">
          This appears on every job you post. You can post your first job right after.
        </p>
        {searchParams.error && (
          <div className="mt-4 rounded-sm bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {searchParams.error}
          </div>
        )}
        <CompanyOnboardingForm />
      </div>
    </div>
  );
}
