import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MatchBadge from "@/components/MatchBadge";

const solutions = [
  {
    number: "01",
    title: "Kulmi Talent",
    eyebrow: "Talent marketplace",
    description: "Connect businesses with skilled professionals. Discover talent, publish opportunities, and make confident, skills-based hiring decisions.",
    href: "/jobs",
    action: "Explore opportunities",
    icon: "↗",
  },
  {
    number: "02",
    title: "Kulmi Business",
    eyebrow: "Business management",
    description: "Organize the important parts of running a business with practical digital tools for everyday operations and financial management.",
    href: "/signup?role=company",
    action: "For businesses",
    icon: "▦",
  },
  {
    number: "03",
    title: "Kulmi AI",
    eyebrow: "AI & digital transformation",
    description: "Use intelligent technology to simplify work, improve decisions, and unlock new ways to grow.",
    href: "/about",
    action: "Discover our vision",
    icon: "✳",
  },
];

const benefits = [
  ["Practical by design", "Technology shaped around the real needs of entrepreneurs, businesses, and professionals."],
  ["One connected ecosystem", "Talent, business tools, and intelligent technology working together as your needs grow."],
  ["Rooted locally, built to scale", "Starting in Hargeisa, with a vision to serve Somaliland, Somalia, and the wider region."],
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f9fc] text-[#14213d]">
      <Navbar />
      <main>
        <section className="relative isolate">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_20%,rgba(0,130,145,0.14),transparent_42%),radial-gradient(ellipse_at_10%_80%,rgba(4,39,124,0.09),transparent_38%)]" />
          <div className="mx-auto grid max-w-6xl gap-14 px-6 py-20 md:grid-cols-[1.04fr_0.96fr] md:items-center md:py-28">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d8e6eb] bg-white/80 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#007987] shadow-sm">
                <span className="h-2 w-2 rounded-full bg-[#008291]" />
                TECHNOLOGY FOR GROWING BUSINESSES
              </div>
              <h1 className="mt-7 max-w-2xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-[#08245f] sm:text-5xl md:text-6xl">
                Empowering businesses through <span className="text-[#008291]">talent, technology</span> & AI.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 md:text-lg">
                Kulmi Hub brings people, business tools, and intelligent technology together — helping entrepreneurs and growing businesses work smarter and move forward with confidence.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/signup?role=company" className="inline-flex items-center justify-center rounded-lg bg-[#04277c] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/15 transition hover:-translate-y-0.5 hover:bg-[#008291]">
                  Get started with Kulmi <span className="ml-2">→</span>
                </Link>
                <Link href="/jobs" className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-[#12316f] transition hover:border-[#008291] hover:text-[#008291]">
                  Explore opportunities
                </Link>
              </div>
              <p className="mt-7 text-xs font-medium tracking-wide text-slate-500">
                HARGEISA <span className="px-2 text-[#008291]">→</span> SOMALILAND <span className="px-2 text-[#008291]">→</span> SOMALIA <span className="px-2 text-[#008291]">→</span> BEYOND
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-lg">
              <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-[#bce5e5]/60 blur-3xl" />
              <div className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-[#cbd7f5]/70 blur-3xl" />
              <div className="relative rounded-2xl border border-white bg-white p-5 shadow-[0_28px_80px_-35px_rgba(8,36,95,0.35)] sm:p-7">
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">The Kulmi ecosystem</p>
                    <h2 className="mt-1 font-display text-xl font-semibold text-[#08245f]">Everything connected.</h2>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5f5] text-xl text-[#008291]">✳</span>
                </div>
                <div className="mt-5 rounded-xl border border-[#dce6f7] bg-[#f5f8ff] p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e4eafa] text-lg text-[#04277c]">↗</span>
                      <div>
                        <p className="font-semibold text-[#102b68]">Kulmi Talent</p>
                        <p className="text-xs text-slate-500">Find the right people</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-[#04277c]">PEOPLE</span>
                  </div>
                  <div className="mt-4 rounded-lg bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Frontend Developer</p>
                        <p className="mt-0.5 text-xs text-slate-500">Skills-based matching</p>
                      </div>
                      <MatchBadge score={92} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {["React", "TypeScript", "UI/UX"].map((skill) => <span key={skill} className="skill-chip">{skill}</span>)}
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#d9eeee] bg-[#f2fafa] p-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-lg text-[#008291]">▦</span>
                    <p className="mt-3 text-sm font-semibold text-[#075b66]">Kulmi Business</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Organize and grow</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-lg text-[#04277c]">✳</span>
                    <p className="mt-3 text-sm font-semibold text-[#102b68]">Kulmi AI</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Work more intelligently</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <span>One ecosystem. More possibilities.</span>
                  <span className="font-semibold text-[#008291]">KULMI HUB</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#008291]">What we do</p>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-[#08245f] md:text-4xl">Three solutions. <span className="text-[#008291]">One ecosystem.</span></h2>
              <p className="mt-4 text-base leading-7 text-slate-600">Whether you are building a team, running a business, or exploring what technology can do, Kulmi Hub helps you take the next step.</p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {solutions.map((item) => (
                <article key={item.number} className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-[#a8d5d8] hover:shadow-[0_20px_50px_-30px_rgba(8,36,95,0.35)]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-[0.16em] text-slate-400">{item.number}</span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf7f7] text-xl text-[#008291] transition group-hover:bg-[#008291] group-hover:text-white">{item.icon}</span>
                  </div>
                  <p className="mt-7 text-xs font-semibold uppercase tracking-[0.14em] text-[#008291]">{item.eyebrow}</p>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-[#08245f]">{item.title}</h3>
                  <p className="mt-4 flex-1 text-sm leading-7 text-slate-600">{item.description}</p>
                  <Link href={item.href} className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#04277c] transition group-hover:gap-3 group-hover:text-[#008291]">{item.action} <span aria-hidden="true">→</span></Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f2f6fb] py-20 md:py-24">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-[0.8fr_1.2fr] md:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#008291]">How we help</p>
              <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-[#08245f] md:text-4xl">Make progress with the right support.</h2>
              <p className="mt-5 text-sm leading-7 text-slate-600">Growth looks different for every business. Our connected solutions help you access the people and tools that move your work forward.</p>
              <Link href="/about" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#008291] hover:text-[#04277c]">Learn about Kulmi Hub <span>→</span></Link>
            </div>
            <div className="space-y-4">
              {[
                ["01", "Connect with talent", "Discover professionals, publish jobs, and make skills-based hiring decisions."],
                ["02", "Bring your work together", "Use practical business tools to keep important day-to-day information organized."],
                ["03", "Adopt technology with purpose", "Explore AI and automation that solve real problems instead of adding complexity."],
              ].map(([number, title, description]) => (
                <div key={number} className="flex gap-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
                  <span className="font-display text-sm font-semibold text-[#008291]">{number}</span>
                  <div><h3 className="font-display text-lg font-semibold text-[#08245f]">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#008291]">Why Kulmi Hub</p>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-[#08245f] md:text-4xl">Technology should create opportunity.</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">Useful technology should be accessible, understandable, and built around the people and businesses it serves.</p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {benefits.map(([title, description], index) => (
                <div key={title} className="border-t-2 border-[#008291] pt-5">
                  <span className="text-xs font-bold tracking-[0.16em] text-slate-400">0{index + 1}</span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-[#08245f]">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#06266f]">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 md:flex-row md:items-center md:justify-between md:py-20">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#83d3d4]">Start with Kulmi Hub</p>
              <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-white md:text-4xl">Ready to build what comes next?</h2>
              <p className="mt-4 text-sm leading-7 text-blue-100">Join a growing ecosystem connecting talent, businesses, and technology.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-[#04277c] transition hover:bg-[#dff2f2]">Join Kulmi Hub <span className="ml-2">→</span></Link>
              <Link href="/jobs" className="inline-flex items-center justify-center rounded-lg border border-white/40 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">Browse jobs</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
