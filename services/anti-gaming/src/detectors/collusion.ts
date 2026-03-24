/**
 * Collusion Detector
 *
 * Detects coordinated trading between accounts where one
 * intentionally loses to inflate another's PnL.
 *
 * Key signal: statistically significant inverse P&L correlation
 * between two accounts on the same markets/timeframes.
 */

export interface AccountPnlSeries {
  walletAddress: string;
  /** Per-trade PnL entries with timestamps */
  entries: { timestamp: number; market: string; pnl: number }[];
}

export interface CollusionResult {
  accountA: string;
  accountB: string;
  isColluding: boolean;
  confidence: number; // 0-1
  evidence: {
    inversePnlCorrelation: number;
    counterTradeCount: number;
    sharedMarketOverlap: number;
  };
}

/**
 * Detect collusion between pairs of accounts.
 */
export function detectCollusion(
  accounts: AccountPnlSeries[],
): CollusionResult[] {
  const results: CollusionResult[] = [];

  for (let i = 0; i < accounts.length; i++) {
    for (let j = i + 1; j < accounts.length; j++) {
      const a = accounts[i];
      const b = accounts[j];

      const result = analyzeAccountPair(a, b);
      if (result.confidence >= 0.3) {
        results.push(result);
      }
    }
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}

function analyzeAccountPair(
  a: AccountPnlSeries,
  b: AccountPnlSeries,
): CollusionResult {
  // Find overlapping time windows (within 5 minutes)
  const WINDOW = 300; // 5 minutes

  // 1. Market overlap: how many of the same markets do they trade?
  const marketsA = new Set(a.entries.map((e) => e.market));
  const marketsB = new Set(b.entries.map((e) => e.market));
  const sharedMarkets = [...marketsA].filter((m) => marketsB.has(m));
  const sharedMarketOverlap =
    sharedMarkets.length / Math.max(marketsA.size, marketsB.size, 1);

  // 2. Counter-trade detection: trades on the same market within 5 min
  // where one has positive PnL and other has negative
  let counterTradeCount = 0;
  let matchedPairs = 0;
  const pairedPnlA: number[] = [];
  const pairedPnlB: number[] = [];

  for (const entryA of a.entries) {
    for (const entryB of b.entries) {
      if (
        entryA.market === entryB.market &&
        Math.abs(entryA.timestamp - entryB.timestamp) <= WINDOW
      ) {
        matchedPairs++;
        pairedPnlA.push(entryA.pnl);
        pairedPnlB.push(entryB.pnl);

        // One wins, other loses → suspicious
        if (
          (entryA.pnl > 0 && entryB.pnl < 0) ||
          (entryA.pnl < 0 && entryB.pnl > 0)
        ) {
          counterTradeCount++;
        }
      }
    }
  }

  // 3. Inverse PnL correlation
  let inversePnlCorrelation = 0;
  if (pairedPnlA.length >= 3) {
    const n = pairedPnlA.length;
    const meanA = pairedPnlA.reduce((a, b) => a + b, 0) / n;
    const meanB = pairedPnlB.reduce((a, b) => a + b, 0) / n;

    let num = 0;
    let denA = 0;
    let denB = 0;

    for (let k = 0; k < n; k++) {
      const da = pairedPnlA[k] - meanA;
      const db = pairedPnlB[k] - meanB;
      num += da * db;
      denA += da * da;
      denB += db * db;
    }

    const den = Math.sqrt(denA * denB);
    inversePnlCorrelation = den === 0 ? 0 : -(num / den); // Negate: we want inverse
  }

  // Composite confidence
  const counterTradeRate =
    matchedPairs > 0 ? counterTradeCount / matchedPairs : 0;
  const confidence =
    inversePnlCorrelation * 0.4 +
    counterTradeRate * 0.3 +
    sharedMarketOverlap * 0.3;

  return {
    accountA: a.walletAddress,
    accountB: b.walletAddress,
    isColluding: confidence >= 0.6,
    confidence: Math.max(0, Math.round(confidence * 1000) / 1000),
    evidence: {
      inversePnlCorrelation: Math.round(inversePnlCorrelation * 1000) / 1000,
      counterTradeCount,
      sharedMarketOverlap: Math.round(sharedMarketOverlap * 1000) / 1000,
    },
  };
}
