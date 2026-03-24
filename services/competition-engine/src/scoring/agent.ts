/**
 * Agent Scorer — computes AI agent performance metrics.
 *
 * Primary: Sharpe Ratio (50%)
 * Secondary: Max Drawdown (20%), Win Rate (15%), Fee Efficiency (15%)
 */

export interface AgentTradeData {
  pnl: number;
  fees: number;
  volume: number;
  durationSeconds: number;
  timestamp: number;
}

export interface AgentScoreResult {
  totalScore: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  feeEfficiency: number;
  tradeCount: number;
}

/**
 * Calculate Sharpe Ratio from a series of returns.
 * Sharpe = (mean_return - risk_free_rate) / std_dev(returns)
 * Risk-free rate assumed 0 for simplicity.
 */
function calculateSharpeRatio(returns: number[]): number {
  if (returns.length < 2) return 0;

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance =
    returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / (returns.length - 1);
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return mean > 0 ? 3 : 0; // Cap at 3 for zero-vol

  return mean / stdDev;
}

/**
 * Calculate maximum drawdown from cumulative PnL series.
 */
function calculateMaxDrawdown(cumulativePnls: number[]): number {
  let peak = 0;
  let maxDD = 0;

  for (const cumPnl of cumulativePnls) {
    if (cumPnl > peak) peak = cumPnl;
    const dd = peak - cumPnl;
    if (dd > maxDD) maxDD = dd;
  }

  return maxDD;
}

/**
 * Calculate agent score from trade history.
 */
export function calculateAgentScore(trades: AgentTradeData[]): AgentScoreResult {
  if (trades.length === 0) {
    return {
      totalScore: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      winRate: 0,
      feeEfficiency: 0,
      tradeCount: 0,
    };
  }

  // Sort by timestamp
  const sorted = [...trades].sort((a, b) => a.timestamp - b.timestamp);

  // Per-trade returns (net of fees)
  const returns = sorted.map((t) => t.pnl - t.fees);

  // Cumulative PnL series
  let cumulative = 0;
  const cumulativeSeries = sorted.map((t) => {
    cumulative += t.pnl - t.fees;
    return cumulative;
  });

  // Sharpe Ratio
  const sharpeRatio = calculateSharpeRatio(returns);

  // Max Drawdown
  const maxDrawdown = calculateMaxDrawdown(cumulativeSeries);

  // Win Rate
  const wins = returns.filter((r) => r > 0).length;
  const winRate = wins / returns.length;

  // Fee Efficiency: gross PnL / total fees
  const grossPnl = sorted.reduce((sum, t) => sum + Math.max(t.pnl, 0), 0);
  const totalFees = sorted.reduce((sum, t) => sum + t.fees, 0);
  const feeEfficiency = totalFees > 0 ? grossPnl / totalFees : 0;

  // Composite score (normalized)
  // Sharpe: normalize to [-2, 4] → [0, 1]
  const sharpeNorm = Math.max(0, Math.min((sharpeRatio + 2) / 6, 1));
  // MaxDD: lower is better, normalize inversely
  const ddNorm = maxDrawdown > 0 ? Math.max(0, 1 - maxDrawdown / 10000) : 1;
  // WinRate: already [0, 1]
  // FeeEfficiency: normalize to [0, 10] → [0, 1]
  const feeNorm = Math.min(feeEfficiency / 10, 1);

  const totalScore = Math.round(
    (sharpeNorm * 0.5 + ddNorm * 0.2 + winRate * 0.15 + feeNorm * 0.15) * 10000,
  );

  return {
    totalScore,
    sharpeRatio: Math.round(sharpeRatio * 1000) / 1000,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    winRate: Math.round(winRate * 1000) / 1000,
    feeEfficiency: Math.round(feeEfficiency * 100) / 100,
    tradeCount: trades.length,
  };
}
