import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import ResetPasswordForm from "./reset-password-form";

export default async function ResetPasswordPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 text-[#404145]">
        <Navbar />
        <main className="mx-auto max-w-md px-6 py-12">
          <h1 className="font-display text-2xl font-semibold text-ink">Reset link expired</h1>
          <p className="mt-3 text-sm text-muted">
            This password reset link is invalid or has expired. Request a new link to continue.
          </p>
          <Link href="/forgot-password" className="mt-6 inline-block font-medium text-teal-dark hover:underline">
            Request a new reset link
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-[#404145]">
      <Navbar />
      <main className="mx-auto flex w-full max-w-md flex-col px-6 py-12">
        <h1 className="font-display text-2xl font-semibold text-ink">Choose a new password</h1>
        <p className="mt-2 text-sm text-muted">Create a new password for your Kulmi Hub account.</p>
        <ResetPasswordForm />
      </main>
    </div>
  );
}
