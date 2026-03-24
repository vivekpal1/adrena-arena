/**
 * League Scorer — computes the composite LeagueScore from multiple dimensions.
 *
 * LeagueScore = (Mutagen × 0.40) + (RiskAdjustedPnL × 0.30)
 *             + (ConsistencyScore × 0.20) + (SocialScore × 0.10)
 */

export interface LeagueScoreInput {
  /** Total Mutagen earned this week */
  weeklyMutagen: number;
  /** PnL this week (USD) */
  pnl: number;
  /** Maximum drawdown this week (USD, positive) */
  maxDrawdown: number;
  /** Number of active trading days this week (0-7) */
  activeDays: number;
  /** Win rate (0-1) */
  winRate: number;
  /** Number of trades this week */
  tradeCount: number;
  /** Whether player is in a squad */
  inSquad: boolean;
  /** Current streak length (days) */
  streakDays: number;
  /** Quests completed this week (0-1 normalized) */
  questCompletion: number;
}

export interface LeagueScoreResult {
  totalScore: number;
  mutagenComponent: number;
  riskPnlComponent: number;
  consistencyComponent: number;
  socialComponent: number;
}

// Normalization constants (calibrated to expected ranges)
const MUTAGEN_NORM = 10; // Normalize: 10 mutagen/week = max score
const PNL_RATIO_NORM = 5; // Normalize: Calmar ratio of 5 = max score
const TRADE_COUNT_NORM = 50; // Normalize: 50 trades/week = max

/**
 * Risk-Adjusted PnL (Calmar-like ratio).
 * Rewards skill over size: a trader making $1K with $200 drawdown
 * scores higher than one making $2K with $2K drawdown.
 */
function riskAdjustedPnl(pnl: number, maxDrawdown: number): number {
  if (maxDrawdown <= 0) return pnl > 0 ? PNL_RATIO_NORM : 0;
  if (pnl <= 0) return 0;

  const calmar = pnl / maxDrawdown;
  return Math.min(calmar, PNL_RATIO_NORM);
}

/**
 * Consistency score rewards showing up and maintaining discipline.
 * Components: active days, win rate, trade frequency.
 */
function consistencyScore(
  activeDays: number,
  winRate: number,
  tradeCount: number,
): number {
  const daysFraction = activeDays / 7;
  const tradeFraction = Math.min(tradeCount / TRADE_COUNT_NORM, 1);

  // Weighted: 40% days active, 30% win rate, 30% trade frequency
  return daysFraction * 0.4 + winRate * 0.3 + tradeFraction * 0.3;
}

/**
 * Social score rewards community engagement.
 */
function socialScore(
  inSquad: boolean,
  streakDays: number,
  questCompletion: number,
): number {
  const squadBonus = inSquad ? 0.3 : 0;
  const streakBonus = Math.min(streakDays / 30, 1) * 0.4; // 30-day streak = max
  const questBonus = questCompletion * 0.3;

  return squadBonus + streakBonus + questBonus;
}

/**
 * Calculate composite LeagueScore.
 * All components are normalized to [0, 1] then weighted.
 * Final score is multiplied by 10000 for on-chain storage as u64.
 */
export function calculateLeagueScore(input: LeagueScoreInput): LeagueScoreResult {
  // Normalize each component to [0, 1]
  const mutagenNorm = Math.min(input.weeklyMutagen / MUTAGEN_NORM, 1);
  const riskPnlNorm = riskAdjustedPnl(input.pnl, input.maxDrawdown) / PNL_RATIO_NORM;
  const consistencyNorm = consistencyScore(
    input.activeDays,
    input.winRate,
    input.tradeCount,
  );
  const socialNorm = socialScore(
    input.inSquad,
    input.streakDays,
    input.questCompletion,
  );

  // Weighted composite
  const mutagenComponent = mutagenNorm * 0.4;
  const riskPnlComponent = riskPnlNorm * 0.3;
  const consistencyComponent = consistencyNorm * 0.2;
  const socialComponent = socialNorm * 0.1;

  const totalScore =
    mutagenComponent + riskPnlComponent + consistencyComponent + socialComponent;

  // Scale to integer for on-chain storage (0-10000)
  return {
    totalScore: Math.round(totalScore * 10000),
    mutagenComponent: Math.round(mutagenComponent * 10000),
    riskPnlComponent: Math.round(riskPnlComponent * 10000),
    consistencyComponent: Math.round(consistencyComponent * 10000),
    socialComponent: Math.round(socialComponent * 10000),
  };
}

/**
 * Determine championship points based on rank within tier.
 */
export function championshipPoints(rank: number): number {
  if (rank === 1) return 25;
  if (rank === 2) return 20;
  if (rank === 3) return 16;
  if (rank <= 5) return 12;
  if (rank <= 10) return 8;
  if (rank <= 20) return 4;
  return 2;
}

/**
 * Determine tier action based on rank percentile.
 * Top 20% promotes, bottom 20% relegates, middle stays.
 */
export function determineTierAction(
  rank: number,
  totalInTier: number,
): "promote" | "relegate" | "stay" {
  if (totalInTier === 0) return "stay";

  const percentile = rank / totalInTier;

  if (percentile <= 0.2) return "promote";
  if (percentile > 0.8) return "relegate";
  return "stay";
}
