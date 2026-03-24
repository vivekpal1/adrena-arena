const TIER_CONFIG = [
  { name: "Iron", class: "tier-iron", icon: "⚔️" },
  { name: "Bronze", class: "tier-bronze", icon: "🥉" },
  { name: "Silver", class: "tier-silver", icon: "🥈" },
  { name: "Gold", class: "tier-gold", icon: "🥇" },
  { name: "Diamond", class: "tier-diamond", icon: "💎" },
] as const;

export function TierBadge({ tier }: { tier: number }) {
  const config = TIER_CONFIG[tier] ?? TIER_CONFIG[0];

  return (
    <span className={`tier-badge ${config.class}`}>
      {config.icon} {config.name}
    </span>
  );
}
