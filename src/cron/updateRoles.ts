import 'dotenv/config';
import { client } from '../client';
import { getAllLinkedUsers } from '../services/users';
import { updateMemberRankRole, notifyError } from '../roles/rankUpdater';
import { getR6DataStats } from '../providers/r6stats';
import { rankNames } from '../utils/rankMap';
import { updateStreak } from '../services/streaks';
import { updateStreakNickname } from '../utils/nicknameUpdater';

const GUILD_ID = process.env.GUILD_ID;

client.once('clientReady', async () => {
  console.log('Bot ready, starting cron task for updating roles every 12 hours');
  await runCron();
  setInterval(runCron, 12 * 60 * 60 * 1000);
});

async function runCron() {
  try {
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

    const users = getAllLinkedUsers();
    for (const user of users) {
      try {
        const member = await guild.members.fetch(user.id).catch(() => null);
        if (!member) continue;

        const stats = await getR6DataStats(user.platform, user.username);

        // Update rank role
        await updateMemberRankRole(member, stats.rank);

        // Update win streak and nickname
        const streak = updateStreak(user.id, stats.totalWins, stats.totalLosses);
        await updateStreakNickname(member, streak);

        await fetch(process.env.DISCORD_WEBHOOK!, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `Updated ${user.username} → ${rankNames[stats.rank]} | streak: ${streak > 0 ? `🔥${streak}` : 'none'}`,
          }),
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