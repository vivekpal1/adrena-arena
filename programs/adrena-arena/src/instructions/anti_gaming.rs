use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;
use crate::errors::ArenaError;

/// Flag an account for anti-gaming investigation
#[derive(Accounts)]
pub struct FlagAccount<'info> {
    pub crank: Signer<'info>,

    #[account(
        mut,
        seeds = [PLAYER_SEED, player_profile.owner.as_ref()],
        bump = player_profile.bump,
    )]
    pub player_profile: Account<'info, PlayerProfile>,

    #[account(
        seeds = [COMPETITION_SEED, competition.authority.as_ref()],
        bump = competition.bump,
        constraint = competition.crank == crank.key() @ ArenaError::UnauthorizedCrank,
    )]
    pub competition: Account<'info, CompetitionState>,
}

pub fn flag_handler(ctx: Context<FlagAccount>) -> Result<()> {
    let profile = &mut ctx.accounts.player_profile;
    profile.status = PlayerStatus::Flagged;

    emit!(AccountFlagged {
        player: profile.owner,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

/// Disqualify an account (authority only — more severe than flag)
#[derive(Accounts)]
pub struct DisqualifyAccount<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [PLAYER_SEED, player_profile.owner.as_ref()],
        bump = player_profile.bump,
    )]
    pub player_profile: Account<'info, PlayerProfile>,

    #[account(
        seeds = [COMPETITION_SEED, competition.authority.as_ref()],
        bump = competition.bump,
        constraint = competition.authority == authority.key() @ ArenaError::Unauthorized,
    )]
    pub competition: Account<'info, CompetitionState>,
}

pub fn disqualify_handler(ctx: Context<DisqualifyAccount>) -> Result<()> {
    let profile = &mut ctx.accounts.player_profile;
    profile.status = PlayerStatus::Disqualified;

    // Zero out all scores — rewards clawback
    profile.current_week_mutagen = 0;
    profile.total_mutagen = 0;
    profile.championship_points = 0;
    profile.league_score = 0;

    emit!(AccountDisqualified {
        player: profile.owner,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

#[event]
pub struct AccountFlagged {
    pub player: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct AccountDisqualified {
    pub player: Pubkey,
    pub timestamp: i64,
}
