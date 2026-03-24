import { TierBadge } from "./TierBadge";

export interface LeaderboardEntry {
  rank: number;
  wallet: string;
  tier: number;
  score: number;
  mutagen: number;
  pnl: number;
  trades: number;
  streak: number;
}

function shortenWallet(wallet: string): string {
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}

function formatPnl(pnl: number): string {
  const prefix = pnl >= 0 ? "+" : "";
  return `${prefix}$${Math.abs(pnl).toLocaleString()}`;
}

export function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-arena-border">
            <th className="text-left py-3 px-4">Rank</th>
            <th className="text-left py-3 px-4">Trader</th>
            <th className="text-left py-3 px-4">Tier</th>
            <th className="text-right py-3 px-4">Score</th>
            <th className="text-right py-3 px-4">Mutagen</th>
            <th className="text-right py-3 px-4">PnL</th>
            <th className="text-right py-3 px-4">Trades</th>
            <th className="text-right py-3 px-4">Streak</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.wallet}
              className="border-b border-arena-border/50 hover:bg-white/[0.02] transition-colors"
            >
              <td className="py-3 px-4">
                <span
                  className={`font-mono font-bold ${
                    entry.rank <= 3 ? "text-arena-accent" : "text-zinc-400"
                  }`}
                >
                  #{entry.rank}
                </span>
              </td>
              <td className="py-3 px-4 font-mono text-zinc-300">
                {shortenWallet(entry.wallet)}
              </td>
              <td className="py-3 px-4">
                <TierBadge tier={entry.tier} />
              </td>
              <td className="py-3 px-4 text-right font-mono">
                {entry.score.toLocaleString()}
              </td>
              <td className="py-3 px-4 text-right font-mono text-arena-accent">
                {entry.mutagen.toFixed(2)}
              </td>
              <td
                className={`py-3 px-4 text-right font-mono ${
                  entry.pnl >= 0 ? "text-arena-success" : "text-arena-danger"
                }`}
              >
                {formatPnl(entry.pnl)}
              </td>
              <td className="py-3 px-4 text-right font-mono text-zinc-400">
                {entry.trades}
              </td>
              <td className="py-3 px-4 text-right">
                <span className="font-mono text-arena-warning">
                  {entry.streak}d 🔥
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
