import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";

const navGroups = [
  {
    label: "Hire talent",
    links: [
      { label: "Post a job", href: "/jobs/new", description: "Find the right people for your business" },
      { label: "Business services", href: "/services", description: "Explore solutions for your business" },
    ],
  },
  {
    label: "Get outcomes",
    links: [
      { label: "Explore solutions", href: "/services", description: "See how Kulmi Hub helps businesses grow" },
      { label: "How it works", href: "/about", description: "Discover the Kulmi Hub approach" },
    ],
  },
  {
    label: "Find work",
    links: [
      { label: "Browse jobs", href: "/jobs", description: "Explore available opportunities" },
      { label: "Join as talent", href: "/signup?role=talent", description: "Create your professional profile" },
    ],
  },
  {
    label: "Why Kulmi Hub",
    links: [
      { label: "About Kulmi Hub", href: "/about", description: "Learn about our mission" },
      { label: "Contact us", href: "/contact", description: "Talk to our team" },
    ],
  },
];

function ChevronDown() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180">
      <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    role = profile?.role ?? null;
  }

  const dashboardHref = role ? `/dashboard/${role}` : "/onboarding/role";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white text-[#404145] shadow-sm">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 xl:px-8">
        <div className="flex min-w-0 items-center gap-5 xl:gap-7">
          <Link href="/" aria-label="Kulmi Hub homepage" className="flex shrink-0 items-center">
            <Image
              src="/brand/kulmi.png"
              alt="Kulmi Hub"
              width={48}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          <div className="hidden items-center gap-4 lg:flex xl:gap-6">
            {navGroups.map((group) => (
              <div key={group.label} className="group relative flex h-[76px] items-center">
                <button
                  type="button"
                  aria-haspopup="true"
                  className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-[#404145] transition-colors hover:text-[#008291] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008291] focus-visible:ring-offset-4"
                >
                  {group.label}
                  <ChevronDown />
                </button>

                <div className="invisible absolute left-0 top-[calc(100%-1px)] z-50 w-72 translate-y-2 rounded-xl border border-gray-100 bg-white p-2 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  {group.links.map((item) => (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      className="block rounded-lg px-4 py-3 transition-colors hover:bg-[#f2f8f8] focus-visible:bg-[#f2f8f8] focus-visible:outline-none"
                    >
                      <span className="block text-sm font-semibold text-[#252525]">{item.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-gray-500">{item.description}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 xl:gap-4">
          {user ? (
            <>
              <Link
                href={dashboardHref}
                className="hidden rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold shadow-sm transition-colors hover:bg-gray-50 sm:inline-flex"
              >
                My dashboard
              </Link>
              <Link
                href="/messages"
                className="hidden text-sm font-semibold transition-colors hover:text-[#008291] xl:inline-flex"
              >
                Messages
              </Link>
              <form action={signOut}>
                <button type="submit" className="text-sm font-semibold text-gray-900 transition-colors hover:text-red-600">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-[#404145] transition-colors hover:text-[#008291]">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-[#008291] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#006d78] xl:px-4"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
