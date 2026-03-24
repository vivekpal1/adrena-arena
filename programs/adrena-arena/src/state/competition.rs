use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct CompetitionState {
    /// Account version for future migrations
    pub version: u8,
    /// Authority who can manage the competition
    pub authority: Pubkey,
    /// Authorized crank that can submit scoring updates
    pub crank: Pubkey,
    /// Current season number
    pub season: u16,
    /// Current week within the season (1-indexed)
    pub week: u8,
    /// Unix timestamp when current season started
    pub season_start: i64,
    /// Unix timestamp when current week started
    pub week_start: i64,
    /// Competition status
    pub status: CompetitionStatus,
    /// Total registered players
    pub total_players: u32,
    /// Total registered AI agents
    pub total_agents: u32,
    /// Prize pool in lamports
    pub prize_pool: u64,
    /// ADX token mint for staking
    pub adx_mint: Pubkey,
    /// Escrow token account for staked ADX
    pub escrow: Pubkey,
    /// Configuration parameters
    pub config: CompetitionConfig,
    /// PDA bump
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum CompetitionStatus {
    /// Accepting registrations
    Registration,
    /// Competition is live
    Active,
    /// Paused (emergency)
    Paused,
    /// Season completed
    Completed,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, InitSpace)]
pub struct CompetitionConfig {
    /// Weeks per season
    pub weeks_per_season: u8,
    /// Minimum trades per week to qualify for league scoring
    pub min_weekly_trades: u16,
    /// Minimum days active per week
    pub min_weekly_active_days: u8,
    /// Scoring weights in basis points (sum must = 10000)
    pub weight_mutagen: u16,
    pub weight_risk_pnl: u16,
    pub weight_consistency: u16,
    pub weight_social: u16,
    /// Tier multipliers (fixed-point * 1_000_000)
    /// Iron=1x, Bronze=1.25x, Silver=1.5x, Gold=2x, Diamond=2.5x
    pub tier_multipliers: [u64; 5],
}

impl Default for CompetitionConfig {
    fn default() -> Self {
        Self {
            weeks_per_season: 10,
            min_weekly_trades: 5,
            min_weekly_active_days: 3,
            weight_mutagen: 4000,
            weight_risk_pnl: 3000,
            weight_consistency: 2000,
            weight_social: 1000,
            tier_multipliers: [
                1_000_000, // Iron: 1.0x
                1_250_000, // Bronze: 1.25x
                1_500_000, // Silver: 1.5x
                2_000_000, // Gold: 2.0x
                2_500_000, // Diamond: 2.5x
            ],
        }
    }
}
