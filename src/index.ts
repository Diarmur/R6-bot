import './logger'; 
import fs from 'fs';
import path from 'path';
import { client } from './client';
import 'dotenv/config';
import './cron/updateRoles';

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.ts') || f.endsWith('.js'));

for (const file of commandFiles) {
  const commandModule = require(path.join(commandsPath, file));

  // Debug: log what was imported
  console.log(file, commandModule);

  const command = commandModule.command;
  if (!command) {
    console.error(`Command not found in file: ${file}`);
    continue; // skip broken files
  }

  client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Error executing command', ephemeral: true });
  }
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.login(process.env.DISCORD_TOKEN);
