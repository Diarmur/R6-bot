import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { Command } from '../types/command';
import { getUser, UserData } from '../services/users';
import { getR6DataStats } from '../providers/r6stats';
import { buildStatsEmbed } from '../utils/embeds';
import { updateMemberRankRole } from '../roles/rankUpdater';
import { getRankName } from '../utils/rankMap';

// Per-user cooldown
const userCooldowns = new Map<string, number>();
const USER_COOLDOWN = 5000; // 5 seconds

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Get your Rainbow Six Siege stats')
    .addStringOption(opt =>
      opt.setName('username').setDescription('Optional: another user').setRequired(false)
    )
    .addStringOption(opt =>
      opt
        .setName('platform')
        .setDescription('User platform')
        .setRequired(false)
        .addChoices(
          { name: 'PC (Uplay)', value: 'uplay' },
          { name: 'Xbox', value: 'xbox' },
          { name: 'PlayStation', value: 'ps4' }
        )
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const userId = interaction.user.id;
    const now = Date.now();
    const last = userCooldowns.get(userId) || 0;

    if (now - last < USER_COOLDOWN) {
      return void interaction.reply({
        content: '⏳ Please wait a few seconds before requesting stats again.',
        ephemeral: true,
      });
    }
    userCooldowns.set(userId, now);

    try {
      const usernameArg = interaction.options.getString('username');
      const platformArg = interaction.options.getString('platform');

      // Determine which user to fetch stats for
      const linkedUser: UserData | null = getUser(userId);
      const targetUser: { username: string; platform: string } = usernameArg
        ? { username: usernameArg, platform: platformArg ?? 'uplay' }
        : linkedUser ?? (() => { throw new Error('No account linked. Use /link first.') })();

      // Fetch stats from API
      const stats = await getR6DataStats(targetUser.platform, targetUser.username);

      if (stats.totalMatches === 0) {
        return void interaction.reply({
          content: `No ranked stats available for **${targetUser.username}** on **${targetUser.platform.toUpperCase()}**.`,
          ephemeral: true,
        });
      }

      // Send stats embed
      const embed = buildStatsEmbed(targetUser.username, stats);
      if (!interaction.replied) {
        await interaction.reply({ embeds: [embed] });
      } else {
        await interaction.followUp({ embeds: [embed] });
      }

      // Only update role and nickname for the user running the command
      let memberToUpdate: GuildMember | null = null;
      try {
        memberToUpdate = await interaction.guild?.members.fetch(userId) || null;
      } catch {
        memberToUpdate = null;
      }

      if (memberToUpdate) {
        const rankName = getRankName(stats.rank);

        // Update role
        try {
          await updateMemberRankRole(memberToUpdate, stats.rank);
        } catch (err) {
          console.warn('Failed to update rank role:', err);
        }

        // Update nickname
        try {
          const baseName = memberToUpdate.user.username;
          await memberToUpdate.setNickname(`${baseName} | ${rankName}`);
        } catch {
          // Ignore if bot lacks permission
        }
      }

    } catch (error: any) {
      console.error('Error fetching stats:', error);
      if (!interaction.replied) {
        await interaction.reply({
          content: `❌ Failed to fetch stats: ${error.message}`,
          ephemeral: true,
        });
      } else {
        await interaction.followUp({
          content: `❌ Failed to fetch stats: ${error.message}`,
          ephemeral: true,
        });
      }
    }
  },
};
