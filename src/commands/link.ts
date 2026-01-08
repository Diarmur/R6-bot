import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types/command';
import { saveUser } from '../services/users'; // your function to store user data

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('Link your Rainbow Six Siege account')
    .addStringOption(opt =>
      opt
        .setName('username')
        .setDescription('Your Ubisoft username')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt
        .setName('platform')
        .setDescription('Your gaming platform')
        .setRequired(true)
        .addChoices(
          { name: 'PC (Uplay)', value: 'uplay' },
          { name: 'Xbox', value: 'xbox' },
          { name: 'PlayStation', value: 'ps4' }
        )
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    try {
      const username = interaction.options.getString('username', true);
      const platform = interaction.options.getString('platform', true);

      // Optional: validate the username/platform by fetching stats
      // You could call getR6DataStats here to confirm the account exists
      // const stats = await getR6DataStats(platform, username);

      saveUser(interaction.user.id, { username, platform });

      await interaction.reply({
        content: `✅ Successfully linked **${username}** on **${platform.toUpperCase()}**`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error linking user:', error);
      await interaction.reply({
        content: '❌ Failed to link your account. Please try again later.',
        ephemeral: true,
      });
    }
  },
};
