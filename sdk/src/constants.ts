import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

// Program ID (placeholder — update after deployment)
export const PROGRAM_ID = new PublicKey(
  "ArenaXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
);

// Adrena Protocol program ID
export const ADRENA_PROGRAM_ID = new PublicKey(
  "13gDzEXCdocbj8iAiqrScGo47NiSuYENGsRqi3SEAwet",
);

// Fixed-point precision (10^6)
export const PRECISION = new BN(1_000_000);

// Minimum agent stake (100 ADX with 6 decimals)
export const MIN_AGENT_STAKE = new BN(100_000_000);

// Unstake cooldown (7 days in seconds)
export const UNSTAKE_COOLDOWN = 7 * 24 * 60 * 60;

// Tier multipliers (fixed-point * PRECISION)
export const TIER_MULTIPLIERS = {
  Iron: new BN(1_000_000),
  Bronze: new BN(1_250_000),
  Silver: new BN(1_500_000),
  Gold: new BN(2_000_000),
  Diamond: new BN(2_500_000),
} as const;

// Scoring weights (basis points, sum = 10000)
export const DEFAULT_WEIGHTS = {
  mutagen: 4000,
  riskPnl: 3000,
  consistency: 2000,
  social: 1000,
} as const;

// Tier names for display
export const TIER_NAMES = ["Iron", "Bronze", "Silver", "Gold", "Diamond"] as const;

// Achievement bit positions (upper 32 bits reserved for Arena)
export const ACHIEVEMENTS = {
  FIRST_PROMOTION: 32,
  DIAMOND_ASCENT: 33,
  PROMOTION_STREAK: 34,
  RELEGATION_SURVIVOR: 35,
  IRON_CHAMPION: 36,
  DIAMOND_DOMINANCE: 37,
  TOURNAMENT_WINNER: 38,
  SQUAD_LEADER: 39,
  AGENT_MASTER: 40,
  SEASON_VETERAN: 41,
} as const;
