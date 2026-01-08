export interface OperatorStats {
  kills: number;
  deaths: number;
  kd: number;
}

export interface R6Stats {
  rank: number;
  mmr: number;
  kd: number;
  winRate: number;
  season: string;
  totalKills: number;
  totalDeaths: number;
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  operators: Record<string, OperatorStats>;
}
