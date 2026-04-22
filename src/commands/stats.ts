import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, MessageFlags } from 'discord.js';
import { Command } from '../types/command';
import { getUser, UserData } from '../services/users';
import { getR6DataStats } from '../providers/r6stats';
import { buildStatsEmbed } from '../utils/embeds';
import { updateMemberRankRole } from '../roles/rankUpdater';
import { getRankName } from '../utils/rankMap';

const userCooldowns = new Map<string, number>();
const USER_COOLDOWN = 5000;

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
    const last = userCooldowns.get(userId) ?? 0;

    // Cooldown check — reply immediately before deferring
    if (now - last < USER_COOLDOWN) {
      return void interaction.reply({
        content: '⏳ Please wait a few seconds before requesting stats again.',
        flags: MessageFlags.Ephemeral,
      });
    }
    userCooldowns.set(userId, now);

    // Defer immediately so Discord doesn't time out while we fetch
    await interaction.deferReply();

    try {
      const usernameArg = interaction.options.getString('username');
      const platformArg = interaction.options.getString('platform');

      const linkedUser: UserData | null = getUser(userId);
      const targetUser: { username: string; platform: string } = usernameArg
        ? { username: usernameArg, platform: platformArg ?? 'uplay' }
        : linkedUser ?? (() => { throw new Error('No account linked. Use /link first.') })();

      const stats = await getR6DataStats(targetUser.platform, targetUser.username);

      if (stats.totalMatches === 0) {
        return void interaction.editReply({
          content: `No ranked stats available for **${targetUser.username}** on **${targetUser.platform.toUpperCase()}**.`,
        });
      }

      const embed = buildStatsEmbed(targetUser.username, stats);
      await interaction.editReply({ embeds: [embed] });

      // Update role for the command caller only
      try {
        const member = await interaction.guild?.members.fetch(userId);
        if (member) {
          await updateMemberRankRole(member, stats.rank);
        }
      } catch (err) {
        console.warn('Failed to update rank role:', err);
      }

    } catch (error: any) {
      console.error('Error fetching stats:', error);
      await interaction.editReply({
        content: `❌ Failed to fetch stats: ${error.message}`,
      });
    }
  },
};