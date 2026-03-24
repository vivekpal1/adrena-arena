use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::constants::*;
use crate::errors::ArenaError;

/// Add more stake to an agent
#[derive(Accounts)]
pub struct StakeOnAgent<'info> {
    #[account(mut)]
    pub operator: Signer<'info>,

    #[account(
        mut,
        constraint = agent.operator == operator.key() @ ArenaError::Unauthorized,
        constraint = agent.is_active @ ArenaError::AgentAlreadyRegistered,
    )]
    pub agent: Account<'info, AgentRegistration>,

    #[account(
        mut,
        constraint = operator_token_account.owner == operator.key(),
    )]
    pub operator_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn stake_handler(ctx: Context<StakeOnAgent>, amount: u64) -> Result<()> {
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.operator_token_account.to_account_info(),
            to: ctx.accounts.escrow_token_account.to_account_info(),
            authority: ctx.accounts.operator.to_account_info(),
        },
    );
    token::transfer(transfer_ctx, amount)?;

    let agent = &mut ctx.accounts.agent;
    agent.staked_amount = agent
        .staked_amount
        .checked_add(amount)
        .ok_or(ArenaError::ArithmeticOverflow)?;

    Ok(())
}

/// Request unstake (starts cooldown)
#[derive(Accounts)]
pub struct RequestUnstake<'info> {
    pub operator: Signer<'info>,

    #[account(
        mut,
        constraint = agent.operator == operator.key() @ ArenaError::Unauthorized,
    )]
    pub agent: Account<'info, AgentRegistration>,
}

pub fn request_unstake_handler(ctx: Context<RequestUnstake>, amount: u64) -> Result<()> {
    let agent = &mut ctx.accounts.agent;
    let clock = Clock::get()?;

    require!(
        amount <= agent.staked_amount,
        ArenaError::InsufficientStake
    );

    // Must maintain minimum stake if agent is active
    if agent.is_active {
        require!(
            agent.staked_amount.checked_sub(amount).unwrap_or(0) >= MIN_AGENT_STAKE,
            ArenaError::InsufficientStake
        );
    }

    agent.unstake_requested_at = clock.unix_timestamp;
    agent.pending_unstake = amount;

    Ok(())
}

/// Complete unstake after cooldown
#[derive(Accounts)]
pub struct CompleteUnstake<'info> {
    #[account(mut)]
    pub operator: Signer<'info>,

    #[account(
        mut,
        constraint = agent.operator == operator.key() @ ArenaError::Unauthorized,
        constraint = agent.pending_unstake > 0 @ ArenaError::NoRewardsToClaim,
    )]
    pub agent: Account<'info, AgentRegistration>,

    #[account(mut)]
    pub operator_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,

    /// Escrow authority PDA
    /// CHECK: PDA authority for the escrow
    #[account(
        seeds = [ESCROW_SEED],
        bump,
    )]
    pub escrow_authority: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
}

pub fn complete_unstake_handler(ctx: Context<CompleteUnstake>) -> Result<()> {
    let agent = &mut ctx.accounts.agent;
    let clock = Clock::get()?;

    // Check cooldown
    require!(
        clock.unix_timestamp >= agent.unstake_requested_at + UNSTAKE_COOLDOWN_SECONDS,
        ArenaError::UnstakeCooldownNotElapsed
    );

    let amount = agent.pending_unstake;

    // Transfer from escrow back to operator
    let seeds = &[ESCROW_SEED, &[ctx.bumps.escrow_authority]];
    let signer_seeds = &[&seeds[..]];

    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.operator_token_account.to_account_info(),
            authority: ctx.accounts.escrow_authority.to_account_info(),
        },
        signer_seeds,
    );
    token::transfer(transfer_ctx, amount)?;

    agent.staked_amount = agent
        .staked_amount
        .checked_sub(amount)
        .ok_or(ArenaError::ArithmeticOverflow)?;
    agent.pending_unstake = 0;
    agent.unstake_requested_at = 0;

    Ok(())
}

/// Slash agent stake (crank only, for underperformance)
#[derive(Accounts)]
pub struct SlashAgentStake<'info> {
    pub crank: Signer<'info>,

    #[account(
        mut,
        constraint = agent.is_active,
    )]
    pub agent: Account<'info, AgentRegistration>,

    #[account(
        seeds = [COMPETITION_SEED, competition.authority.as_ref()],
        bump = competition.bump,
        constraint = competition.crank == crank.key() @ ArenaError::UnauthorizedCrank,
    )]
    pub competition: Account<'info, CompetitionState>,

    /// Escrow token account - slash amount gets burned or redistributed
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn slash_handler(ctx: Context<SlashAgentStake>, amount: u64) -> Result<()> {
    let agent = &mut ctx.accounts.agent;

    let slash_amount = std::cmp::min(amount, agent.staked_amount);
    agent.staked_amount = agent
        .staked_amount
        .checked_sub(slash_amount)
        .ok_or(ArenaError::ArithmeticOverflow)?;

    // If stake falls below minimum, deactivate agent
    if agent.staked_amount < MIN_AGENT_STAKE {
        agent.is_active = false;
    }

    emit!(AgentSlashed {
        agent_wallet: agent.agent_wallet,
        amount: slash_amount,
        remaining_stake: agent.staked_amount,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

#[event]
pub struct AgentSlashed {
    pub agent_wallet: Pubkey,
    pub amount: u64,
    pub remaining_stake: u64,
    pub timestamp: i64,
}
