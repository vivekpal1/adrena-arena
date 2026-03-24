use anchor_lang::prelude::*;

#[error_code]
pub enum ArenaError {
    #[msg("Competition is not active")]
    CompetitionNotActive,

    #[msg("Competition is not in registration phase")]
    NotInRegistrationPhase,

    #[msg("Unauthorized: caller is not the competition authority")]
    Unauthorized,

    #[msg("Unauthorized: caller is not an authorized crank")]
    UnauthorizedCrank,

    #[msg("Player is already registered")]
    PlayerAlreadyRegistered,

    #[msg("Player is not registered")]
    PlayerNotRegistered,

    #[msg("Agent is already registered")]
    AgentAlreadyRegistered,

    #[msg("Insufficient stake amount")]
    InsufficientStake,

    #[msg("Unstake cooldown has not elapsed")]
    UnstakeCooldownNotElapsed,

    #[msg("Squad is full")]
    SquadFull,

    #[msg("Player is already in a squad")]
    AlreadyInSquad,

    #[msg("Player is not in this squad")]
    NotInSquad,

    #[msg("Cannot leave squad as leader")]
    CannotLeaveAsLeader,

    #[msg("Tournament is full")]
    TournamentFull,

    #[msg("Tournament is not in registration phase")]
    TournamentNotRegistering,

    #[msg("Tournament is not active")]
    TournamentNotActive,

    #[msg("Invalid bracket advancement")]
    InvalidBracketAdvancement,

    #[msg("Match has already been decided")]
    MatchAlreadyDecided,

    #[msg("Invalid tier transition")]
    InvalidTierTransition,

    #[msg("Account is flagged for anti-gaming violation")]
    AccountFlagged,

    #[msg("Account is disqualified")]
    AccountDisqualified,

    #[msg("Insufficient entry fee")]
    InsufficientEntryFee,

    #[msg("No rewards to claim")]
    NoRewardsToClaim,

    #[msg("Invalid tournament format")]
    InvalidTournamentFormat,

    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,

    #[msg("Invalid scoring weights")]
    InvalidScoringWeights,
}
