use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;
use crate::errors::ArenaError;

#[derive(Accounts)]
pub struct RegisterPlayer<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        init,
        payer = player,
        space = 8 + PlayerProfile::INIT_SPACE,
        seeds = [PLAYER_SEED, player.key().as_ref()],
        bump,
    )]
    pub player_profile: Account<'info, PlayerProfile>,

    #[account(
        mut,
        seeds = [COMPETITION_SEED, competition.authority.as_ref()],
        bump = competition.bump,
        constraint = competition.status == CompetitionStatus::Registration
            || competition.status == CompetitionStatus::Active
            @ ArenaError::CompetitionNotActive,
    )]
    pub competition: Account<'info, CompetitionState>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<RegisterPlayer>) -> Result<()> {
    let profile = &mut ctx.accounts.player_profile;
    let competition = &mut ctx.accounts.competition;
    let clock = Clock::get()?;

    profile.version = 1;
    profile.owner = ctx.accounts.player.key();
    profile.league_tier = LeagueTier::Iron;
    profile.championship_points = 0;
    profile.current_week_mutagen = 0;
    profile.total_mutagen = 0;
    profile.league_score = 0;
    profile.streak_days = 0;
    profile.last_trade_day = 0;
    profile.trades_this_week = 0;
    profile.active_days_this_week = 0;
    profile.pnl_this_week = 0;
    profile.max_drawdown_this_week = 0;
    profile.peak_value_this_week = 0;
    profile.achievements = 0;
    profile.title = String::new();
    profile.squad = None;
    profile.status = PlayerStatus::Active;
    profile.seasons_played = 1;
    profile.best_tier = LeagueTier::Iron;
    profile.total_volume = 0;
    profile.bump = ctx.bumps.player_profile;

    competition.total_players = competition
        .total_players
        .checked_add(1)
        .ok_or(ArenaError::ArithmeticOverflow)?;

    emit!(PlayerRegistered {
        player: ctx.accounts.player.key(),
        season: competition.season,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

#[event]
pub struct PlayerRegistered {
    pub player: Pubkey,
    pub season: u16,
    pub timestamp: i64,
}
