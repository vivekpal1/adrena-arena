use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;
use crate::errors::ArenaError;

#[derive(Accounts)]
pub struct UpdatePlayerStats<'info> {
    /// Only the authorized crank can update stats
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
        seeds = [COMPETITION_SEED, competition.authority.as_ref()],
        bump = competition.bump,
        constraint = competition.crank == crank.key()
            @ ArenaError::UnauthorizedCrank,
        constraint = competition.status == CompetitionStatus::Active
            @ ArenaError::CompetitionNotActive,
    )]
    pub competition: Account<'info, CompetitionState>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct StatsUpdate {
    /// Mutagen earned from this batch of trades
    pub mutagen_earned: u64,
    /// PnL from trades (signed)
    pub pnl: i64,
    /// Volume traded
    pub volume: u64,
    /// Number of trades
    pub trade_count: u16,
    /// Current portfolio peak (for drawdown tracking)
    pub current_peak: u64,
    /// Current drawdown from peak
    pub current_drawdown: u64,
    /// League score (composite, computed off-chain)
    pub league_score: u64,
    /// Whether the player was active today
    pub active_today: bool,
}

pub fn handler(ctx: Context<UpdatePlayerStats>, update: StatsUpdate) -> Result<()> {
    let profile = &mut ctx.accounts.player_profile;
    let clock = Clock::get()?;

    // Update Mutagen
    profile.current_week_mutagen = profile
        .current_week_mutagen
        .checked_add(update.mutagen_earned)
        .ok_or(ArenaError::ArithmeticOverflow)?;
    profile.total_mutagen = profile
        .total_mutagen
        .checked_add(update.mutagen_earned)
        .ok_or(ArenaError::ArithmeticOverflow)?;

    // Update PnL
    profile.pnl_this_week = profile
        .pnl_this_week
        .checked_add(update.pnl)
        .ok_or(ArenaError::ArithmeticOverflow)?;

    // Update volume
    profile.total_volume = profile
        .total_volume
        .checked_add(update.volume)
        .ok_or(ArenaError::ArithmeticOverflow)?;

    // Update trade count
    profile.trades_this_week = profile
        .trades_this_week
        .checked_add(update.trade_count)
        .ok_or(ArenaError::ArithmeticOverflow)?;

    // Update drawdown tracking
    if update.current_peak > profile.peak_value_this_week {
        profile.peak_value_this_week = update.current_peak;
    }
    if update.current_drawdown > profile.max_drawdown_this_week {
        profile.max_drawdown_this_week = update.current_drawdown;
    }

    // Update league score
    profile.league_score = update.league_score;

    // Update streak and active days
    if update.active_today {
        let today = clock.unix_timestamp / 86400;
        let last_day = profile.last_trade_day / 86400;

        if today != last_day {
            profile.active_days_this_week = profile
                .active_days_this_week
                .checked_add(1)
                .ok_or(ArenaError::ArithmeticOverflow)?;

            if today == last_day + 1 {
                // Consecutive day
                profile.streak_days = profile
                    .streak_days
                    .checked_add(1)
                    .ok_or(ArenaError::ArithmeticOverflow)?;
            } else if today > last_day + 1 && last_day > 0 {
                // Streak broken
                profile.streak_days = 1;
            } else if last_day == 0 {
                // First ever trade day
                profile.streak_days = 1;
            }

            profile.last_trade_day = clock.unix_timestamp;
        }
    }

    emit!(PlayerStatsUpdated {
        player: profile.owner,
        mutagen_earned: update.mutagen_earned,
        league_score: update.league_score,
        trades: update.trade_count,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

#[event]
pub struct PlayerStatsUpdated {
    pub player: Pubkey,
    pub mutagen_earned: u64,
    pub league_score: u64,
    pub trades: u16,
    pub timestamp: i64,
}
