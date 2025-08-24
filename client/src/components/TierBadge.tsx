interface TierBadgeProps {
  tier: number;
  size?: "sm" | "md";
}

export default function TierBadge({ tier, size = "sm" }: TierBadgeProps) {
  const getTierClass = (tier: number) => {
    switch (tier) {
      case 1: return "tier-1";
      case 2: return "tier-2";
      case 3: return "tier-3";
      case 4: return "tier-4";
      case 5: return "tier-5";
      default: return "tier-3";
    }
  };

  const sizeClass = size === "sm" ? "text-xs px-2 py-1" : "text-sm px-3 py-1";

  return (
    <span className={`${getTierClass(tier)} ${sizeClass} rounded font-medium`} data-testid={`tier-badge-${tier}`}>
      Tier {tier}
    </span>
  );
}
