import Link from "next/link";
import Navbar from "@/components/Navbar";
import ForgotPasswordForm from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-[#404145]">
      <Navbar />
      <main className="mx-auto flex w-full max-w-md flex-col px-6 py-12">
        <h1 className="font-display text-2xl font-semibold text-ink">Reset your password</h1>
        <p className="mt-2 text-sm text-muted">
          Enter the email address connected to your Kulmi Hub account. We&apos;ll send you a secure reset link.
        </p>
        <ForgotPasswordForm />
        <p className="mt-6 text-sm text-muted">
          Remembered your password?{" "}
          <Link href="/login" className="font-medium text-teal-dark hover:underline">Back to login</Link>
        </p>
      </main>
    </div>
  );
}
