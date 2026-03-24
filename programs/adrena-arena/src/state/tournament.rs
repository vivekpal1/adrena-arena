use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Tournament {
    /// Account version
    pub version: u8,
    /// Tournament ID
    pub id: u32,
    /// Parent competition
    pub competition: Pubkey,
    /// Tournament format
    pub format: TournamentFormat,
    /// Maximum participants (32 or 64)
    pub bracket_size: u8,
    /// Current round (1-indexed, 0 = not started)
    pub current_round: u8,
    /// Total rounds for this format
    pub total_rounds: u8,
    /// Registered participants
    #[max_len(64)]
    pub participants: Vec<Pubkey>,
    /// Tournament status
    pub status: TournamentStatus,
    /// Prize pool in lamports
    pub prize_pool: u64,
    /// Entry fee per participant in lamports
    pub entry_fee: u64,
    /// Round start timestamp
    pub round_start: i64,
    /// Round duration in seconds
    pub round_duration: i64,
    /// Registration deadline
    pub registration_deadline: i64,
    /// Whether AI agents can participate
    pub allow_agents: bool,
    /// Whether this is a mixed human+AI tournament
    pub mixed_mode: bool,
    /// PDA bump
    pub bump: u8,
}

/// Separate account for bracket state (can be large)
#[account]
#[derive(InitSpace)]
pub struct TournamentBracket {
    /// Parent tournament
    pub tournament: Pubkey,
    /// Winners bracket matches
    #[max_len(127)]
    pub winners_bracket: Vec<Match>,
    /// Losers bracket matches (for double elimination)
    #[max_len(127)]
    pub losers_bracket: Vec<Match>,
    /// PDA bump
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, InitSpace)]
pub struct Match {
    /// Player A (or None if bye)
    pub player_a: Option<Pubkey>,
    /// Player B (or None if bye)
    pub player_b: Option<Pubkey>,
    /// Player A's score (risk-adjusted PnL, fixed-point)
    pub score_a: i64,
    /// Player B's score
    pub score_b: i64,
    /// Winner of this match (None if not yet decided)
    pub winner: Option<Pubkey>,
    /// Round number this match belongs to
    pub round: u8,
    /// Match status
    pub status: MatchStatus,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum TournamentFormat {
    SingleElimination,
    DoubleElimination,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum TournamentStatus {
    /// Accepting registrations
    Registration,
    /// Tournament is live
    Active,
    /// All matches completed
    Completed,
    /// Cancelled
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum MatchStatus {
    /// Waiting for round to start
    Pending,
    /// Round is active, players are trading
    Active,
    /// Match decided
    Completed,
    /// Bye (auto-advance)
    Bye,
}
