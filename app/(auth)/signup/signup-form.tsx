"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signUp } from "@/app/actions";

const initialState: { error?: string; success?: string } = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
      {pending ? "Creating account…" : "Create account"}
    </button>
  );
}

// Waxaan u ogolaanay foomka inuu qaato 'role' props-ka ka dhashay badamada sare
export default function SignupForm({ role = "talent" }: { role?: string }) {
  const [state, formAction] = useFormState(signUp, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      {/* 
        CRITICAL FOR DATABASE: 
        Khadkan qarsoon wuxuu database-ka u sheegayaa haddii uu user-ku yahay talent ama company 
      */}
      <input type="hidden" name="role" value={role} />

      <div>
        <label className="field-label" htmlFor="fullName">
          {role === "company" ? "Company name" : "Full name"}
        </label>
        <input 
          id="fullName" 
          name="fullName" 
          required 
          className="field-input" 
          placeholder={role === "company" ? "e.g., Kulmi Tech Solutions" : "Amina Hassan"} 
        />
      </div>
      <div>
        <label className="field-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="field-input"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="field-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="field-input"
          placeholder="At least 6 characters"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-match">{state.success}</p>}
      <SubmitButton />
    </form>
  );
}
