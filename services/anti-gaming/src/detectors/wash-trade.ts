/**
 * Wash Trade Detector
 *
 * Detects patterns consistent with wash trading:
 * 1. OI-to-Volume ratio below threshold
 * 2. Net-zero position cycles within time windows
 * 3. Rapid open/close patterns
 */

export interface TradeRecord {
  walletAddress: string;
  market: string;
  side: "long" | "short";
  size: number;
  pnl: number;
  fees: number;
  durationSeconds: number;
  timestamp: number;
}

export interface WashTradeResult {
  walletAddress: string;
  isWashTrading: boolean;
  score: number; // 0-1, higher = more suspicious
  evidence: {
    oiVolumeRatio: number;
    netZeroCycles: number;
    rapidTrades: number;
    avgDuration: number;
  };
}

const OI_VOLUME_THRESHOLD = 0.2; // Flag if < 20%
const RAPID_TRADE_THRESHOLD = 120; // 2 minutes
const NET_ZERO_WINDOW = 3600; // 1 hour window for cycle detection
const NET_ZERO_TOLERANCE = 0.01; // 1% tolerance for "net zero"

/**
 * Detect wash trading patterns for a given wallet's trades.
 */
export function detectWashTrading(
  trades: TradeRecord[],
  walletAddress: string,
): WashTradeResult {
  const walletTrades = trades.filter((t) => t.walletAddress === walletAddress);

  if (walletTrades.length < 5) {
    return {
      walletAddress,
      isWashTrading: false,
      score: 0,
      evidence: { oiVolumeRatio: 1, netZeroCycles: 0, rapidTrades: 0, avgDuration: 0 },
    };
  }

  // 1. OI-to-Volume ratio
  const totalVolume = walletTrades.reduce((sum, t) => sum + t.size, 0);
  const netOI = Math.abs(
    walletTrades.reduce((sum, t) => {
      return sum + (t.side === "long" ? t.size : -t.size);
    }, 0),
  );
  const oiVolumeRatio = totalVolume > 0 ? netOI / totalVolume : 0;

  // 2. Net-zero position cycles
  let netZeroCycles = 0;
  const sorted = [...walletTrades].sort((a, b) => a.timestamp - b.timestamp);

  for (let i = 0; i < sorted.length; i++) {
    let runningNet = 0;
    for (let j = i; j < sorted.length; j++) {
      if (sorted[j].timestamp - sorted[i].timestamp > NET_ZERO_WINDOW) break;

      runningNet += sorted[j].side === "long" ? sorted[j].size : -sorted[j].size;

      if (j > i && Math.abs(runningNet) / sorted[i].size < NET_ZERO_TOLERANCE) {
        netZeroCycles++;
        break;
      }
    }
  }

  // 3. Rapid open/close patterns
  const rapidTrades = walletTrades.filter(
    (t) => t.durationSeconds < RAPID_TRADE_THRESHOLD,
  ).length;

  // 4. Average duration
  const avgDuration =
    walletTrades.reduce((sum, t) => sum + t.durationSeconds, 0) / walletTrades.length;

  // Composite score (0-1)
  const oiScore = oiVolumeRatio < OI_VOLUME_THRESHOLD ? 0.4 : 0;
  const cycleScore = Math.min(netZeroCycles / walletTrades.length, 1) * 0.3;
  const rapidScore = Math.min(rapidTrades / walletTrades.length, 1) * 0.2;
  const durationScore = avgDuration < 300 ? 0.1 : 0; // < 5 min average

  const score = oiScore + cycleScore + rapidScore + durationScore;

  return {
    walletAddress,
    isWashTrading: score >= 0.5,
    score: Math.round(score * 1000) / 1000,
    evidence: {
      oiVolumeRatio: Math.round(oiVolumeRatio * 1000) / 1000,
      netZeroCycles,
      rapidTrades,
      avgDuration: Math.round(avgDuration),
    },
  };
}
