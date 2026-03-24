import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

// ── Enums ────────────────────────────────────────────────────────

export enum CompetitionStatus {
  Registration = 0,
  Active = 1,
  Paused = 2,
  Completed = 3,
}

export enum LeagueTier {
  Iron = 0,
  Bronze = 1,
  Silver = 2,
  Gold = 3,
  Diamond = 4,
}

export enum PlayerStatus {
  Active = 0,
  Flagged = 1,
  Disqualified = 2,
}

export enum AgentClass {
  LlmBased = 0,
  AlgoBot = 1,
  Hybrid = 2,
  HumanAssisted = 3,
}

export enum AgentStatus {
  Active = 0,
  Flagged = 1,
  Suspended = 2,
  Disqualified = 3,
}

export enum TournamentFormat {
  SingleElimination = 0,
  DoubleElimination = 1,
}

export enum TournamentStatus {
  Registration = 0,
  Active = 1,
  Completed = 2,
  Cancelled = 3,
}

export enum MatchStatus {
  Pending = 0,
  Active = 1,
  Completed = 2,
  Bye = 3,
}

export enum TierAction {
  Promote = 0,
  Relegate = 1,
  Stay = 2,
}

// ── Structs ──────────────────────────────────────────────────────

export interface CompetitionConfig {
  weeksPerSeason: number;
  minWeeklyTrades: number;
  minWeeklyActiveDays: number;
  weightMutagen: number;
  weightRiskPnl: number;
  weightConsistency: number;
  weightSocial: number;
  tierMultipliers: BN[];
}

export interface AgentPolicy {
  maxPositionSize: BN;
  maxLeverage: number;
  rateLimitPerMinute: number;
  rwaEnabled: boolean;
}

export interface Match {
  playerA: PublicKey | null;
  playerB: PublicKey | null;
  scoreA: BN;
  scoreB: BN;
  winner: PublicKey | null;
  round: number;
  status: MatchStatus;
}

export interface StatsUpdate {
  mutagenEarned: BN;
  pnl: BN;
  volume: BN;
  tradeCount: number;
  currentPeak: BN;
  currentDrawdown: BN;
  leagueScore: BN;
  activeToday: boolean;
}

// ── Account Types ────────────────────────────────────────────────

export interface CompetitionState {
  version: number;
  authority: PublicKey;
  crank: PublicKey;
  season: number;
  week: number;
  seasonStart: BN;
  weekStart: BN;
  status: CompetitionStatus;
  totalPlayers: number;
  totalAgents: number;
  prizePool: BN;
  adxMint: PublicKey;
  escrow: PublicKey;
  config: CompetitionConfig;
  bump: number;
}

export interface PlayerProfile {
  version: number;
  owner: PublicKey;
  leagueTier: LeagueTier;
  championshipPoints: number;
  currentWeekMutagen: BN;
  totalMutagen: BN;
  leagueScore: BN;
  streakDays: number;
  lastTradeDay: BN;
  tradesThisWeek: number;
  activeDaysThisWeek: number;
  pnlThisWeek: BN;
  maxDrawdownThisWeek: BN;
  peakValueThisWeek: BN;
  achievements: BN;
  title: string;
  squad: PublicKey | null;
  status: PlayerStatus;
  seasonsPlayed: number;
  bestTier: LeagueTier;
  totalVolume: BN;
  bump: number;
}

export interface AgentRegistration {
  version: number;
  operator: PublicKey;
  agentWallet: PublicKey;
  agentClass: AgentClass;
  strategyCategory: string;
  policy: AgentPolicy;
  stakedAmount: BN;
  unstakeRequestedAt: BN;
  pendingUnstake: BN;
  totalCompetitions: number;
  wins: number;
  cumulativePnl: BN;
  sharpeNumerator: BN;
  tradeCount: number;
  maxDrawdown: BN;
  feeEfficiency: BN;
  registeredAt: BN;
  isActive: boolean;
  status: AgentStatus;
  bump: number;
}

export interface Squad {
  version: number;
  leader: PublicKey;
  name: string;
  members: PublicKey[];
  weeklyMutagen: BN;
  weeklyScore: BN;
  totalMutagen: BN;
  leagueTier: LeagueTier;
  createdAt: BN;
  bump: number;
}

export interface Tournament {
  version: number;
  id: number;
  competition: PublicKey;
  format: TournamentFormat;
  bracketSize: number;
  currentRound: number;
  totalRounds: number;
  participants: PublicKey[];
  status: TournamentStatus;
  prizePool: BN;
  entryFee: BN;
  roundStart: BN;
  roundDuration: BN;
  registrationDeadline: BN;
  allowAgents: boolean;
  mixedMode: boolean;
  bump: number;
}

export interface TournamentBracket {
  tournament: PublicKey;
  winnersBracket: Match[];
  losersBracket: Match[];
  bump: number;
}

// ── Params ───────────────────────────────────────────────────────

export interface RegisterAgentParams {
  agentId: number;
  agentWallet: PublicKey;
  agentClass: AgentClass;
  strategyCategory: string;
  policy: AgentPolicy;
  stakeAmount: BN;
}

export interface CreateTournamentParams {
  tournamentId: number;
  format: TournamentFormat;
  bracketSize: number;
  entryFee: BN;
  roundDuration: BN;
  registrationDeadline: BN;
  allowAgents: boolean;
  mixedMode: boolean;
}
