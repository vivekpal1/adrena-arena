/**
 * Sybil Detector
 *
 * Detects multiple accounts controlled by the same entity:
 * 1. Funding source clustering (common SOL origins)
 * 2. Behavioral correlation (timing, size, direction patterns)
 * 3. Temporal correlation (trades within seconds of each other)
 */

export interface WalletProfile {
  walletAddress: string;
  fundingSources: string[]; // Wallets that funded this wallet
  tradeTimes: number[]; // Timestamps of trades
  tradeSizes: number[]; // Position sizes
  tradeDirections: ("long" | "short")[]; // Trade sides
}

export interface SybilCluster {
  wallets: string[];
  confidence: number; // 0-1
  evidence: {
    sharedFunding: boolean;
    behavioralCorrelation: number;
    temporalCorrelation: number;
  };
}

export interface SybilResult {
  walletAddress: string;
  sybilScore: number; // 0-1, higher = more likely sybil
  clusters: SybilCluster[];
}

/**
 * Pearson correlation coefficient between two arrays.
 */
function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 3) return 0;

  const xs = x.slice(0, n);
  const ys = y.slice(0, n);

  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const den = Math.sqrt(denX * denY);
  return den === 0 ? 0 : num / den;
}

/**
 * Check if two wallets share funding sources.
 */
function hasSharedFunding(a: WalletProfile, b: WalletProfile): boolean {
  const setA = new Set(a.fundingSources);
  return b.fundingSources.some((f) => setA.has(f));
}

/**
 * Calculate temporal correlation: how often do two wallets trade
 * within a short window of each other?
 */
function temporalCorrelation(
  timesA: number[],
  timesB: number[],
  windowSeconds: number = 30,
): number {
  if (timesA.length === 0 || timesB.length === 0) return 0;

  let coincidences = 0;
  let j = 0;

  const sortedA = [...timesA].sort((a, b) => a - b);
  const sortedB = [...timesB].sort((a, b) => a - b);

  for (const ta of sortedA) {
    while (j < sortedB.length && sortedB[j] < ta - windowSeconds) j++;

    let k = j;
    while (k < sortedB.length && sortedB[k] <= ta + windowSeconds) {
      coincidences++;
      k++;
    }
  }

  const maxPossible = Math.min(sortedA.length, sortedB.length);
  return maxPossible > 0 ? coincidences / maxPossible : 0;
}

/**
 * Detect sybil clusters from a set of wallet profiles.
 */
export function detectSybilClusters(
  profiles: WalletProfile[],
): Map<string, SybilResult> {
  const results = new Map<string, SybilResult>();

  // Initialize results
  for (const profile of profiles) {
    results.set(profile.walletAddress, {
      walletAddress: profile.walletAddress,
      sybilScore: 0,
      clusters: [],
    });
  }

  // Pairwise comparison
  for (let i = 0; i < profiles.length; i++) {
    for (let j = i + 1; j < profiles.length; j++) {
      const a = profiles[i];
      const b = profiles[j];

      // 1. Shared funding
      const sharedFunding = hasSharedFunding(a, b);

      // 2. Behavioral correlation (trade size patterns)
      const sizeCorrelation = Math.abs(
        pearsonCorrelation(a.tradeSizes, b.tradeSizes),
      );

      // 3. Temporal correlation
      const tempCorr = temporalCorrelation(a.tradeTimes, b.tradeTimes);

      // Composite confidence
      const fundingWeight = sharedFunding ? 0.5 : 0;
      const behavioralWeight = sizeCorrelation * 0.25;
      const temporalWeight = tempCorr * 0.25;
      const confidence = fundingWeight + behavioralWeight + temporalWeight;

      if (confidence >= 0.4) {
        const cluster: SybilCluster = {
          wallets: [a.walletAddress, b.walletAddress],
          confidence: Math.round(confidence * 1000) / 1000,
          evidence: {
            sharedFunding,
            behavioralCorrelation: Math.round(sizeCorrelation * 1000) / 1000,
            temporalCorrelation: Math.round(tempCorr * 1000) / 1000,
          },
        };

        // Add cluster to both wallets
        const resultA = results.get(a.walletAddress)!;
        const resultB = results.get(b.walletAddress)!;
        resultA.clusters.push(cluster);
        resultB.clusters.push(cluster);

        // Update sybil scores (take max cluster confidence)
        resultA.sybilScore = Math.max(resultA.sybilScore, confidence);
        resultB.sybilScore = Math.max(resultB.sybilScore, confidence);
      }
    }
  }

  return results;
}
