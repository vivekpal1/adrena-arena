import { useState } from "react";
import { TierBadge } from "../components/TierBadge";
import { LeaderboardTable, type LeaderboardEntry } from "../components/LeaderboardTable";

const TIERS = [
  { id: 0, name: "Iron", count: 120 },
  { id: 1, name: "Bronze", count: 45 },
  { id: 2, name: "Silver", count: 22 },
  { id: 3, name: "Gold", count: 10 },
  { id: 4, name: "Diamond", count: 5 },
];

// Mock data for demonstration
const MOCK_ENTRIES: LeaderboardEntry[] = [
  { rank: 1, wallet: "7xKf...3nPq", tier: 1, score: 8420, mutagen: 12.4, pnl: 4230, trades: 67, streak: 14 },
  { rank: 2, wallet: "9mRt...7vBx", tier: 1, score: 7890, mutagen: 11.2, pnl: 3100, trades: 52, streak: 9 },
  { rank: 3, wallet: "3pWk...8dQz", tier: 1, score: 7340, mutagen: 10.8, pnl: 2890, trades: 48, streak: 12 },
  { rank: 4, wallet: "5hNb...2mYr", tier: 1, score: 6920, mutagen: 9.3, pnl: 1847, trades: 41, streak: 7 },
  { rank: 5, wallet: "8jLf...4tKx", tier: 1, score: 6550, mutagen: 8.7, pnl: 1240, trades: 38, streak: 5 },
  { rank: 6, wallet: "2cVp...6wSm", tier: 1, score: 6100, mutagen: 8.1, pnl: 890, trades: 35, streak: 4 },
  { rank: 7, wallet: "6dRq...1nHz", tier: 1, score: 5780, mutagen: 7.6, pnl: 560, trades: 32, streak: 3 },
  { rank: 8, wallet: "4gTx...9sBw", tier: 1, score: 5320, mutagen: 6.9, pnl: -120, trades: 29, streak: 1 },
  { rank: 9, wallet: "1kMz...5pDf", tier: 1, score: 4890, mutagen: 6.2, pnl: -450, trades: 24, streak: 0 },
  { rank: 10, wallet: "0wJr...3qLy", tier: 1, score: 4230, mutagen: 5.1, pnl: -780, trades: 19, streak: 0 },
];

export function Leagues() {
  const [selectedTier, setSelectedTier] = useState(1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Arena Leagues</h2>
        <p className="text-zinc-500 text-sm mt-1">
          Weekly promotion/relegation • Top 20% promotes, bottom 20% relegates
        </p>
      </div>

      {/* Tier Selector */}
      <div className="flex gap-3 flex-wrap">
        {TIERS.map((tier) => (
          <button
            key={tier.id}
            onClick={() => setSelectedTier(tier.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              selectedTier === tier.id
                ? "border-arena-accent bg-arena-accent/10"
                : "border-arena-border hover:border-arena-accent/50"
            }`}
          >
            <TierBadge tier={tier.id} />
            <span className="text-sm text-zinc-400">{tier.count} players</span>
          </button>
        ))}
      </div>

      {/* Promotion/Relegation Zones */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card border-arena-success/30">
          <div className="text-xs text-arena-success uppercase tracking-wider">
            Promotion Zone
          </div>
          <div className="text-2xl font-bold font-mono mt-1">Top 20%</div>
          <div className="text-xs text-zinc-500 mt-1">
            Ranks 1-{Math.ceil(TIERS[selectedTier].count * 0.2)} advance
          </div>
        </div>
        <div className="card">
          <div className="text-xs text-zinc-400 uppercase tracking-wider">
            Safe Zone
          </div>
          <div className="text-2xl font-bold font-mono mt-1">Middle 60%</div>
          <div className="text-xs text-zinc-500 mt-1">
            Maintain current tier
          </div>
        </div>
        <div className="card border-arena-danger/30">
          <div className="text-xs text-arena-danger uppercase tracking-wider">
            Relegation Zone
          </div>
          <div className="text-2xl font-bold font-mono mt-1">Bottom 20%</div>
          <div className="text-xs text-zinc-500 mt-1">
            Ranks {Math.ceil(TIERS[selectedTier].count * 0.8)}+ demoted
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-arena-border flex items-center justify-between">
          <h3 className="font-bold">
            <TierBadge tier={selectedTier} /> Standings
          </h3>
          <span className="text-xs text-zinc-500">Week 3 of 10</span>
        </div>
        <LeaderboardTable entries={MOCK_ENTRIES} />
      </div>

      {/* Scoring Breakdown */}
      <div className="card">
        <h3 className="font-bold mb-3">League Score Formula</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { name: "Mutagen", weight: "40%", color: "text-arena-accent" },
            { name: "Risk-Adjusted PnL", weight: "30%", color: "text-arena-success" },
            { name: "Consistency", weight: "20%", color: "text-arena-warning" },
            { name: "Social", weight: "10%", color: "text-arena-diamond" },
          ].map((component) => (
            <div key={component.name} className="text-center">
              <div className={`text-2xl font-bold font-mono ${component.color}`}>
                {component.weight}
              </div>
              <div className="text-xs text-zinc-500 mt-1">{component.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
