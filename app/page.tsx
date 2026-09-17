import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MatchBadge from "@/components/MatchBadge";
import CertifyBadge from "@/components/CertifyBadge";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* HERO */}
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-28">
        <div>

          <h1 className="mt-3 max-w-lg font-display text-4xl font-semibold leading-[1.08] text-[#04277c] md:text-5xl">
            Hire smarter. Work faster. Grow better.
          </h1>
          <p className="mt-6 max-w-md text-lg text-[#008291]">
            Kulmi Hub matches SMEs, startups, and NGOs with skilled professionals
            by what people can actually do — AI-ranked, Kulmi Certify-verified,
            and built to expand from Hargeisa across the Horn of Africa and the
            global Somali diaspora.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/signup?role=company" className="btn-primary">
              Find verified talent
            </Link>
            <Link href="/signup?role=talent" className="btn-secondary">
              Join as a professional
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted">
            Hargeisa → Somaliland → Somalia → East Africa → the diaspora.
          </p>
        </div>

        {/* Hero visual: an illustrative match card, the app's core primitive */}
        <div className="relative">
          <div className="card p-6 shadow-[0_20px_60px_-25px_rgba(11,30,61,0.25)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Frontend Developer · Freelance
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <h3 className="font-display text-lg font-semibold text-[#008291]">
                    Amina Hassan
                  </h3>
                  <CertifyBadge size="sm" />
                </div>
              </div>
              <MatchBadge score={92} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["React", "TypeScript", "Tailwind CSS", "Figma"].map((skill) => (
                <span key={skill} className="skill-chip">
                  {skill}
                </span>
              ))}
            </div>
            <div className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-[#008291]">Skill overlap</span>
                <span className="font-medium text-ink">4 / 4 required</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#008291]">Based in</span>
                <span className="font-medium text-ink">Hargeisa</span>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 hidden rounded-md border border-line bg-white px-4 py-3 text-sm shadow-sm md:block">
            <span className="font-semibold text-ink">3 candidates</span>
            <span className="text-[#008291]"> shortlisted this week</span>
          </div>
        </div>
      </section>

     {/* HOW IT WORKS — genuinely sequential, so numbering earns its place */}
<section className="border-t border-line bg-white">
  <div className="mx-auto max-w-6xl px-6 py-20">
    <h2 className="font-display text-2xl font-semibold text-[#04277c] md:text-3xl">
      From posting to hire, in three steps
    </h2>
    <div className="mt-12 grid gap-10 md:grid-cols-3">
      {[
        {
          n: "1",
          title: "Build a real profile",
          body: "Talent list their skills, rates, and experience, and can request a Kulmi Certify badge to verify their strongest skills. Companies describe the role and the skills it actually needs.",
        },
        {
          n: "2",
          title: "See the AI match score",
          body: "Kulmi Hub weighs skill overlap, Kulmi Certify verification, experience, location, and rate compatibility into one transparent percentage — shown to both sides.",
        },
        {
          n: "3",
          title: "Shortlist and hire",
          body: "Companies sort applicants by match score, save standouts to a talent pool, message the strongest fits, and mark the role as hired.",
        },
      ].map((step) => (
        <div key={step.n}>
          {/* Waxaan u beddelnay text-white iyo font-bold si uu nambarku u cadaado */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#04277c] font-display text-sm font-bold text-white shadow-sm">
            {step.n}
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold text-[#04277c]">
            {step.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
        </div>
      ))}
    </div>
  </div>
</section>


      {/* CORE VALUES */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-2xl font-semibold text-[#04277c] md:text-3xl">
          What Kulmi Hub is built on
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {[
            ["Opportunity", "Merit-based hiring — no favoritism, no nepotism."],
            ["Innovation", "AI-powered matching in place of manual, word-of-mouth hiring."],
            ["Trust", "Verified profiles and a transparent hiring workflow, end to end."],
            ["Empowerment", "Professionals own their skills story and how it's presented."],
            ["Inclusivity", "Built for local SMEs and talent the traditional market overlooks."],
          ].map(([title, body]) => (
            <div key={title}>
              <h3 className="font-display text-base font-semibold text-[#04277c]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOR TALENT / FOR COMPANIES */}
      <section className="mx-auto grid max-w-6xl gap-8 px-6 pb-20 md:grid-cols-2">
        <div className="card p-8">
          <h3 className="font-display text-xl font-semibold text-[#04277c]">For professionals</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Set your rate and availability once. Request a Kulmi Certify badge on
            your strongest skills — verified skills carry full weight in every
            match score, so companies see your fit before you even apply.
          </p>
          <Link
            href="/signup?role=talent"
            className="mt-6 inline-block text-sm font-medium text-teal-dark hover:underline"
          >
            Create a talent profile
          </Link>
        </div>
        <div className="card p-8">
          <h3 className="font-display text-xl font-semibold text-[#04277c]">For companies</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Post a role with the skills it needs. Applicants arrive AI-ranked by
            fit, and standouts can be saved straight to your company talent pool
            for the next opening — not just this one.
          </p>
          <Link
            href="/signup?role=company"
            className="mt-6 inline-block text-sm font-medium text-teal-dark hover:underline"
          >
            Post your first job
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
