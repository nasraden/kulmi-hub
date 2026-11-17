"use client";

import { useFormState, useFormStatus } from "react-dom";
import { requestPasswordReset } from "@/app/actions";

const initialState: { error?: string; success?: string } = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
      {pending ? "Sending link…" : "Send reset link"}
    </button>
  );
}

export default function ForgotPasswordForm() {
  const [state, formAction] = useFormState(requestPasswordReset, initialState);
  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label className="field-label" htmlFor="reset-email">Email</label>
        <input id="reset-email" name="email" type="email" required autoComplete="email"
          className="field-input" placeholder="you@example.com" />
      </div>
      {state?.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p role="status" className="text-sm text-match">{state.success}</p>}
      <SubmitButton />
    </form>
  );
}
