import { cx } from "@/lib/utils";

/** The distinctive "Kulmi Certify" verified tag shown on badge-holding skills or profiles. */
export default function CertifyBadge({
  label = "Kulmi Certify",
  size = "sm",
}: {
  label?: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full border border-ink/15 bg-[#04277c]/50 font-semibold text-paper",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      )}
    >
      <svg viewBox="0 0 20 20" fill="none" className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"}>
        <path
          d="M10 1.5l2.2 1.9 2.9-.3.6 2.9 2.6 1.5-1.2 2.7 1.2 2.7-2.6 1.5-.6 2.9-2.9-.3L10 18.5l-2.2-1.9-2.9.3-.6-2.9-2.6-1.5 1.2-2.7-1.2-2.7 2.6-1.5.6-2.9 2.9.3L10 1.5z"
          fill="#008291"
        />
        <path
          d="M6.8 10.2l2.1 2.1 4.3-4.3"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </span>
  );
}
