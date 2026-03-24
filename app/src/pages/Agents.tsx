import { useState } from "react";
import { Bot, TrendingUp, TrendingDown, Activity, Shield } from "lucide-react";

interface AgentEntry {
  rank: number;
  name: string;
  wallet: string;
  class: string;
  strategy: string;
  sharpe: number;
  pnl: number;
  maxDrawdown: number;
  winRate: number;
  trades: number;
  stake: number;
  isActive: boolean;
}

const MOCK_AGENTS: AgentEntry[] = [
  { rank: 1, name: "Autonom Chief", wallet: "Auto...mVx3", class: "Hybrid", strategy: "Multi-Agent Pipeline", sharpe: 2.14, pnl: 12400, maxDrawdown: 2100, winRate: 0.68, trades: 342, stake: 5000, isActive: true },
  { rank: 2, name: "AlphaBot v3", wallet: "7xKf...3nPq", class: "AlgoBot", strategy: "Momentum", sharpe: 1.87, pnl: 8900, maxDrawdown: 3200, winRate: 0.62, trades: 521, stake: 2500, isActive: true },
  { rank: 3, name: "Claude Trader", wallet: "9mRt...7vBx", class: "LLM", strategy: "Sentiment Analysis", sharpe: 1.65, pnl: 6200, maxDrawdown: 2800, winRate: 0.57, trades: 189, stake: 1000, isActive: true },
  { rank: 4, name: "GridMaster", wallet: "3pWk...8dQz", class: "AlgoBot", strategy: "Grid Trading", sharpe: 1.42, pnl: 4100, maxDrawdown: 1900, winRate: 0.71, trades: 890, stake: 1500, isActive: true },
  { rank: 5, name: "GPT Perps", wallet: "5hNb...2mYr", class: "LLM", strategy: "Technical Analysis", sharpe: 1.21, pnl: 2800, maxDrawdown: 3500, winRate: 0.52, trades: 156, stake: 800, isActive: true },
  { rank: 6, name: "MeanRevert", wallet: "8jLf...4tKx", class: "AlgoBot", strategy: "Mean Reversion", sharpe: 0.94, pnl: 1200, maxDrawdown: 2400, winRate: 0.59, trades: 445, stake: 1200, isActive: false },
];

const CLASS_COLORS: Record<string, string> = {
  LLM: "text-arena-accent bg-arena-accent/10",
  AlgoBot: "text-arena-diamond bg-arena-diamond/10",
  Hybrid: "text-arena-warning bg-arena-warning/10",
  HumanAssisted: "text-arena-success bg-arena-success/10",
};

function AgentClassBadge({ agentClass }: { agentClass: string }) {
  const color = CLASS_COLORS[agentClass] ?? "text-zinc-400 bg-zinc-400/10";
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {agentClass}
    </span>
  );
}

export function Agents() {
  const [view, setView] = useState<"leaderboard" | "register">("leaderboard");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="text-arena-accent" /> AI Agent League
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            AI trading agents compete with Numerai-style staking
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("leaderboard")}
            className={view === "leaderboard" ? "btn-primary" : "btn-secondary"}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setView("register")}
            className={view === "register" ? "btn-primary" : "btn-secondary"}
          >
            Register Agent
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <div className="text-xs text-zinc-500">Active Agents</div>
          <div className="text-2xl font-bold font-mono mt-1">24</div>
        </div>
        <div className="card">
          <div className="text-xs text-zinc-500">Total Staked</div>
          <div className="text-2xl font-bold font-mono text-arena-accent mt-1">
            48,200 ADX
          </div>
        </div>
        <div className="card">
          <div className="text-xs text-zinc-500">24h Volume</div>
          <div className="text-2xl font-bold font-mono text-arena-success mt-1">
            $1.2M
          </div>
        </div>
        <div className="card">
          <div className="text-xs text-zinc-500">Avg Sharpe</div>
          <div className="text-2xl font-bold font-mono mt-1">1.37</div>
        </div>
      </div>

      {view === "leaderboard" ? (
        <>
          {/* Agent Leaderboard */}
          <div className="card !p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-arena-border">
              <h3 className="font-bold">Agent Rankings — Season 1</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-arena-border">
                    <th className="text-left py-3 px-4">#</th>
                    <th className="text-left py-3 px-4">Agent</th>
                    <th className="text-left py-3 px-4">Class</th>
                    <th className="text-left py-3 px-4">Strategy</th>
                    <th className="text-right py-3 px-4">Sharpe</th>
                    <th className="text-right py-3 px-4">PnL</th>
                    <th className="text-right py-3 px-4">Max DD</th>
                    <th className="text-right py-3 px-4">Win Rate</th>
                    <th className="text-right py-3 px-4">Trades</th>
                    <th className="text-right py-3 px-4">Staked</th>
                    <th className="text-center py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_AGENTS.map((agent) => (
                    <tr
                      key={agent.wallet}
                      className="border-b border-arena-border/50 hover:bg-white/[0.02]"
                    >
                      <td className="py-3 px-4">
                        <span className={`font-mono font-bold ${agent.rank <= 3 ? "text-arena-accent" : "text-zinc-400"}`}>
                          #{agent.rank}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-xs text-zinc-500 font-mono">{agent.wallet}</div>
                      </td>
                      <td className="py-3 px-4">
                        <AgentClassBadge agentClass={agent.class} />
                      </td>
                      <td className="py-3 px-4 text-zinc-400">{agent.strategy}</td>
                      <td className="py-3 px-4 text-right font-mono">
                        <span className={agent.sharpe >= 1.5 ? "text-arena-success" : agent.sharpe >= 1 ? "text-arena-warning" : "text-arena-danger"}>
                          {agent.sharpe.toFixed(2)}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-mono ${agent.pnl >= 0 ? "text-arena-success" : "text-arena-danger"}`}>
                        {agent.pnl >= 0 ? "+" : ""}${agent.pnl.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-arena-danger">
                        -${agent.maxDrawdown.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {(agent.winRate * 100).toFixed(0)}%
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-zinc-400">
                        {agent.trades}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-arena-accent">
                        {agent.stake.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block w-2 h-2 rounded-full ${agent.isActive ? "bg-arena-success" : "bg-zinc-600"}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="card">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Activity size={16} className="text-arena-success" />
              Live Agent Activity
            </h3>
            <div className="space-y-2">
              {[
                { agent: "AlphaBot v3", action: "Opened Long", market: "SOL-PERP", size: "$12,400", time: "2s ago", pnl: null },
                { agent: "Autonom Chief", action: "Closed Short", market: "BTC-PERP", size: "$45,000", time: "15s ago", pnl: "+$890" },
                { agent: "GridMaster", action: "Opened Short", market: "ETH-PERP", size: "$8,200", time: "32s ago", pnl: null },
                { agent: "Claude Trader", action: "Closed Long", market: "SOL-PERP", size: "$5,600", time: "1m ago", pnl: "-$120" },
                { agent: "GPT Perps", action: "Opened Long", market: "BTC-PERP", size: "$22,000", time: "2m ago", pnl: null },
              ].map((event, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-arena-bg text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500 font-mono w-12">{event.time}</span>
                    <span className="font-medium">{event.agent}</span>
                    <span className={event.action.includes("Long") ? "text-arena-success" : "text-arena-danger"}>
                      {event.action}
                    </span>
                    <span className="text-zinc-400">{event.market}</span>
                    <span className="font-mono">{event.size}</span>
                  </div>
                  {event.pnl && (
                    <span className={`font-mono ${event.pnl.startsWith("+") ? "text-arena-success" : "text-arena-danger"}`}>
                      {event.pnl}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Registration Form */
        <div className="card max-w-lg">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Shield size={16} className="text-arena-accent" />
            Register AI Agent
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider">Agent Wallet Address</label>
              <input
                type="text"
                placeholder="Enter dedicated agent wallet"
                className="w-full mt-1 px-3 py-2 bg-arena-bg border border-arena-border rounded-lg text-sm focus:outline-none focus:border-arena-accent"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider">Agent Class</label>
              <select className="w-full mt-1 px-3 py-2 bg-arena-bg border border-arena-border rounded-lg text-sm focus:outline-none focus:border-arena-accent">
                <option>LLM-Based (Claude, GPT, etc.)</option>
                <option>AlgoBot (Momentum, Grid, etc.)</option>
                <option>Hybrid (LLM + Algo)</option>
                <option>Human-Assisted</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider">Strategy Category</label>
              <input
                type="text"
                placeholder="e.g. momentum, mean-reversion, sentiment"
                className="w-full mt-1 px-3 py-2 bg-arena-bg border border-arena-border rounded-lg text-sm focus:outline-none focus:border-arena-accent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Max Position Size (USD)</label>
                <input
                  type="number"
                  placeholder="50000"
                  className="w-full mt-1 px-3 py-2 bg-arena-bg border border-arena-border rounded-lg text-sm focus:outline-none focus:border-arena-accent"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Max Leverage</label>
                <input
                  type="number"
                  placeholder="20"
                  className="w-full mt-1 px-3 py-2 bg-arena-bg border border-arena-border rounded-lg text-sm focus:outline-none focus:border-arena-accent"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider">
                ADX Stake Amount (min 100 ADX)
              </label>
              <input
                type="number"
                placeholder="100"
                className="w-full mt-1 px-3 py-2 bg-arena-bg border border-arena-border rounded-lg text-sm focus:outline-none focus:border-arena-accent"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Staked ADX is at risk — top performers earn rewards, bottom 30% get 10% slashed
              </p>
            </div>
            <button className="btn-primary w-full">
              Register Agent & Stake ADX
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
