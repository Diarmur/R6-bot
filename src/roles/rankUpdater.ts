import { GuildMember } from 'discord.js';
import { rankNames, rankToRoleMap } from '../utils/rankMap'; // or wherever you put your maps

export async function updateMemberRankRole(member: GuildMember, rankId: number) {
  const englishRank = rankNames[rankId] ?? 'Unranked';
  const roleName = rankToRoleMap[englishRank] ?? 'Non classé';

  const role = member.guild.roles.cache.find(r => r.name === roleName);
  if (!role) {
    console.warn(`Role "${roleName}" not found in guild`);
    return;
  }

  // Remove all old rank roles
  try {
    const allRoles = Object.values(rankToRoleMap)
    .map(r => member.guild.roles.cache.find(role => role.name === r))
    .filter(Boolean);

    const rolesToRemove = member.roles.cache.filter(r => allRoles.includes(r));
    if (rolesToRemove.size > 0) await member.roles.remove(rolesToRemove);

    // Add new rank role
    await member.roles.add(role);

    console.log(`Updated ${member.user.tag} to role ${role.name}`);
    console.log(`[RANK UPDATE] Finished successfully`);
  } catch (err) {
    console.error(err);
    await notifyError(String(err));
  }
}

  export async function notifyError(message: string) {
    await fetch(process.env.DISCORD_WEBHOOK!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: `🚨 **Rank updater error**\n${message}` }),
    });
  }
