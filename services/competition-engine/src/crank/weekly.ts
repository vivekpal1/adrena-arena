/**
 * Weekly Crank Job
 *
 * Runs every Monday 00:00 UTC:
 * 1. Calculate final league standings per tier
 * 2. Determine promotions/relegations
 * 3. Award championship points
 * 4. Submit on-chain updates
 * 5. Reset weekly stats
 */

import {
  calculateLeagueScore,
  championshipPoints,
  determineTierAction,
} from "../scoring/index.js";
import type { LeaderboardService } from "../leaderboard/redis.js";

export interface WeeklyCrankConfig {
  season: number;
  week: number;
  tiers: number; // 5 tiers (0-4)
}

export interface PromotionResult {
  wallet: string;
  currentTier: number;
  action: "promote" | "relegate" | "stay";
  championshipPoints: number;
  rank: number;
}

/**
 * Process weekly crank for all tiers.
 * Returns promotion/relegation decisions for on-chain submission.
 */
export async function processWeeklyCrank(
  leaderboard: LeaderboardService,
  config: WeeklyCrankConfig,
): Promise<PromotionResult[]> {
  const results: PromotionResult[] = [];

  for (let tier = 0; tier < config.tiers; tier++) {
    const tierCount = await leaderboard.getTierCount(
      config.season,
      config.week,
      tier,
    );

    if (tierCount === 0) continue;

    // Get all players in this tier, ranked by score
    const rankings = await leaderboard.getLeagueRankings(
      config.season,
      config.week,
      tier,
      0,
      tierCount,
    );

    for (const { wallet, rank } of rankings) {
      const action = determineTierAction(rank, tierCount);
      const points = championshipPoints(rank);

      // Diamond can't promote — give bonus points instead
      if (tier === 4 && action === "promote") {
        results.push({
          wallet,
          currentTier: tier,
          action: "stay",
          championshipPoints: points + 5, // Diamond bonus
          rank,
        });
      }
      // Iron can't relegate
      else if (tier === 0 && action === "relegate") {
        results.push({
          wallet,
          currentTier: tier,
          action: "stay",
          championshipPoints: 0, // Bottom Iron gets nothing
          rank,
        });
      } else {
        results.push({
          wallet,
          currentTier: tier,
          action,
          championshipPoints: points,
          rank,
        });
      }
    }
  }

  return results;
}

/**
 * Generate summary stats for the weekly crank.
 */
export function crankSummary(results: PromotionResult[]): {
  totalPlayers: number;
  promotions: number;
  relegations: number;
  stays: number;
  perTier: Record<number, { count: number; promotions: number; relegations: number }>;
} {
  const perTier: Record<number, { count: number; promotions: number; relegations: number }> = {};

  let promotions = 0;
  let relegations = 0;
  let stays = 0;

  for (const r of results) {
    if (!perTier[r.currentTier]) {
      perTier[r.currentTier] = { count: 0, promotions: 0, relegations: 0 };
    }
    perTier[r.currentTier].count++;

    if (r.action === "promote") {
      promotions++;
      perTier[r.currentTier].promotions++;
    } else if (r.action === "relegate") {
      relegations++;
      perTier[r.currentTier].relegations++;
    } else {
      stays++;
    }
  }

  return {
    totalPlayers: results.length,
    promotions,
    relegations,
    stays,
    perTier,
  };
}
