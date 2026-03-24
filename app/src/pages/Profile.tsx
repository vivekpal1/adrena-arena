import { useWallet } from "@solana/wallet-adapter-react";
import { TierBadge } from "../components/TierBadge";
import { Trophy, TrendingUp, Flame, Target, Award } from "lucide-react";

export function Profile() {
  const { publicKey, connected } = useWallet();

  if (!connected || !publicKey) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-4xl mb-4">🔌</div>
          <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
          <p className="text-zinc-500">Connect a Solana wallet to view your profile</p>
        </div>
      </div>
    );
  }

  const wallet = publicKey.toBase58();
  const shortWallet = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="card">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-arena-accent to-arena-diamond flex items-center justify-center text-3xl font-bold">
            {wallet.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-xl font-bold">{shortWallet}</div>
            <div className="flex items-center gap-3 mt-2">
              <TierBadge tier={1} />
              <span className="text-sm text-zinc-500">Season 1 • Joined Week 1</span>
            </div>
            <div className="text-xs text-zinc-500 font-mono mt-1">{wallet}</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-sm text-zinc-500">Active Title</div>
            <div className="text-arena-accent font-bold mt-1">"Rising Star"</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: Trophy, label: "Championship Pts", value: "142", color: "text-arena-accent" },
          { icon: TrendingUp, label: "Season PnL", value: "+$4,230", color: "text-arena-success" },
          { icon: Flame, label: "Best Streak", value: "14 days", color: "text-arena-warning" },
          { icon: Target, label: "Total Mutagen", value: "42.6", color: "text-arena-diamond" },
          { icon: Award, label: "Tournaments Won", value: "1", color: "text-arena-accent" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card">
            <Icon size={16} className={`${color} mb-2`} />
            <div className="text-xs text-zinc-500">{label}</div>
            <div className={`text-xl font-bold font-mono ${color} mt-1`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Season History */}
      <div className="card">
        <h3 className="font-bold mb-4">League History</h3>
        <div className="flex items-end gap-1 h-32">
          {[
            { week: 1, tier: 0, score: 3200 },
            { week: 2, tier: 0, score: 5400 },
            { week: 3, tier: 1, score: 4230 },
          ].map((w) => (
            <div key={w.week} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-arena-accent/30 rounded-t"
                style={{ height: `${(w.score / 6000) * 100}%` }}
              />
              <TierBadge tier={w.tier} />
              <span className="text-xs text-zinc-500">W{w.week}</span>
            </div>
          ))}
          {/* Future weeks */}
          {Array.from({ length: 7 }, (_, i) => (
            <div key={`future-${i}`} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-arena-border/30 rounded-t h-4" />
              <span className="text-xs text-zinc-600">W{i + 4}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="card">
        <h3 className="font-bold mb-4">Achievements</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { name: "Rising Star", desc: "Promoted from Iron to Bronze", unlocked: true },
            { name: "Streak Master", desc: "10-day trading streak", unlocked: true },
            { name: "Tournament Warrior", desc: "Competed in 3 tournaments", unlocked: true },
            { name: "Diamond Ascent", desc: "Reach Diamond tier", unlocked: false },
            { name: "Unstoppable", desc: "Promote 3 weeks in a row", unlocked: false },
            { name: "Agent Master", desc: "Register and win with an AI agent", unlocked: false },
            { name: "Squad Leader", desc: "Lead a squad to top 10", unlocked: false },
            { name: "Arena Overlord", desc: "Win weekly rank #1 in Diamond", unlocked: false },
          ].map((a) => (
            <div
              key={a.name}
              className={`p-3 rounded-lg border ${
                a.unlocked
                  ? "bg-arena-accent/5 border-arena-accent/20"
                  : "bg-arena-bg border-arena-border opacity-40"
              }`}
            >
              <div className={`text-sm font-medium ${a.unlocked ? "text-arena-accent" : "text-zinc-500"}`}>
                {a.name}
              </div>
              <div className="text-xs text-zinc-500 mt-1">{a.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
