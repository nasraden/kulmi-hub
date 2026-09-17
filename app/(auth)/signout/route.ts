import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const supabase = createClient();

  // 1. Halkaan waxaan ka saaraynaa kalfadhiga (Session) qofka furan
  await supabase.auth.signOut();

  // 2. Markuu ka baxo, si otomaatig ah ugu soo celi bogga hore ee websaydhka
  return NextResponse.redirect(new URL("/", requestUrl.origin));
}