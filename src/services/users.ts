import fs from 'fs';
const file = 'data/users.json';
export type UserData = { username: string; platform: string };
let users: Record<string, UserData> = {};

if (fs.existsSync(file)) users = JSON.parse(fs.readFileSync(file, 'utf-8'));

export function saveUser(discordId: string, data: UserData) {
  users[discordId] = data;
  fs.writeFileSync(file, JSON.stringify(users, null, 2));
}

export function getUser(discordId: string): UserData | null {
  return users[discordId] || null;
}

export function getAllLinkedUsers(): { id: string; username: string; platform: string }[] {
  return Object.entries(users).map(([id, data]) => ({
    id,
    username: data.username,
    platform: data.platform,
  }));
}