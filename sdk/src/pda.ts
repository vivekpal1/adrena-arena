import { PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";

const COMPETITION_SEED = Buffer.from("competition");
const PLAYER_SEED = Buffer.from("player");
const AGENT_SEED = Buffer.from("agent");
const SQUAD_SEED = Buffer.from("squad");
const TOURNAMENT_SEED = Buffer.from("tournament");
const BRACKET_SEED = Buffer.from("bracket");
const ESCROW_SEED = Buffer.from("escrow");

export function findCompetitionPDA(
  authority: PublicKey,
  programId: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [COMPETITION_SEED, authority.toBuffer()],
    programId,
  );
}

export function findPlayerProfilePDA(
  player: PublicKey,
  programId: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [PLAYER_SEED, player.toBuffer()],
    programId,
  );
}

export function findAgentPDA(
  operator: PublicKey,
  agentId: number,
  programId: PublicKey,
): [PublicKey, number] {
  const idBuffer = Buffer.alloc(4);
  idBuffer.writeUInt32LE(agentId);
  return PublicKey.findProgramAddressSync(
    [AGENT_SEED, operator.toBuffer(), idBuffer],
    programId,
  );
}

export function findSquadPDA(
  name: string,
  programId: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SQUAD_SEED, Buffer.from(name)],
    programId,
  );
}

export function findTournamentPDA(
  tournamentId: number,
  programId: PublicKey,
): [PublicKey, number] {
  const idBuffer = Buffer.alloc(4);
  idBuffer.writeUInt32LE(tournamentId);
  return PublicKey.findProgramAddressSync(
    [TOURNAMENT_SEED, idBuffer],
    programId,
  );
}

export function findBracketPDA(
  tournamentId: number,
  programId: PublicKey,
): [PublicKey, number] {
  const idBuffer = Buffer.alloc(4);
  idBuffer.writeUInt32LE(tournamentId);
  return PublicKey.findProgramAddressSync(
    [BRACKET_SEED, idBuffer],
    programId,
  );
}

export function findEscrowAuthorityPDA(
  programId: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([ESCROW_SEED], programId);
}
