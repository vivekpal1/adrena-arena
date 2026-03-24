import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  TransactionSignature,
  Keypair,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  findCompetitionPDA,
  findPlayerProfilePDA,
  findAgentPDA,
  findSquadPDA,
  findTournamentPDA,
  findBracketPDA,
  findEscrowAuthorityPDA,
} from "./pda.js";
import type {
  PlayerProfile,
  AgentRegistration,
  Squad,
  Tournament,
  TournamentBracket,
  CompetitionState,
  CompetitionConfig,
  RegisterAgentParams,
  CreateTournamentParams,
  StatsUpdate,
  AgentPolicy,
  AgentClass,
} from "./types/index.js";
import { TierAction, TournamentFormat } from "./types/index.js";

/**
 * Client for interacting with the Adrena Arena program.
 *
 * Wraps all program instructions with ergonomic TypeScript methods.
 * Handles PDA derivation, account lookup, and transaction building.
 */
export class AdrenaArenaClient {
  readonly program: Program;
  readonly programId: PublicKey;
  readonly connection: Connection;

  constructor(program: Program) {
    this.program = program;
    this.programId = program.programId;
    this.connection = program.provider.connection;
  }

  // ── PDA Helpers ─────────────────────────────────────────────────

  getCompetitionPDA(authority: PublicKey): [PublicKey, number] {
    return findCompetitionPDA(authority, this.programId);
  }

  getPlayerProfilePDA(player: PublicKey): [PublicKey, number] {
    return findPlayerProfilePDA(player, this.programId);
  }

  getAgentPDA(operator: PublicKey, agentId: number): [PublicKey, number] {
    return findAgentPDA(operator, agentId, this.programId);
  }

  getSquadPDA(name: string): [PublicKey, number] {
    return findSquadPDA(name, this.programId);
  }

  getTournamentPDA(tournamentId: number): [PublicKey, number] {
    return findTournamentPDA(tournamentId, this.programId);
  }

  getBracketPDA(tournamentId: number): [PublicKey, number] {
    return findBracketPDA(tournamentId, this.programId);
  }

  // ── Account Fetchers ────────────────────────────────────────────

  async getCompetition(authority: PublicKey): Promise<CompetitionState> {
    const [pda] = this.getCompetitionPDA(authority);
    return this.program.account.competitionState.fetch(pda) as Promise<CompetitionState>;
  }

  async getPlayerProfile(player: PublicKey): Promise<PlayerProfile> {
    const [pda] = this.getPlayerProfilePDA(player);
    return this.program.account.playerProfile.fetch(pda) as Promise<PlayerProfile>;
  }

  async getAgent(operator: PublicKey, agentId: number): Promise<AgentRegistration> {
    const [pda] = this.getAgentPDA(operator, agentId);
    return this.program.account.agentRegistration.fetch(pda) as Promise<AgentRegistration>;
  }

  async getSquad(name: string): Promise<Squad> {
    const [pda] = this.getSquadPDA(name);
    return this.program.account.squad.fetch(pda) as Promise<Squad>;
  }

  async getTournament(tournamentId: number): Promise<Tournament> {
    const [pda] = this.getTournamentPDA(tournamentId);
    return this.program.account.tournament.fetch(pda) as Promise<Tournament>;
  }

  async getTournamentBracket(tournamentId: number): Promise<TournamentBracket> {
    const [pda] = this.getBracketPDA(tournamentId);
    return this.program.account.tournamentBracket.fetch(pda) as Promise<TournamentBracket>;
  }

  // ── Bulk Fetchers ───────────────────────────────────────────────

  async getAllPlayers(): Promise<PlayerProfile[]> {
    return this.program.account.playerProfile.all() as Promise<any>;
  }

  async getAllAgents(): Promise<AgentRegistration[]> {
    return this.program.account.agentRegistration.all() as Promise<any>;
  }

  async getAllTournaments(): Promise<Tournament[]> {
    return this.program.account.tournament.all() as Promise<any>;
  }

  // ── Competition Management ──────────────────────────────────────

  async initializeCompetition(
    authority: PublicKey,
    season: number,
    crank: PublicKey,
    adxMint: PublicKey,
    config?: CompetitionConfig,
  ): Promise<TransactionSignature> {
    const [competitionPDA] = this.getCompetitionPDA(authority);

    return this.program.methods
      .initializeCompetition(season, crank, config ?? null)
      .accounts({
        authority,
        competition: competitionPDA,
        adxMint,
        systemProgram: PublicKey.default,
      })
      .rpc();
  }

  // ── Player ──────────────────────────────────────────────────────

  async registerPlayer(
    player: PublicKey,
    competitionAuthority: PublicKey,
  ): Promise<TransactionSignature> {
    const [profilePDA] = this.getPlayerProfilePDA(player);
    const [competitionPDA] = this.getCompetitionPDA(competitionAuthority);

    return this.program.methods
      .registerPlayer()
      .accounts({
        player,
        playerProfile: profilePDA,
        competition: competitionPDA,
        systemProgram: PublicKey.default,
      })
      .rpc();
  }

  async updatePlayerStats(
    crank: PublicKey,
    playerOwner: PublicKey,
    competitionAuthority: PublicKey,
    update: StatsUpdate,
  ): Promise<TransactionSignature> {
    const [profilePDA] = this.getPlayerProfilePDA(playerOwner);
    const [competitionPDA] = this.getCompetitionPDA(competitionAuthority);

    return this.program.methods
      .updatePlayerStats(update)
      .accounts({
        crank,
        playerProfile: profilePDA,
        competition: competitionPDA,
      })
      .rpc();
  }

  // ── Leagues ─────────────────────────────────────────────────────

  async promoteRelegate(
    crank: PublicKey,
    playerOwner: PublicKey,
    competitionAuthority: PublicKey,
    action: TierAction,
    championshipPoints: number,
  ): Promise<TransactionSignature> {
    const [profilePDA] = this.getPlayerProfilePDA(playerOwner);
    const [competitionPDA] = this.getCompetitionPDA(competitionAuthority);

    return this.program.methods
      .promoteRelegate({ [TierAction[action].toLowerCase()]: {} }, championshipPoints)
      .accounts({
        crank,
        playerProfile: profilePDA,
        competition: competitionPDA,
      })
      .rpc();
  }

  // ── AI Agents ───────────────────────────────────────────────────

  async registerAgent(
    operator: PublicKey,
    competitionAuthority: PublicKey,
    operatorTokenAccount: PublicKey,
    escrowTokenAccount: PublicKey,
    params: RegisterAgentParams,
  ): Promise<TransactionSignature> {
    const [agentPDA] = this.getAgentPDA(operator, params.agentId);
    const [competitionPDA] = this.getCompetitionPDA(competitionAuthority);

    return this.program.methods
      .registerAgent(
        params.agentId,
        params.agentWallet,
        { [AgentClass[params.agentClass].charAt(0).toLowerCase() + AgentClass[params.agentClass].slice(1)]: {} },
        params.strategyCategory,
        params.policy,
        params.stakeAmount,
      )
      .accounts({
        operator,
        agent: agentPDA,
        competition: competitionPDA,
        operatorTokenAccount,
        escrowTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: PublicKey.default,
      })
      .rpc();
  }

  async stakeOnAgent(
    operator: PublicKey,
    agentPDA: PublicKey,
    operatorTokenAccount: PublicKey,
    escrowTokenAccount: PublicKey,
    amount: BN,
  ): Promise<TransactionSignature> {
    return this.program.methods
      .stakeOnAgent(amount)
      .accounts({
        operator,
        agent: agentPDA,
        operatorTokenAccount,
        escrowTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
  }

  // ── Squads ──────────────────────────────────────────────────────

  async createSquad(
    leader: PublicKey,
    name: string,
  ): Promise<TransactionSignature> {
    const [squadPDA] = this.getSquadPDA(name);
    const [profilePDA] = this.getPlayerProfilePDA(leader);

    return this.program.methods
      .createSquad(name)
      .accounts({
        leader,
        squad: squadPDA,
        playerProfile: profilePDA,
        systemProgram: PublicKey.default,
      })
      .rpc();
  }

  async joinSquad(
    player: PublicKey,
    squadPDA: PublicKey,
  ): Promise<TransactionSignature> {
    const [profilePDA] = this.getPlayerProfilePDA(player);

    return this.program.methods
      .joinSquad()
      .accounts({
        player,
        squad: squadPDA,
        playerProfile: profilePDA,
      })
      .rpc();
  }

  async leaveSquad(
    player: PublicKey,
    squadPDA: PublicKey,
  ): Promise<TransactionSignature> {
    const [profilePDA] = this.getPlayerProfilePDA(player);

    return this.program.methods
      .leaveSquad()
      .accounts({
        player,
        squad: squadPDA,
        playerProfile: profilePDA,
      })
      .rpc();
  }

  // ── Tournaments ─────────────────────────────────────────────────

  async createTournament(
    authority: PublicKey,
    competitionAuthority: PublicKey,
    params: CreateTournamentParams,
  ): Promise<TransactionSignature> {
    const [tournamentPDA] = this.getTournamentPDA(params.tournamentId);
    const [competitionPDA] = this.getCompetitionPDA(competitionAuthority);

    return this.program.methods
      .createTournament(
        params.tournamentId,
        { [TournamentFormat[params.format].charAt(0).toLowerCase() + TournamentFormat[params.format].slice(1)]: {} },
        params.bracketSize,
        params.entryFee,
        params.roundDuration,
        params.registrationDeadline,
        params.allowAgents,
        params.mixedMode,
      )
      .accounts({
        authority,
        tournament: tournamentPDA,
        competition: competitionPDA,
        systemProgram: PublicKey.default,
      })
      .rpc();
  }

  async joinTournament(
    player: PublicKey,
    tournamentId: number,
  ): Promise<TransactionSignature> {
    const [tournamentPDA] = this.getTournamentPDA(tournamentId);
    const [profilePDA] = this.getPlayerProfilePDA(player);

    return this.program.methods
      .joinTournament()
      .accounts({
        player,
        tournament: tournamentPDA,
        playerProfile: profilePDA,
        systemProgram: PublicKey.default,
      })
      .rpc();
  }

  // ── Anti-Gaming ─────────────────────────────────────────────────

  async flagAccount(
    crank: PublicKey,
    playerOwner: PublicKey,
    competitionAuthority: PublicKey,
  ): Promise<TransactionSignature> {
    const [profilePDA] = this.getPlayerProfilePDA(playerOwner);
    const [competitionPDA] = this.getCompetitionPDA(competitionAuthority);

    return this.program.methods
      .flagAccount()
      .accounts({
        crank,
        playerProfile: profilePDA,
        competition: competitionPDA,
      })
      .rpc();
  }

  async disqualifyAccount(
    authority: PublicKey,
    playerOwner: PublicKey,
  ): Promise<TransactionSignature> {
    const [profilePDA] = this.getPlayerProfilePDA(playerOwner);
    const [competitionPDA] = this.getCompetitionPDA(authority);

    return this.program.methods
      .disqualifyAccount()
      .accounts({
        authority,
        playerProfile: profilePDA,
        competition: competitionPDA,
      })
      .rpc();
  }
}
