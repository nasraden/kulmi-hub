import { cx } from "@/lib/utils";

export default function MatchBadge({
  score,
  size = "md",
}: {
  score: number;
  size?: "sm" | "md" | "lg";
}) {
  const tier = score >= 80 ? "high" : score >= 55 ? "mid" : "low";

  const tierClasses = {
    high: "bg-match-light text-match border-match/30",
    mid: "bg-gold-light text-gold border-gold/40",
    low: "bg-ink/5 text-muted border-ink/10",
  }[tier];

  const sizeClasses = {
    sm: "text-[11px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3.5 py-1.5",
  }[size];

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold",
        tierClasses,
        sizeClasses
      )}
    >
      <span
        className={cx(
          "block h-1.5 w-1.5 rounded-full",
          tier === "high" && "bg-[#008291]",
          tier === "mid" && "bg-[#04277c]",
          tier === "low" && "bg-[#f59e0b]",
        )}
      />
      {score}% Match
    </span>
  );
}
