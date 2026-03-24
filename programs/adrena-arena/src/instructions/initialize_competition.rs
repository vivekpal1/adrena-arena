use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
pub struct InitializeCompetition<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + CompetitionState::INIT_SPACE,
        seeds = [COMPETITION_SEED, authority.key().as_ref()],
        bump,
    )]
    pub competition: Account<'info, CompetitionState>,

    /// The ADX token mint
    pub adx_mint: Account<'info, anchor_spl::token::Mint>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitializeCompetition>,
    season: u16,
    crank: Pubkey,
    config: Option<CompetitionConfig>,
) -> Result<()> {
    let competition = &mut ctx.accounts.competition;
    let clock = Clock::get()?;

    competition.version = 1;
    competition.authority = ctx.accounts.authority.key();
    competition.crank = crank;
    competition.season = season;
    competition.week = 1;
    competition.season_start = clock.unix_timestamp;
    competition.week_start = clock.unix_timestamp;
    competition.status = CompetitionStatus::Registration;
    competition.total_players = 0;
    competition.total_agents = 0;
    competition.prize_pool = 0;
    competition.adx_mint = ctx.accounts.adx_mint.key();
    competition.escrow = Pubkey::default(); // Set separately when escrow ATA is created
    competition.config = config.unwrap_or_default();
    competition.bump = ctx.bumps.competition;

    // Validate scoring weights sum to 10000 bps
    let c = &competition.config;
    require!(
        c.weight_mutagen + c.weight_risk_pnl + c.weight_consistency + c.weight_social == 10000,
        crate::errors::ArenaError::InvalidScoringWeights
    );

    emit!(CompetitionInitialized {
        authority: competition.authority,
        season,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

#[event]
pub struct CompetitionInitialized {
    pub authority: Pubkey,
    pub season: u16,
    pub timestamp: i64,
}
