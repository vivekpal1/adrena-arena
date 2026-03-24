use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct AgentRegistration {
    /// Account version
    pub version: u8,
    /// Human operator who registered this agent
    pub operator: Pubkey,
    /// Dedicated wallet the agent trades from
    pub agent_wallet: Pubkey,
    /// Agent classification
    pub agent_class: AgentClass,
    /// Strategy category label (e.g. "momentum", "mean-reversion")
    #[max_len(32)]
    pub strategy_category: String,
    /// Policy constraints
    pub policy: AgentPolicy,
    /// ADX tokens staked (Numerai-style)
    pub staked_amount: u64,
    /// Timestamp of last unstake request (for cooldown)
    pub unstake_requested_at: i64,
    /// Amount pending unstake
    pub pending_unstake: u64,
    /// Performance metrics (updated by crank)
    pub total_competitions: u32,
    pub wins: u32,
    /// Cumulative PnL in lamports (signed, stored as i64)
    pub cumulative_pnl: i64,
    /// Sharpe ratio numerator (fixed-point * PRECISION)
    /// Actual Sharpe = sharpe_numerator / PRECISION
    pub sharpe_numerator: i64,
    /// Total trades executed
    pub trade_count: u32,
    /// Maximum drawdown observed (always positive, in lamports)
    pub max_drawdown: u64,
    /// Fee efficiency: PnL / fees_paid ratio (fixed-point * PRECISION)
    pub fee_efficiency: i64,
    /// Registration timestamp
    pub registered_at: i64,
    /// Active flag (can be deactivated)
    pub is_active: bool,
    /// Anti-gaming status
    pub status: AgentStatus,
    /// PDA bump
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum AgentClass {
    /// LLM-powered (Claude, GPT, Gemini, etc.)
    LlmBased,
    /// Traditional algorithmic (momentum, mean-reversion, grid, etc.)
    AlgoBot,
    /// Combination of LLM + algorithmic
    Hybrid,
    /// Human sets parameters, agent executes
    HumanAssisted,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, InitSpace)]
pub struct AgentPolicy {
    /// Maximum position size in USD (stored as u64, 6 decimal fixed-point)
    pub max_position_size: u64,
    /// Maximum leverage allowed (e.g. 50 for 50x)
    pub max_leverage: u32,
    /// Maximum trades per minute
    pub rate_limit_per_minute: u16,
    /// Whether the agent can trade RWA assets
    pub rwa_enabled: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum AgentStatus {
    Active,
    Flagged,
    Suspended,
    Disqualified,
}
