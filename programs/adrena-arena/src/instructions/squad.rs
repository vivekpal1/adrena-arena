use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;
use crate::errors::ArenaError;

/// Create a new squad
#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateSquad<'info> {
    #[account(mut)]
    pub leader: Signer<'info>,

    #[account(
        init,
        payer = leader,
        space = 8 + Squad::INIT_SPACE,
        seeds = [SQUAD_SEED, name.as_bytes()],
        bump,
    )]
    pub squad: Account<'info, Squad>,

    #[account(
        mut,
        seeds = [PLAYER_SEED, leader.key().as_ref()],
        bump = player_profile.bump,
        constraint = player_profile.squad.is_none() @ ArenaError::AlreadyInSquad,
        constraint = player_profile.status == PlayerStatus::Active @ ArenaError::AccountDisqualified,
    )]
    pub player_profile: Account<'info, PlayerProfile>,

    pub system_program: Program<'info, System>,
}

pub fn create_squad_handler(ctx: Context<CreateSquad>, name: String) -> Result<()> {
    let squad = &mut ctx.accounts.squad;
    let profile = &mut ctx.accounts.player_profile;
    let clock = Clock::get()?;

    squad.version = 1;
    squad.leader = ctx.accounts.leader.key();
    squad.name = name;
    squad.members = vec![ctx.accounts.leader.key()];
    squad.weekly_mutagen = 0;
    squad.weekly_score = 0;
    squad.total_mutagen = 0;
    squad.league_tier = LeagueTier::Iron;
    squad.created_at = clock.unix_timestamp;
    squad.bump = ctx.bumps.squad;

    profile.squad = Some(squad.key());

    emit!(SquadCreated {
        leader: ctx.accounts.leader.key(),
        squad: squad.key(),
        name: squad.name.clone(),
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

/// Join an existing squad
#[derive(Accounts)]
pub struct JoinSquad<'info> {
    pub player: Signer<'info>,

    #[account(
        mut,
        constraint = squad.members.len() < MAX_SQUAD_MEMBERS @ ArenaError::SquadFull,
    )]
    pub squad: Account<'info, Squad>,

    #[account(
        mut,
        seeds = [PLAYER_SEED, player.key().as_ref()],
        bump = player_profile.bump,
        constraint = player_profile.squad.is_none() @ ArenaError::AlreadyInSquad,
        constraint = player_profile.status == PlayerStatus::Active @ ArenaError::AccountDisqualified,
    )]
    pub player_profile: Account<'info, PlayerProfile>,
}

pub fn join_squad_handler(ctx: Context<JoinSquad>) -> Result<()> {
    let squad = &mut ctx.accounts.squad;
    let profile = &mut ctx.accounts.player_profile;

    squad.members.push(ctx.accounts.player.key());
    profile.squad = Some(squad.key());

    emit!(SquadMemberJoined {
        player: ctx.accounts.player.key(),
        squad: squad.key(),
        member_count: squad.members.len() as u8,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

/// Leave a squad
#[derive(Accounts)]
pub struct LeaveSquad<'info> {
    pub player: Signer<'info>,

    #[account(
        mut,
        constraint = squad.members.contains(&player.key()) @ ArenaError::NotInSquad,
        constraint = squad.leader != player.key() @ ArenaError::CannotLeaveAsLeader,
    )]
    pub squad: Account<'info, Squad>,

    #[account(
        mut,
        seeds = [PLAYER_SEED, player.key().as_ref()],
        bump = player_profile.bump,
    )]
    pub player_profile: Account<'info, PlayerProfile>,
}

pub fn leave_squad_handler(ctx: Context<LeaveSquad>) -> Result<()> {
    let squad = &mut ctx.accounts.squad;
    let profile = &mut ctx.accounts.player_profile;

    squad.members.retain(|m| *m != ctx.accounts.player.key());
    profile.squad = None;

    Ok(())
}

#[event]
pub struct SquadCreated {
    pub leader: Pubkey,
    pub squad: Pubkey,
    pub name: String,
    pub timestamp: i64,
}

#[event]
pub struct SquadMemberJoined {
    pub player: Pubkey,
    pub squad: Pubkey,
    pub member_count: u8,
    pub timestamp: i64,
}
