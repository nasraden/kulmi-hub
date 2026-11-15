export default function CompanyVerifiedBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"
      title="Verified company"
      aria-label="Verified company"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
        <path fillRule="evenodd" d="M10 1.75a8.25 8.25 0 1 0 0 16.5 8.25 8.25 0 0 0 0-16.5Zm3.6 6.1a.75.75 0 0 0-1.1-1.02l-3.3 3.55-1.7-1.63a.75.75 0 1 0-1.04 1.08l2.25 2.17a.75.75 0 0 0 1.08-.03l3.82-4.12Z" clipRule="evenodd" />
      </svg>
      Verified
    </span>
  );
}
