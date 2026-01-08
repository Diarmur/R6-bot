import { EmbedBuilder } from 'discord.js';
import { R6Stats } from '../types/r6';
import { rankNames } from './rankMap';

export function buildStatsEmbed(username: string, stats: R6Stats) {
  const embed = new EmbedBuilder()
    .setTitle(`${username} — Rainbow Six Siege Stats`)
    .setColor(0x1abc9c)
    .addFields(
      { name: 'Rank', value: rankNames[stats.rank]  || 'Unknown', inline: true },
      { name: 'RP', value: stats.mmr.toString().slice(-2), inline: true },
      { name: 'Season', value: convertRank(stats.season), inline: true },
      { name: 'K/D', value: stats.kd.toFixed(2), inline: true },
      { name: 'Win Rate', value: `${stats.winRate.toFixed(2)}%`, inline: true },
      { name: 'Matches', value: stats.totalMatches.toString(), inline: true },
      { name: 'Wins', value: stats.totalWins.toString(), inline: true },
      { name: 'Losses', value: stats.totalLosses.toString(), inline: true },
      { name: 'Kills', value: stats.totalKills.toString(), inline: true },
      { name: 'Deaths', value: stats.totalDeaths.toString(), inline: true }
    );

  // If operators exist, show top 5 by kills
  const operators = Object.entries(stats.operators || {})
    .sort(([, a], [, b]) => b.kills - a.kills)
    .slice(0, 5);

  if (operators.length > 0) {
    const opsField = operators
      .map(([name, opStats]) => `${name}: ${opStats.kills} kills / ${opStats.kd.toFixed(2)} K/D`)
      .join('\n');
    embed.addFields({ name: 'Top Operators', value: opsField });
  }

  return embed;
}

export function convertRank(season: string): string {
  const match = season.match(/\d+/);
  if (!match) {
    throw new Error(`Invalid season format: ${season}`);
  }

  const value = Number(match[0]);

  const year = Math.ceil(value / 4);
  const seasonInYear = ((value - 1) % 4) + 1;

  return `Y${year}S${seasonInYear}`;
}