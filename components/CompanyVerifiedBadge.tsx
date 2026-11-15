import { Check } from "lucide-react";

export default function CompanyVerifiedBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"
      title="Verified company"
      aria-label="Verified company"
    >
      <Check className="h-3.5 w-3.5" aria-hidden="true" />
      Verified
    </span>
  );
}
