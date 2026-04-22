import { GuildMember } from "discord.js";

const STREAK_REGEX = / \[🔥\d+\]$/;

/**
 * Updates a member's nickname to reflect their win streak.
 * - streak >= 2: appends [🔥N] to their nickname (or username if no nickname)
 * - streak < 2:  removes the streak suffix if present
 */
export async function updateStreakNickname(
  member: GuildMember,
  streak: number,
): Promise<void> {
  // Base name is current nickname without any existing streak suffix
  const currentName = member.nickname ?? member.user.username;
  const baseName = currentName.replace(STREAK_REGEX, "");

  let newName: string;

  if (streak >= 2) {
    newName = `${baseName} [🔥${streak}]`;
  } else {
    newName = baseName;
  }

  // Don't call the API if nothing changed
  if (newName === currentName) return;

  // Discord nickname max length is 32 chars — truncate base name if needed
  if (newName.length > 32) {
    const suffix = streak >= 2 ? ` [🔥${streak}]` : "";
    newName = baseName.slice(0, 32 - suffix.length) + suffix;
  }

  try {
    await member.setNickname(newName);
    console.log(
      `[STREAK] Updated nickname for ${member.user.username}: "${currentName}" → "${newName}"`,
    );
  } catch (err) {
    // Bot can't change nickname of server owner or higher roles — log and move on
    console.warn(
      `[STREAK] Could not update nickname for ${member.user.username}:`,
      err,
    );
  }
}
