/**
 * Redis-backed leaderboard using sorted sets.
 *
 * Each tier/tournament/agent league has its own sorted set.
 * Scores are stored as floats for sorting; metadata is in hash keys.
 */

import Redis from "ioredis";

export class LeaderboardService {
  private redis: Redis;

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
  }

  // ── League Leaderboards ─────────────────────────────────────────

  private leagueKey(season: number, week: number, tier: number): string {
    return `league:s${season}:w${week}:t${tier}`;
  }

  async updateLeagueScore(
    season: number,
    week: number,
    tier: number,
    wallet: string,
    score: number,
  ): Promise<void> {
    await this.redis.zadd(this.leagueKey(season, week, tier), score, wallet);
  }

  async getLeagueRankings(
    season: number,
    week: number,
    tier: number,
    offset: number = 0,
    limit: number = 50,
  ): Promise<{ wallet: string; score: number; rank: number }[]> {
    const results = await this.redis.zrevrange(
      this.leagueKey(season, week, tier),
      offset,
      offset + limit - 1,
      "WITHSCORES",
    );

    const rankings: { wallet: string; score: number; rank: number }[] = [];
    for (let i = 0; i < results.length; i += 2) {
      rankings.push({
        wallet: results[i],
        score: parseFloat(results[i + 1]),
        rank: offset + i / 2 + 1,
      });
    }
    return rankings;
  }

  async getPlayerRank(
    season: number,
    week: number,
    tier: number,
    wallet: string,
  ): Promise<number | null> {
    const rank = await this.redis.zrevrank(
      this.leagueKey(season, week, tier),
      wallet,
    );
    return rank !== null ? rank + 1 : null;
  }

  async getTierCount(
    season: number,
    week: number,
    tier: number,
  ): Promise<number> {
    return this.redis.zcard(this.leagueKey(season, week, tier));
  }

  // ── Agent Leaderboards ──────────────────────────────────────────

  private agentKey(season: number): string {
    return `agents:s${season}`;
  }

  async updateAgentScore(
    season: number,
    agentWallet: string,
    score: number,
  ): Promise<void> {
    await this.redis.zadd(this.agentKey(season), score, agentWallet);
  }

  async getAgentRankings(
    season: number,
    offset: number = 0,
    limit: number = 50,
  ): Promise<{ wallet: string; score: number; rank: number }[]> {
    const results = await this.redis.zrevrange(
      this.agentKey(season),
      offset,
      offset + limit - 1,
      "WITHSCORES",
    );

    const rankings: { wallet: string; score: number; rank: number }[] = [];
    for (let i = 0; i < results.length; i += 2) {
      rankings.push({
        wallet: results[i],
        score: parseFloat(results[i + 1]),
        rank: offset + i / 2 + 1,
      });
    }
    return rankings;
  }

  // ── Tournament Leaderboards ─────────────────────────────────────

  private tournamentKey(tournamentId: number, round: number): string {
    return `tournament:${tournamentId}:r${round}`;
  }

  async updateTournamentScore(
    tournamentId: number,
    round: number,
    wallet: string,
    score: number,
  ): Promise<void> {
    await this.redis.zadd(
      this.tournamentKey(tournamentId, round),
      score,
      wallet,
    );
  }

  // ── Squad Leaderboards ──────────────────────────────────────────

  private squadKey(season: number, week: number): string {
    return `squads:s${season}:w${week}`;
  }

  async updateSquadScore(
    season: number,
    week: number,
    squadKey: string,
    score: number,
  ): Promise<void> {
    await this.redis.zadd(this.squadKey(season, week), score, squadKey);
  }

  async getSquadRankings(
    season: number,
    week: number,
    offset: number = 0,
    limit: number = 50,
  ): Promise<{ squadKey: string; score: number; rank: number }[]> {
    const results = await this.redis.zrevrange(
      this.squadKey(season, week),
      offset,
      offset + limit - 1,
      "WITHSCORES",
    );

    const rankings: { squadKey: string; score: number; rank: number }[] = [];
    for (let i = 0; i < results.length; i += 2) {
      rankings.push({
        squadKey: results[i],
        score: parseFloat(results[i + 1]),
        rank: offset + i / 2 + 1,
      });
    }
    return rankings;
  }

  // ── Cleanup ─────────────────────────────────────────────────────

  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}
