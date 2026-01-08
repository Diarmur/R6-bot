import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { ExtendedClient } from './types/client';
import { Command } from './types/command';

export const client: ExtendedClient = new Client({
  intents: [GatewayIntentBits.Guilds],
}) as ExtendedClient;

client.commands = new Collection<string, Command>();
