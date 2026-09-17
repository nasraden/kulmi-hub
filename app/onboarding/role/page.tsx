import Navbar from "@/components/Navbar";
import { chooseRole } from "@/app/actions";

export default function ChooseRolePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const chooseTalent = chooseRole.bind(null, "talent");
  const chooseCompany = chooseRole.bind(null, "company");

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">
          How will you use Kulmi Hub?
        </h1>
        <p className="mt-2 text-muted">You can't switch this later, so pick the one that fits.</p>
        {searchParams.error && (
          <div className="mt-6 rounded-sm bg-red-50 px-4 py-3 text-left text-sm font-medium text-red-700">
            {searchParams.error}
          </div>
        )}

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <form action={chooseTalent}>
            <button
              type="submit"
              className="card w-full p-8 text-left transition-colors hover:border-teal"
            >
              <h2 className="font-display text-lg font-semibold text-ink">Join as talent</h2>
              <p className="mt-2 text-sm text-muted">
                List your skills and experience. Get matched to jobs that fit you.
              </p>
            </button>
          </form>
          <form action={chooseCompany}>
            <button
              type="submit"
              className="card w-full p-8 text-left transition-colors hover:border-teal"
            >
              <h2 className="font-display text-lg font-semibold text-ink">Hire talent</h2>
              <p className="mt-2 text-sm text-muted">
                Set up your company profile and post jobs to reach ranked candidates.
              </p>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
