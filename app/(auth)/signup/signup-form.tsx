"use client";

import { useState } from "react";
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

function PasswordVisibilityButton({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-[#04277c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-r-md"
      aria-label={visible ? "Hide password" : "Show password"}
      aria-pressed={visible}
    >
      {visible ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.2-2.4 3.4M6.2 6.2C3.9 7.7 2.8 10 2.5 12c1 2.5 4.5 7 9.5 7 1.3 0 2.5-.3 3.6-.8" />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );
}

// Waxaan u ogolaanay foomka inuu qaato 'role' props-ka ka dhashay badamada sare
export default function SignupForm({ role = "talent" }: { role?: string }) {
  const [state, formAction] = useFormState(signUp, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      {/* CRITICAL FOR DATABASE: role-ka qarsoon wuxuu ilaaliyaa talent/company signup-ka */}
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
          autoComplete="name"
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
          autoComplete="email"
        />
      </div>
      <div>
        <label className="field-label" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            className="field-input pr-12"
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />
          <PasswordVisibilityButton visible={showPassword} onToggle={() => setShowPassword((visible) => !visible)} />
        </div>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-match">{state.success}</p>}
      <SubmitButton />
    </form>
  );
}
