"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { updatePassword } from "@/app/actions";

const initialState: { error?: string; success?: string } = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
      {pending ? "Updating password…" : "Update password"}
    </button>
  );
}

export default function ResetPasswordForm() {
  const [state, formAction] = useFormState(updatePassword, initialState);
  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label className="field-label" htmlFor="new-password">New password</label>
        <input id="new-password" name="password" type="password" required minLength={6}
          autoComplete="new-password" className="field-input" />
      </div>
      <div>
        <label className="field-label" htmlFor="confirm-password">Confirm new password</label>
        <input id="confirm-password" name="confirmPassword" type="password" required minLength={6}
          autoComplete="new-password" className="field-input" />
      </div>
      {state?.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      {state?.success && (
        <div role="status" className="space-y-3 text-sm text-match">
          <p>{state.success}</p>
          <Link href="/login" className="inline-block font-medium text-teal-dark hover:underline">
            Go to login
          </Link>
        </div>
      )}
      {!state?.success && <SubmitButton />}
    </form>
  );
}
