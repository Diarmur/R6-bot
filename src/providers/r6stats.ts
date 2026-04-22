import fetch from 'node-fetch';
import { R6Stats, OperatorStats } from '../types/r6';

const CACHE_TTL = 5 * 60 * 1000;

type CacheEntry<T> = {
  timestamp: number;
  data?: T;
  promise?: Promise<T>;
};

const cache = new Map<string, CacheEntry<any>>();

async function getOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached?.data && now - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  if (cached?.promise) {
    return cached.promise;
  }

  const promise = fetcher()
    .then(data => {
      cache.set(key, { data, timestamp: Date.now() });
      return data;
    })
    .catch(err => {
      cache.delete(key);
      throw err;
    });

  cache.set(key, { promise, timestamp: now });
  return promise;
}

export async function getR6DataStats(platform: string, username: string): Promise<R6Stats> {
  const cacheKey = `r6:${platform}:${username.toLowerCase()}`;

  return getOrFetch(cacheKey, async () => {
    console.log('🌐 Fetching from API');

    let platformFamily: string;
    switch (platform.toLowerCase()) {
      case 'uplay':
        platformFamily = 'pc';
        break;
      case 'xbox':
        platformFamily = 'xbox';
        break;
      case 'ps4':
        platformFamily = 'ps4';
        break;
      default:
        throw new Error(`Invalid platform: ${platform}`);
    }

    const url = `https://r6data.eu/api/stats?type=stats&nameOnPlatform=${encodeURIComponent(
      username
    )}&platformType=${platform.toLowerCase()}&platform_families=${platformFamily}`;

    const res = await fetch(url, {
      headers: {
        'api-key': process.env.R6DATA_API_KEY ?? '',
        'User-Agent': 'Private-R6-Bot',
      },
    });

    if (!res.ok) throw new Error(`Failed to fetch stats (HTTP ${res.status})`);

    const payload = (await res.json()) as any;

    const family = payload.platform_families_full_profiles[0];
    if (!family) throw new Error(`No stats found for ${username} on ${platform}`);

    const rankedBoard = family.board_ids_full_profiles.find(
      (b: any) => b.board_id === 'ranked'
    );
    if (!rankedBoard) throw new Error(`No ranked stats available`);

    const fullProfile = rankedBoard.full_profiles[0];
    const profile = fullProfile.profile;
    const stats = fullProfile.season_statistics;
    const outcomes = stats.match_outcomes;

    const kd = stats.deaths > 0 ? stats.kills / stats.deaths : 0;
    const winRate = (outcomes.wins + outcomes.losses) > 0
      ? (outcomes.wins / (outcomes.wins + outcomes.losses)) * 100
      : 0;

    return {
      rank: profile.rank ?? 0,
      mmr: profile.rank_points ?? 0,
      kd: parseFloat(kd.toFixed(2)),
      winRate: parseFloat(winRate.toFixed(2)),
      season: `Season ${fullProfile.season_id}`,
      totalKills: stats.kills ?? 0,
      totalDeaths: stats.deaths ?? 0,
      totalMatches: outcomes.wins + outcomes.losses + outcomes.abandons,
      totalWins: outcomes.wins ?? 0,
      totalLosses: outcomes.losses ?? 0,
      operators: {},
    };
  });
}