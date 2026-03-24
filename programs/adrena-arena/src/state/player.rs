use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct PlayerProfile {
    /// Account version
    pub version: u8,
    /// Player's wallet
    pub owner: Pubkey,
    /// Current league tier
    pub league_tier: LeagueTier,
    /// Championship points accumulated across weeks
    pub championship_points: u32,
    /// Current week's Mutagen earned (reset weekly)
    pub current_week_mutagen: u64,
    /// Total Mutagen earned this season
    pub total_mutagen: u64,
    /// Current week's league score (composite)
    pub league_score: u64,
    /// Consecutive trading days
    pub streak_days: u16,
    /// Last day a trade was recorded (Unix timestamp, day-aligned)
    pub last_trade_day: i64,
    /// Number of trades this week
    pub trades_this_week: u16,
    /// Number of unique active days this week
    pub active_days_this_week: u8,
    /// PnL this week in lamports (signed)
    pub pnl_this_week: i64,
    /// Maximum drawdown this week (always positive)
    pub max_drawdown_this_week: u64,
    /// Peak portfolio value this week (for drawdown calculation)
    pub peak_value_this_week: u64,
    /// Achievement bitmask (64 possible achievements)
    pub achievements: u64,
    /// Active display title (UTF-8 encoded)
    #[max_len(32)]
    pub title: String,
    /// Squad membership
    pub squad: Option<Pubkey>,
    /// Anti-gaming status
    pub status: PlayerStatus,
    /// Total seasons participated
    pub seasons_played: u16,
    /// Best league tier ever achieved
    pub best_tier: LeagueTier,
    /// Total volume traded this season (for size multiplier)
    pub total_volume: u64,
    /// PDA bump
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, InitSpace)]
pub enum LeagueTier {
    Iron = 0,
    Bronze = 1,
    Silver = 2,
    Gold = 3,
    Diamond = 4,
}

impl LeagueTier {
    pub fn can_promote(&self) -> bool {
        !matches!(self, LeagueTier::Diamond)
    }

    pub fn can_relegate(&self) -> bool {
        !matches!(self, LeagueTier::Iron)
    }

    pub fn promote(self) -> Option<LeagueTier> {
        match self {
            LeagueTier::Iron => Some(LeagueTier::Bronze),
            LeagueTier::Bronze => Some(LeagueTier::Silver),
            LeagueTier::Silver => Some(LeagueTier::Gold),
            LeagueTier::Gold => Some(LeagueTier::Diamond),
            LeagueTier::Diamond => None,
        }
    }

    pub fn relegate(self) -> Option<LeagueTier> {
        match self {
            LeagueTier::Iron => None,
            LeagueTier::Bronze => Some(LeagueTier::Iron),
            LeagueTier::Silver => Some(LeagueTier::Bronze),
            LeagueTier::Gold => Some(LeagueTier::Silver),
            LeagueTier::Diamond => Some(LeagueTier::Gold),
        }
    }

    pub fn index(&self) -> usize {
        *self as usize
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum PlayerStatus {
    Active,
    Flagged,
    Disqualified,
}
