/// PDA seeds
pub const COMPETITION_SEED: &[u8] = b"competition";
pub const PLAYER_SEED: &[u8] = b"player";
pub const AGENT_SEED: &[u8] = b"agent";
pub const SQUAD_SEED: &[u8] = b"squad";
pub const TOURNAMENT_SEED: &[u8] = b"tournament";
pub const BRACKET_SEED: &[u8] = b"bracket";
pub const ESCROW_SEED: &[u8] = b"escrow";

/// Limits
pub const MAX_SQUAD_MEMBERS: usize = 20;
pub const MAX_TOURNAMENT_PARTICIPANTS: usize = 64;
pub const MAX_BRACKET_MATCHES: usize = 127; // 64-player single elim = 63 matches + 64 losers bracket
pub const MAX_ACHIEVEMENTS: u64 = 64; // bitmask
pub const MAX_TITLE_LEN: usize = 32;
pub const MAX_STRATEGY_LEN: usize = 32;
pub const MAX_ALLOWED_MARKETS: usize = 8;

/// Scoring weights (basis points, sum = 10000)
pub const WEIGHT_MUTAGEN: u16 = 4000;
pub const WEIGHT_RISK_ADJUSTED_PNL: u16 = 3000;
pub const WEIGHT_CONSISTENCY: u16 = 2000;
pub const WEIGHT_SOCIAL: u16 = 1000;

/// Tier thresholds
pub const PROMOTION_PERCENTAGE: u8 = 20; // Top 20% promotes
pub const RELEGATION_PERCENTAGE: u8 = 20; // Bottom 20% relegates

/// Fixed-point precision (10^6)
pub const PRECISION: u64 = 1_000_000;

/// Staking
pub const MIN_AGENT_STAKE: u64 = 100_000_000; // 100 ADX (assuming 6 decimals)
pub const UNSTAKE_COOLDOWN_SECONDS: i64 = 7 * 24 * 60 * 60; // 7 days
pub const SLASH_RATE_BPS: u16 = 1000; // 10% slash on underperformance

/// Timing
pub const MIN_TRADE_HOLD_SECONDS: i64 = 60; // 60 second minimum hold
pub const WEEK_SECONDS: i64 = 7 * 24 * 60 * 60;
