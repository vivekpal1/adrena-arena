/**
 * Tournament Bracket Visualizer
 *
 * SVG-based bracket display for single/double elimination tournaments.
 * Designed to be screenshot-friendly for social sharing.
 */

interface BracketMatch {
  playerA: string | null;
  playerB: string | null;
  scoreA: number;
  scoreB: number;
  winner: string | null;
}

interface BracketVisualizerProps {
  matches: BracketMatch[][];  // rounds[round][match]
  tournamentName: string;
}

const MATCH_WIDTH = 200;
const MATCH_HEIGHT = 60;
const MATCH_GAP = 20;
const ROUND_GAP = 60;

function shortenWallet(wallet: string | null): string {
  if (!wallet) return "TBD";
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}

function MatchCard({
  match,
  x,
  y,
}: {
  match: BracketMatch;
  x: number;
  y: number;
}) {
  const aWins = match.winner === match.playerA;
  const bWins = match.winner === match.playerB;
  const decided = match.winner !== null;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Match background */}
      <rect
        width={MATCH_WIDTH}
        height={MATCH_HEIGHT}
        rx={8}
        fill="#12121a"
        stroke={decided ? "#8b5cf6" : "#1e1e2e"}
        strokeWidth={decided ? 2 : 1}
      />

      {/* Player A */}
      <text
        x={12}
        y={22}
        fill={aWins ? "#22c55e" : decided && !aWins ? "#71717a" : "#d4d4d8"}
        fontSize={12}
        fontFamily="monospace"
        fontWeight={aWins ? "bold" : "normal"}
      >
        {shortenWallet(match.playerA)}
      </text>
      <text
        x={MATCH_WIDTH - 12}
        y={22}
        fill={aWins ? "#22c55e" : "#94a3b8"}
        fontSize={12}
        fontFamily="monospace"
        textAnchor="end"
      >
        {match.scoreA.toFixed(0)}
      </text>

      {/* Divider */}
      <line
        x1={8}
        y1={30}
        x2={MATCH_WIDTH - 8}
        y2={30}
        stroke="#1e1e2e"
        strokeWidth={1}
      />

      {/* Player B */}
      <text
        x={12}
        y={48}
        fill={bWins ? "#22c55e" : decided && !bWins ? "#71717a" : "#d4d4d8"}
        fontSize={12}
        fontFamily="monospace"
        fontWeight={bWins ? "bold" : "normal"}
      >
        {shortenWallet(match.playerB)}
      </text>
      <text
        x={MATCH_WIDTH - 12}
        y={48}
        fill={bWins ? "#22c55e" : "#94a3b8"}
        fontSize={12}
        fontFamily="monospace"
        textAnchor="end"
      >
        {match.scoreB.toFixed(0)}
      </text>
    </g>
  );
}

export function BracketVisualizer({ matches, tournamentName }: BracketVisualizerProps) {
  if (matches.length === 0) {
    return (
      <div className="card text-center text-zinc-500 py-12">
        No bracket data available
      </div>
    );
  }

  const totalRounds = matches.length;
  const maxMatchesInRound = matches[0].length;
  const svgWidth = totalRounds * (MATCH_WIDTH + ROUND_GAP) + ROUND_GAP;
  const svgHeight = maxMatchesInRound * (MATCH_HEIGHT + MATCH_GAP) + 80;

  return (
    <div className="card overflow-x-auto">
      <h3 className="text-lg font-bold mb-4">{tournamentName}</h3>
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="min-w-max"
      >
        {/* Round labels */}
        {matches.map((_, roundIdx) => (
          <text
            key={`label-${roundIdx}`}
            x={roundIdx * (MATCH_WIDTH + ROUND_GAP) + ROUND_GAP + MATCH_WIDTH / 2}
            y={20}
            fill="#71717a"
            fontSize={11}
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            {roundIdx === totalRounds - 1
              ? "Final"
              : `Round ${roundIdx + 1}`}
          </text>
        ))}

        {/* Matches */}
        {matches.map((round, roundIdx) => {
          const matchesInRound = round.length;
          const totalHeight = maxMatchesInRound * (MATCH_HEIGHT + MATCH_GAP);
          const spacing = totalHeight / matchesInRound;

          return round.map((match, matchIdx) => {
            const x = roundIdx * (MATCH_WIDTH + ROUND_GAP) + ROUND_GAP;
            const y = 40 + matchIdx * spacing + (spacing - MATCH_HEIGHT) / 2;

            return (
              <MatchCard
                key={`${roundIdx}-${matchIdx}`}
                match={match}
                x={x}
                y={y}
              />
            );
          });
        })}

        {/* Connector lines between rounds */}
        {matches.slice(0, -1).map((round, roundIdx) => {
          const nextRound = matches[roundIdx + 1];
          const totalHeight = maxMatchesInRound * (MATCH_HEIGHT + MATCH_GAP);
          const currentSpacing = totalHeight / round.length;
          const nextSpacing = totalHeight / nextRound.length;

          return round.map((_, matchIdx) => {
            const nextMatchIdx = Math.floor(matchIdx / 2);
            const x1 = roundIdx * (MATCH_WIDTH + ROUND_GAP) + ROUND_GAP + MATCH_WIDTH;
            const y1 = 40 + matchIdx * currentSpacing + (currentSpacing - MATCH_HEIGHT) / 2 + MATCH_HEIGHT / 2;
            const x2 = (roundIdx + 1) * (MATCH_WIDTH + ROUND_GAP) + ROUND_GAP;
            const y2 = 40 + nextMatchIdx * nextSpacing + (nextSpacing - MATCH_HEIGHT) / 2 + MATCH_HEIGHT / 2;

            return (
              <line
                key={`line-${roundIdx}-${matchIdx}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#1e1e2e"
                strokeWidth={1.5}
              />
            );
          });
        })}
      </svg>
    </div>
  );
}
