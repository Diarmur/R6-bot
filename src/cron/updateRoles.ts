import 'dotenv/config';
import { client } from '../client'; // your bot client
import { getAllLinkedUsers } from '../services/users'; // your service to get linked users
import { updateMemberRankRole } from '../roles/rankUpdater';
import { getR6DataStats } from '../providers/r6stats';

const GUILD_ID = process.env.GUILD_ID;

// Wait for the bot to be ready
client.once('clientReady', async () => {
  console.log('Bot ready, starting cron task for updating roles every 2 hours');

  // Immediately run once
  await runCron();

  // Then schedule every 2 hours
  setInterval(runCron, 2 * 60 * 60 * 1000); // 2 hours in ms
});

async function runCron() {
  console.log(`[${new Date().toISOString()}] Running role update cron...`);

  if (!GUILD_ID) {
    console.error('❌ Missing GUILD_ID in .env');
    process.exit(1);
    }

  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) {
    console.error('Guild not found');
    return;
  }

  const users = getAllLinkedUsers(); // return array of { id, username, platform }
  for (const user of users) {
    try {
      const member = guild.members.cache.get(user.id);
      if (!member) continue;

      const stats = await getR6DataStats(user.platform, user.username);

      // Update role based on rank
      await updateMemberRankRole(member, stats.rank);
    } catch (err) {
      console.error(`Failed to update rank for ${user.username}:`, err);
    }
  }

  console.log(`[${new Date().toISOString()}] Role update cron finished`);
}

