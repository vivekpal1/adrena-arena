use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;
use crate::errors::ArenaError;

/// Promote or relegate a player (crank only, called per-player after weekly scoring)
#[derive(Accounts)]
pub struct PromoteRelegate<'info> {
    pub crank: Signer<'info>,

    #[account(
        mut,
        seeds = [PLAYER_SEED, player_profile.owner.as_ref()],
        bump = player_profile.bump,
        constraint = player_profile.status == PlayerStatus::Active
            @ ArenaError::AccountDisqualified,
    )]
    pub player_profile: Account<'info, PlayerProfile>,

    #[account(
        mut,
        seeds = [COMPETITION_SEED, competition.authority.as_ref()],
        bump = competition.bump,
        constraint = competition.crank == crank.key() @ ArenaError::UnauthorizedCrank,
        constraint = competition.status == CompetitionStatus::Active
            @ ArenaError::CompetitionNotActive,
    )]
    pub competition: Account<'info, CompetitionState>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub enum TierAction {
    Promote,
    Relegate,
    Stay,
}

pub fn handler(
    ctx: Context<PromoteRelegate>,
    action: TierAction,
    championship_points_earned: u32,
) -> Result<()> {
    let profile = &mut ctx.accounts.player_profile;
    let clock = Clock::get()?;

    let old_tier = profile.league_tier;

    match action {
        TierAction::Promote => {
            let new_tier = profile
                .league_tier
                .promote()
                .ok_or(ArenaError::InvalidTierTransition)?;
            profile.league_tier = new_tier;
        }
        TierAction::Relegate => {
            let new_tier = profile
                .league_tier
                .relegate()
                .ok_or(ArenaError::InvalidTierTransition)?;
            profile.league_tier = new_tier;
        }
        TierAction::Stay => {}
    }

    // Update best tier
    if profile.league_tier > profile.best_tier {
        profile.best_tier = profile.league_tier;
    }

    // Add championship points
    profile.championship_points = profile
        .championship_points
        .checked_add(championship_points_earned)
        .ok_or(ArenaError::ArithmeticOverflow)?;

    // Reset weekly stats
    profile.current_week_mutagen = 0;
    profile.league_score = 0;
    profile.trades_this_week = 0;
    profile.active_days_this_week = 0;
    profile.pnl_this_week = 0;
    profile.max_drawdown_this_week = 0;
    profile.peak_value_this_week = 0;

    emit!(TierChanged {
        player: profile.owner,
        old_tier,
        new_tier: profile.league_tier,
        championship_points: profile.championship_points,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

#[event]
pub struct TierChanged {
    pub player: Pubkey,
    pub old_tier: LeagueTier,
    pub new_tier: LeagueTier,
    pub championship_points: u32,
    pub timestamp: i64,
}
