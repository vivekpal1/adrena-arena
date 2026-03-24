use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;
use state::*;

declare_id!("ArenaXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

#[program]
pub mod adrena_arena {
    use super::*;

    // ── Competition Management ──────────────────────────────────────

    pub fn initialize_competition(
        ctx: Context<InitializeCompetition>,
        season: u16,
        crank: Pubkey,
        config: Option<CompetitionConfig>,
    ) -> Result<()> {
        instructions::initialize_competition::handler(ctx, season, crank, config)
    }

    // ── Player ──────────────────────────────────────────────────────

    pub fn register_player(ctx: Context<RegisterPlayer>) -> Result<()> {
        instructions::register_player::handler(ctx)
    }

    pub fn update_player_stats(
        ctx: Context<UpdatePlayerStats>,
        update: StatsUpdate,
    ) -> Result<()> {
        instructions::update_player_stats::handler(ctx, update)
    }

    // ── Leagues ─────────────────────────────────────────────────────

    pub fn promote_relegate(
        ctx: Context<PromoteRelegate>,
        action: TierAction,
        championship_points: u32,
    ) -> Result<()> {
        instructions::promote_relegate::handler(ctx, action, championship_points)
    }

    // ── AI Agents ───────────────────────────────────────────────────

    pub fn register_agent(
        ctx: Context<RegisterAgent>,
        agent_id: u32,
        agent_wallet: Pubkey,
        agent_class: AgentClass,
        strategy_category: String,
        policy: AgentPolicy,
        stake_amount: u64,
    ) -> Result<()> {
        instructions::register_agent::handler(
            ctx,
            agent_id,
            agent_wallet,
            agent_class,
            strategy_category,
            policy,
            stake_amount,
        )
    }

    pub fn stake_on_agent(ctx: Context<StakeOnAgent>, amount: u64) -> Result<()> {
        instructions::agent_staking::stake_handler(ctx, amount)
    }

    pub fn request_unstake(ctx: Context<RequestUnstake>, amount: u64) -> Result<()> {
        instructions::agent_staking::request_unstake_handler(ctx, amount)
    }

    pub fn complete_unstake(ctx: Context<CompleteUnstake>) -> Result<()> {
        instructions::agent_staking::complete_unstake_handler(ctx)
    }

    pub fn slash_agent_stake(ctx: Context<SlashAgentStake>, amount: u64) -> Result<()> {
        instructions::agent_staking::slash_handler(ctx, amount)
    }

    // ── Squads ──────────────────────────────────────────────────────

    pub fn create_squad(ctx: Context<CreateSquad>, name: String) -> Result<()> {
        instructions::squad::create_squad_handler(ctx, name)
    }

    pub fn join_squad(ctx: Context<JoinSquad>) -> Result<()> {
        instructions::squad::join_squad_handler(ctx)
    }

    pub fn leave_squad(ctx: Context<LeaveSquad>) -> Result<()> {
        instructions::squad::leave_squad_handler(ctx)
    }

    // ── Tournaments ─────────────────────────────────────────────────

    pub fn create_tournament(
        ctx: Context<CreateTournament>,
        tournament_id: u32,
        format: TournamentFormat,
        bracket_size: u8,
        entry_fee: u64,
        round_duration: i64,
        registration_deadline: i64,
        allow_agents: bool,
        mixed_mode: bool,
    ) -> Result<()> {
        instructions::tournament::create_tournament_handler(
            ctx,
            tournament_id,
            format,
            bracket_size,
            entry_fee,
            round_duration,
            registration_deadline,
            allow_agents,
            mixed_mode,
        )
    }

    pub fn join_tournament(ctx: Context<JoinTournament>) -> Result<()> {
        instructions::tournament::join_tournament_handler(ctx)
    }

    pub fn record_match_result(
        ctx: Context<RecordMatchResult>,
        match_index: u16,
        score_a: i64,
        score_b: i64,
        is_losers_bracket: bool,
    ) -> Result<()> {
        instructions::tournament::record_match_result_handler(
            ctx,
            match_index,
            score_a,
            score_b,
            is_losers_bracket,
        )
    }

    // ── Anti-Gaming ─────────────────────────────────────────────────

    pub fn flag_account(ctx: Context<FlagAccount>) -> Result<()> {
        instructions::anti_gaming::flag_handler(ctx)
    }

    pub fn disqualify_account(ctx: Context<DisqualifyAccount>) -> Result<()> {
        instructions::anti_gaming::disqualify_handler(ctx)
    }
}
