use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::constants::*;
use crate::errors::ArenaError;

#[derive(Accounts)]
#[instruction(agent_id: u32)]
pub struct RegisterAgent<'info> {
    #[account(mut)]
    pub operator: Signer<'info>,

    #[account(
        init,
        payer = operator,
        space = 8 + AgentRegistration::INIT_SPACE,
        seeds = [AGENT_SEED, operator.key().as_ref(), &agent_id.to_le_bytes()],
        bump,
    )]
    pub agent: Account<'info, AgentRegistration>,

    #[account(
        mut,
        seeds = [COMPETITION_SEED, competition.authority.as_ref()],
        bump = competition.bump,
    )]
    pub competition: Account<'info, CompetitionState>,

    /// Operator's ADX token account (source of stake)
    #[account(
        mut,
        constraint = operator_token_account.owner == operator.key(),
        constraint = operator_token_account.mint == competition.adx_mint,
    )]
    pub operator_token_account: Account<'info, TokenAccount>,

    /// Escrow token account for staked ADX
    #[account(
        mut,
        constraint = escrow_token_account.mint == competition.adx_mint,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<RegisterAgent>,
    agent_id: u32,
    agent_wallet: Pubkey,
    agent_class: AgentClass,
    strategy_category: String,
    policy: AgentPolicy,
    stake_amount: u64,
) -> Result<()> {
    require!(
        stake_amount >= MIN_AGENT_STAKE,
        ArenaError::InsufficientStake
    );
    require!(
        strategy_category.len() <= MAX_STRATEGY_LEN,
        ArenaError::InvalidTournamentFormat // reusing error for length validation
    );

    // Transfer ADX stake to escrow
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.operator_token_account.to_account_info(),
            to: ctx.accounts.escrow_token_account.to_account_info(),
            authority: ctx.accounts.operator.to_account_info(),
        },
    );
    token::transfer(transfer_ctx, stake_amount)?;

    let agent = &mut ctx.accounts.agent;
    let clock = Clock::get()?;

    agent.version = 1;
    agent.operator = ctx.accounts.operator.key();
    agent.agent_wallet = agent_wallet;
    agent.agent_class = agent_class;
    agent.strategy_category = strategy_category;
    agent.policy = policy;
    agent.staked_amount = stake_amount;
    agent.unstake_requested_at = 0;
    agent.pending_unstake = 0;
    agent.total_competitions = 0;
    agent.wins = 0;
    agent.cumulative_pnl = 0;
    agent.sharpe_numerator = 0;
    agent.trade_count = 0;
    agent.max_drawdown = 0;
    agent.fee_efficiency = 0;
    agent.registered_at = clock.unix_timestamp;
    agent.is_active = true;
    agent.status = AgentStatus::Active;
    agent.bump = ctx.bumps.agent;

    let competition = &mut ctx.accounts.competition;
    competition.total_agents = competition
        .total_agents
        .checked_add(1)
        .ok_or(ArenaError::ArithmeticOverflow)?;

    emit!(AgentRegistered {
        operator: ctx.accounts.operator.key(),
        agent_wallet,
        agent_class,
        stake_amount,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

#[event]
pub struct AgentRegistered {
    pub operator: Pubkey,
    pub agent_wallet: Pubkey,
    pub agent_class: AgentClass,
    pub stake_amount: u64,
    pub timestamp: i64,
}
