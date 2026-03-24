use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;
use crate::errors::ArenaError;

/// Create a new tournament
#[derive(Accounts)]
#[instruction(tournament_id: u32)]
pub struct CreateTournament<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + Tournament::INIT_SPACE,
        seeds = [TOURNAMENT_SEED, &tournament_id.to_le_bytes()],
        bump,
    )]
    pub tournament: Account<'info, Tournament>,

    #[account(
        seeds = [COMPETITION_SEED, competition.authority.as_ref()],
        bump = competition.bump,
        constraint = competition.authority == authority.key() @ ArenaError::Unauthorized,
    )]
    pub competition: Account<'info, CompetitionState>,

    pub system_program: Program<'info, System>,
}

pub fn create_tournament_handler(
    ctx: Context<CreateTournament>,
    tournament_id: u32,
    format: TournamentFormat,
    bracket_size: u8,
    entry_fee: u64,
    round_duration: i64,
    registration_deadline: i64,
    allow_agents: bool,
    mixed_mode: bool,
) -> Result<()> {
    require!(
        bracket_size == 32 || bracket_size == 64,
        ArenaError::InvalidTournamentFormat
    );

    let tournament = &mut ctx.accounts.tournament;
    let clock = Clock::get()?;

    let total_rounds = match format {
        TournamentFormat::SingleElimination => {
            // log2(bracket_size)
            if bracket_size == 32 { 5 } else { 6 }
        }
        TournamentFormat::DoubleElimination => {
            // Winners rounds + losers rounds + grand final
            if bracket_size == 32 { 10 } else { 12 }
        }
    };

    tournament.version = 1;
    tournament.id = tournament_id;
    tournament.competition = ctx.accounts.competition.key();
    tournament.format = format;
    tournament.bracket_size = bracket_size;
    tournament.current_round = 0;
    tournament.total_rounds = total_rounds;
    tournament.participants = Vec::new();
    tournament.status = TournamentStatus::Registration;
    tournament.prize_pool = 0;
    tournament.entry_fee = entry_fee;
    tournament.round_start = 0;
    tournament.round_duration = round_duration;
    tournament.registration_deadline = registration_deadline;
    tournament.allow_agents = allow_agents;
    tournament.mixed_mode = mixed_mode;
    tournament.bump = ctx.bumps.tournament;

    emit!(TournamentCreated {
        tournament_id,
        format,
        bracket_size,
        entry_fee,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

/// Register for a tournament
#[derive(Accounts)]
pub struct JoinTournament<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        mut,
        constraint = tournament.status == TournamentStatus::Registration
            @ ArenaError::TournamentNotRegistering,
        constraint = (tournament.participants.len() as u8) < tournament.bracket_size
            @ ArenaError::TournamentFull,
    )]
    pub tournament: Account<'info, Tournament>,

    #[account(
        seeds = [PLAYER_SEED, player.key().as_ref()],
        bump = player_profile.bump,
        constraint = player_profile.status == PlayerStatus::Active
            @ ArenaError::AccountDisqualified,
    )]
    pub player_profile: Account<'info, PlayerProfile>,

    pub system_program: Program<'info, System>,
}

pub fn join_tournament_handler(ctx: Context<JoinTournament>) -> Result<()> {
    let tournament = &mut ctx.accounts.tournament;
    let clock = Clock::get()?;

    require!(
        clock.unix_timestamp <= tournament.registration_deadline,
        ArenaError::TournamentNotRegistering
    );

    // Collect entry fee (transfer SOL to tournament PDA)
    if tournament.entry_fee > 0 {
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.player.key(),
            &tournament.key(),
            tournament.entry_fee,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.player.to_account_info(),
                tournament.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        tournament.prize_pool = tournament
            .prize_pool
            .checked_add(tournament.entry_fee)
            .ok_or(ArenaError::ArithmeticOverflow)?;
    }

    tournament.participants.push(ctx.accounts.player.key());

    emit!(TournamentJoined {
        player: ctx.accounts.player.key(),
        tournament_id: tournament.id,
        participant_count: tournament.participants.len() as u8,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

/// Record match result (crank only)
#[derive(Accounts)]
pub struct RecordMatchResult<'info> {
    pub crank: Signer<'info>,

    #[account(
        mut,
        constraint = tournament.status == TournamentStatus::Active
            @ ArenaError::TournamentNotActive,
    )]
    pub tournament: Account<'info, Tournament>,

    #[account(mut)]
    pub bracket: Account<'info, TournamentBracket>,

    #[account(
        seeds = [COMPETITION_SEED, competition.authority.as_ref()],
        bump = competition.bump,
        constraint = competition.crank == crank.key() @ ArenaError::UnauthorizedCrank,
    )]
    pub competition: Account<'info, CompetitionState>,
}

pub fn record_match_result_handler(
    ctx: Context<RecordMatchResult>,
    match_index: u16,
    score_a: i64,
    score_b: i64,
    is_losers_bracket: bool,
) -> Result<()> {
    let bracket = &mut ctx.accounts.bracket;

    let matches = if is_losers_bracket {
        &mut bracket.losers_bracket
    } else {
        &mut bracket.winners_bracket
    };

    let idx = match_index as usize;
    require!(idx < matches.len(), ArenaError::InvalidBracketAdvancement);

    let m = &mut matches[idx];
    require!(
        m.status == MatchStatus::Active,
        ArenaError::MatchAlreadyDecided
    );

    m.score_a = score_a;
    m.score_b = score_b;
    m.winner = if score_a >= score_b { m.player_a } else { m.player_b };
    m.status = MatchStatus::Completed;

    emit!(MatchResultRecorded {
        tournament_id: ctx.accounts.tournament.id,
        match_index,
        winner: m.winner.unwrap(),
        score_a,
        score_b,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

#[event]
pub struct TournamentCreated {
    pub tournament_id: u32,
    pub format: TournamentFormat,
    pub bracket_size: u8,
    pub entry_fee: u64,
    pub timestamp: i64,
}

#[event]
pub struct TournamentJoined {
    pub player: Pubkey,
    pub tournament_id: u32,
    pub participant_count: u8,
    pub timestamp: i64,
}

#[event]
pub struct MatchResultRecorded {
    pub tournament_id: u32,
    pub match_index: u16,
    pub winner: Pubkey,
    pub score_a: i64,
    pub score_b: i64,
    pub timestamp: i64,
}
