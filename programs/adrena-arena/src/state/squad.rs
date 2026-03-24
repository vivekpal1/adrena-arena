use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Squad {
    /// Account version
    pub version: u8,
    /// Squad leader
    pub leader: Pubkey,
    /// Squad name
    #[max_len(32)]
    pub name: String,
    /// Squad members (including leader)
    #[max_len(20)]
    pub members: Vec<Pubkey>,
    /// Aggregate Mutagen earned this week
    pub weekly_mutagen: u64,
    /// Aggregate league score this week
    pub weekly_score: u64,
    /// Total Mutagen across all seasons
    pub total_mutagen: u64,
    /// Squad league tier (separate from individual tiers)
    pub league_tier: super::player::LeagueTier,
    /// Creation timestamp
    pub created_at: i64,
    /// PDA bump
    pub bump: u8,
}
