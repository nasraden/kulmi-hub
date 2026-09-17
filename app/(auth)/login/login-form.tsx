"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signIn } from "@/app/actions";

const initialState: { error?: string } = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
      {pending ? "Logging in…" : "Log in"}
    </button>
  );
}

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useFormState(signIn, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="field-label" htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" required className="field-input" />
      </div>
      <div>
        <label className="field-label" htmlFor="password">
          Password
        </label>
        <input id="password" name="password" type="password" required className="field-input" />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
