import 'dotenv/config';
import { client } from '../client'; // your bot client
import { getAllLinkedUsers } from '../services/users'; // your service to get linked users
import { updateMemberRankRole, notifyError } from '../roles/rankUpdater';
import { getR6DataStats } from '../providers/r6stats';
import { rankNames } from '../utils/rankMap'

const GUILD_ID = process.env.GUILD_ID;

// Wait for the bot to be ready
client.once('clientReady', async () => {
  console.log('Bot ready, starting cron task for updating roles every 2 hours');

  // Immediately run once
  await runCron();

  // Then schedule every 2 hours
  setInterval(runCron, 12 * 60 * 60 * 1000); // 2 hours in ms
});

async function runCron() {
  try{
    console.log(`[${new Date().toISOString()}] Running role update cron...`);
    await fetch(process.env.DISCORD_WEBHOOK!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: `Running role update cron...` }),
      });

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
        const member = await guild.members.fetch(user.id).catch(() => null);
        if (!member) continue;

        const stats = await getR6DataStats(user.platform, user.username);

        // Update role based on rank
        await updateMemberRankRole(member, stats.rank);
        console.log(member);
        
        await fetch(process.env.DISCORD_WEBHOOK!, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: `Updating ${user.username} to ${rankNames[stats.rank]}` }),
        });
      } catch (err) {
        console.error(`Failed to update rank for ${user.username}:`, err);
      }
    }

    console.log(`[${new Date().toISOString()}] Role update cron finished`);
  } catch (err) {
    console.error(err);
    await notifyError(String(err));
  }
}

