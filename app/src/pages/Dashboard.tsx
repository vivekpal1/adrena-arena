import { Trophy, TrendingUp, Flame, Users } from "lucide-react";
import { TierBadge } from "../components/TierBadge";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: typeof Trophy;
  color: string;
}) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <div className="text-xs text-zinc-500 uppercase tracking-wider">{label}</div>
        <div className="text-xl font-bold font-mono mt-0.5">{value}</div>
      </div>
    </div>
  );
}

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-zinc-500 text-sm mt-1">Season 1 • Week 3 of 10</p>
      </div>

      {/* Your Status */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-zinc-500">Your League Position</div>
            <div className="flex items-center gap-3 mt-2">
              <TierBadge tier={1} />
              <span className="text-zinc-400">Rank #12 of 45</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-zinc-500">Promotion Zone</div>
            <div className="text-arena-success text-sm font-medium mt-2">
              Top 20% — Promoting to Silver
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="League Score"
          value="4,230"
          icon={Trophy}
          color="bg-arena-accent/10 text-arena-accent"
        />
        <StatCard
          label="Weekly PnL"
          value="+$1,847"
          icon={TrendingUp}
          color="bg-arena-success/10 text-arena-success"
        />
        <StatCard
          label="Streak"
          value="12 days"
          icon={Flame}
          color="bg-arena-warning/10 text-arena-warning"
        />
        <StatCard
          label="Mutagen"
          value="6.42"
          icon={Users}
          color="bg-arena-diamond/10 text-arena-diamond"
        />
      </div>

      {/* Active Tournaments */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4">Active Tournaments</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-arena-bg rounded-lg">
            <div>
              <div className="font-medium">Weekly Battle Royale #3</div>
              <div className="text-xs text-zinc-500 mt-1">
                32 players • Double Elimination • Round 2
              </div>
            </div>
            <div className="text-right">
              <div className="text-arena-accent font-mono text-sm">$2,400 Prize Pool</div>
              <div className="text-xs text-zinc-500 mt-1">18h remaining</div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-arena-bg rounded-lg">
            <div>
              <div className="font-medium">AI Agent Sprint #14</div>
              <div className="text-xs text-zinc-500 mt-1">
                8 agents • 4-hour sprint • Mixed human+AI
              </div>
            </div>
            <div className="text-right">
              <div className="text-arena-accent font-mono text-sm">$500 Prize Pool</div>
              <div className="text-xs text-zinc-500 mt-1">2h remaining</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4">Recent Achievements</h3>
        <div className="flex gap-3 flex-wrap">
          {[
            { name: "Rising Star", desc: "Promoted from Iron to Bronze" },
            { name: "Streak Master", desc: "10-day trading streak" },
            { name: "Tournament Warrior", desc: "Competed in 3 tournaments" },
          ].map((achievement) => (
            <div
              key={achievement.name}
              className="px-4 py-2 bg-arena-accent/10 border border-arena-accent/20 rounded-lg"
            >
              <div className="text-sm font-medium text-arena-accent">
                {achievement.name}
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">
                {achievement.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
