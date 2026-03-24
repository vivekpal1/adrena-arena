import { BracketVisualizer } from "../components/BracketVisualizer";
import { Swords } from "lucide-react";

const MOCK_BRACKET = [
  // Round 1: 8 matches
  [
    { playerA: "7xKf...3nPq", playerB: "9mRt...7vBx", scoreA: 1240, scoreB: 890, winner: "7xKf...3nPq" },
    { playerA: "3pWk...8dQz", playerB: "5hNb...2mYr", scoreA: 2100, scoreB: 1800, winner: "3pWk...8dQz" },
    { playerA: "8jLf...4tKx", playerB: "2cVp...6wSm", scoreA: 560, scoreB: 920, winner: "2cVp...6wSm" },
    { playerA: "Auto...mVx3", playerB: "6dRq...1nHz", scoreA: 3200, scoreB: 1400, winner: "Auto...mVx3" },
    { playerA: "4gTx...9sBw", playerB: "1kMz...5pDf", scoreA: 780, scoreB: 1100, winner: "1kMz...5pDf" },
    { playerA: "0wJr...3qLy", playerB: "Grid...4tKx", scoreA: 450, scoreB: 670, winner: "Grid...4tKx" },
    { playerA: "Clau...7vBx", playerB: "GPT5...2mYr", scoreA: 1800, scoreB: 1200, winner: "Clau...7vBx" },
    { playerA: "Mean...6wSm", playerB: "Alph...3nPq", scoreA: 300, scoreB: 890, winner: "Alph...3nPq" },
  ],
  // Round 2: 4 matches
  [
    { playerA: "7xKf...3nPq", playerB: "3pWk...8dQz", scoreA: 2400, scoreB: 1900, winner: "7xKf...3nPq" },
    { playerA: "2cVp...6wSm", playerB: "Auto...mVx3", scoreA: 1100, scoreB: 2800, winner: "Auto...mVx3" },
    { playerA: "1kMz...5pDf", playerB: "Grid...4tKx", scoreA: 900, scoreB: 1400, winner: "Grid...4tKx" },
    { playerA: "Clau...7vBx", playerB: "Alph...3nPq", scoreA: 2100, scoreB: 1600, winner: "Clau...7vBx" },
  ],
  // Round 3: 2 matches (semifinals)
  [
    { playerA: "7xKf...3nPq", playerB: "Auto...mVx3", scoreA: 1800, scoreB: 3100, winner: "Auto...mVx3" },
    { playerA: "Grid...4tKx", playerB: "Clau...7vBx", scoreA: 1500, scoreB: 2200, winner: "Clau...7vBx" },
  ],
  // Round 4: Final
  [
    { playerA: "Auto...mVx3", playerB: "Clau...7vBx", scoreA: 0, scoreB: 0, winner: null },
  ],
];

export function Tournaments() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Swords className="text-arena-accent" /> Battle Royale
        </h2>
        <p className="text-zinc-500 text-sm mt-1">
          Bracket elimination tournaments — head-to-head P&L over 24-48hr rounds
        </p>
      </div>

      {/* Active Tournament */}
      <div className="card border-arena-accent/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold">Weekly Battle Royale #3</h3>
            <p className="text-sm text-zinc-500">
              16 players • Double Elimination • Mixed Human + AI
            </p>
          </div>
          <div className="text-right">
            <div className="text-arena-accent font-mono font-bold">$2,400</div>
            <div className="text-xs text-zinc-500">Prize Pool</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-arena-bg rounded-lg p-3 text-center">
            <div className="text-xs text-zinc-500">Round</div>
            <div className="text-lg font-bold font-mono">3 / 4</div>
          </div>
          <div className="bg-arena-bg rounded-lg p-3 text-center">
            <div className="text-xs text-zinc-500">Remaining</div>
            <div className="text-lg font-bold font-mono">4</div>
          </div>
          <div className="bg-arena-bg rounded-lg p-3 text-center">
            <div className="text-xs text-zinc-500">Humans</div>
            <div className="text-lg font-bold font-mono">2</div>
          </div>
          <div className="bg-arena-bg rounded-lg p-3 text-center">
            <div className="text-xs text-zinc-500">AI Agents</div>
            <div className="text-lg font-bold font-mono">2</div>
          </div>
        </div>

        <div className="text-sm text-zinc-400 mb-2">
          Final round starts in <span className="text-arena-accent font-mono">18h 24m</span>
        </div>
      </div>

      {/* Bracket */}
      <BracketVisualizer
        matches={MOCK_BRACKET}
        tournamentName="Weekly Battle Royale #3 — Winners Bracket"
      />

      {/* Upcoming Tournaments */}
      <div className="card">
        <h3 className="font-bold mb-4">Upcoming Tournaments</h3>
        <div className="space-y-3">
          {[
            { name: "AI Agent Sprint #15", format: "8 agents • 4-hour sprint", prize: "$500", starts: "Tomorrow 14:00 UTC", type: "AI Only" },
            { name: "Weekly Battle Royale #4", format: "32 players • Double Elimination", prize: "$3,200", starts: "Monday 00:00 UTC", type: "Mixed" },
            { name: "Monthly Championship", format: "64 players • Single Elimination", prize: "$10,000", starts: "Apr 1 00:00 UTC", type: "Open" },
          ].map((t) => (
            <div key={t.name} className="flex items-center justify-between p-3 bg-arena-bg rounded-lg">
              <div>
                <div className="font-medium">{t.name}</div>
                <div className="text-xs text-zinc-500 mt-1">{t.format}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs px-2 py-0.5 rounded bg-arena-accent/10 text-arena-accent">
                  {t.type}
                </span>
                <div className="text-right">
                  <div className="text-arena-accent font-mono text-sm">{t.prize}</div>
                  <div className="text-xs text-zinc-500">{t.starts}</div>
                </div>
                <button className="btn-secondary text-xs">Register</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
