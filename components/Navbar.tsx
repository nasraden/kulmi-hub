import Link from "next/link";
import Image from "next/image"; 
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";

export default async function Navbar() {
  const supabase = createClient();
  
  // 1. Soo qaad user furan dhanka server-ka
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

  // 2. Links-ka rasmiga ah ee u xiran doorka qofka
  const dashboardHref = role ? `/dashboard/${role}` : "/onboarding/talent";
  const messagesHref = "/messages"; // Jid toos ah si uu 404 u ba'o

  return (
    <nav className="w-full border-b border-gray-200 bg-white sticky top-0 z-50 text-[#404145]">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        
        {/* Qaybta Logo-ga iyo Boggaga Navigation-ka */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/brand/kulmi.png"
              alt="Kulmi Hub Logo"
              width={40} 
              height={7}
              className="object-contain"
              priority
            />
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link href="/jobs" className="hover:text-[#04277c] transition-colors">
              Browse jobs
            </Link>
            {user && (
              <>
                <Link href={dashboardHref} className="hover:text-[#04277c] transition-colors">
                  Dashboard
                </Link>
                <Link href={messagesHref} className="hover:text-[#04277c] transition-colors">
                  Messages
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Qaybta Badamada Shahaadada (Auth Buttons) */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link 
                href={dashboardHref} 
                className="text-sm font-semibold border border-gray-300 bg-white px-4 py-2 rounded-md transition-all shadow-sm hover:bg-gray-50 hidden sm:inline-flex"
              >
                My dashboard
              </Link>
              <form action={signOut}>
                <button 
                  type="submit" 
                  className="text-sm font-semibold text-gray-900 hover:text-red-600 transition-colors"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-[#404145] hover:text-[#04277c] transition-colors">
                Log in
              </Link>
              <Link href="/signup" className="text-sm font-semibold bg-[#04277c] hover:bg-[#008291] text-white px-4 py-2 rounded-md transition-all shadow-sm">
                Join Kulmi Hub
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}
