/**
 * Mutagen Calculator — replicates Adrena's off-chain Mutagen formula
 * for competition-specific scoring.
 *
 * BaseMutagen = (TradePerformance + TradeDuration) × SizeMultiplier
 * FinalMutagen = BaseMutagen × TierMultiplier
 */

export interface TradeInput {
  pnl: number; // USD, signed
  volume: number; // USD, position close size
  durationSeconds: number;
  fees: number; // USD
  tier: number; // 0-4 (Iron-Diamond)
}

const TIER_MULTIPLIERS = [1.0, 1.25, 1.5, 2.0, 2.5];

/**
 * PnL-to-Volume ratio scoring (0.01 - 0.3 mutagen)
 * Ratio range: 0.1% - 7.5% → linear interpolation
 */
function tradePerformanceScore(pnl: number, volume: number): number {
  if (volume <= 0 || pnl <= 0) return 0;

  const ratio = (pnl / volume) * 100; // percentage
  if (ratio < 0.1) return 0;
  if (ratio > 7.5) return 0.3; // capped

  // Linear interpolation: 0.1% → 0.01, 7.5% → 0.3
  return 0.01 + ((ratio - 0.1) / (7.5 - 0.1)) * (0.3 - 0.01);
}

/**
 * Trade duration scoring (0 - 0.05 mutagen)
 * Range: 10 seconds - 72 hours
 */
function tradeDurationScore(durationSeconds: number): number {
  if (durationSeconds < 10) return 0;
  if (durationSeconds > 72 * 3600) return 0.05;

  const maxDuration = 72 * 3600;
  return (Math.min(durationSeconds, maxDuration) / maxDuration) * 0.05;
}

/**
 * Size multiplier based on position close size (USD)
 */
function sizeMultiplier(volume: number): number {
  if (volume < 10) return 0;
  if (volume < 100) return 0.00025 + ((volume - 10) / 90) * (0.005 - 0.00025);
  if (volume < 1_000) return 0.005 + ((volume - 100) / 900) * (0.05 - 0.005);
  if (volume < 5_000) return 0.05 + ((volume - 1_000) / 4_000) * (0.5 - 0.05);
  if (volume < 50_000) return 0.5 + ((volume - 5_000) / 45_000) * (5 - 0.5);
  if (volume < 500_000) return 5 + ((volume - 50_000) / 450_000) * (20 - 5);
  if (volume < 1_000_000) return 20 + ((volume - 500_000) / 500_000) * (30 - 20);
  if (volume < 4_500_000) return 30 + ((volume - 1_000_000) / 3_500_000) * (45 - 30);
  return 45;
}

/**
 * Calculate Mutagen for a single trade.
 * Returns fee-inclusive Mutagen (fees deducted from PnL before scoring).
 */
export function calculateMutagen(trade: TradeInput): number {
  // Fee-inclusive: deduct fees from PnL
  const netPnl = trade.pnl - trade.fees;

  // Minimum hold time: 60 seconds (Arena rule, stricter than Adrena's 10s)
  if (trade.durationSeconds < 60) return 0;

  // Minimum position size
  if (trade.volume < 100) return 0;

  const performance = tradePerformanceScore(netPnl, trade.volume);
  const duration = tradeDurationScore(trade.durationSeconds);
  const size = sizeMultiplier(trade.volume);
  const tierMult = TIER_MULTIPLIERS[trade.tier] ?? 1.0;

  const baseMutagen = (performance + duration) * size;

  // Cap per trade: 0.5 mutagen max (prevents single trade domination)
  const cappedMutagen = Math.min(baseMutagen, 0.5);

  return cappedMutagen * tierMult;
}

/**
 * Calculate total Mutagen for a batch of trades.
 */
export function calculateBatchMutagen(trades: TradeInput[]): number {
  return trades.reduce((sum, trade) => sum + calculateMutagen(trade), 0);
}
